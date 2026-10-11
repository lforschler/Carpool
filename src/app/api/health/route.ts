import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Lightweight readiness check for hosting (no secret values). */
export async function GET() {
  const checks = {
    ok: false,
    authSecret: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    db: "unknown" as string,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = "ok";
    checks.ok = checks.authSecret && checks.databaseUrl;
  } catch {
    checks.db = "error";
  }

  return NextResponse.json(checks, { status: checks.ok ? 200 : 503 });
}
