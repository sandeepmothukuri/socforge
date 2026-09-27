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
  Activity,
  Layers,
  MapPin,
  Crosshair,
  Wifi,
  Eye,
  AlertTriangle
} from "lucide-react";
import worldMapData from "./worldMapData.json";

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
    sourceCoords: [55.75, 37.62],
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
    sourceCoords: [39.03, 125.75],
    targetCity: "Tokyo (APAC AWS)",
    targetRegion: "Financial Core Engine",
    targetVpc: "aws-fin-core-ap",
    targetCoords: [35.68, 139.69],
    threatActor: "Lazarus Group",
    technique: "Encrypted C2 Beacon over WebSockets",
    mitreId: "T1071.001",
    protocol: "WSS / Port 443",
    severity: "CRITICAL",
    status: "BLOCKED_BY_SOAR",
    color: "#ec4899",
    timestamp: "1m ago"
  },
  {
    id: "arc-04",
    sourceCity: "St. Petersburg",
    sourceCountry: "RU",
    sourceIp: "194.26.29.112",
    sourceAsn: "AS48282 (Selectel)",
    sourceCoords: [59.93, 30.33],
    targetCity: "Quincy (US-West Azure)",
    targetRegion: "Azure Sovereign Cloud",
    targetVpc: "az-uswest-sec01",
    targetCoords: [47.23, -119.85],
    threatActor: "Sandworm Team",
    technique: "VPN Perimeter Credential Stuffing",
    mitreId: "T1110.003",
    protocol: "IPsec / IKEv2",
    severity: "HIGH",
    status: "WAF_DROP",
    color: "#3b82f6",
    timestamp: "2m ago"
  },
  {
    id: "arc-05",
    sourceCity: "Bucharest",
    sourceCountry: "RO",
    sourceIp: "91.240.118.66",
    sourceAsn: "AS200019 (HostSailor)",
    sourceCoords: [44.43, 26.10],
    targetCity: "London (UK Edge)",
    targetRegion: "Equinix LD4 Financial Node",
    targetVpc: "ld4-edge-uk",
    targetCoords: [51.51, -0.13],
    threatActor: "FIN7 (Carbanak)",
    technique: "Automated MFA Push Fatigue Spray",
    mitreId: "T1621",
    protocol: "RADIUS / OAuth2",
    severity: "HIGH",
    status: "BLOCKED_BY_SOAR",
    color: "#10b981",
    timestamp: "3m ago"
  },
  {
    id: "arc-06",
    sourceCity: "Tehran",
    sourceCountry: "IR",
    sourceIp: "185.143.232.19",
    sourceAsn: "AS44244 (Irancell)",
    sourceCoords: [35.69, 51.39],
    targetCity: "Singapore (APAC GCP)",
    targetRegion: "GCP Cloud Run Gateway",
    targetVpc: "gcp-apac-sg-01",
    targetCoords: [1.35, 103.82],
    threatActor: "Charming Kitten",
    technique: "Spearphishing OAuth Delegated Token Exfiltration",
    mitreId: "T1528",
    protocol: "HTTPS / REST API",
    severity: "HIGH",
    status: "BLOCKED_BY_SOAR",
    color: "#8b5cf6",
    timestamp: "4m ago"
  }
];

// Target Protected Data Centers / VPC Hubs
export const DEFENSE_DATACENTERS = [
  { name: "US-East AWS (Ashburn)", coords: [39.04, -77.48], label: "US-EAST-VPC", vpcId: "vpc-prod-east-01", provider: "AWS", status: "100% BLOCKED" },
  { name: "US-West Azure (Quincy)", coords: [47.23, -119.85], label: "US-WEST-AZURE", vpcId: "az-uswest-sec01", provider: "Azure", status: "100% BLOCKED" },
  { name: "London Edge (Equinix LD4)", coords: [51.51, -0.13], label: "UK-FIN-EDGE", vpcId: "ld4-edge-uk", provider: "Equinix", status: "100% BLOCKED" },
  { name: "EU-Central GCP (Frankfurt)", coords: [50.11, 8.68], label: "EU-CENTRAL-K8S", vpcId: "gcp-prod-k8s-de", provider: "GCP", status: "100% BLOCKED" },
  { name: "APAC Core AWS (Tokyo)", coords: [35.68, 139.69], label: "APAC-CORE", vpcId: "aws-fin-core-ap", provider: "AWS", status: "100% BLOCKED" },
  { name: "APAC South GCP (Singapore)", coords: [1.35, 103.82], label: "APAC-SOUTH", vpcId: "gcp-apac-sg-01", provider: "GCP", status: "100% BLOCKED" }
];

