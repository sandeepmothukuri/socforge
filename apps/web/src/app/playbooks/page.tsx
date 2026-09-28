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
  Download,
  Filter,
  FileCode,
  Radio,
  Sliders
} from "lucide-react";

export interface PlaybookNode {
  id: string;
  type: "trigger" | "enrichment" | "condition" | "action" | "approval" | "notify";
  title: string;
  subtitle: string;
  vendor?: string;
  latency?: string;
  config?: Record<string, any>;
  status?: "idle" | "running" | "success" | "failed";
}

export interface PlaybookWorkflow {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  active: boolean;
  category: "Ransomware" | "Identity" | "Perimeter" | "Cloud" | "Phishing";
  nodes: PlaybookNode[];
}

const PRESET_PLAYBOOKS: PlaybookWorkflow[] = [
  {
    id: "pb-ransomware-isolate",
    name: "Ransomware Automated Rapid Isolation & Token Invalidation",
    description: "Triggered on high-confidence ransomware canary file alert or vssadmin shadow deletion. Isolates endpoint and revokes domain tokens.",
    triggerEvent: "Alert Severity == CRITICAL and TTP in [T1486, T1490]",
    category: "Ransomware",
    active: true,
    nodes: [
      { id: "1", type: "trigger", title: "Trigger: Ransomware TTP Detected", subtitle: "Event matches T1486 canary modification or shadow deletion", vendor: "Wazuh / Defender", latency: "0.2ms" },
      { id: "2", type: "enrichment", title: "Enrich: VirusTotal & Hash Intel", subtitle: "Query VT v3 API for parent process binary reputation", vendor: "VirusTotal Enterprise", latency: "14ms" },
      { id: "3", type: "condition", title: "Condition: EDR Agent Active", subtitle: "Verify endpoint telemetry heartbeat < 30s", vendor: "Fleet Engine", latency: "1.1ms" },
      { id: "4", type: "action", title: "Action: Network Quarantine Host", subtitle: "Isolate NIC via EDR API; keep security management port 8443 open", vendor: "CrowdStrike Falcon", latency: "28ms" },
      { id: "5", type: "approval", title: "Four-Eyes: Dual-Approval Gate", subtitle: "Require SecOps Commander key authorization to flush domain tokens", vendor: "4-Eyes Engine", latency: "Manual" },
      { id: "6", type: "action", title: "Action: Revoke Kerberos Tickets", subtitle: "Invalidate krbtgt sessions and force user credential reset", vendor: "Active Directory", latency: "34ms" },
      { id: "7", type: "notify", title: "Notify: Incident War Room", subtitle: "Dispatch Slack webhook & post forensic dossier attachment", vendor: "Slack Webhook", latency: "12ms" }
    ]
  },
  {
    id: "pb-phishing-triage",
    name: "Phishing Ingress Auto-Detonation & Inbox Purge",
    description: "Parses email EML attachments, queries VirusTotal & Hybrid-Analysis API, and removes malicious payload from all user inboxes.",
    triggerEvent: "M365 / Proofpoint Alert == Suspicious Attachment",
    category: "Phishing",
    active: true,
    nodes: [
      { id: "p1", type: "trigger", title: "Trigger: Inbound EML Ingestion", subtitle: "User reports suspicious invoice attachment with macro payload", vendor: "M365 Defender", latency: "0.4ms" },
      { id: "p2", type: "enrichment", title: "Enrich: Cuckoo Sandbox Detonation", subtitle: "Submit attachment SHA-256 to automated detonation sandbox", vendor: "Sandbox Cluster", latency: "420ms" },
      { id: "p3", type: "condition", title: "Condition: Malicious Verdict > 45/70", subtitle: "Check if detection threshold exceeds threat risk bar", vendor: "Logic Filter", latency: "0.8ms" },
      { id: "p4", type: "action", title: "Action: Purge Tenant Inboxes", subtitle: "Microsoft Graph API soft-delete across all enterprise mailboxes", vendor: "Exchange Online", latency: "65ms" },
      { id: "p5", type: "notify", title: "Notify: Security Slack Alert", subtitle: "Post IOC report and remediation summary to #soc-triage", vendor: "Slack Bot", latency: "14ms" }
    ]
  },
  {
    id: "pb-kerberoast-mitigate",
    name: "Kerberoasting Honey SPN Auto-Response & Password Rotation",
    description: "Detects Event ID 4769 TGS requests against Decoy SPN accounts and automatically resets service account credentials.",
    triggerEvent: "Event ID 4769 and TargetName in [Honey SPN Catalog]",
    category: "Identity",
    active: true,
    nodes: [
      { id: "k1", type: "trigger", title: "Trigger: Honey SPN Access", subtitle: "Decoy service account requested via Kerberos TGS protocol", vendor: "Domain Controller", latency: "0.5ms" },
      { id: "k2", type: "enrichment", title: "Enrich: Okta Identity Risk Score", subtitle: "Fetch requesting user behavioral anomaly score from Okta", vendor: "Okta Identity Cloud", latency: "22ms" },
      { id: "k3", type: "action", title: "Action: Lock Attacker AD Account", subtitle: "Set userAccountControl: ACCOUNTDISABLE in LDAP tree", vendor: "Entra ID / AD", latency: "19ms" },
      { id: "k4", type: "approval", title: "Four-Eyes: Dual Approval Sign-Off", subtitle: "Commander sign-off required for domain-wide ticket invalidation", vendor: "4-Eyes Gate", latency: "Manual" },
      { id: "k5", type: "notify", title: "Notify: Page Incident Commander", subtitle: "High-priority PagerDuty escalation with high-urgency callout", vendor: "PagerDuty API", latency: "18ms" }
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
  const [copiedYaml, setCopiedYaml] = useState(false);

  // Create Playbook Modal State
  const [newPlaybookModalOpen, setNewPlaybookModalOpen] = useState(false);
  const [newPbName, setNewPbName] = useState("");
  const [newPbDesc, setNewPbDesc] = useState("");
  const [newPbTrigger, setNewPbTrigger] = useState("");
  const [playbookToast, setPlaybookToast] = useState<string | null>(null);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "trigger":
        return { border: "border-purple-500/40", bg: "bg-purple-950/30", text: "text-purple-400", badge: "TRIGGER" };
      case "enrichment":
        return { border: "border-cyan-500/40", bg: "bg-cyan-950/30", text: "text-cyan-400", badge: "ENRICH" };
      case "condition":
        return { border: "border-amber-500/40", bg: "bg-amber-950/30", text: "text-amber-400", badge: "LOGIC" };
      case "action":
        return { border: "border-rose-500/40", bg: "bg-rose-950/30", text: "text-rose-400", badge: "ACTION" };
      case "approval":
        return { border: "border-emerald-500/40", bg: "bg-emerald-950/30", text: "text-emerald-400", badge: "4-EYES GATE" };
      case "notify":
        return { border: "border-blue-500/40", bg: "bg-blue-950/30", text: "text-blue-400", badge: "NOTIFY" };
      default:
        return { border: "border-neutral-700", bg: "bg-[#0a0a0a]", text: "text-white", badge: "STEP" };
    }
  };

  const handleAddPaletteNode = (type: PlaybookNode["type"], title: string, subtitle: string, vendor: string) => {
    const newNode: PlaybookNode = {
      id: `node-${Date.now().toString().slice(-4)}`,
      type,
      title,
      subtitle,
      vendor,
      latency: "15ms"
    };

    const updated = {
      ...selectedPlaybook,
      nodes: [...selectedPlaybook.nodes, newNode]
    };

    setSelectedPlaybook(updated);
    setPlaybooks(playbooks.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedNode(newNode);
    setPlaybookToast(`Added "${newNode.title}" to playbook workflow.`);
    setTimeout(() => setPlaybookToast(null), 3000);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (selectedPlaybook.nodes.length <= 2) {
      setPlaybookToast("Playbook workflow must maintain at least 2 nodes.");
      setTimeout(() => setPlaybookToast(null), 3000);
      return;
    }

    const updated = {
      ...selectedPlaybook,
      nodes: selectedPlaybook.nodes.filter((n) => n.id !== nodeId)
    };

    setSelectedPlaybook(updated);
    setPlaybooks(playbooks.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
    setPlaybookToast("Node removed from workflow.");
    setTimeout(() => setPlaybookToast(null), 2500);
  };

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setExecutionLogs([
      `[${new Date().toLocaleTimeString()}] Celery SOAR Worker pool initialized. Task ID: celery-${Date.now().toString().slice(-6)}`,
      `[${new Date().toLocaleTimeString()}] Executing Playbook: "${selectedPlaybook.name}"`
    ]);

    selectedPlaybook.nodes.forEach((node, index) => {
      setTimeout(() => {
        setActiveExecutingNodeId(node.id);
        const taskUuid = `0x${Math.random().toString(16).slice(2, 10)}`;
        setExecutionLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [STEP ${index + 1}/${selectedPlaybook.nodes.length}] [TASK: ${taskUuid}] ${node.title} via ${node.vendor || "Core"} -> 200 OK (${node.latency || "12ms"})`
        ]);

        if (index === selectedPlaybook.nodes.length - 1) {
          setTimeout(() => {
            setIsSimulating(false);
            setActiveExecutingNodeId(null);
            setExecutionLogs((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] Playbook execution finalized. All steps verified. HMAC-SHA256 signature written to audit ledger.`
            ]);
          }, 800);
        }
      }, (index + 1) * 850);
    });
  };

  const exportPlaybookYaml = () => {
    const yamlString = `name: "${selectedPlaybook.name}"
id: "${selectedPlaybook.id}"
category: "${selectedPlaybook.category}"
trigger: "${selectedPlaybook.triggerEvent}"
nodes:
${selectedPlaybook.nodes
  .map(
    (n, i) => `  - step: ${i + 1}
    id: "${n.id}"
    type: "${n.type}"
    title: "${n.title}"
    vendor: "${n.vendor || "Core"}"
    action: "${n.subtitle}"`
  )
  .join("\n")}
audit:
  hmac_chain: "ENABLED"
  four_eyes: "ENFORCED"
`;
    navigator.clipboard.writeText(yamlString);
    setCopiedYaml(true);
    setPlaybookToast("Playbook YAML copied to clipboard.");
    setTimeout(() => {
      setCopiedYaml(false);
      setPlaybookToast(null);
    }, 2500);
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

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000] text-neutral-100 overflow-y-auto font-sans">
        {/* Header Toolbar */}
        <div className="border-b border-[#262626] bg-[#050505]/95 px-6 py-4 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-[#262626] text-white">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-0.5">
                <span>ORCHESTRATION</span>
                <span>/</span>
                <span className="text-white">VISUAL SOAR PLAYBOOK STUDIO</span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Drag-and-Drop SOAR Playbook Studio & DAG Engine
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  CELERY WORKER ACTIVE
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

            {/* Copy YAML */}
            <button
              onClick={exportPlaybookYaml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#262626] font-semibold text-xs font-mono transition"
            >
              {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
              <span>{copiedYaml ? "YAML Copied" : "Copy YAML"}</span>
            </button>

            {/* Export JSON Button */}
            <button
              onClick={handleExportPlaybookJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#262626] font-semibold text-xs font-mono transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>JSON</span>
            </button>

            {/* Dry-Run Simulation Button */}
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs font-mono transition-all shadow-sm ${
                isSimulating
                  ? "bg-amber-500 text-black animate-pulse font-bold"
                  : "bg-white hover:bg-neutral-200 text-black font-bold"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? "Executing Dry-Run..." : "Dry-Run Playbook"}</span>
            </button>
          </div>
        </div>

        {/* Playbook Description Banner */}
        <div className="px-6 py-2.5 bg-[#050505] border-b border-[#1f1f1f] flex flex-wrap items-center justify-between text-xs gap-3 flex-shrink-0 font-mono">
          <div className="flex items-center gap-2 text-neutral-400">
            <span className="font-semibold text-white">{selectedPlaybook.name}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400">{selectedPlaybook.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-[#262626] text-neutral-400 text-[10px]">
              Trigger: <strong className="text-emerald-400">{selectedPlaybook.triggerEvent}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              {selectedPlaybook.nodes.length} WORKFLOW NODES
            </span>
          </div>
        </div>

        {/* Toast */}
        {playbookToast && (
          <div className="px-6 py-2 bg-emerald-950/40 border-b border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
            <span>{playbookToast}</span>
            <button onClick={() => setPlaybookToast(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* ── DRAGGABLE / CLICKABLE SOAR NODE PALETTE ─────────────────────── */}
          <div className="p-4 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                SOAR Component Palette (Click to Add to Canvas Flow):
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Click any building block to append into active automation DAG
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => handleAddPaletteNode("enrichment", "Enrich: AlienVault OTX Pulse", "Query subscribed threat pulses for match", "AlienVault OTX")}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 transition flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>+ OTX Threat Intel</span>
              </button>
              <button
                onClick={() => handleAddPaletteNode("condition", "Condition: Threat Score > 80", "Evaluate composite risk score threshold", "Risk Engine")}
                className="px-2.5 py-1.5 rounded-xl bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 border border-amber-500/30 transition flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>+ Risk Threshold Check</span>
              </button>
              <button
                onClick={() => handleAddPaletteNode("action", "Action: Firewall Drop IP (EDL)", "Insert malicious C2 IP into Dynamic Blocklist", "Palo Alto Networks")}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 transition flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>+ Perimeter IP Drop</span>
              </button>
              <button
                onClick={() => handleAddPaletteNode("action", "Action: Kill Process Tree", "Remotely terminate process hierarchy via EDR", "SentinelOne")}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 transition flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>+ EDR Process Kill</span>
              </button>
              <button
                onClick={() => handleAddPaletteNode("approval", "Four-Eyes: Incident Commander Gate", "Dual-authorized sign-off required for destructive action", "4-Eyes SOAR Gate")}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>+ 4-Eyes Commander Gate</span>
              </button>
              <button
                onClick={() => handleAddPaletteNode("notify", "Notify: MS Teams Incident Channel", "Broadcast high-urgency containment card with action links", "Microsoft Teams")}
                className="px-2.5 py-1.5 rounded-xl bg-blue-950/20 hover:bg-blue-950/40 text-blue-400 border border-blue-500/30 transition flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>+ Teams Alert Broadcast</span>
              </button>
            </div>
          </div>

          {/* ── VISUAL NODE CANVAS AREA ──────────────────────────────────────── */}
          <div className="relative rounded-2xl bg-[#050505] border border-[#262626] p-8 overflow-x-auto min-h-[380px] shadow-2xl flex items-center">
            {/* Background Dot Grid */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px"
              }}
            />

            {/* Visual Connected Nodes Flow */}
            <div className="relative z-10 flex items-center gap-5 min-w-max mx-auto py-8">
              {selectedPlaybook.nodes.map((node, index) => {
                const color = getNodeColor(node.type);
                const isExecuting = activeExecutingNodeId === node.id;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <React.Fragment key={node.id}>
                    {/* Node Card */}
                    <div
                      onClick={() => setSelectedNode(node)}
                      className={`w-64 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative bg-[#080808] flex flex-col justify-between ${
                        color.border
                      } ${
                        isExecuting
                          ? "ring-4 ring-emerald-500/50 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)] border-emerald-400"
                          : isSelected
                          ? "border-white ring-2 ring-white/20"
                          : "hover:border-neutral-400 hover:scale-[1.02]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${color.bg} ${color.text} ${color.border}`}>
                            {color.badge}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-neutral-500">Step {index + 1}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node.id);
                              }}
                              className="text-neutral-600 hover:text-red-400 transition"
                              title="Delete node"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="font-bold text-white text-xs mb-1 truncate" title={node.title}>
                          {node.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                          {node.subtitle}
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-[#1f1f1f] flex items-center justify-between text-[9px] font-mono text-neutral-500">
                        <span>{node.vendor || "Core"}</span>
                        <span className="text-emerald-400 font-bold">{node.latency || "12ms"}</span>
                      </div>

                      {/* Status indicator pill if simulating */}
                      {isExecuting && (
                        <div className="mt-2 pt-2 border-t border-emerald-500/30 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                          <Activity className="w-3 h-3 animate-spin" />
                          <span>CELERY TASK DISPATCHED...</span>
                        </div>
                      )}
                    </div>

                    {/* Connecting Data Flow Arrow */}
                    {index < selectedPlaybook.nodes.length - 1 && (
                      <div className="flex items-center justify-center flex-shrink-0 text-neutral-600">
                        <div className={`w-6 h-0.5 transition-colors duration-300 ${
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
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  Node Configuration Inspector
                </span>
                <span className="text-[10px] text-neutral-500 truncate max-w-[200px]">
                  {selectedNode ? selectedNode.title : "Select node on canvas"}
                </span>
              </div>

              {selectedNode ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase">Node Title</label>
                    <input
                      type="text"
                      value={selectedNode.title}
                      readOnly
                      className="w-full mt-1 bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase">Action Payload / Condition Logic</label>
                    <textarea
                      value={selectedNode.subtitle}
                      readOnly
                      rows={2}
                      className="w-full mt-1 bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-neutral-300 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase">Integration Vendor</label>
                      <input
                        type="text"
                        value={selectedNode.vendor || "Core"}
                        readOnly
                        className="w-full mt-1 bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-emerald-400 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase">Expected Latency</label>
                      <input
                        type="text"
                        value={selectedNode.latency || "12ms"}
                        readOnly
                        className="w-full mt-1 bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-neutral-300 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500">
                  Select any step in the visual workflow above to inspect API adapter settings, timeout policies, and execution contracts.
                </div>
              )}
            </div>

            {/* Right: Live Execution Console */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                <span className="text-xs uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Celery Worker Task Execution Output
                </span>
                <span className="text-[10px] text-emerald-400">Queue: soar.high_priority</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#000000] border border-[#1f1f1f] text-[11px] text-neutral-300 space-y-1.5 h-48 overflow-y-auto select-all">
                {executionLogs.length > 0 ? (
                  executionLogs.map((log, i) => (
                    <div key={i} className={log.includes("200 OK") || log.includes("finalized") ? "text-emerald-400" : "text-neutral-300"}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-600">
                    Click &apos;Dry-Run Playbook&apos; above to simulate live Celery automation worker execution.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
