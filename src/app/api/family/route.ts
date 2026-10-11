import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    include: {
      children: { orderBy: { name: "asc" } },
      group: true,
      memberships: { include: { user: true } },
    },
  });
  if (!family) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(family);
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  homeAddress: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const family = await prisma.family.update({
    where: { id: session.user.familyId },
    data: body.data,
    include: { children: { orderBy: { name: "asc" } } },
  });

  return NextResponse.json(family);
}
