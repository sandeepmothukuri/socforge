"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getAuditLogs, AuditItem } from "@/lib/api";
import { FileText, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      const items = Array.isArray(data) ? data : (data as any)?.items || [];
      setLogs(items);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const logList = Array.isArray(logs) ? logs : (logs as any)?.items || [];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <h1 className="text-lg font-semibold text-white">Immutable Security Audit Ledger</h1>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        <div className="flex-1 p-8 overflow-y-auto max-w-6xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">Platform Operation Audit Trail</h2>
            <p className="text-xs text-slate-400">
              Append-only audit ledger recording every authentication, investigation creation, rule validation, and response authorization.
            </p>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500">Loading audit records from PostgreSQL...</div>
          ) : logList.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
              No audit records found.
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0f172a]/60">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0a0f1a] border-b border-slate-800 text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Actor</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono">
                  {logList.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="px-6 py-3 text-slate-400">
                        {new Date(log.occurred_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-white">{log.actor_email || "System"}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-400">
                        {log.target_type ? `${log.target_type}` : "Platform"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
