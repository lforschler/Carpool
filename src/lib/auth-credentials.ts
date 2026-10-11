import { compare, hash } from "bcryptjs";
import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string, rounds = 10): Promise<string> {
  return hash(password, rounds);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}

/** Validate credentials shape and normalize email; returns null if invalid. */
export function parseCredentials(
  raw: unknown,
): { email: string; password: string } | null {
  const parsed = credentialsSchema.safeParse(raw);
  if (!parsed.success) return null;
  return {
    email: normalizeEmail(parsed.data.email),
    password: parsed.data.password,
  };
}
