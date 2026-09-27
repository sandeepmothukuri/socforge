"use client";

import React, { useState } from "react";
import { Globe, MapPin, ShieldAlert, Crosshair, Radio, Activity } from "lucide-react";

interface ThreatLocation {
  id: string;
  country: string;
  code: string;
  attackCount: number;
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  topThreat: string;
  x: number;
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
    <div className="flex flex-col h-full font-sans">
      {/* Interactive SVG World Map Canvas */}
      <div className="relative flex-1 min-h-[220px] bg-[#000000] rounded-xl border border-[#262626] overflow-hidden flex items-center justify-center p-2">
        <svg viewBox="0 0 1000 500" className="w-full h-full select-none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#121212" strokeWidth="0.5" />
            </pattern>
            {/* Tactical Radar Sweep Gradient */}
            <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect width="1000" height="500" fill="url(#grid)" />

          {/* Continents Geo-paths */}
          <path
            d="M 120 80 Q 200 60 280 90 Q 320 140 260 210 Q 220 230 180 280 Q 150 250 140 200 Z"
            fill="#080808"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
          <path
            d="M 280 270 Q 360 290 350 370 Q 310 440 270 420 Q 250 340 280 270 Z"
            fill="#080808"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
          <path
            d="M 460 90 Q 550 80 580 140 Q 530 190 480 180 Q 450 130 460 90 Z"
            fill="#080808"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
          <path
            d="M 470 200 Q 570 200 580 290 Q 530 390 490 350 Q 450 270 470 200 Z"
            fill="#080808"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
          <path
            d="M 580 80 Q 820 60 880 140 Q 850 240 730 260 Q 640 220 580 150 Z"
            fill="#080808"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
          <path
            d="M 780 340 Q 870 330 890 390 Q 840 440 780 400 Z"
            fill="#080808"
            stroke="#1a1a1a"
            strokeWidth="1"
          />

          {/* Tactical Concentric Radar Rings */}
          <g opacity="0.3">
            <circle cx="500" cy="250" r="100" fill="none" stroke="#262626" strokeWidth="0.75" strokeDasharray="3,3" />
            <circle cx="500" cy="250" r="200" fill="none" stroke="#262626" strokeWidth="0.75" strokeDasharray="3,3" />
            <circle cx="500" cy="250" r="300" fill="none" stroke="#1f1f1f" strokeWidth="0.75" />
            <line x1="100" y1="250" x2="900" y2="250" stroke="#1a1a1a" strokeWidth="0.5" />
            <line x1="500" y1="50" x2="500" y2="450" stroke="#1a1a1a" strokeWidth="0.5" />
          </g>

          {/* Attack Trajectory Arcs (C2 Beacons) */}
          <g opacity="0.6">
            {/* Moscow/Eastern EU -> US West */}
            <path
              d="M 575,160 Q 400,60 230,180"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1.2"
              strokeDasharray="4,4"
            />
            {/* Asia/Taiwan -> US DC */}
            <path
              d="M 810,245 Q 520,70 230,180"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            {/* Netherlands -> Germany */}
            <path
              d="M 475,150 Q 490,130 510,165"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1.2"
            />
          </g>

          {/* Threat Hotspot Nodes */}
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
                  r={isSelected ? "22" : "12"}
                  fill={spot.threatLevel === "CRITICAL" ? "#f43f5e" : "#f59e0b"}
                  fillOpacity={isSelected ? "0.4" : "0.15"}
                  className="animate-pulse"
                />
                {/* Center Core Node */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={isSelected ? "5.5" : "3.5"}
                  fill={spot.threatLevel === "CRITICAL" ? "#f43f5e" : "#10b981"}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                {/* Country Code Label */}
                <text
                  x={spot.x + 8}
                  y={spot.y + 4}
                  fill="#71717A"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="600"
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
          <div className="absolute bottom-2 left-2 px-3 py-2 bg-[#050505]/95 border border-[#262626] rounded-xl shadow-2xl text-xs space-y-1 backdrop-blur-md pointer-events-none z-10 font-sans">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${active.threatLevel === "CRITICAL" ? "bg-rose-500 animate-ping" : "bg-amber-400"}`} />
              <span className="font-semibold text-white text-xs">{active.country} ({active.code})</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                {active.threatLevel}
              </span>
            </div>
            <div className="text-neutral-300 text-[11px]">
              Observed Attacks: <strong className="text-emerald-400 font-mono">{active.attackCount} incidents</strong>
            </div>
            <div className="text-[11px] text-neutral-400">
              Active Adversaries: <span className="text-neutral-200">{active.topThreat}</span>
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2 text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 bg-[#050505]/90 px-2.5 py-1 rounded-lg border border-[#262626]">
          <Crosshair className="w-3 h-3 text-emerald-400 animate-spin" />
          <span>RADAR SWEEP ACTIVE</span>
        </div>
      </div>

      {/* Country Leaderboard Summary Strip */}
      <div className="grid grid-cols-4 gap-2 pt-2.5 text-xs">
        {THREAT_HOTSPOTS.slice(0, 4).map((h) => (
          <div
            key={h.id}
            onClick={() => setSelectedHotspot(h)}
            className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
              active?.id === h.id ? "bg-[#171717] border-white text-white shadow-sm" : "bg-[#050505] border-[#262626] text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <span>{h.code}</span>
              <span className="text-rose-400 font-mono font-bold text-[11px]">{h.attackCount}</span>
            </div>
            <div className="truncate text-[10px] text-neutral-500 mt-0.5">{h.country}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorldThreatMap;
