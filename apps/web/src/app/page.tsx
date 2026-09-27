"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Share2, 
  Terminal, 
  FileCode, 
  ArrowRight, 
  Activity, 
  Layers, 
  Database, 
  ExternalLink,
  Play,
  CheckCircle2,
  Lock,
  Flame,
  Radio,
  Laptop,
  Globe,
  Crosshair,
  BarChart3,
  Cpu,
  Sparkles,
  Zap,
  Network,
  Users,
  AlertTriangle,
  FolderOpen,
  ChevronRight,
  ShieldCheck,
  Search,
  BookOpen,
  Server,
  Code,
  Copy,
  Check,
  Radar,
  Sliders,
  Eye,
  KeyRound,
  FileCheck2,
  FileSpreadsheet,
  Bot
} from "lucide-react";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";
import { runDemoWorkflow } from "@/lib/api";
import { TelemetryPipelineVisualizer } from "@/components/home/TelemetryPipelineVisualizer";
import { AutonomousAIAgentPlayground } from "@/components/home/AutonomousAIAgentPlayground";
import EnterpriseConnectorsMatrix from "@/components/home/EnterpriseConnectorsMatrix";
import GlobalThreatMap from "@/components/analytics/GlobalThreatMap";

export default function HomePage() {
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoLogs, setDemoLogs] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Studio Explorer Tab State
  const [activeTab, setActiveTab] = useState<"ai_agent" | "intel_graph" | "detect_emulate" | "forensics_deception" | "soar_warroom" | "ops_connectors">("ai_agent");

  // Interactive Live Terminal State
  const [terminalCommand, setTerminalCommand] = useState("socforge hunt --tactic T1059.001 --threshold high");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SOCForge Unified Agent v2.0.4-enterprise initialized.",
    "[INFO] Connecting to telemetry broker at wazuh.corp.internal:1514 (TLSv1.3)...",
    "[OK] Ingestion pipeline synced: 14,290 EPS streaming into PostgreSQL partition.",
    "[HUNT] Scanning event indices for technique T1059.001 (PowerShell Script Execution)...",
    "[MATCH] 3 suspicious invocations detected on HOST: WIN-FIN-04 (User: svc_backup)",
    "  ↳ PID: 4912 -> powershell.exe -enc JABzACAAPQAgAE4AZQB3AC0ATwBiAGo...",
    "  ↳ Telemetry hash: 0x9b4f2c0199e81 • Confidence: 99.4%",
    "[ACTION] Auto-correlated into Incident INC-2026-8812. Ready for 4-eyes containment approval."
  ]);
  const [terminalExecuting, setTerminalExecuting] = useState(false);

  // Transpiler Demo State
  const [targetSiem, setTargetSiem] = useState<"splunk" | "sentinel" | "elastic">("splunk");

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  }

  function runSimulatedCommand(cmd: string) {
    setTerminalCommand(cmd);
    setTerminalExecuting(true);
    setTerminalLogs([`> ${cmd}`, "Resolving schema and querying security telemetry datastore..."]);

    setTimeout(() => {
      if (cmd.includes("hunt")) {
        setTerminalLogs([
          `> ${cmd}`,
          "[INFO] Threat hunt hypothesis executed across 4 clusters.",
          "[MATCH] Found 7 candidate logs in Splunk index=wineventlog EventCode=4688",
          "[ATT&CK] MITRE Technique: T1059.001 (Command & Scripting Interpreter)",
          "[OBSERVABLE] SHA256: 4f128c7c980b1928374d9e035f111823908f9213456722881",
          "[STATUS] Automated candidate finding drafted in Investigations Studio."
        ]);
      } else if (cmd.includes("transpile")) {
        setTerminalLogs([
          `> ${cmd}`,
          "[AST] Parsing YAML Sigma AST tree with 4 conditions...",
          "[PUSH-DOWN] Optimizing index-level filters for high EPS clusters...",
          `[TARGET: ${targetSiem.toUpperCase()}] Emitting optimized query syntax:`,
          targetSiem === "splunk"
            ? 'index=windows EventCode=4688 Image="*\\\\powershell.exe" CommandLine="*-enc*"'
            : targetSiem === "sentinel"
            ? 'SecurityEvent | where EventID == 4688 and Process has "powershell.exe" and CommandLine contains "-enc"'
            : 'process.name: "powershell.exe" and process.command_line: *-enc*',
          "[VALIDATION] AST verification: 0 syntax errors • 100% dialect coverage."
        ]);
      } else if (cmd.includes("contain")) {
        setTerminalLogs([
          `> ${cmd}`,
          "[GATE] 4-Eyes Dual Approval Verification triggered.",
          "[AUDIT] Commander authorization token valid: SEC-CMD-AUTH-091",
          "[ADAPTER] Dispatching network isolation command to CrowdStrike Falcon / Defender API...",
          "[OK] HOST: WIN-FIN-04 placed in restricted containment VLAN (VLAN-99).",
          "[HMAC] Containment action logged to immutable audit ledger (HMAC-SHA256: 0x8a9f...)"
        ]);
      } else if (cmd.includes("agent")) {
        setTerminalLogs([
          `> ${cmd}`,
          "[AGENT] Autonomous CyberSecOps Reasoner v3 initialized.",
          "[PHASE 1] Ingested 3 alert telemetry streams from Splunk HEC & Wazuh EDR.",
          "[PHASE 2] Identified LSASS credential dumping (T1003.001) & active C2 beaconing.",
          "[PHASE 3] Formulated 4-Eyes Containment: Quarantine WIN-FIN-04 + Revoke svc_backup token.",
          "[STATUS] Containment plan ready for commander approval in Incident War Room."
        ]);
      } else {
        setTerminalLogs([
          `> ${cmd}`,
          "[DISSECT] Ingesting binary artifact: loader_sample_x64.bin (142 KB)",
          "[ENTROPY] Calculated Shannon Entropy: 7.92 / 8.00 (Packed / Encrypted)",
          "[YARA] Rule matched: APT29_Nobelium_CobaltStrike_Stager (Confidence: 98%)",
          "[EXTRACT] Discovered C2 Domain: update-microsoft-cdn.net (Port 443)",
          "[GRAPH] Auto-linked to Diamond Model Actor: APT29 (Cozy Bear)."
        ]);
      }
      setTerminalExecuting(false);
    }, 600);
  }

  async function handleTriggerDemo() {
    setDemoRunning(true);
    setDemoModalOpen(true);
    setDemoLogs(["Connecting to SOCForge deterministic API engine..."]);
    try {
      const res = await runDemoWorkflow();
      setDemoLogs(res.steps || ["Pipeline run initiated successfully."]);
    } catch (err: any) {
      setDemoLogs((prev) => [...prev, `Demo execution failed: ${err.message}`]);
    } finally {
      setDemoRunning(false);
    }
  }

  // All 16 Enterprise Platform Studios
  const ALL_PLATFORM_STUDIOS = [
    {
      title: "CTI Threat Intelligence Matrix",
      desc: "Track 312+ global threat actor groups, STIX 2.1 JSON dossiers, campaign attribution, and live TAXII/MISP telemetry feeds.",
      href: "/intel",
      badge: "OpenCTI Engine",
      badgeColor: "bg-neutral-900 text-neutral-200 border-neutral-800",
      icon: Globe,
      color: "text-white"
    },
    {
      title: "Multi-Hop Evidence Graph Visualizer",
      desc: "Correlate host endpoints, compromised accounts, command injections, and MITRE techniques in a deterministic PostgreSQL graph.",
      href: "/graph",
      badge: "Attack Path Graph",
      badgeColor: "bg-emerald-950/30 text-emerald-400 border-emerald-500/30",
      icon: Network,
      color: "text-emerald-400"
    },
    {
      title: "Incident War Room & Response",
      desc: "Live containment console with strictly enforced 4-eyes command approval, automated host isolation, and credential revocation.",
      href: "/incidents",
      badge: "Dual-Gated SOAR",
      badgeColor: "bg-red-950/30 text-red-400 border-red-500/30",
      icon: ShieldAlert,
      color: "text-red-400"
    },
    {
      title: "Detection Engineering & Sigma Replay",
      desc: "Author, validate, and test Sigma, SPL, and KQL rules against real labeled security datasets with live Precision & Recall metrics.",
      href: "/detections",
      badge: "Detection-as-Code",
      badgeColor: "bg-emerald-950/30 text-emerald-400 border-emerald-500/30",
      icon: FileCode,
      color: "text-emerald-400"
    },
    {
      title: "Investigations & Forensics Canvas",
      desc: "Deep-dive case management linking observables, timeline analysis, raw log telemetry, and exportable evidentiary dossiers.",
      href: "/investigations",
      badge: "Case Management",
      badgeColor: "bg-neutral-900 text-neutral-300 border-neutral-800",
      icon: FolderOpen,
      color: "text-white"
    },
    {
      title: "MITRE ATT&CK Analytics & Heatmap",
      desc: "Comprehensive tactical coverage matrix, detection gap analysis, time-window sliding filters, and MITRE Navigator JSON export.",
      href: "/analytics",
      badge: "Coverage Matrix",
      badgeColor: "bg-emerald-950/30 text-emerald-400 border-emerald-500/30",
      icon: BarChart3,
      color: "text-emerald-400"
    },
    {
      title: "Adversary BAS Attack Simulator",
      desc: "Execute controlled atomic red team emulations (T1059, T1003, T1078) to validate SIEM telemetry ingestion and rule efficacy.",
      href: "/simulation",
      badge: "Breach Simulation",
      badgeColor: "bg-amber-950/30 text-amber-400 border-amber-500/30",
      icon: ShieldCheck,
      color: "text-amber-400"
    },
    {
      title: "Cyber Deception & Honeytokens",
      desc: "Deploy canary tokens, decoy SMB shares, fake SPNs, and cowrie honeypots with real-time tripwire alarms and attacker IP containment.",
      href: "/deception",
      badge: "Active Defense",
      badgeColor: "bg-purple-950/30 text-purple-400 border-purple-500/30",
      icon: Eye,
      color: "text-purple-400"
    },
    {
      title: "Malware & YARA Forensics Lab",
      desc: "Dissect suspicious payloads, extract hex byte sequences, calculate Shannon entropy, and test custom YARA rule signatures.",
      href: "/forensics",
      badge: "Payload Analysis",
      badgeColor: "bg-purple-950/30 text-purple-400 border-purple-500/30",
      icon: Cpu,
      color: "text-purple-400"
    },
    {
      title: "Hypothesis Threat Hunting Studio",
      desc: "Proactive hypothesis-driven hunting across multi-source telemetry logs (Wazuh, Splunk, Sentinel) with 1-click Sigma rule promotion.",
      href: "/hunts",
      badge: "Hypothesis Hunting",
      badgeColor: "bg-orange-950/30 text-orange-400 border-orange-500/30",
      icon: Crosshair,
      color: "text-orange-400"
    },
    {
      title: "Visual SOAR Playbook Automation",
      desc: "Design deterministic multi-stage automation DAGs connecting SIEM alerts, enrichment, ticketing, and containment actions.",
      href: "/playbooks",
      badge: "Automated Workflows",
      badgeColor: "bg-neutral-900 text-neutral-300 border-neutral-800",
      icon: Zap,
      color: "text-white"
    },
    {
      title: "SOC Operations & Shift Handoff",
      desc: "False positive rule tuning, alert queue velocity metrics, shift handover logging, and daily commander briefing text exports.",
      href: "/operations",
      badge: "Shift Management",
      badgeColor: "bg-neutral-900 text-neutral-300 border-neutral-800",
      icon: Users,
      color: "text-white"
    },
    {
      title: "24/7 Command OLED Wallboard",
      desc: "High-contrast NOC/SOC operations view with real-time threat feed counters, attack vectors, MTTR timers, and live system health.",
      href: "/wallboard",
      badge: "Command Center",
      badgeColor: "bg-rose-950/30 text-rose-400 border-rose-500/30",
      icon: Radio,
      color: "text-rose-400"
    },
    {
      title: "Enterprise Connectors & Telemetry",
      desc: "32+ pre-integrated SIEM, EDR, Cloud, Identity, and Threat Intel connectors with live ping probes, batch health testing, and AES-256 Vault.",
      href: "/integrations",
      badge: "32+ Connectors • 6 Extensions",
      badgeColor: "bg-emerald-950/30 text-emerald-400 border-emerald-500/30",
      icon: Sliders,
      color: "text-emerald-400"
    },
    {
      title: "Cryptographic Audit Ledger",
      desc: "Immutable HMAC-SHA256 hash-chained event log guaranteeing tamper-proof non-repudiation and compliance for every containment action.",
      href: "/audit",
      badge: "HMAC Hash Chain",
      badgeColor: "bg-neutral-900 text-neutral-300 border-neutral-800",
      icon: FileCheck2,
      color: "text-white"
    },
    {
      title: "Native Desktop App (.EXE)",
      desc: "Standalone Windows Edge WebView2 native app and PyInstaller single-file binaries with offline cache, zero browser overhead, and tray monitor.",
      href: "/desktop",
      badge: "Windows Native",
      badgeColor: "bg-emerald-950/30 text-emerald-400 border-emerald-500/30",
      icon: Laptop,
      color: "text-emerald-400"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-neutral-100 font-sans selection:bg-white/20 selection:text-white">
      {/* Top Banner Alert */}
      <div className="bg-[#050505] border-b border-[#262626] px-6 py-2 text-center text-xs text-neutral-300 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-semibold text-white">SOCForge Enterprise v2.0 Live</span> — Unified Threat Intelligence, Attack Graph Forensics & SOAR Engine.
      </div>

      {/* Navigation Header */}
      <header className="border-b border-[#262626] bg-[#000000]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-95 transition flex items-center gap-3">
            <SocForgeLogo size="md" showWordmark={true} />
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 border border-[#262626] text-white">
              OLED PITCH-BLACK
            </span>
          </Link>

          {/* Quick Route Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-neutral-400">
            <Link href="/dashboard" className="hover:text-white transition">CTI Overview</Link>
            <Link href="/intel" className="hover:text-white transition">Threat Intel</Link>
            <Link href="/graph" className="hover:text-white transition">Attack Graph</Link>
            <Link href="/incidents" className="hover:text-white transition">War Room</Link>
            <Link href="/detections" className="hover:text-white transition">Detections</Link>
            <Link href="/playbooks" className="hover:text-white transition">Playbooks</Link>
            <Link href="/simulation" className="hover:text-white transition">BAS Simulator</Link>
            <Link href="/forensics" className="hover:text-white transition">Forensics</Link>
            <Link href="/wallboard" className="hover:text-white transition">Wallboard</Link>
            <Link href="/integrations" className="hover:text-white transition">Connectors</Link>
            <Link href="/desktop" className="text-white hover:text-emerald-400 transition flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5" /> Desktop (.EXE)
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-xs bg-white hover:bg-neutral-200 text-black font-bold px-4 py-2 rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              Launch Console <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-14 px-6 border-b border-[#262626] bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-700 bg-neutral-950 text-xs text-neutral-200">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>OpenCTI + Falcon Architecture • PostgreSQL Relational Graph • Dual-Gated SOAR</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Evidence-Driven Security Operations for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-emerald-400">
                Investigation, Threat Intelligence & SOAR
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              Unifying multi-source telemetry from Wazuh, Microsoft Sentinel, and Splunk into an immutable relational graph with verified forensic provenance, 20+ enterprise connectors, and sub-second automated containment.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link 
                href="/dashboard" 
                className="px-7 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>Enter SOCForge Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link 
                href="/desktop"
                className="px-6 py-3 rounded-xl border border-[#262626] bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <Laptop className="w-4 h-4 text-emerald-400" />
                <span>Desktop App (.EXE)</span>
              </Link>

              <button 
                onClick={handleTriggerDemo}
                disabled={demoRunning}
                className="px-6 py-3 rounded-xl border border-[#262626] bg-[#0A0A0A] hover:bg-neutral-900 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <Play className={`w-4 h-4 text-emerald-400 ${demoRunning ? "animate-spin" : ""}`} />
                <span>Run Pipeline Simulation</span>
              </button>
            </div>
          </div>

          {/* Interactive Interactive CLI Terminal Simulator */}
          <div className="bg-[#050505] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
            <div className="px-4 py-3 border-b border-[#262626] bg-[#0A0A0A] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs font-mono text-neutral-400 pl-2">socforge-cli • bash session (root@socforge-core)</span>
              </div>

              {/* Executable Preset Buttons */}
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-neutral-500 text-[10px] uppercase font-bold mr-1">Run Preset:</span>
                <button
                  onClick={() => runSimulatedCommand("socforge hunt --tactic T1059.001 --threshold high")}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-[#262626] transition"
                >
                  Hunt
                </button>
                <button
                  onClick={() => runSimulatedCommand("socforge transpile --rule sigma_powershell_enc.yml")}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white border border-[#262626] transition"
                >
                  Transpile
                </button>
                <button
                  onClick={() => runSimulatedCommand("socforge contain --host win-fin-04 --gate 4eyes")}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-[#262626] transition"
                >
                  Contain
                </button>
                <button
                  onClick={() => runSimulatedCommand("socforge agent --triage INC-2026-8812 --autonomous")}
                  className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 transition font-bold"
                >
                  AI Agent
                </button>
                <button
                  onClick={() => runSimulatedCommand("socforge dissect --sample loader_sample_x64.bin")}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-purple-400 border border-[#262626] transition"
                >
                  Dissect
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#000000] font-mono text-xs text-neutral-300 space-y-1.5 min-h-[170px] max-h-64 overflow-y-auto">
              {terminalLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold select-none">›</span>
                  <span className={log.startsWith(">") ? "text-white font-bold" : log.includes("[OK]") || log.includes("[MATCH]") ? "text-emerald-300" : log.includes("[ACTION]") || log.includes("[GATE]") ? "text-amber-300" : "text-neutral-400"}>
                    {log}
                  </span>
                </div>
              ))}
              {terminalExecuting && (
                <div className="flex items-center gap-2 text-white animate-pulse pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-neutral-400">Executing deterministic query against telemetry pipeline...</span>
                </div>
              )}
            </div>
          </div>

          {/* Real-time KPI Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2 max-w-5xl mx-auto">
            <div className="p-3.5 rounded-xl bg-[#080808] border border-[#262626] text-left space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Threat Actors</span>
              <div className="text-xl font-bold text-white font-mono">312 <span className="text-xs text-emerald-400 font-sans font-medium">+12 24h</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080808] border border-[#262626] text-left space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Observables</span>
              <div className="text-xl font-bold text-white font-mono">260K <span className="text-xs text-emerald-400 font-sans font-medium">STIX 2.1</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080808] border border-[#262626] text-left space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Rule Precision</span>
              <div className="text-xl font-bold text-white font-mono">98.4% <span className="text-xs text-emerald-400 font-sans font-medium">Verified</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080808] border border-[#262626] text-left space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Containment Gate</span>
              <div className="text-xl font-bold text-white font-mono">4-Eyes <span className="text-xs text-amber-400 font-sans font-medium">Enforced</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080808] border border-[#262626] text-left space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Connectors</span>
              <div className="text-xl font-bold text-white font-mono">32+ <span className="text-xs text-emerald-400 font-sans font-medium">Online</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080808] border border-[#262626] text-left space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Extensions</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">6 <span className="text-xs text-neutral-400 font-sans font-medium">Marketplace</span></div>
            </div>
          </div>
        </div>
      </section>
 
      {/* ── ANIMATED TELEMETRY FLOW PIPELINE & LIVE EPS DASHBOARD ─────────────── */}
      <TelemetryPipelineVisualizer />

      {/* ── AUTONOMOUS AI AGENT TRIAGE PLAYGROUND ────────────────────────────── */}
      <AutonomousAIAgentPlayground />

      {/* ── GLOBAL THREAT ARC MAP & C2 RADAR ─────────────────────────────────── */}
      <section className="py-16 px-6 border-b border-[#262626] bg-[#000000]">
        <div className="max-w-7xl mx-auto space-y-4">
          <GlobalThreatMap />
        </div>
      </section>

      {/* ── WORKSPACE EXPLORER CATEGORIZED TABS ─────────────────────────────────── */}
      <section className="py-16 px-6 border-b border-[#262626] bg-[#050505]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                Interactive Architecture Showcase
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Explore SOCForge Functional Workspaces
              </h2>
              <p className="text-xs text-neutral-400 max-w-2xl">
                Switch between core operational domains to preview workflows, query transpilations, and containment protocols.
              </p>
            </div>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap gap-2 border-b border-[#262626] pb-3">
            {[
              { id: "ai_agent", label: "Autonomous AI Agent", icon: Bot },
              { id: "intel_graph", label: "Threat Intel & Graph", icon: Globe },
              { id: "detect_emulate", label: "Detection & Emulation", icon: FileCode },
              { id: "forensics_deception", label: "Forensics & Deception", icon: Cpu },
              { id: "soar_warroom", label: "SOAR & War Room", icon: ShieldAlert },
              { id: "ops_connectors", label: "Operations & 32 Connectors", icon: Sliders }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 ${
                    isActive
                      ? "bg-white text-black shadow-lg"
                      : "bg-[#0A0A0A] border border-[#262626] text-neutral-400 hover:text-white hover:border-neutral-500"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="bg-[#000000] border border-[#262626] rounded-2xl p-6 shadow-2xl">
            {activeTab === "ai_agent" && (
              <div className="space-y-5 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#050505] border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                        Autonomous CyberSecOps Agent v3.4
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          4-EYES GUARDED
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400 font-sans">
                        Continuous threat investigation, MITRE technique mapping, Diamond Model correlation, and sub-second containment proposal.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("socforge-open-copilot"));
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition flex items-center gap-1.5 shadow-md self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Launch AI Copilot (Ctrl+J)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-2">
                    <span className="text-[10px] text-emerald-400 font-bold">1. TELEMETRY & BLAST RADIUS</span>
                    <h4 className="text-xs font-bold text-white font-sans">Multi-Source Correlation</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      Correlates Splunk HEC, Wazuh EDR, and Sentinel events across parent-child process chains and network hops.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-2">
                    <span className="text-[10px] text-amber-400 font-bold">2. ADVERSARY ATTRIBUTION</span>
                    <h4 className="text-xs font-bold text-white font-sans">Diamond Model TTP Matching</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      Links observed TTPs (T1059.001, T1003.001) to 312+ threat actors (e.g. APT29, Volt Typhoon, Lazarus).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-2">
                    <span className="text-[10px] text-red-400 font-bold">3. DUAL-GATED SOAR DISPATCH</span>
                    <h4 className="text-xs font-bold text-white font-sans">Human-in-the-Loop Isolation</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      Synthesizes containment commands requiring two authorized signatures before executing host quarantine.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "intel_graph" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">CTI Matrix (/intel)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 text-neutral-300 font-mono">312 ACTORS</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Diamond Model attribution, MITRE technique mapping, Diamond Model facets, and STIX 2.1 dossier export.
                  </p>
                  <Link href="/intel" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 gap-1 pt-2">
                    Open Intel Matrix <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Attack Graph (/graph)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 font-mono">MULTI-HOP</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Volt Typhoon LOTL, APT29, and Lazarus multi-hop topologies with host isolation hooks and JSON export.
                  </p>
                  <Link href="/graph" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 gap-1 pt-2">
                    Open Attack Graph <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">MITRE ATT&CK Matrix (/analytics)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 text-neutral-300 font-mono">HEATMAP</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Interactive coverage matrix with sliding time windows (24h/7d/30d/90d) and automated detection gap analysis.
                  </p>
                  <Link href="/analytics" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 gap-1 pt-2">
                    Open Heatmap <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "detect_emulate" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Detection Studio (/detections)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 font-mono">MULTI-SIEM</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    AST transpiler converting Sigma rules into Splunk SPL, Elastic KQL, and Microsoft Sentinel KQL queries.
                  </p>
                  <Link href="/detections" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 gap-1 pt-2">
                    Open Detection Studio <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Adversary Simulator (/simulation)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/30 text-amber-400 border border-amber-500/30 font-mono">ATOMIC BAS</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Execute atomic test emulations (PowerShell, LSASS dump, Token impersonation) and 4-stage kill-chain campaigns.
                  </p>
                  <Link href="/simulation" className="inline-flex items-center text-xs font-bold text-amber-400 hover:text-amber-300 gap-1 pt-2">
                    Open BAS Simulator <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Threat Hunting (/hunts)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-orange-950/30 text-orange-400 border border-orange-500/30 font-mono">HYPOTHESES</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Hypothesis queries with live tail telemetry stream, cross-SIEM query language selector, and rule promotion.
                  </p>
                  <Link href="/hunts" className="inline-flex items-center text-xs font-bold text-orange-400 hover:text-orange-300 gap-1 pt-2">
                    Open Hunting Studio <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "forensics_deception" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Forensics Lab (/forensics)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950/30 text-purple-400 border border-purple-500/30 font-mono">YARA + ENTROPY</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Shannon entropy visualization, hex disassembly, artifact ingest wizard, and YARA rule signature tester.
                  </p>
                  <Link href="/forensics" className="inline-flex items-center text-xs font-bold text-purple-400 hover:text-purple-300 gap-1 pt-2">
                    Open Forensics Lab <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Cyber Deception (/deception)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950/30 text-purple-400 border border-purple-500/30 font-mono">CANARY BAIT</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Deploy honeytokens, cowrie SSH decoys, and fake AWS keys with real-time canary tripwire simulation.
                  </p>
                  <Link href="/deception" className="inline-flex items-center text-xs font-bold text-purple-400 hover:text-purple-300 gap-1 pt-2">
                    Open Deception Studio <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Audit Ledger (/audit)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 text-neutral-300 font-mono">HMAC SHA-256</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Cryptographic hash chain verification of every containment, role alteration, and SOAR execution.
                  </p>
                  <Link href="/audit" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 gap-1 pt-2">
                    Open Audit Ledger <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "soar_warroom" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Incident War Room (/incidents)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/30 text-red-400 border border-red-500/30 font-mono">4-EYES APPROVAL</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Live War Room bridge ticker, containment checklist, dual approval modal, and forensic dossier text export.
                  </p>
                  <Link href="/incidents" className="inline-flex items-center text-xs font-bold text-red-400 hover:text-red-300 gap-1 pt-2">
                    Open War Room <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">SOAR Playbooks (/playbooks)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 text-neutral-300 font-mono">DAG AUTOMATION</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Interactive DAG visualizer, step simulation with live Celery worker telemetry, and playbook JSON exporter.
                  </p>
                  <Link href="/playbooks" className="inline-flex items-center text-xs font-bold text-white hover:text-neutral-300 gap-1 pt-2">
                    Open Playbooks <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Investigations Canvas (/investigations)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 text-neutral-300 font-mono">CASE MGMT</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Interactive entity inspector, evidence graph JSON export, finding authoring wizard, and host quarantine.
                  </p>
                  <Link href="/investigations" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 gap-1 pt-2">
                    Open Investigations <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "ops_connectors" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Connectors & Marketplace (/integrations)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 font-mono">32 CONNECTORS • 6 EXTENSIONS</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Splunk, Sentinel, Wazuh, CrowdStrike, Okta, AWS GuardDuty, Vault, Cloudflare plus curated Detection & SOAR Extensions.
                  </p>
                  <Link href="/integrations" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 gap-1 pt-2">
                    Open Connectors & Extensions <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Command Wallboard (/wallboard)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/30 text-rose-400 border border-rose-500/30 font-mono">NOC/SOC</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    High-contrast dark-mode command display with ingress alert simulator, audio klaxon chime toggle, and severity filters.
                  </p>
                  <Link href="/wallboard" className="inline-flex items-center text-xs font-bold text-rose-400 hover:text-rose-300 gap-1 pt-2">
                    Open Wallboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Native Desktop (.EXE) (/desktop)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 font-mono">WINDOWS 11</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Edge WebView2 native console window, PyInstaller standalone binaries, and PowerShell auto-deploy script.
                  </p>
                  <Link href="/desktop" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 gap-1 pt-2">
                    Open Desktop Guide <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE 32-CONNECTOR HEALTH & TEST MATRIX ───────────────────── */}
      <EnterpriseConnectorsMatrix />

      {/* ── COMPLETE 16-STUDIO ARSENAL GRID ─────────────────────────────────── */}
      <section className="py-20 px-6 border-b border-[#262626] bg-[#000000]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                Full Security Arsenal & Workspaces
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Complete 16 SOCForge Platform Studios
              </h2>
              <p className="text-xs text-neutral-400 max-w-2xl">
                Every tool engineered for precision: threat intelligence, graph forensics, automated detection validation, malware dissection, and SOC command.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs text-neutral-300 hover:text-white font-semibold flex items-center gap-1 self-start md:self-auto font-mono"
            >
              Open Complete Console <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_PLATFORM_STUDIOS.map((studio, idx) => {
              const Icon = studio.icon;
              return (
                <Link
                  key={idx}
                  href={studio.href}
                  className="p-5 rounded-2xl bg-[#050505] border border-[#262626] hover:border-neutral-500 hover:bg-[#0A0A0A] transition-all duration-200 flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-neutral-900 border border-[#262626] text-white group-hover:scale-105 transition-transform">
                        <Icon className={`w-4 h-4 ${studio.color}`} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium font-mono border ${studio.badgeColor}`}>
                        {studio.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-neutral-200 transition-colors">
                      {studio.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {studio.desc}
                    </p>
                  </div>

                  <div className="flex items-center text-[11px] font-semibold text-neutral-500 group-hover:text-white transition-colors pt-2 border-t border-[#262626]/80 font-mono">
                    <span>Enter Studio</span>
                    <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CORE ARCHITECTURE PILLARS ───────────────────────────────────────── */}
      <section className="py-20 px-6 border-b border-[#262626] bg-[#050505]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 font-mono">
              Engineering Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Deterministic, Provable Security Operations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#000000] border border-[#262626] space-y-3">
              <div className="p-3 rounded-xl bg-neutral-900 text-white w-fit border border-[#262626]">
                <Share2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-base text-white">Relational Evidence Graph</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Graph entities and edges are persisted in PostgreSQL with strict foreign keys to raw events, ensuring verifiable forensic provenance and multi-hop attack path visualization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#000000] border border-[#262626] space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Detection-as-Code Replay</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Replay Sigma, SPL, and KQL rules against real labeled security datasets (synthetic-soc-v1.json) with live validation of True Positives, False Positives, Precision, and Recall.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#000000] border border-[#262626] space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Dual-Gated SOAR Containment</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Four-eyes principle strictly enforced: analysts propose containment actions, commanders approve. Actions execute through simulated adapters with full cryptographic auditing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-[#050505] border border-[#262626] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Live Pipeline Simulation Execution</h3>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-[#262626]"
              >
                Close
              </button>
            </div>

            <div className="bg-[#000000] border border-[#262626] rounded-xl p-4 font-mono text-xs text-neutral-300 space-y-2 max-h-60 overflow-y-auto">
              {demoLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">›</span>
                  <span>{log}</span>
                </div>
              ))}
              {demoRunning && (
                <div className="flex items-center gap-2 text-white animate-pulse pt-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-white" />
                  <span>Processing relational security pipeline...</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDemoModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold transition hover:bg-neutral-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#262626] bg-[#050505] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-3">
            <SocForgeLogo size="sm" showWordmark={true} />
            <span>• Evidence-Driven Security Operations Platform</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-neutral-400">
            <Link href="/dashboard" className="hover:text-white transition">Console</Link>
            <Link href="/intel" className="hover:text-white transition">Intel Matrix</Link>
            <Link href="/graph" className="hover:text-white transition">Attack Graph</Link>
            <Link href="/incidents" className="hover:text-white transition">War Room</Link>
            <Link href="/detections" className="hover:text-white transition">Detections</Link>
            <Link href="/wallboard" className="hover:text-white transition">OLED Wallboard</Link>
            <Link href="/desktop" className="hover:text-white transition">Desktop (.EXE)</Link>
            <Link href="/integrations" className="hover:text-white transition">Connectors</Link>
            <a 
              href="https://github.com/sandeepmothukuri/socforge" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div>
            Lead Architect: <span className="text-white font-semibold">Sandeep Mothukuri</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
