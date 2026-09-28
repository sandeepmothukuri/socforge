"use client";

import React, { useState, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  User,
  Laptop,
  Terminal,
  Globe,
  FileCode,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Clock,
  ExternalLink,
  ShieldCheck,
  Ban,
  Pin,
  Target,
  Eye,
  Check,
  Activity,
  Lock
} from "lucide-react";
import { DualAuthContainmentModal, DualAuthRequest } from "@/components/containment/DualAuthContainmentModal";

export interface GraphNode {
  id: string;
  label: string;
  type: "user" | "host" | "process" | "ip" | "domain" | "hash" | "technique";
  riskScore: number;
  stage: number; // Attack timeline step 1..4
  metadata?: Record<string, any>;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  stage: number;
}

const DEFAULT_NODES: GraphNode[] = [
  {
    id: "user-jdoe",
    label: "corp\\jdoe",
    type: "user",
    riskScore: 82,
    stage: 1,
    x: 80,
    y: 180,
    metadata: { department: "Finance", privilege: "Standard User", email: "jdoe@corp.local" }
  },
  {
    id: "host-wkstn04",
    label: "WKSTN-FIN-04",
    type: "host",
    riskScore: 78,
    stage: 1,
    x: 240,
    y: 180,
    metadata: { os: "Windows 11 Enterprise", ip: "10.0.4.18", isolation_state: "Active" }
  },
  {
    id: "proc-powershell",
    label: "powershell.exe -enc ...",
    type: "process",
    riskScore: 94,
    stage: 2,
    x: 420,
    y: 110,
    metadata: { pid: 4892, parent: "explorer.exe", hash: "a39fb84c2e..." }
  },
  {
    id: "tech-t1059",
    label: "T1059.001 (PowerShell)",
    type: "technique",
    riskScore: 85,
    stage: 2,
    x: 420,
    y: 20,
    metadata: { tactic: "Execution", permissions: "User" }
  },
  {
    id: "proc-rundll",
    label: "rundll32.exe comsvcs.dll",
    type: "process",
    riskScore: 98,
    stage: 3,
    x: 600,
    y: 180,
    metadata: { pid: 7104, target: "lsass.exe", action: "Memory MiniDump" }
  },
  {
    id: "tech-t1003",
    label: "T1003.001 (OS Creds: LSASS)",
    type: "technique",
    riskScore: 95,
    stage: 3,
    x: 600,
    y: 290,
    metadata: { tactic: "Credential Access", impact: "High" }
  },
  {
    id: "ip-c2",
    label: "185.220.101.5:443",
    type: "ip",
    riskScore: 92,
    stage: 4,
    x: 780,
    y: 110,
    metadata: { asn: "AS14061", country: "Netherlands", threat: "CobaltStrike C2" }
  },
  {
    id: "host-dc01",
    label: "DC-PROD-01",
    type: "host",
    riskScore: 88,
    stage: 4,
    x: 780,
    y: 250,
    metadata: { role: "Primary Domain Controller", ip: "10.0.0.1" }
  }
];

const DEFAULT_EDGES: GraphEdge[] = [
  { id: "e1", source: "user-jdoe", target: "host-wkstn04", relationship: "LOGGED_ON", stage: 1 },
  { id: "e2", source: "host-wkstn04", target: "proc-powershell", relationship: "SPAWNED", stage: 2 },
  { id: "e3", source: "proc-powershell", target: "tech-t1059", relationship: "MAPS_TO", stage: 2 },
  { id: "e4", source: "proc-powershell", target: "proc-rundll", relationship: "INJECTED_INTO", stage: 3 },
  { id: "e5", source: "proc-rundll", target: "tech-t1003", relationship: "EXPLOITED", stage: 3 },
  { id: "e6", source: "proc-powershell", target: "ip-c2", relationship: "BEACONED_TO", stage: 4 },
  { id: "e7", source: "proc-rundll", target: "host-dc01", relationship: "LATERAL_MOVEMENT", stage: 4 }
];

