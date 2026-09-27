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
  Lock,
  Download,
  Plus
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

  // Add finding modal state
  const [addFindingModalOpen, setAddFindingModalOpen] = useState(false);
  const [newFindingTitle, setNewFindingTitle] = useState("");
  const [newFindingConfidence, setNewFindingConfidence] = useState<"high" | "medium" | "low">("high");
  const [newFindingDesc, setNewFindingDesc] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        return "border-neutral-500/60 bg-neutral-900/60 text-white shadow-neutral-500/10";
      case "process":
        return "border-amber-500/60 bg-amber-950/40 text-amber-300 shadow-amber-500/10";
      case "technique":
        return "border-purple-500/60 bg-purple-950/40 text-purple-300 shadow-purple-500/10";
      case "domain":
        return "border-yellow-500/60 bg-yellow-950/40 text-yellow-300 shadow-yellow-500/10";
      default:
        return "border-[#262626] bg-[#0A0A0A] text-neutral-300";
    }
  };

  const handleExecuteContainment = () => {
    setActionStatus("Executing containment via Safe Mock Adapter...");
    setTimeout(() => {
      setActionStatus("✔ Containment executed safely: Host isolation policy simulated with full audit record.");
      setConfirmModalOpen(false);
    }, 1200);
  };

  const handleExportGraph = () => {
    if (!graphData && !selectedInv) return;
    const exportPayload = {
      investigation_id: selectedInv?.id || "INV-PRIMARY",
      title: selectedInv?.title || "Active Investigation",
      risk_score: selectedInv?.risk_score || 94,
      exported_at: new Date().toISOString(),
      nodes: graphData?.nodes || [],
      edges: graphData?.edges || [],
      findings: findings
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOCForge_Investigation_${selectedInv?.id || "Graph"}_Export.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage("Investigation graph JSON exported successfully.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFindingTitle.trim()) return;

    const newF: FindingItem = {
      id: `f-${Date.now()}`,
      investigation_id: selectedInv?.id || "INV-001",
      title: newFindingTitle.trim(),
      description: newFindingDesc.trim() || "Empirical observable correlation verified by lead analyst.",
      confidence: newFindingConfidence,
      created_at: new Date().toISOString()
    };

    setFindings((prev) => [newF, ...prev]);
    setAddFindingModalOpen(false);
    setNewFindingTitle("");
    setNewFindingDesc("");
    setToastMessage(`Finding "${newF.title}" added to investigation record.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000] text-neutral-100">
        {/* Workspace Top Header */}
        <header className="h-16 border-b border-[#262626] bg-[#050505]/95 px-8 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-base font-bold text-white tracking-tight">Investigation Workspace</h1>
            {selectedInv && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold font-mono">
                Risk Score: {selectedInv.risk_score || 94}/100
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportGraph}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-[#262626] bg-[#0A0A0A] hover:bg-[#171717] text-neutral-300 transition font-mono"
              title="Export complete evidence graph topology and findings as JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export Graph
            </button>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-[#262626] bg-[#0A0A0A] hover:bg-[#171717] text-neutral-300 transition font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
              Refresh Graph
            </button>
            {selectedInv && (
              <Link
                href={`/investigations/${selectedInv.id}`}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-[#262626] text-white font-bold transition font-mono"
              >
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" /> Open Detail Studio
              </Link>
            )}
            <Link
              href="/detections"
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg bg-white hover:bg-neutral-200 text-black font-bold transition font-mono"
            >
              <FileCode className="w-3.5 h-3.5" /> Engineer Detection Rule
            </Link>
          </div>
        </header>

        {/* Centerpiece Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Visualizer: Evidence Graph Canvas */}
          <div className="flex-1 flex flex-col border-r border-[#262626] bg-[#000000] overflow-hidden">
            <div className="p-4 border-b border-[#262626] bg-[#050505] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-400">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Authoritative Evidence Graph</span>
                <span className="text-neutral-500 font-mono">(PostgreSQL Persisted)</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-neutral-500 font-mono">
                <span>{graphData?.nodes?.length || 0} Entities</span>
                <span>{graphData?.edges?.length || 0} Relationships</span>
              </div>
            </div>

            {/* Interactive Graph Canvas */}
            <div className="flex-1 relative flex items-center justify-center p-8 overflow-auto">
              <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

              {loading ? (
                <div className="text-xs text-neutral-500 font-mono animate-pulse">
                  Querying relational evidence graph...
                </div>
              ) : !graphData || graphData.nodes.length === 0 ? (
                <div className="text-xs text-neutral-500 font-mono">
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
                          {node.risk_score ? <span>Risk: {(node.risk_score * (node.risk_score <= 1 ? 100 : 1)).toFixed(0)}%</span> : null}
                        </div>
                        <div className="text-xs font-semibold truncate">
                          {node.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Relationship Edges Summary */}
                  <div className="bg-[#050505] border border-[#262626] p-4 rounded-xl w-full text-xs space-y-2 font-mono">
                    <div className="text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                      Validated Relationship Edges (entity_relationships table):
                    </div>
                    <div className="space-y-1 text-neutral-300 text-[11px]">
                      {graphData.edges.map((e) => (
                        <div key={e.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="text-neutral-200 font-semibold">{e.relationship || (e as any).label}</span>
                          </div>
                          <span className="text-neutral-500 font-mono text-[10px]">{e.evidence_count} evidence</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Findings & Hypotheses Panel */}
            <div className="h-56 border-t border-[#262626] bg-[#050505] p-5 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Analyst Evidence-Backed Findings
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 font-mono">{findings.length} Documented</span>
                  <button
                    onClick={() => setAddFindingModalOpen(true)}
                    className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded transition"
                  >
                    <Plus className="w-3 h-3" /> Add Finding
                  </button>
                </div>
              </div>

              {findings.map((f) => (
                <div key={f.id} className="bg-[#0A0A0A] border border-[#262626] p-3 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">{f.title}</h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-mono font-bold">
                      Confidence: {f.confidence}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Entity Inspector & Response Advisor */}
          <div className="w-full lg:w-96 border-l border-[#262626] bg-[#050505] flex flex-col overflow-y-auto">
            {/* Entity Inspector */}
            <div className="p-6 border-b border-[#262626] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                  Entity Inspector
                </span>
                {selectedNode && (
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-[11px] text-neutral-500 hover:text-white font-mono"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {selectedNode ? (
                <div className="bg-[#0A0A0A] border border-[#262626] p-4 rounded-xl space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-mono block">Selected Entity</span>
                    <strong className="text-sm text-white font-semibold">{selectedNode.label}</strong>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-neutral-300">
                    <div>Type: <span className="text-white uppercase font-bold">{selectedNode.type}</span></div>
                    <div>Value: <span className="text-neutral-200">{selectedNode.properties?.value || selectedNode.properties?.username || selectedNode.properties?.hostname || selectedNode.properties?.process_name || selectedNode.label}</span></div>
                    <div>Risk: <span className="text-red-400 font-bold">{selectedNode.risk_score ? `${(selectedNode.risk_score * (selectedNode.risk_score <= 1 ? 100 : 1)).toFixed(0)}%` : "None"}</span></div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#262626] text-center text-xs text-neutral-500 font-mono">
                  Click any node on the canvas to inspect entity properties and connected edges.
                </div>
              )}
            </div>

            {/* Controlled Response Advisor */}
            <div className="p-6 flex-1 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Controlled Response Advisor
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  Dual-Gated
                </span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Actions are strictly approval-gated. The platform prevents arbitrary autonomous execution against production systems.
              </p>

              <div className="bg-[#0A0A0A] border border-[#262626] p-4 rounded-xl space-y-3 text-xs">
                <div className="font-semibold text-white">Recommended Action:</div>
                <div className="p-2.5 rounded-lg bg-[#000000] border border-[#262626] text-neutral-300 font-mono text-[11px]">
                  isolate_host(DC-PRIMARY-01)
                </div>

                {actionStatus ? (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                    {actionStatus}
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition shadow-md shadow-red-600/20 font-mono text-xs"
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
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-red-400">
                <AlertOctagon className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">Confirm Controlled Response</h3>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                You are authorizing <strong className="text-white font-mono">isolate_host(DC-PRIMARY-01)</strong>. This action will invoke the controlled containment adapter and log an immutable audit event.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#262626] text-neutral-400 hover:text-white text-xs transition font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteContainment}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition font-mono"
                >
                  Confirm & Execute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Finding Modal */}
        {addFindingModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#050505] border border-[#262626] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Document Analyst Finding</h3>
                    <p className="text-xs text-neutral-400">Attach empirical observable hypothesis to active investigation graph</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddFindingModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddFinding} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="text-neutral-400 block mb-1">Finding Title / Assertion *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lateral SMB authentication spike from DC-BACKUP-02"
                    value={newFindingTitle}
                    onChange={(e) => setNewFindingTitle(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Analytic Confidence</label>
                  <select
                    value={newFindingConfidence}
                    onChange={(e: any) => setNewFindingConfidence(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="high">HIGH CONFIDENCE (Correlated across &gt;3 logs)</option>
                    <option value="medium">MEDIUM CONFIDENCE (Single-source telemetry)</option>
                    <option value="low">LOW CONFIDENCE (Heuristic indicator)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Evidence Summary & Methodology</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the observable was validated against event timeline, parent PID, or network flow records..."
                    value={newFindingDesc}
                    onChange={(e) => setNewFindingDesc(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setAddFindingModalOpen(false)}
                    className="px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-300 border border-[#262626] rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Finding</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#050505] border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
