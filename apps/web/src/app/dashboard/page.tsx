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
  { id: "tech", label: "Technology", value: 680, color: "#38BDF8" },
  { id: "gov", label: "Government", value: 620, color: "#60A5FA" },
  { id: "usa", label: "United States of America", value: 510, color: "#818CF8" },
  { id: "fin", label: "Finance", value: 490, color: "#38BDF8" },
  { id: "mfg", label: "Manufacturing", value: 380, color: "#60A5FA" },
  { id: "def", label: "Defense", value: 340, color: "#818CF8" },
  { id: "ind", label: "India", value: 310, color: "#38BDF8" },
  { id: "ukr", label: "Ukraine", value: 295, color: "#60A5FA" },
  { id: "health", label: "Healthcare", value: 280, color: "#818CF8" },
  { id: "media", label: "Media", value: 210, color: "#38BDF8" }
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

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#000000] text-neutral-100 font-sans">
        {/* Top Control Header */}
        <header className="h-16 border-b border-neutral-800/80 bg-[#050505] backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
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

          <div className="flex items-center gap-2.5 text-xs">
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setActiveDashboardTab("overview")}
                className={`px-3 py-1 rounded-md font-medium text-xs transition ${
                  activeDashboardTab === "overview" ? "bg-sky-500 text-neutral-950 font-semibold shadow-sm" : "text-neutral-400 hover:text-white"
                }`}
              >
                CTI Overview
              </button>
              <button
                onClick={() => setActiveDashboardTab("investigations")}
                className={`px-3 py-1 rounded-md font-medium text-xs transition ${
                  activeDashboardTab === "investigations" ? "bg-sky-500 text-neutral-950 font-semibold shadow-sm" : "text-neutral-400 hover:text-white"
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
              <RefreshCw className={`w-4 h-4 text-sky-400 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {/* Main Dashboard Body */}
        <div className="p-6 space-y-6 flex-1 bg-[#000000]">
          {activeDashboardTab === "overview" && (
            <div className="space-y-6">
              {/* Top OpenCTI KPI Stat Cards (4 Cards with 24h Vel) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Intrusion Sets */}
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800/80 hover:border-sky-500/40 transition-all space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase font-semibold tracking-wider text-[11px]">INTRUSION SETS</span>
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Crosshair className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-white tracking-tight font-mono">312</span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                      +12 <span className="text-[11px] text-neutral-500">(24h)</span>
                    </span>
                  </div>
                </div>

                {/* 2. Malware */}
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800/80 hover:border-red-500/40 transition-all space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase font-semibold tracking-wider text-[11px]">MALWARE</span>
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-white tracking-tight font-mono">1.18K</span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                      +117 <span className="text-[11px] text-neutral-500">(24h)</span>
                    </span>
                  </div>
                </div>

                {/* 3. Reports */}
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800/80 hover:border-purple-500/40 transition-all space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase font-semibold tracking-wider text-[11px]">REPORTS</span>
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-white tracking-tight font-mono">1.91K</span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                      +900 <span className="text-[11px] text-neutral-500">(24h)</span>
                    </span>
                  </div>
                </div>

                {/* 4. Indicators */}
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800/80 hover:border-emerald-500/40 transition-all space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase font-semibold tracking-wider text-[11px]">INDICATORS</span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-white tracking-tight font-mono">260.05K</span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                      +26,002 <span className="text-[11px] text-neutral-500">(24h)</span>
                    </span>
                  </div>
                </div>
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
                    <HorizontalBarChart items={MOST_ACTIVE_THREATS} maxValue={500} barColor="#F97316" />
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
                    <HorizontalBarChart items={MOST_TARGETED_SECTORS} maxValue={700} barColor="#38BDF8" />
                  </div>
                </div>

                {/* Relationships Created */}
                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800/80 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Relationships Created (Graph Activity)
                    </span>
                    <span className="text-[11px] text-sky-400 font-medium">Monthly Linkages</span>
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
                    <span className="text-[11px] text-sky-400 font-medium">Geointel Sensors</span>
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
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Latest Threat Intel Reports & Ingested STIX Feeds
                    </span>
                  </div>
                  <Link href="/intel" className="text-xs text-sky-400 hover:text-sky-300 hover:underline font-medium">
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
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-neutral-950 text-xs font-semibold hover:bg-sky-400 transition flex items-center gap-1.5"
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
      </div>
    </AppShell>
  );
}
