import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CVViewer } from "@/components/CVViewer";
import { ArrowLeft, Calendar, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function CoverLetterPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/cover-letter/${params.id}`);
  }

  const coverLetter = await prisma.coverLetter.findUnique({
    where: { id: params.id },
    include: {
      workspace: {
        include: { cv: { select: { targetRole: true, cvFullName: true } } },
      },
    },
  });

  if (!coverLetter || coverLetter.userId !== session.user.id) {
    notFound();
  }

  const backHref = coverLetter.workspaceId
    ? `/workspace/${coverLetter.workspaceId}`
    : "/dashboard";
  const backLabel = coverLetter.workspaceId
    ? "Back to workspace"
    : "Back to dashboard";

  const heading =
    coverLetter.workspace?.cv?.targetRole ||
    coverLetter.workspace?.cv?.cvFullName ||
    "Cover Letter";

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          {backLabel}
        </Link>

        {/* Header */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-600/20 border border-cyan-500/20">
                <Mail className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-1">
                  Cover Letter
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {heading}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(coverLetter.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Letter content */}
        <CVViewer content={coverLetter.text} cvName={`cover_letter_${heading}`} />
      </div>
    </div>
  );
}
