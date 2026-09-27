"use client";

import React, { useState } from "react";

interface MalwareSegment {
  name: string;
  count: number;
  color: string;
}

const DEFAULT_MALWARE: MalwareSegment[] = [
  { name: "Cobalt Strike", count: 110, color: "#EF4444" },
  { name: "DarkGate", count: 85, color: "#EC4899" },
  { name: "QakBot", count: 72, color: "#A855F7" },
  { name: "IcedID", count: 64, color: "#F59E0B" },
  { name: "PlugX", count: 58, color: "#10B981" },
  { name: "Stuxnet", count: 45, color: "#14B8A6" },
  { name: "Latrodectus", count: 39, color: "#84CC16" },
  { name: "LockBit", count: 92, color: "#EA580C" },
  { name: "Bumblebee", count: 34, color: "#FB923C" },
  { name: "Pikabot", count: 50, color: "#E11D48" },
];

export function PolarRoseChart({ data = DEFAULT_MALWARE }: { data?: MalwareSegment[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cx = 130;
  const cy = 130;
  const maxRadius = 105;
  const maxVal = Math.max(...data.map((d) => d.count), 120);

  const totalSlices = data.length;
  const anglePerSlice = (2 * Math.PI) / totalSlices;

  // Generate SVG path for each wedge
  const paths = data.map((item, idx) => {
    const startAngle = idx * anglePerSlice - Math.PI / 2;
    const endAngle = startAngle + anglePerSlice;
    const radius = (item.count / maxVal) * maxRadius;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const pathData = `
      M ${cx} ${cy}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 0 1 ${x2} ${y2}
      Z
    `;

    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
      radius,
    };
  });

  return (
    <div className="flex flex-col items-center justify-center p-2 font-sans">
      {/* Rose Chart SVG */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg viewBox="0 0 260 260" className="w-full h-full">
          {/* Background Concentric Radar Rings */}
          <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={maxRadius * 0.75} fill="none" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={maxRadius * 0.5} fill="none" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={maxRadius * 0.25} fill="none" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />

          {/* Crosshair guidelines */}
          <line x1={cx} y1={cy - maxRadius} x2={cx} y2={cy + maxRadius} stroke="#262626" strokeWidth="1" />
          <line x1={cx - maxRadius} y1={cy} x2={cx + maxRadius} y2={cy} stroke="#262626" strokeWidth="1" />

          {/* Slices */}
          {paths.map((slice, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <path
                key={slice.name}
                d={slice.pathData}
                fill={slice.color}
                fillOpacity={isHovered ? 0.9 : 0.5}
                stroke={slice.color}
                strokeWidth={isHovered ? 2.5 : 1}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Center Hub */}
          <circle cx={cx} cy={cy} r="4" fill="#FFFFFF" />
        </svg>

        {/* Dynamic Center/Hover Tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-[#000000]/95 border border-white/40 shadow-2xl text-xs pointer-events-none z-10 backdrop-blur-md">
            <span className="font-semibold text-white block">{data[hoveredIndex].name}</span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">{data[hoveredIndex].count} Ingested Samples</span>
          </div>
        )}
      </div>

      {/* Interactive Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-3 text-xs w-full">
        {data.map((item, idx) => (
          <div
            key={item.name}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all cursor-pointer ${
              hoveredIndex === idx ? "bg-neutral-800 text-white font-semibold" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate text-[11px]">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
