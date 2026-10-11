import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSchedulePayload } from "@/lib/schedule-api";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let groupId = session.user.groupId ?? null;

  if (groupId) {
    const group = await prisma.carpoolGroup.findUnique({
      where: { id: groupId },
      select: { id: true },
    });
    if (!group) groupId = null;
  }

  if (!groupId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { membership: { include: { family: true } } },
    });
    groupId = user?.membership?.family.groupId ?? null;
  }

  if (!groupId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        hint: "Session is stale after a database re-seed. Sign out and sign back in.",
      },
      { status: 401 },
    );
  }

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
