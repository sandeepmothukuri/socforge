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
      setLogs(data.items || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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
          ) : logs.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
              No audit records found.
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0f172a]/40">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b101b] border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-white">{item.action}</td>
                      <td className="p-3 text-slate-300">{item.actor_email || "System"}</td>
                      <td className="p-3 text-slate-400">{item.target_type || "N/A"}</td>
                      <td className="p-3">
                        {item.success ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle className="w-3.5 h-3.5" /> SUCCESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> FAILED
                          </span>
                        )}
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
