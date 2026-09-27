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
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-neutral-800 bg-[#000000] rounded-xl my-4">
      <div className="p-3 rounded-full bg-neutral-900 border border-neutral-800 text-white mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-neutral-400 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
