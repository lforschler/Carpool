import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const child = await prisma.child.create({
    data: {
      familyId: session.user.familyId,
      name: body.data.name,
      shortName: body.data.shortName || body.data.name.slice(0, 1),
      school: body.data.school || null,
      grade: body.data.grade || null,
    },
  });

  return NextResponse.json(child, { status: 201 });
}
