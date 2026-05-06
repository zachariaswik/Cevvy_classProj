import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CVViewer } from "@/components/CVViewer";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Tag,
  Target,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function CVPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/cv/${params.id}`);
  }

  const cv = await prisma.cV.findUnique({
    where: { id: params.id },
  });

  if (!cv || cv.userId !== session.user.id) {
    notFound();
  }

  // The full generated content is stored in the skills field
  const content = cv.skills || cv.summary || "No content available.";

  const backHref = cv.workspaceId
    ? `/workspace/${cv.workspaceId}`
    : "/dashboard";
  const backLabel = cv.workspaceId ? "Back to workspace" : "Back to dashboard";

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
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/20">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {cv.cvFullName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {cv.targetRole && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Target className="h-3.5 w-3.5" />
                      {cv.targetRole}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(cv.createdAt)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-slate-500" />
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {cv.documentType}
                    </span>
                  </div>
                  {cv.lastRevisionKind && (
                    <span className="px-2 py-0.5 rounded text-xs text-slate-500 bg-slate-800/60 border border-slate-700/50">
                      {cv.lastRevisionKind}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CV content */}
        <CVViewer content={content} cvName={cv.cvFullName} />
      </div>
    </div>
  );
}
