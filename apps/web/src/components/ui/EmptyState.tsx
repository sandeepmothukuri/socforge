import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#263248] bg-[#111827]/40 rounded-lg my-4">
      <div className="p-3 rounded-full bg-[#151C2E] border border-[#263248] text-[#38BDF8] mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1">{title}</h3>
      <p className="text-xs text-[#A7B0C0] max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-semibold px-3 py-1.5 rounded bg-[#38BDF8] text-[#0B1020] hover:bg-[#38BDF8]/90 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
