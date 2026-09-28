"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  MapPin,
  Filter,
  ExternalLink,
  Activity,
  ShieldAlert,
  ChevronRight,
  Zap
} from "lucide-react";
import worldMapData from "./worldMapData.json";

export type ThreatSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

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
  severity: ThreatSeverity;
  status: "BLOCKED_BY_SOAR" | "WAF_DROP" | "CONTAINED" | "INVESTIGATING";
  color: string; // Exact match to SOCForge Threat Alerts
  timestamp: string;
}

// SOCForge Standard Threat Alert Colors:
// - CRITICAL: #EF4444 (Vibrant Red)
// - HIGH: #F97316 (Alert Orange)
// - MEDIUM: #F59E0B (Telemetry Amber)
// - LOW: #10B981 (Shield Green)
export const ALERT_SEVERITY_CONFIG: Record<
  ThreatSeverity,
  {
    color: string;
    glowFilter: string;
    label: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
  }
> = {
  CRITICAL: {
    color: "#EF4444", // Red
    glowFilter: "url(#glowRed)",
    label: "CRITICAL",
    bgClass: "bg-red-500/15",
    borderClass: "border-red-500/40",
    textClass: "text-[#EF4444]"
  },
  HIGH: {
    color: "#F97316", // Orange
    glowFilter: "url(#glowOrange)",
    label: "HIGH",
    bgClass: "bg-orange-500/15",
    borderClass: "border-orange-500/40",
    textClass: "text-[#F97316]"
  },
  MEDIUM: {
    color: "#F59E0B", // Amber
    glowFilter: "url(#glowAmber)",
    label: "MEDIUM",
    bgClass: "bg-amber-500/15",
    borderClass: "border-amber-500/40",
    textClass: "text-[#F59E0B]"
  },
  LOW: {
    color: "#10B981", // Green
    glowFilter: "url(#glowGreen)",
    label: "LOW",
    bgClass: "bg-emerald-500/15",
    borderClass: "border-emerald-500/40",
    textClass: "text-[#10B981]"
  }
};

