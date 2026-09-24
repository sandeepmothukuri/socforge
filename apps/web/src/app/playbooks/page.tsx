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
  Check
} from "lucide-react";

interface PlaybookNode {
  id: string;
  type: "trigger" | "condition" | "action" | "approval" | "notify";
  title: string;
  subtitle: string;
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
    name: "Ransomware Automated Rapid Isolation",
    description: "Triggered on high-confidence ransomware canary file alert or vssadmin shadow deletion. Isolates endpoint and revokes domain tokens.",
    triggerEvent: "Alert Severity == CRITICAL and TTP in [T1486, T1490]",
    active: true,
    nodes: [
      { id: "1", type: "trigger", title: "Trigger: Ransomware TTP Detected", subtitle: "Event matches T1486 or T1490 canary file modification" },
      { id: "2", type: "condition", title: "Condition: EDR Agent Online", subtitle: "Verify endpoint EDR telemetry ping within last 30s" },
      { id: "3", type: "action", title: "Action: Network Quarantine Host", subtitle: "Isolate NIC via EDR API; keep SOC port 8443 open" },
      { id: "4", type: "approval", title: "Four-Eyes: Authorize Mass Token Revocation", subtitle: "Notify SOC Tier 3 Lead for secondary Kerberos flush sign-off" },
      { id: "5", type: "notify", title: "Notify: SecOps Slack #soc-war-room", subtitle: "Dispatch incident summary with forensic artifact bundle" }
    ]
  },
  {
    id: "pb-phishing-triage",
    name: "Suspicious Email Phishing Auto-Triage & Hash Lookup",
    description: "Analyzes reported email attachments, queries VirusTotal/RecordedFuture, and purges matching hashes across mailbox tenant.",
    triggerEvent: "User Report: Phishing Inbox submission",
    active: true,
    nodes: [
      { id: "p1", type: "trigger", title: "Trigger: Phish Submission", subtitle: "User forwards suspicious email to phish-report@corp.com" },
      { id: "p2", type: "action", title: "Action: Extract & Hash Attachments", subtitle: "Compute SHA256 hashes and extract embedded URLs" },
      { id: "p3", type: "condition", title: "Condition: Threat Score > 75", subtitle: "Evaluate sandbox detonation score and C2 reputation" },
      { id: "p4", type: "action", title: "Action: Tenant Mailbox Purge", subtitle: "Hard-delete malicious email from all 4,200 mailboxes via M365 API" },
      { id: "p5", type: "notify", title: "Notify: Feedback to Submitter", subtitle: "Send automated gratitude email confirming malicious block" }
    ]
  },
  {
    id: "pb-compromised-admin",
    name: "Compromised Privileged Admin Account Lockdown",
    description: "Triggered upon anomalous geolocation login + MFA fatigue detection. Enforces password reset and temporary admin group removal.",
    triggerEvent: "Anomalous Login: Impossible Travel & MFA Spam",
    active: true,
    nodes: [
      { id: "a1", type: "trigger", title: "Trigger: Impossible Travel Alert", subtitle: "Sign-in from Lagos & New York within 12 minutes" },
      { id: "a2", type: "action", title: "Action: Revoke Active OAuth Tokens", subtitle: "Terminate all active web and mobile device refresh sessions" },
      { id: "a3", type: "action", title: "Action: Disable Active Directory Account", subtitle: "Set UserAccountControl ACCOUNTDISABLE flag in LDAP" },
      { id: "a4", type: "notify", title: "Notify: PagerDuty On-Call Lead", subtitle: "High-priority paging alert for IAM duty engineer" }
    ]
  }
];

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<PlaybookWorkflow[]>(PRESET_PLAYBOOKS);
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookWorkflow>(PRESET_PLAYBOOKS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState<number>(-1);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const runPlaybookTest = () => {
    setIsExecuting(true);
    setExecutionStep(0);
    setExecutionLog([`[${new Date().toLocaleTimeString()}] Initializing playbook test run: "${selectedPlaybook.name}"`]);

    selectedPlaybook.nodes.forEach((node, index) => {
      setTimeout(() => {
        setExecutionStep(index);
        setExecutionLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Executing Step ${index + 1}: ${node.title} -> SUCCESS (200 OK)`
        ]);
        if (index === selectedPlaybook.nodes.length - 1) {
          setTimeout(() => {
            setIsExecuting(false);
            setExecutionLog((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] Playbook run finished with 0 errors. Total execution duration: 1.4s`
            ]);
          }, 600);
        }
      }, (index + 1) * 700);
    });
  };

  const getNodeColor = (type: PlaybookNode["type"]) => {
    switch (type) {
      case "trigger":
        return "border-amber-500/40 bg-amber-500/10 text-amber-300";
      case "condition":
        return "border-blue-500/40 bg-blue-500/10 text-blue-300";
      case "action":
        return "border-red-500/40 bg-red-500/10 text-red-300";
      case "approval":
        return "border-purple-500/40 bg-purple-500/10 text-purple-300";
      case "notify":
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
    }
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Visual SOAR Playbook Orchestrator
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Automated IR
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                DAG automation workflows, conditional branching & Four-Eyes response triggers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runPlaybookTest}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isExecuting ? "animate-spin" : ""}`} />
              {isExecuting ? "Testing Playbook..." : "Execute Simulation"}
            </button>
          </div>
        </header>

        {/* Content Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Playbook Sidebar Catalog */}
          <div className="w-80 border-r border-[#263248] bg-[#0E1626]/60 flex flex-col overflow-y-auto p-3 space-y-2 flex-shrink-0">
            <div className="px-2 py-1 text-[11px] font-mono uppercase text-[#64748B] font-bold">
              SOAR Automation Catalog
            </div>

            {playbooks.map((pb) => {
              const isSelected = selectedPlaybook.id === pb.id;
              return (
                <div
                  key={pb.id}
                  onClick={() => {
                    setSelectedPlaybook(pb);
                    setExecutionStep(-1);
                    setExecutionLog([]);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "border-[#38BDF8] bg-[#172033] shadow-sm"
                      : "border-[#263248] bg-[#0E1626] hover:border-[#38BDF8]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                      ACTIVE (AUTO)
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {pb.nodes.length} Steps
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{pb.name}</h3>
                  <p className="text-[11px] text-[#94A3B8] line-clamp-2">{pb.description}</p>
                </div>
              );
            })}
          </div>

          {/* Playbook Visual DAG Canvas & Debugger */}
          <div className="flex-1 flex flex-col bg-[#0B1020] overflow-hidden">
            {/* Playbook Metadata Bar */}
            <div className="p-4 border-b border-[#263248] bg-[#0E1626] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  {selectedPlaybook.name}
                </h2>
                <div className="text-xs font-mono text-[#94A3B8] mt-0.5">
                  Trigger Expression: <span className="text-[#38BDF8]">{selectedPlaybook.triggerEvent}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-1 rounded bg-[#172033] border border-[#263248] text-emerald-400 font-bold">
                  SLA: &lt; 5s Auto-Response
                </span>
              </div>
            </div>

            {/* Visual Workflow Nodes Flowchart */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start space-y-4 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              {selectedPlaybook.nodes.map((node, idx) => {
                const isCurrent = executionStep === idx;
                const isPassed = executionStep > idx;

                return (
                  <React.Fragment key={node.id}>
                    <div
                      className={`w-full max-w-xl p-4 rounded-xl border transition-all duration-300 ${getNodeColor(node.type)} ${
                        isCurrent
                          ? "ring-2 ring-[#38BDF8] shadow-lg shadow-[#38BDF8]/20 scale-105"
                          : isPassed
                          ? "opacity-90"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10">
                              Step {idx + 1}: {node.type}
                            </span>
                            {isPassed && (
                              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" /> Executed (200 OK)
                              </span>
                            )}
                            {isCurrent && (
                              <span className="flex items-center gap-1 text-[10px] font-mono text-[#38BDF8] animate-pulse">
                                <RotateCw className="w-3 h-3 animate-spin" /> In Flight...
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-white">{node.title}</h4>
                          <p className="text-[11px] text-[#94A3B8]">{node.subtitle}</p>
                        </div>

                        <div className="p-2 rounded-lg bg-black/30 border border-white/10">
                          {node.type === "trigger" && <Zap className="w-4 h-4 text-amber-400" />}
                          {node.type === "condition" && <Settings className="w-4 h-4 text-blue-400" />}
                          {node.type === "action" && <Lock className="w-4 h-4 text-red-400" />}
                          {node.type === "approval" && <UserCheck className="w-4 h-4 text-purple-400" />}
                          {node.type === "notify" && <Mail className="w-4 h-4 text-emerald-400" />}
                        </div>
                      </div>
                    </div>

                    {idx < selectedPlaybook.nodes.length - 1 && (
                      <div className="flex flex-col items-center">
                        <div className={`w-0.5 h-6 transition-all ${isPassed ? "bg-emerald-500" : "bg-[#263248]"}`} />
                        <ArrowRight className={`w-4 h-4 rotate-90 -my-1 transition-all ${isPassed ? "text-emerald-500" : "text-[#64748B]"}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Execution Debug Console */}
            {executionLog.length > 0 && (
              <div className="h-40 border-t border-[#263248] bg-[#070C18] p-4 overflow-y-auto font-mono text-xs space-y-1 text-[#94A3B8]">
                <div className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider pb-1 border-b border-[#263248]">
                  Live SOAR Simulation Debug Trace
                </div>
                {executionLog.map((log, i) => (
                  <div key={i} className="text-[11px] leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
