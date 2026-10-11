import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  shortName: z.string().optional(),
  school: z.string().nullable().optional(),
  grade: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const child = await prisma.child.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updated = await prisma.child.update({
    where: { id },
    data: body.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const child = await prisma.child.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.child.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
