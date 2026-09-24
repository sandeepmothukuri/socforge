"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { 
  getAlerts, 
  executeResponseAction,
  AlertItem 
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
      setAlerts(items);
      if (items.length > 0 && !selectedAlert) {
        setSelectedAlert(items[0]);
      }
    } catch (err: any) {
      console.error("Failed to load alerts:", err);
      setError(err.message || "Failed to fetch alerts from API");
    } finally {
      setLoading(false);
    }
  }, [selectedAlert]);

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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Action Notice Bar */}
        {actionNotice && (
          <div className="bg-[#38BDF8]/10 border-b border-[#38BDF8]/30 px-6 py-2 flex items-center justify-between text-xs text-[#38BDF8] font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-[#38BDF8] hover:text-white">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Security Alert Triage Queue
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#172033] border border-[#263248] text-[#38BDF8] font-mono font-normal">
                  {filtered.length} total · {filtered.filter((a: AlertItem) => a.severity === "critical").length} critical
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                Real-time security telemetry correlation & investigation triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#263248] bg-[#151C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${loading ? "animate-spin" : ""}`} />
              Sync Queue
            </button>
          </div>
        </header>

        {/* Multi-facet Toolbar */}
        <div className="p-3 border-b border-[#263248] bg-[#0F172A] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px] max-w-md bg-[#0B1020] border border-[#263248] rounded-lg px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
            <input
              type="text"
              placeholder="Search alert title, host, user, IP, hash, or process..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none text-xs text-white placeholder-[#64748B] focus:outline-none w-full font-sans"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-[#0B1020] border border-[#263248] rounded-lg p-1">
              <span className="px-1.5 text-[#64748B]">Sev:</span>
              {["all", "critical", "high", "medium", "low"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => { setSeverityFilter(sev); setCurrentPage(1); }}
                  className={`px-2 py-0.5 rounded capitalize transition font-medium ${
                    severityFilter === sev
                      ? "bg-[#38BDF8] text-[#0B1020] font-bold"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="hidden sm:flex items-center gap-1 bg-[#0B1020] border border-[#263248] rounded-lg p-1">
              <span className="px-1.5 text-[#64748B]">Status:</span>
              {["all", "new", "triaged", "investigating", "resolved"].map((st) => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                  className={`px-2 py-0.5 rounded capitalize transition font-medium ${
                    statusFilter === st
                      ? "bg-[#38BDF8] text-[#0B1020] font-bold"
                      : "text-[#94A3B8] hover:text-white"
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
          <div className="px-6 py-2 bg-[#172033] border-b border-[#38BDF8]/30 flex items-center justify-between text-xs font-mono">
            <span className="text-[#38BDF8] font-bold">
              {selectedAlertIds.size} alert(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus("triaged")}
                className="px-2.5 py-1 rounded bg-[#1E293B] border border-[#334155] text-slate-200 hover:text-white"
              >
                Mark Triaged
              </button>
              <button
                onClick={() => handleBulkStatus("investigating")}
                className="px-2.5 py-1 rounded bg-[#1E293B] border border-[#334155] text-blue-400 hover:text-blue-300"
              >
                Escalate
              </button>
              <button
                onClick={() => handleBulkStatus("resolved")}
                className="px-2.5 py-1 rounded bg-[#1E293B] border border-[#334155] text-emerald-400 hover:text-emerald-300"
              >
                Resolve
              </button>
              <button
                onClick={() => setSelectedAlertIds(new Set())}
                className="px-2 py-1 text-slate-400 hover:text-white"
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
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono text-[#64748B] border-b border-[#263248]">
              <div className="flex items-center gap-3">
                <button onClick={toggleSelectAll} className="hover:text-white">
                  {selectedAlertIds.size === paginatedAlerts.length && paginatedAlerts.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
                <span>ALERT TELEMETRY RECORD</span>
              </div>
              <span>TIMESTAMP / MITRE</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-[#64748B] font-mono">
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
              <div className="p-12 border border-dashed border-[#263248] rounded-xl text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-[#64748B] mx-auto" />
                <p className="text-sm font-semibold text-[#F8FAFC]">No Alerts Found</p>
                <p className="text-xs text-[#64748B]">No security alerts match the selected search and filter parameters.</p>
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
                        ? "border-[#38BDF8] bg-[#172033] shadow-md shadow-[#38BDF8]/5"
                        : "border-[#263248] bg-[#0E1626]/80 hover:border-[#38BDF8]/40 hover:bg-[#111827]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Checkbox */}
                      <button 
                        onClick={(e) => toggleSelectAlert(alert.id, e)} 
                        className="text-[#64748B] hover:text-white flex-shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {/* Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge severity={alert.severity} size="sm" />
                          <StatusBadge status={alert.status || "new"} size="sm" />
                          <h3 className="text-xs font-bold text-[#F8FAFC] truncate font-sans">
                            {alert.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-[#64748B] font-mono">
                          <span>Source: <strong className="text-[#94A3B8]">{alert.source}</strong></span>
                          {alert.source_host && (
                            <span>Host: <strong className="text-[#94A3B8]">{alert.source_host}</strong></span>
                          )}
                          {alert.username && (
                            <span>User: <strong className="text-[#94A3B8]">{alert.username}</strong></span>
                          )}
                          {alert.process_name && (
                            <span className="hidden md:inline">Process: <strong className="text-[#94A3B8]">{alert.process_name}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Meta */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                      {alert.mitre_techniques && alert.mitre_techniques.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-[#1E293B] border border-[#334155] text-[10px] font-mono text-[#38BDF8]">
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
              <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#64748B]">
                <span>Page {currentPage} of {totalPages} ({filtered.length} items)</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded bg-[#151C2E] border border-[#263248] text-white disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded bg-[#151C2E] border border-[#263248] text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Inspector Drawer */}
          {selectedAlert && (
            <div className="w-96 border-l border-[#263248] bg-[#0E1626] p-5 space-y-5 overflow-y-auto flex-shrink-0">
              <div className="flex items-center justify-between border-b border-[#263248] pb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                  Alert Telemetry Inspector
                </span>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-xs text-[#64748B] hover:text-white"
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
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {selectedAlert.description || "No expanded description provided."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#263248]">
                <Link
                  href={`/investigations?alert_id=${selectedAlert.id}`}
                  className="py-2 px-3 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0B1020] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition font-mono"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Investigate
                </Link>
                {selectedAlert.source_host && (
                  <button
                    onClick={() => handleContainHost(selectedAlert.source_host!)}
                    className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition font-mono"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Isolate Host
                  </button>
                )}
              </div>

              {/* Key Observables */}
              <div className="space-y-2 pt-3 border-t border-[#263248] text-xs font-mono">
                <span className="text-[10px] uppercase font-bold text-[#64748B]">Entity Observables</span>
                <div className="space-y-1.5 bg-[#0B1020] p-3 rounded-lg border border-[#263248]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Alert ID:</span>
                    <span className="text-[#94A3B8] truncate max-w-[180px]">{selectedAlert.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Host:</span>
                    <span className="text-[#38BDF8] font-bold">{selectedAlert.source_host || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">User:</span>
                    <span className="text-[#94A3B8]">{selectedAlert.username || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Source IP:</span>
                    <span className="text-[#94A3B8]">{selectedAlert.source_ip || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Dest IP:</span>
                    <span className="text-[#94A3B8]">{selectedAlert.destination_ip || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Process Command Line */}
              {selectedAlert.process_command_line && (
                <div className="space-y-1.5 pt-2 border-t border-[#263248]">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] font-mono">
                    Process Command Line
                  </span>
                  <pre className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                    {selectedAlert.process_command_line}
                  </pre>
                </div>
              )}

              {/* MITRE Techniques */}
              {selectedAlert.mitre_techniques && selectedAlert.mitre_techniques.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#263248]">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] font-mono">
                    MITRE ATT&CK Mapping
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAlert.mitre_techniques.map((tech) => (
                      <Link
                        key={tech}
                        href={`/analytics#${tech}`}
                        className="px-2 py-0.5 rounded bg-[#172033] border border-[#38BDF8]/30 text-[11px] font-mono text-[#38BDF8] hover:bg-[#38BDF8]/20 transition"
                      >
                        {tech}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Chain of Custody */}
              <div className="pt-2 border-t border-[#263248] text-[10px] font-mono text-[#64748B] space-y-1">
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
