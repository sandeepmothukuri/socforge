"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import {
  ShieldCheck,
  Play,
  Plus,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  Lock,
  Mail,
  Server,
  UserCheck,
  RotateCw,
  Copy,
  ChevronRight,
  Check,
  Trash2,
  Sparkles,
  Layers,
  Terminal,
  Activity,
  Cpu,
  CornerDownRight,
  Download
} from "lucide-react";

interface PlaybookNode {
  id: string;
  type: "trigger" | "condition" | "action" | "approval" | "notify";
  title: string;
  subtitle: string;
  x?: number;
  y?: number;
  config?: Record<string, any>;
  status?: "idle" | "running" | "success" | "failed";
}

interface PlaybookWorkflow {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  active: boolean;
  nodes: PlaybookNode[];
}

const PRESET_PLAYBOOKS: PlaybookWorkflow[] = [
  {
    id: "pb-ransomware-isolate",
    name: "Ransomware Automated Rapid Isolation & Token Invalidation",
    description: "Triggered on high-confidence ransomware canary file alert or vssadmin shadow deletion. Isolates endpoint and revokes domain tokens.",
    triggerEvent: "Alert Severity == CRITICAL and TTP in [T1486, T1490]",
    active: true,
    nodes: [
      { id: "1", type: "trigger", title: "Trigger: Ransomware TTP Detected", subtitle: "Event matches T1486 canary modification", x: 60, y: 140 },
      { id: "2", type: "condition", title: "Condition: EDR Agent Active", subtitle: "Verify endpoint telemetry ping < 30s", x: 280, y: 140 },
      { id: "3", type: "action", title: "Action: Network Quarantine Host", subtitle: "Isolate NIC via EDR API; keep port 8443 open", x: 500, y: 140 },
      { id: "4", type: "approval", title: "Four-Eyes: Dual-Approval Gate", subtitle: "Require Tier-3 Lead sign-off for token flush", x: 720, y: 140 },
      { id: "5", type: "notify", title: "Notify: Incident War Room", subtitle: "Dispatch Slack webhook & forensic packet", x: 940, y: 140 }
    ]
  },
  {
    id: "pb-phishing-triage",
    name: "Phishing Ingress Auto-Detonation & Sender Quarantine",
    description: "Parses email EML attachments, queries VirusTotal & Hybrid-Analysis API, and removes malicious payload from all user inboxes.",
    triggerEvent: "M365 / Proofpoint Alert == Suspicious Attachment",
    active: true,
    nodes: [
      { id: "p1", type: "trigger", title: "Trigger: Inbound EML Ingestion", subtitle: "User reports suspicious invoice attachment", x: 60, y: 140 },
      { id: "p2", type: "action", title: "Action: Sandbox Detonation", subtitle: "Submit SHA-256 hash to VirusTotal & Cuckoo", x: 280, y: 140 },
      { id: "p3", type: "condition", title: "Condition: VT Score > 45/70", subtitle: "Check if detection threshold exceeded", x: 500, y: 140 },
      { id: "p4", type: "action", title: "Action: Purge Tenant Inboxes", subtitle: "Graph API soft-delete across all mailboxes", x: 720, y: 140 },
      { id: "p5", type: "notify", title: "Notify: Security Slack Alert", subtitle: "Post IOC report and remediation summary", x: 940, y: 140 }
    ]
  },
  {
    id: "pb-kerberoast-mitigate",
    name: "Kerberoasting Honey SPN Auto-Response & Password Rotation",
    description: "Detects Event ID 4769 TGS requests against Decoy SPN accounts and automatically resets service account credentials.",
    triggerEvent: "Event ID 4769 and TargetName in [Honey SPN Catalog]",
    active: true,
    nodes: [
      { id: "k1", type: "trigger", title: "Trigger: Honey SPN Access", subtitle: "Decoy service account requested via Kerberos", x: 60, y: 140 },
      { id: "k2", type: "action", title: "Action: Lock Attacker AD Account", subtitle: "Set userAccountControl: ACCOUNTDISABLE", x: 280, y: 140 },
      { id: "k3", type: "action", title: "Action: Kerberos KRBTGT Flush", subtitle: "Invalidate active TGT session tokens", x: 500, y: 140 },
      { id: "k4", type: "notify", title: "Notify: Page Incident Commander", subtitle: "High-priority PagerDuty escalation", x: 720, y: 140 }
    ]
  }
];

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<PlaybookWorkflow[]>(PRESET_PLAYBOOKS);
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookWorkflow>(PRESET_PLAYBOOKS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeExecutingNodeId, setActiveExecutingNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<PlaybookNode | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // Create Playbook Modal State
  const [newPlaybookModalOpen, setNewPlaybookModalOpen] = useState(false);
  const [newPbName, setNewPbName] = useState("");
  const [newPbDesc, setNewPbDesc] = useState("");
  const [newPbTrigger, setNewPbTrigger] = useState("");
  const [playbookToast, setPlaybookToast] = useState<string | null>(null);

  const handleCreatePlaybook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPbName.trim()) return;

    const newWf: PlaybookWorkflow = {
      id: `pb-${Date.now()}`,
      name: newPbName.trim(),
      description: newPbDesc.trim() || "Automated response playbook workflow.",
      triggerEvent: newPbTrigger.trim() || "Alert Severity == CRITICAL",
      active: true,
      nodes: [
        { id: "1", type: "trigger", title: `Trigger: ${newPbName.slice(0, 24)}`, subtitle: newPbTrigger.trim() || "Rule condition matched", x: 60, y: 140 },
        { id: "2", type: "condition", title: "Condition: Asset Criticality", subtitle: "Verify asset tag in [Production, Tier-0]", x: 280, y: 140 },
        { id: "3", type: "approval", title: "Approval: Dual-Sign Off Gate", subtitle: "Incident Commander verification", x: 500, y: 140 },
        { id: "4", type: "action", title: "Action: Automated Containment", subtitle: "Quarantine IP / Host via API adapter", x: 720, y: 140 },
        { id: "5", type: "notify", title: "Notify: Dispatch Escalation", subtitle: "Log audit record & notify channel", x: 940, y: 140 }
      ]
    };

    setPlaybooks((prev) => [newWf, ...prev]);
    setSelectedPlaybook(newWf);
    setNewPlaybookModalOpen(false);
    setNewPbName("");
    setNewPbDesc("");
    setNewPbTrigger("");
    setPlaybookToast(`Playbook "${newWf.name}" compiled and activated.`);
    setTimeout(() => setPlaybookToast(null), 3500);
  };

  const handleExportPlaybookJSON = () => {
    const blob = new Blob([JSON.stringify(selectedPlaybook, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOCForge_Playbook_${selectedPlaybook.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setPlaybookToast(`Exported "${selectedPlaybook.name}" as JSON.`);
    setTimeout(() => setPlaybookToast(null), 3000);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "trigger":
        return { border: "border-purple-500/40", bg: "bg-purple-950/30", text: "text-purple-400", badge: "TRIGGER" };
      case "condition":
        return { border: "border-amber-500/40", bg: "bg-amber-950/30", text: "text-amber-400", badge: "LOGIC" };
      case "action":
        return { border: "border-rose-500/40", bg: "bg-rose-950/30", text: "text-rose-400", badge: "ACTION" };
      case "approval":
        return { border: "border-blue-500/40", bg: "bg-blue-950/30", text: "text-blue-400", badge: "FOUR-EYES" };
      case "notify":
        return { border: "border-emerald-500/40", bg: "bg-emerald-950/30", text: "text-emerald-400", badge: "NOTIFY" };
      default:
        return { border: "border-neutral-700", bg: "bg-[#0a0a0a]", text: "text-white", badge: "STEP" };
    }
  };

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setExecutionLogs([`[${new Date().toLocaleTimeString()}] Initializing playbook dry-run: ${selectedPlaybook.name}...`]);

    selectedPlaybook.nodes.forEach((node, index) => {
      setTimeout(() => {
        setActiveExecutingNodeId(node.id);
        setExecutionLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Executed Step ${index + 1}: ${node.title} -> STATUS: 200 OK`
        ]);

        if (index === selectedPlaybook.nodes.length - 1) {
          setTimeout(() => {
            setIsSimulating(false);
            setActiveExecutingNodeId(null);
            setExecutionLogs((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] Playbook run completed successfully. Zero errors.`
            ]);
          }, 800);
        }
      }, (index + 1) * 900);
    });
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000] text-neutral-100 overflow-y-auto">
        {/* Header Toolbar */}
        <div className="border-b border-[#262626] bg-[#050505]/95 px-6 py-4 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-[#262626] text-white">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-0.5">
                <span>ORCHESTRATION</span>
                <span>/</span>
                <span className="text-white">VISUAL SOAR PLAYBOOKS</span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                SOAR Workflow Automation & Visual Node Canvas
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  ACTIVE ENGINE
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Playbook Selector */}
            <select
              value={selectedPlaybook.id}
              onChange={(e) => {
                const found = playbooks.find((p) => p.id === e.target.value);
                if (found) {
                  setSelectedPlaybook(found);
                  setSelectedNode(null);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              {playbooks.map((pb) => (
                <option key={pb.id} value={pb.id} className="bg-black text-white">
                  {pb.name}
                </option>
              ))}
            </select>

            {/* New Playbook Button */}
            <button
              onClick={() => setNewPlaybookModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-[#262626] font-semibold text-xs font-mono transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Playbook</span>
            </button>

            {/* Export JSON Button */}
            <button
              onClick={handleExportPlaybookJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#262626] font-semibold text-xs font-mono transition"
              title="Export playbook definition as JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export</span>
            </button>

            {/* Dry-Run Simulation Button */}
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs font-mono transition-all shadow-sm ${
                isSimulating
                  ? "bg-amber-500 text-black animate-pulse"
                  : "bg-white hover:bg-neutral-200 text-black"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? "Executing Run..." : "Test Playbook Run"}</span>
            </button>
          </div>
        </div>

        {/* Playbook Description Banner */}
        <div className="px-6 py-2.5 bg-[#050505] border-b border-[#1f1f1f] flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-2 text-neutral-400">
            <span className="font-semibold text-white">{selectedPlaybook.name}:</span>
            <span>{selectedPlaybook.description}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Trigger: {selectedPlaybook.triggerEvent}
          </span>
        </div>

        {/* Visual Node Canvas Area */}
        <div className="p-6 space-y-6">
          <div className="relative rounded-2xl bg-[#050505] border border-[#262626] p-8 overflow-x-auto min-h-[360px] shadow-2xl flex items-center">
            {/* Background Dot Grid */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px"
              }}
            />

            {/* Visual Connected Nodes Flow */}
            <div className="relative z-10 flex items-center gap-6 min-w-max mx-auto py-8">
              {selectedPlaybook.nodes.map((node, index) => {
                const color = getNodeColor(node.type);
                const isExecuting = activeExecutingNodeId === node.id;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <React.Fragment key={node.id}>
                    {/* Node Card */}
                    <div
                      onClick={() => setSelectedNode(node)}
                      className={`w-60 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative bg-[#080808] ${
                        color.border
                      } ${
                        isExecuting
                          ? "ring-4 ring-emerald-500/50 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)] border-emerald-400"
                          : isSelected
                          ? "border-white ring-2 ring-white/20"
                          : "hover:border-neutral-400 hover:scale-[1.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${color.bg} ${color.text} ${color.border}`}>
                          {color.badge}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">Step {index + 1}</span>
                      </div>

                      <div className="font-bold text-white text-xs mb-1 truncate" title={node.title}>
                        {node.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                        {node.subtitle}
                      </div>

                      {/* Status indicator pill if simulating */}
                      {isExecuting && (
                        <div className="mt-2.5 pt-2 border-t border-[#1f1f1f] flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                          <Activity className="w-3 h-3 animate-spin" />
                          <span>DISPATCHING ACTION...</span>
                        </div>
                      )}
                    </div>

                    {/* Connecting Data Flow Arrow */}
                    {index < selectedPlaybook.nodes.length - 1 && (
                      <div className="flex items-center justify-center flex-shrink-0 text-neutral-600">
                        <div className={`w-8 h-0.5 transition-colors duration-300 ${
                          isExecuting ? "bg-emerald-400 shadow-[0_0_10px_#10b981]" : "bg-[#262626]"
                        }`} />
                        <ArrowRight className={`w-4 h-4 -ml-1 ${isExecuting ? "text-emerald-400" : "text-neutral-600"}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Node Inspector & Live Execution Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Selected Node Inspector */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                <span className="text-xs font-mono uppercase font-bold text-neutral-400">
                  Node Configuration Inspector
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  {selectedNode ? selectedNode.title : "Click any node on canvas to configure"}
                </span>
              </div>

              {selectedNode ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase">Node Title</label>
                    <input
                      type="text"
                      value={selectedNode.title}
                      readOnly
                      className="w-full mt-1 bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase">Description / Action Payload</label>
                    <textarea
                      value={selectedNode.subtitle}
                      readOnly
                      rows={2}
                      className="w-full mt-1 bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-neutral-300 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  Select a step in the visual workflow above to view API parameters, timeout policies, and retry logic.
                </div>
              )}
            </div>

            {/* Right: Live Execution Console */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                <span className="text-xs font-mono uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Playbook Orchestration Console
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Celery SOAR Worker</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#000000] border border-[#1f1f1f] font-mono text-[11px] text-neutral-300 space-y-1.5 h-44 overflow-y-auto select-all">
                {executionLogs.length > 0 ? (
                  executionLogs.map((log, i) => (
                    <div key={i} className="text-neutral-200">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-600">
                    Click 'Test Playbook Run' above to simulate live automation dispatch.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New Playbook Modal */}
        {newPlaybookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-[#050505] border border-[#262626] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Author SOAR Playbook</h3>
                    <p className="text-xs text-neutral-400">Design automated response workflow with dual-approval safeguards</p>
                  </div>
                </div>
                <button
                  onClick={() => setNewPlaybookModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePlaybook} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="text-neutral-400 block mb-1">Playbook Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cobalt Strike Beaconing Host Severance & TGT Revocation"
                    value={newPbName}
                    onChange={(e) => setNewPbName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Trigger Condition Filter</label>
                  <input
                    type="text"
                    placeholder="e.g. Alert Severity == CRITICAL and Rule == 'CobaltStrike'"
                    value={newPbTrigger}
                    onChange={(e) => setNewPbTrigger(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Description & Operational Objective</label>
                  <textarea
                    rows={3}
                    placeholder="Automates rapid response upon verifiable detection, routing through Tier-3 dual sign-off..."
                    value={newPbDesc}
                    onChange={(e) => setNewPbDesc(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setNewPlaybookModalOpen(false)}
                    className="px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-300 border border-[#262626] rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Create Playbook</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {playbookToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#050505] border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{playbookToast}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
