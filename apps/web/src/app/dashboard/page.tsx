"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { 
  getAlerts, 
  getInvestigations, 
  getDetections, 
  getInvestigationGraph,
  runDemoWorkflow,
  executeResponseAction,
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
  ChevronRight,
  Search,
  Flame,
  Radio,
  Play,
  Terminal,
  AlertOctagon,
  ShieldCheck,
  Zap
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [graphData, setGraphData] = useState<EvidenceGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"standard" | "tactical">("standard");
  const [searchOpen, setSearchOpen] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoLogs, setDemoLogs] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "tactical") {
        setViewMode("tactical");
      }
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setDemoModalOpen(false);
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
      const alertItems = Array.isArray(aData) ? aData : aData?.items || [];
      const invItems = Array.isArray(iData) ? iData : (iData as any)?.items || [];
      const detItems = Array.isArray(dData) ? dData : (dData as any)?.items || [];

      setAlerts(alertItems);
      setInvestigations(invItems);
      setDetections(detItems);

      if (invItems.length > 0) {
        const g = await getInvestigationGraph(invItems[0].id).catch(() => null);
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

  async function handleRunDemo() {
    setDemoRunning(true);
    setDemoModalOpen(true);
    setDemoLogs(["Initializing SOCForge deterministic demo workflow..."]);
    try {
      const res = await runDemoWorkflow();
      setDemoLogs(res.steps);
      await loadDashboard();
    } catch (err: any) {
      setDemoLogs((prev) => [...prev, `Execution failed: ${err.message}`]);
    } finally {
      setDemoRunning(false);
    }
  }

  async function triggerContainmentAction(actionType: string, targetVal: string) {
    setActionNotice(`Executing simulated containment: ${actionType} on ${targetVal}...`);
    try {
      await executeResponseAction(actionType, "endpoint", targetVal, "Analyst tactical response trigger");
      setActionNotice(`Action ${actionType} completed safely [SIMULATED]`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setActionNotice(`Action failed: ${err.message}`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  }

  const alertList = Array.isArray(alerts) ? alerts : (alerts as any)?.items || [];
  const invList = Array.isArray(investigations) ? investigations : (investigations as any)?.items || [];
  const detList = Array.isArray(detections) ? detections : (detections as any)?.items || [];
  const featuredInv = invList[0];
  const criticalAlerts = alertList.filter((a: any) => a?.severity === "critical");

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0B1020] text-[#F8FAFC]">
        {/* Header with View Toggle & Action Controls */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626]/80 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SocForgeLogo size="sm" showWordmark={false} />
              <h1 className="text-sm font-bold tracking-tight text-[#F8FAFC]">
                Operations Console
              </h1>
            </div>

            {/* Standard / Tactical View Switcher */}
            <div className="flex items-center bg-[#151C2E] p-1 rounded-lg border border-[#263248] text-xs font-mono">
              <button
                onClick={() => setViewMode("standard")}
                className={`px-3 py-1 rounded transition font-medium ${
                  viewMode === "standard"
                    ? "bg-[#38BDF8] text-[#0B1020] font-bold shadow-sm"
                    : "text-[#A7B0C0] hover:text-[#F8FAFC]"
                }`}
              >
                Standard View
              </button>
              <button
                onClick={() => setViewMode("tactical")}
                className={`px-3 py-1 rounded transition font-medium flex items-center gap-1.5 ${
                  viewMode === "tactical"
                    ? "bg-[#EF4444] text-white font-bold shadow-sm animate-pulse"
                    : "text-[#A7B0C0] hover:text-[#F8FAFC]"
                }`}
              >
                <Radio className="w-3 h-3" />
                Tactical View
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Quick Pivot (Cmd+K) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#263248] bg-[#151C2E] text-[#A7B0C0] hover:text-[#F8FAFC] transition font-mono"
            >
              <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Quick Pivot...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#111827] text-[10px] text-[#6B7280] border border-[#263248]">
                Cmd+K
              </kbd>
            </button>

            {/* Run Demo Button */}
            <button
              onClick={handleRunDemo}
              disabled={demoRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 text-[#38BDF8] transition font-semibold"
            >
              <Play className={`w-3.5 h-3.5 ${demoRunning ? "animate-spin" : ""}`} />
              <span>Run SOCForge Demo</span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#263248] bg-[#151C2E] text-[#A7B0C0] hover:text-[#F8FAFC] transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#38BDF8]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Action Notice Notification */}
        {actionNotice && (
          <div className="bg-[#151C2E] border-b border-[#38BDF8]/40 px-6 py-2.5 text-xs text-[#38BDF8] flex items-center justify-between font-mono animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#38BDF8]" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-[#6B7280] hover:text-[#F8FAFC]">×</button>
          </div>
        )}

        {/* ── TACTICAL VIEW MODE ──────────────────────────────────────────────── */}
        {viewMode === "tactical" ? (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-150">
            {/* Tactical Banner */}
            <div className="bg-[#151C2E] border-l-4 border-l-[#EF4444] border border-[#263248] rounded-r-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-[#EF4444] animate-ping" />
                  <span className="text-xs font-mono uppercase font-bold text-[#EF4444] tracking-wider">
                    DEFCON 2 — High-Density Tactical Operations Mode Active
                  </span>
                </div>
                <p className="text-xs text-[#A7B0C0]">
                  Live telemetry stream filtered to critical threat detections and containment queues.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] font-bold">
                  {criticalAlerts.length} Critical Threats
                </span>
                <span className="px-2.5 py-1 rounded bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8]">
                  Auto-Triage Active
                </span>
              </div>
            </div>

            {/* Tactical Rapid Response Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Critical Threat Ticker & Quick Containment */}
              <div className="lg:col-span-2 bg-[#151C2E] border border-[#263248] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#263248] pb-3">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-[#EF4444]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                      Urgent Intrusion Queue & Rapid Response
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#A7B0C0]">
                    {criticalAlerts.length} Events Pending Action
                  </span>
                </div>

                <div className="space-y-3">
                  {criticalAlerts.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#6B7280] font-mono">
                      No active critical threats. System operating in baseline parameters.
                    </div>
                  ) : (
                    criticalAlerts.slice(0, 5).map((alert: any) => (
                      <div
                        key={alert.id}
                        className="p-3.5 rounded bg-[#111827] border border-[#263248] flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={alert.severity} size="sm" />
                            <span className="font-semibold text-xs text-[#F8FAFC]">{alert.title}</span>
                          </div>
                          <div className="text-[11px] text-[#A7B0C0] font-mono flex items-center gap-3">
                            <span>Host: <strong className="text-white">{alert.source_host || "DC01"}</strong></span>
                            <span>Proc: <strong className="text-white">{alert.process_name || "powershell.exe"}</strong></span>
                            <span>User: <strong className="text-white">{alert.username || "SYSTEM"}</strong></span>
                          </div>
                        </div>

                        {/* Fast Containment Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => triggerContainmentAction("isolate_host", alert.source_host || "DC-PRIMARY-01")}
                            className="px-2.5 py-1 rounded bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/40 text-[11px] font-mono font-bold transition"
                            title="Simulated Host Network Isolation"
                          >
                            Isolate Host
                          </button>
                          <button
                            onClick={() => triggerContainmentAction("revoke_session", alert.username || "SYSTEM")}
                            className="px-2.5 py-1 rounded bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#F59E0B] border border-[#F59E0B]/40 text-[11px] font-mono font-bold transition"
                            title="Revoke Credentials / Tokens"
                          >
                            Revoke User
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tactical Containment Status */}
              <div className="bg-[#151C2E] border border-[#263248] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#263248] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                      Containment Status
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 font-bold">
                    ACTIVE GATE
                  </span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded bg-[#111827] border border-[#263248] flex items-center justify-between">
                    <span className="text-[#A7B0C0]">Host Isolation Adapter</span>
                    <span className="text-[#38BDF8]">Simulated EDR</span>
                  </div>
                  <div className="p-3 rounded bg-[#111827] border border-[#263248] flex items-center justify-between">
                    <span className="text-[#A7B0C0]">Firewall ACL Null Route</span>
                    <span className="text-[#22C55E]">Ready (dry_run)</span>
                  </div>
                  <div className="p-3 rounded bg-[#111827] border border-[#263248] flex items-center justify-between">
                    <span className="text-[#A7B0C0]">Four-Eyes Separation</span>
                    <span className="text-[#22C55E]">Enforced</span>
                  </div>
                  <div className="p-3 rounded bg-[#111827] border border-[#263248] flex items-center justify-between">
                    <span className="text-[#A7B0C0]">Immutable Audit Trail</span>
                    <span className="text-[#38BDF8]">Logging ON</span>
                  </div>
                </div>

                <Link
                  href="/responses"
                  className="block text-center text-xs font-semibold py-2 rounded bg-[#172033] hover:bg-[#1E293B] text-[#38BDF8] border border-[#263248] transition"
                >
                  Inspect Approval Ledger →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── STANDARD VIEW MODE ──────────────────────────────────────────────── */
          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Operational Status Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Link href="/alerts">
                <MetricCard
                  title="Active Alerts"
                  value={alertList.length}
                  badge={`${criticalAlerts.length} Critical`}
                  subtext="Requiring investigation"
                  change={criticalAlerts.length > 0 ? "Requires Triage" : "Normal"}
                  isPositive={criticalAlerts.length === 0}
                  icon={ShieldAlert}
                />
              </Link>

              <Link href="/investigations">
                <MetricCard
                  title="Investigations"
                  value={invList.length}
                  badge="Evidence Graph"
                  subtext="Correlated attack paths"
                  icon={Share2}
                />
              </Link>

              <Link href="/detections">
                <MetricCard
                  title="Detection Rules"
                  value={detList.length}
                  badge="Sigma • SPL • KQL"
                  subtext="Multi-format rule catalog"
                  icon={FileCode}
                />
              </Link>

              <Link href="/responses">
                <MetricCard
                  title="Containment Policy"
                  value="Dual-Gated"
                  badge="Four-Eyes Gate"
                  subtext="Safe simulated adapters"
                  icon={Lock}
                />
              </Link>
            </div>

            {/* Featured Investigation & Evidence Graph Centerpiece */}
            <div className="bg-[#151C2E] border border-[#263248] rounded-xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-[#263248] flex items-center justify-between bg-[#111827]/80">
                <div>
                  <h2 className="text-sm font-bold text-[#F8FAFC]">
                    Featured Investigation: {featuredInv?.title || "LSASS Memory Access on DC-PRIMARY-01"}
                  </h2>
                  <p className="text-xs text-[#A7B0C0] font-mono mt-0.5">
                    MITRE ATT&CK: {featuredInv?.mitre_techniques?.join(", ") || "T1003.001"} • Relational Graph Model
                  </p>
                </div>
                <Link 
                  href="/investigations" 
                  className="text-xs font-semibold text-[#38BDF8] hover:text-[#38BDF8]/80 flex items-center gap-1"
                >
                  Open Investigation Studio <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Evidence Graph Visual Representation */}
              <div className="p-8 bg-[#0B1020] flex flex-col items-center justify-center space-y-6">
                <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-mono">
                  Authoritative Evidence Graph (PostgreSQL Schema)
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
                  <div className="p-3 bg-[#151C2E] border border-[#38BDF8]/50 rounded-lg text-[#F8FAFC] shadow-md">
                    <span className="text-[#38BDF8] block text-[10px] uppercase font-bold">USER ENTITY</span>
                    svc_backup
                  </div>
                  <span className="text-[#6B7280]">─[AUTHENTICATED_TO]─►</span>
                  <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/50 rounded-lg text-red-200 shadow-md">
                    <span className="text-[#EF4444] block text-[10px] uppercase font-bold">HOST ENTITY</span>
                    DC-PRIMARY-01
                  </div>
                  <span className="text-[#6B7280]">─[RAN_PROCESS]─►</span>
                  <div className="p-3 bg-[#F59E0B]/15 border border-[#F59E0B]/50 rounded-lg text-amber-200 shadow-md">
                    <span className="text-[#F59E0B] block text-[10px] uppercase font-bold">PROCESS ENTITY</span>
                    powershell.exe (PID 4912)
                  </div>
                  <span className="text-[#6B7280]">─[MAPS_TO]─►</span>
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/50 rounded-lg text-indigo-200 shadow-md">
                    <span className="text-indigo-400 block text-[10px] uppercase font-bold">ATT&CK TECHNIQUE</span>
                    T1003.001 (LSASS Dump)
                  </div>
                </div>

                <div className="text-xs text-[#A7B0C0] max-w-xl text-center leading-relaxed">
                  Relationship edges are persisted in PostgreSQL with strict foreign keys to raw events, ensuring verifiable audit trails for detection engineers and responders.
                </div>
              </div>
            </div>

            {/* Telemetry Connectors Hub & Governance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-[#263248] bg-[#151C2E] p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Server className="w-4 h-4 text-[#38BDF8]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">Configured Connectors</h3>
                  </div>
                  <Link href="/integrations" className="text-xs text-[#38BDF8] hover:underline font-semibold flex items-center gap-1">
                    Manage Connectors <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#111827] border border-[#263248] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Wazuh SIEM</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 font-semibold">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A7B0C0]">EDR, syscheck, and agent vulnerability telemetry.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111827] border border-[#263248] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">MS Sentinel</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/40 font-semibold">
                        Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A7B0C0]">Azure Log Analytics workspace query & alert sync.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111827] border border-[#263248] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Splunk REST</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 font-semibold">
                        Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A7B0C0]">Enterprise log aggregation and SPL search job dispatch.</p>
                  </div>
                </div>
              </div>

              {/* Platform Governance Panel */}
              <div className="rounded-xl border border-[#263248] bg-[#151C2E] p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">Platform Governance</h3>
                  </div>
                  <Link href="/audit" className="text-xs text-[#38BDF8] hover:underline font-semibold flex items-center gap-1">
                    Audit Log <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[#111827] border border-[#263248] flex items-center justify-between">
                    <span className="text-[#A7B0C0]">Audit Ledger</span>
                    <span className="text-[#22C55E] font-semibold">Immutable / PG</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111827] border border-[#263248] flex items-center justify-between">
                    <span className="text-[#A7B0C0]">RBAC Roles</span>
                    <span className="text-[#38BDF8] font-semibold">5-Tier Hierarchy</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111827] border border-[#263248] flex items-center justify-between">
                    <span className="text-[#A7B0C0]">AI Tool Sandbox</span>
                    <span className="text-purple-400 font-semibold">Typed / No Shell</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MITRE ATT&CK Matrix Coverage Heatmap */}
            <div className="rounded-xl border border-[#263248] bg-[#151C2E] p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-[#38BDF8]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">MITRE ATT&CK Coverage Matrix</h3>
                </div>
                <div className="text-xs text-[#A7B0C0] font-mono flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#EF4444] inline-block" /> Active Intrusion</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#F59E0B] inline-block" /> Rule Formulated</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#263248] inline-block" /> Baseline Monitored</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#111827] border border-[#263248] space-y-2">
                  <span className="text-[10px] font-bold text-[#A7B0C0] uppercase tracking-wider block font-mono">1. Initial Access</span>
                  <div className="p-2 rounded bg-[#172033] border border-[#263248] text-[11px] text-[#F8FAFC]">
                    T1078 Valid Accounts
                  </div>
                  <div className="p-2 rounded bg-[#0B1020] border border-[#1E293B] text-[11px] text-[#6B7280]">
                    T1190 Exploit Public App
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263248] space-y-2">
                  <span className="text-[10px] font-bold text-[#A7B0C0] uppercase tracking-wider block font-mono">2. Execution</span>
                  <div className="p-2 rounded bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[11px] text-[#F59E0B] font-semibold flex items-center justify-between">
                    <span>T1059.001 PowerShell</span>
                    <span className="text-[9px] bg-[#F59E0B]/20 px-1 rounded">Rule</span>
                  </div>
                  <div className="p-2 rounded bg-[#172033] border border-[#263248] text-[11px] text-[#F8FAFC]">
                    T1204 User Execution
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263248] space-y-2">
                  <span className="text-[10px] font-bold text-[#A7B0C0] uppercase tracking-wider block font-mono">3. Persistence</span>
                  <div className="p-2 rounded bg-[#172033] border border-[#263248] text-[11px] text-[#F8FAFC]">
                    T1543 Create Service
                  </div>
                  <div className="p-2 rounded bg-[#0B1020] border border-[#1E293B] text-[11px] text-[#6B7280]">
                    T1053 Scheduled Task
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263248] space-y-2">
                  <span className="text-[10px] font-bold text-[#A7B0C0] uppercase tracking-wider block font-mono">4. Priv Escalation</span>
                  <div className="p-2 rounded bg-[#172033] border border-[#263248] text-[11px] text-[#F8FAFC]">
                    T1068 Exploitation
                  </div>
                  <div className="p-2 rounded bg-[#0B1020] border border-[#1E293B] text-[11px] text-[#6B7280]">
                    T1055 Process Inject
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263248] space-y-2">
                  <span className="text-[10px] font-bold text-[#A7B0C0] uppercase tracking-wider block font-mono">5. Defense Evasion</span>
                  <div className="p-2 rounded bg-[#172033] border border-[#263248] text-[11px] text-[#F8FAFC]">
                    T1218 Signed Binary
                  </div>
                  <div className="p-2 rounded bg-[#0B1020] border border-[#1E293B] text-[11px] text-[#6B7280]">
                    T1070 Indicator Removal
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#EF4444]/40 space-y-2 shadow-lg">
                  <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider block font-mono">6. Cred Access</span>
                  <div className="p-2 rounded bg-[#EF4444]/20 border border-[#EF4444]/60 text-[11px] text-red-200 font-bold flex items-center justify-between animate-pulse">
                    <span>T1003.001 LSASS Dump</span>
                    <span className="text-[9px] bg-[#EF4444]/30 px-1 rounded text-red-200 font-mono">Active</span>
                  </div>
                  <div className="p-2 rounded bg-[#172033] border border-[#263248] text-[11px] text-[#F8FAFC]">
                    T1110 Brute Force
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263248] space-y-2">
                  <span className="text-[10px] font-bold text-[#A7B0C0] uppercase tracking-wider block font-mono">7. Lateral Move</span>
                  <div className="p-2 rounded bg-[#172033] border border-[#263248] text-[11px] text-[#F8FAFC]">
                    T1021 Remote Services
                  </div>
                  <div className="p-2 rounded bg-[#0B1020] border border-[#1E293B] text-[11px] text-[#6B7280]">
                    T1046 Network Scan
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive SOCForge Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#111827] border border-[#38BDF8]/40 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#263248] flex items-center justify-between bg-[#0B1020]">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  SOCForge End-to-End Demo Workflow
                </span>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-[#A7B0C0] hover:text-white text-lg font-mono"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                Executing automated telemetry ingestion, evidence graph correlation, analytical finding derivation, Sigma rule formulation, and precision replay against <code className="text-[#38BDF8]">synthetic-soc-v1.json</code>.
              </p>

              <div className="bg-[#0B1020] border border-[#263248] rounded-lg p-3 font-mono text-xs max-h-60 overflow-y-auto space-y-1.5">
                {demoLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#38BDF8]">›</span>
                    <span className={log.includes("Complete") || log.includes("created") || log.includes("Authenticated") ? "text-[#22C55E]" : log.includes("Error") ? "text-[#EF4444]" : "text-[#F8FAFC]"}>
                      {log}
                    </span>
                  </div>
                ))}
                {demoRunning && (
                  <div className="flex items-center gap-2 text-[#38BDF8] animate-pulse">
                    <span>›</span>
                    <span>Processing live telemetry pipeline...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#263248] bg-[#0B1020] flex items-center justify-end">
              <button
                onClick={() => setDemoModalOpen(false)}
                className="px-4 py-1.5 rounded bg-[#38BDF8] text-[#0B1020] font-semibold text-xs hover:bg-[#38BDF8]/90 transition"
              >
                Close & View Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette / Quick Pivot Modal (Cmd+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#111827] border border-[#38BDF8]/40 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-[#263248] flex items-center gap-3 bg-[#0B1020]">
              <Search className="w-4 h-4 text-[#38BDF8]" />
              <input
                type="text"
                autoFocus
                placeholder="Search alerts, entities, MITRE techniques (T1003.001)..."
                className="bg-transparent border-none outline-none text-xs text-[#F8FAFC] placeholder-[#6B7280] flex-1 font-mono"
              />
              <button onClick={() => setSearchOpen(false)} className="text-[#A7B0C0] hover:text-white">
                Esc
              </button>
            </div>
            <div className="p-4 text-xs font-mono text-[#A7B0C0] space-y-2">
              <div className="text-[10px] uppercase font-bold text-[#6B7280]">Quick Nav Shortcuts</div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/alerts" onClick={() => setSearchOpen(false)} className="p-2 rounded bg-[#151C2E] hover:bg-[#172033] text-[#F8FAFC]">
                  → Alerts Queue (/alerts)
                </Link>
                <Link href="/investigations" onClick={() => setSearchOpen(false)} className="p-2 rounded bg-[#151C2E] hover:bg-[#172033] text-[#F8FAFC]">
                  → Investigations & Graph (/investigations)
                </Link>
                <Link href="/detections" onClick={() => setSearchOpen(false)} className="p-2 rounded bg-[#151C2E] hover:bg-[#172033] text-[#F8FAFC]">
                  → Detection Studio (/detections)
                </Link>
                <Link href="/responses" onClick={() => setSearchOpen(false)} className="p-2 rounded bg-[#151C2E] hover:bg-[#172033] text-[#F8FAFC]">
                  → Response Ledger (/responses)
                </Link>
                <Link href="/integrations" onClick={() => setSearchOpen(false)} className="p-2 rounded bg-[#151C2E] hover:bg-[#172033] text-[#F8FAFC]">
                  → Connectors (/integrations)
                </Link>
                <Link href="/dashboard?view=tactical" onClick={() => { setViewMode("tactical"); setSearchOpen(false); }} className="p-2 rounded bg-[#151C2E] hover:bg-[#172033] text-[#EF4444]">
                  → Tactical Operations Mode
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
