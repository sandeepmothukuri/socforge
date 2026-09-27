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
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#070C18] text-[#F8FAFC]">
        {/* Top Control Header */}
        <header className="h-16 border-b border-[#1E293B] bg-[#0A0F1D] px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                SOCForge Threat Intelligence & Security Operations
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OpenCTI Architecture
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                Real-time CTI telemetry, adversary intrusion tracking & evidence-driven response
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-lg border border-[#1E293B]">
              <button
                onClick={() => setActiveDashboardTab("overview")}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  activeDashboardTab === "overview" ? "bg-[#38BDF8] text-[#070C18]" : "text-[#94A3B8] hover:text-white"
                }`}
              >
                CTI Overview
              </button>
              <button
                onClick={() => setActiveDashboardTab("investigations")}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  activeDashboardTab === "investigations" ? "bg-[#38BDF8] text-[#070C18]" : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Investigation Workbench
              </button>
            </div>

            <button
              onClick={loadData}
              className="p-2 rounded-lg border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {/* Main Dashboard Body */}
        <div className="p-6 space-y-6 flex-1">
          {activeDashboardTab === "overview" && (
            <div className="space-y-6">
              {/* Top OpenCTI KPI Stat Cards (4 Cards with 24h Vel) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                {/* 1. Intrusion Sets */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] hover:border-[#38BDF8]/40 transition space-y-2">
                  <div className="flex items-center justify-between text-[#64748B] text-xs">
                    <span className="uppercase font-bold tracking-wider">INTRUSION SETS</span>
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Crosshair className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">312</span>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      +12 <span className="text-[10px] text-[#64748B]">(24 hours)</span>
                    </span>
                  </div>
                </div>

                {/* 2. Malware */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] hover:border-red-500/40 transition space-y-2">
                  <div className="flex items-center justify-between text-[#64748B] text-xs">
                    <span className="uppercase font-bold tracking-wider">MALWARE</span>
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">1.18K</span>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      +117 <span className="text-[10px] text-[#64748B]">(24 hours)</span>
                    </span>
                  </div>
                </div>

                {/* 3. Reports */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] hover:border-purple-500/40 transition space-y-2">
                  <div className="flex items-center justify-between text-[#64748B] text-xs">
                    <span className="uppercase font-bold tracking-wider">REPORTS</span>
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">1.91K</span>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      +900 <span className="text-[10px] text-[#64748B]">(24 hours)</span>
                    </span>
                  </div>
                </div>

                {/* 4. Indicators */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] hover:border-emerald-500/40 transition space-y-2">
                  <div className="flex items-center justify-between text-[#64748B] text-xs">
                    <span className="uppercase font-bold tracking-wider">INDICATORS</span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">260.05K</span>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      +26002 <span className="text-[10px] text-[#64748B]">(24 hours)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 1: Threat Actors Bar Chart + Targeted Sectors Bar Chart + Relationships Created Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Most Active Threats */}
                <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E293B] space-y-3 flex flex-col font-mono">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      MOST ACTIVE THREATS (LAST 3 MONTHS)
                    </span>
                    <span className="text-[10px] text-[#64748B]">MAX 500</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <HorizontalBarChart items={MOST_ACTIVE_THREATS} maxValue={500} barColor="#F97316" />
                  </div>
                </div>

                {/* Most Targeted Victims */}
                <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E293B] space-y-3 flex flex-col font-mono">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      MOST TARGETED VICTIMS (LAST 3 MONTHS)
                    </span>
                    <span className="text-[10px] text-[#64748B]">MAX 700</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <HorizontalBarChart items={MOST_TARGETED_SECTORS} maxValue={700} barColor="#38BDF8" />
                  </div>
                </div>

                {/* Relationships Created */}
                <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E293B] space-y-3 flex flex-col font-mono">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      RELATIONSHIPS CREATED (GRAPH ACTIVITY)
                    </span>
                    <span className="text-[10px] text-[#38BDF8]">MONTHLY LINKAGES</span>
                  </div>
                  <div className="flex-1 min-h-[220px]">
                    <RelationshipTimelineChart />
                  </div>
                </div>
              </div>

              {/* Row 2: Most Active Malware (Polar Rose) + Most Active Vulnerabilities (CVE Ranker) + Targeted Countries (Geointel Map) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Most Active Malware (Polar Rose Chart) */}
                <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E293B] space-y-3 flex flex-col font-mono">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      MOST ACTIVE MALWARE (LAST 3 MONTHS)
                    </span>
                    <span className="text-[10px] text-[#64748B]">POLAR AREA</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <PolarRoseChart />
                  </div>
                </div>

                {/* Most Active Vulnerabilities (CVE Leaderboard) */}
                <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E293B] space-y-3 flex flex-col font-mono">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      MOST ACTIVE VULNERABILITIES (LAST 3 MONTHS)
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">CVE EXPLOITATION</span>
                  </div>
                  <div className="flex-1">
                    <TopVulnerabilitiesCard />
                  </div>
                </div>

                {/* Targeted Countries (Interactive World Map) */}
                <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E293B] space-y-3 flex flex-col font-mono">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      TARGETED COUNTRIES (LAST 3 MONTHS)
                    </span>
                    <span className="text-[10px] text-[#38BDF8]">GEOINTEL SENSORS</span>
                  </div>
                  <div className="flex-1 min-h-[220px]">
                    <WorldThreatMap />
                  </div>
                </div>
              </div>

              {/* Row 3: Latest Reports & Ingested Threat Intel Dossiers */}
              <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E293B] space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#38BDF8]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      LATEST THREAT INTEL REPORTS & INGESTED STIX FEEDS
                    </span>
                  </div>
                  <Link href="/intel" className="text-[11px] text-[#38BDF8] hover:underline font-bold">
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
              <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E293B] space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white">Active Investigation Evidence Graph</h2>
                    <p className="text-xs text-[#94A3B8]">Multi-hop entity correlation and graph relationships</p>
                  </div>
                  <Link
                    href="/graph"
                    className="px-3 py-1.5 rounded-lg bg-[#38BDF8] text-[#070C18] text-xs font-bold hover:bg-[#0284C7] transition flex items-center gap-1"
                  >
                    Open Attack Path Visualizer <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {graphData ? (
                  <EvidenceGraphVisualizer data={graphData} loading={loading} error={null} investigationTitle="Active Incident Investigation" />
                ) : (
                  <div className="p-12 border border-dashed border-[#1E293B] rounded-xl text-center text-[#64748B] text-xs">
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