// Mathematical Equirectangular Projection: maps [lat, lng] to 1000x500 SVG coordinates
export function projectCoordinates(lat: number, lng: number): [number, number] {
  const x = 500 + (lng * 1000) / 360;
  const y = 250 - (lat * 500) / 180;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

// Generate Parabolic Quad Bezier path for attack trajectory
function getTrajectoryPath(source: [number, number], target: [number, number]) {
  const [x1, y1] = source;
  const [x2, y2] = target;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const arcHeight = Math.max(40, Math.min(140, dist * 0.32));
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

  // Layer Toggles
  const [showBorders, setShowBorders] = useState<boolean>(true);
  const [showUnderseaCables, setShowUnderseaCables] = useState<boolean>(true);
  const [showGraticule, setShowGraticule] = useState<boolean>(true);
  const [showRadarRings, setShowRadarRings] = useState<boolean>(true);
  const [showRadarSweep, setShowRadarSweep] = useState<boolean>(true);

  // Zoom & Pan ViewBox state
  const [viewBox, setViewBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 1000,
    h: 500
  });

  // Hover states for tooltips
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; code: string; x: number; y: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Synthesized Radar Chime (Web Audio API)
  const audioContextRef = useRef<AudioContext | null>(null);

  const playRadarPing = () => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.23);
    } catch {
      // AudioContext policy suppression fallback
    }
  };

  // Live periodic threat generation when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const candidates = [
        { city: "Shenzhen", country: "CN", ip: "183.14.30.99", asn: "AS4134", coords: [22.54, 114.05], actor: "Volt Typhoon", tech: "Living-off-the-Land WMI Query", mitre: "T1047", color: "#f59e0b" },
        { city: "Khabarovsk", country: "RU", ip: "92.38.150.12", asn: "AS12389", coords: [48.48, 135.07], actor: "APT29 (Nobelium)", tech: "Active Directory Kerberoasting", mitre: "T1558.003", color: "#ef4444" },
        { city: "Hanoi", country: "VN", ip: "118.70.180.45", asn: "AS7552", coords: [21.02, 105.83], actor: "OceanLotus", tech: "Cobalt Strike HTTPS Injection", mitre: "T1055.002", color: "#10b981" },
        { city: "Kazan", country: "RU", ip: "178.208.76.10", asn: "AS31133", coords: [55.79, 49.12], actor: "Sandworm Team", tech: "ICS/SCADA Modbus Protocol Spoof", mitre: "T0855", color: "#3b82f6" }
      ];
      const targetList = DEFENSE_DATACENTERS;
      const pickSource = candidates[Math.floor(Math.random() * candidates.length)];
      const pickTarget = targetList[Math.floor(Math.random() * targetList.length)];

      const newArc: ThreatArc = {
        id: `arc-${Date.now().toString().slice(-4)}`,
        sourceCity: pickSource.city,
        sourceCountry: pickSource.country,
        sourceIp: pickSource.ip,
        sourceAsn: pickSource.asn,
        sourceCoords: pickSource.coords as [number, number],
        targetCity: pickTarget.name,
        targetRegion: pickTarget.label,
        targetVpc: pickTarget.vpcId,
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
    }, 9000);

    return () => clearInterval(interval);
  }, [isPlaying, audioEnabled]);

  // Filter arcs by selected threat actor
  const filteredArcs = useMemo(() => {
    if (selectedActor === "ALL") return arcs;
    return arcs.filter((a) => a.threatActor.toLowerCase().includes(selectedActor.toLowerCase()));
  }, [arcs, selectedActor]);

  // Zoom handlers
  const handleZoom = (direction: "in" | "out" | "reset") => {
    if (direction === "reset") {
      setViewBox({ x: 0, y: 0, w: 1000, h: 500 });
      return;
    }
    const factor = direction === "in" ? 0.75 : 1.33;
    const newW = Math.max(300, Math.min(1000, viewBox.w * factor));
    const newH = Math.max(150, Math.min(500, viewBox.h * factor));
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
        setViewBox({ x: 120, y: 30, w: 420, h: 260 });
        break;
      case "eu":
        setViewBox({ x: 420, y: 40, w: 320, h: 220 });
        break;
      case "apac":
        setViewBox({ x: 650, y: 60, w: 350, h: 260 });
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
      sourceIp: "194.26.29.98",
      sourceAsn: "AS48282 (Selectel)",
      sourceCoords: [59.93, 30.33],
      targetCity: randomTarget.name,
      targetRegion: randomTarget.label,
      targetVpc: randomTarget.vpcId,
      targetCoords: randomTarget.coords as [number, number],
      threatActor: "Sandworm Team",
      technique: "Zero-Day Ingress VPN Tunnel Probe",
      mitreId: "T1133",
      protocol: "UDP / WireGuard 51820",
      severity: "CRITICAL",
      status: "BLOCKED_BY_SOAR",
      color: "#ef4444",
      timestamp: "just now"
    };

    setArcs((prev) => [simArc, ...prev.slice(0, 7)]);
    setSelectedArc(simArc);
    playRadarPing();

    setToastMessage(`[SOAR TRIGGER] Intercepted zero-day trajectory from ${simArc.sourceCity} (${simArc.sourceIp}) -> ${randomTarget.label}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quarantine C2 Action
  const handleQuarantineC2 = () => {
    if (!quarantinedIps.includes(selectedArc.sourceIp)) {
      setQuarantinedIps((prev) => [...prev, selectedArc.sourceIp]);
      setToastMessage(`[FIREWALL MITIGATION] C2 IP ${selectedArc.sourceIp} quarantined across all 12 Edge Gateways.`);
    } else {
      setToastMessage(`[ACTIVE RULE] IP ${selectedArc.sourceIp} is already in the Global Quarantine Blacklist.`);
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
    <div className={`flex flex-col bg-[#050811] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 px-4 py-2 text-xs flex items-center justify-between font-mono animate-fadeIn z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-5 py-3.5 border-b border-[#1e293b] bg-[#070c18]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 shadow-inner">
            <Globe className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
                Global Threat Arc Map & C2 Defense Radar
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                DEFCON 3 ACTIVE
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                100% INGRESS MITIGATION
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              High-resolution cartographic tracking of nation-state threat vectors, C2 infrastructure, and automated SOAR perimeter drops.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Simulate Attack Button */}
          <button
            onClick={handleSimulateNewAttack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition shadow-lg shadow-red-950/50 active:scale-95 border border-red-400/30"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulate Ingress</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-xl border text-xs transition ${
              audioEnabled
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                : "bg-slate-900 border-[#1e293b] text-slate-400 hover:text-white"
            }`}
            title={audioEnabled ? "Mute Radar Ping" : "Enable Radar Ping Sound"}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Pause / Play Stream */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl border text-xs transition ${
              isPlaying
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900 border-[#1e293b] text-slate-400 hover:text-white"
            }`}
            title={isPlaying ? "Pause Threat Feed" : "Resume Threat Feed"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Secondary Controls & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-2.5 bg-[#030610] border-b border-[#1e293b] text-xs">
        {/* Threat Actor Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold mr-1 flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-cyan-400" /> Actor:
          </span>
          {["ALL", "APT29", "Volt Typhoon", "Lazarus", "Sandworm", "FIN7"].map((actor) => (
            <button
              key={actor}
              onClick={() => setSelectedActor(actor)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition font-mono ${
                selectedActor === actor
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {actor}
            </button>
          ))}
        </div>

        {/* Theater Presets, Layers & Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theater Region Jumps */}
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-0.5 text-[10px]">
            <button
              onClick={() => handleRegionPreset("global")}
              className={`px-2 py-0.5 rounded transition ${viewBox.w === 1000 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Global
            </button>
            <button
              onClick={() => handleRegionPreset("na")}
              className={`px-2 py-0.5 rounded transition ${viewBox.x === 120 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Americas
            </button>
            <button
              onClick={() => handleRegionPreset("eu")}
              className={`px-2 py-0.5 rounded transition ${viewBox.x === 420 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              EMEA
            </button>
            <button
              onClick={() => handleRegionPreset("apac")}
              className={`px-2 py-0.5 rounded transition ${viewBox.x === 650 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              APAC
            </button>
          </div>

          {/* Undersea Fiber Cables */}
          <button
            onClick={() => setShowUnderseaCables(!showUnderseaCables)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition font-mono ${
              showUnderseaCables
                ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300 font-bold"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            Fiber {showUnderseaCables ? "ON" : "OFF"}
          </button>

          {/* Radar Concentric Rings */}
          <button
            onClick={() => setShowRadarRings(!showRadarRings)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition font-mono ${
              showRadarRings
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            Rings {showRadarRings ? "ON" : "OFF"}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-0.5">
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
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Interactive Map Canvas */}
      <div className="relative w-full aspect-[2/1] min-h-[380px] bg-[#02050c] overflow-hidden select-none">
        {/* Floating Country / Hub Hover Info Tooltip */}
        {hoveredCountry && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-slate-900/95 border border-cyan-500/50 shadow-xl backdrop-blur-md text-white text-xs font-mono flex items-center gap-2 transform -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: `${(hoveredCountry.x / 1000) * 100}%`, top: `${(hoveredCountry.y / 500) * 100}%` }}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-cyan-200">{hoveredCountry.name || "Geographic Territory"}</span>
            {hoveredCountry.code && (
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 text-[10px] font-bold">
                {hoveredCountry.code}
              </span>
            )}
          </div>
        )}

        {/* SVG Viewport */}
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full h-full block"
          style={{ transition: "viewBox 0.4s ease-out" }}
        >
          <defs>
            {/* High-Tech Background Radial Glow */}
            <radialGradient id="cyberGlow" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#081024" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#030712" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#010308" stopOpacity="1" />
            </radialGradient>

            {/* Trajectory Arc Gradients */}
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
                  <stop offset="0%" stopColor={arc.color} stopOpacity="1" />
                  <stop offset="70%" stopColor={arc.color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                </linearGradient>
              );
            })}

            {/* Glowing Drop Shadows */}
            <filter id="laserGlowRed" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="laserGlowGreen" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="laserGlowCyan" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Deep Ocean Backdrop */}
          <rect x="0" y="0" width="1000" height="500" fill="url(#cyberGlow)" />

          {/* Lat/Long Military Graticule System */}
          {showGraticule && (
            <g stroke="#172554" strokeWidth="0.6" strokeDasharray="3,4" opacity="0.65">
              <path d={worldMapData.graticulePath} fill="none" />
              {/* Equator & Prime Meridian Heavy Lines */}
              <line x1="0" y1="250" x2="1000" y2="250" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="none" opacity="0.4" />
              <line x1="500" y1="0" x2="500" y2="500" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="none" opacity="0.4" />
            </g>
          )}

          {/* High-Resolution Real Continental Landmass */}
          <g fill="#0c1427" stroke="#1e293b" strokeWidth="0.8">
            <path d={worldMapData.landPath} />
          </g>

          {/* Individual Country Borders with Hover Interaction */}
          {showBorders && (
            <g>
              {worldMapData.countryFeatures.map((c) => {
                const isThreatSource = arcs.some((a) => a.sourceCountry === c.code);
                return (
                  <path
                    key={`country-${c.id}`}
                    d={c.d}
                    fill={isThreatSource ? "#ef444415" : "transparent"}
                    stroke={isThreatSource ? "#ef444440" : "#1e293b"}
                    strokeWidth={isThreatSource ? "1" : "0.5"}
                    className="transition-colors duration-200 cursor-pointer hover:fill-cyan-500/20 hover:stroke-cyan-400"
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGPathElement).getBBox();
                      setHoveredCountry({
                        name: c.name || "Territory",
                        code: c.code || "",
                        x: rect.x + rect.width / 2,
                        y: rect.y + rect.height / 2
                      });
                    }}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />
                );
              })}
            </g>
          )}

          {/* Undersea Fiber Highways (Global Backbone) */}
          {showUnderseaCables && (
            <g stroke="#0ea5e9" strokeWidth="0.8" strokeDasharray="3,5" opacity="0.45" fill="none">
              {/* Trans-Atlantic Fiber (Ashburn <-> London <-> Frankfurt) */}
              <path d="M 284.78 141.56 Q 390 110 499.64 106.92" />
              <path d="M 499.64 106.92 L 524.11 110.81" />
              {/* Trans-Pacific Fiber (Ashburn <-> Quincy <-> Tokyo) */}
              <path d="M 284.78 141.56 L 167.08 118.81" />
              <path d="M 167.08 118.81 Q 80 110 0 130" />
              <path d="M 1000 130 Q 940 140 888.03 150.89" />
              {/* Euro-Asia Fiber (Frankfurt <-> Singapore <-> Tokyo) */}
              <path d="M 524.11 110.81 Q 650 180 788.39 246.25" />
              <path d="M 788.39 246.25 Q 840 200 888.03 150.89" />
              {/* Americas to South America */}
              <path d="M 284.78 141.56 Q 300 230 360 310" />
            </g>
          )}

          {/* Defense Hub Datacenters (VPC Targets) */}
          <g>
            {DEFENSE_DATACENTERS.map((node, i) => {
              const [cx, cy] = projectCoordinates(node.coords[0], node.coords[1]);
              const isSelectedTarget = selectedArc?.targetCoords[0] === node.coords[0];
              return (
                <g
                  key={`datacenter-${i}`}
                  className="group cursor-pointer"
                  onClick={() => {
                    const match = arcs.find((a) => a.targetCoords[0] === node.coords[0]);
                    if (match) {
                      setSelectedArc(match);
                      if (onSelectThreat) onSelectThreat(match);
                    }
                  }}
                  onMouseEnter={() => setHoveredNode(node.label)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Defense Radar Rings */}
                  {showRadarRings && (
                    <>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="24"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="0.75"
                        strokeDasharray="2,3"
                        opacity="0.35"
                        className="animate-spin-slow origin-center"
                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r="14"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                    </>
                  )}

                  {/* Datacenter Shield Hub Core */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelectedTarget ? "6.5" : "4.5"}
                    fill="#10b981"
                    filter="url(#laserGlowGreen)"
                    className="transition-all duration-300"
                  />
                  <circle cx={cx} cy={cy} r="2" fill="#ffffff" />

                  {/* Monospace Badge Label */}
                  <g transform={`translate(${cx}, ${cy - 12})`}>
                    <rect
                      x="-38"
                      y="-12"
                      width="76"
                      height="14"
                      rx="3"
                      fill="#030712"
                      stroke={isSelectedTarget ? "#10b981" : "#1e293b"}
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill={isSelectedTarget ? "#34d399" : "#a7f3d0"}
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Threat Origin Beacons */}
          <g>
            {filteredArcs.map((arc) => {
              const [sx, sy] = projectCoordinates(arc.sourceCoords[0], arc.sourceCoords[1]);
              const isSelected = selectedArc?.id === arc.id;
              return (
                <g
                  key={`origin-${arc.id}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedArc(arc);
                    if (onSelectThreat) onSelectThreat(arc);
                  }}
                >
                  {/* Expanding Threat Beacon Wave */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isSelected ? "14" : "10"}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth="1"
                    opacity="0.6"
                    className="animate-ping"
                  />
                  {/* Origin Beacon Dot */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isSelected ? "5" : "3.5"}
                    fill={arc.color}
                    filter="url(#laserGlowRed)"
                  />
                  <circle cx={sx} cy={sy} r="1.5" fill="#ffffff" />

                  {/* Origin City Label */}
                  <text
                    x={sx}
                    y={sy + 12}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                  >
                    {arc.sourceCity}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Ballistic Attack Trajectory Arcs */}
          <g>
            {filteredArcs.map((arc) => {
              const sourcePt = projectCoordinates(arc.sourceCoords[0], arc.sourceCoords[1]);
              const targetPt = projectCoordinates(arc.targetCoords[0], arc.targetCoords[1]);
              const d = getTrajectoryPath(sourcePt, targetPt);
              const isSelected = selectedArc?.id === arc.id;

              return (
                <g
                  key={`arc-group-${arc.id}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedArc(arc);
                    if (onSelectThreat) onSelectThreat(arc);
                  }}
                >
                  {/* Outer Trajectory Glow */}
                  <path
                    d={d}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={isSelected ? "3.5" : "2"}
                    opacity={isSelected ? "0.85" : "0.5"}
                    filter="url(#laserGlowRed)"
                  />

                  {/* Core Trajectory Line with Gradient */}
                  <path
                    d={d}
                    fill="none"
                    stroke={`url(#grad-${arc.id})`}
                    strokeWidth={isSelected ? "2" : "1.25"}
                    strokeDasharray={isSelected ? "none" : "5,3"}
                  />

                  {/* High-Velocity Traveling Particle Pulse */}
                  {isPlaying && (
                    <circle r={isSelected ? "3.5" : "2.5"} fill="#ffffff" filter="url(#laserGlowRed)">
                      <animateMotion
                        path={d}
                        dur={arc.severity === "CRITICAL" ? "2.4s" : "3.8s"}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* Radar Sweep Vertical Line (High-Tech Scanning Line) */}
          {showRadarSweep && isPlaying && (
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="500"
              stroke="#06b6d4"
              strokeWidth="1.5"
              opacity="0.4"
              filter="url(#laserGlowCyan)"
            >
              <animate
                attributeName="x1"
                from="0"
                to="1000"
                dur="8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                from="0"
                to="1000"
                dur="8s"
                repeatCount="indefinite"
              />
            </line>
          )}
        </svg>

        {/* Live Attack Metric Watermark */}
        <div className="absolute bottom-3 left-4 flex items-center gap-3 bg-[#030712]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>ACTIVE ARCS:</span>
            <span className="text-white font-bold">{filteredArcs.length}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>EDGE SHIELD:</span>
            <span className="text-emerald-400 font-bold">100% INGRESS MITIGATION</span>
          </div>
        </div>
      </div>

      {/* Selected Threat Actor & Telemetry Inspection Card */}
      {selectedArc && (
        <div className="px-5 py-4 border-t border-[#1e293b] bg-[#070c18] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            {/* Source Actor */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Attributed Threat Actor
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedArc.color }} />
                <h4 className="text-sm font-bold text-white font-sans">{selectedArc.threatActor}</h4>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Origin: <span className="text-slate-200">{selectedArc.sourceCity}, {selectedArc.sourceCountry}</span>
                {" "}(<span className="text-cyan-400">{selectedArc.sourceIp}</span>)
              </p>
            </div>

            {/* Target Asset */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Target Asset & VPC
              </span>
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <h4 className="text-sm font-bold text-emerald-300 font-sans">{selectedArc.targetCity}</h4>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {selectedArc.targetRegion} (<span className="text-slate-200">{selectedArc.targetVpc}</span>)
              </p>
            </div>

            {/* MITRE Technique & SOAR Status */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                MITRE TTP & Defense Action
              </span>
              <p className="text-xs font-semibold text-slate-200">{selectedArc.technique}</p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono">
                  {selectedArc.status.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedArc.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleQuarantineC2}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                quarantinedIps.includes(selectedArc.sourceIp)
                  ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{quarantinedIps.includes(selectedArc.sourceIp) ? "Quarantined" : "Quarantine C2"}</span>
            </button>

            <button
              onClick={() => setShowTelemetryModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>C2 Telemetry</span>
            </button>
          </div>
        </div>
      )}

      {/* Raw C2 Telemetry Modal */}
      {showTelemetryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#070c18] border border-cyan-500/30 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">C2 Telemetry Package — {selectedArc.id}</h3>
              </div>
              <button
                onClick={() => setShowTelemetryModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-[#030610] border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto max-h-64">
              {JSON.stringify(selectedArc, null, 2)}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCopyIoc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition"
              >
                {copiedIoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIoc ? "Copied IP!" : "Copy IOC (IP)"}</span>
              </button>

              <button
                onClick={() => setShowTelemetryModal(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-sans transition"
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
