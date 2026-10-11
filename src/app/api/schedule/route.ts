import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSchedulePayload } from "@/lib/schedule-api";

export async function GET() {
  const session = await auth();
  if (!session?.user?.groupId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groupId = session.user.groupId;

  const [families, drivers, kids, trips] = await Promise.all([
    prisma.family.findMany({
      where: { groupId },
      include: {
        children: true,
        memberships: { include: { user: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: {
        canDrive: true,
        membership: { family: { groupId } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.child.findMany({
      where: { family: { groupId } },
      orderBy: { name: "asc" },
    }),
    prisma.trip.findMany({
      where: { groupId },
      include: {
        driver: true,
        riders: { include: { child: true } },
      },
      orderBy: [{ date: "asc" }, { direction: "asc" }],
    }),
  ]);

  return NextResponse.json(
    buildSchedulePayload({ families, drivers, kids, trips }),
  );
}
