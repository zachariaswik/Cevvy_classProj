"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  FileText,
  Mail,
  Trash2,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

interface WorkspaceCardProps {
  id: string;
  createdAt: string;
  cv: {
    id: string;
    cvFullName: string;
    targetRole: string | null;
    summary: string | null;
  } | null;
  coverLetter: { id: string } | null;
}

export function WorkspaceCard({
  id,
  createdAt,
  cv,
  coverLetter,
}: WorkspaceCardProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        "Delete this workspace? Its CV and cover letter will be permanently removed.",
      )
    )
      return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete workspace");
        setDeleting(false);
      }
    } catch {
      alert("An error occurred");
      setDeleting(false);
    }
  };

  const targetRole = cv?.targetRole;
  const cvName = cv?.cvFullName;
  const summary = cv?.summary;

  const hasCV = !!cv;
  const hasCoverLetter = !!coverLetter;

  return (
    <div className="group relative glass-card rounded-xl p-5 hover:border-blue-500/30 hover:glow-blue transition-all duration-300">
      <Link href={`/workspace/${id}`} className="block">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/20">
            <Briefcase className="h-5 w-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
              {targetRole || cvName || "Untitled workspace"}
            </h3>
            {targetRole && cvName && cvName !== targetRole && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{cvName}</p>
            )}
            {!cv && (
              <p className="text-xs text-slate-500 mt-0.5">
                No CV generated yet
              </p>
            )}
          </div>
        </div>

        {summary && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {summary}
          </p>
        )}

        {/* Status pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusPill label="CV" active={hasCV} />
          <StatusPill label="Cover Letter" active={hasCoverLetter} />
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDistanceToNow(new Date(createdAt))} ago</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Open</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
        title="Delete workspace"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  const Icon = label === "CV" ? FileText : Mail;
  if (active) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <Check className="h-3 w-3" />
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/60 text-slate-500 border border-slate-700/50">
      <X className="h-3 w-3" />
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
