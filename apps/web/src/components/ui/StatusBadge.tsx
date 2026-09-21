import React from "react";

export type StatusType =
  | "new"
  | "triaged"
  | "investigating"
  | "resolved"
  | "closed"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "tested"
  | "completed";

interface StatusBadgeProps {
  status: StatusType | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const norm = status.toLowerCase() as StatusType;

  const styles: Record<string, { bg: string; text: string; border: string }> = {
    new: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    triaged: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" },
    investigating: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    resolved: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    closed: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" },
    pending_approval: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
    approved: { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]", border: "border-[#22C55E]/30" },
    rejected: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
    tested: { bg: "bg-[#38BDF8]/10", text: "text-[#38BDF8]", border: "border-[#38BDF8]/30" },
    completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  };

  const current = styles[norm] || {
    bg: "bg-slate-800",
    text: "text-slate-300",
    border: "border-slate-700",
  };

  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
