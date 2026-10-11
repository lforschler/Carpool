import { describe, expect, it } from "vitest";
import {
  hashPassword,
  normalizeEmail,
  parseCredentials,
  verifyPassword,
} from "@/lib/auth-credentials";

describe("auth credentials helpers", () => {
  it("normalizes email case and whitespace", () => {
    expect(normalizeEmail("  Lucas@Carpool.Local ")).toBe("lucas@carpool.local");
  });

  it("rejects invalid credential shapes", () => {
    expect(parseCredentials(null)).toBeNull();
    expect(parseCredentials({ email: "not-an-email", password: "carpool123" })).toBeNull();
    expect(parseCredentials({ email: "a@b.com", password: "12345" })).toBeNull();
  });

  it("accepts valid credentials and lowercases email", () => {
    expect(
      parseCredentials({ email: "Dee@Carpool.Local", password: "carpool123" }),
    ).toEqual({ email: "dee@carpool.local", password: "carpool123" });
  });

  it("hashes and verifies passwords without NextAuth runtime", async () => {
    const hashed = await hashPassword("carpool123");
    expect(hashed).not.toBe("carpool123");
    expect(await verifyPassword("carpool123", hashed)).toBe(true);
    expect(await verifyPassword("wrong-password", hashed)).toBe(false);
  });
});
