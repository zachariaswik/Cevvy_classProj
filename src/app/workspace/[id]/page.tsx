import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { WorkspaceStudio } from "@/components/WorkspaceStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function WorkspacePage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/workspace/${params.id}`);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: {
      cv: true,
      coverLetter: true,
    },
  });

  if (!workspace || workspace.userId !== session.user.id) {
    notFound();
  }

  // Pre-populate inputs from prior state if available
  const initialExistingCV = workspace.cv?.experience ?? "";
  const initialJobDescription = ""; // not stored — re-supplied per session
  const initialCVOutput = workspace.cv?.skills ?? "";
  const initialCoverLetterOutput = workspace.coverLetter?.text ?? "";
  const initialTargetRole = workspace.cv?.targetRole ?? "";
  const initialCVName = workspace.cv?.cvFullName ?? "";

  const headerTitle =
    workspace.cv?.targetRole ||
    workspace.cv?.cvFullName ||
    "Untitled Workspace";

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-5 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1">
              Workspace
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {headerTitle}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              Created {formatDate(workspace.createdAt)}
            </div>
          </div>
        </div>

        <WorkspaceStudio
          workspaceId={workspace.id}
          initialExistingCV={initialExistingCV}
          initialJobDescription={initialJobDescription}
          initialCVOutput={initialCVOutput}
          initialCoverLetterOutput={initialCoverLetterOutput}
          initialCVName={initialCVName}
          initialTargetRole={initialTargetRole}
          cvId={workspace.cv?.id ?? null}
          coverLetterId={workspace.coverLetter?.id ?? null}
        />
      </div>
    </div>
  );
}
