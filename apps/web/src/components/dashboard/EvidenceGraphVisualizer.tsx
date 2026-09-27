"use client";

import React, { useState, useMemo } from "react";
import { 
  EvidenceGraphData, 
  EvidenceGraphNode, 
  EvidenceGraphEdge 
} from "@/lib/api";
import { 
  Share2, 
  Layers, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  Server,
  User,
  Cpu,
  Flame,
  Globe,
  Hash,
  X,
  Network,
  LayoutGrid,
  GitBranch
} from "lucide-react";

interface EvidenceGraphVisualizerProps {
  data: EvidenceGraphData | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  investigationTitle?: string;
}

export function EvidenceGraphVisualizer({
  data,
  loading,
  error,
  onRetry,
  investigationTitle,
}: EvidenceGraphVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<EvidenceGraphNode | null>(null);
  const [viewMode, setViewMode] = useState<"flow" | "grid">("flow");

  const getNodeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "host":
        return <Server className="w-3.5 h-3.5" />;
      case "user":
        return <User className="w-3.5 h-3.5" />;
      case "process":
        return <Cpu className="w-3.5 h-3.5" />;
      case "technique":
        return <Flame className="w-3.5 h-3.5" />;
      case "domain":
      case "ip_address":
        return <Globe className="w-3.5 h-3.5" />;
      default:
        return <Hash className="w-3.5 h-3.5" />;
    }
  };

  const getNodeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case "host":
        return "border-red-500/50 bg-red-950/20 text-red-300 hover:border-red-400";
      case "user":
        return "border-emerald-500/50 bg-emerald-950/20 text-emerald-300 hover:border-emerald-400";
      case "process":
        return "border-amber-500/50 bg-amber-950/20 text-amber-300 hover:border-amber-400";
      case "technique":
        return "border-purple-500/50 bg-purple-950/20 text-purple-300 hover:border-purple-400";
      case "domain":
      case "ip_address":
        return "border-neutral-500/50 bg-neutral-900/40 text-neutral-200 hover:border-white";
      default:
        return "border-neutral-800 bg-[#0A0A0A] text-neutral-200 hover:border-white/40";
    }
  };

  // Sort nodes in logical SOC attack progression: user -> host -> process -> technique
  const orderedNodes = useMemo(() => {
    if (!data?.nodes) return [];
    const order: Record<string, number> = {
      user: 1,
      account: 1,
      ip_address: 2,
      domain: 2,
      host: 3,
      server: 3,
      process: 4,
      file: 4,
      technique: 5,
    };
    return [...data.nodes].sort((a, b) => {
      const rankA = order[a.type.toLowerCase()] || 99;
      const rankB = order[b.type.toLowerCase()] || 99;
      return rankA - rankB;
    });
  }, [data]);

  // Find connecting edge label between two nodes
  const getConnectingLabel = (sourceNode: EvidenceGraphNode, targetNode: EvidenceGraphNode) => {
    if (!data?.edges) return null;
    const directEdge = data.edges.find(
      (e) => (e.source === sourceNode.id && e.target === targetNode.id) ||
             (e.source === targetNode.id && e.target === sourceNode.id)
    );
    if (directEdge) {
      return directEdge.relationship.replace(/_/g, " ");
    }
    // Contextual fallback based on standard entity relationships
    if (sourceNode.type === "user" && targetNode.type === "host") return "AUTHENTICATED_TO";
    if (sourceNode.type === "host" && targetNode.type === "process") return "RAN_PROCESS";
    if (sourceNode.type === "process" && targetNode.type === "technique") return "MAPS_TO";
    if (sourceNode.type === "host" && targetNode.type === "technique") return "EXHIBITS";
    return "CORRELATED_TO";
  };

  return (
    <div 
      className="bg-[#000000] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col"
      role="region"
      aria-label="Evidence Graph Visualization"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Authoritative Evidence Graph (PostgreSQL Persisted)
            </h3>
            {investigationTitle && (
              <p className="text-[11px] text-neutral-400 truncate max-w-md">
                Case: <span className="text-white font-medium">{investigationTitle}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400">
          {data && (
            <>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                {data.nodes.length} Entities
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                {data.edges.length} Relationships
              </span>
            </>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={() => setViewMode("flow")}
              className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 transition ${
                viewMode === "flow" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
              }`}
              title="Attack Path Flow View"
              aria-label="Attack Path Flow View"
            >
              <GitBranch className="w-3 h-3" />
              <span>Flow</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 transition ${
                viewMode === "grid" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
              }`}
              title="Entity Grid View"
              aria-label="Entity Grid View"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Grid</span>
            </button>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              disabled={loading}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              title="Refresh Graph"
              aria-label="Refresh Graph"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-white" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative min-h-[300px] flex-1 p-6 flex flex-col items-center justify-center overflow-x-auto bg-[#000000] bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-xs text-white animate-pulse" role="status">
            <RefreshCw className="w-6 h-6 animate-spin text-white" />
            <span className="font-mono">Loading relational evidence graph from PostgreSQL...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-lg bg-red-950/20 border border-red-500/40 text-center max-w-md space-y-3" role="alert">
            <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to load Evidence Graph</span>
            </div>
            <p className="text-[11px] text-red-300 font-mono">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold transition"
              >
                Retry Graph Query
              </button>
            )}
          </div>
        ) : !data || data.nodes.length === 0 ? (
          <div className="text-center p-8 space-y-2 text-neutral-500">
            <Share2 className="w-8 h-8 mx-auto opacity-40 text-neutral-500" />
            <div className="text-xs font-mono">No evidence relationships mapped for this investigation yet.</div>
            <p className="text-[11px] max-w-sm text-neutral-400">
              Run the SOCForge demo workflow or ingest raw telemetry to build the typed attack path.
            </p>
          </div>
        ) : viewMode === "flow" ? (
          /* ── ATTACK PATH FLOW VIEW (Interconnected sequence with relationship arrows) ── */
          <div className="w-full flex flex-col items-center space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono">
              {orderedNodes.map((node, index) => {
                const isSelected = selectedNode?.id === node.id;
                const nextNode = orderedNodes[index + 1];
                const relationshipLabel = nextNode ? getConnectingLabel(node, nextNode) : null;

                return (
                  <React.Fragment key={node.id}>
                    {/* Entity Node Card */}
                    <button
                      onClick={() => setSelectedNode(isSelected ? null : node)}
                      className={`p-3.5 rounded-xl border text-left transition-all transform hover:-translate-y-0.5 shadow-md flex items-center gap-3 ${getNodeStyles(
                        node.type
                      )} ${isSelected ? "ring-2 ring-white scale-105" : ""}`}
                      aria-label={`Node: ${node.label} (${node.type})`}
                    >
                      <div className="p-2 rounded-lg bg-black/60">
                        {getNodeIcon(node.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-80">
                            {node.type} ENTITY
                          </span>
                          {node.risk_score > 0 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                              {(node.risk_score * (node.risk_score <= 1 ? 100 : 1)).toFixed(0)}% Risk
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-white truncate max-w-[150px]">
                          {node.label}
                        </div>
                      </div>
                    </button>

                    {/* Directional Connector Arrow with Relationship Badge */}
                    {nextNode && (
                      <div className="flex items-center gap-1.5 text-neutral-600 font-mono text-xs shrink-0 py-1">
                        <span>─[</span>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          {relationshipLabel}
                        </span>
                        <span>]─►</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Persistence & Audit Guarantee Note */}
            <div className="text-xs text-neutral-400 max-w-xl text-center leading-relaxed font-mono">
              Relationship edges are persisted in PostgreSQL with strict foreign keys to raw events, ensuring verifiable audit trails for detection engineers and responders.
            </div>
          </div>
        ) : (
          /* ── MATRIX / GRID VIEW ── */
          <div className="w-full max-w-4xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    className={`p-3.5 rounded-xl border text-left transition-all transform hover:-translate-y-0.5 shadow-md flex items-center gap-3 ${getNodeStyles(
                      node.type
                    )} ${isSelected ? "ring-2 ring-white scale-105" : ""}`}
                  >
                    <div className="p-2 rounded-lg bg-black/60">
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-80 block">
                        {node.type}
                      </span>
                      <div className="text-xs font-bold truncate text-white">
                        {node.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Relationship Edges Summary */}
            {data.edges.length > 0 && (
              <div className="bg-[#050505] border border-neutral-800 p-4 rounded-xl space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase tracking-wider font-bold">
                  <span>Correlated Relationship Edges</span>
                  <span>PostgreSQL Foreign Keys</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  {data.edges.map((edge) => (
                    <div
                      key={edge.id}
                      className="p-2 rounded bg-black border border-neutral-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-white font-semibold">{edge.relationship}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        {edge.evidence_count} evidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Node Details Drawer/Modal */}
      {selectedNode && (
        <div className="p-4 border-t border-neutral-800 bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white">
              {getNodeIcon(selectedNode.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{selectedNode.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-200 border border-neutral-800 uppercase">
                  {selectedNode.type} ENTITY
                </span>
                {selectedNode.risk_score > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                    {(selectedNode.risk_score * (selectedNode.risk_score <= 1 ? 100 : 1)).toFixed(0)}% Risk
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Identifier: <code className="text-white">{selectedNode.id}</code>
                {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                  <span> • Properties: {JSON.stringify(selectedNode.properties)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedNode(null)}
              className="px-3 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition flex items-center gap-1 text-[11px]"
            >
              <X className="w-3 h-3" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
