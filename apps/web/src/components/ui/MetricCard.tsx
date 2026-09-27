import React from "react";
import { LucideIcon } from "lucide-react";
import { SparklineWaveform } from "@/components/ui/SparklineWaveform";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  badge?: string;
  showSparkline?: boolean;
  sparklineColor?: "emerald" | "amber" | "rose" | "cyan" | "white";
  sparklineData?: number[];
}

export function MetricCard({
  title,
  value,
  subtext,
  change,
  isPositive,
  icon: Icon,
  badge,
  showSparkline = true,
  sparklineColor = "emerald",
  sparklineData
}: MetricCardProps) {
  return (
    <div className="bg-[#050505] border border-[#262626] rounded-xl p-4 flex flex-col justify-between hover:border-neutral-500 transition-all shadow-sm relative overflow-hidden group">
      <div className="flex items-center justify-between z-10">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-neutral-900 border border-[#262626] text-white">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between z-10">
        <span className="text-2xl font-bold font-mono text-white tracking-tight">{value}</span>
        {badge && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-900 border border-[#262626] text-neutral-300">
            {badge}
          </span>
        )}
      </div>

      {showSparkline && (
        <div className="my-2 w-full z-0 opacity-85 group-hover:opacity-100 transition-opacity">
          <SparklineWaveform
            color={sparklineColor}
            height={28}
            data={sparklineData}
          />
        </div>
      )}

      {(subtext || change) && (
        <div className="mt-1 flex items-center justify-between text-xs z-10">
          {change && (
            <span
              className={`font-mono font-medium ${
                isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {change}
            </span>
          )}
          {subtext && <span className="text-neutral-500 text-[11px] font-mono">{subtext}</span>}
        </div>
      )}
    </div>
  );
}

export default MetricCard;

