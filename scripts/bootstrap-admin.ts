import { bootstrapAdminAccount } from "../src/lib/account-admission/bootstrap";
import { prisma } from "../src/lib/prisma";

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--email" && argv[i + 1]) {
      args.email = argv[++i];
    } else if (arg === "--password" && argv[i + 1]) {
      args.password = argv[++i];
    } else if (arg === "--name" && argv[i + 1]) {
      args.name = argv[++i];
    }
  }
  return args;
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));
  const email = cli.email || process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@opusclip.local";
  const password = cli.password || process.env.BOOTSTRAP_ADMIN_PASSWORD || "AdminPassword123!";
  const name = cli.name || process.env.BOOTSTRAP_ADMIN_NAME || "Alex Rivera (Admin)";

  const result = await bootstrapAdminAccount({ email, password, name });
  console.log(
    JSON.stringify(
      {
        ok: true,
        action: result.created ? "created" : "updated",
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          status: result.user.status,
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error("Bootstrap admin failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
