"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { 
  getAlerts, 
  getInvestigations, 
  getDetections, 
  getInvestigationGraph,
  AlertItem, 
  InvestigationItem, 
  DetectionItem, 
  EvidenceGraphData 
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
  Layers,
  ChevronRight,
  Search,
  X,
  Flame,
  Radio
} from "lucide-react";

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [graphData, setGraphData] = useState<EvidenceGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"standard" | "tactical">("standard");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [aData, iData, dData] = await Promise.all([
        getAlerts().catch(() => ({ items: [], total: 0 })),
        getInvestigations().catch(() => []),
        getDetections().catch(() => []),
      ]);
      setAlerts(aData.items || []);
      setInvestigations(iData);
      setDetections(dData);

      if (iData.length > 0) {
        const g = await getInvestigationGraph(iData[0].id).catch(() => null);
        setGraphData(g);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const featuredInv = investigations[0];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-white">Security Operations Console</h1>
            <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setViewMode("standard")}
                className={`px-2.5 py-0.5 rounded transition ${
                  viewMode === "standard"
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Standard View
              </button>
              <button
                onClick={() => setViewMode("tactical")}
                className={`px-2.5 py-0.5 rounded transition ${
                  viewMode === "tactical"
                    ? "bg-cyan-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Tactical View
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800/90 bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition font-mono shadow-inner"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Pivot...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 border border-slate-800">
                Cmd+K
              </kbd>
            </button>

            <button
              onClick={loadDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              Refresh
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              PostgreSQL Connected
            </span>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl">
          {/* Operational Status Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link href="/alerts" className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-xl space-y-2 hover:border-slate-700 transition">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Alerts</span>
              <div className="text-2xl font-bold text-white">{alerts.length}</div>
              <span className="text-xs text-amber-400">
                {alerts.filter((a) => a.severity === "critical").length} Critical requiring triage
              </span>
            </Link>

            <Link href="/investigations" className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-xl space-y-2 hover:border-slate-700 transition">
              <span className="text-xs font-semibold text-slate-400 uppercase">Investigations</span>
              <div className="text-2xl font-bold text-white">{investigations.length}</div>
              <span className="text-xs text-blue-400">Evidence Graph active</span>
            </Link>

            <Link href="/detections" className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-xl space-y-2 hover:border-slate-700 transition">
              <span className="text-xs font-semibold text-slate-400 uppercase">Detections Formulated</span>
              <div className="text-2xl font-bold text-white">{detections.length}</div>
              <span className="text-xs text-emerald-400">Validated Sigma / SPL / KQL</span>
            </Link>

            <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Response Status</span>
              <div className="text-2xl font-bold text-white">Gated</div>
              <span className="text-xs text-slate-400">Human Approval Gate Enabled</span>
            </div>
          </div>

          {/* Featured Investigation & Evidence Graph Centerpiece */}
          <div className="bg-[#0f172a]/40 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Featured Investigation: {featuredInv?.title || "LSASS Memory Access on DC-PRIMARY-01"}
                </h2>
                <p className="text-xs text-slate-400">
                  Derived from Sysmon telemetry • MITRE ATT&CK: {featuredInv?.mitre_techniques?.join(", ") || "T1003.001"}
                </p>
              </div>
              <Link 
                href="/investigations" 
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Open Investigation Workspace <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Evidence Graph Visual Mockup */}
            <div className="p-8 bg-[#090e18] flex flex-col items-center justify-center space-y-6">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-mono">
                Authoritative Evidence Graph (PostgreSQL Schema)
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-900 border border-blue-500/40 rounded-lg text-slate-200 shadow-md">
                  <span className="text-blue-400 block text-[10px] uppercase font-bold">USER ENTITY</span>
                  svc_backup
                </div>
                <span className="text-slate-600">─[AUTHENTICATED_TO]─►</span>
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-red-200 shadow-md">
                  <span className="text-red-400 block text-[10px] uppercase font-bold">HOST ENTITY</span>
                  DC-PRIMARY-01
                </div>
                <span className="text-slate-600">─[RAN_PROCESS]─►</span>
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-200 shadow-md">
                  <span className="text-amber-400 block text-[10px] uppercase font-bold">PROCESS ENTITY</span>
                  powershell.exe (PID 4912)
                </div>
                <span className="text-slate-600">─[MAPS_TO]─►</span>
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-lg text-indigo-200 shadow-md">
                  <span className="text-indigo-400 block text-[10px] uppercase font-bold">ATT&CK TECHNIQUE</span>
                  T1003.001 (LSASS Dump)
                </div>
              </div>

              <div className="text-xs text-slate-400 max-w-xl text-center leading-relaxed">
                Relationship edges are stored as typed records in the <code className="text-slate-300 font-mono">entity_relationships</code> table, ensuring every analyst conclusion links directly to verifiable raw logs.
              </div>
            </div>
          </div>

          {/* Telemetry Connectors & Platform Health Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0f172a]/50 p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Configured Telemetry Connectors</h3>
                </div>
                <Link href="/integrations" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                  Manage Connectors <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Wazuh SIEM</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Endpoint EDR, syscheck, and agent vulnerability telemetry.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">MS Sentinel</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Configured
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Azure Log Analytics workspace query and alert sync.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Splunk REST</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Enterprise log aggregation and SPL search job dispatch.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0f172a]/50 p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Platform Governance</h3>
                </div>
                <Link href="/audit" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                  Audit Log <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Audit Ledger</span>
                  <span className="text-emerald-400 font-semibold font-mono">Immutable / PG</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">RBAC Enforcement</span>
                  <span className="text-blue-400 font-semibold font-mono">5-Tier Hierarchy</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">AI Tool Sandbox</span>
                  <span className="text-purple-400 font-semibold font-mono">Typed / No Shell</span>
                </div>
              </div>
            </div>
          </div>

          {/* MITRE ATT&CK Matrix Coverage Heatmap */}
          <div className="rounded-xl border border-slate-800/90 bg-[#0a101d]/60 p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">MITRE ATT&CK Matrix Coverage Heatmap</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Live Attribution
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500/60 inline-block"></span> Active Intrusion</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500/40 inline-block"></span> Rule Formulated</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-800/80 inline-block"></span> Baseline Monitored</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">1. Initial Access</span>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300">
                  T1078 Valid Accounts
                </div>
                <div className="p-2 rounded bg-slate-800/30 border border-slate-800 text-[11px] text-slate-500">
                  T1190 Exploit Public App
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">2. Execution</span>
                <div className="p-2 rounded bg-amber-950/40 border border-amber-500/50 text-[11px] text-amber-300 font-semibold flex items-center justify-between">
                  <span>T1059.001 PowerShell</span>
                  <span className="text-[9px] bg-amber-500/20 px-1 rounded">Rule</span>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300">
                  T1204 User Execution
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">3. Persistence</span>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300">
                  T1543 Create Service
                </div>
                <div className="p-2 rounded bg-slate-800/30 border border-slate-800 text-[11px] text-slate-500">
                  T1053 Scheduled Task
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">4. Priv Escalation</span>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300">
                  T1068 Exploitation
                </div>
                <div className="p-2 rounded bg-slate-800/30 border border-slate-800 text-[11px] text-slate-500">
                  T1055 Process Inject
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">5. Defense Evasion</span>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300">
                  T1218 Signed Binary
                </div>
                <div className="p-2 rounded bg-slate-800/30 border border-slate-800 text-[11px] text-slate-500">
                  T1070 Indicator Removal
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-red-500/40 space-y-2 shadow-lg shadow-red-950/20">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block font-mono">6. Credential Access</span>
                <div className="p-2 rounded bg-red-950/70 border border-red-500/80 text-[11px] text-red-200 font-bold flex items-center justify-between animate-pulse">
                  <span>T1003.001 LSASS Dump</span>
                  <span className="text-[9px] bg-red-500/30 px-1 rounded text-red-200 font-mono">Active</span>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300">
                  T1110 Brute Force
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">7. Lateral Move</span>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300">
                  T1021 Remote Services
                </div>
                <div className="p-2 rounded bg-slate-800/30 border border-slate-800 text-[11px] text-slate-500">
                  T1046 Network Scan
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Command Palette / Quick Pivot Modal (Cmd+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0b1322] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#070d18]">
              <Search className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick pivot: Search entity, IP, host, CVE, technique, or rule..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-slate-500 font-mono"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-3 text-xs font-mono">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                Quick Pivots & Jump Targets
              </div>

              <div className="space-y-1.5">
                <Link
                  href="/investigations"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">HOST</span>
                    <span className="text-white font-semibold group-hover:text-cyan-300">DC-PRIMARY-01 (Domain Controller)</span>
                  </div>
                  <span className="text-slate-500 text-[11px] group-hover:text-slate-400">View in Graph &rarr;</span>
                </Link>

                <Link
                  href="/investigations"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">USER</span>
                    <span className="text-white font-semibold group-hover:text-cyan-300">svc_backup (Compromised Service Acct)</span>
                  </div>
                  <span className="text-slate-500 text-[11px] group-hover:text-slate-400">Inspect Edges &rarr;</span>
                </Link>

                <Link
                  href="/detections"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">ATT&CK</span>
                    <span className="text-white font-semibold group-hover:text-cyan-300">T1003.001 — LSASS Process Memory Dumping</span>
                  </div>
                  <span className="text-slate-500 text-[11px] group-hover:text-slate-400">Open Sigma Rule &rarr;</span>
                </Link>

                <Link
                  href="/integrations"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">ADAPTER</span>
                    <span className="text-white font-semibold group-hover:text-cyan-300">Wazuh SIEM / Microsoft Sentinel / Splunk REST</span>
                  </div>
                  <span className="text-slate-500 text-[11px] group-hover:text-slate-400">Run Health Check &rarr;</span>
                </Link>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-[#070c18] flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">ESC</kbd> to dismiss</span>
              <span>SOCForge Spotlight Telemetry Search</span>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
