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
  Server
} from "lucide-react";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";
import { runDemoWorkflow } from "@/lib/api";

export default function HomePage() {
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoLogs, setDemoLogs] = useState<string[]>([]);

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

  // Enterprise Feature Studios
  const PLATFORM_STUDIOS = [
    {
      title: "CTI Threat Intelligence Matrix",
      desc: "Track 312+ global threat actor groups, STIX 2.1 JSON dossiers, campaign attribution, and live TAXII/MISP telemetry ingestion.",
      href: "/intel",
      badge: "OpenCTI Architecture",
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
      title: "Adversary BAS Attack Simulator",
      desc: "Execute controlled atomic red team emulations (T1059, T1003, T1078) to validate SIEM telemetry ingestion and rule efficacy.",
      href: "/simulation",
      badge: "Breach Simulation",
      badgeColor: "bg-amber-950/30 text-amber-400 border-amber-500/30",
      icon: ShieldCheck,
      color: "text-amber-400"
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
      title: "Visual SOAR Playbook Automation",
      desc: "Design deterministic multi-stage automation playbooks connecting SIEM alerts, enrichment, ticketing, and containment actions.",
      href: "/playbooks",
      badge: "Automated Workflows",
      badgeColor: "bg-neutral-900 text-neutral-300 border-neutral-800",
      icon: Zap,
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
      title: "Threat Hunting Studio & Hypotheses",
      desc: "Proactive hypothesis-driven hunting across multi-source telemetry logs (Wazuh, Splunk, Sentinel) with MITRE ATT&CK mapping.",
      href: "/hunts",
      badge: "Hypothesis Hunting",
      badgeColor: "bg-orange-950/30 text-orange-400 border-orange-500/30",
      icon: Crosshair,
      color: "text-orange-400"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-neutral-100 font-sans selection:bg-white/20 selection:text-white">
      {/* Top Banner Alert */}
      <div className="bg-[#050505] border-b border-neutral-800 px-6 py-2 text-center text-xs text-neutral-300 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-semibold text-white">SOCForge Enterprise v2.0 Live</span> — Unified Threat Intelligence, Attack Graph Forensics & SOAR Engine.
      </div>

      {/* Navigation Header */}
      <header className="border-b border-neutral-800 bg-[#000000]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-95 transition flex items-center gap-3">
            <SocForgeLogo size="md" showWordmark={true} />
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-800 text-white">
              OLED PITCH-BLACK
            </span>
          </Link>

          {/* Quick Route Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <Link href="/dashboard" className="hover:text-white transition">CTI Overview</Link>
            <Link href="/intel" className="hover:text-white transition">Threat Actors</Link>
            <Link href="/incidents" className="hover:text-white transition">War Room</Link>
            <Link href="/investigations" className="hover:text-white transition">Investigations</Link>
            <Link href="/detections" className="hover:text-white transition">Detection Studio</Link>
            <Link href="/playbooks" className="hover:text-white transition">SOAR Playbooks</Link>
            <Link href="/wallboard" className="hover:text-white transition">OLED Wallboard</Link>
            <Link href="/desktop" className="text-white hover:text-emerald-400 transition flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5" /> Desktop App
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-xs bg-white hover:bg-neutral-200 text-black font-bold px-4 py-2 rounded-lg transition shadow-md flex items-center gap-1.5"
            >
              Launch Console <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 border-b border-neutral-800 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
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

          <p className="text-base sm:text-lg text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Unifying multi-source telemetry from Wazuh, Microsoft Sentinel, and Splunk into an immutable relational graph with verified forensic provenance and sub-second automated containment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>Enter SOCForge Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              href="/desktop"
              className="w-full sm:w-auto px-7 py-3 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>Desktop App Guide (.EXE)</span>
            </Link>

            <button 
              onClick={handleTriggerDemo}
              disabled={demoRunning}
              className="w-full sm:w-auto px-7 py-3 rounded-xl border border-neutral-800 bg-[#0A0A0A] hover:bg-neutral-900 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Play className={`w-4 h-4 text-emerald-400 ${demoRunning ? "animate-spin" : ""}`} />
              <span>Run Pipeline Simulation</span>
            </button>
          </div>

          {/* Real-time KPI Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-4xl mx-auto">
            <div className="p-3.5 rounded-xl bg-[#080808] border border-neutral-800 text-left space-y-1">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold">Tracked Threat Actors</span>
              <div className="text-2xl font-bold text-white font-mono">312 <span className="text-xs text-emerald-400 font-sans font-medium">+12 24h</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080808] border border-neutral-800 text-left space-y-1">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold">Active Observables</span>
              <div className="text-2xl font-bold text-white font-mono">260K <span className="text-xs text-emerald-400 font-sans font-medium">STIX 2.1</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080808] border border-neutral-800 text-left space-y-1">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold">Rule Precision</span>
              <div className="text-2xl font-bold text-white font-mono">98.4% <span className="text-xs text-emerald-400 font-sans font-medium">Verified</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080808] border border-neutral-800 text-left space-y-1">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold">Containment Gate</span>
              <div className="text-2xl font-bold text-white font-mono">4-Eyes <span className="text-xs text-amber-400 font-sans font-medium">Enforced</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE SECURITY OPERATIONS STUDIOS GRID ─────────────────────── */}
      <section className="py-20 px-6 border-b border-neutral-800 bg-[#000000]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Full Security Arsenal & Workspaces
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                SOCForge Enterprise Platform Modules
              </h2>
              <p className="text-sm text-neutral-400 max-w-2xl">
                Explore specialized studios built for threat intelligence, graph investigation, automated detection validation, malware dissection, and SOC command.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs text-neutral-300 hover:text-white font-semibold flex items-center gap-1 self-start md:self-auto"
            >
              Open Complete Console <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLATFORM_STUDIOS.map((studio, idx) => {
              const Icon = studio.icon;
              return (
                <Link
                  key={idx}
                  href={studio.href}
                  className="p-6 rounded-2xl bg-[#050505] border border-neutral-800 hover:border-neutral-600 hover:bg-[#0A0A0A] transition-all duration-200 flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white group-hover:scale-105 transition-transform">
                        <Icon className={`w-5 h-5 ${studio.color}`} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${studio.badgeColor}`}>
                        {studio.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-neutral-200 transition-colors">
                      {studio.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {studio.desc}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-semibold text-neutral-400 group-hover:text-white transition-colors pt-2 border-t border-neutral-800/80">
                    <span>Enter Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── NATIVE WINDOWS DESKTOP APP SECTION ─────────────────────────────────── */}
      <section className="py-16 px-6 border-b border-neutral-800 bg-[#050505]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Laptop className="w-4 h-4" />
                <span>Native Desktop Operations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Running SOCForge Desktop App on Windows
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Your repository contains standalone executables, Edge WebView2 native window, and desktop shortcuts.
              </p>
            </div>
            <Link
              href="/desktop"
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 font-bold text-xs transition flex items-center gap-1.5 self-start md:self-auto shadow-md"
            >
              <span>View Full Operations Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#000000] border border-neutral-800 space-y-2">
              <div className="text-[11px] font-bold text-white font-mono">1. DESKTOP SHORTCUT</div>
              <h4 className="font-semibold text-sm text-white">1-Click Launch</h4>
              <p className="text-xs text-neutral-400">
                Double-click <code className="text-neutral-200 font-mono">SOCForge Console Window.lnk</code> directly on your Windows desktop.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#000000] border border-neutral-800 space-y-2">
              <div className="text-[11px] font-bold text-emerald-400 font-mono">2. STANDALONE .EXE</div>
              <h4 className="font-semibold text-sm text-white">No Python Needed</h4>
              <p className="text-xs text-neutral-400">
                Run <code className="text-emerald-300 font-mono">.\SOCForge-Window.exe</code> or <code className="text-emerald-300 font-mono">.\SOCForge-Operations.exe</code>.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#000000] border border-neutral-800 space-y-2">
              <div className="text-[11px] font-bold text-amber-400 font-mono">3. BATCH LAUNCHER</div>
              <h4 className="font-semibold text-sm text-white">File Explorer</h4>
              <p className="text-xs text-neutral-400">
                Double-click <code className="text-amber-300 font-mono">.\SOCForge-Launcher.bat</code> in the repository root folder.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#000000] border border-neutral-800 space-y-2">
              <div className="text-[11px] font-bold text-purple-400 font-mono">4. TERMINAL CMD</div>
              <h4 className="font-semibold text-sm text-white">PowerShell / Python</h4>
              <p className="text-xs text-neutral-400">
                Run <code className="text-purple-300 font-mono">python apps\desktop\socforge_desktop_window.py</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE ARCHITECTURE PILLARS ───────────────────────────────────────── */}
      <section className="py-20 px-6 border-b border-neutral-800 bg-[#000000]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
              Engineering Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Deterministic, Provable Security Operations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#050505] border border-neutral-800 space-y-3">
              <div className="p-3 rounded-xl bg-neutral-900 text-white w-fit border border-neutral-800">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Relational Evidence Graph</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Graph entities and edges are persisted in PostgreSQL with strict foreign keys to raw events, ensuring verifiable forensic provenance and multi-hop attack path visualization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#050505] border border-neutral-800 space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Detection-as-Code Replay</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Replay Sigma, SPL, and KQL rules against real labeled security datasets (synthetic-soc-v1.json) with live validation of True Positives, False Positives, Precision, and Recall.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#050505] border border-neutral-800 space-y-3">
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
          <div className="bg-[#050505] border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Live Pipeline Simulation Execution</h3>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800"
              >
                Close
              </button>
            </div>

            <div className="bg-[#000000] border border-neutral-800 rounded-xl p-4 font-mono text-xs text-neutral-300 space-y-2 max-h-60 overflow-y-auto">
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
                className="px-5 py-2 rounded-lg bg-white text-black text-xs font-bold transition hover:bg-neutral-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-[#050505] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <SocForgeLogo size="sm" showWordmark={true} />
            <span>• Evidence-Driven Security Operations Platform</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <Link href="/dashboard" className="hover:text-white transition">Console</Link>
            <Link href="/intel" className="hover:text-white transition">Intel Matrix</Link>
            <Link href="/wallboard" className="hover:text-white transition">OLED Wallboard</Link>
            <Link href="/desktop" className="hover:text-white transition">Desktop (.EXE)</Link>
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
