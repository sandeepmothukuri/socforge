"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  getInvestigationById,
  getInvestigationGraph,
  getInvestigationFindings,
  getAlerts,
  executeResponseAction,
  InvestigationItem,
  EvidenceGraphData,
  EvidenceGraphNode,
  FindingItem,
  AlertItem,
} from "@/lib/api";
import {
  Share2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  FileText,
  Clock,
  Activity,
  ChevronRight,
  X,
} from "lucide-react";

// ── Entity type colour map ───────────────────────────────────────────────────
const NODE_COLORS: Record<string, { fill: string; text: string; ring: string }> = {
  User:       { fill: "#121212", text: "#ffffff", ring: "#525252" },
  Host:       { fill: "#121212", text: "#10b981", ring: "#059669" },
  IP:         { fill: "#121212", text: "#ef4444", ring: "#dc2626" },
  Process:    { fill: "#121212", text: "#f97316", ring: "#ea580c" },
  File:       { fill: "#121212", text: "#a855f7", ring: "#9333ea" },
  Technique:  { fill: "#121212", text: "#ec4899", ring: "#db2777" },
  Domain:     { fill: "#121212", text: "#eab308", ring: "#ca8a04" },
  default:    { fill: "#0a0a0a", text: "#a3a3a3", ring: "#262626" },
};

// ── Severity pill ────────────────────────────────────────────────────────────
function SeverityBadge({ value }: { value?: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high:     "bg-orange-500/15 text-orange-400 border-orange-500/30",
    medium:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    low:      "bg-neutral-800 text-neutral-300 border-neutral-700",
  };
  const cls = map[(value || "").toLowerCase()] || "bg-[#171717] text-neutral-400 border-[#262626]";
  return (
    <span className={`px-2 py-0.5 rounded border text-[11px] font-mono uppercase ${cls}`}>
      {value || "unknown"}
    </span>
  );
}

// ── Status pill ──────────────────────────────────────────────────────────────
function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    active:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    open:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    closed:   "bg-[#171717] text-neutral-500 border-[#262626]",
    resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };
  const cls = map[value.toLowerCase()] || "bg-[#171717] text-neutral-400 border-[#262626]";
  return (
    <span className={`px-2 py-0.5 rounded border text-[11px] font-mono uppercase ${cls}`}>
      {value}
    </span>
  );
}

