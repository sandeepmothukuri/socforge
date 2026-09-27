"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Server,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Volume2,
  VolumeX,
  Lock,
  ExternalLink,
  Copy,
  Check,
  X,
  FileCode,
  Sliders,
  Sparkles
} from "lucide-react";

export interface ThreatArc {
  id: string;
  sourceCity: string;
  sourceCountry: string;
  sourceIp: string;
  sourceAsn: string;
  sourceCoords: [number, number]; // [lat, lng]
  targetCity: string;
  targetRegion: string;
  targetVpc: string;
  targetCoords: [number, number]; // [lat, lng]
  threatActor: string;
  technique: string;
  mitreId: string;
  protocol: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "BLOCKED_BY_SOAR" | "WAF_DROP" | "CONTAINED" | "INVESTIGATING";
  color: string;
  timestamp: string;
}

export const INITIAL_THREAT_ARCS: ThreatArc[] = [
  {
    id: "arc-01",
    sourceCity: "Moscow",
    sourceCountry: "RU",
    sourceIp: "185.220.101.45",
    sourceAsn: "AS49210 (RedRelay)",
    sourceCoords: [55.75, 37.61],
    targetCity: "Ashburn (US-East AWS)",
    targetRegion: "AWS VPC Production",
    targetVpc: "vpc-prod-east-01",
    targetCoords: [39.04, -77.48],
    threatActor: "APT29 (Nobelium)",
    technique: "Cloud Token Minting via Compromised Key",
    mitreId: "T1078.004",
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
    sourceIp: "112.90.44.18",
    sourceAsn: "AS4134 (Chinanet)",
    sourceCoords: [31.23, 121.47],
    targetCity: "Frankfurt (EU-Central GCP)",
    targetRegion: "GCP Kubernetes Cluster",
    targetVpc: "gcp-prod-k8s-de",
    targetCoords: [50.11, 8.68],
    threatActor: "Volt Typhoon",
    technique: "Living-Off-The-Land PowerShell Discovery",
    mitreId: "T1059.001",
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
    sourceIp: "175.45.176.8",
    sourceAsn: "AS131279 (Star-KP)",
    sourceCoords: [39.03, 125.76],
    targetCity: "Tokyo (APAC AWS)",
    targetRegion: "Financial Core Engine",
    targetVpc: "aws-fin-core-ap",
    targetCoords: [35.67, 139.65],
    threatActor: "Lazarus Group",
    technique: "Spearphishing Macro Detonation",
    mitreId: "T1566.001",
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
    sourceIp: "194.26.29.112",
    sourceAsn: "AS200019 (FastHost)",
    sourceCoords: [59.93, 30.33],
    targetCity: "London (Financial Edge)",
    targetRegion: "Equinix Edge DC",
    targetVpc: "dc-lon-edge-02",
    targetCoords: [51.50, -0.12],
    threatActor: "Sandworm",
    technique: "Volume Shadow Copy Deletion (Ransomware)",
    mitreId: "T1490",
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
    sourceIp: "89.38.97.104",
    sourceAsn: "AS9009 (M247)",
    sourceCoords: [44.43, 26.10],
    targetCity: "Quincy (US-West Azure)",
    targetRegion: "Azure Storage Pool",
    targetVpc: "az-vnet-store-west",
    targetCoords: [47.23, -119.85],
    threatActor: "FIN7 Syndicate",
    technique: "LSASS Process Memory Dump Attempt",
    mitreId: "T1003.001",
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
    sourceIp: "198.51.100.45",
    sourceAsn: "AS1140 (Tor Relay Node)",
    sourceCoords: [52.36, 4.90],
    targetCity: "Ashburn (US-East AWS)",
    targetRegion: "Auth Proxy Gateway",
    targetVpc: "vpc-prod-east-01",
    targetCoords: [39.04, -77.48],
    threatActor: "Tor Exit Relay 49.12",
    technique: "Password Spraying against Decoy SPN",
    mitreId: "T1110.003",
    protocol: "HTTPS / REST API",
    severity: "HIGH",
    status: "BLOCKED_BY_SOAR",
    color: "#10b981",
    timestamp: "Just now"
  }
];

