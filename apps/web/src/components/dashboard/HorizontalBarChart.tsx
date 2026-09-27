"use client";

import React, { useState } from "react";

export interface HorizontalBarItem {
  id: string;
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
}

interface HorizontalBarChartProps {
  items: HorizontalBarItem[];
  maxValue?: number;
  barColor?: string;
  highlightColor?: string;
}

export function HorizontalBarChart({
  items,
  maxValue,
  barColor = "#F97316",
  highlightColor = "#38BDF8"
}: HorizontalBarChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const max = maxValue || Math.max(...items.map((i) => i.value), 100);

  return (
    <div className="space-y-1.5 w-full font-sans">
      {items.map((item) => {
        const percentage = Math.min((item.value / max) * 100, 100);
        const isHovered = hoveredId === item.id;
        const fill = item.color || (isHovered ? highlightColor : barColor);

        return (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`group flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
              isHovered ? "bg-neutral-800/70 shadow-sm" : "hover:bg-neutral-900/50"
            }`}
          >
            {/* Clean Sans-Serif Label */}
            <div className="w-36 sm:w-40 truncate text-xs font-medium text-neutral-300 group-hover:text-white transition-colors flex-shrink-0">
              {item.label}
            </div>

            {/* Proportional Rounded Bar Container */}
            <div className="flex-1 h-2.5 bg-[#000000] rounded-full overflow-hidden relative border border-neutral-800/80">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: fill,
                  boxShadow: isHovered ? `0 0 12px ${fill}90` : "none"
                }}
              />
            </div>

            {/* Numerical Value in Monospace Badge */}
            <div className="w-12 text-right font-mono text-[11px] font-semibold text-neutral-200 group-hover:text-sky-400 transition-colors flex-shrink-0">
              {item.value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
