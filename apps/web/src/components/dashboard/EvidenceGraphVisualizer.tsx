"use client";

import React, { useState } from "react";
import { 
  EvidenceGraphData, 
  EvidenceGraphNode, 
  EvidenceGraphEdge 
} from "@/lib/api";
import { 
  Share2, 
  ShieldAlert, 
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
  Info,
  X
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
        return "border-red-500/50 bg-red-950/30 text-red-300 hover:border-red-400";
      case "user":
        return "border-blue-500/50 bg-blue-950/30 text-blue-300 hover:border-blue-400";
      case "process":
        return "border-amber-500/50 bg-amber-950/30 text-amber-300 hover:border-amber-400";
      case "technique":
        return "border-indigo-500/50 bg-indigo-950/30 text-indigo-300 hover:border-indigo-400";
      case "domain":
      case "ip_address":
        return "border-purple-500/50 bg-purple-950/30 text-purple-300 hover:border-purple-400";
      default:
        return "border-[#263248] bg-[#151C2E] text-[#F8FAFC] hover:border-[#38BDF8]/40";
    }
  };

  return (
    <div 
      className="bg-[#0B1020] border border-[#263248] rounded-xl overflow-hidden shadow-xl flex flex-col"
      role="region"
      aria-label="Evidence Graph Visualization"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#263248] bg-[#111827]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-[#38BDF8]" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Authoritative Evidence Graph
            </h3>
            {investigationTitle && (
              <p className="text-[11px] text-[#A7B0C0] truncate max-w-md">
                Case: <span className="text-[#38BDF8] font-medium">{investigationTitle}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-[#A7B0C0]">
          {data && (
            <>
              <span className="px-2 py-0.5 rounded bg-[#151C2E] border border-[#263248]">
                {data.nodes.length} Entities
              </span>
              <span className="px-2 py-0.5 rounded bg-[#151C2E] border border-[#263248]">
                {data.edges.length} Relationships
              </span>
            </>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={loading}
              className="p-1 rounded hover:bg-[#151C2E] text-[#A7B0C0] hover:text-[#F8FAFC] transition"
              title="Refresh Graph"
              aria-label="Refresh Graph"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#38BDF8]" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative min-h-[300px] flex-1 p-6 flex flex-col items-center justify-center overflow-auto bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-xs text-[#38BDF8] animate-pulse" role="status">
            <RefreshCw className="w-6 h-6 animate-spin text-[#38BDF8]" />
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
          <div className="text-center p-8 space-y-2 text-[#6B7280]">
            <Share2 className="w-8 h-8 mx-auto opacity-40 text-[#A7B0C0]" />
            <div className="text-xs font-mono">No evidence relationships mapped for this investigation yet.</div>
            <p className="text-[11px] max-w-sm text-[#A7B0C0]/80">
              Run the SOCForge demo workflow or ingest raw telemetry to build the typed attack path.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-6">
            {/* Dynamic Graph Nodes */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {data.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    className={`p-3 rounded-xl border text-left transition-all transform hover:-translate-y-0.5 shadow-md flex items-center gap-3 ${getNodeStyles(
                      node.type
                    )} ${isSelected ? "ring-2 ring-[#38BDF8] scale-105" : ""}`}
                    aria-label={`Node: ${node.label} (${node.type})`}
                  >
                    <div className="p-2 rounded-lg bg-[#0B1020]/60">
                      {getNodeIcon(node.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-mono font-bold tracking-wider opacity-70">
                          {node.type}
                        </span>
                        {node.risk_score > 0 && (
                          <span className="text-[9px] font-mono px-1 rounded bg-[#EF4444]/20 text-[#EF4444] font-bold">
                            {(node.risk_score * 100).toFixed(0)}% Risk
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold truncate max-w-[140px] text-[#F8FAFC]">
                        {node.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Relationship Edges */}
            {data.edges.length > 0 && (
              <div className="bg-[#111827] border border-[#263248] p-4 rounded-xl space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-[#A7B0C0] text-[10px] uppercase tracking-wider font-bold">
                  <span>Correlated Relationship Edges</span>
                  <span>PostgreSQL Foreign Keys</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  {data.edges.map((edge) => (
                    <div
                      key={edge.id}
                      className="p-2 rounded bg-[#0B1020] border border-[#263248] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                        <span className="text-[#38BDF8] font-semibold">{edge.relationship}</span>
                      </div>
                      <span className="text-[10px] text-[#6B7280]">
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
        <div className="p-4 border-t border-[#263248] bg-[#0E1626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8]">
              {getNodeIcon(selectedNode.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{selectedNode.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151C2E] text-[#38BDF8] border border-[#263248]">
                  {selectedNode.type}
                </span>
              </div>
              <div className="text-[11px] text-[#A7B0C0] font-mono mt-0.5">
                Node ID: {selectedNode.id} • Risk Score: {(selectedNode.risk_score * 100).toFixed(0)}/100
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedNode(null)}
              className="px-3 py-1 rounded bg-[#151C2E] hover:bg-[#1E293B] text-[#A7B0C0] hover:text-white border border-[#263248] transition flex items-center gap-1 text-[11px]"
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
