import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  familyName: z.string().min(1),
  homeAddress: z.string().min(1),
  phone: z.string().optional(),
  inviteToken: z.string().optional(),
  createGroup: z.boolean().optional(),
  groupName: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup data" }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  let groupId: string;
  if (data.inviteToken) {
    const group = await prisma.carpoolGroup.findUnique({
      where: { inviteToken: data.inviteToken },
    });
    if (!group) {
      return NextResponse.json({ error: "Invalid invite token" }, { status: 400 });
    }
    groupId = group.id;
  } else if (data.createGroup) {
    const group = await prisma.carpoolGroup.create({
      data: { name: data.groupName?.trim() || `${data.familyName} Carpool` },
    });
    groupId = group.id;
  } else {
    // Default: join the seeded Westwood group if present
    const seeded = await prisma.carpoolGroup.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!seeded) {
      return NextResponse.json(
        { error: "No carpool group yet — create one or provide an invite token" },
        { status: 400 },
      );
    }
    groupId = seeded.id;
  }

  const passwordHash = await hash(data.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: {
        groupId,
        name: data.familyName,
        homeAddress: data.homeAddress,
        phone: data.phone || null,
      },
    });
    return tx.user.create({
      data: {
        email,
        passwordHash,
        name: data.name,
        phone: data.phone || null,
        canDrive: true,
        seatCapacity: 5,
        membership: {
          create: {
            familyId: family.id,
            role: "DRIVER",
          },
        },
      },
      include: { membership: true },
    });
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    familyId: user.membership?.familyId,
  });
}
