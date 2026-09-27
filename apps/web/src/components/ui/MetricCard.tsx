import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  badge?: string;
}

export function MetricCard({
  title,
  value,
  subtext,
  change,
  isPositive,
  icon: Icon,
  badge,
}: MetricCardProps) {
  return (
    <div className="bg-[#000000] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between hover:border-white/30 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono text-white tracking-tight">{value}</span>
        {badge && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
            {badge}
          </span>
        )}
      </div>

      {(subtext || change) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`font-mono font-medium ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {change}
            </span>
          )}
          {subtext && <span className="text-neutral-500">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
