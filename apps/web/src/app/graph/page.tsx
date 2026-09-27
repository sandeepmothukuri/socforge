"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import { InteractiveAttackGraph, GraphNode, GraphEdge } from "@/components/graph/InteractiveAttackGraph";
import { AttackTimelineScrubber } from "@/components/ui/AttackTimelineScrubber";
import { 
  Network, 
  Share2, 
  ShieldAlert, 
  Download, 
  Layers, 
  FileText, 
  Sparkles,
  RefreshCw,
  FolderOpen,
  Clock
} from "lucide-react";

const SCENARIOS: Record<string, { name: string; description: string; nodes: GraphNode[]; edges: GraphEdge[] }> = {
  mimikatz: {
    name: "Scenario 1: Mimikatz LSASS Credential Dump & Domain Lateral Movement",
    description: "Spearphishing delivery -> Office macro -> PowerShell memory injection -> LSASS dump -> DCSync attack against Domain Controller.",
    nodes: [
      { id: "user-jdoe", label: "corp\\jdoe", type: "user", riskScore: 82, stage: 1, x: 80, y: 160, metadata: { department: "Finance", privilege: "Standard User" } },
      { id: "host-wkstn04", label: "WKSTN-FIN-04", type: "host", riskScore: 78, stage: 1, x: 260, y: 160, metadata: { os: "Windows 11 Enterprise", ip: "10.0.4.18" } },
      { id: "proc-powershell", label: "powershell.exe", type: "process", riskScore: 92, stage: 2, x: 440, y: 110, metadata: { pid: 4892, ppid: 1104, cmdline: "powershell.exe -enc SQBFAFgA..." } },
      { id: "tech-t1059", label: "T1059.001 (PowerShell)", type: "technique", riskScore: 65, stage: 2, x: 440, y: 20, metadata: { tactic: "Execution" } },
      { id: "proc-lsass", label: "lsass.exe", type: "process", riskScore: 95, stage: 3, x: 620, y: 110, metadata: { pid: 644, privilege: "SYSTEM", target_accessed: "PROCESS_ALL_ACCESS" } },
      { id: "tech-t1003", label: "T1003.001 (LSASS Dump)", type: "technique", riskScore: 98, stage: 3, x: 620, y: 20, metadata: { tactic: "Credential Access" } },
      { id: "host-dc01", label: "SRV-DC-01.corp.local", type: "host", riskScore: 99, stage: 4, x: 820, y: 160, metadata: { role: "Primary Domain Controller", ip: "10.0.0.1" } },
      { id: "ip-c2", label: "185.220.101.5", type: "ip", riskScore: 94, stage: 4, x: 820, y: 300, metadata: { country: "NL", asn: "AS60729", threat: "Cobalt Strike C2" } }
    ],
    edges: [
      { id: "e1", source: "user-jdoe", target: "host-wkstn04", relationship: "LOGGED_ON_TO", stage: 1 },
      { id: "e2", source: "host-wkstn04", target: "proc-powershell", relationship: "SPAWNED", stage: 2 },
      { id: "e3", source: "proc-powershell", target: "tech-t1059", relationship: "USES_TTP", stage: 2 },
      { id: "e4", source: "proc-powershell", target: "proc-lsass", relationship: "INJECTED_INTO", stage: 3 },
      { id: "e5", source: "proc-lsass", target: "tech-t1003", relationship: "MATCHES_RULE", stage: 3 },
      { id: "e6", source: "proc-lsass", target: "host-dc01", relationship: "DCSYNC_CRED_HARVEST", stage: 4 },
      { id: "e7", source: "host-dc01", target: "ip-c2", relationship: "BEACONED_TO", stage: 4 }
    ]
  },
  ransomware: {
    name: "Scenario 2: LockBit 3.0 Pre-Ransomware Stage & Volume Shadow Deletion",
    description: "Compromised VPN -> RDP session -> vssadmin volume shadow copy destruction -> WMI remote execution.",
    nodes: [
      { id: "user-svc", label: "corp\\svc_backup", type: "user", riskScore: 90, stage: 1, x: 80, y: 160, metadata: { privilege: "Domain Admin", compromised_via: "Fortinet SSL-VPN CVE-2024-1753" } },
      { id: "host-jump", label: "JUMP-BOX-01", type: "host", riskScore: 85, stage: 1, x: 260, y: 160, metadata: { ip: "10.0.10.5", protocol: "RDP :3389" } },
      { id: "proc-cmd", label: "cmd.exe /c vssadmin", type: "process", riskScore: 96, stage: 2, x: 440, y: 120, metadata: { cmdline: "vssadmin.exe delete shadows /all /quiet" } },
      { id: "tech-t1490", label: "T1490 (Inhibit System Recovery)", type: "technique", riskScore: 95, stage: 2, x: 440, y: 20, metadata: { tactic: "Impact" } },
      { id: "proc-encryptor", label: "LB3_enc.exe", type: "process", riskScore: 99, stage: 3, x: 640, y: 120, metadata: { sha256: "d58b73a908..." } },
      { id: "host-file01", label: "SRV-FILE-SHARE-01", type: "host", riskScore: 95, stage: 4, x: 820, y: 160, metadata: { smb_shares: ["//Finance", "//Engineering", "//HR"] } }
    ],
    edges: [
      { id: "re1", source: "user-svc", target: "host-jump", relationship: "RDP_AUTHENTICATED", stage: 1 },
      { id: "re2", source: "host-jump", target: "proc-cmd", relationship: "EXECUTED", stage: 2 },
      { id: "re3", source: "proc-cmd", target: "tech-t1490", relationship: "USES_TTP", stage: 2 },
      { id: "re4", source: "proc-cmd", target: "proc-encryptor", relationship: "DROPPED", stage: 3 },
      { id: "re5", source: "proc-encryptor", target: "host-file01", relationship: "ENCRYPTING_SMB", stage: 4 }
    ]
  },
  volt_typhoon: {
    name: "Scenario 3: Volt Typhoon Critical Infrastructure Living-off-the-Land (LOTL)",
    description: "SOHO Router proxy -> Built-in WMIC commands -> Portproxy stealth tunnel -> ntdsutil Active Directory DB extract.",
    nodes: [
      { id: "edge-router", label: "Edge-Router-Cisco-RV", type: "host", riskScore: 88, stage: 1, x: 80, y: 160, metadata: { vendor: "Cisco RV340", compromised_via: "CVE-2023-38606" } },
      { id: "proc-wmic", label: "wmic.exe process call", type: "process", riskScore: 92, stage: 2, x: 280, y: 110, metadata: { cmdline: "wmic process call create 'cmd.exe /c whoami'" } },
      { id: "tech-wmi", label: "T1047 (WMI / LOTL)", type: "technique", riskScore: 75, stage: 2, x: 280, y: 20, metadata: { tactic: "Execution" } },
      { id: "proc-netsh", label: "netsh.exe interface portproxy", type: "process", riskScore: 94, stage: 3, x: 480, y: 110, metadata: { cmdline: "netsh interface portproxy add v4tov4 listenport=5000 connectaddress=10.0.0.1" } },
      { id: "tech-proxy", label: "T1090.001 (Port Forwarding)", type: "technique", riskScore: 82, stage: 3, x: 480, y: 20, metadata: { tactic: "Command and Control" } },
      { id: "proc-ntdsutil", label: "ntdsutil.exe ac i ntds ifm", type: "process", riskScore: 98, stage: 4, x: 680, y: 110, metadata: { cmdline: "ntdsutil \"ac i ntds\" \"ifm\" \"create full C:\\temp\\ad\" q q" } },
      { id: "host-dc", label: "CRIT-INFRA-DC01", type: "host", riskScore: 99, stage: 4, x: 860, y: 160, metadata: { role: "Industrial SCADA Domain Controller", ip: "10.0.0.5" } }
    ],
    edges: [
      { id: "ve1", source: "edge-router", target: "proc-wmic", relationship: "LOTL_COMMAND_DISPATCH", stage: 1 },
      { id: "ve2", source: "proc-wmic", target: "tech-wmi", relationship: "USES_TTP", stage: 2 },
      { id: "ve3", source: "proc-wmic", target: "proc-netsh", relationship: "ESTABLISHED_PROXY", stage: 3 },
      { id: "ve4", source: "proc-netsh", target: "tech-proxy", relationship: "USES_TTP", stage: 3 },
      { id: "ve5", source: "proc-netsh", target: "proc-ntdsutil", relationship: "INVOKED_CRED_THEFT", stage: 4 },
      { id: "ve6", source: "proc-ntdsutil", target: "host-dc", relationship: "EXTRACTED_NTDS_DIT", stage: 4 }
    ]
  }
};

