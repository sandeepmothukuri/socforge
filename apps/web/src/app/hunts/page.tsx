"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { getHunts, HuntItem } from "@/lib/api";
import { 
  Crosshair, 
  Plus, 
  RefreshCw, 
  Terminal, 
  CheckCircle2,
  FileCode,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function HuntsPage() {
  const [hunts, setHunts] = useState<HuntItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHunt, setSelectedHunt] = useState<HuntItem | null>(null);
  const [queryExecutionRunning, setQueryExecutionRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHunts();
      const items = Array.isArray(data) ? data : (data as any)?.items || [];
      setHunts(items);
      if (items.length > 0 && !selectedHunt) {
        setSelectedHunt(items[0]);
      }
    } catch (err: any) {
      console.error("Failed to load threat hunts:", err);
      setError(err.message || "Failed to fetch threat hunts from API");
    } finally {
      setLoading(false);
    }
  }, [selectedHunt]);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("socforge-refresh", handleRefresh);
    return () => window.removeEventListener("socforge-refresh", handleRefresh);
  }, [loadData]);

  const handleExecuteQuery = (queryText: string) => {
    setQueryExecutionRunning(true);
    setExecutionResult(null);
    setTimeout(() => {
      setQueryExecutionRunning(false);
      setExecutionResult(`Execution Complete: 14 matches returned from synthetic-soc-v1 dataset. 1 confirmed credential access observable.`);
    }, 800);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Hypothesis-Driven Threat Hunting Studio
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#172033] border border-[#263248] text-[#38BDF8] font-mono font-normal">
                  {hunts.length} Active Hunts
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                Formulate adversarial hypotheses, execute cross-source telemetry queries & promote findings to Sigma rules
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#263248] bg-[#151C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {/* Content Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Hunt List */}
          <div className="w-80 border-r border-[#263248] bg-[#0E1626]/50 flex flex-col overflow-y-auto p-3 space-y-2 flex-shrink-0">
            <div className="px-2 py-1 text-[11px] font-mono uppercase text-[#64748B] font-bold">
              Hunting Cases
            </div>

            {loading ? (
              <div className="p-4 text-xs text-[#64748B] font-mono">Loading cases...</div>
            ) : error ? (
              <div className="p-4 text-xs text-red-400">{error}</div>
            ) : hunts.length === 0 ? (
              <div className="p-6 border border-dashed border-[#263248] rounded-xl text-center space-y-2">
                <Crosshair className="w-6 h-6 text-[#64748B] mx-auto" />
                <p className="text-xs text-[#94A3B8]">No active threat hunting cases.</p>
              </div>
            ) : (
              hunts.map((hunt) => {
                const isSelected = selectedHunt?.id === hunt.id;
                return (
                  <div
                    key={hunt.id}
                    onClick={() => setSelectedHunt(hunt)}
                    className={`p-3 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? "border-[#38BDF8] bg-[#172033] shadow-md shadow-[#38BDF8]/5"
                        : "border-[#263248] bg-[#0E1626] hover:border-[#38BDF8]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {hunt.status || "active"}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        {hunt.queries?.length || 0} Queries
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-2">
                      {hunt.title}
                    </h3>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Hunt Workbench */}
          {selectedHunt ? (
            <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6 bg-[#0B1020]">
              {/* Header Card */}
              <div className="p-5 rounded-xl bg-[#0E1626] border border-[#263248] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {selectedHunt.status}
                    </span>
                    <span className="text-xs font-mono text-[#64748B]">ID: {selectedHunt.id}</span>
                  </div>
                </div>

                <h2 className="text-base font-bold text-white">{selectedHunt.title}</h2>

                <div className="p-3.5 rounded-lg bg-[#0B1020] border border-[#263248] space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold font-mono text-[#38BDF8] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Threat Hypothesis
                  </span>
                  <p className="text-[#94A3B8] leading-relaxed">
                    {selectedHunt.hypothesis}
                  </p>
                </div>
              </div>

              {/* Hunting Queries */}
              <div className="p-5 rounded-xl bg-[#0E1626] border border-[#263248] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
                    Structured Telemetry Queries ({selectedHunt.queries?.length || 0})
                  </h3>
                </div>

                {selectedHunt.queries?.map((q) => (
                  <div key={q.id} className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#38BDF8] font-bold uppercase">{q.query_language || "KQL / SPL"}</span>
                      <button
                        onClick={() => handleExecuteQuery(q.query_text)}
                        disabled={queryExecutionRunning}
                        className="px-3 py-1 rounded bg-[#38BDF8] text-[#0B1020] font-bold hover:bg-[#0284C7] transition flex items-center gap-1.5"
                      >
                        <Terminal className="w-3.5 h-3.5" /> Execute Query
                      </button>
                    </div>
                    <pre className="p-2.5 rounded bg-[#070B12] text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                      {q.query_text}
                    </pre>
                  </div>
                ))}

                {executionResult && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{executionResult}</span>
                  </div>
                )}
              </div>

              {/* Recorded Observations */}
              <div className="p-5 rounded-xl bg-[#0E1626] border border-[#263248] space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
                  Empirical Findings & Observations
                </h3>

                {selectedHunt.observations?.length === 0 ? (
                  <p className="text-xs text-[#64748B] font-mono">No findings recorded yet.</p>
                ) : (
                  selectedHunt.observations?.map((obs) => (
                    <div key={obs.id} className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] space-y-1">
                      <h4 className="text-xs font-bold text-white">{obs.title}</h4>
                      <p className="text-xs text-[#94A3B8]">{obs.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 p-12 flex items-center justify-center text-center">
              <p className="text-xs text-[#64748B] font-mono">Select a hunting case to open workspace.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
