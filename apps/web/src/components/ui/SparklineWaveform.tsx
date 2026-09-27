"use client";

import React, { useEffect, useState } from "react";

export interface SparklineWaveformProps {
  data?: number[];
  color?: "emerald" | "amber" | "rose" | "cyan" | "white";
  height?: number;
  width?: number | string;
  animate?: boolean;
  className?: string;
}

export function SparklineWaveform({
  data = [35, 42, 38, 55, 62, 58, 70, 65, 80, 75, 88, 92],
  color = "emerald",
  height = 36,
  width = "100%",
  animate = true,
  className
}: SparklineWaveformProps) {
  const [points, setPoints] = useState<number[]>(data);

  // Micro-drift simulation to give the realistic live telemetry pulse
  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setPoints((prev) => {
        const last = prev[prev.length - 1] || 50;
        const delta = (Math.random() - 0.48) * 8;
        const nextVal = Math.max(20, Math.min(100, last + delta));
        return [...prev.slice(1), Math.round(nextVal)];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [animate]);

  const min = Math.min(...points, 0);
  const max = Math.max(...points, 100);
  const range = max - min || 1;

  const svgWidth = 120;
  const svgHeight = height;

  const strokeColor = {
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
    cyan: "#06b6d4",
    white: "#ffffff"
  }[color];

  const fillGradientId = `spark-grad-${color}-${Math.random().toString(36).substr(2, 5)}`;

  // Generate SVG path coordinates
  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * svgWidth;
    const y = svgHeight - ((val - min) / range) * (svgHeight - 6) - 3;
    return { x, y };
  });

  const pathD = coords.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x},${pt.y}`;
    const prev = coords[idx - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

  return (
    <div className={`relative overflow-hidden flex items-center ${className || ""}`} style={{ width, height }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient Area Fill */}
        <path d={areaD} fill={`url(#${fillGradientId})`} />

        {/* Smooth Curved Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulsing End Dot */}
        {coords.length > 0 && (
          <circle
            cx={coords[coords.length - 1].x}
            cy={coords[coords.length - 1].y}
            r="2.5"
            fill={strokeColor}
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
}

export default SparklineWaveform;