export function InteractiveAttackGraph({ initialNodes, initialEdges }: { initialNodes?: GraphNode[]; initialEdges?: GraphEdge[] }) {
  const nodes = initialNodes || DEFAULT_NODES;
  const edges = initialEdges || DEFAULT_EDGES;

  const [zoom, setZoom] = useState(1);
  const [timelineStep, setTimelineStep] = useState(4);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[1]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blastRadiusMode, setBlastRadiusMode] = useState(false);
  const [pinnedEvidenceIds, setPinnedEvidenceIds] = useState<string[]>([]);
  const [containedEntities, setContainedEntities] = useState<Record<string, boolean>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [dualAuthRequest, setDualAuthRequest] = useState<DualAuthRequest | null>(null);

  const blastRadiusNodeIds = useMemo(() => {
    if (!selectedNode || !blastRadiusMode) return new Set<string>();
    const direct = new Set<string>([selectedNode.id]);
    edges.forEach((e) => {
      if (e.source === selectedNode.id) direct.add(e.target);
      if (e.target === selectedNode.id) direct.add(e.source);
    });
    const twoHop = new Set<string>(direct);
    edges.forEach((e) => {
      if (direct.has(e.source)) twoHop.add(e.target);
      if (direct.has(e.target)) twoHop.add(e.source);
    });
    return twoHop;
  }, [selectedNode, blastRadiusMode, edges]);

  // Filter nodes & edges by timeline step & type
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchStage = n.stage <= timelineStep;
      const matchType = selectedType === "all" || n.type === selectedType;
      return matchStage && matchType;
    });
  }, [nodes, timelineStep, selectedType]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter((e) => {
      return (
        e.stage <= timelineStep &&
        filteredNodeIds.has(e.source) &&
        filteredNodeIds.has(e.target)
      );
    });
  }, [edges, timelineStep, filteredNodeIds]);

  const getNodeColor = (type: GraphNode["type"]) => {
    switch (type) {
      case "user":
        return { bg: "#15803D", border: "#22C55E", text: "#DCFCE7" };
      case "host":
        return { bg: "#3F3F46", border: "#A1A1AA", text: "#FAFAFA" };
      case "process":
        return { bg: "#D97706", border: "#FBBF24", text: "#FEF3C7" };
      case "ip":
      case "domain":
        return { bg: "#DC2626", border: "#F87171", text: "#FEE2E2" };
      case "technique":
        return { bg: "#9333EA", border: "#C084FC", text: "#FAF5FF" };
      default:
        return { bg: "#262626", border: "#525252", text: "#F5F5F5" };
    }
  };

  const getNodeIcon = (type: GraphNode["type"]) => {
    switch (type) {
      case "user":
        return <User className="w-3.5 h-3.5" />;
      case "host":
        return <Laptop className="w-3.5 h-3.5" />;
      case "process":
        return <Terminal className="w-3.5 h-3.5" />;
      case "ip":
      case "domain":
        return <Globe className="w-3.5 h-3.5" />;
      case "technique":
        return <ShieldAlert className="w-3.5 h-3.5" />;
      default:
        return <FileCode className="w-3.5 h-3.5" />;
    }
  };

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <div className={`flex flex-col bg-[#000000] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[620px]"}`}>
      {/* Top Controls Toolbar */}
      <div className="h-14 bg-[#050505] border-b border-neutral-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            Adversary Attack Path & Evidence Graph
          </div>
          <div className="h-4 w-px bg-neutral-800" />
          {/* Entity Type Filter */}
          <div className="flex items-center gap-1">
            {["all", "user", "host", "process", "ip", "technique"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition ${
                  selectedType === t
                    ? "bg-white text-black font-bold"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                {t}
              </button>
            ))}
            {/* Blast Radius & Pinning Buttons */}
            <div className="h-4 w-px bg-neutral-800" />
            <button
              onClick={() => setBlastRadiusMode(!blastRadiusMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition border ${
                blastRadiusMode
                  ? "bg-red-500/20 text-red-400 border-red-500/50 font-bold shadow-sm shadow-red-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800"
              }`}
              title="Toggle 2-hop contagion blast radius expansion"
            >
              <Target className="w-3.5 h-3.5 text-red-400" />
              <span>Blast Radius {blastRadiusMode ? "Active" : "Off"}</span>
            </button>

            {pinnedEvidenceIds.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Pin className="w-3 h-3" />
                {pinnedEvidenceIds.length} Pinned
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-[#000000] border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 hover:text-white hover:bg-neutral-900 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[10px] text-neutral-200">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
              className="p-1.5 hover:text-white hover:bg-neutral-900 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 hover:text-white hover:bg-neutral-900 rounded transition"
              title="Reset View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-neutral-400 hover:text-white bg-[#000000] border border-neutral-800 rounded-lg transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Graph"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas & Detail Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SVG Canvas */}
        <div className="flex-1 h-full overflow-hidden bg-[#000000] relative cursor-grab active:cursor-grabbing">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#333333 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          <svg
            className="w-full h-full"
            viewBox="0 0 920 400"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="14"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#525252" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="6"
                refX="14"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#FFFFFF" />
              </marker>
            </defs>

            {/* Render Directed Edges */}
            {filteredEdges.map((edge) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;

              const isConnectedToSelected =
                selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isConnectedToSelected ? "#FFFFFF" : "#333333"}
                    strokeWidth={isConnectedToSelected ? "2.5" : "1.5"}
                    strokeDasharray={edge.relationship === "BEACONED_TO" ? "4 4" : "none"}
                    markerEnd={isConnectedToSelected ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                  />
                  <text
                    x={midX}
                    y={midY - 5}
                    textAnchor="middle"
                    fill={isConnectedToSelected ? "#FFFFFF" : "#737373"}
                    fontSize="9"
                    fontFamily="monospace"
                    className="select-none"
                  >
                    {edge.relationship}
                  </text>
                </g>
              );
            })}

            {/* Render Nodes */}
            {filteredNodes.map((node) => {
              const style = getNodeColor(node.type);
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-all"
                >
                  {/* Outer Pulse Halo if Selected or High Risk */}
                  {(isSelected || node.riskScore > 90) && (
                    <circle
                      r="26"
                      fill={node.riskScore > 90 ? "#EF4444" : "#FFFFFF"}
                      fillOpacity="0.2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Blast Radius Contagion Ring */}
                  {blastRadiusMode && blastRadiusNodeIds.has(node.id) && (
                    <circle
                      r="30"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      className="animate-spin"
                      style={{ animationDuration: "14s" }}
                      opacity="0.8"
                    />
                  )}

                  {/* Pinned Evidence Badge */}
                  {pinnedEvidenceIds.includes(node.id) && (
                    <g transform="translate(12, -18)">
                      <circle r="7" fill="#06B6D4" stroke="#000000" strokeWidth="1.5" />
                      <text x="0" y="2.5" textAnchor="middle" fill="#000000" fontSize="7" fontWeight="bold">📌</text>
                    </g>
                  )}

                  {/* Quarantined / Contained Badge */}
                  {containedEntities[node.id] && (
                    <g transform="translate(-14, -18)">
                      <circle r="7" fill="#EF4444" stroke="#000000" strokeWidth="1.5" />
                      <text x="0" y="2.5" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">✕</text>
                    </g>
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r="18"
                    fill={style.bg}
                    stroke={isSelected ? "#FFFFFF" : style.border}
                    strokeWidth={isSelected ? "3" : "2"}
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.8))"
                  />

                  {/* Icon */}
                  <g transform="translate(-7, -7)" fill="white" stroke="white">
                    {getNodeIcon(node.type)}
                  </g>

                  {/* Node Label Card */}
                  <g transform="translate(0, 28)">
                    <rect
                      x="-60"
                      y="0"
                      width="120"
                      height="20"
                      rx="4"
                      fill="#0A0A0A"
                      stroke={isSelected ? "#FFFFFF" : "#262626"}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="13"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="sans-serif"
                      className="select-none"
                    >
                      {node.label.length > 18 ? node.label.substring(0, 16) + "..." : node.label}
                    </text>
                  </g>

                  {/* Risk Score Badge */}
                  <g transform="translate(12, -14)">
                    <circle r="7" fill={node.riskScore > 85 ? "#EF4444" : "#F59E0B"} />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="7.5"
                      fontWeight="bold"
                    >
                      {node.riskScore}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Inspector Drawer */}
        {selectedNode && (
          <div className="w-80 border-l border-neutral-800 bg-[#050505] flex flex-col h-full text-xs p-4 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center text-white"
                  style={{ backgroundColor: getNodeColor(selectedNode.type).bg }}
                >
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-500">{selectedNode.type} Entity</span>
                  <h4 className="font-semibold text-xs text-white truncate w-44">{selectedNode.label}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPinnedEvidenceIds((prev) =>
                      prev.includes(selectedNode.id)
                        ? prev.filter((id) => id !== selectedNode.id)
                        : [...prev, selectedNode.id]
                    );
                  }}
                  className={`p-1.5 rounded-lg transition border ${
                    pinnedEvidenceIds.includes(selectedNode.id)
                      ? "text-cyan-400 bg-cyan-500/20 border-cyan-500/40"
                      : "text-neutral-400 hover:text-white border-neutral-800 bg-black"
                  }`}
                  title={pinnedEvidenceIds.includes(selectedNode.id) ? "Unpin evidence" : "Pin node to investigation case"}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  selectedNode.riskScore > 85
                    ? "bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444]"
                    : "bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B]"
                }`}>
                  Risk: {selectedNode.riskScore}/100
                </span>
              </div>
            </div>

            {/* Blast Radius Contagion Card */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-red-400" />
                  Blast Radius Contagion
                </span>
                <button
                  onClick={() => setBlastRadiusMode(!blastRadiusMode)}
                  className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {blastRadiusMode ? "Collapse" : "Calculate (2-Hop)"}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-400">Contagion Nodes:</span>
                <span className="font-bold text-red-400">{blastRadiusMode ? blastRadiusNodeIds.size : 1} Connected Entities</span>
              </div>
              {blastRadiusMode && (
                <div className="text-[10px] font-mono text-neutral-400 pt-1 border-t border-neutral-900 leading-tight">
                  Adversary lateral traversal potential identified across host and network relations.
                </div>
              )}
            </div>

            {/* Entity Attributes */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Entity Telemetry</span>
              <div className="space-y-1.5">
                {selectedNode.metadata &&
                  Object.entries(selectedNode.metadata).map(([key, val]) => (
                    <div key={key} className="p-2 bg-black rounded border border-neutral-800 flex justify-between">
                      <span className="text-neutral-400 capitalize">{key.replace("_", " ")}</span>
                      <span className="font-mono text-white font-medium">{String(val)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Action notice */}
            {actionNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono animate-in fade-in">
                {actionNotice}
              </div>
            )}

            {/* Quick Response Actions */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Automated Containment Actions</span>
              <div className="space-y-1.5">
                {containedEntities[selectedNode.id] ? (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Containment Enforced ({selectedNode.label})</span>
                  </div>
                ) : (
                  <>
                    {selectedNode.type === "host" && (
                      <button 
                        onClick={() => {
                          setDualAuthRequest({
                            targetId: selectedNode.id,
                            targetLabel: selectedNode.label,
                            targetType: "host",
                            action: "ISOLATE_HOST",
                            criticality: "PRODUCTION PERIMETER",
                            sourceTrigger: "Attack Graph Host Quarantine"
                          });
                        }}
                        className="w-full py-2 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 border border-[#EF4444]/40 text-[#EF4444] rounded-lg transition font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Dual-Auth Host Isolation ({selectedNode.label})
                      </button>
                    )}
                    {selectedNode.type === "user" && (
                      <button 
                        onClick={() => {
                          setDualAuthRequest({
                            targetId: selectedNode.id,
                            targetLabel: selectedNode.label,
                            targetType: "user",
                            action: "REVOKE_SESSIONS",
                            criticality: "EXECUTIVE IDENTITY",
                            sourceTrigger: "Attack Graph Identity Revocation"
                          });
                        }}
                        className="w-full py-2 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/40 text-[#F59E0B] rounded-lg transition font-semibold flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Dual-Auth Revoke User Sessions
                      </button>
                    )}
                    {(selectedNode.type === "ip" || selectedNode.type === "domain") && (
                      <button 
                        onClick={() => {
                          setDualAuthRequest({
                            targetId: selectedNode.id,
                            targetLabel: selectedNode.label,
                            targetType: "ip",
                            action: "CONTAIN_FIREWALL",
                            criticality: "PRODUCTION PERIMETER",
                            sourceTrigger: "Attack Graph Perimeter Block"
                          });
                        }}
                        className="w-full py-2 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 border border-[#EF4444]/40 text-[#EF4444] rounded-lg transition font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Dual-Auth Perimeter Block
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Attack Timeline Scrubber */}
      <div className="h-16 bg-[#050505] border-t border-neutral-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-xs font-semibold text-white">Attack Kill Chain Timeline Scrubber</span>
            <p className="text-[10px] text-neutral-400">Slide to review attack progression step-by-step</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-md px-6">
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={timelineStep}
            onChange={(e) => setTimelineStep(Number(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-white whitespace-nowrap">
            Stage {timelineStep} / 4
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <span className={timelineStep >= 1 ? "text-white font-bold" : "opacity-40"}>1. Initial Logon</span>
          <span>→</span>
          <span className={timelineStep >= 2 ? "text-white font-bold" : "opacity-40"}>2. PowerShell Exec</span>
          <span>→</span>
          <span className={timelineStep >= 3 ? "text-white font-bold" : "opacity-40"}>3. LSASS Dump</span>
          <span>→</span>
          <span className={timelineStep >= 4 ? "text-white font-bold" : "opacity-40"}>4. C2 Exfil</span>
        </div>
      </div>

      {/* Dual Authorization Modal */}
      {dualAuthRequest && (
        <DualAuthContainmentModal
          isOpen={true}
          onClose={() => setDualAuthRequest(null)}
          request={dualAuthRequest}
          onAuthorized={({ hmacTicket, approver }) => {
            setContainedEntities((prev) => ({ ...prev, [dualAuthRequest.targetId]: true }));
            setActionNotice(
              `Dual-Auth containment verified by ${approver}. Ticket: ${hmacTicket.slice(0, 16)}... Target ${dualAuthRequest.targetLabel} quarantined.`
            );
            setDualAuthRequest(null);
            setTimeout(() => setActionNotice(null), 5000);
          }}
        />
      )}
    </div>
  );
}
