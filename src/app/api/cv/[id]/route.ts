import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const DOCUMENT_TYPES = ["PDF", "JSON", "MD", "HTML"] as const;

const updateCVSchema = z.object({
  cvFullName: z.string().min(1).optional(),
  documentType: z.enum(DOCUMENT_TYPES).optional(),
  summary: z.string().optional().nullable(),
  targetRole: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  skills: z.string().optional().nullable(),
  hobbies: z.string().optional().nullable(),
  lastRevisionKind: z.string().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
});

interface RouteContext {
  params: { id: string };
}

async function getOwnedCV(cvId: string, userId: string) {
  const cv = await prisma.cV.findUnique({ where: { id: cvId } });
  if (!cv || cv.userId !== userId) return null;
  return cv;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cv = await getOwnedCV(params.id, session.user.id);
    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }
    return NextResponse.json(cv);
  } catch (error) {
    console.error("GET /api/cv/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch CV" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await getOwnedCV(params.id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateCVSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) data[k] = v;
    }

    if (parsed.data.publishedAt !== undefined) {
      data.publishedAt = parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt)
        : null;
    }

    const cv = await prisma.cV.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(cv);
  } catch (error) {
    console.error("PUT /api/cv/[id] error:", error);
    return NextResponse.json({ error: "Failed to update CV" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await getOwnedCV(params.id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    await prisma.cV.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "CV deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/cv/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete CV" },
      { status: 500 }
    );
  }
}
