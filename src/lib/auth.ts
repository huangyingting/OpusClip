import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import {
  normalizeAccountEmail,
  verifyPassword,
  writeAuditLog,
  type WorkspaceRole,
} from "./account-admission";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = normalizeAccountEmail(credentials.email);
        const user = await prisma.user.findUnique({
          where: { normalizedEmail },
          include: { passwordCredential: true },
        });

        if (!user || user.status !== "ACTIVE" || !user.passwordCredential) {
          await writeAuditLog({
            action: "AUTH_LOGIN_FAILED",
            actorEmail: normalizedEmail,
            targetType: "User",
            targetId: user?.id ?? null,
            metadata: {
              reason: !user
                ? "USER_NOT_FOUND"
                : user.status !== "ACTIVE"
                  ? "ACCOUNT_DISABLED"
                  : "NO_PASSWORD_CREDENTIAL",
            },
          });
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.passwordCredential.passwordHash
        );

        if (!isValid) {
          await writeAuditLog({
            action: "AUTH_LOGIN_FAILED",
            actorId: user.id,
            actorEmail: user.email,
            targetType: "User",
            targetId: user.id,
            metadata: { reason: "INVALID_PASSWORD" },
          });
          return null;
        }

        await writeAuditLog({
          action: "AUTH_LOGIN_SUCCESS",
          actorId: user.id,
          actorEmail: user.email,
          targetType: "User",
          targetId: user.id,
          metadata: { role: user.role },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceName: user.workspaceName,
          creditsBalance: user.creditsBalance,
          planName: user.planName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as unknown as { role: string }).role;
      }

      if (token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            creditsBalance: true,
            planName: true,
            workspaceName: true,
          },
        });

        if (!freshUser || freshUser.status !== "ACTIVE") {
          token.invalidated = true;
        } else {
          token.invalidated = false;
          token.role = freshUser.role;
          token.name = freshUser.name;
          token.creditsBalance = freshUser.creditsBalance;
          token.planName = freshUser.planName;
          token.workspaceName = freshUser.workspaceName;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.invalidated) {
        return { ...session, user: undefined };
      }

      if (session.user) {
        const u = session.user as {
          id?: string;
          role?: string;
          creditsBalance?: number;
          planName?: string;
          workspaceName?: string;
        };
        u.id = String(token.id || "");
        u.role = String(token.role || "creator");
        u.creditsBalance = Number(token.creditsBalance ?? 360);
        u.planName = String(token.planName || "Pro");
        u.workspaceName = String(token.workspaceName || "Alex Studio Workspace");
      }

      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET || "opusclip-super-secret-jwt-signing-key-2026-dev",
};

export interface AuthenticatedActor {
  id: string;
  email: string;
  name: string;
  role: WorkspaceRole;
  creditsBalance: number;
  planName: string;
  workspaceName: string;
}

export async function getAuthenticatedActor(): Promise<AuthenticatedActor | null> {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as
    | {
        id?: string;
        email?: string;
        name?: string;
        role?: WorkspaceRole;
        creditsBalance?: number;
        planName?: string;
        workspaceName?: string;
      }
    | undefined;

  if (!sUser?.id || !sUser?.email) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sUser.id },
  });

  if (!dbUser || dbUser.status !== "ACTIVE") {
    return null;
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: (dbUser.role as WorkspaceRole) || "creator",
    creditsBalance: dbUser.creditsBalance,
    planName: dbUser.planName,
    workspaceName: dbUser.workspaceName,
  };
}
