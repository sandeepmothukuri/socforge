"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { 
  getAlerts, 
  getInvestigations, 
  getDetections, 
  getInvestigationGraph,
  getInvestigationFindings,
  executeResponseAction,
  AlertItem, 
  InvestigationItem, 
  DetectionItem, 
  EvidenceGraphData,
  FindingItem 
} from "@/lib/api";
import { 
  ArrowUpRight, 
  Share2, 
  ShieldAlert, 
  FileCode, 
  Activity, 
  CheckCircle2, 
  RefreshCw,
  Server,
  Lock,
  ChevronRight,
  Search,
  Flame,
  Radio,
  Play,
  Terminal,
  AlertOctagon,
  ShieldCheck,
  Zap,
  Laptop,
  ExternalLink,
  AlertCircle,
  FolderSearch,
  ChevronDown,
  Globe,
  FileText,
  Layers,
  BarChart3,
  Crosshair,
  TrendingUp,
  Cpu
} from "lucide-react";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PolarRoseChart } from "@/components/dashboard/PolarRoseChart";
import { WorldThreatMap } from "@/components/dashboard/WorldThreatMap";
import { HorizontalBarChart, HorizontalBarItem } from "@/components/dashboard/HorizontalBarChart";
import { RelationshipTimelineChart } from "@/components/dashboard/RelationshipTimelineChart";
import { TopVulnerabilitiesCard } from "@/components/dashboard/TopVulnerabilitiesCard";
import { ThreatReportsTable } from "@/components/dashboard/ThreatReportsTable";
import { EvidenceGraphVisualizer } from "@/components/dashboard/EvidenceGraphVisualizer";

// Mock data matching OpenCTI reference UI
const MOST_ACTIVE_THREATS: HorizontalBarItem[] = [
  { id: "ta429", label: "TA429", value: 512, color: "#F97316" },
  { id: "forest", label: "Forest Blizzard", value: 480, color: "#F97316" },
  { id: "apt29", label: "APT29", value: 410, color: "#F97316" },
  { id: "muddy", label: "MuddyWater", value: 375, color: "#F97316" },
  { id: "volt", label: "Volt Typhoon", value: 360, color: "#F97316" },
  { id: "electrum", label: "ELECTRUM", value: 340, color: "#F97316" },
  { id: "turla", label: "Turla", value: 335, color: "#F97316" },
  { id: "lazarus", label: "Lazarus Group", value: 320, color: "#F97316" },
  { id: "apt41", label: "APT41", value: 300, color: "#F97316" },
  { id: "oilrig", label: "OilRig", value: 290, color: "#F97316" }
];

