"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  Check,
  Clipboard,
  Download,
  FileText,
  Loader2,
  Mail,
  Pencil,
  Save,
  Sparkles,
  X,
} from "lucide-react";

interface Props {
  workspaceId: string;
  initialExistingCV: string;
  initialJobDescription: string;
  initialCVOutput: string;
  initialCoverLetterOutput: string;
  initialCVName: string;
  initialTargetRole: string;
  cvId: string | null;
  coverLetterId: string | null;
}

type GenState = "idle" | "streaming";

export function WorkspaceStudio({
  workspaceId,
  initialExistingCV,
  initialJobDescription,
  initialCVOutput,
  initialCoverLetterOutput,
  initialCVName,
  initialTargetRole,
  cvId: initialCvId,
  coverLetterId: initialCoverLetterId,
}: Props) {
  const router = useRouter();

  // Shared inputs
  const [existingCV, setExistingCV] = useState(initialExistingCV);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [cvName, setCvName] = useState(initialCVName);
  const [targetRole, setTargetRole] = useState(initialTargetRole);

  // CV pane state
  const [cvOutput, setCvOutput] = useState(initialCVOutput);
  const [cvState, setCvState] = useState<GenState>("idle");
  const [cvError, setCvError] = useState<string | null>(null);
  const [cvCopied, setCvCopied] = useState(false);
  const [cvEditing, setCvEditing] = useState(false);
  const [cvSaving, setCvSaving] = useState(false);
  const [cvId, setCvId] = useState<string | null>(initialCvId);
  const cvAbortRef = useRef<AbortController | null>(null);
  const cvOutputRef = useRef<HTMLDivElement>(null);

  // Cover letter pane state
  const [clOutput, setClOutput] = useState(initialCoverLetterOutput);
  const [clState, setClState] = useState<GenState>("idle");
  const [clError, setClError] = useState<string | null>(null);
  const [clCopied, setClCopied] = useState(false);
  const [clEditing, setClEditing] = useState(false);
  const [clSaving, setClSaving] = useState(false);
  const [coverLetterId, setCoverLetterId] = useState<string | null>(
    initialCoverLetterId,
  );
  const clAbortRef = useRef<AbortController | null>(null);
  const clOutputRef = useRef<HTMLDivElement>(null);

  // ---------------- CV generation ----------------
  const handleGenerateCV = useCallback(async () => {
    if (!existingCV.trim() || !jobDescription.trim()) {
      setCvError("Please provide both your existing CV and the job description.");
      return;
    }
    if (existingCV.trim().length < 50) {
      setCvError("Existing CV is too short — please add more detail.");
      return;
    }
    if (jobDescription.trim().length < 50) {
      setCvError("Job description is too short — please add more detail.");
      return;
    }

    setCvError(null);
    setCvOutput("");
    setCvEditing(false);
    setCvState("streaming");

    cvAbortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/generate-cv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingCV,
          jobDescription,
          cvFullName: cvName || undefined,
          targetRole: targetRole || undefined,
        }),
        signal: cvAbortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setCvOutput(fullText);
        if (cvOutputRef.current) {
          cvOutputRef.current.scrollTop = cvOutputRef.current.scrollHeight;
        }
      }

      // Refresh server state so we pick up the new CV id
      router.refresh();
      // After streaming, fetch updated workspace to get cvId if newly created
      try {
        const wsRes = await fetch(`/api/workspaces/${workspaceId}`);
        if (wsRes.ok) {
          const ws = await wsRes.json();
          if (ws?.cv?.id) setCvId(ws.cv.id);
        }
      } catch {
        /* non-fatal */
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Generation failed";
      setCvError(message);
    } finally {
      setCvState("idle");
    }
  }, [
    existingCV,
    jobDescription,
    cvName,
    targetRole,
    workspaceId,
    router,
  ]);

  const handleStopCV = () => {
    cvAbortRef.current?.abort();
    setCvState("idle");
  };

  const handleSaveCVEdit = async () => {
    if (!cvId) return;
    setCvSaving(true);
    try {
      const res = await fetch(`/api/cv/${cvId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: cvOutput,
          summary: cvOutput.slice(0, 300),
          ...(cvName ? { cvFullName: cvName } : {}),
          ...(targetRole ? { targetRole } : {}),
          lastRevisionKind: "Manually edited",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save edit");
      }
      setCvEditing(false);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save edit";
      setCvError(message);
    } finally {
      setCvSaving(false);
    }
  };

  const handleCopyCV = async () => {
    await navigator.clipboard.writeText(cvOutput);
    setCvCopied(true);
    setTimeout(() => setCvCopied(false), 2000);
  };

  const handleDownloadCV = () => {
    const blob = new Blob([cvOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (cvName || targetRole || "cv")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    a.download = `${safeName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------- Cover letter generation ----------------
  const handleGenerateCoverLetter = useCallback(async () => {
    if (!jobDescription.trim()) {
      setClError("Please paste the job description first.");
      return;
    }
    if (jobDescription.trim().length < 50) {
      setClError("Job description is too short — please add more detail.");
      return;
    }
    // Need either existingCV or already-generated CV
    if (!existingCV.trim() && !cvOutput.trim()) {
      setClError(
        "Please paste your existing CV or generate the workspace CV first.",
      );
      return;
    }

    setClError(null);
    setClOutput("");
    setClEditing(false);
    setClState("streaming");

    clAbortRef.current = new AbortController();

    // Prefer the freshly generated CV in the right pane (if it exists)
    const cvForLetter =
      cvOutput.trim().length > 0 ? cvOutput : existingCV;

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/generate-cover-letter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            existingCV: cvForLetter,
            jobDescription,
          }),
          signal: clAbortRef.current.signal,
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setClOutput(fullText);
        if (clOutputRef.current) {
          clOutputRef.current.scrollTop = clOutputRef.current.scrollHeight;
        }
      }

      router.refresh();
      try {
        const wsRes = await fetch(`/api/workspaces/${workspaceId}`);
        if (wsRes.ok) {
          const ws = await wsRes.json();
          if (ws?.coverLetter?.id) setCoverLetterId(ws.coverLetter.id);
        }
      } catch {
        /* non-fatal */
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Generation failed";
      setClError(message);
    } finally {
      setClState("idle");
    }
  }, [
    jobDescription,
    existingCV,
    cvOutput,
    workspaceId,
    router,
  ]);

  const handleStopCL = () => {
    clAbortRef.current?.abort();
    setClState("idle");
  };

  const handleSaveCLEdit = async () => {
    if (!coverLetterId) return;
    setClSaving(true);
    try {
      const res = await fetch(`/api/cover-letter/${coverLetterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clOutput }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save edit");
      }
      setClEditing(false);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save edit";
      setClError(message);
    } finally {
      setClSaving(false);
    }
  };

  const handleCopyCL = async () => {
    await navigator.clipboard.writeText(clOutput);
    setClCopied(true);
    setTimeout(() => setClCopied(false), 2000);
  };

  const handleDownloadCL = () => {
    const blob = new Blob([clOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (targetRole || "cover_letter")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    a.download = `${safeName}_cover_letter.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* SHARED INPUTS */}
      <div className="glass-card rounded-xl p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            Workspace Inputs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            These two inputs feed both the CV and the cover letter. Update them
            anytime and re-generate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              CV Name <span className="text-slate-600 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
              placeholder='e.g. "Senior Engineer @ Stripe"'
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3.5 py-2 text-white placeholder-slate-500 text-sm focus:border-blue-500 transition-colors outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Target Role <span className="text-slate-600 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3.5 py-2 text-white placeholder-slate-500 text-sm focus:border-blue-500 transition-colors outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                Your Existing CV
              </label>
              <span className="text-[11px] text-slate-600">
                {existingCV.length} chars
              </span>
            </div>
            <textarea
              value={existingCV}
              onChange={(e) => setExistingCV(e.target.value)}
              placeholder="Paste your current CV here — any format works. The more detail, the better the output."
              rows={9}
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:border-blue-500 transition-colors outline-none font-mono leading-relaxed"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-cyan-400" />
                Job Description
              </label>
              <span className="text-[11px] text-slate-600">
                {jobDescription.length} chars
              </span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting — company name, responsibilities, requirements, and any 'nice to have' skills."
              rows={9}
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:border-blue-500 transition-colors outline-none font-mono leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* TWO-PANE OUTPUT ZONE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== CV PANE ===== */}
        <DocumentPane
          icon={<FileText className="h-4 w-4 text-blue-400" />}
          title="Tailored CV"
          accentColor="blue"
          state={cvState}
          output={cvOutput}
          error={cvError}
          editing={cvEditing}
          saving={cvSaving}
          docId={cvId}
          copied={cvCopied}
          outputRef={cvOutputRef}
          onGenerate={handleGenerateCV}
          onStop={handleStopCV}
          onCopy={handleCopyCV}
          onDownload={handleDownloadCV}
          onEdit={() => setCvEditing(true)}
          onCancelEdit={() => setCvEditing(false)}
          onSaveEdit={handleSaveCVEdit}
          onChangeOutput={setCvOutput}
          generateLabel="Generate CV"
          regenerateLabel="Regenerate CV"
          deepLinkPrefix="cv"
        />

        {/* ===== COVER LETTER PANE ===== */}
        <DocumentPane
          icon={<Mail className="h-4 w-4 text-cyan-400" />}
          title="Cover Letter"
          accentColor="cyan"
          state={clState}
          output={clOutput}
          error={clError}
          editing={clEditing}
          saving={clSaving}
          docId={coverLetterId}
          copied={clCopied}
          outputRef={clOutputRef}
          onGenerate={handleGenerateCoverLetter}
          onStop={handleStopCL}
          onCopy={handleCopyCL}
          onDownload={handleDownloadCL}
          onEdit={() => setClEditing(true)}
          onCancelEdit={() => setClEditing(false)}
          onSaveEdit={handleSaveCLEdit}
          onChangeOutput={setClOutput}
          generateLabel="Generate Cover Letter"
          regenerateLabel="Regenerate Cover Letter"
          deepLinkPrefix="cover-letter"
        />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// DocumentPane — shared visual + behaviour for CV and Cover Letter panes
// -----------------------------------------------------------------------

interface DocumentPaneProps {
  icon: React.ReactNode;
  title: string;
  accentColor: "blue" | "cyan";
  state: GenState;
  output: string;
  error: string | null;
  editing: boolean;
  saving: boolean;
  docId: string | null;
  copied: boolean;
  outputRef: React.RefObject<HTMLDivElement>;
  onGenerate: () => void;
  onStop: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onChangeOutput: (v: string) => void;
  generateLabel: string;
  regenerateLabel: string;
  deepLinkPrefix: "cv" | "cover-letter";
}

function DocumentPane({
  icon,
  title,
  accentColor,
  state,
  output,
  error,
  editing,
  saving,
  docId,
  copied,
  outputRef,
  onGenerate,
  onStop,
  onCopy,
  onDownload,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onChangeOutput,
  generateLabel,
  regenerateLabel,
  deepLinkPrefix,
}: DocumentPaneProps) {
  const streaming = state === "streaming";
  const hasOutput = output.trim().length > 0;

  const accent = {
    blue: {
      btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20",
      pill: "text-blue-400",
      glow: "hover:glow-blue",
    },
    cyan: {
      btn: "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20",
      pill: "text-cyan-400",
      glow: "hover:border-cyan-500/30",
    },
  }[accentColor];

  return (
    <div className={`glass-card rounded-xl flex flex-col ${accent.glow} transition-all duration-300`} style={{ minHeight: "560px" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1">
            {streaming &&
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${accentColor === "blue" ? "bg-blue-500" : "bg-cyan-500"} animate-pulse`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
          </div>
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            {icon}
            {title}
          </h2>
          {streaming && (
            <span className={`text-[11px] ${accent.pill} font-medium`}>
              streaming…
            </span>
          )}
        </div>

        {hasOutput && !streaming && !editing && (
          <div className="flex items-center gap-1">
            <button
              onClick={onCopy}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-700/60 transition-all"
              title="Copy"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-700/60 transition-all"
              title="Download"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              onClick={onEdit}
              disabled={!docId}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={docId ? "Edit" : "Generated content must be saved before editing"}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            {docId && (
              <a
                href={`/${deepLinkPrefix}/${docId}`}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-700/60 transition-all"
                title="Open in dedicated viewer"
              >
                Open →
              </a>
            )}
          </div>
        )}

        {editing && (
          <div className="flex items-center gap-1">
            <button
              onClick={onCancelEdit}
              disabled={saving}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-700/60 transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              onClick={onSaveEdit}
              disabled={saving}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {error && (
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={outputRef} className="flex-1 overflow-y-auto p-5">
          {editing ? (
            <textarea
              value={output}
              onChange={(e) => onChangeOutput(e.target.value)}
              className="w-full h-full min-h-[400px] rounded-lg bg-slate-900/60 border border-slate-700 px-4 py-3 text-slate-200 text-sm focus:border-blue-500 transition-colors outline-none font-mono leading-relaxed resize-none"
            />
          ) : !hasOutput && !streaming ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-3">
                {icon}
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                {title === "Cover Letter"
                  ? "Generate a cover letter using your CV and the job description above."
                  : "Generate a tailored CV from your existing CV and job description above."}
              </p>
            </div>
          ) : (
            <div
              className={`cv-output text-slate-200 whitespace-pre-wrap font-mono text-sm leading-relaxed ${
                streaming ? "streaming-cursor" : ""
              }`}
            >
              {output}
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="border-t border-slate-700/50 px-5 py-3.5">
        <button
          onClick={streaming ? onStop : onGenerate}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold rounded-lg transition-all text-sm shadow-lg ${
            streaming
              ? "bg-red-600/80 hover:bg-red-600 text-white shadow-red-600/20"
              : `${accent.btn} text-white`
          }`}
        >
          {streaming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Stop generating
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {hasOutput ? regenerateLabel : generateLabel}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
