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
      const items = Array.isArray(data) ? data : data?.items || [];
      setAlerts(items);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const alertList = Array.isArray(alerts) ? alerts : (alerts as any)?.items || [];
  const filtered = alertList.filter((a) => {
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
        {/* Page Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-semibold text-white">Security Alerts Queue</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filtered.length} visible
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
          </div>
        </header>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-[#070b12] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search alert title, host, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Severity:</span>
            {["all", "critical", "high", "medium", "low"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md capitalize transition ${
                  severityFilter === sev
                    ? "bg-blue-600 text-white font-medium"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {loading ? (
              <div className="text-xs text-slate-500">Loading alerts from PostgreSQL...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center space-y-2">
                <ShieldAlert className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No alerts match the active filter criteria.</p>
              </div>
            ) : (
              filtered.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedAlert?.id === alert.id
                      ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                      : "border-slate-800/80 bg-[#0f172a]/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold border ${getSeverityBadge(
                            alert.severity
                          )}`}
                        >
                          {alert.severity}
                        </span>
                        <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-4 font-mono">
                        <span>Source: <strong className="text-slate-300">{alert.source}</strong></span>
                        {alert.source_host && (
                          <span>Host: <strong className="text-slate-300">{alert.source_host}</strong></span>
                        )}
                        {alert.username && (
                          <span>User: <strong className="text-slate-300">{alert.username}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                      {alert.mitre_techniques && alert.mitre_techniques.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                          {alert.mitre_techniques[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details Drawer */}
          {selectedAlert && (
            <div className="w-96 border-l border-slate-800 bg-[#090e18] p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Alert Details
                </span>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-mono uppercase font-bold inline-block border ${getSeverityBadge(
                    selectedAlert.severity
                  )}`}
                >
                  {selectedAlert.severity}
                </span>
                <h2 className="text-base font-bold text-white">{selectedAlert.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedAlert.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Alert ID:</span>
                  <span className="text-slate-300">{selectedAlert.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source Host:</span>
                  <span className="text-slate-300">{selectedAlert.source_host || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Process:</span>
                  <span className="text-slate-300">{selectedAlert.process_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username:</span>
                  <span className="text-slate-300">{selectedAlert.username || "N/A"}</span>
                </div>
              </div>

              {selectedAlert.process_command_line && (
                <div className="space-y-1.5 pt-4 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Process Command Line
                  </span>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                    {selectedAlert.process_command_line}
                  </pre>
                </div>
              )}

              {selectedAlert.mitre_techniques && (
                <div className="space-y-1.5 pt-4 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    MITRE ATT&CK Mapping
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAlert.mitre_techniques.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <Link
                  href="/investigations"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  Escalate to Investigation <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
