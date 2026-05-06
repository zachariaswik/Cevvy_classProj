import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamCoverLetterGeneration } from "@/lib/anthropic";
import { z } from "zod";

const schema = z.object({
  existingCV: z.string().optional(),
  jobDescription: z
    .string()
    .min(50, "Please provide a more detailed job description (at least 50 characters)"),
});

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership and load CV (used as fallback source for the cover letter)
  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: { cv: true, coverLetter: true },
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

  // Resolve CV source: explicit existingCV > generated CV (skills) > original input (experience)
  const resolvedCV =
    (parsed.data.existingCV && parsed.data.existingCV.trim()) ||
    workspace.cv?.skills ||
    workspace.cv?.experience ||
    "";

  if (resolvedCV.length < 50) {
    return NextResponse.json(
      {
        error:
          "Please provide your existing CV (at least 50 characters) or generate the workspace CV first.",
      },
      { status: 400 },
    );
  }

  const { jobDescription } = parsed.data;

  try {
    const stream = await streamCoverLetterGeneration({
      existingCV: resolvedCV,
      jobDescription,
    });

    const userId = session.user.id;
    const workspaceId = workspace.id;
    const existingCoverLetterId = workspace.coverLetter?.id ?? null;

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

          if (existingCoverLetterId) {
            await prisma.coverLetter.update({
              where: { id: existingCoverLetterId },
              data: { text: fullText },
            });
          } else {
            await prisma.coverLetter.create({
              data: {
                userId,
                workspaceId,
                text: fullText,
              },
            });
          }

          controller.close();
        } catch (error) {
          console.error("Cover letter stream error:", error);
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
    console.error("POST generate-cover-letter error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
