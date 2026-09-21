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
    <div className="bg-[#151C2E] border border-[#263248] rounded-lg p-4 flex flex-col justify-between hover:border-[#38BDF8]/40 transition-colors shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#A7B0C0] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded bg-[#172033] border border-[#263248] text-[#38BDF8]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono text-[#F8FAFC] tracking-tight">{value}</span>
        {badge && (
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#172033] border border-[#263248] text-[#38BDF8]">
            {badge}
          </span>
        )}
      </div>

      {(subtext || change) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`font-mono font-medium ${
                isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              {change}
            </span>
          )}
          {subtext && <span className="text-[#6B7280]">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
