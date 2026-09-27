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
  { name: "IcedID", count: 64, color: "#6366F1" },
  { name: "PlugX", count: 58, color: "#38BDF8" },
  { name: "Stuxnet", count: 45, color: "#14B8A6" },
  { name: "Latrodectus", count: 39, color: "#10B981" },
  { name: "LockBit", count: 92, color: "#F59E0B" },
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
    <div className="flex flex-col items-center justify-center p-2 font-mono">
      {/* Rose Chart SVG */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg viewBox="0 0 260 260" className="w-full h-full">
          {/* Background Concentric Radar Rings */}
          <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={maxRadius * 0.75} fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={maxRadius * 0.5} fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={maxRadius * 0.25} fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />

          {/* Crosshair guidelines */}
          <line x1={cx} y1={cy - maxRadius} x2={cx} y2={cy + maxRadius} stroke="#1E293B" strokeWidth="1" />
          <line x1={cx - maxRadius} y1={cy} x2={cx + maxRadius} y2={cy} stroke="#1E293B" strokeWidth="1" />

          {/* Scale Indicator Marks */}
          <text x={cx + 3} y={cy - maxRadius + 10} fill="#64748B" fontSize="9" textAnchor="start">110</text>
          <text x={cx + 3} y={cy - maxRadius * 0.5 + 10} fill="#64748B" fontSize="9" textAnchor="start">55</text>

          {/* Slices */}
          {paths.map((slice, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <path
                key={slice.name}
                d={slice.pathData}
                fill={slice.color}
                fillOpacity={isHovered ? 0.85 : 0.45}
                stroke={slice.color}
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Center Hub */}
          <circle cx={cx} cy={cy} r="3" fill="#38BDF8" />
        </svg>

        {/* Dynamic Center/Hover Tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-[#070C18]/95 border border-[#38BDF8]/40 shadow-xl text-[10px] pointer-events-none z-10">
            <span className="font-bold text-white block">{data[hoveredIndex].name}</span>
            <span className="text-[#38BDF8]">{data[hoveredIndex].count} Observed Samples</span>
          </div>
        )}
      </div>

      {/* Interactive Legend Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-2 text-[10px] w-full">
        {data.map((item, idx) => (
          <div
            key={item.name}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`flex items-center gap-1.5 p-1 rounded transition cursor-pointer ${
              hoveredIndex === idx ? "bg-[#172033] text-white font-bold" : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
