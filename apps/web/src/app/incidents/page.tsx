"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getIncidents, IncidentItem } from "@/lib/api";
import { ShieldAlert, RefreshCw, Clock } from "lucide-react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load incidents:", err);
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
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h1 className="text-lg font-semibold text-white">Incident Response Ledger</h1>
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
            <h2 className="text-sm font-semibold text-white">Formal Security Incidents</h2>
            <p className="text-xs text-slate-400">
              Correlated security incidents with containment records and affected systems tracking.
            </p>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500">Loading incidents...</div>
          ) : incidents.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center space-y-2">
              <ShieldAlert className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No formal incidents escalated yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-5 bg-[#0f172a]/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{inc.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                      {inc.severity}
                    </span>
                  </div>
                  {inc.description && <p className="text-xs text-slate-400">{inc.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
