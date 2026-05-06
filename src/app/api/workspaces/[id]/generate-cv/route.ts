import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamCVGeneration } from "@/lib/anthropic";
import { z } from "zod";

const schema = z.object({
  existingCV: z
    .string()
    .min(50, "Please provide a more detailed CV (at least 50 characters)"),
  jobDescription: z
    .string()
    .min(50, "Please provide a more detailed job description (at least 50 characters)"),
  cvFullName: z.string().min(1).optional(),
  targetRole: z.string().optional(),
});

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the workspace belongs to the user
  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: { cv: true },
  });

  if (!workspace || workspace.userId !== session.user.id) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  const { existingCV, jobDescription, cvFullName, targetRole } = parsed.data;

  try {
    const stream = await streamCVGeneration({ existingCV, jobDescription });

    const userId = session.user.id;
    const workspaceId = workspace.id;
    const existingCvId = workspace.cv?.id ?? null;

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullText = "";

        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullText += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Persist the result on stream completion
          const derivedName =
            (cvFullName && cvFullName.trim()) ||
            (targetRole && `CV — ${targetRole.trim()}`) ||
            "Tailored CV";

          if (existingCvId) {
            // Replace the existing CV body (this is a re-generation)
            await prisma.cV.update({
              where: { id: existingCvId },
              data: {
                cvFullName: derivedName,
                targetRole: targetRole || null,
                documentType: "MD",
                experience: existingCV,
                skills: fullText,
                summary: fullText.slice(0, 300),
                lastRevisionKind: "Regenerated",
              },
            });
          } else {
            await prisma.cV.create({
              data: {
                userId,
                workspaceId,
                cvFullName: derivedName,
                targetRole: targetRole || null,
                documentType: "MD",
                experience: existingCV,
                skills: fullText,
                summary: fullText.slice(0, 300),
                lastRevisionKind: "Generated",
              },
            });
          }

          controller.close();
        } catch (error) {
          console.error("CV stream error:", error);
          const errorMsg =
            error instanceof Error ? error.message : "Generation failed";
          controller.enqueue(encoder.encode(`\n\n[Error: ${errorMsg}]`));
          controller.close();
        }
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("POST generate-cv error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
