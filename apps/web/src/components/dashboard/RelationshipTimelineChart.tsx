"use client";

import React, { useState } from "react";
import { Share2 } from "lucide-react";

interface DataPoint {
  month: string;
  count: number;
}

const DEFAULT_TIMELINE: DataPoint[] = [
  { month: "May 2024", count: 120 },
  { month: "Jun 2024", count: 340 },
  { month: "Jul 2024", count: 480 },
  { month: "Aug 2024", count: 620 },
  { month: "Sep 2024", count: 890 },
  { month: "Nov 2024", count: 1250 },
  { month: "Jan 2025", count: 1540 },
  { month: "Feb 2025", count: 1820 },
  { month: "Mar 2025", count: 2100 },
  { month: "Apr 2025", count: 2450 }
];

export function RelationshipTimelineChart({ data = DEFAULT_TIMELINE }: { data?: DataPoint[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const maxVal = Math.max(...data.map((d) => d.count), 3000);
  const width = 500;
  const height = 180;
  const padding = 30;

  // Compute SVG points
  const points = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d.count / maxVal) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="flex flex-col h-full font-sans text-xs">
      <div className="relative flex-1 bg-[#070C18] rounded-xl border border-slate-800/80 p-2 flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1E293B" strokeWidth="1" />

          {/* Shaded Area */}
          <path d={areaD} fill="url(#lineGrad)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint?.month === p.month;
            return (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 3.5}
                fill={isHovered ? "#FFFFFF" : "#38BDF8"}
                stroke="#0B1020"
                strokeWidth={2}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Axis Labels */}
          <text x={padding} y={height - 10} fill="#64748B" fontSize="10" fontFamily="sans-serif">May 2024</text>
          <text x={width / 2} y={height - 10} fill="#64748B" fontSize="10" fontFamily="sans-serif" textAnchor="middle">Nov 2024</text>
          <text x={width - padding} y={height - 10} fill="#64748B" fontSize="10" fontFamily="sans-serif" textAnchor="end">Apr 2025</text>
        </svg>

        {/* Dynamic Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-[#0B1020]/95 border border-sky-500/50 shadow-xl text-xs pointer-events-none">
            <span className="font-semibold text-white block">{hoveredPoint.month}</span>
            <span className="text-sky-400 font-mono text-[11px]">{hoveredPoint.count.toLocaleString()} Linkages</span>
          </div>
        )}
      </div>
    </div>
  );
}