export const INITIAL_THREAT_ARCS: ThreatArc[] = [
  // 1. CRITICAL — #EF4444 (Vibrant Red)
  {
    id: "arc-01",
    sourceCity: "Moscow",
    sourceCountry: "RU",
    sourceIp: "185.220.101.45",
    sourceAsn: "AS49210 (RedRelay)",
    sourceCoords: [55.75, 37.62],
    targetCity: "Ashburn (US-East AWS)",
    targetRegion: "AWS VPC Production (SRV-DC01)",
    targetVpc: "vpc-prod-east-01",
    targetCoords: [39.04, -77.48],
    threatActor: "APT29 (Nobelium)",
    technique: "Mimikatz LSASS Dump via PowerShell",
    mitreId: "T1003.001",
    protocol: "HTTPS / TLS 1.3",
    severity: "CRITICAL",
    status: "BLOCKED_BY_SOAR",
    color: ALERT_SEVERITY_CONFIG.CRITICAL.color,
    timestamp: "12s ago"
  },
  {
    id: "arc-02",
    sourceCity: "Pyongyang",
    sourceCountry: "KP",
    sourceIp: "175.45.176.8",
    sourceAsn: "AS131279 (Star-KP)",
    sourceCoords: [39.03, 125.75],
    targetCity: "Tokyo (APAC AWS)",
    targetRegion: "Financial Core Engine (SRV-DC02)",
    targetVpc: "aws-fin-core-ap",
    targetCoords: [35.68, 139.69],
    threatActor: "Lazarus Group",
    technique: "Encrypted C2 Beacon over WebSockets",
    mitreId: "T1071.001",
    protocol: "WSS / Port 443",
    severity: "CRITICAL",
    status: "BLOCKED_BY_SOAR",
    color: ALERT_SEVERITY_CONFIG.CRITICAL.color,
    timestamp: "38s ago"
  },

  // 2. HIGH — #F97316 (Alert Orange)
  {
    id: "arc-03",
    sourceCity: "Shanghai",
    sourceCountry: "CN",
    sourceIp: "112.90.44.18",
    sourceAsn: "AS4134 (Chinanet)",
    sourceCoords: [31.23, 121.47],
    targetCity: "London Edge (Equinix LD4)",
    targetRegion: "UK Financial Node (WKSTN-FIN-04)",
    targetVpc: "ld4-edge-uk",
    targetCoords: [51.51, -0.13],
    threatActor: "Volt Typhoon",
    technique: "Cobalt Strike Named Pipe Beaconing",
    mitreId: "T1059.001",
    protocol: "SSH / Port 2222",
    severity: "HIGH",
    status: "CONTAINED",
    color: ALERT_SEVERITY_CONFIG.HIGH.color,
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
    targetRegion: "Azure Sovereign Cloud (corp\\jdoe)",
    targetVpc: "az-uswest-sec01",
    targetCoords: [47.23, -119.85],
    threatActor: "Sandworm Team",
    technique: "Anomalous MFA Push Fatigue Attack",
    mitreId: "T1621",
    protocol: "IPsec / IKEv2",
    severity: "HIGH",
    status: "WAF_DROP",
    color: ALERT_SEVERITY_CONFIG.HIGH.color,
    timestamp: "2m ago"
  },

  // 3. MEDIUM — #F59E0B (Telemetry Amber)
  {
    id: "arc-05",
    sourceCity: "Tehran",
    sourceCountry: "IR",
    sourceIp: "185.143.232.19",
    sourceAsn: "AS44244 (Irancell)",
    sourceCoords: [35.69, 51.39],
    targetCity: "Singapore (APAC GCP)",
    targetRegion: "GCP Cloud Run Gateway (FW-EDGE-01)",
    targetVpc: "gcp-apac-sg-01",
    targetCoords: [1.35, 103.82],
    threatActor: "Charming Kitten",
    technique: "Perimeter SSH Port Scan Sweep (22/TCP)",
    mitreId: "T1046",
    protocol: "HTTPS / REST API",
    severity: "MEDIUM",
    status: "BLOCKED_BY_SOAR",
    color: ALERT_SEVERITY_CONFIG.MEDIUM.color,
    timestamp: "3m ago"
  },
  {
    id: "arc-06",
    sourceCity: "Bucharest",
    sourceCountry: "RO",
    sourceIp: "91.240.118.66",
    sourceAsn: "AS200019 (HostSailor)",
    sourceCoords: [44.43, 26.10],
    targetCity: "Frankfurt (EU-Central GCP)",
    targetRegion: "EU Central K8S Gateway",
    targetVpc: "gcp-prod-k8s-de",
    targetCoords: [50.11, 8.68],
    threatActor: "FIN7 (Carbanak)",
    technique: "Automated MFA Push Fatigue Spray",
    mitreId: "T1621",
    protocol: "RADIUS / OAuth2",
    severity: "MEDIUM",
    status: "BLOCKED_BY_SOAR",
    color: ALERT_SEVERITY_CONFIG.MEDIUM.color,
    timestamp: "4m ago"
  },

  // 4. LOW — #10B981 (Shield Green)
  {
    id: "arc-07",
    sourceCity: "Amsterdam",
    sourceCountry: "NL",
    sourceIp: "185.107.56.204",
    sourceAsn: "AS49981 (WorldStream)",
    sourceCoords: [52.37, 4.89],
    targetCity: "Ashburn (US-East AWS)",
    targetRegion: "AWS VPC Production",
    targetVpc: "vpc-prod-east-01",
    targetCoords: [39.04, -77.48],
    threatActor: "DarkGate Scanner",
    technique: "Perimeter TLS Certificate Enumeration",
    mitreId: "T1595.002",
    protocol: "HTTPS / Port 8443",
    severity: "LOW",
    status: "WAF_DROP",
    color: ALERT_SEVERITY_CONFIG.LOW.color,
    timestamp: "6m ago"
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

// Mathematical Equirectangular Projection: maps [lat, lng] to 1000x500 coordinates
export function projectCoordinates(lat: number, lng: number): [number, number] {
  const x = 500 + (lng * 1000) / 360;
  const y = 250 - (lat * 500) / 180;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

// Generate smooth aerodynamic Cubic Bezier ballistic trajectory path
export function getTrajectoryPath(source: [number, number], target: [number, number]) {
  const [x1, y1] = source;
  const [x2, y2] = target;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);

  // Aerodynamic altitude scaled smoothly with geographic distance
  const altitude = Math.max(35, Math.min(125, dist * 0.28));

  // Dual cubic control points create an elegant, natural parabolic arc without sharp midpoint angles
  const cp1x = Number((x1 + dx * 0.25).toFixed(2));
  const cp1y = Number((y1 + dy * 0.25 - altitude).toFixed(2));
  const cp2x = Number((x1 + dx * 0.75).toFixed(2));
  const cp2y = Number((y1 + dy * 0.75 - altitude).toFixed(2));

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
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
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [copiedIoc, setCopiedIoc] = useState<boolean>(false);
  const [quarantinedIps, setQuarantinedIps] = useState<string[]>([]);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<"LIVE" | "15M" | "1H" | "6H" | "24H">("LIVE");
  const [timelineIndex, setTimelineIndex] = useState<number>(0);
  const [showOsintDrawer, setShowOsintDrawer] = useState<boolean>(false);

  // Layer Toggles
  const [showBorders, setShowBorders] = useState<boolean>(true);
  const [showUnderseaCables, setShowUnderseaCables] = useState<boolean>(true);
  const [showGraticule, setShowGraticule] = useState<boolean>(true);

  // Zoom & Pan ViewBox state
  const [viewBox, setViewBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 1000,
    h: 500
  });

  // Country hover tooltip
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; code: string; x: number; y: number } | null>(null);

  // Audio Radar Chime (Web Audio API)
  const audioContextRef = useRef<AudioContext | null>(null);
  const playRadarPing = useCallback(() => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();
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
      // Audio fallback suppression
    }
  }, [audioEnabled]);

  // Periodic threat stream matching Alert Severity Colors
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const candidates: Array<{
        city: string;
        country: string;
        ip: string;
        asn: string;
        coords: [number, number];
        actor: string;
        tech: string;
        mitre: string;
        severity: ThreatSeverity;
      }> = [
        { city: "Shenzhen", country: "CN", ip: "183.14.30.99", asn: "AS4134", coords: [22.54, 114.05], actor: "Volt Typhoon", tech: "WMI Command Discovery", mitre: "T1047", severity: "HIGH" },
        { city: "Khabarovsk", country: "RU", ip: "92.38.150.12", asn: "AS12389", coords: [48.48, 135.07], actor: "APT29 (Nobelium)", tech: "Kerberos TGT Ticket Request", mitre: "T1558.001", severity: "CRITICAL" },
        { city: "Hanoi", country: "VN", ip: "118.70.180.45", asn: "AS7552", coords: [21.02, 105.83], actor: "OceanLotus", tech: "In-Memory Shellcode Injection", mitre: "T1055.002", severity: "MEDIUM" },
        { city: "Frankfurt", country: "DE", ip: "193.142.146.88", asn: "AS201814", coords: [50.11, 8.68], actor: "Mirai Botnet Scanner", tech: "Telnet Password Spray", mitre: "T1110.001", severity: "LOW" }
      ];
      const targetList = DEFENSE_DATACENTERS;
      const pickSource = candidates[Math.floor(Math.random() * candidates.length)];
      const pickTarget = targetList[Math.floor(Math.random() * targetList.length)];
      const config = ALERT_SEVERITY_CONFIG[pickSource.severity];

      const newArc: ThreatArc = {
        id: `arc-${Date.now().toString().slice(-4)}`,
        sourceCity: pickSource.city,
        sourceCountry: pickSource.country,
        sourceIp: pickSource.ip,
        sourceAsn: pickSource.asn,
        sourceCoords: pickSource.coords,
        targetCity: pickTarget.name,
        targetRegion: pickTarget.label,
        targetVpc: pickTarget.vpcId,
        targetCoords: pickTarget.coords as [number, number],
        threatActor: pickSource.actor,
        technique: pickSource.tech,
        mitreId: pickSource.mitre,
        protocol: "TLS 1.3 / Ingress Drop",
        severity: pickSource.severity,
        status: "BLOCKED_BY_SOAR",
        color: config.color,
        timestamp: "just now"
      };

      setArcs((prev) => [newArc, ...prev.slice(0, 8)]);
      playRadarPing();
    }, 9000);

    return () => clearInterval(interval);
  }, [isPlaying, playRadarPing]);

  // Filter arcs by selected actor AND severity
  const filteredArcs = useMemo(() => {
    return arcs.filter((a) => {
      const matchActor = selectedActor === "ALL" || a.threatActor.toLowerCase().includes(selectedActor.toLowerCase());
      const matchSeverity = selectedSeverity === "ALL" || a.severity === selectedSeverity;
      return matchActor && matchSeverity;
    });
  }, [arcs, selectedActor, selectedSeverity]);

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

  // Simulate Ingress Action (injects critical alert trajectory)
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
      color: ALERT_SEVERITY_CONFIG.CRITICAL.color,
      timestamp: "just now"
    };

    setArcs((prev) => [simArc, ...prev.slice(0, 8)]);
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
          <div className="relative p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 shadow-inner">
            <Globe className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
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
              Live threat telemetry arcs matched to alert severities • Continuous glowing laser trajectories & perimeter defense hubs.
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

      {/* Threat Alert Severity Color-Coding Legend & Actor Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-2.5 bg-[#030610] border-b border-[#1e293b] text-xs">
        {/* SEVERITY DOTTED COLOR LEGEND (AS PER THREAT ALERTS COLOR) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" /> ALERT SEV:
          </span>

          {/* ALL */}
          <button
            onClick={() => setSelectedSeverity("ALL")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
              selectedSeverity === "ALL"
                ? "bg-white text-black shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            ALL
          </button>

          {/* CRITICAL: Red (#EF4444) */}
          <button
            onClick={() => setSelectedSeverity(selectedSeverity === "CRITICAL" ? "ALL" : "CRITICAL")}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
              selectedSeverity === "CRITICAL"
                ? "bg-red-500/25 text-red-300 border-red-500 shadow-sm shadow-red-900/50"
                : "bg-slate-900/80 text-red-400 border-red-900/40 hover:bg-red-950/40"
            }`}
            title="Critical Threat Alert Color: Vibrant Red (#EF4444)"
          >
            <span className="inline-block w-3.5 h-1 rounded-full bg-[#EF4444] shadow-sm shadow-[#EF4444]/80" />
            <span>CRITICAL</span>
          </button>

          {/* HIGH: Orange (#F97316) */}
          <button
            onClick={() => setSelectedSeverity(selectedSeverity === "HIGH" ? "ALL" : "HIGH")}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
              selectedSeverity === "HIGH"
                ? "bg-orange-500/25 text-orange-300 border-orange-500 shadow-sm shadow-orange-900/50"
                : "bg-slate-900/80 text-orange-400 border-orange-900/40 hover:bg-orange-950/40"
            }`}
            title="High Threat Alert Color: Alert Orange (#F97316)"
          >
            <span className="inline-block w-3.5 h-1 rounded-full bg-[#F97316] shadow-sm shadow-[#F97316]/80" />
            <span>HIGH</span>
          </button>

          {/* MEDIUM: Amber (#F59E0B) */}
          <button
            onClick={() => setSelectedSeverity(selectedSeverity === "MEDIUM" ? "ALL" : "MEDIUM")}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
              selectedSeverity === "MEDIUM"
                ? "bg-amber-500/25 text-amber-300 border-amber-500 shadow-sm shadow-amber-900/50"
                : "bg-slate-900/80 text-amber-400 border-amber-900/40 hover:bg-amber-950/40"
            }`}
            title="Medium Threat Alert Color: Telemetry Amber (#F59E0B)"
          >
            <span className="inline-block w-3.5 h-1 rounded-full bg-[#F59E0B] shadow-sm shadow-[#F59E0B]/80" />
            <span>MEDIUM</span>
          </button>

          {/* LOW: Green (#10B981) */}
          <button
            onClick={() => setSelectedSeverity(selectedSeverity === "LOW" ? "ALL" : "LOW")}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
              selectedSeverity === "LOW"
                ? "bg-emerald-500/25 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-900/50"
                : "bg-slate-900/80 text-emerald-400 border-emerald-900/40 hover:bg-emerald-950/40"
            }`}
            title="Low Threat Alert Color: Shield Green (#10B981)"
          >
            <span className="inline-block w-3.5 h-1 rounded-full bg-[#10B981] shadow-sm shadow-[#10B981]/80" />
            <span>LOW</span>
          </button>
        </div>

        {/* Actor Quick Pills & Zoom */}
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

          {/* Graticule Grid Toggle */}
          <button
            onClick={() => setShowGraticule(!showGraticule)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition font-mono ${
              showGraticule
                ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300 font-bold"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            Grid {showGraticule ? "ON" : "OFF"}
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

      {/* Main SVG Interactive Map Canvas — ULTRA-CLEAR HIGH CONTRAST */}
      <div className="relative w-full aspect-[2/1] min-h-[380px] bg-[#050a14] overflow-hidden select-none">
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
            {/* Clear Deep Cyber Ocean Gradient */}
            <radialGradient id="clearOcean" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0a1222" stopOpacity="0.98" />
              <stop offset="60%" stopColor="#060c18" stopOpacity="0.99" />
              <stop offset="100%" stopColor="#03060d" stopOpacity="1" />
            </radialGradient>

            {/* Severity-Specific Laser Glow Filters (Pure Vibrant Color Drop-Shadows) */}
            <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.8" floodColor="#EF4444" floodOpacity="0.9" />
            </filter>
            <filter id="glowOrange" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.8" floodColor="#F97316" floodOpacity="0.9" />
            </filter>
            <filter id="glowAmber" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.8" floodColor="#F59E0B" floodOpacity="0.9" />
            </filter>
            <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.8" floodColor="#10B981" floodOpacity="0.9" />
            </filter>
            <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.8" floodColor="#06B6D4" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Clear Deep Ocean Backdrop */}
          <rect x="0" y="0" width="1000" height="500" fill="url(#clearOcean)" />

          {/* Lat/Long Coordinate Graticule Grid */}
          {showGraticule && (
            <g stroke="#1b2942" strokeWidth="0.65" strokeDasharray="3,4" opacity="0.5">
              <path d={worldMapData.graticulePath} fill="none" />
              <line x1="0" y1="250" x2="1000" y2="250" stroke="#233654" strokeWidth="1" opacity="0.5" />
              <line x1="500" y1="0" x2="500" y2="500" stroke="#233654" strokeWidth="1" opacity="0.5" />
            </g>
          )}

          {/* High-Resolution Clear Continental Landmass (High-Contrast Sleek Slate) */}
          <g fill="#131c2b" stroke="#24344e" strokeWidth="0.85" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.6))">
            <path d={worldMapData.landPath} />
          </g>

          {/* Individual Country Borders with Dark Cartography (Clean Uniform Continental Finish) */}
          {showBorders && (
            <g>
              {(worldMapData.countryFeatures || []).map((c: any) => {
                const isSelected = selectedArc?.sourceCountry === c.code;

                return (
                  <path
                    key={`country-${c.id}`}
                    d={c.d}
                    fill={isSelected ? "rgba(6, 182, 212, 0.08)" : "transparent"}
                    stroke={isSelected ? "rgba(6, 182, 212, 0.6)" : "#1e2d42"}
                    strokeWidth={isSelected ? "0.9" : "0.5"}
                    className="transition-colors duration-200 cursor-pointer hover:fill-cyan-500/15 hover:stroke-cyan-400/50"
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
            <g stroke="#0284c7" strokeWidth="0.8" strokeDasharray="3,5" opacity="0.4" fill="none">
              <path d="M 284.78 141.56 Q 390 110 499.64 106.92" />
              <path d="M 499.64 106.92 L 524.11 110.81" />
              <path d="M 284.78 141.56 L 167.08 118.81" />
              <path d="M 167.08 118.81 Q 80 110 0 130" />
              <path d="M 1000 130 Q 940 140 888.03 150.89" />
              <path d="M 524.11 110.81 Q 650 180 788.39 246.25" />
              <path d="M 788.39 246.25 Q 840 200 888.03 150.89" />
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
                >
                  {/* Target Shield Subtle Halo */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelectedTarget ? "7.5" : "5.5"}
                    fill="#10b981"
                    opacity={isSelectedTarget ? "0.3" : "0.15"}
                  />

                  {/* Datacenter Shield Hub Core */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelectedTarget ? "5.0" : "3.6"}
                    fill="#10b981"
                    filter="url(#glowGreen)"
                    className="transition-all duration-300"
                  />
                  <circle cx={cx} cy={cy} r="1.2" fill="#ffffff" />

                  {/* Monospace Badge Label */}
                  <g transform={`translate(${cx}, ${cy - 11})`}>
                    <rect
                      x="-36"
                      y="-11"
                      width="72"
                      height="13"
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
                      fontSize="7"
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

          {/* Threat Origin Beacons with Alert Severity Colors */}
          <g>
            {filteredArcs.map((arc) => {
              const [sx, sy] = projectCoordinates(arc.sourceCoords[0], arc.sourceCoords[1]);
              const isSelected = selectedArc?.id === arc.id;
              const severityCfg = ALERT_SEVERITY_CONFIG[arc.severity];
              const arcColor = severityCfg.color;

              return (
                <g
                  key={`origin-${arc.id}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedArc(arc);
                    if (onSelectThreat) onSelectThreat(arc);
                  }}
                >
                  {/* Origin Ambient Glow */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isSelected ? "7" : "5"}
                    fill={arcColor}
                    opacity={isSelected ? "0.35" : "0.18"}
                  />
                  {/* Outer Corona */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isSelected ? "4.5" : "3.2"}
                    fill={arcColor}
                    filter={severityCfg.glowFilter}
                    opacity="0.95"
                  />
                  {/* White Center Nucleus */}
                  <circle cx={sx} cy={sy} r={isSelected ? "1.6" : "1.1"} fill="#ffffff" />

                  {/* High-Contrast Monospace City Badge Label */}
                  <g transform={`translate(${sx}, ${sy + 10})`}>
                    <rect
                      x="-30"
                      y="-1"
                      width="60"
                      height="12"
                      rx="2.5"
                      fill="#030712"
                      stroke={isSelected ? arcColor : "#1e293b"}
                      strokeWidth={isSelected ? "1" : "0.75"}
                      opacity="0.94"
                    />
                    <text
                      x="0"
                      y="7.5"
                      textAnchor="middle"
                      fill="#f1f5f9"
                      fontSize="6.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {arc.sourceCity}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* ── PRISTINE BALLISTIC THREAT TRAJECTORIES (EXACT THREAT COLORS) ── */}
          <g>
            {filteredArcs.map((arc) => {
              const sourcePt = projectCoordinates(arc.sourceCoords[0], arc.sourceCoords[1]);
              const targetPt = projectCoordinates(arc.targetCoords[0], arc.targetCoords[1]);
              const d = getTrajectoryPath(sourcePt, targetPt);
              const isSelected = selectedArc?.id === arc.id;
              const severityCfg = ALERT_SEVERITY_CONFIG[arc.severity];
              const arcColor = severityCfg.color;

              return (
                <g
                  key={`arc-group-${arc.id}`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedArc(arc);
                    if (onSelectThreat) onSelectThreat(arc);
                  }}
                >
                  {/* Layer 1: Ambient Neon Glow Aura */}
                  <path
                    d={d}
                    fill="none"
                    stroke={arcColor}
                    strokeWidth={isSelected ? "5.5" : "3.8"}
                    strokeLinecap="round"
                    opacity={isSelected ? "0.6" : "0.32"}
                    filter={severityCfg.glowFilter}
                  />

                  {/* Layer 2: Core High-Definition Continuous Laser Beam */}
                  <path
                    d={d}
                    fill="none"
                    stroke={arcColor}
                    strokeWidth={isSelected ? "2.2" : "1.6"}
                    strokeLinecap="round"
                    opacity={isSelected ? "1" : "0.92"}
                  />

                  {/* Layer 3: Ultra-Fine Center Light Filament for Razor-Sharp Energy Core */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={isSelected ? "0.9" : "0.55"}
                    strokeLinecap="round"
                    opacity={isSelected ? "0.85" : "0.65"}
                  />

                  {/* Layer 4: High-Velocity Guided Photon Missile Nucleus */}
                  {isPlaying && (
                    <g>
                      {/* Outer Colored Photon Corona */}
                      <circle
                        r={isSelected ? "3.8" : "2.6"}
                        fill={arcColor}
                        filter={severityCfg.glowFilter}
                      >
                        <animateMotion
                          path={d}
                          dur={
                            arc.severity === "CRITICAL"
                              ? "2.0s"
                              : arc.severity === "HIGH"
                              ? "2.6s"
                              : arc.severity === "MEDIUM"
                              ? "3.2s"
                              : "3.8s"
                          }
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Inner White Photon Nucleus */}
                      <circle
                        r={isSelected ? "1.8" : "1.2"}
                        fill="#ffffff"
                      >
                        <animateMotion
                          path={d}
                          dur={
                            arc.severity === "CRITICAL"
                              ? "2.0s"
                              : arc.severity === "HIGH"
                              ? "2.6s"
                              : arc.severity === "MEDIUM"
                              ? "3.2s"
                              : "3.8s"
                          }
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Live Attack Metric Watermark */}
        <div className="absolute bottom-3 left-4 flex items-center gap-3 bg-[#030712]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>ACTIVE VECTORS:</span>
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

      {/* ── INTERACTIVE TIMELINE REPLAY SCRUBBER ── */}
      <div className="px-5 py-3 border-t border-[#1e293b] bg-[#050814] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition flex items-center gap-1.5"
            title={isPlaying ? "Pause Stream" : "Resume Playback"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="font-bold text-[11px]">{isPlaying ? "Pause" : "Replay"}</span>
          </button>

          <div className="flex items-center bg-[#030610] p-1 rounded-xl border border-slate-800">
            {(["LIVE", "15M", "1H", "6H", "24H"] as const).map((tw) => (
              <button
                key={tw}
                onClick={() => setTimeWindow(tw)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  timeWindow === tw
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tw}
              </button>
            ))}
          </div>
        </div>

        {/* Temporal Scrubber Slider */}
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="text-[10px] text-slate-500 whitespace-nowrap">T-24h</span>
          <input
            type="range"
            min="0"
            max={Math.max(1, arcs.length - 1)}
            value={timelineIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setTimelineIndex(idx);
              if (arcs[idx]) setSelectedArc(arcs[idx]);
            }}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">NOW</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 whitespace-nowrap">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{arcs.length} Ballistic Vectors Tracked</span>
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
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: selectedArc.color }}
                />
                <h4 className="text-sm font-bold text-white font-sans">{selectedArc.threatActor}</h4>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${ALERT_SEVERITY_CONFIG[selectedArc.severity].bgClass} ${ALERT_SEVERITY_CONFIG[selectedArc.severity].borderClass} ${ALERT_SEVERITY_CONFIG[selectedArc.severity].textClass}`}
                >
                  {selectedArc.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Origin: <span className="text-slate-200">{selectedArc.sourceCity}, {selectedArc.sourceCountry}</span>
                {" "}(<span style={{ color: selectedArc.color }}>{selectedArc.sourceIp}</span>)
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
              <FileCode className="w-3.5 h-3.5" style={{ color: selectedArc.color }} />
              <span>C2 Telemetry</span>
            </button>

            <button
              onClick={() => setShowOsintDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold transition shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>OSINT Brief</span>
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

            <pre
              className="p-3 rounded-xl bg-[#030610] border border-slate-800 text-xs font-mono overflow-x-auto max-h-64"
              style={{ color: selectedArc.color }}
            >
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

      {/* ── FULL OSINT INTELLIGENCE DRILLDOWN DRAWER ── */}
      {showOsintDrawer && selectedArc && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowOsintDrawer(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[51] w-full sm:w-[460px] bg-[#070c18] border-l border-cyan-500/30 shadow-[0_0_80px_rgba(0,0,0,0.95)] flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-[#0a1020] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    OSINT Dossier: {selectedArc.threatActor}
                    <span 
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${ALERT_SEVERITY_CONFIG[selectedArc.severity].bgClass} ${ALERT_SEVERITY_CONFIG[selectedArc.severity].borderClass} ${ALERT_SEVERITY_CONFIG[selectedArc.severity].textClass}`}
                    >
                      {selectedArc.severity}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Attribution, BGP Routing & Threat Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setShowOsintDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono text-xs text-slate-300">
              {/* Origin IP & ASN Card */}
              <div className="p-4 rounded-xl bg-[#040711] border border-slate-800 space-y-2.5">
                <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Adversary Infrastructure</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Source IP:</span>
                    <span className="font-bold text-white" style={{ color: selectedArc.color }}>{selectedArc.sourceIp}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Location:</span>
                    <span className="font-bold text-white">{selectedArc.sourceCity}, {selectedArc.sourceCountry}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ASN / ISP:</span>
                    <span className="text-slate-200">{selectedArc.sourceAsn}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reputation:</span>
                    <span className="text-red-400 font-bold">96/100 (Malicious C2)</span>
                  </div>
                </div>
              </div>

              {/* MITRE Technique */}
              <div className="p-4 rounded-xl bg-[#040711] border border-slate-800 space-y-2.5">
                <span className="text-[10px] uppercase text-amber-400 font-bold tracking-wider">Observed TTP & MITRE Matrix</span>
                <div>
                  <span className="text-slate-500 text-[10px] block">Technique ID:</span>
                  <span className="text-white font-bold">{selectedArc.mitreId} — {selectedArc.technique}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Target Infrastructure:</span>
                  <span className="text-emerald-300 font-semibold">{selectedArc.targetCity} ({selectedArc.targetRegion})</span>
                </div>
              </div>

              {/* Threat Actor Profile */}
              <div className="p-4 rounded-xl bg-[#040711] border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase text-purple-400 font-bold tracking-wider">Threat Actor Profile</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  State-sponsored threat cluster tracking back to sophisticated cyber-espionage and pre-ransomware staging campaigns. Known for living-off-the-land techniques (PowerShell, WMI) and rapid lateral movement.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Nation-State Sponsored", "Memory Scraping", "C2 Beaconing", "High Impact"].map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rapid Response Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Dual-Gated SOAR Response</span>
                <button
                  onClick={handleQuarantineC2}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-sans font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Isolate C2 Ingress ({selectedArc.sourceIp})</span>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = `/graph`;
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30 font-sans font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Pivot to Attack Path Graph Visualizer</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
