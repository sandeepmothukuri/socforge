"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Globe,
  Radio,
  Play,
  Pause,
  Flame,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Volume2,
  VolumeX,
  Lock,
  Copy,
  Check,
  X,
  FileCode,
  ShieldCheck,
  Server,
  Crosshair,
  Sliders,
  Sparkles,
  Maximize2
} from "lucide-react";
import worldMapData from "./worldMapData.json";

export interface ThreatArc {
  id: string;
  sourceCity: string;
  sourceCountry: string;
  sourceCode: string;
  sourceIp: string;
  sourceAsn: string;
  sourceCoords: [number, number]; // [lat, lng]
  targetCity: string;
  targetRegion: string;
  targetVpc: string;
  targetCode: string;
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
    sourceCode: "SVO",
    sourceIp: "185.220.101.45",
    sourceAsn: "AS49210 (RedRelay)",
    sourceCoords: [55.75, 37.62],
    targetCity: "Ashburn",
    targetRegion: "AWS US-East",
    targetVpc: "vpc-prod-east-01",
    targetCode: "IAD",
    targetCoords: [39.04, -77.48],
    threatActor: "APT29 (Nobelium)",
    technique: "OAuth Token Forgery via Azure Service Principal",
    mitreId: "T1078.004",
    protocol: "HTTPS / TLS 1.3",
    severity: "CRITICAL",
    status: "BLOCKED_BY_SOAR",
    color: "#f43f5e", // Rose/Crimson
    timestamp: "12s ago"
  },
  {
    id: "arc-02",
    sourceCity: "Shanghai",
    sourceCountry: "CN",
    sourceCode: "PVG",
    sourceIp: "112.90.44.18",
    sourceAsn: "AS4134 (Chinanet)",
    sourceCoords: [31.23, 121.47],
    targetCity: "Frankfurt",
    targetRegion: "GCP EU-Central",
    targetVpc: "gcp-prod-k8s-de",
    targetCode: "FRA",
    targetCoords: [50.11, 8.68],
    threatActor: "Volt Typhoon",
    technique: "Living-Off-The-Land PowerShell Discovery",
    mitreId: "T1059.001",
    protocol: "SSH / Port 2222",
    severity: "CRITICAL",
    status: "CONTAINED",
    color: "#f59e0b", // Amber
    timestamp: "45s ago"
  },
  {
    id: "arc-03",
    sourceCity: "Pyongyang",
    sourceCountry: "KP",
    sourceCode: "FNJ",
    sourceIp: "175.45.176.8",
    sourceAsn: "AS131279 (Star-KP)",
    sourceCoords: [39.03, 125.75],
    targetCity: "Tokyo",
    targetRegion: "AWS APAC-Core",
    targetVpc: "aws-fin-core-ap",
    targetCode: "NRT",
    targetCoords: [35.68, 139.69],
    threatActor: "Lazarus Group",
    technique: "Encrypted C2 Beacon over WebSockets",
    mitreId: "T1071.001",
    protocol: "WSS / Port 443",
    severity: "CRITICAL",
    status: "BLOCKED_BY_SOAR",
    color: "#d946ef", // Fuchsia
    timestamp: "1m ago"
  },
  {
    id: "arc-04",
    sourceCity: "St. Petersburg",
    sourceCountry: "RU",
    sourceCode: "LED",
    sourceIp: "194.26.29.112",
    sourceAsn: "AS48282 (Selectel)",
    sourceCoords: [59.93, 30.33],
    targetCity: "Quincy",
    targetRegion: "Azure US-West",
    targetVpc: "az-uswest-sec01",
    targetCode: "SEA",
    targetCoords: [47.23, -119.85],
    threatActor: "Sandworm Team",
    technique: "VPN Perimeter Credential Stuffing",
    mitreId: "T1110.003",
    protocol: "IPsec / IKEv2",
    severity: "HIGH",
    status: "WAF_DROP",
    color: "#38bdf8", // Sky Blue
    timestamp: "2m ago"
  },
  {
    id: "arc-05",
    sourceCity: "Bucharest",
    sourceCountry: "RO",
    sourceCode: "OTP",
    sourceIp: "91.240.118.66",
    sourceAsn: "AS200019 (HostSailor)",
    sourceCoords: [44.43, 26.10],
    targetCity: "London",
    targetRegion: "Equinix UK-Edge",
    targetVpc: "ld4-edge-uk",
    targetCode: "LHR",
    targetCoords: [51.51, -0.13],
    threatActor: "FIN7 (Carbanak)",
    technique: "Automated MFA Push Fatigue Spray",
    mitreId: "T1621",
    protocol: "RADIUS / OAuth2",
    severity: "HIGH",
    status: "BLOCKED_BY_SOAR",
    color: "#10b981", // Emerald
    timestamp: "3m ago"
  },
  {
    id: "arc-06",
    sourceCity: "Tehran",
    sourceCountry: "IR",
    sourceCode: "IKA",
    sourceIp: "185.143.232.19",
    sourceAsn: "AS44244 (Irancell)",
    sourceCoords: [35.69, 51.39],
    targetCity: "Singapore",
    targetRegion: "GCP APAC-South",
    targetVpc: "gcp-apac-sg-01",
    targetCode: "SIN",
    targetCoords: [1.35, 103.82],
    threatActor: "Charming Kitten",
    technique: "Spearphishing OAuth Delegated Token Theft",
    mitreId: "T1528",
    protocol: "HTTPS / REST API",
    severity: "HIGH",
    status: "BLOCKED_BY_SOAR",
    color: "#a855f7", // Purple
    timestamp: "4m ago"
  }
];

