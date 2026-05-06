import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCoverLetterSchema = z.object({
  text: z.string().min(1, "Cover letter text cannot be empty"),
});

interface RouteContext {
  params: { id: string };
}

async function getOwnedCoverLetter(id: string, userId: string) {
  const cl = await prisma.coverLetter.findUnique({ where: { id } });
  if (!cl || cl.userId !== userId) return null;
  return cl;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cl = await getOwnedCoverLetter(params.id, session.user.id);
    if (!cl) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(cl);
  } catch (error) {
    console.error("GET /api/cover-letter/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cover letter" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await getOwnedCoverLetter(params.id, session.user.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const parsed = updateCoverLetterSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const cl = await prisma.coverLetter.update({
      where: { id: params.id },
      data: { text: parsed.data.text },
    });

    return NextResponse.json(cl);
  } catch (error) {
    console.error("PUT /api/cover-letter/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update cover letter" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await getOwnedCoverLetter(params.id, session.user.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 },
      );
    }

    await prisma.coverLetter.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Cover letter deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/cover-letter/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete cover letter" },
      { status: 500 },
    );
  }
}
