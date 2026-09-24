"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import { InteractiveAttackGraph, GraphNode, GraphEdge } from "@/components/graph/InteractiveAttackGraph";
import { 
  Network, 
  Share2, 
  ShieldAlert, 
  Download, 
  Layers, 
  FileText, 
  Sparkles,
  RefreshCw,
  FolderOpen
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
  }
};

export default function GraphPage() {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>("mimikatz");
  const currentScenario = SCENARIOS[selectedScenarioKey] || SCENARIOS.mimikatz;

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1020] overflow-hidden">
        {/* Header Toolbar */}
        <div className="h-14 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                Attack Path & Evidence Graph Visualizer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Interactive DAG
                </span>
              </h1>
              <p className="text-xs text-[#94A3B8]">
                Multi-hop entity correlation, Kill Chain timeline playback & lateral movement mapping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Scenario Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151C2E] border border-[#263248] text-[#94A3B8]">
              <FolderOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Attack Scenario:</span>
              <select
                value={selectedScenarioKey}
                onChange={(e) => setSelectedScenarioKey(e.target.value)}
                className="bg-transparent text-[#F8FAFC] font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="mimikatz" className="bg-[#0F172A] text-white">Mimikatz LSASS & DC DCSync</option>
                <option value="ransomware" className="bg-[#0F172A] text-white">LockBit 3.0 Ransomware Impact</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("socforge-open-copilot", { detail: { prompt: `Analyze attack graph for ${currentScenario.name}` } }));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Copilot Graph Reasoning</span>
            </button>
          </div>
        </div>

        {/* Scenario description notice */}
        <div className="px-6 py-2 bg-[#111827] border-b border-[#263248] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span className="font-semibold text-[#F8FAFC]">{currentScenario.name}:</span>
            <span>{currentScenario.description}</span>
          </div>
          <span className="text-[11px] font-mono text-[#38BDF8]">
            {currentScenario.nodes.length} entities • {currentScenario.edges.length} graph relations
          </span>
        </div>

        {/* Interactive SVG Graph Area */}
        <div className="flex-1 min-h-0 relative">
          <InteractiveAttackGraph 
            key={selectedScenarioKey}
            initialNodes={currentScenario.nodes}
            initialEdges={currentScenario.edges}
          />
        </div>
      </div>
    </AppShell>
  );
}
