import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { Briefcase, FolderPlus, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const workspaces = await prisma.workspace.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      cv: {
        select: {
          id: true,
          cvFullName: true,
          targetRole: true,
          summary: true,
        },
      },
      coverLetter: { select: { id: true } },
    },
  });

  const completeCount = workspaces.filter(
    (w) => w.cv && w.coverLetter,
  ).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Your Workspaces
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {workspaces.length === 0
                ? "Create a workspace for each job application — one CV + one cover letter, perfectly tailored."
                : `${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"}${completeCount > 0 ? ` · ${completeCount} ready to send` : ""}`}
            </p>
          </div>
          <Link
            href="/workspace/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm whitespace-nowrap"
          >
            <FolderPlus className="h-4 w-4" />
            New Workspace
          </Link>
        </div>

        {/* Empty state */}
        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-6">
              <Briefcase className="h-10 w-10 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No workspaces yet
            </h2>
            <p className="text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
              A workspace is a job application bundle: one tailored CV and one
              cover letter, generated together. Create your first workspace to
              get started.
            </p>
            <Link
              href="/workspace/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              <Sparkles className="h-4 w-4" />
              Create your first workspace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((w) => (
              <WorkspaceCard
                key={w.id}
                id={w.id}
                createdAt={w.createdAt.toISOString()}
                cv={
                  w.cv
                    ? {
                        id: w.cv.id,
                        cvFullName: w.cv.cvFullName,
                        targetRole: w.cv.targetRole,
                        summary: w.cv.summary,
                      }
                    : null
                }
                coverLetter={w.coverLetter ? { id: w.coverLetter.id } : null}
              />
            ))}

            {/* Create new card */}
            <Link
              href="/workspace/new"
              className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-700/60 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all duration-300 min-h-[180px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/60 group-hover:bg-blue-600/20 border border-slate-700/50 group-hover:border-blue-500/30 transition-all">
                <FolderPlus className="h-6 w-6 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-400 group-hover:text-blue-400 transition-colors">
                  New Workspace
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tailored for a new role
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