// Utility: convert lat/lng to SVG coordinates on a 1000x500 canvas
function project(lat: number, lng: number): [number, number] {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return [x, y];
}

export default function GlobalThreatMap({ compact = false }: { compact?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedActor, setSelectedActor] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [activeArc, setActiveArc] = useState<ThreatArc | null>(INITIAL_THREAT_ARCS[0]);
  const [arcs, setArcs] = useState<ThreatArc[]>(INITIAL_THREAT_ARCS);
  const [pulseCount, setPulseCount] = useState(14820);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showUnderseaCables, setShowUnderseaCables] = useState(true);
  const [showRangeRings, setShowRangeRings] = useState(true);
  const [mapToast, setMapToast] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Play synthesized sci-fi audio chirp if sound enabled
  const playAudioChirp = () => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Periodic random pulse to simulate live global events
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + Math.floor(Math.random() * 8) + 3);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Filter arcs
  const filteredArcs = useMemo(() => {
    return arcs.filter((a) => {
      const matchActor = selectedActor === "ALL" || a.threatActor.toLowerCase().includes(selectedActor.toLowerCase());
      const matchSev = selectedSeverity === "ALL" || a.severity === selectedSeverity;
      return matchActor && matchSev;
    });
  }, [selectedActor, selectedSeverity, arcs]);

  // Button: Simulate live inbound attack vector
  const handleSimulateNewAttack = () => {
    const randomActors = [
      { actor: "APT29 (Nobelium)", city: "Moscow", country: "RU", coords: [55.75, 37.61] as [number, number], color: "#ef4444", ttp: "T1078 Valid Account Session Theft" },
      { actor: "Volt Typhoon", city: "Hainan", country: "CN", coords: [20.04, 110.33] as [number, number], color: "#f59e0b", ttp: "T1059.001 LOTL WMI Injection" },
      { actor: "Lazarus Group", city: "Pyongyang", country: "KP", coords: [39.03, 125.76] as [number, number], color: "#a855f7", ttp: "T1566 Spearphishing Link" },
      { actor: "Sandworm", city: "Novosibirsk", country: "RU", coords: [55.03, 82.93] as [number, number], color: "#ef4444", ttp: "T1486 Industrial Controller Disruption" }
    ];

    const pick = randomActors[Math.floor(Math.random() * randomActors.length)];
    const newArc: ThreatArc = {
      id: `arc-${Date.now().toString().slice(-4)}`,
      sourceCity: pick.city,
      sourceCountry: pick.country,
      sourceIp: `185.${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      sourceAsn: `AS${Math.floor(Math.random() * 50000) + 10000} (Bulletproof)`,
      sourceCoords: pick.coords,
      targetCity: "Ashburn (US-East AWS)",
      targetRegion: "AWS VPC Production",
      targetVpc: "vpc-prod-east-01",
      targetCoords: [39.04, -77.48],
      threatActor: pick.actor,
      technique: pick.ttp,
      mitreId: pick.ttp.split(" ")[0],
      protocol: "HTTPS / TLS 1.3",
      severity: "CRITICAL",
      status: "BLOCKED_BY_SOAR",
      color: pick.color,
      timestamp: "Just now"
    };

    setArcs((prev) => [newArc, ...prev.slice(0, 7)]);
    setActiveArc(newArc);
    playAudioChirp();
    setMapToast(`⚡ INGRESS THREAT INJECTED: ${pick.actor} (${pick.city}) ➔ US-East AWS [BLOCKED BY SOAR]`);
    setTimeout(() => setMapToast(null), 4000);
  };

  // Button: Auto-Quarantine C2 Vector
  const handleAutoQuarantine = () => {
    if (!activeArc) return;
    const updated = {
      ...activeArc,
      status: "CONTAINED" as const,
      timestamp: "Just now"
    };
    setActiveArc(updated);
    setArcs(arcs.map((a) => (a.id === updated.id ? updated : a)));
    playAudioChirp();
    setMapToast(`🛡️ SOAR CONTAINMENT DISPATCHED: Quarantined ${activeArc.sourceIp} via Palo Alto & CrowdStrike Falcon.`);
    setTimeout(() => setMapToast(null), 3500);
  };

  // Button: Toggle Audio Klaxon
  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (next) playAudioChirp();
    setMapToast(next ? "Radar Audio Ping: ACTIVATED for incoming ballistic arcs" : "Radar Audio: MUTED");
    setTimeout(() => setMapToast(null), 3000);
  };

  return (
    <div className={`w-full rounded-2xl bg-[#000000] border border-[#262626] overflow-hidden flex flex-col font-mono select-none ${compact ? "p-4 space-y-3" : "p-6 space-y-5"}`}>
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-[#262626] flex items-center justify-center text-emerald-400">
            <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: "24s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                Global Threat Arc Map & C2 Defense Radar
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold font-mono">
                  DEFCON 3 ACTIVE
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans">
              Real-time ballistic attack trajectory tracking, nation-state C2 geolocation, and automated SOAR perimeter drops.
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
          {/* Simulate Ingress Button */}
          <button
            onClick={handleSimulateNewAttack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-md shadow-red-600/20"
            title="Inject simulated high-velocity threat trajectory"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Simulate Ingress</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-xl border transition ${
              audioEnabled
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                : "bg-neutral-900 border-[#262626] text-neutral-400 hover:text-white"
            }`}
            title={audioEnabled ? "Mute Radar Audio" : "Enable Radar Audio Ping"}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Play/Pause */}
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

      {/* Filter Toolbar Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-[#050505] rounded-xl border border-[#262626] text-xs">
        {/* Threat Actor Filter Pills */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-neutral-500 uppercase font-bold mr-1">Actor:</span>
          {["ALL", "APT29", "Volt Typhoon", "Lazarus", "Sandworm", "FIN7"].map((actor) => (
            <button
              key={actor}
              onClick={() => setSelectedActor(actor)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                selectedActor === actor
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              {actor}
            </button>
          ))}
        </div>

        {/* Layer Toggles & Zoom */}
        <div className="flex items-center gap-2">
          {/* Undersea Cables Toggle */}
          <button
            onClick={() => setShowUnderseaCables(!showUnderseaCables)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition ${
              showUnderseaCables
                ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-400 font-bold"
                : "bg-neutral-900 border-[#262626] text-neutral-500"
            }`}
          >
            Fiber Highways {showUnderseaCables ? "ON" : "OFF"}
          </button>

          {/* Range Rings Toggle */}
          <button
            onClick={() => setShowRangeRings(!showRangeRings)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition ${
              showRangeRings
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400 font-bold"
                : "bg-neutral-900 border-[#262626] text-neutral-500"
            }`}
          >
            Radar Rings {showRangeRings ? "ON" : "OFF"}
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 border-l border-[#262626] pl-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-[#262626]"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.1))}
              className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-[#262626]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-[#262626]"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {mapToast && (
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
          <span>{mapToast}</span>
          <button onClick={() => setMapToast(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* SVG Equirectangular Global Threat Canvas */}
      <div className="relative w-full aspect-[2/1] max-h-[480px] bg-[#020202] rounded-xl border border-[#262626] overflow-hidden flex items-center justify-center">
        {/* SVG World Map Vector with Graticules & Land Contours */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
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
          <g stroke="#141414" strokeWidth="0.75" strokeDasharray="3,3">
            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
              <line key={`x-${x}`} x1={x} y1={0} x2={x} y2={500} />
            ))}
            {[100, 200, 250, 300, 400].map((y) => (
              <line key={`y-${y}`} x1={0} y1={y} x2={1000} y2={y} />
            ))}
            {/* Equator & Prime Meridian */}
            <line x1={0} y1={250} x2={1000} y2={250} stroke="#1f1f1f" strokeWidth="1" />
            <line x1={500} y1={0} x2={500} y2={500} stroke="#1f1f1f" strokeWidth="1" />
          </g>

          {/* Detailed Continent Geometry Outlines */}
          <g fill="#070707" stroke="#1f1f1f" strokeWidth="1">
            {/* North America */}
            <path d="M 80 80 L 160 50 L 250 50 L 300 70 L 320 120 L 290 160 L 280 200 L 220 220 L 190 280 L 170 290 L 140 240 L 90 190 L 70 140 Z" />
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

          {/* Undersea Fiber Highways (Global High-Speed Backbone) */}
          {showUnderseaCables && (
            <g stroke="#065f46" strokeWidth="0.8" strokeDasharray="2,4" opacity="0.4">
              {/* Trans-Atlantic Cable (Ashburn <-> London) */}
              <path d="M 285 141 Q 380 110 499 107" fill="none" />
              {/* Trans-Pacific Cable (Ashburn <-> Tokyo) */}
              <path d="M 285 141 Q 120 100 0 120" fill="none" />
              <path d="M 1000 120 Q 940 130 888 151" fill="none" />
              {/* Euro-Asia Cable (Frankfurt <-> Singapore <-> Tokyo) */}
              <path d="M 524 111 Q 680 220 888 151" fill="none" />
            </g>
          )}

          {/* Target Datacenter Hubs */}
          <g>
            {[
              { name: "US-East AWS (Ashburn)", coords: [39.04, -77.48], label: "US-EAST-VPC", ringRadius: 28 },
              { name: "EU-Central GCP (Frankfurt)", coords: [50.11, 8.68], label: "EU-CENTRAL-K8S", ringRadius: 22 },
              { name: "APAC AWS (Tokyo)", coords: [35.67, 139.65], label: "APAC-CORE", ringRadius: 24 },
              { name: "US-West Azure (Quincy)", coords: [47.23, -119.85], label: "US-WEST-AZURE", ringRadius: 20 },
              { name: "London Edge (Equinix)", coords: [51.50, -0.12], label: "UK-FIN-EDGE", ringRadius: 18 }
            ].map((node, i) => {
              const [cx, cy] = project(node.coords[0], node.coords[1]);
              return (
                <g key={`target-${i}`} className="group cursor-pointer">
                  {/* Radar Range Rings */}
                  {showRangeRings && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={node.ringRadius}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                      opacity="0.3"
                    />
                  )}

                  {/* Pulsing Target Rings */}
                  <circle cx={cx} cy={cy} r="10" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4" className="animate-ping" style={{ animationDuration: "3s" }} />
                  <circle cx={cx} cy={cy} r="5" fill="#022c22" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx={cx} cy={cy} r="2" fill="#34d399" />

                  {/* Target Label */}
                  <text
                    x={cx}
                    y={cy - 9}
                    textAnchor="middle"
                    fill="#34d399"
                    fontSize="8.5"
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
            const lift = Math.min(130, Math.max(45, dist * 0.28));
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 - lift;

            const pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
            const isSelected = activeArc?.id === arc.id;

            return (
              <g
                key={arc.id}
                className="cursor-pointer group"
                onClick={() => {
                  setActiveArc(arc);
                  playAudioChirp();
                }}
              >
                {/* Background Shadow Arc */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={isSelected ? "4" : "2.5"}
                  opacity={isSelected ? "0.35" : "0.15"}
                />

                {/* Animated Ballistic Trajectory Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={isSelected ? "2.2" : "1.6"}
                  strokeDasharray="6,4"
                  className={isPlaying ? "animate-[dash_1.5s_linear_infinite]" : ""}
                  style={{ filter: "url(#glow)" }}
                />

                {/* Source C2 Node Marker */}
                <g>
                  <circle cx={x1} cy={y1} r="7" fill={arc.color} opacity="0.3" className="animate-ping" style={{ animationDuration: "2s" }} />
                  <circle cx={x1} cy={y1} r="4" fill="#000000" stroke={arc.color} strokeWidth="1.8" />
                  <circle cx={x1} cy={y1} r="1.8" fill={arc.color} />
                  <text
                    x={x1}
                    y={y1 + 13}
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
        <div className="absolute top-3 left-3 bg-[#000000]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#262626] text-[10px] text-neutral-300 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>BALLISTIC TRAJECTORIES: {filteredArcs.length} ACTIVE ARCS</span>
        </div>

        <div className="absolute top-3 right-3 bg-[#000000]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#262626] text-[10px] text-emerald-400 font-mono flex items-center gap-2">
          <Server className="w-3 h-3 text-emerald-400" />
          <span>VPC FIREWALL: 100% INGRESS MITIGATION</span>
        </div>
      </div>

      {/* Selected Active Arc Inspector Card with Action Buttons */}
      {activeArc && (
        <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">ATTRIBUTED THREAT ACTOR</span>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeArc.color }} />
                <span>{activeArc.threatActor}</span>
              </div>
              <span className="text-[10px] text-neutral-400">
                Origin: {activeArc.sourceCity}, {activeArc.sourceCountry} ({activeArc.sourceIp})
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">TARGET ASSET & VPC</span>
              <div className="text-xs font-bold text-emerald-400">{activeArc.targetCity}</div>
              <span className="text-[10px] text-neutral-400">{activeArc.targetRegion} ({activeArc.targetVpc})</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">MITRE TTP & DEFENSE ACTION</span>
              <div className="text-xs font-bold text-white">{activeArc.technique}</div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeArc.status.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-neutral-500">{activeArc.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-[#262626] pt-3 md:pt-0 md:pl-4">
            <button
              onClick={handleAutoQuarantine}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Lock className="w-3 h-3" />
              <span>Quarantine C2</span>
            </button>

            <button
              onClick={() => setDetailModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#262626] text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileCode className="w-3 h-3 text-emerald-400" />
              <span>C2 Telemetry</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Ballistic Attack Feed Ticker with Clickable Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="uppercase text-[10px] font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            Live Ingress Attack Vector Ticker (Click to Inspect & Quarantine):
          </span>
          <span className="text-[10px] text-neutral-500">
            Total Mitigated Ingress Events: <strong className="text-white">{pulseCount.toLocaleString()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {filteredArcs.slice(0, 3).map((arc) => (
            <div
              key={arc.id}
              onClick={() => {
                setActiveArc(arc);
                playAudioChirp();
              }}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                activeArc?.id === arc.id
                  ? "bg-[#080808] border-white ring-1 ring-white/20"
                  : "bg-[#030303] border-[#262626] hover:border-neutral-500"
              }`}
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

      {/* ── C2 TELEMETRY DOSSIER MODAL ────────────────────────────────────── */}
      {detailModalOpen && activeArc && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-[#050505] border border-[#262626] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  C2 Observable Telemetry Dossier: {activeArc.threatActor}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-[#000000] border border-[#262626]">
                  <span className="text-neutral-500 block text-[9px]">SOURCE IP & ASN</span>
                  <span className="text-white font-bold">{activeArc.sourceIp}</span>
                  <span className="text-[9px] text-neutral-400 block">{activeArc.sourceAsn}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#000000] border border-[#262626]">
                  <span className="text-neutral-500 block text-[9px]">TARGET VPC & REGION</span>
                  <span className="text-emerald-400 font-bold">{activeArc.targetVpc}</span>
                  <span className="text-[9px] text-neutral-400 block">{activeArc.targetRegion}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#000000] border border-[#262626] space-y-1 text-emerald-400 text-[11px]">
                <div className="text-neutral-500 text-[9px] uppercase font-bold">Raw Telemetry Packet (JSON):</div>
                <pre className="overflow-x-auto leading-relaxed">
{JSON.stringify({
  event_time: new Date().toISOString(),
  origin_ip: activeArc.sourceIp,
  asn: activeArc.sourceAsn,
  actor: activeArc.threatActor,
  mitre_technique: activeArc.mitreId,
  target_vpc: activeArc.targetVpc,
  mitigation: activeArc.status,
  soar_action: "ISOLATE_HOST_AND_DROP_IP"
}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262626] font-mono text-xs">
              <span className="text-[10px] text-neutral-500">Status: {activeArc.status}</span>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { GlobalThreatMap };
