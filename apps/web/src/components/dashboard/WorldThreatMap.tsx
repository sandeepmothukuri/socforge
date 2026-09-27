"use client";

import React, { useState } from "react";
import { Globe, MapPin, ShieldAlert, Crosshair } from "lucide-react";

interface ThreatLocation {
  id: string;
  country: string;
  code: string;
  attackCount: number;
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  topThreat: string;
  x: number; // percentage coordinates on 1000x500 map canvas
  y: number;
}

const THREAT_HOTSPOTS: ThreatLocation[] = [
  { id: "us", country: "United States", code: "US", attackCount: 684, threatLevel: "CRITICAL", topThreat: "Volt Typhoon, APT29", x: 230, y: 180 },
  { id: "ua", country: "Ukraine", code: "UA", attackCount: 540, threatLevel: "CRITICAL", topThreat: "Sandworm, Gamaredon", x: 575, y: 160 },
  { id: "de", country: "Germany", code: "DE", attackCount: 312, threatLevel: "HIGH", topThreat: "Cozy Bear, LockBit 3.0", x: 510, y: 165 },
  { id: "uk", country: "United Kingdom", code: "GB", attackCount: 290, threatLevel: "HIGH", topThreat: "TA505, Lazarus Group", x: 475, y: 150 },
  { id: "in", country: "India", code: "IN", attackCount: 420, threatLevel: "HIGH", topThreat: "SideCopy, Transparent Tribe", x: 700, y: 240 },
  { id: "tw", country: "Taiwan", code: "TW", attackCount: 460, threatLevel: "CRITICAL", topThreat: "Flax Typhoon, Mustang Panda", x: 810, y: 245 },
  { id: "jp", country: "Japan", code: "JP", attackCount: 275, threatLevel: "MEDIUM", topThreat: "BlackTech, Lazarus", x: 865, y: 195 },
  { id: "il", country: "Israel", code: "IL", attackCount: 380, threatLevel: "HIGH", topThreat: "MuddyWater, OilRig", x: 585, y: 220 },
  { id: "au", country: "Australia", code: "AU", attackCount: 195, threatLevel: "MEDIUM", topThreat: "APT40, BianLian", x: 840, y: 390 },
  { id: "br", country: "Brazil", code: "BR", attackCount: 220, threatLevel: "MEDIUM", topThreat: "Grandoreiro, Mekotio", x: 340, y: 340 }
];

export function WorldThreatMap() {
  const [selectedHotspot, setSelectedHotspot] = useState<ThreatLocation | null>(THREAT_HOTSPOTS[0]);
  const [hoveredHotspot, setHoveredHotspot] = useState<ThreatLocation | null>(null);

  const active = hoveredHotspot || selectedHotspot;

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Interactive SVG World Map Canvas */}
      <div className="relative flex-1 min-h-[220px] bg-[#070C18] rounded-xl border border-[#1E293B] overflow-hidden flex items-center justify-center p-2">
        <svg viewBox="0 0 1000 500" className="w-full h-full select-none">
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#162032" strokeWidth="0.5" />
            </pattern>
            {/* Pulsing Gradient Radial */}
            <radialGradient id="hotspotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="1000" height="500" fill="url(#grid)" />

          {/* Continents Geo-paths (Simplified Dark Landmasses) */}
          {/* North America */}
          <path
            d="M 120 80 Q 200 60 280 90 Q 320 140 260 210 Q 220 230 180 280 Q 150 250 140 200 Z"
            fill="#101828"
            stroke="#1E293B"
            strokeWidth="1"
          />
          {/* South America */}
          <path
            d="M 280 270 Q 360 290 350 370 Q 310 440 270 420 Q 250 340 280 270 Z"
            fill="#101828"
            stroke="#1E293B"
            strokeWidth="1"
          />
          {/* Europe */}
          <path
            d="M 460 90 Q 550 80 580 140 Q 530 190 480 180 Q 450 130 460 90 Z"
            fill="#101828"
            stroke="#1E293B"
            strokeWidth="1"
          />
          {/* Africa */}
          <path
            d="M 470 200 Q 570 200 580 290 Q 530 390 490 350 Q 450 270 470 200 Z"
            fill="#101828"
            stroke="#1E293B"
            strokeWidth="1"
          />
          {/* Asia / Eurasia */}
          <path
            d="M 580 80 Q 820 60 880 140 Q 850 240 730 260 Q 640 220 580 150 Z"
            fill="#101828"
            stroke="#1E293B"
            strokeWidth="1"
          />
          {/* Australia */}
          <path
            d="M 780 340 Q 870 330 890 390 Q 840 440 780 400 Z"
            fill="#101828"
            stroke="#1E293B"
            strokeWidth="1"
          />

          {/* Render Threat Hotspot Nodes */}
          {THREAT_HOTSPOTS.map((spot) => {
            const isSelected = active?.id === spot.id;
            return (
              <g
                key={spot.id}
                className="cursor-pointer transition-transform"
                onClick={() => setSelectedHotspot(spot)}
                onMouseEnter={() => setHoveredHotspot(spot)}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                {/* Outer Glow Halo */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={isSelected ? "22" : "14"}
                  fill={spot.threatLevel === "CRITICAL" ? "#EF4444" : "#F59E0B"}
                  fillOpacity={isSelected ? "0.35" : "0.15"}
                  className="animate-pulse"
                />
                {/* Center Core Node */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={isSelected ? "6" : "4"}
                  fill={spot.threatLevel === "CRITICAL" ? "#EF4444" : "#38BDF8"}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                {/* Country Code Label */}
                <text
                  x={spot.x + 8}
                  y={spot.y + 4}
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {spot.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Country Telemetry Overlay */}
        {active && (
          <div className="absolute bottom-2 left-2 px-3 py-2 bg-[#0B1020]/95 border border-[#263248] rounded-xl shadow-2xl text-[11px] space-y-1 backdrop-blur-sm pointer-events-none z-10">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${active.threatLevel === "CRITICAL" ? "bg-red-500 animate-ping" : "bg-amber-400"}`} />
              <span className="font-bold text-white text-xs">{active.country} ({active.code})</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                {active.threatLevel}
              </span>
            </div>
            <div className="text-[#94A3B8] text-[10px]">
              Observed Attacks: <strong className="text-[#38BDF8]">{active.attackCount} incidents</strong>
            </div>
            <div className="text-[10px] text-purple-300">
              Active Adversaries: {active.topThreat}
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2 text-[10px] text-[#64748B] flex items-center gap-1.5 bg-[#0B1020]/80 px-2 py-1 rounded border border-[#1E293B]">
          <Crosshair className="w-3 h-3 text-[#38BDF8]" />
          GEOINTEL SENSOR MESH
        </div>
      </div>

      {/* Country Leaderboard Summary Strip */}
      <div className="grid grid-cols-4 gap-2 pt-2 text-[10px]">
        {THREAT_HOTSPOTS.slice(0, 4).map((h) => (
          <div
            key={h.id}
            onClick={() => setSelectedHotspot(h)}
            className={`p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
              active?.id === h.id ? "bg-[#172033] border-[#38BDF8] text-white" : "bg-[#0E1626] border-[#1E293B] text-[#94A3B8]"
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span>{h.code}</span>
              <span className="text-red-400">{h.attackCount}</span>
            </div>
            <div className="truncate text-[9px] text-[#64748B]">{h.country}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
