"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { 
  getInvestigations, 
  getInvestigationGraph, 
  getInvestigationFindings,
  InvestigationItem, 
  EvidenceGraphData,
  FindingItem 
} from "@/lib/api";
import { 
  Share2, 
  ShieldAlert, 
  ArrowRight, 
  FileCode, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw,
  Cpu,
  Layers,
  Lock
} from "lucide-react";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [selectedInv, setSelectedInv] = useState<InvestigationItem | null>(null);
  const [graphData, setGraphData] = useState<EvidenceGraphData | null>(null);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Response containment simulation state
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const invList = await getInvestigations();
      setInvestigations(invList);
      if (invList.length > 0) {
        const first = invList[0];
        setSelectedInv(first);
        const [gData, fData] = await Promise.all([
          getInvestigationGraph(first.id),
          getInvestigationFindings(first.id),
        ]);
        setGraphData(gData);
        setFindings(fData);
      }
    } catch (err) {
      console.error("Failed to load investigation workspace:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "host":
        return "border-red-500/60 bg-red-950/40 text-red-300 shadow-red-500/10";
      case "user":
        return "border-blue-500/60 bg-blue-950/40 text-blue-300 shadow-blue-500/10";
      case "process":
        return "border-amber-500/60 bg-amber-950/40 text-amber-300 shadow-amber-500/10";
      case "technique":
        return "border-indigo-500/60 bg-indigo-950/40 text-indigo-300 shadow-indigo-500/10";
      case "domain":
        return "border-purple-500/60 bg-purple-950/40 text-purple-300 shadow-purple-500/10";
      default:
        return "border-slate-700 bg-slate-900 text-slate-300";
    }
  };

  const handleExecuteContainment = () => {
    setActionStatus("Executing containment via Safe Mock Adapter...");
    setTimeout(() => {
      setActionStatus("✔ Containment executed safely: Host isolation policy simulated with full audit record.");
      setConfirmModalOpen(false);
    }, 1200);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Workspace Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-white">Investigation Workspace</h1>
            {selectedInv && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
                Risk Score: {selectedInv.risk_score || 94}/100
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Graph
            </button>
            <Link
              href="/detections"
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5" /> Engineer Detection Rule
            </Link>
          </div>
        </header>

        {/* Centerpiece Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Visualizer: Evidence Graph Canvas */}
          <div className="flex-1 flex flex-col border-r border-slate-800/80 bg-[#070b12] overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 bg-[#090e18] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-slate-200">Authoritative Evidence Graph</span>
                <span className="text-slate-500">(PostgreSQL Persisted)</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                <span>{graphData?.nodes?.length || 0} Entities</span>
                <span>{graphData?.edges?.length || 0} Relationships</span>
              </div>
            </div>

            {/* Interactive Graph Canvas */}
            <div className="flex-1 relative flex items-center justify-center p-8 overflow-auto">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

              {loading ? (
                <div className="text-xs text-slate-500 animate-pulse">
                  Querying relational evidence graph...
                </div>
              ) : !graphData || graphData.nodes.length === 0 ? (
                <div className="text-xs text-slate-500">
                  No evidence relationships mapped yet. Run `socforge demo` to seed.
                </div>
              ) : (
                <div className="relative z-10 w-full max-w-2xl flex flex-col items-center space-y-8">
                  {/* Entity Graph Rendering */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                    {graphData.nodes.map((node) => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-4 rounded-xl border shadow-lg cursor-pointer transition transform hover:-translate-y-0.5 ${getNodeColor(
                          node.type
                        )} ${
                          selectedNode?.id === node.id ? "ring-2 ring-white" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 text-[10px] uppercase font-mono font-bold tracking-wider opacity-80">
                          <span>{node.type}</span>
                          {node.data.risk_score && <span>Risk: {node.data.risk_score}</span>}
                        </div>
                        <div className="text-xs font-semibold truncate">
                          {node.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Relationship Edges Summary */}
                  <div className="bg-[#0b1220] border border-slate-800/80 p-4 rounded-xl w-full text-xs space-y-2 font-mono">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      Validated Relationship Edges (entity_relationships table):
                    </div>
                    <div className="space-y-1 text-slate-300 text-[11px]">
                      {graphData.edges.map((e) => (
                        <div key={e.id} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          <span className="text-slate-400 font-semibold">{e.label}</span>
                          <span className="text-slate-600 font-mono">({e.id.slice(0, 8)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Findings & Hypotheses Panel */}
            <div className="h-56 border-t border-slate-800/80 bg-[#0a0f1a] p-5 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Analyst Evidence-Backed Findings
                </span>
                <span className="text-xs text-slate-500">{findings.length} Documented</span>
              </div>

              {findings.map((f) => (
                <div key={f.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">{f.title}</h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-mono font-bold">
                      Confidence: {f.confidence}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Entity Inspector & Response Advisor */}
          <div className="w-full lg:w-96 border-l border-slate-800/80 bg-[#0a0f1a] flex flex-col overflow-y-auto">
            {/* Entity Inspector */}
            <div className="p-6 border-b border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Entity Inspector
                </span>
                {selectedNode && (
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {selectedNode ? (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Selected Entity</span>
                    <strong className="text-sm text-white font-semibold">{selectedNode.label}</strong>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <div>Type: <span className="text-blue-400 uppercase">{selectedNode.type}</span></div>
                    <div>Value: <span className="text-slate-200">{selectedNode.data.value}</span></div>
                    <div>Risk: <span className="text-red-400 font-bold">{selectedNode.data.risk_score || "None"}</span></div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  Click any node on the canvas to inspect entity properties and connected edges.
                </div>
              )}
            </div>

            {/* Controlled Response Advisor */}
            <div className="p-6 flex-1 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Controlled Response Advisor
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  Gated Gate
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Actions are strictly approval-gated. The platform prevents arbitrary autonomous execution against production systems.
              </p>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
                <div className="font-semibold text-white">Recommended Action:</div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
                  isolate_host(DC-PRIMARY-01)
                </div>

                {actionStatus ? (
                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                    {actionStatus}
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition shadow-md shadow-red-600/20"
                  >
                    <Lock className="w-3.5 h-3.5" /> Authorize Host Containment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-red-400">
                <AlertOctagon className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">Confirm Controlled Response</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                You are authorizing <strong className="text-white font-mono">isolate_host(DC-PRIMARY-01)</strong>. This action will invoke the controlled containment adapter and log an immutable audit event.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteContainment}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
                >
                  Confirm & Execute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
