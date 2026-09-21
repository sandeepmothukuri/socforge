"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { 
  getAlerts, 
  AlertItem 
} from "@/lib/api";
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  Terminal,
  RefreshCw
} from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getAlerts();
      setAlerts(data.items || []);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.source_host && a.source_host.toLowerCase().includes(search.toLowerCase())) ||
      (a.username && a.username.toLowerCase().includes(search.toLowerCase()));
    const matchesSeverity = severityFilter === "all" || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-semibold text-white">Alert Triage Studio</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {filtered.length} Alerts
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/investigations"
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
            >
              Open Active Investigation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="p-6 border-b border-slate-800/60 bg-[#0c121e]/40 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search alerts by title, host, username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Severity:
            </span>
            {["all", "critical", "high", "medium", "low"].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded text-xs capitalize transition ${
                  severityFilter === s
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Alert Table */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                Loading security alerts from PostgreSQL store...
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                <ShieldAlert className="w-8 h-8 text-slate-600" />
                <p className="text-sm text-slate-400">No alerts match the selected criteria.</p>
                <p className="text-xs text-slate-500 font-mono">Run `socforge demo` to populate synthetic alerts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      selectedAlert?.id === alert.id
                        ? "border-blue-500/80 bg-blue-500/5 shadow-md shadow-blue-500/10"
                        : "border-slate-800 bg-[#0f172a]/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wider ${getSeverityBadge(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-xs font-mono text-slate-500 uppercase">
                            Source: {alert.source}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-white tracking-tight">
                          {alert.title}
                        </h3>
                        {alert.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {alert.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right space-y-1">
                        {alert.risk_score && (
                          <div className="text-sm font-bold text-red-400">
                            Risk: {alert.risk_score}
                          </div>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {alert.status}
                        </span>
                      </div>
                    </div>

                    {/* Entities & MITRE */}
                    <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap gap-2 text-[11px]">
                      {alert.source_host && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          Host: <strong className="text-slate-200">{alert.source_host}</strong>
                        </span>
                      )}
                      {alert.username && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          User: <strong className="text-slate-200">{alert.username}</strong>
                        </span>
                      )}
                      {alert.mitre_techniques?.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alert Inspector Drawer */}
          {selectedAlert && (
            <div className="w-96 border-l border-slate-800 bg-[#0a0f1a] p-6 flex flex-col space-y-5 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Alert Details
                </span>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-2">
                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border uppercase ${getSeverityBadge(selectedAlert.severity)}`}>
                  {selectedAlert.severity} Severity
                </span>
                <h2 className="text-sm font-bold text-white">{selectedAlert.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{selectedAlert.description}</p>
              </div>

              {/* Normalized Telemetry */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-400">Normalized Indicators:</span>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div><span className="text-slate-500">Source IP:</span> {selectedAlert.source_ip || "N/A"}</div>
                  <div><span className="text-slate-500">Target Host:</span> {selectedAlert.destination_host || selectedAlert.source_host || "N/A"}</div>
                  <div><span className="text-slate-500">Account:</span> {selectedAlert.username || "N/A"}</div>
                  <div><span className="text-slate-500">Process:</span> {selectedAlert.process_name || "N/A"}</div>
                  <div><span className="text-slate-500">Hash:</span> <span className="truncate block">{selectedAlert.file_hash || "N/A"}</span></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link
                  href="/investigations"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-blue-600/20"
                >
                  Pivot to Evidence Graph
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
