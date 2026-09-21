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
  ChevronRight
} from "lucide-react";

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [graphData, setGraphData] = useState<EvidenceGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"standard" | "tactical">("standard");

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

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={loadDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Console
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
        </div>
      </div>
    </AppShell>
  );
}
