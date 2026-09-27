"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Radio,
  Play,
  Pause,
  Filter,
  ShieldAlert,
  Flame,
  Activity,
  Layers,
  Zap,
  Target,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Server
} from "lucide-react";

export interface ThreatArc {
  id: string;
  sourceCity: string;
  sourceCountry: string;
  sourceCoords: [number, number]; // [lat, lng]
  targetCity: string;
  targetRegion: string;
  targetCoords: [number, number]; // [lat, lng]
  threatActor: string;
  technique: string;
  protocol: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "BLOCKED_BY_SOAR" | "WAF_DROP" | "CONTAINED" | "INVESTIGATING";
  color: string;
  timestamp: string;
}

export const ACTIVE_THREAT_ARCS: ThreatArc[] = [
  {
    id: "arc-01",
    sourceCity: "Moscow",
    sourceCountry: "RU",
    sourceCoords: [55.75, 37.61],
    targetCity: "Ashburn (US-East AWS)",
    targetRegion: "AWS VPC Production",
    targetCoords: [39.04, -77.48],
    threatActor: "APT29 (Nobelium)",
    technique: "T1078.004 Cloud Token Minting",
    protocol: "HTTPS / TLS 1.3",
    severity: "CRITICAL",
    status: "BLOCKED_BY_SOAR",
    color: "#ef4444",
    timestamp: "12s ago"
  },
  {
    id: "arc-02",
    sourceCity: "Shanghai",
    sourceCountry: "CN",
    sourceCoords: [31.23, 121.47],
    targetCity: "Frankfurt (EU-Central GCP)",
    targetRegion: "GCP Kubernetes Cluster",
    targetCoords: [50.11, 8.68],
    threatActor: "Volt Typhoon",
    technique: "T1059.001 LOTL PowerShell",
    protocol: "SSH / Port 2222",
    severity: "CRITICAL",
    status: "CONTAINED",
    color: "#f59e0b",
    timestamp: "45s ago"
  },
  {
    id: "arc-03",
    sourceCity: "Pyongyang",
    sourceCountry: "KP",
    sourceCoords: [39.03, 125.76],
    targetCity: "Tokyo (APAC AWS)",
    targetRegion: "Financial Core Engine",
    targetCoords: [35.67, 139.65],
    threatActor: "Lazarus Group",
    technique: "T1566.001 Spearphishing Attachment",
    protocol: "TCP / Port 443",
    severity: "CRITICAL",
    status: "BLOCKED_BY_SOAR",
    color: "#a855f7",
    timestamp: "1m ago"
  },
  {
    id: "arc-04",
    sourceCity: "St. Petersburg",
    sourceCountry: "RU",
    sourceCoords: [59.93, 30.33],
    targetCity: "London (Financial Edge)",
    targetRegion: "Equinix Edge DC",
    targetCoords: [51.50, -0.12],
    threatActor: "Sandworm",
    technique: "T1486 Data Encrypted for Impact",
    protocol: "SMB / Port 445",
    severity: "CRITICAL",
    status: "CONTAINED",
    color: "#ef4444",
    timestamp: "2m ago"
  },
  {
    id: "arc-05",
    sourceCity: "Bucharest",
    sourceCountry: "RO",
    sourceCoords: [44.43, 26.10],
    targetCity: "Quincy (US-West Azure)",
    targetRegion: "Azure Storage Pool",
    targetCoords: [47.23, -119.85],
    threatActor: "FIN7 Syndicate",
    technique: "T1003.001 LSASS Memory Dump",
    protocol: "HTTPS / WinRM",
    severity: "HIGH",
    status: "WAF_DROP",
    color: "#3b82f6",
    timestamp: "3m ago"
  },
  {
    id: "arc-06",
    sourceCity: "Amsterdam",
    sourceCountry: "NL",
    sourceCoords: [52.36, 4.90],
    targetCity: "Ashburn (US-East AWS)",
    targetRegion: "Auth Proxy Gateway",
    targetCoords: [39.04, -77.48],
    threatActor: "Tor Exit Relay 49.12",
    technique: "T1110.003 Password Spraying",
    protocol: "HTTPS / REST API",
    severity: "HIGH",
    status: "BLOCKED_BY_SOAR",
    color: "#10b981",
    timestamp: "Just now"
  }
];

// Utility: convert lat/lng to SVG coordinates on a 1000x500 equirectangular canvas
function project(lat: number, lng: number): [number, number] {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return [x, y];
}