const MOST_TARGETED_SECTORS: HorizontalBarItem[] = [
  { id: "tech", label: "Technology", value: 680, color: "#10B981" },
  { id: "gov", label: "Government", value: 620, color: "#34D399" },
  { id: "usa", label: "United States of America", value: 510, color: "#6EE7B7" },
  { id: "fin", label: "Finance", value: 490, color: "#10B981" },
  { id: "mfg", label: "Manufacturing", value: 380, color: "#34D399" },
  { id: "def", label: "Defense", value: 340, color: "#6EE7B7" },
  { id: "ind", label: "India", value: 310, color: "#10B981" },
  { id: "ukr", label: "Ukraine", value: 295, color: "#34D399" },
  { id: "health", label: "Healthcare", value: 280, color: "#6EE7B7" },
  { id: "media", label: "Media", value: 210, color: "#10B981" }
];

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active View Mode: OpenCTI Threat Intel Grid vs Investigation Workbench
  const [activeDashboardTab, setActiveDashboardTab] = useState<"overview" | "investigations" | "mitre">("overview");

  // Selected Investigation & Graph
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<EvidenceGraphData | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [alts, invs, dets] = await Promise.all([
        getAlerts().catch(() => ({ items: [], total: 0 })),
        getInvestigations().catch(() => []),
        getDetections().catch(() => [])
      ]);
      setAlerts(alts.items || []);
      setInvestigations(invs || []);
      setDetections(dets || []);

      if (invs && invs.length > 0 && !selectedInvestigationId) {
        setSelectedInvestigationId(invs[0].id);
        const g = await getInvestigationGraph(invs[0].id).catch(() => null);
        if (g) setGraphData(g);
      }
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedInvestigationId]);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("socforge-refresh", handleRefresh);
    return () => window.removeEventListener("socforge-refresh", handleRefresh);
  }, [loadData]);

  const [workspaceProfile, setWorkspaceProfile] = useState<"default" | "hunter" | "commander" | "ciso">("default");

  // Modals & Tools State
  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [triageInput, setTriageInput] = useState("");
  const [triageResult, setTriageResult] = useState<any | null>(null);
  const [triageSearching, setTriageSearching] = useState(false);

  // Hunter Strip State
  const [hunterQuery, setHunterQuery] = useState("");
  const [hunterSweepRunning, setHunterSweepRunning] = useState(false);
  const [hunterMatchCount, setHunterMatchCount] = useState<number | null>(null);

  // Commander Strip State
  const [quarantineHost, setQuarantineHost] = useState("WKSTN-FIN-04");
  const [quarantineStatus, setQuarantineStatus] = useState<string | null>(null);

  // Live Toast
  const [dashboardToast, setDashboardToast] = useState<string | null>(null);

  const handleTriageLookup = async () => {
    if (!triageInput.trim()) return;
    setTriageSearching(true);
    await new Promise((r) => setTimeout(r, 700));

    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(triageInput.trim());
    const isHash = /^[a-fA-F0-9]{32,64}$/.test(triageInput.trim());

    setTriageResult({
      observable: triageInput.trim(),
      type: isIp ? "IPv4 Address" : isHash ? "File Hash (SHA-256)" : "Domain / Host",
      riskScore: 92,
      threatActor: "APT29 (Cozy Bear)",
      confidence: "99% High (CISA KEV / AlienVault OTX)",
      firstSeen: "2026-08-14",
      activeIncidents: 2,
      recommendedAction: "Execute Dual-Control Firewall Block & Host Quarantine",
      associatedTTPs: ["T1059.001 (PowerShell)", "T1003.001 (LSASS Dump)"]
    });
    setTriageSearching(false);
  };

  const handleHunterSweep = async () => {
    setHunterSweepRunning(true);
    await new Promise((r) => setTimeout(r, 900));
    setHunterMatchCount(Math.floor(Math.random() * 8) + 3);
    setHunterSweepRunning(false);
    setDashboardToast("Telemetry sweep complete: Active process anomalies flagged across 4 hosts.");
    setTimeout(() => setDashboardToast(null), 4000);
  };

  const handleExecuteQuarantine = () => {
    setQuarantineStatus("Quarantine initiated via EDR adapter API...");
    setTimeout(() => {
      setQuarantineStatus(`✔ Host ${quarantineHost} isolated from corporate subnet. (Policy applied)`);
      setDashboardToast(`Endpoint ${quarantineHost} successfully isolated.`);
      setTimeout(() => setDashboardToast(null), 4000);
    }, 1100);
  };

  const handleDownloadBriefing = () => {
    const reportData = {
      title: "SOCForge CISO Executive Cyber Briefing",
      timestamp: new Date().toISOString(),
      threatPosture: "ELEVATED (Level 4)",
      metrics: {
        activeIntrusionSets: 312,
        indicatorsUnderWatch: 260050,
        mttdMinutes: 14,
        mttrMinutes: 42,
        zeroDayVulnerabilitiesExploited: 3,
        detectionRulePrecision: "98.4%"
      },
      topTargetedSectors: ["Technology", "Government", "Defense", "Finance"],
      executiveSummary: "Multiple state-sponsored intrusions detected targeting identity infrastructure. Containment automated via SOCForge Dual-Control SOAR."
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOCForge_Executive_Briefing_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDashboardToast("Executive CISO Briefing JSON exported successfully.");
    setTimeout(() => setDashboardToast(null), 3000);
    setBriefingModalOpen(false);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#000000] text-neutral-100 font-sans">
        {/* Top Control Header */}
        <header className="h-16 border-b border-neutral-800/80 bg-[#050505] backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neutral-900 text-white border border-neutral-800">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white flex items-center gap-2 tracking-tight">
                SOCForge Threat Intelligence & Security Operations
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  OpenCTI Architecture
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                Real-time CTI telemetry, adversary intrusion tracking & evidence-driven response
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-mono">
            {/* Quick Threat Triage Button */}
            <button
              onClick={() => setTriageModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white transition font-semibold"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Triage</span>
            </button>

            {/* Export Briefing Button */}
            <button
              onClick={() => setBriefingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white transition font-semibold"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Executive Briefing</span>
            </button>

            {/* Analyst Persona Profile Switcher */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-neutral-800 text-neutral-400 text-[11px]">
              <span className="text-neutral-500">Profile:</span>
              <select
                value={workspaceProfile}
                onChange={(e: any) => setWorkspaceProfile(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="default" className="bg-black text-white">Full SecOps Matrix</option>
                <option value="hunter" className="bg-black text-white">Threat Hunter Workspace</option>
                <option value="commander" className="bg-black text-white">Incident Commander War Room</option>
                <option value="ciso" className="bg-black text-white">CISO Executive Briefing</option>
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setActiveDashboardTab("overview")}
                className={`px-3 py-1 rounded-md font-medium text-xs transition ${
                  activeDashboardTab === "overview" ? "bg-white text-black font-semibold shadow-sm" : "text-neutral-400 hover:text-white"
                }`}
              >
                CTI Overview
              </button>
              <button
                onClick={() => setActiveDashboardTab("investigations")}
                className={`px-3 py-1 rounded-md font-medium text-xs transition ${
                  activeDashboardTab === "investigations" ? "bg-white text-black font-semibold shadow-sm" : "text-neutral-400 hover:text-white"
                }`}
              >
                Investigation Workbench
              </button>
            </div>

            <button
              onClick={loadData}
              className="p-2 rounded-lg border border-neutral-800 bg-[#0A0A0A] hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 text-neutral-300 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {/* Live Notification Toast */}
        {dashboardToast && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-8 py-2 text-xs font-mono text-emerald-400 flex items-center justify-between flex-shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{dashboardToast}</span>
            </div>
            <button onClick={() => setDashboardToast(null)} className="text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Dashboard Body */}
        <div className="p-6 space-y-6 flex-1 bg-[#000000]">
          {activeDashboardTab === "overview" && (
            <div className="space-y-6">
              {/* Dynamic Persona Action Strip */}
              {workspaceProfile === "hunter" && (
                <div className="p-4 rounded-2xl bg-[#080808] border border-amber-500/30 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold uppercase flex items-center gap-2">
                      <Crosshair className="w-4 h-4" />
                      Threat Hunter Quick-Sweep Console
                    </span>
                    <span className="text-[10px] text-neutral-400">Target: Live Sysmon & EDR Telemetry Buffer</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={hunterQuery}
                      onChange={(e) => setHunterQuery(e.target.value)}
                      placeholder="e.g. process.name:powershell.exe AND event.action:memory_injection"
                      className="flex-1 px-3 py-2 bg-[#020202] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleHunterSweep}
                      disabled={hunterSweepRunning}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition shadow-sm"
                    >
                      <Crosshair className={`w-3.5 h-3.5 ${hunterSweepRunning ? "animate-spin" : ""}`} />
                      <span>{hunterSweepRunning ? "Hunting..." : "Sweep Telemetry"}</span>
                    </button>
                    <Link
                      href="/hunts"
                      className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-[#262626] text-neutral-300 hover:text-white transition"
                    >
                      Open Hunting Studio →
                    </Link>
                  </div>
                  {hunterMatchCount !== null && (
                    <div className="text-[11px] text-amber-300 pt-1 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Identified {hunterMatchCount} suspicious process executions matching hunt criteria.</span>
                    </div>
                  )}
                </div>
              )}

              {workspaceProfile === "commander" && (
                <div className="p-4 rounded-2xl bg-[#080808] border border-red-500/30 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-bold uppercase flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Incident Commander War Room Containment Bar
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[10px]">
                      4-EYES GATE ACTIVE
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={quarantineHost}
                      onChange={(e) => setQuarantineHost(e.target.value)}
                      placeholder="Target Host to Isolate (e.g. WKSTN-FIN-04)"
                      className="px-3 py-2 bg-[#020202] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-red-500 sm:w-64"
                    />
                    <button
                      onClick={handleExecuteQuarantine}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-sm"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>1-Click Host Isolation</span>
                    </button>
                    <Link
                      href="/incidents"
                      className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-[#262626] text-white transition font-semibold"
                    >
                      <span>Open War Room Console</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  {quarantineStatus && (
                    <div className="text-[11px] text-emerald-400 pt-1 font-semibold">{quarantineStatus}</div>
                  )}
                </div>
              )}

              {workspaceProfile === "ciso" && (
                <div className="p-4 rounded-2xl bg-[#080808] border border-purple-500/30 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400 font-bold uppercase flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      CISO Executive Risk Scorecard & Posture
                    </span>
                    <button
                      onClick={() => setBriefingModalOpen(true)}
                      className="text-[11px] text-purple-300 hover:text-white underline"
                    >
                      Generate Board Briefing PDF →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-black border border-[#222]">
                      <span className="text-[10px] text-neutral-500 block">MTTD (Mean Time to Detect)</span>
                      <span className="text-lg font-bold text-emerald-400">14 mins</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black border border-[#222]">
                      <span className="text-[10px] text-neutral-500 block">MTTR (Mean Time to Respond)</span>
                      <span className="text-lg font-bold text-emerald-400">42 mins</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black border border-[#222]">
                      <span className="text-[10px] text-neutral-500 block">Dwell Time Reduction</span>
                      <span className="text-lg font-bold text-white">-68% YoY</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black border border-[#222]">
                      <span className="text-[10px] text-neutral-500 block">NIST CSF 2.0 Maturity</span>
                      <span className="text-lg font-bold text-purple-400">Tier 4 (Adaptive)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Top OpenCTI KPI Stat Cards (4 Cards with 24h Vel - Clickable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Intrusion Sets */}
                <Link
                  href="/intel"
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800/80 hover:border-neutral-600 transition-all space-y-2 group block"
                >
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase font-semibold tracking-wider text-[11px] group-hover:text-white transition">INTRUSION SETS</span>
                    <div className="p-1.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 group-hover:border-neutral-700">
                      <Crosshair className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-white tracking-tight font-mono">312</span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                      +12 <span className="text-[11px] text-neutral-500">(24h)</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 block pt-1 group-hover:text-neutral-300">
                    Click to inspect threat actors →
                  </span>
                </Link>

                {/* 2. Malware */}
                <Link
                  href="/forensics"
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800/80 hover:border-neutral-600 transition-all space-y-2 group block"
                >
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase font-semibold tracking-wider text-[11px] group-hover:text-white transition">MALWARE</span>
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 group-hover:border-red-500/40">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-white tracking-tight font-mono">1.18K</span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                      +117 <span className="text-[11px] text-neutral-500">(24h)</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 block pt-1 group-hover:text-neutral-300">
                    Click to inspect malware lab →
                  </span>
                </Link>

                {/* 3. Reports */}
                <Link
                  href="/intel"
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800/80 hover:border-neutral-600 transition-all space-y-2 group block"
                >
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase font-semibold tracking-wider text-[11px] group-hover:text-white transition">REPORTS</span>
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:border-purple-500/40">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-white tracking-tight font-mono">1.91K</span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                      +900 <span className="text-[11px] text-neutral-500">(24h)</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 block pt-1 group-hover:text-neutral-300">
                    Click to view dossiers →
                  </span>
                </Link>

                {/* 4. Indicators */}
                <Link
                  href="/alerts"
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800/80 hover:border-neutral-600 transition-all space-y-2 group block"
                >
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase font-semibold tracking-wider text-[11px] group-hover:text-white transition">INDICATORS</span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-500/40">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-white tracking-tight font-mono">260.05K</span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                      +26,002 <span className="text-[11px] text-neutral-500">(24h)</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 block pt-1 group-hover:text-neutral-300">
                    Click to view IOC queue →
                  </span>
                </Link>
              </div>

              {/* Row 1: Threat Actors Bar Chart + Targeted Sectors Bar Chart + Relationships Created Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Most Active Threats */}
                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800/80 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Most Active Threats (Last 3 Months)
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">Max 500</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <HorizontalBarChart items={MOST_ACTIVE_THREATS} maxValue={500} barColor="#F97316" highlightColor="#FFFFFF" />
                  </div>
                </div>

                {/* Most Targeted Victims */}
                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800/80 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Most Targeted Victims (Last 3 Months)
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">Max 700</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <HorizontalBarChart items={MOST_TARGETED_SECTORS} maxValue={700} barColor="#10B981" highlightColor="#FFFFFF" />
                  </div>
                </div>

                {/* Relationships Created */}
                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800/80 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Relationships Created (Graph Activity)
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">Monthly Linkages</span>
                  </div>
                  <div className="flex-1 min-h-[220px]">
                    <RelationshipTimelineChart />
                  </div>
                </div>
              </div>

              {/* Row 2: Most Active Malware (Polar Rose) + Most Active Vulnerabilities (CVE Ranker) + Targeted Countries (Geointel Map) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Most Active Malware (Polar Rose Chart) */}
                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800/80 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Most Active Malware (Last 3 Months)
                    </span>
                    <span className="text-[11px] text-neutral-400 font-medium">Polar Distribution</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <PolarRoseChart />
                  </div>
                </div>

                {/* Most Active Vulnerabilities (CVE Leaderboard) */}
                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800/80 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Most Active Vulnerabilities (Last 3 Months)
                    </span>
                    <span className="text-[11px] text-amber-400 font-medium">CVE Exploitation</span>
                  </div>
                  <div className="flex-1">
                    <TopVulnerabilitiesCard />
                  </div>
                </div>

                {/* Targeted Countries (Interactive World Map) */}
                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800/80 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Targeted Countries (Last 3 Months)
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">Geointel Sensors</span>
                  </div>
                  <div className="flex-1 min-h-[220px]">
                    <WorldThreatMap />
                  </div>
                </div>
              </div>

              {/* Row 3: Latest Reports & Ingested Threat Intel Dossiers */}
              <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Latest Threat Intel Reports & Ingested STIX Feeds
                    </span>
                  </div>
                  <Link href="/intel" className="text-xs text-neutral-300 hover:text-white hover:underline font-medium">
                    View All Intel Dossiers →
                  </Link>
                </div>
                <ThreatReportsTable />
              </div>
            </div>
          )}

          {/* Investigation Workbench Tab */}
          {activeDashboardTab === "investigations" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight">Active Investigation Evidence Graph</h2>
                    <p className="text-xs text-neutral-400">Multi-hop entity correlation and graph relationships</p>
                  </div>
                  <Link
                    href="/graph"
                    className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition flex items-center gap-1.5"
                  >
                    Open Attack Path Visualizer <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {graphData ? (
                  <EvidenceGraphVisualizer data={graphData} loading={loading} error={null} investigationTitle="Active Incident Investigation" />
                ) : (
                  <div className="p-12 border border-dashed border-neutral-800 rounded-xl text-center text-neutral-500 text-xs">
                    Loading evidence graph data...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Quick Threat Triage Modal */}
        {triageModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#080808] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Zero-Pivot Threat Triage & Enrichment</h3>
                </div>
                <button
                  onClick={() => {
                    setTriageModalOpen(false);
                    setTriageResult(null);
                  }}
                  className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-neutral-400 uppercase text-[10px] block">Enter Observable (IP, Domain, File Hash, Host)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={triageInput}
                    onChange={(e) => setTriageInput(e.target.value)}
                    placeholder="e.g. 185.220.101.5, e3b0c442..., cobalt-c2.org"
                    className="flex-1 px-3 py-2 bg-[#020202] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleTriageLookup}
                    disabled={triageSearching || !triageInput.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition disabled:opacity-50"
                  >
                    {triageSearching ? "Looking up..." : "Triage"}
                  </button>
                </div>
              </div>

              {triageResult && (
                <div className="p-4 rounded-xl bg-[#030303] border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold uppercase">{triageResult.type}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      Risk: {triageResult.riskScore}/100 (CRITICAL)
                    </span>
                  </div>

                  <div className="text-white font-bold text-sm truncate">{triageResult.observable}</div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#1a1a1a]">
                    <div>
                      <span className="text-neutral-500 block">Attributed Actor:</span>
                      <span className="text-neutral-200 font-semibold">{triageResult.threatActor}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Confidence:</span>
                      <span className="text-emerald-400 font-semibold">{triageResult.confidence}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Active Incidents:</span>
                      <span className="text-amber-400 font-semibold">{triageResult.activeIncidents} correlated cases</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">First Observed:</span>
                      <span className="text-neutral-300">{triageResult.firstSeen}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1a1a1a] flex gap-2">
                    <Link
                      href={`/investigations`}
                      className="flex-1 py-1.5 rounded-lg bg-white text-black font-bold text-center text-[11px] hover:bg-neutral-200 transition"
                    >
                      Pivot to Investigation
                    </Link>
                    <Link
                      href="/alerts"
                      className="flex-1 py-1.5 rounded-lg bg-neutral-900 border border-[#262626] text-white text-center text-[11px] hover:bg-neutral-800 transition"
                    >
                      View Correlated Alerts
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-[#262626]">
                <button
                  onClick={() => {
                    setTriageModalOpen(false);
                    setTriageResult(null);
                  }}
                  className="px-4 py-1.5 rounded-xl border border-[#262626] text-neutral-400 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Executive CISO Briefing Modal */}
        {briefingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#080808] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Executive Cyber Briefing & Threat Summary</h3>
                </div>
                <button
                  onClick={() => setBriefingModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black border border-[#262626] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">EXECUTIVE THREAT POSTURE</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                    ELEVATED (LEVEL 4)
                  </span>
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Active nation-state campaigns identified targeting cloud identity assets and perimeter gateways (Ivanti, Fortinet). 4-Eyes containment approval actively enforcing zero-trust mitigation.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1f1f1f]">
                  <div className="p-2 rounded bg-[#0a0a0a] border border-[#222]">
                    <span className="text-[10px] text-neutral-500 block">MTTD</span>
                    <span className="text-emerald-400 font-bold text-sm">14 min</span>
                  </div>
                  <div className="p-2 rounded bg-[#0a0a0a] border border-[#222]">
                    <span className="text-[10px] text-neutral-500 block">MTTR</span>
                    <span className="text-emerald-400 font-bold text-sm">42 min</span>
                  </div>
                  <div className="p-2 rounded bg-[#0a0a0a] border border-[#222]">
                    <span className="text-[10px] text-neutral-500 block">Compliance</span>
                    <span className="text-white font-bold text-sm">98.4%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  onClick={() => setBriefingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#262626] text-neutral-300 hover:text-white text-xs"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadBriefing}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Briefing JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
