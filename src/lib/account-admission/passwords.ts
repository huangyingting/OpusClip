import bcrypt from "bcryptjs";
import { AccountAdmissionError } from "./errors";

const BCRYPT_ROUNDS = 12;

export function validatePasswordStrength(password: string): void {
  if (!password || typeof password !== "string") {
    throw new AccountAdmissionError(400, "INVALID_PASSWORD", "Password is required.");
  }
  if (password.length < 8) {
    throw new AccountAdmissionError(
      400,
      "PASSWORD_TOO_SHORT",
      "Password must be at least 8 characters long."
    );
  }
  if (password.length > 128) {
    throw new AccountAdmissionError(
      400,
      "PASSWORD_TOO_LONG",
      "Password must not exceed 128 characters."
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  validatePasswordStrength(password);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (!password || !passwordHash) return false;
  return bcrypt.compare(password, passwordHash);
}
