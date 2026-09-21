"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getHunts, HuntItem } from "@/lib/api";
import { Crosshair, Plus, RefreshCw, Terminal, CheckCircle2 } from "lucide-react";

export default function HuntsPage() {
  const [hunts, setHunts] = useState<HuntItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getHunts();
      setHunts(data);
    } catch (err) {
      console.error("Failed to load threat hunts:", err);
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
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crosshair className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-semibold text-white">Threat Hunting Workspace</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Hypothesis-Driven
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

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto max-w-6xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">Active Hunting Cases</h2>
            <p className="text-xs text-slate-400">
              Convert threat hunting hypotheses into structured queries, record empirical observations, and promote findings into detection candidates.
            </p>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500">Loading threat hunting cases...</div>
          ) : hunts.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center space-y-2">
              <Crosshair className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No active hunts created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hunts.map((hunt) => (
                <div key={hunt.id} className="p-5 bg-[#0f172a]/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{hunt.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-slate-800 text-slate-300">
                      {hunt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-slate-300">Hypothesis:</strong> {hunt.hypothesis}</p>
                  
                  {hunt.queries.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Queries:</span>
                      {hunt.queries.map((q) => (
                        <div key={q.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                          {q.query_text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
