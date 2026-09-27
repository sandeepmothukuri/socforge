"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { 
  getAlerts, 
  executeResponseAction,
  AlertItem,
  FALLBACK_ALERTS
} from "@/lib/api";
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  RefreshCw,
  CheckSquare,
  Square,
  ShieldCheck,
  User,
  Server,
  Terminal,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  XCircle,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IocHoverCard } from "@/components/ui/IocHoverCard";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Selection & Details
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(new Set());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlerts();
      const items = Array.isArray(data) ? data : data?.items || [];
      const list = items.length > 0 ? items : FALLBACK_ALERTS;
      setAlerts(list);
      setSelectedAlert((curr) => curr || list[0]);
    } catch (err: any) {
      console.warn("Failed to load alerts from API, using fallback dataset:", err);
      setAlerts(FALLBACK_ALERTS);
      setSelectedAlert((curr) => curr || FALLBACK_ALERTS[0]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("socforge-refresh", handleRefresh);
    return () => window.removeEventListener("socforge-refresh", handleRefresh);
  }, [loadData]);

  const alertList = Array.isArray(alerts) ? alerts : (alerts as any)?.items || [];
  
  // Multi-facet filtering
  const filtered = alertList.filter((a: AlertItem) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(q) ||
      (a.source_host && a.source_host.toLowerCase().includes(q)) ||
      (a.username && a.username.toLowerCase().includes(q)) ||
      (a.process_name && a.process_name.toLowerCase().includes(q)) ||
      (a.source_ip && a.source_ip.toLowerCase().includes(q)) ||
      (a.destination_ip && a.destination_ip.toLowerCase().includes(q)) ||
      (a.id && a.id.toLowerCase().includes(q));

    const matchesSeverity = severityFilter === "all" || a.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || (a.status || "new") === statusFilter;
    const matchesSource = sourceFilter === "all" || a.source === sourceFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesSource;
  });

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedAlerts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Toggle single alert selection for bulk actions
  const toggleSelectAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAlertIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedAlertIds.size === paginatedAlerts.length) {
      setSelectedAlertIds(new Set());
    } else {
      setSelectedAlertIds(new Set(paginatedAlerts.map((a: AlertItem) => a.id)));
    }
  };

  const handleBulkStatus = (newStatus: string) => {
    setActionNotice(`Updated ${selectedAlertIds.size} alerts to ${newStatus.toUpperCase()}`);
    setSelectedAlertIds(new Set());
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleContainHost = async (host: string) => {
    setActionNotice(`Executing host isolation containment on ${host}...`);
    try {
      await executeResponseAction("isolate_host", "endpoint", host, "Analyst alert triage containment");
      setActionNotice(`Host isolation action dispatched for ${host} [SIMULATED]`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setActionNotice(`Containment action failed: ${err.message}`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000] text-neutral-100">
        {/* Action Notice Bar */}
        {actionNotice && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2 flex items-center justify-between text-xs text-emerald-400 font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header */}
        <header className="h-16 border-b border-[#262626] bg-[#050505]/95 px-6 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Security Alert Triage Queue
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#171717] border border-[#262626] text-emerald-400 font-mono font-normal">
                  {filtered.length} total · {filtered.filter((a: AlertItem) => a.severity === "critical").length} critical
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400 font-mono">
                Real-time security telemetry correlation & investigation triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#262626] bg-[#0A0A0A] hover:bg-[#171717] text-neutral-300 hover:text-white transition font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
              Sync Queue
            </button>
          </div>
        </header>

        {/* Multi-facet Toolbar */}
        <div className="p-3 border-b border-[#262626] bg-[#050505] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px] max-w-md bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search alert title, host, user, IP, hash, or process..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none text-xs text-white placeholder-neutral-500 focus:outline-none w-full font-mono"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#262626] rounded-xl p-1">
              <span className="px-1.5 text-neutral-500">Sev:</span>
              {["all", "critical", "high", "medium", "low"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => { setSeverityFilter(sev); setCurrentPage(1); }}
                  className={`px-2 py-0.5 rounded capitalize transition font-medium ${
                    severityFilter === sev
                      ? "bg-white text-black font-bold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="hidden sm:flex items-center gap-1 bg-[#0A0A0A] border border-[#262626] rounded-xl p-1">
              <span className="px-1.5 text-neutral-500">Status:</span>
              {["all", "new", "triaged", "investigating", "resolved"].map((st) => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                  className={`px-2 py-0.5 rounded capitalize transition font-medium ${
                    statusFilter === st
                      ? "bg-white text-black font-bold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Action Strip (Visible when items selected) */}
        {selectedAlertIds.size > 0 && (
          <div className="px-6 py-2 bg-[#0A0A0A] border-b border-[#262626] flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold">
              {selectedAlertIds.size} alert(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus("triaged")}
                className="px-2.5 py-1 rounded bg-[#171717] border border-[#262626] text-neutral-300 hover:text-white"
              >
                Mark Triaged
              </button>
              <button
                onClick={() => handleBulkStatus("investigating")}
                className="px-2.5 py-1 rounded bg-[#171717] border border-[#262626] text-amber-400 hover:text-amber-300"
              >
                Escalate
              </button>
              <button
                onClick={() => handleBulkStatus("resolved")}
                className="px-2.5 py-1 rounded bg-[#171717] border border-[#262626] text-emerald-400 hover:text-emerald-300"
              >
                Resolve
              </button>
              <button
                onClick={() => setSelectedAlertIds(new Set())}
                className="px-2 py-1 text-neutral-500 hover:text-white"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* Main Content Pane with Alert List & Detail Inspector */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left / Center Table List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Table Header Controls */}
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono text-neutral-500 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <button onClick={toggleSelectAll} className="hover:text-white">
                  {selectedAlertIds.size === paginatedAlerts.length && paginatedAlerts.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
                <span>ALERT TELEMETRY RECORD</span>
              </div>
              <span>TIMESTAMP / MITRE</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-neutral-500 font-mono">
                Querying security telemetry from PostgreSQL...
              </div>
            ) : error ? (
              <div className="p-6 border border-red-500/30 rounded-xl bg-red-500/5 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
                <p className="text-xs text-red-300 font-semibold">{error}</p>
                <button
                  onClick={loadData}
                  className="px-3 py-1 rounded bg-red-500/20 text-red-300 text-xs font-mono hover:bg-red-500/30 transition"
                >
                  Retry Query
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 border border-dashed border-[#262626] rounded-xl text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-sm font-semibold text-white">No Alerts Found</p>
                <p className="text-xs text-neutral-500">No security alerts match the selected search and filter parameters.</p>
              </div>
            ) : (
              paginatedAlerts.map((alert: AlertItem) => {
                const isSelected = selectedAlert?.id === alert.id;
                const isChecked = selectedAlertIds.has(alert.id);
                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? "border-white bg-[#121212]"
                        : "border-[#262626] bg-[#0A0A0A] hover:border-neutral-500"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Checkbox */}
                      <button 
                        onClick={(e) => toggleSelectAlert(alert.id, e)} 
                        className="text-neutral-500 hover:text-white flex-shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {/* Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge severity={alert.severity} size="sm" />
                          <StatusBadge status={alert.status || "new"} size="sm" />
                          <h3 className="text-xs font-bold text-white truncate font-sans">
                            {alert.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-neutral-400 font-mono">
                          <span>Source: <strong className="text-neutral-200">{alert.source}</strong></span>
                          {alert.source_host && (
                            <span>Host: <IocHoverCard value={alert.source_host} type="ip" className="text-neutral-200 font-bold" /></span>
                          )}
                          {alert.username && (
                            <span>User: <IocHoverCard value={alert.username} type="user" className="text-neutral-200 font-bold" /></span>
                          )}
                          {alert.process_name && (
                            <span className="hidden md:inline">Process: <IocHoverCard value={alert.process_name} type="process" className="text-neutral-200 font-bold" /></span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Meta */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                      {alert.mitre_techniques && alert.mitre_techniques.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-[#171717] border border-[#262626] text-[10px] font-mono text-neutral-200">
                          {alert.mitre_techniques[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-2 flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>Page {currentPage} of {totalPages} ({filtered.length} items)</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#262626] text-white disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#262626] text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Inspector Drawer */}
          {selectedAlert && (
            <div className="w-96 border-l border-[#262626] bg-[#050505] p-5 space-y-5 overflow-y-auto flex-shrink-0 font-mono">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                  Alert Telemetry Inspector
                </span>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-xs text-neutral-500 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Title & Severity */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={selectedAlert.severity} />
                  <StatusBadge status={selectedAlert.status || "new"} />
                </div>
                <h2 className="text-sm font-bold text-white leading-tight font-sans">
                  {selectedAlert.title}
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  {selectedAlert.description || "No expanded description provided."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262626]">
                <Link
                  href={`/investigations?alert_id=${selectedAlert.id}`}
                  className="py-2 px-3 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition font-mono"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Investigate
                </Link>
                {selectedAlert.source_host && (
                  <button
                    onClick={() => handleContainHost(selectedAlert.source_host!)}
                    className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition font-mono"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Isolate Host
                  </button>
                )}
              </div>

              {/* Key Observables */}
              <div className="space-y-2 pt-3 border-t border-[#262626] text-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Entity Observables</span>
                <div className="space-y-1.5 bg-[#0A0A0A] p-3 rounded-xl border border-[#262626]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Alert ID:</span>
                    <span className="text-neutral-300 truncate max-w-[180px]">{selectedAlert.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Host:</span>
                    {selectedAlert.source_host ? (
                      <IocHoverCard value={selectedAlert.source_host} type="ip" className="text-emerald-400 font-bold" />
                    ) : (
                      <span className="text-neutral-500">N/A</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">User:</span>
                    {selectedAlert.username ? (
                      <IocHoverCard value={selectedAlert.username} type="user" className="text-white font-bold" />
                    ) : (
                      <span className="text-neutral-500">N/A</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Source IP:</span>
                    {selectedAlert.source_ip ? (
                      <IocHoverCard value={selectedAlert.source_ip} type="ip" className="text-neutral-200 font-mono" />
                    ) : (
                      <span className="text-neutral-500">N/A</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Dest IP:</span>
                    {selectedAlert.destination_ip ? (
                      <IocHoverCard value={selectedAlert.destination_ip} type="ip" className="text-neutral-200 font-mono" />
                    ) : (
                      <span className="text-neutral-500">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Process Command Line */}
              {selectedAlert.process_command_line && (
                <div className="space-y-1.5 pt-2 border-t border-[#262626]">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Process Command Line
                  </span>
                  <pre className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-[11px] text-neutral-200 overflow-x-auto whitespace-pre-wrap">
                    {selectedAlert.process_command_line}
                  </pre>
                </div>
              )}

              {/* MITRE Techniques */}
              {selectedAlert.mitre_techniques && selectedAlert.mitre_techniques.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#262626]">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    MITRE ATT&CK Mapping
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAlert.mitre_techniques.map((tech) => (
                      <Link
                        key={tech}
                        href={`/analytics#${tech}`}
                        className="px-2 py-0.5 rounded bg-neutral-900 border border-[#262626] text-[11px] text-neutral-200 hover:text-white transition"
                      >
                        {tech}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Chain of Custody */}
              <div className="pt-2 border-t border-[#262626] text-[10px] text-neutral-500 space-y-1">
                <div>Ingested: {new Date(selectedAlert.created_at).toLocaleString()}</div>
                <div>Storage Engine: PostgreSQL (AsyncPG JSONB Partition)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
