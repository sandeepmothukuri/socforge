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
      <div className="relative flex-1 min-h-[220px] bg-[#000000] rounded-xl border border-neutral-800/80 overflow-hidden flex items-center justify-center p-2">
        <svg viewBox="0 0 1000 500" className="w-full h-full select-none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#141414" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect width="1000" height="500" fill="url(#grid)" />

          {/* Continents Geo-paths */}
          <path
            d="M 120 80 Q 200 60 280 90 Q 320 140 260 210 Q 220 230 180 280 Q 150 250 140 200 Z"
            fill="#0A0A0A"
            stroke="#1F1F1F"
            strokeWidth="1"
          />
          <path
            d="M 280 270 Q 360 290 350 370 Q 310 440 270 420 Q 250 340 280 270 Z"
            fill="#0A0A0A"
            stroke="#1F1F1F"
            strokeWidth="1"
          />
          <path
            d="M 460 90 Q 550 80 580 140 Q 530 190 480 180 Q 450 130 460 90 Z"
            fill="#0A0A0A"
            stroke="#1F1F1F"
            strokeWidth="1"
          />
          <path
            d="M 470 200 Q 570 200 580 290 Q 530 390 490 350 Q 450 270 470 200 Z"
            fill="#0A0A0A"
            stroke="#1F1F1F"
            strokeWidth="1"
          />
          <path
            d="M 580 80 Q 820 60 880 140 Q 850 240 730 260 Q 640 220 580 150 Z"
            fill="#0A0A0A"
            stroke="#1F1F1F"
            strokeWidth="1"
          />
          <path
            d="M 780 340 Q 870 330 890 390 Q 840 440 780 400 Z"
            fill="#0A0A0A"
            stroke="#1F1F1F"
            strokeWidth="1"
          />

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
                  r={isSelected ? "20" : "12"}
                  fill={spot.threatLevel === "CRITICAL" ? "#EF4444" : "#F59E0B"}
                  fillOpacity={isSelected ? "0.4" : "0.15"}
                  className="animate-pulse"
                />
                {/* Center Core Node */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={isSelected ? "5.5" : "3.5"}
                  fill={spot.threatLevel === "CRITICAL" ? "#EF4444" : "#10B981"}
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
          <div className="absolute bottom-2 left-2 px-3 py-2 bg-[#000000]/95 border border-neutral-700/80 rounded-xl shadow-2xl text-xs space-y-1 backdrop-blur-md pointer-events-none z-10 font-sans">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${active.threatLevel === "CRITICAL" ? "bg-red-500 animate-ping" : "bg-amber-400"}`} />
              <span className="font-semibold text-white text-xs">{active.country} ({active.code})</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                {active.threatLevel}
              </span>
            </div>
            <div className="text-neutral-300 text-[11px]">
              Observed Attacks: <strong className="text-emerald-400 font-mono">{active.attackCount} incidents</strong>
            </div>
            <div className="text-[11px] text-neutral-300">
              Active Adversaries: {active.topThreat}
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2 text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 bg-[#000000]/90 px-2 py-1 rounded-md border border-neutral-800">
          <Crosshair className="w-3 text-emerald-400" />
          GEOINTEL SENSOR MESH
        </div>
      </div>

      {/* Country Leaderboard Summary Strip */}
      <div className="grid grid-cols-4 gap-2 pt-2.5 text-xs">
        {THREAT_HOTSPOTS.slice(0, 4).map((h) => (
          <div
            key={h.id}
            onClick={() => setSelectedHotspot(h)}
            className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
              active?.id === h.id ? "bg-neutral-800/90 border-white text-white shadow-sm" : "bg-[#050505] border-neutral-800/80 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <span>{h.code}</span>
              <span className="text-red-400 font-mono font-bold text-[11px]">{h.attackCount}</span>
            </div>
            <div className="truncate text-[10px] text-neutral-400 mt-0.5">{h.country}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