export default function GlobalThreatMap({ compact = false }: { compact?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedActor, setSelectedActor] = useState<string>("ALL");
  const [activeArc, setActiveArc] = useState<ThreatArc | null>(ACTIVE_THREAT_ARCS[0]);
  const [liveArcTicker, setLiveArcTicker] = useState<ThreatArc[]>(ACTIVE_THREAT_ARCS);
  const [pulseCount, setPulseCount] = useState(14820);

  // Periodic random pulse to simulate live global events
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + Math.floor(Math.random() * 8) + 3);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const filteredArcs = useMemo(() => {
    if (selectedActor === "ALL") return liveArcTicker;
    return liveArcTicker.filter((a) => a.threatActor.toLowerCase().includes(selectedActor.toLowerCase()));
  }, [selectedActor, liveArcTicker]);

  return (
    <div className={`w-full rounded-2xl bg-[#000000] border border-[#262626] overflow-hidden flex flex-col font-mono select-none ${compact ? "p-4 space-y-3" : "p-6 space-y-5"}`}>
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-[#262626] flex items-center justify-center text-emerald-400">
            <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: "20s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-sans">
                Global Threat Arc Map & C2 Defense Radar
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                DEFCON 3 ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans">
              Real-time ballistic attack trajectory tracking, nation-state C2 geolocation, and automated SOAR perimeter drops.
            </p>
          </div>
        </div>

        {/* Filter Pills & Play/Pause */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <div className="flex items-center gap-1 bg-[#050505] p-1 rounded-xl border border-[#262626]">
            {["ALL", "APT29", "Volt Typhoon", "Lazarus", "Sandworm"].map((actor) => (
              <button
                key={actor}
                onClick={() => setSelectedActor(actor)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  selectedActor === actor
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {actor}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl border transition ${
              isPlaying
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-neutral-900 border-[#262626] text-neutral-400 hover:text-white"
            }`}
            title={isPlaying ? "Pause Stream" : "Resume Stream"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG Equirectangular Global Threat Canvas */}
      <div className="relative w-full aspect-[2/1] max-h-[460px] bg-[#030303] rounded-xl border border-[#262626] overflow-hidden flex items-center justify-center">
        {/* SVG World Map Vector with Graticules & Land Contours */}
        <svg viewBox="0 0 1000 500" className="w-full h-full">
          <defs>
            {/* Gradients for ballistic attack arcs */}
            <linearGradient id="arcGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f87171" stopOpacity="1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="arcGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="arcGradPurple" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
            </linearGradient>

            {/* Glowing marker filters */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Latitude & Longitude Grid Lines */}
          <g stroke="#171717" strokeWidth="0.75" strokeDasharray="3,3">
            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
              <line key={`x-${x}`} x1={x} y1={0} x2={x} y2={500} />
            ))}
            {[100, 200, 250, 300, 400].map((y) => (
              <line key={`y-${y}`} x1={0} y1={y} x2={1000} y2={y} />
            ))}
            {/* Equator */}
            <line x1={0} y1={250} x2={1000} y2={250} stroke="#262626" strokeWidth="1" />
          </g>

          {/* Stylized Continent Outlines (Equirectangular Geometries) */}
          <g fill="#0A0A0A" stroke="#262626" strokeWidth="1">
            {/* North America */}
            <path d="M 120 70 L 220 60 L 290 80 L 320 120 L 280 170 L 220 220 L 190 280 L 170 290 L 140 240 L 90 190 L 90 120 Z" />
            {/* South America */}
            <path d="M 270 290 L 340 310 L 370 380 L 340 460 L 290 480 L 270 420 L 250 330 Z" />
            {/* Europe */}
            <path d="M 460 70 L 560 65 L 590 110 L 560 170 L 490 180 L 440 140 L 450 100 Z" />
            {/* Africa */}
            <path d="M 460 190 L 570 190 L 610 260 L 590 380 L 530 440 L 470 360 L 440 260 Z" />
            {/* Asia */}
            <path d="M 580 65 L 850 65 L 880 140 L 840 220 L 760 260 L 680 230 L 620 180 L 600 120 Z" />
            {/* Australia */}
            <path d="M 770 330 L 880 320 L 910 390 L 850 440 L 760 410 Z" />
            {/* Greenland */}
            <path d="M 330 30 L 400 35 L 380 90 L 320 80 Z" />
            {/* Japan */}
            <path d="M 870 160 L 890 180 L 875 220 L 860 180 Z" />
            {/* UK & Ireland */}
            <path d="M 450 110 L 470 115 L 465 140 L 445 130 Z" />
          </g>

          {/* Enterprise VPC Target Datacenters */}
          <g>
            {[
              { name: "US-East AWS (Ashburn)", coords: [39.04, -77.48], label: "US-EAST-VPC" },
              { name: "EU-Central GCP (Frankfurt)", coords: [50.11, 8.68], label: "EU-CENTRAL-K8S" },
              { name: "APAC AWS (Tokyo)", coords: [35.67, 139.65], label: "APAC-CORE" },
              { name: "US-West Azure (Quincy)", coords: [47.23, -119.85], label: "US-WEST-AZURE" },
              { name: "London Edge (Equinix)", coords: [51.50, -0.12], label: "UK-FIN-EDGE" }
            ].map((node, i) => {
              const [cx, cy] = project(node.coords[0], node.coords[1]);
              return (
                <g key={`target-${i}`} className="group cursor-pointer">
                  {/* Target Node Rings */}
                  <circle cx={cx} cy={cy} r="12" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4" className="animate-ping" style={{ animationDuration: "3s" }} />
                  <circle cx={cx} cy={cy} r="6" fill="#052e16" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx={cx} cy={cy} r="2.5" fill="#34d399" />

                  {/* Target Label */}
                  <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    fill="#34d399"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Active Ballistic Attack Arcs */}
          {filteredArcs.map((arc) => {
            const [x1, y1] = project(arc.sourceCoords[0], arc.sourceCoords[1]);
            const [x2, y2] = project(arc.targetCoords[0], arc.targetCoords[1]);

            // Compute bezier curve midpoint lifted upwards based on distance
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const lift = Math.min(120, Math.max(40, dist * 0.28));
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 - lift;

            const pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

            return (
              <g
                key={arc.id}
                className="cursor-pointer"
                onClick={() => setActiveArc(arc)}
              >
                {/* Background Shadow Arc */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="3"
                  opacity="0.2"
                />

                {/* Animated Ballistic Trajectory Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="1.8"
                  strokeDasharray="6,4"
                  className={isPlaying ? "animate-[dash_1.5s_linear_infinite]" : ""}
                  style={{
                    filter: "url(#glow)"
                  }}
                />

                {/* Source C2 Node Marker */}
                <g>
                  <circle cx={x1} cy={y1} r="7" fill={arc.color} opacity="0.3" className="animate-ping" style={{ animationDuration: "2s" }} />
                  <circle cx={x1} cy={y1} r="4.5" fill="#000000" stroke={arc.color} strokeWidth="2" />
                  <circle cx={x1} cy={y1} r="2" fill={arc.color} />
                  <text
                    x={x1}
                    y={y1 + 14}
                    textAnchor="middle"
                    fill="#f3f4f6"
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {arc.sourceCity}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Top Radar Status Overlay */}
        <div className="absolute top-3 left-3 bg-[#000000]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#262626] text-[10px] text-neutral-300 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>BALLISTIC TRAJECTORIES: {filteredArcs.length} ACTIVE ARCS</span>
        </div>

        <div className="absolute top-3 right-3 bg-[#000000]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#262626] text-[10px] text-emerald-400 font-mono flex items-center gap-2">
          <Server className="w-3 h-3 text-emerald-400" />
          <span>VPC FIREWALL: 100% INGRESS MITIGATION</span>
        </div>
      </div>

      {/* Selected Active Arc Inspector Card */}
      {activeArc && (
        <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">ATTRIBUTED THREAT ACTOR</span>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeArc.color }} />
              <span>{activeArc.threatActor}</span>
            </div>
            <span className="text-[10px] text-neutral-400">Origin: {activeArc.sourceCity}, {activeArc.sourceCountry}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">TARGET ASSET & SUBNET</span>
            <div className="text-xs font-bold text-emerald-400">{activeArc.targetCity}</div>
            <span className="text-[10px] text-neutral-400">{activeArc.targetRegion}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">MITRE TTP & PROTOCOL</span>
            <div className="text-xs font-bold text-white">{activeArc.technique}</div>
            <span className="text-[10px] text-neutral-400">{activeArc.protocol}</span>
          </div>

          <div className="space-y-1 flex flex-col justify-end">
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">SOAR DEFENSE ACTION</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {activeArc.status.replace(/_/g, " ")}
              </span>
              <span className="text-[10px] text-neutral-500">{activeArc.timestamp}</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Ballistic Attack Feed Ticker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="uppercase text-[10px] font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            Live Ingress Attack Vector Ticker
          </span>
          <span className="text-[10px] text-neutral-500">
            Total Mitigated Ingress Events: <strong className="text-white">{pulseCount.toLocaleString()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {liveArcTicker.slice(0, 3).map((arc) => (
            <div
              key={arc.id}
              onClick={() => setActiveArc(arc)}
              className="p-2.5 rounded-xl bg-[#030303] border border-[#262626] hover:border-neutral-500 transition cursor-pointer flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5 truncate pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: arc.color }} />
                  <span className="font-bold text-white truncate text-[11px]">{arc.threatActor}</span>
                </div>
                <div className="text-[10px] text-neutral-400 truncate">
                  {arc.sourceCity} ➔ {arc.targetCity.split(" ")[0]}
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-neutral-900 text-emerald-400 border border-[#262626]">
                {arc.status.split("_")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { GlobalThreatMap };
