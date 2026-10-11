import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapTrip } from "@/lib/schedule-api";
import { resolveTripPatchStatus } from "@/lib/trip-normalize";
import type { TripStatus } from "@/lib/types";

const patchSchema = z.object({
  driverId: z.string().nullable().optional(),
  riderIds: z.array(z.string()).optional(),
  status: z
    .enum(["planned", "confirmed", "unassigned", "cancelled"])
    .optional(),
  noSchool: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.groupId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const existing = await prisma.trip.findFirst({
    where: { id, groupId: session.user.groupId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = body.data;
  const status = resolveTripPatchStatus({
    existingStatus: existing.status,
    status: data.status as TripStatus | undefined,
    noSchool: data.noSchool,
    driverId: data.driverId,
  });

  await prisma.$transaction(async (tx) => {
    await tx.trip.update({
      where: { id },
      data: {
        driverId: data.driverId === undefined ? undefined : data.driverId,
        status,
        noSchool: data.noSchool ?? undefined,
      },
    });

    if (data.riderIds) {
      await tx.tripRider.deleteMany({ where: { tripId: id } });
      if (data.riderIds.length) {
        await tx.tripRider.createMany({
          data: data.riderIds.map((childId) => ({ tripId: id, childId })),
        });
      }
    }
  });

  const trip = await prisma.trip.findUniqueOrThrow({
    where: { id },
    include: {
      driver: true,
      riders: { include: { child: true } },
    },
  });

  return NextResponse.json(mapTrip(trip));
}