// ── Evidence Graph Canvas ────────────────────────────────────────────────────
function EvidenceGraph({
  data,
  onSelect,
}: {
  data: EvidenceGraphData;
  onSelect: (node: EvidenceGraphNode | null) => void;
}) {
  const W = 780;
  const H = 420;
  const cx = W / 2;
  const cy = H / 2;

  const positions = React.useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    const n = data.nodes.length;
    if (n === 0) return map;
    data.nodes.forEach((node, i) => {
      if (n === 1) {
        map[node.id] = { x: cx, y: cy };
      } else {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const r = Math.min(cx, cy) * 0.68;
        map[node.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
      }
    });
    return map;
  }, [data.nodes, cx, cy]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      style={{ background: "transparent" }}
    >
      {/* Edges */}
      {data.edges.map((edge) => {
        const src = positions[edge.source];
        const tgt = positions[edge.target];
        if (!src || !tgt) return null;
        return (
          <g key={edge.id}>
            <line
              x1={src.x} y1={src.y}
              x2={tgt.x} y2={tgt.y}
              stroke="#262626" strokeWidth={1.5} strokeDasharray="4 3"
            />
            <text
              x={(src.x + tgt.x) / 2}
              y={(src.y + tgt.y) / 2 - 5}
              fill="#737373"
              fontSize={9}
              textAnchor="middle"
              fontFamily="monospace"
            >
              {edge.relationship}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {data.nodes.map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        const colors = NODE_COLORS[node.type] || NODE_COLORS.default;
        const radius = 28;
        return (
          <g
            key={node.id}
            transform={`translate(${pos.x}, ${pos.y})`}
            className="cursor-pointer"
            onClick={() => onSelect(node)}
          >
            <circle r={radius + 3} fill="none" stroke={colors.ring} strokeWidth={1.5} opacity={0.4} />
            <circle r={radius} fill={colors.fill} stroke={colors.ring} strokeWidth={2} />
            <text fill={colors.text} fontSize={9} fontWeight="bold" textAnchor="middle" dy={-6} fontFamily="monospace">
              {node.type}
            </text>
            <text fill="#ffffff" fontSize={8} textAnchor="middle" dy={6} fontFamily="monospace">
              {node.label.length > 12 ? node.label.slice(0, 12) + "…" : node.label}
            </text>
            {node.risk_score > 0 && (
              <text fill="#ef4444" fontSize={8} textAnchor="middle" dy={17} fontFamily="monospace">
                ⚠ {node.risk_score}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Response Advisor ─────────────────────────────────────────────────────────
const RESPONSE_ACTIONS = [
  { type: "isolate_host",  label: "Isolate Host",   icon: Lock,         targetType: "host",  color: "red" },
  { type: "disable_user",  label: "Disable User",   icon: AlertOctagon, targetType: "user",  color: "orange" },
  { type: "block_ip",      label: "Block IP",        icon: ShieldCheck,  targetType: "ip",    color: "yellow" },
];

function ResponseAdvisor({ investigationId }: { investigationId: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(RESPONSE_ACTIONS[0]);
  const [targetValue, setTargetValue] = useState("");
  const [justification, setJustification] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!targetValue.trim() || !justification.trim()) return;
    setSubmitting(true);
    setStatus(null);
    try {
      await executeResponseAction(
        selected.type,
        selected.targetType,
        targetValue.trim(),
        justification.trim()
      );
      setStatus("✓ Containment action queued for analyst approval.");
      setTargetValue("");
      setJustification("");
    } catch (err: any) {
      setStatus(`✗ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-5 bg-[#050505] border border-[#262626] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">Response Advisor</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded font-mono">
            Dual-Gated
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-neutral-400 hover:text-white transition font-mono"
        >
          {open ? "Hide" : "Configure Action"}
        </button>
      </div>

      {open && (
        <div className="space-y-3 pt-2 border-t border-[#262626]">
          <p className="text-[11px] text-neutral-400 font-mono">
            All containment actions require justification and analyst peer approval before execution.
          </p>

          {/* Action type */}
          <div className="flex gap-2">
            {RESPONSE_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.type}
                  onClick={() => setSelected(action)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition font-mono ${
                    selected.type === action.type
                      ? "bg-white border-white text-black font-bold"
                      : "bg-[#0A0A0A] border-[#262626] text-neutral-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {action.label}
                </button>
              );
            })}
          </div>

          <input
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={`Target ${selected.targetType} value…`}
            className="w-full px-3 py-2 rounded-lg bg-[#000000] border border-[#262626] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white font-mono"
          />
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={2}
            placeholder="Justification (required for audit trail)…"
            className="w-full px-3 py-2 rounded-lg bg-[#000000] border border-[#262626] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white resize-none font-mono"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !targetValue.trim() || !justification.trim()}
            className="w-full py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition font-mono font-bold"
          >
            {submitting ? "Submitting…" : "Submit for Approval"}
          </button>
          {status && (
            <p className={`text-[11px] font-mono ${status.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
              {status}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [inv, setInv] = useState<InvestigationItem | null>(null);
  const [graphData, setGraphData] = useState<EvidenceGraphData | null>(null);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<EvidenceGraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "findings" | "timeline">("graph");

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [invData, graphRes, findingsRes, alertsRes] = await Promise.allSettled([
        getInvestigationById(id),
        getInvestigationGraph(id),
        getInvestigationFindings(id),
        getAlerts(),
      ]);

      if (invData.status === "fulfilled") setInv(invData.value);
      else setError("Investigation not found.");

      if (graphRes.status === "fulfilled") setGraphData(graphRes.value);
      if (findingsRes.status === "fulfilled") setFindings(findingsRes.value);
      if (alertsRes.status === "fulfilled") setAlerts(alertsRes.value.items.slice(0, 10));
    } catch (err: any) {
      setError(err.message || "Failed to load investigation.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000] text-neutral-100">
        {/* Header */}
        <header className="h-16 border-b border-[#262626] bg-[#050505]/95 px-8 flex items-center justify-between shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/investigations")}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Investigations
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white truncate max-w-xs">
              {inv?.title || (loading ? "Loading…" : "Investigation Studio")}
            </span>
            {inv && <StatusBadge value={inv.status} />}
            {inv?.severity && <SeverityBadge value={inv.severity} />}
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-[#262626] bg-[#0A0A0A] hover:bg-[#171717] text-neutral-300 transition font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="p-4 m-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-mono">
            {error}
          </div>
        )}

        {!loading && !error && inv && (
          <div className="flex-1 flex overflow-hidden">
            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex gap-1 px-6 pt-4 border-b border-[#262626] bg-[#050505]">
                {(["graph", "findings", "timeline"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition capitalize font-mono ${
                      activeTab === tab
                        ? "border-white text-white bg-white/5"
                        : "border-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {tab === "graph" && <Share2 className="inline w-3 h-3 mr-1" />}
                    {tab === "findings" && <FileText className="inline w-3 h-3 mr-1" />}
                    {tab === "timeline" && <Clock className="inline w-3 h-3 mr-1" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === "findings" && findings.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                        {findings.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[#000000]">
                {/* Evidence Graph Tab */}
                {activeTab === "graph" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#262626] bg-[#050505] overflow-hidden h-[420px]">
                      {graphData && (graphData.nodes.length > 0) ? (
                        <EvidenceGraph data={graphData} onSelect={setSelectedNode} />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2 font-mono">
                          <Share2 className="w-8 h-8 text-neutral-600" />
                          <p className="text-xs">No entity graph data yet</p>
                        </div>
                      )}
                    </div>
                    {/* Node inspector */}
                    {selectedNode && (
                      <div className="p-4 bg-[#050505] border border-[#262626] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white font-mono">Entity Inspector</span>
                          <button onClick={() => setSelectedNode(null)}>
                            <X className="w-3.5 h-3.5 text-neutral-500 hover:text-white" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-neutral-500 block font-mono">Type</span>
                            <span className="text-white font-mono">{selectedNode.type}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block font-mono">Label</span>
                            <span className="text-white font-mono">{selectedNode.label}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block font-mono">Risk Score</span>
                            <span className={`font-mono font-bold ${selectedNode.risk_score > 70 ? "text-red-400" : selectedNode.risk_score > 40 ? "text-yellow-400" : "text-emerald-400"}`}>
                              {selectedNode.risk_score}
                            </span>
                          </div>
                        </div>
                        {Object.keys(selectedNode.properties || {}).length > 0 && (
                          <div className="pt-1 space-y-1">
                            {Object.entries(selectedNode.properties).map(([k, v]) => (
                              <div key={k} className="flex gap-2 text-xs">
                                <span className="text-neutral-500 min-w-[80px] font-mono">{k}:</span>
                                <span className="text-neutral-300 font-mono truncate">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Findings Tab */}
                {activeTab === "findings" && (
                  <div className="space-y-3">
                    {findings.length === 0 ? (
                      <div className="p-8 border border-dashed border-[#262626] rounded-xl text-center space-y-2 font-mono">
                        <FileText className="w-6 h-6 text-neutral-600 mx-auto" />
                        <p className="text-xs text-neutral-400">No analyst findings recorded yet.</p>
                      </div>
                    ) : (
                      findings.map((finding) => (
                        <div key={finding.id} className="p-5 bg-[#050505] border border-[#262626] rounded-xl space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-sm font-bold text-white">{finding.title}</h3>
                            <span className={`shrink-0 px-2 py-0.5 rounded border text-[11px] font-mono uppercase ${
                              finding.confidence === "confirmed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : finding.confidence === "suspected"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                : "bg-[#171717] text-neutral-400 border-[#262626]"
                            }`}>
                              {finding.confidence}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed">{finding.description}</p>
                          {finding.mitre_techniques.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {finding.mitre_techniques.map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-200 border border-[#262626] text-[10px] font-mono">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          {finding.response_recommendations.length > 0 && (
                            <div className="pt-1">
                              <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider font-mono">Recommended Actions: </span>
                              <span className="text-[10px] text-neutral-400 font-mono">{finding.response_recommendations.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === "timeline" && (
                  <div className="space-y-2 font-mono">
                    <p className="text-xs text-neutral-500 mb-4">
                      Correlated alert timeline — most recent events associated with this investigation.
                    </p>
                    {alerts.length === 0 ? (
                      <div className="p-8 border border-dashed border-[#262626] rounded-xl text-center space-y-2">
                        <Activity className="w-6 h-6 text-neutral-600 mx-auto" />
                        <p className="text-xs text-neutral-400">No correlated alerts found.</p>
                      </div>
                    ) : (
                      <div className="relative space-y-0">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-[#262626]" />
                        {alerts.map((alert) => (
                          <div key={alert.id} className="relative flex gap-4 pl-10 pb-4">
                            <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                              alert.severity === "critical" ? "bg-red-500 border-red-400" :
                              alert.severity === "high" ? "bg-orange-500 border-orange-400" :
                              "bg-neutral-600 border-neutral-500"
                            }`} />
                            <div className="flex-1 p-3 bg-[#050505] border border-[#262626] rounded-xl">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-semibold text-white truncate">{alert.title}</span>
                                <SeverityBadge value={alert.severity} />
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono">
                                {alert.source_host && <span>{alert.source_host}</span>}
                                {alert.username && <span>• {alert.username}</span>}
                                {alert.mitre_techniques && alert.mitre_techniques.length > 0 && (
                                  <span className="text-neutral-300">• {alert.mitre_techniques[0]}</span>
                                )}
                                <span className="ml-auto">{new Date(alert.created_at).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="w-80 border-l border-[#262626] flex flex-col overflow-y-auto bg-[#050505]">
              <div className="p-5 space-y-5">
                {/* Investigation meta */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">Investigation Details</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: "ID",          value: inv.id.slice(0, 16) + "…" },
                      { label: "Status",       value: inv.status },
                      { label: "Risk Score",   value: inv.risk_score?.toString() || "N/A" },
                      { label: "Alerts",       value: inv.alert_count.toString() },
                      { label: "Findings",     value: inv.finding_count.toString() },
                      { label: "Opened",       value: new Date(inv.opened_at).toLocaleDateString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-neutral-500">{label}</span>
                        <span className="text-neutral-300 font-mono text-[11px]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MITRE techniques */}
                {inv.mitre_techniques.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">MITRE ATT&CK</h3>
                    <div className="flex flex-wrap gap-1">
                      {inv.mitre_techniques.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-200 border border-[#262626] text-[10px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                    {inv.mitre_tactics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {inv.mitre_tactics.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-[#171717] text-neutral-400 border border-[#262626] text-[10px] font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {inv.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">Summary</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{inv.description}</p>
                  </div>
                )}

                {/* Response Advisor */}
                <ResponseAdvisor investigationId={inv.id} />
              </div>
            </aside>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center font-mono">
            <div className="text-xs text-neutral-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              Loading investigation…
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