// Target Protected Data Centers / VPC Hubs with Precision Crosshair Points
export const DEFENSE_DATACENTERS = [
  { name: "Ashburn", label: "US-EAST-VPC", code: "IAD", provider: "AWS", coords: [39.04, -77.48], vpcId: "vpc-prod-east-01" },
  { name: "Quincy", label: "US-WEST-AZURE", code: "SEA", provider: "Azure", coords: [47.23, -119.85], vpcId: "az-uswest-sec01" },
  { name: "London", label: "UK-FIN-EDGE", code: "LHR", provider: "Equinix", coords: [51.51, -0.13], vpcId: "ld4-edge-uk" },
  { name: "Frankfurt", label: "EU-CENTRAL-K8S", code: "FRA", provider: "GCP", coords: [50.11, 8.68], vpcId: "gcp-prod-k8s-de" },
  { name: "Tokyo", label: "APAC-CORE", code: "NRT", provider: "AWS", coords: [35.68, 139.69], vpcId: "aws-fin-core-ap" },
  { name: "Singapore", label: "APAC-SOUTH", code: "SIN", provider: "GCP", coords: [1.35, 103.82], vpcId: "gcp-apac-sg-01" }
];

// Mathematical Equirectangular Projection: maps [lat, lng] to 1000x500 coordinates
export function projectCoordinates(lat: number, lng: number): [number, number] {
  const x = 500 + (lng * 1000) / 360;
  const y = 250 - (lat * 500) / 180;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

// Generate Parabolic Quad Bezier path for thin marked attack trajectory
function getTrajectoryPath(source: [number, number], target: [number, number]) {
  const [x1, y1] = source;
  const [x2, y2] = target;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const arcHeight = Math.max(35, Math.min(130, dist * 0.3));
  const cx = midX;
  const cy = midY - arcHeight;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

interface GlobalThreatMapProps {
  className?: string;
  compact?: boolean;
  onSelectThreat?: (arc: ThreatArc) => void;
}

export default function GlobalThreatMap({ className = "", compact = false, onSelectThreat }: GlobalThreatMapProps) {
  const [arcs, setArcs] = useState<ThreatArc[]>(INITIAL_THREAT_ARCS);
  const [selectedArc, setSelectedArc] = useState<ThreatArc>(INITIAL_THREAT_ARCS[0]);
  const [selectedActor, setSelectedActor] = useState<string>("ALL");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [copiedIoc, setCopiedIoc] = useState<boolean>(false);
  const [quarantinedIps, setQuarantinedIps] = useState<string[]>([]);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Map Visual Style: "matrix" (Cyber Dots), "hairline" (Thin Vector Outline), "hybrid" (Both)
  const [mapStyle, setMapStyle] = useState<"matrix" | "hairline" | "hybrid">("matrix");
  // Line Style: "marked" (Thin dashed marks), "laser" (Thin solid laser)
  const [lineStyle, setLineStyle] = useState<"marked" | "laser">("marked");

  // Layers
  const [showGraticule, setShowGraticule] = useState<boolean>(true);
  const [showFiberNetwork, setShowFiberNetwork] = useState<boolean>(true);
  const [showTargetCrosshairs, setShowTargetCrosshairs] = useState<boolean>(true);

  // ViewBox Zoom & Pan
  const [viewBox, setViewBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 1000,
    h: 500
  });

  // Synthesized Tactical Audio Radar Ping (Web Audio API)
  const audioContextRef = useRef<AudioContext | null>(null);
  const playRadarPing = () => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback suppression
    }
  };

  // Periodic Live Threat Stream
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const candidates = [
        { city: "Shenzhen", country: "CN", code: "SZX", ip: "183.14.30.99", asn: "AS4134", coords: [22.54, 114.05], actor: "Volt Typhoon", tech: "WMI Command Obfuscation", mitre: "T1047", color: "#f59e0b" },
        { city: "Khabarovsk", country: "RU", code: "KHV", ip: "92.38.150.12", asn: "AS12389", coords: [48.48, 135.07], actor: "APT29 (Nobelium)", tech: "Kerberos TGT Golden Ticket Request", mitre: "T1558.001", color: "#f43f5e" },
        { city: "Hanoi", country: "VN", code: "HAN", ip: "118.70.180.45", asn: "AS7552", coords: [21.02, 105.83], actor: "OceanLotus", tech: "In-Memory Shellcode Injection", mitre: "T1055.002", color: "#10b981" },
        { city: "Kazan", country: "RU", code: "KZN", ip: "178.208.76.10", asn: "AS31133", coords: [55.79, 49.12], actor: "Sandworm Team", tech: "OT SCADA Modbus Remote Command", mitre: "T0855", color: "#38bdf8" }
      ];
      const targetList = DEFENSE_DATACENTERS;
      const pickSource = candidates[Math.floor(Math.random() * candidates.length)];
      const pickTarget = targetList[Math.floor(Math.random() * targetList.length)];

      const newArc: ThreatArc = {
        id: `arc-${Date.now().toString().slice(-4)}`,
        sourceCity: pickSource.city,
        sourceCountry: pickSource.country,
        sourceCode: pickSource.code,
        sourceIp: pickSource.ip,
        sourceAsn: pickSource.asn,
        sourceCoords: pickSource.coords as [number, number],
        targetCity: pickTarget.name,
        targetRegion: pickTarget.provider + " " + pickTarget.label,
        targetVpc: pickTarget.vpcId,
        targetCode: pickTarget.code,
        targetCoords: pickTarget.coords as [number, number],
        threatActor: pickSource.actor,
        technique: pickSource.tech,
        mitreId: pickSource.mitre,
        protocol: "TLS 1.3 / Ingress Drop",
        severity: "CRITICAL",
        status: "BLOCKED_BY_SOAR",
        color: pickSource.color,
        timestamp: "just now"
      };

      setArcs((prev) => [newArc, ...prev.slice(0, 7)]);
      playRadarPing();
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, audioEnabled]);

  // Filter Arcs
  const filteredArcs = useMemo(() => {
    if (selectedActor === "ALL") return arcs;
    return arcs.filter((a) => a.threatActor.toLowerCase().includes(selectedActor.toLowerCase()));
  }, [arcs, selectedActor]);

  // Zoom Handlers
  const handleZoom = (dir: "in" | "out" | "reset") => {
    if (dir === "reset") {
      setViewBox({ x: 0, y: 0, w: 1000, h: 500 });
      return;
    }
    const factor = dir === "in" ? 0.75 : 1.33;
    const newW = Math.max(280, Math.min(1000, viewBox.w * factor));
    const newH = Math.max(140, Math.min(500, viewBox.h * factor));
    const newX = Math.max(0, Math.min(1000 - newW, viewBox.x + (viewBox.w - newW) / 2));
    const newY = Math.max(0, Math.min(500 - newH, viewBox.y + (viewBox.h - newH) / 2));
    setViewBox({ x: newX, y: newY, w: newW, h: newH });
  };

  // Region Preset Jump
  const handleRegionPreset = (region: "global" | "na" | "eu" | "apac") => {
    switch (region) {
      case "global":
        setViewBox({ x: 0, y: 0, w: 1000, h: 500 });
        break;
      case "na":
        setViewBox({ x: 140, y: 40, w: 380, h: 240 });
        break;
      case "eu":
        setViewBox({ x: 440, y: 40, w: 290, h: 200 });
        break;
      case "apac":
        setViewBox({ x: 670, y: 60, w: 330, h: 250 });
        break;
    }
  };

  // Simulate Ingress Action
  const handleSimulateNewAttack = () => {
    const randomTarget = DEFENSE_DATACENTERS[Math.floor(Math.random() * DEFENSE_DATACENTERS.length)];
    const simArc: ThreatArc = {
      id: `sim-${Date.now().toString().slice(-4)}`,
      sourceCity: "St. Petersburg",
      sourceCountry: "RU",
      sourceCode: "LED",
      sourceIp: "194.26.29.98",
      sourceAsn: "AS48282 (Selectel)",
      sourceCoords: [59.93, 30.33],
      targetCity: randomTarget.name,
      targetRegion: randomTarget.label,
      targetVpc: randomTarget.vpcId,
      targetCode: randomTarget.code,
      targetCoords: randomTarget.coords as [number, number],
      threatActor: "Sandworm Team",
      technique: "Zero-Day Ingress VPN Tunnel Probe",
      mitreId: "T1133",
      protocol: "UDP / WireGuard 51820",
      severity: "CRITICAL",
      status: "BLOCKED_BY_SOAR",
      color: "#f43f5e",
      timestamp: "just now"
    };

    setArcs((prev) => [simArc, ...prev.slice(0, 7)]);
    setSelectedArc(simArc);
    playRadarPing();

    setToastMessage(`[SOAR PERIMETER MITIGATION] Intercepted threat trajectory from [${simArc.sourceCode}] ${simArc.sourceCity} -> [${randomTarget.code}] ${randomTarget.label}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quarantine Action
  const handleQuarantineC2 = () => {
    if (!quarantinedIps.includes(selectedArc.sourceIp)) {
      setQuarantinedIps((prev) => [...prev, selectedArc.sourceIp]);
      setToastMessage(`[EDGE FIREWALL DROP] Quarantined C2 Host ${selectedArc.sourceIp} across all perimeter edge points.`);
    } else {
      setToastMessage(`[ACTIVE RULE] IP ${selectedArc.sourceIp} is already in edge blacklist.`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyIoc = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(selectedArc.sourceIp);
      setCopiedIoc(true);
      setTimeout(() => setCopiedIoc(false), 2000);
    }
  };

  return (
    <div className={`flex flex-col bg-[#020408] border border-[#172033] rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-[#041a14] border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs flex items-center justify-between font-mono animate-fadeIn z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Clean Minimalist Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-5 py-3 border-b border-[#172033] bg-[#030712]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-400">
            <Globe className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xs font-bold text-white tracking-widest uppercase font-mono">
                GLOBAL THREAT RADAR & C2 PERIMETER ARCS
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                DEFCON 3
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                100% INGRESS DROPPED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Live vector telemetry • Thin marked trajectories • Precision datacenter shields
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Map Display Mode: Matrix / Hairline / Hybrid */}
          <div className="flex items-center rounded-lg bg-[#070d19] border border-[#1e293b] p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setMapStyle("matrix")}
              className={`px-2 py-1 rounded transition ${mapStyle === "matrix" ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40" : "text-slate-400 hover:text-white"}`}
              title="Clean Cyber Dot Matrix Cartography"
            >
              Dot Matrix
            </button>
            <button
              onClick={() => setMapStyle("hairline")}
              className={`px-2 py-1 rounded transition ${mapStyle === "hairline" ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40" : "text-slate-400 hover:text-white"}`}
              title="Razor-thin Hairline Wireframe Coastlines"
            >
              Hairline
            </button>
            <button
              onClick={() => setMapStyle("hybrid")}
              className={`px-2 py-1 rounded transition ${mapStyle === "hybrid" ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40" : "text-slate-400 hover:text-white"}`}
              title="Hybrid Matrix & Hairline Cartography"
            >
              Hybrid
            </button>
          </div>

          {/* Line Style Toggle: Marked Dash vs Thin Laser */}
          <button
            onClick={() => setLineStyle(lineStyle === "marked" ? "laser" : "marked")}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono transition ${
              lineStyle === "marked"
                ? "bg-slate-900 border-cyan-500/40 text-cyan-300"
                : "bg-slate-900 border-[#1e293b] text-slate-400 hover:text-white"
            }`}
            title="Toggle between Marked Dashes and Thin Laser lines"
          >
            Line: {lineStyle === "marked" ? "Marked Dashes" : "Thin Laser"}
          </button>

          {/* Simulate Threat Button */}
          <button
            onClick={handleSimulateNewAttack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition shadow-sm active:scale-95"
            title="Inject simulated ballistic vector"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulate</span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-1.5 rounded-lg border transition ${
              audioEnabled
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-[#070d19] border-[#1e293b] text-slate-400 hover:text-white"
            }`}
            title={audioEnabled ? "Mute Radar Ping" : "Enable Radar Ping Audio"}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Pause / Resume Stream */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-lg border transition ${
              isPlaying
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-[#070d19] border-[#1e293b] text-slate-400 hover:text-white"
            }`}
            title={isPlaying ? "Pause Feed" : "Resume Feed"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Sub-bar: Threat Actor Filter Strip & Precision Theater Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-2 bg-[#010206] border-b border-[#172033] text-xs">
        {/* Threat Actor Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-slate-500 uppercase font-mono font-bold mr-1 flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-cyan-400" /> ACTOR:
          </span>
          {["ALL", "APT29", "Volt Typhoon", "Lazarus", "Sandworm", "FIN7"].map((actor) => (
            <button
              key={actor}
              onClick={() => setSelectedActor(actor)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                selectedActor === actor
                  ? "bg-cyan-500 text-black font-bold shadow-sm"
                  : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-900 border border-[#1e293b]"
              }`}
            >
              {actor}
            </button>
          ))}
        </div>

        {/* Region Jumps & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Theater Presets */}
          <div className="flex items-center rounded bg-[#070d19] border border-[#1e293b] p-0.5 text-[10px] font-mono">
            <button
              onClick={() => handleRegionPreset("global")}
              className={`px-2 py-0.5 rounded transition ${viewBox.w === 1000 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              GLOBAL
            </button>
            <button
              onClick={() => handleRegionPreset("na")}
              className={`px-2 py-0.5 rounded transition ${viewBox.x === 140 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              AMER
            </button>
            <button
              onClick={() => handleRegionPreset("eu")}
              className={`px-2 py-0.5 rounded transition ${viewBox.x === 440 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              EMEA
            </button>
            <button
              onClick={() => handleRegionPreset("apac")}
              className={`px-2 py-0.5 rounded transition ${viewBox.x === 670 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              APAC
            </button>
          </div>

          {/* Undersea Fiber Highway Toggle */}
          <button
            onClick={() => setShowFiberNetwork(!showFiberNetwork)}
            className={`px-2 py-0.5 rounded border text-[10px] font-mono transition ${
              showFiberNetwork
                ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 font-bold"
                : "bg-transparent border-[#1e293b] text-slate-500 hover:text-slate-300"
            }`}
          >
            FIBER {showFiberNetwork ? "ON" : "OFF"}
          </button>

          {/* Zoom In / Out / Reset */}
          <div className="flex items-center rounded bg-[#070d19] border border-[#1e293b] p-0.5">
            <button
              onClick={() => handleZoom("in")}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom("reset")}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas (Crisp Dot Matrix + Thin Marked Lines) */}
      <div className="relative w-full aspect-[2/1] min-h-[380px] bg-[#010307] overflow-hidden select-none">
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full h-full block"
          style={{ transition: "viewBox 0.35s ease-out" }}
        >
          <defs>
            {/* Subtle Gradient Arcs */}
            {arcs.map((arc) => {
              const [x1] = projectCoordinates(arc.sourceCoords[0], arc.sourceCoords[1]);
              const [x2] = projectCoordinates(arc.targetCoords[0], arc.targetCoords[1]);
              return (
                <linearGradient
                  key={`grad-${arc.id}`}
                  id={`grad-${arc.id}`}
                  x1={x1 < x2 ? "0%" : "100%"}
                  y1="0%"
                  x2={x1 < x2 ? "100%" : "0%"}
                  y2="100%"
                >
                  <stop offset="0%" stopColor={arc.color} stopOpacity="0.9" />
                  <stop offset="80%" stopColor={arc.color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Latitude & Longitude Coordinate Hairlines (30-Degree Grid) */}
          {showGraticule && (
            <g stroke="#0f192b" strokeWidth="0.5" strokeDasharray="2,5">
              <path d={worldMapData.graticulePath} fill="none" />
              {/* Equator and Prime Meridian Solid Hairline */}
              <line x1="0" y1="250" x2="1000" y2="250" stroke="#13233c" strokeWidth="0.75" />
              <line x1="500" y1="0" x2="500" y2="500" stroke="#13233c" strokeWidth="0.75" />
            </g>
          )}

          {/* Latitude / Longitude Labels along Borders */}
          <g fill="#24344d" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
            <text x="167" y="12">-120°</text>
            <text x="333" y="12">-60°</text>
            <text x="500" y="12">0° (GMT)</text>
            <text x="667" y="12">+60°</text>
            <text x="833" y="12">+120°</text>
            <text x="985" y="85">+60°N</text>
            <text x="985" y="167">+30°N</text>
            <text x="985" y="253">0° (EQ)</text>
            <text x="985" y="333">-30°S</text>
            <text x="985" y="415">-60°S</text>
          </g>

          {/* Undersea Fiber Highways (Global Backbone) */}
          {showFiberNetwork && (
            <g stroke="#0284c7" strokeWidth="0.6" strokeDasharray="3,6" opacity="0.35" fill="none">
              {/* Ashburn <-> London <-> Frankfurt */}
              <path d="M 284.78 141.56 Q 390 110 499.64 106.92" />
              <path d="M 499.64 106.92 L 524.11 110.81" />
              {/* Ashburn <-> Quincy <-> Tokyo */}
              <path d="M 284.78 141.56 L 167.08 118.81" />
              <path d="M 167.08 118.81 Q 80 110 0 130" />
              <path d="M 1000 130 Q 940 140 888.03 150.89" />
              {/* Frankfurt <-> Singapore <-> Tokyo */}
              <path d="M 524.11 110.81 Q 650 180 788.39 246.25" />
              <path d="M 788.39 246.25 Q 840 200 888.03 150.89" />
              {/* Trans-Atlantic South (Ashburn <-> São Paulo) */}
              <path d="M 284.78 141.56 Q 300 230 370 310" />
            </g>
          )}

          {/* MODE 1: Hairline Vector Coastline */}
          {(mapStyle === "hairline" || mapStyle === "hybrid") && (
            <path
              d={worldMapData.landPath}
              fill={mapStyle === "hybrid" ? "#060c1840" : "#040812"}
              stroke="#1b2a40"
              strokeWidth="0.65"
            />
          )}

          {/* MODE 2: Clean Dot Matrix Grid (1,724 Cyber Points) */}
          {(mapStyle === "matrix" || mapStyle === "hybrid") && (
            <g>
              {(worldMapData.dots as [number, number][]).map((pt, i) => (
                <circle
                  key={`dot-${i}`}
                  cx={pt[0]}
                  cy={pt[1]}
                  r="1.0"
                  fill="#152438"
                  opacity="0.8"
                />
              ))}
            </g>
          )}

          {/* Target Protected Data Centers Hubs (Clean Precision Crosshairs) */}
          <g>
            {DEFENSE_DATACENTERS.map((hub, i) => {
              const [cx, cy] = projectCoordinates(hub.coords[0], hub.coords[1]);
              const isSelected = selectedArc?.targetCoords[0] === hub.coords[0];
              return (
                <g
                  key={`hub-${i}`}
                  className="cursor-pointer group"
                  onClick={() => {
                    const match = arcs.find((a) => a.targetCoords[0] === hub.coords[0]);
                    if (match) {
                      setSelectedArc(match);
                      if (onSelectThreat) onSelectThreat(match);
                    }
                  }}
                >
                  {/* Fine Crosshairs (Precision Reticle) */}
                  <line x1={cx - 7} y1={cy} x2={cx + 7} y2={cy} stroke="#10b981" strokeWidth="0.6" opacity="0.6" />
                  <line x1={cx} y1={cy - 7} x2={cx} y2={cy + 7} stroke="#10b981" strokeWidth="0.6" opacity="0.6" />

                  {/* Concentric Precision Rings */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? "4.5" : "3.5"}
                    fill="#052e16"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <circle cx={cx} cy={cy} r="1.5" fill="#34d399" />

                  {/* Clean Monospace Node Badge */}
                  <g transform={`translate(${cx}, ${cy - 10})`}>
                    <rect
                      x="-30"
                      y="-9"
                      width="60"
                      height="11"
                      rx="2"
                      fill="#020408"
                      stroke={isSelected ? "#10b981" : "#1a2a40"}
                      strokeWidth="0.7"
                    />
                    <text
                      x="0"
                      y="-1"
                      textAnchor="middle"
                      fill={isSelected ? "#34d399" : "#6ee7b7"}
                      fontSize="6.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      [{hub.code}] {hub.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Threat Origin Nodes (Thin Marked Reticles) */}
          <g>
            {filteredArcs.map((arc) => {
              const [sx, sy] = projectCoordinates(arc.sourceCoords[0], arc.sourceCoords[1]);
              const isSelected = selectedArc?.id === arc.id;
              return (
                <g
                  key={`source-${arc.id}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedArc(arc);
                    if (onSelectThreat) onSelectThreat(arc);
                  }}
                >
                  {/* Origin Crosshair */}
                  <line x1={sx - 5} y1={sy} x2={sx + 5} y2={sy} stroke={arc.color} strokeWidth="0.6" opacity="0.7" />
                  <line x1={sx} y1={sy - 5} x2={sx} y2={sy + 5} stroke={arc.color} strokeWidth="0.6" opacity="0.7" />

                  {/* Ping Ring */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isSelected ? "9" : "6"}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth="0.6"
                    className="animate-ping"
                    opacity="0.5"
                  />
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isSelected ? "3.5" : "2.5"}
                    fill={arc.color}
                  />
                  <circle cx={sx} cy={sy} r="1" fill="#ffffff" />

                  {/* Clean Monospace City Code Callout */}
                  <text
                    x={sx}
                    y={sy + 10}
                    textAnchor="middle"
                    fill={isSelected ? "#ffffff" : "#94a3b8"}
                    fontSize="6.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    [{arc.sourceCode}] {arc.sourceCity}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Ballistic Threat Trajectory Arcs — THIN MARKED LINES */}
          <g>
            {filteredArcs.map((arc) => {
              const sourcePt = projectCoordinates(arc.sourceCoords[0], arc.sourceCoords[1]);
              const targetPt = projectCoordinates(arc.targetCoords[0], arc.targetCoords[1]);
              const d = getTrajectoryPath(sourcePt, targetPt);
              const isSelected = selectedArc?.id === arc.id;
              const hasActiveSelection = Boolean(selectedArc);

              // Thin marked lines logic
              const strokeWidth = isSelected ? "1.4" : "0.85";
              const strokeOpacity = isSelected ? "1" : hasActiveSelection ? "0.35" : "0.65";
              const strokeDash = lineStyle === "marked"
                ? (isSelected ? "5,3" : "3,3")
                : (isSelected ? "none" : "none");

              return (
                <g
                  key={`arc-${arc.id}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedArc(arc);
                    if (onSelectThreat) onSelectThreat(arc);
                  }}
                >
                  {/* Subtle Hairline Glow for Selected Arc Only */}
                  {isSelected && (
                    <path
                      d={d}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth="2.8"
                      opacity="0.25"
                    />
                  )}

                  {/* Core Thin Marked Trajectory Line */}
                  <path
                    d={d}
                    fill="none"
                    stroke={isSelected ? arc.color : `url(#grad-${arc.id})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDash}
                    opacity={strokeOpacity}
                  />

                  {/* Precise Traveling Spark / Pulse Photon */}
                  {isPlaying && (
                    <circle r={isSelected ? "1.8" : "1.3"} fill="#ffffff">
                      <animateMotion
                        path={d}
                        dur={arc.severity === "CRITICAL" ? "2.6s" : "3.6s"}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Clean Bottom HUD Metrics Watermark */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-3 bg-[#030610]/90 backdrop-blur-md px-3 py-1 rounded border border-[#1b263b] text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>ACTIVE VECTORS:</span>
            <span className="text-white font-bold">{filteredArcs.length}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Crosshair className="w-3 h-3 text-emerald-400" />
            <span>CONTAINMENT:</span>
            <span className="text-emerald-400 font-bold">100% INGRESS MITIGATION</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span>GRID:</span>
            <span className="text-cyan-300 font-bold">{mapStyle.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Selected Threat Actor & Telemetry Inspection Card */}
      {selectedArc && (
        <div className="px-5 py-3.5 border-t border-[#172033] bg-[#02050c] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            {/* Threat Origin & Actor */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                THREAT ORIGIN & ACTOR
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedArc.color }} />
                <h4 className="text-xs font-bold text-white font-mono">{selectedArc.threatActor}</h4>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                [{selectedArc.sourceCode}] {selectedArc.sourceCity}, {selectedArc.sourceCountry} •{" "}
                <span className="text-cyan-400">{selectedArc.sourceIp}</span>
              </p>
            </div>

            {/* Target Datacenter Asset */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                TARGET DATACENTER & VPC
              </span>
              <div className="flex items-center gap-1.5">
                <Server className="w-3 h-3 text-emerald-400" />
                <h4 className="text-xs font-bold text-emerald-300 font-mono">
                  [{selectedArc.targetCode}] {selectedArc.targetCity}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {selectedArc.targetRegion} • <span className="text-slate-200">{selectedArc.targetVpc}</span>
              </p>
            </div>

            {/* MITRE ATT&CK & Defense Action */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                MITRE TTP & DEFENSE ACTION
              </span>
              <p className="text-[11px] text-slate-300 font-mono truncate">{selectedArc.technique}</p>
              <div className="flex items-center gap-2 pt-0.5 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  {selectedArc.status.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-slate-500">{selectedArc.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleQuarantineC2}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                quarantinedIps.includes(selectedArc.sourceIp)
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{quarantinedIps.includes(selectedArc.sourceIp) ? "Quarantined" : "Quarantine C2"}</span>
            </button>

            <button
              onClick={() => setShowTelemetryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070d19] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1e293b] text-xs font-mono transition"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telemetry</span>
            </button>
          </div>
        </div>
      )}

      {/* Raw C2 Telemetry Modal */}
      {showTelemetryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#050811] border border-cyan-500/30 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white font-mono">C2 Telemetry Package — {selectedArc.id}</h3>
              </div>
              <button
                onClick={() => setShowTelemetryModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-[#020408] border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto max-h-64">
              {JSON.stringify(selectedArc, null, 2)}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCopyIoc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition"
              >
                {copiedIoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIoc ? "Copied IP!" : "Copy IP"}</span>
              </button>

              <button
                onClick={() => setShowTelemetryModal(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition"
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
