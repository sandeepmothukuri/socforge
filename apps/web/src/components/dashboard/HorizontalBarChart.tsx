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
  barColor = "#F97316", // Amber/Orange default matching OpenCTI
  highlightColor = "#38BDF8"
}: HorizontalBarChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const max = maxValue || Math.max(...items.map((i) => i.value), 100);

  return (
    <div className="space-y-2 font-mono text-xs w-full">
      {items.map((item) => {
        const percentage = Math.min((item.value / max) * 100, 100);
        const isHovered = hoveredId === item.id;
        const fill = item.color || (isHovered ? highlightColor : barColor);

        return (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`group flex items-center justify-between gap-3 p-1.5 rounded-lg transition cursor-pointer ${
              isHovered ? "bg-[#172033]" : "hover:bg-[#111827]"
            }`}
          >
            {/* Label */}
            <div className="w-32 sm:w-36 truncate text-[11px] font-semibold text-[#94A3B8] group-hover:text-white flex-shrink-0">
              {item.label}
            </div>

            {/* Bar Container */}
            <div className="flex-1 h-3.5 bg-[#070C18] rounded-full overflow-hidden relative border border-[#1E293B]">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: fill,
                  boxShadow: isHovered ? `0 0 10px ${fill}80` : "none"
                }}
              />
            </div>

            {/* Numerical Value */}
            <div className="w-10 text-right text-[11px] font-bold text-white flex-shrink-0">
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
