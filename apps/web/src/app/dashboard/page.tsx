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
  runDemoWorkflow,
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
  ChevronDown
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";
import { DesktopGuideModal } from "@/components/DesktopGuideModal";
import { EvidenceGraphVisualizer } from "@/components/dashboard/EvidenceGraphVisualizer";

export default function DashboardPage() {
  const [desktopGuideOpen, setDesktopGuideOpen] = useState(false);

  // Granular State Management
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [investigationsLoading, setInvestigationsLoading] = useState(true);
  const [investigationsError, setInvestigationsError] = useState<string | null>(null);

  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [detectionsLoading, setDetectionsLoading] = useState(true);
  const [detectionsError, setDetectionsError] = useState<string | null>(null);

  // Selected Investigation & Relational Artifacts
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<EvidenceGraphData | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);

  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [findingsLoading, setFindingsLoading] = useState(false);
  const [findingsError, setFindingsError] = useState<string | null>(null);

  // View & UI controls
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
      const invParam = params.get("inv");
      if (invParam) {
        setSelectedInvestigationId(invParam);
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

  // 1. Fetch Alerts
  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    setAlertsError(null);
    try {
      const aData = await getAlerts();
      const items = Array.isArray(aData) ? aData : aData?.items || [];
      setAlerts(items);
    } catch (err: any) {
      console.error("Failed to load alerts:", err);
      setAlertsError(err.message || "Failed to fetch alerts queue from API");
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  // 2. Fetch Investigations
  const fetchInvestigations = useCallback(async () => {
    setInvestigationsLoading(true);
    setInvestigationsError(null);
    try {
      const iData = await getInvestigations();
      const items = Array.isArray(iData) ? iData : (iData as any)?.items || [];
      setInvestigations(items);
      if (items.length > 0) {
        setSelectedInvestigationId((prev) => prev || items[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load investigations:", err);
      setInvestigationsError(err.message || "Failed to fetch investigations from API");
    } finally {
      setInvestigationsLoading(false);
    }
  }, []);

  // 3. Fetch Detections
  const fetchDetections = useCallback(async () => {
    setDetectionsLoading(true);
    setDetectionsError(null);
    try {
      const dData = await getDetections();
      const items = Array.isArray(dData) ? dData : (dData as any)?.items || [];
      setDetections(items);
    } catch (err: any) {
      console.error("Failed to load detections:", err);
      setDetectionsError(err.message || "Failed to fetch detections catalog from API");
    } finally {
      setDetectionsLoading(false);
    }
  }, []);

  // 4. Fetch Graph & Findings for Selected Investigation
  const fetchInvestigationDetails = useCallback(async (invId: string) => {
    if (!invId) return;

    setGraphLoading(true);
    setGraphError(null);
    setFindingsLoading(true);
    setFindingsError(null);

    try {
      const [gData, fData] = await Promise.all([
        getInvestigationGraph(invId).catch((err) => {
          setGraphError(err.message || "Failed to load evidence graph");
          return null;
        }),
        getInvestigationFindings(invId).catch((err) => {
          setFindingsError(err.message || "Failed to load findings");
          return [];
        }),
      ]);

      if (gData) setGraphData(gData);
      if (fData) setFindings(fData);
    } catch (err: any) {
      console.error("Failed to fetch investigation details:", err);
    } finally {
      setGraphLoading(false);
      setFindingsLoading(false);
    }
  }, []);

  // Synchronize when selectedInvestigationId changes
  useEffect(() => {
    if (selectedInvestigationId) {
      fetchInvestigationDetails(selectedInvestigationId);
    }
  }, [selectedInvestigationId, fetchInvestigationDetails]);

  // Master load dashboard
  const loadDashboard = useCallback(async () => {
    await Promise.allSettled([
      fetchAlerts(),
      fetchInvestigations(),
      fetchDetections(),
    ]);
  }, [fetchAlerts, fetchInvestigations, fetchDetections]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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

  const alertList = alerts || [];
  const invList = investigations || [];
  const detList = detections || [];
  const selectedInv = invList.find((i) => i.id === selectedInvestigationId) || invList[0];
  const criticalAlerts = alertList.filter((a: any) => a?.severity === "critical");
  const isGlobalLoading = alertsLoading && investigationsLoading && detectionsLoading;

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
                aria-pressed={viewMode === "standard"}
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
                aria-pressed={viewMode === "tactical"}
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
              aria-label="Open Quick Pivot Palette"
            >
              <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Quick Pivot...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#111827] text-[10px] text-[#6B7280] border border-[#263248]">
                Cmd+K
              </kbd>
            </button>

            {/* Desktop App Instructions Button */}
            <button
              onClick={() => setDesktopGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#38BDF8]/50 bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] transition font-semibold"
              title="View instructions to run standalone Windows desktop app"
              aria-label="Open Desktop App Guide"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Desktop App Guide</span>
            </button>

            {/* Run Demo Button */}
            <button
              onClick={handleRunDemo}
              disabled={demoRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 text-[#38BDF8] transition font-semibold"
              aria-label="Run SOCForge Deterministic Demo"
            >
              <Play className={`w-3.5 h-3.5 ${demoRunning ? "animate-spin" : ""}`} />
              <span>Run SOCForge Demo</span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#263248] bg-[#151C2E] text-[#A7B0C0] hover:text-[#F8FAFC] transition"
              aria-label="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGlobalLoading ? "animate-spin text-[#38BDF8]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Action Notice Notification */}
        {actionNotice && (
          <div 
            className="bg-[#151C2E] border-b border-[#38BDF8]/40 px-6 py-2.5 text-xs text-[#38BDF8] flex items-center justify-between font-mono animate-in fade-in duration-150"
            role="status"
            aria-live="polite"
          >
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

            {/* Tactical Desktop App Quick Access Bar */}
            <div className="bg-[#111827] border border-[#263248] rounded-lg p-3 px-4 flex items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#A7B0C0]">
                <Laptop className="w-4 h-4 text-[#38BDF8]" />
                <span>Native Desktop Operations: <strong>SOCForge-Window.exe</strong> & <strong>SOCForge-Operations.exe</strong> installed.</span>
              </div>
              <button
                onClick={() => setDesktopGuideOpen(true)}
                className="px-3 py-1 rounded bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 text-[#38BDF8] font-bold text-[11px] transition flex items-center gap-1"
              >
                <span>Desktop Guide & Commands</span>
                <ChevronRight className="w-3 h-3" />
              </button>
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
                  {alertsLoading ? (
                    <div className="p-8 text-center text-xs text-[#38BDF8] font-mono animate-pulse" role="status">
                      Refreshing critical intrusion stream...
                    </div>
                  ) : alertsError ? (
                    <div className="p-6 rounded bg-red-950/20 border border-red-500/40 text-center space-y-2" role="alert">
                      <div className="text-xs text-red-400 font-bold">Failed to load critical alerts</div>
                      <p className="text-[11px] text-red-300 font-mono">{alertsError}</p>
                      <button
                        onClick={fetchAlerts}
                        className="px-3 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-semibold hover:bg-red-500/30 transition"
                      >
                        Retry Alerts
                      </button>
                    </div>
                  ) : criticalAlerts.length === 0 ? (
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
              {/* Active Alerts Card */}
              <div className="relative">
                {alertsError ? (
                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 text-xs space-y-2">
                    <div className="flex items-center justify-between text-red-400 font-bold">
                      <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Alerts Error</span>
                      <button onClick={fetchAlerts} className="underline text-[11px] hover:text-white">Retry</button>
                    </div>
                    <p className="text-[10px] text-red-300 truncate">{alertsError}</p>
                  </div>
                ) : (
                  <Link href="/alerts">
                    <MetricCard
                      title="Active Alerts"
                      value={alertsLoading ? "..." : alertList.length}
                      badge={`${criticalAlerts.length} Critical`}
                      subtext="Requiring investigation"
                      change={criticalAlerts.length > 0 ? "Requires Triage" : "Normal"}
                      isPositive={criticalAlerts.length === 0}
                      icon={ShieldAlert}
                    />
                  </Link>
                )}
              </div>

              {/* Investigations Card */}
              <div className="relative">
                {investigationsError ? (
                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 text-xs space-y-2">
                    <div className="flex items-center justify-between text-red-400 font-bold">
                      <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Cases Error</span>
                      <button onClick={fetchInvestigations} className="underline text-[11px] hover:text-white">Retry</button>
                    </div>
                    <p className="text-[10px] text-red-300 truncate">{investigationsError}</p>
                  </div>
                ) : (
                  <Link href="/investigations">
                    <MetricCard
                      title="Investigations"
                      value={investigationsLoading ? "..." : invList.length}
                      badge="Evidence Graph"
                      subtext="Correlated attack paths"
                      icon={Share2}
                    />
                  </Link>
                )}
              </div>

              {/* Detections Card */}
              <div className="relative">
                {detectionsError ? (
                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 text-xs space-y-2">
                    <div className="flex items-center justify-between text-red-400 font-bold">
                      <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Rules Error</span>
                      <button onClick={fetchDetections} className="underline text-[11px] hover:text-white">Retry</button>
                    </div>
                    <p className="text-[10px] text-red-300 truncate">{detectionsError}</p>
                  </div>
                ) : (
                  <Link href="/detections">
                    <MetricCard
                      title="Detection Rules"
                      value={detectionsLoading ? "..." : detList.length}
                      badge="Sigma • SPL • KQL"
                      subtext="Multi-format rule catalog"
                      icon={FileCode}
                    />
                  </Link>
                )}
              </div>

              {/* Containment Policy Card */}
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

            {/* ── INLINE RUNNING DESKTOP APP INSTRUCTIONS ─────────────────────────────── */}
            <div className="bg-[#111827] border border-[#38BDF8]/40 rounded-xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-5 border-b border-[#263248] bg-[#0E1626] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8]">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[#F8FAFC]">
                        Running SOCForge Desktop App on Windows
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                        READY & INSTALLED
                      </span>
                    </div>
                    <p className="text-xs text-[#A7B0C0] mt-0.5">
                      4 validated ways to launch your native desktop application locally on Windows.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/desktop"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-semibold transition"
                  >
                    <span>Full Desktop Guide Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setDesktopGuideOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B1020] text-xs font-bold transition shadow-sm"
                  >
                    Open Instructions
                  </button>
                </div>
              </div>

              {/* 4 Launch Options Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#0B1020]">
                {/* Method 1 */}
                <div className="p-4 rounded-lg bg-[#151C2E] border border-[#38BDF8]/30 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#38BDF8]">
                      <span className="w-5 h-5 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center text-[11px]">1</span>
                      <span>Windows Desktop Shortcut</span>
                    </div>
                    <span className="text-[10px] text-[#38BDF8] font-mono">Fastest</span>
                  </div>
                  <p className="text-xs text-[#A7B0C0]">
                    Double-click the shortcut already created on your Windows desktop:
                  </p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="p-2 rounded bg-[#0B1020] border border-[#263248] text-[#F8FAFC] flex items-center justify-between">
                      <span>• SOCForge Console Window.lnk</span>
                      <span className="text-[10px] text-[#22C55E]">Installed</span>
                    </div>
                    <div className="p-2 rounded bg-[#0B1020] border border-[#263248] text-[#F8FAFC] flex items-center justify-between">
                      <span>• ⚙️ SOCForge Operations.lnk</span>
                      <span className="text-[10px] text-[#22C55E]">Installed</span>
                    </div>
                  </div>
                </div>

                {/* Method 2 */}
                <div className="p-4 rounded-lg bg-[#151C2E] border border-[#263248] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#22C55E]">
                      <span className="w-5 h-5 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-[11px]">2</span>
                      <span>Standalone Executable (.EXE)</span>
                    </div>
                    <span className="text-[10px] text-[#22C55E] font-mono">No Python Required</span>
                  </div>
                  <p className="text-xs text-[#A7B0C0]">
                    Run the pre-compiled portable binaries in the repository root or dist folder:
                  </p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="p-2 rounded bg-[#0B1020] border border-[#263248] text-[#22C55E] flex items-center justify-between">
                      <span>.\SOCForge-Window.exe</span>
                      <span className="text-[10px] text-[#A7B0C0]">18.07 MB</span>
                    </div>
                    <div className="p-2 rounded bg-[#0B1020] border border-[#263248] text-[#38BDF8] flex items-center justify-between">
                      <span>.\SOCForge-Operations.exe</span>
                      <span className="text-[10px] text-[#A7B0C0]">11.60 MB</span>
                    </div>
                  </div>
                </div>

                {/* Method 3 */}
                <div className="p-4 rounded-lg bg-[#151C2E] border border-[#263248] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#F59E0B]">
                      <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-[11px]">3</span>
                      <span>Double-Click Batch Launcher</span>
                    </div>
                    <span className="text-[10px] text-[#F59E0B] font-mono">File Explorer</span>
                  </div>
                  <p className="text-xs text-[#A7B0C0]">
                    Double-click the batch launcher script in the repository root directory:
                  </p>
                  <div className="p-2 rounded bg-[#0B1020] border border-[#263248] font-mono text-[11px] text-[#F59E0B] flex items-center justify-between">
                    <span>.\SOCForge-Launcher.bat</span>
                    <span className="text-[10px] text-[#6B7280]">Batch Script</span>
                  </div>
                </div>

                {/* Method 4 */}
                <div className="p-4 rounded-lg bg-[#151C2E] border border-[#263248] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#A855F7]">
                      <span className="w-5 h-5 rounded-full bg-[#A855F7]/20 text-[#A855F7] flex items-center justify-center text-[11px]">4</span>
                      <span>Terminal / PowerShell Commands</span>
                    </div>
                    <span className="text-[10px] text-[#A855F7] font-mono">CLI Command</span>
                  </div>
                  <p className="text-xs text-[#A7B0C0]">
                    Run directly via Python in your terminal:
                  </p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="p-2 rounded bg-[#0B1020] border border-[#263248] text-[#F8FAFC]">
                      <code>python apps\desktop\socforge_desktop_window.py</code>
                    </div>
                    <div className="p-2 rounded bg-[#0B1020] border border-[#263248] text-[#F8FAFC]">
                      <code>python apps\desktop\socforge_app.py</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="p-3 px-6 bg-[#0E1626] border-t border-[#263248] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#A7B0C0]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                  <span>Local Stack Health: Ports 3000, 8000, 5432, 6379 operational</span>
                </div>
                <div className="text-[#6B7280]">
                  Author: Sandeep Mothukuri • Binaries available in project root & dist/
                </div>
              </div>
            </div>

            {/* ── INVESTIGATION SELECTION & EVIDENCE GRAPH CENTERPIECE ────────────────── */}
            <div className="space-y-4">
              {/* Investigation Selector Bar */}
              <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8]">
                    <FolderSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                      Active Investigation Workspace
                    </h2>
                    <p className="text-[11px] text-[#A7B0C0]">
                      Select an investigation case to view its live relational Evidence Graph & documented findings.
                    </p>
                  </div>
                </div>

                {/* Dropdown Selector */}
                <div className="flex items-center gap-3">
                  {investigationsLoading ? (
                    <div className="text-xs font-mono text-[#38BDF8] animate-pulse">
                      Loading cases...
                    </div>
                  ) : investigationsError ? (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <span>Cases error: {investigationsError}</span>
                      <button onClick={fetchInvestigations} className="underline text-white font-bold">Retry</button>
                    </div>
                  ) : invList.length === 0 ? (
                    <span className="text-xs text-[#6B7280] font-mono">No investigations found</span>
                  ) : (
                    <div className="relative flex items-center">
                      <select
                        id="investigationSelector"
                        name="investigationSelector"
                        value={selectedInvestigationId || ""}
                        onChange={(e) => setSelectedInvestigationId(e.target.value)}
                        className="appearance-none bg-[#0B1020] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-[#F8FAFC] text-xs rounded-lg px-4 py-2 pr-8 font-mono outline-none focus:ring-2 focus:ring-[#38BDF8] transition cursor-pointer"
                        aria-label="Select Investigation Case"
                      >
                        {invList.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            [{inv.severity?.toUpperCase() || "MED"}] {inv.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#38BDF8] absolute right-2.5 pointer-events-none" />
                    </div>
                  )}

                  <Link 
                    href="/investigations" 
                    className="text-xs font-semibold text-[#38BDF8] hover:text-[#38BDF8]/80 flex items-center gap-1 shrink-0"
                  >
                    Full Studio <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Dynamic Evidence Graph Visualizer */}
              <EvidenceGraphVisualizer
                data={graphData}
                loading={graphLoading}
                error={graphError}
                onRetry={() => selectedInvestigationId && fetchInvestigationDetails(selectedInvestigationId)}
                investigationTitle={selectedInv?.title}
              />

              {/* Documented Findings Panel for Selected Investigation */}
              <div className="rounded-xl border border-[#263248] bg-[#151C2E] p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#263248] pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                      Evidence-Backed Analyst Findings ({findings.length})
                    </h3>
                  </div>
                  {selectedInv && (
                    <span className="text-[11px] font-mono text-[#A7B0C0]">
                      Case ID: {selectedInv.id.slice(0, 8)}... • Status: <strong className="text-white uppercase">{selectedInv.status}</strong>
                    </span>
                  )}
                </div>

                {findingsLoading ? (
                  <div className="p-6 text-center text-xs text-[#38BDF8] font-mono animate-pulse" role="status">
                    Loading findings from database...
                  </div>
                ) : findingsError ? (
                  <div className="p-4 rounded bg-red-950/20 border border-red-500/40 text-center space-y-2" role="alert">
                    <p className="text-xs text-red-300 font-mono">{findingsError}</p>
                    <button
                      onClick={() => selectedInvestigationId && fetchInvestigationDetails(selectedInvestigationId)}
                      className="px-3 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-semibold hover:bg-red-500/30 transition"
                    >
                      Retry Findings
                    </button>
                  </div>
                ) : findings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B7280] font-mono">
                    No findings recorded for this investigation yet. Run detection workflows or generate hypotheses.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {findings.map((f) => (
                      <div
                        key={f.id}
                        className="p-4 rounded-lg bg-[#111827] border border-[#263248] space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white truncate max-w-xs">{f.title}</h4>
                          <span className="px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-[10px] font-mono uppercase font-bold">
                            {f.confidence}
                          </span>
                        </div>
                        <p className="text-[#A7B0C0] text-[11px] leading-relaxed line-clamp-2">
                          {f.description}
                        </p>
                        {f.mitre_techniques?.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1">
                            {f.mitre_techniques.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-[#172033] border border-[#263248] text-[10px] font-mono text-[#38BDF8]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Standalone Windows Desktop App & Mobile Suite Instructions Modal */}
      <DesktopGuideModal
        isOpen={desktopGuideOpen}
        onClose={() => setDesktopGuideOpen(false)}
      />
    </AppShell>
  );
}