export default function GraphPage() {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>("mimikatz");
  const [showTimeline, setShowTimeline] = useState(true);
  const [graphToast, setGraphToast] = useState<string | null>(null);
  const currentScenario = SCENARIOS[selectedScenarioKey] || SCENARIOS.mimikatz;

  const handleExportGraphJSON = () => {
    const payload = {
      scenario_key: selectedScenarioKey,
      name: currentScenario.name,
      description: currentScenario.description,
      exported_at: new Date().toISOString(),
      nodes: currentScenario.nodes,
      edges: currentScenario.edges
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOCForge_AttackGraph_${selectedScenarioKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setGraphToast(`Exported "${currentScenario.name}" graph JSON.`);
    setTimeout(() => setGraphToast(null), 3000);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000] overflow-y-auto">
        {/* Header Toolbar */}
        <div className="h-14 border-b border-neutral-800 bg-[#050505] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neutral-900 text-white border border-neutral-800">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Attack Path & Evidence Graph Visualizer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-white border border-neutral-800">
                  Interactive DAG
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                Multi-hop entity correlation, Kill Chain timeline playback & lateral movement mapping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Scenario Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
              <FolderOpen className="w-3.5 h-3.5 text-white" />
              <span>Attack Scenario:</span>
              <select
                value={selectedScenarioKey}
                onChange={(e) => setSelectedScenarioKey(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="mimikatz" className="bg-black text-white">Mimikatz LSASS & DC DCSync</option>
                <option value="ransomware" className="bg-black text-white">LockBit 3.0 Ransomware Impact</option>
                <option value="volt_typhoon" className="bg-black text-white">Volt Typhoon LOTL & Portproxy</option>
              </select>
            </div>

            <button
              onClick={handleExportGraphJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition"
              title="Export active attack graph topology as JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                showTimeline ? "bg-white text-black font-semibold" : "bg-neutral-900 text-neutral-300 border-neutral-800"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{showTimeline ? "Hide Timeline" : "Show Timeline"}</span>
            </button>

            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("socforge-open-copilot", { detail: { prompt: `Analyze attack graph for ${currentScenario.name}` } }));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copilot Graph Reasoning</span>
            </button>
          </div>
        </div>

        {/* Scenario description notice */}
        <div className="px-6 py-2 bg-[#050505] border-b border-neutral-800 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-2 text-neutral-400">
            <span className="font-semibold text-white">{currentScenario.name}:</span>
            <span>{currentScenario.description}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            {currentScenario.nodes.length} entities • {currentScenario.edges.length} graph relations
          </span>
        </div>

        {/* Interactive SVG Graph Area */}
        <div className="h-[520px] min-h-[500px] relative border-b border-neutral-800">
          <InteractiveAttackGraph 
            key={selectedScenarioKey}
            initialNodes={currentScenario.nodes}
            initialEdges={currentScenario.edges}
          />
        </div>

        {/* Temporal Attack Timeline Scrubber */}
        {showTimeline && (
          <div className="p-6 bg-[#000000]">
            <AttackTimelineScrubber />
          </div>
        )}

        {/* Toast */}
        {graphToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#050505] border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{graphToast}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
