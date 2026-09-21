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
  Laptop
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
    setDemoLogs(["Connecting to SOCForge API engine..."]);
    try {
      const res = await runDemoWorkflow();
      setDemoLogs(res.steps);
    } catch (err: any) {
      setDemoLogs((prev) => [...prev, `Demo failed: ${err.message}`]);
    } finally {
      setDemoRunning(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1020] text-[#F8FAFC] font-sans selection:bg-[#38BDF8]/30 selection:text-[#38BDF8]">
      {/* Top Banner Alert */}
      <div className="bg-[#111827] border-b border-[#263248] px-6 py-2 text-center text-xs text-[#38BDF8] flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-[#22C55E] animate-ping" />
        <span className="font-semibold text-white">SOCForge Platform Active</span> — Evidence-driven, vendor-neutral security operations & detection engineering.
      </div>

      {/* Navigation */}
      <header className="border-b border-[#263248] bg-[#0B1020]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <SocForgeLogo size="md" showWordmark={true} />
          </Link>

          {/* Fully Working Direct Route Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#A7B0C0]">
            <Link href="/dashboard" className="hover:text-[#38BDF8] transition">Console</Link>
            <Link href="/desktop" className="text-[#38BDF8] hover:text-[#38BDF8]/80 transition flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5" /> Desktop App Guide
            </Link>
            <Link href="/investigations" className="hover:text-[#38BDF8] transition">Evidence Graph</Link>
            <Link href="/detections" className="hover:text-[#38BDF8] transition">Detection Studio</Link>
            <Link href="/integrations" className="hover:text-[#38BDF8] transition">Connectors</Link>
            <a 
              href="https://github.com/sandeepmothukuri/socforge" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#38BDF8] transition flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3 h-3 text-[#6B7280]" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-xs bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B1020] font-bold px-4 py-2 rounded-lg transition shadow-md shadow-[#38BDF8]/20 flex items-center gap-1.5"
            >
              Launch Console <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 border-b border-[#263248] overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#38BDF8]/30 bg-[#151C2E] text-xs text-[#38BDF8]">
            <Activity className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
            <span>Bridging Telemetry, Relational Evidence, and Detection-as-Code</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Evidence-Driven Security Operations for <br />
            <span className="text-[#38BDF8]">
              Investigation, Threat Hunting & Detection
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#A7B0C0] max-w-3xl mx-auto leading-relaxed">
            Unifying multi-source telemetry from Wazuh, Microsoft Sentinel, and Splunk into an immutable PostgreSQL relational graph with strictly verified forensic provenance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B1020] font-bold text-sm transition shadow-lg shadow-[#38BDF8]/25 flex items-center justify-center gap-2"
            >
              <span>Enter Security Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              href="/desktop"
              className="w-full sm:w-auto px-7 py-3 rounded-lg border border-[#38BDF8]/40 bg-[#151C2E] hover:bg-[#1E293B] text-[#38BDF8] font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Laptop className="w-4 h-4 text-[#38BDF8]" />
              <span>Desktop App Guide (.EXE)</span>
            </Link>

            <button 
              onClick={handleTriggerDemo}
              disabled={demoRunning}
              className="w-full sm:w-auto px-7 py-3 rounded-lg border border-[#263248] bg-[#151C2E] hover:bg-[#1E293B] text-white font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Play className={`w-4 h-4 text-[#22C55E] ${demoRunning ? "animate-spin" : ""}`} />
              <span>Run Live Pipeline Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── RUNNING DESKTOP APP SECTION ON HOME PAGE ────────────────────────────── */}
      <section className="py-16 px-6 border-b border-[#263248] bg-[#0E1626]/50">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <Laptop className="w-4 h-4" />
                <span>Native Desktop Operations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Running SOCForge Desktop App on Windows
              </h2>
              <p className="text-sm text-[#A7B0C0] mt-1">
                Your repository contains standalone executables, Edge WebView2 native window, and desktop shortcuts.
              </p>
            </div>
            <Link
              href="/desktop"
              className="px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B1020] font-bold text-xs transition flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>View Full Operations Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#151C2E] border border-[#263248] space-y-2">
              <div className="text-[11px] font-bold text-[#38BDF8] font-mono">1. DESKTOP SHORTCUT</div>
              <h4 className="font-bold text-sm text-white">1-Click Launch</h4>
              <p className="text-xs text-[#A7B0C0]">
                Double-click <code>SOCForge Console Window.lnk</code> directly on your Windows desktop.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#151C2E] border border-[#263248] space-y-2">
              <div className="text-[11px] font-bold text-[#22C55E] font-mono">2. STANDALONE .EXE</div>
              <h4 className="font-bold text-sm text-white">No Python Needed</h4>
              <p className="text-xs text-[#A7B0C0]">
                Run <code>.\SOCForge-Window.exe</code> or <code>.\SOCForge-Operations.exe</code> in the project folder.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#151C2E] border border-[#263248] space-y-2">
              <div className="text-[11px] font-bold text-[#F59E0B] font-mono">3. BATCH LAUNCHER</div>
              <h4 className="font-bold text-sm text-white">File Explorer</h4>
              <p className="text-xs text-[#A7B0C0]">
                Double-click <code>.\SOCForge-Launcher.bat</code> in the repository root directory.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#151C2E] border border-[#263248] space-y-2">
              <div className="text-[11px] font-bold text-[#A855F7] font-mono">4. TERMINAL CMD</div>
              <h4 className="font-bold text-sm text-white">PowerShell / Python</h4>
              <p className="text-xs text-[#A7B0C0]">
                Run <code>python apps\desktop\socforge_desktop_window.py</code> in terminal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="py-20 px-6 border-b border-[#263248]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-bold text-[#38BDF8] font-mono">
              Core Engineering Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              Deterministic Security Investigation System
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#151C2E] border border-[#263248] space-y-3">
              <div className="p-3 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] w-fit">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Relational Evidence Graph</h3>
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                Graph entities and edges are persisted in PostgreSQL with strict foreign keys to raw events, ensuring verifiable audit trails.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#151C2E] border border-[#263248] space-y-3">
              <div className="p-3 rounded-lg bg-[#22C55E]/10 text-[#22C55E] w-fit">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Detection-as-Code Replay</h3>
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                Replay Sigma, SPL, and KQL rules against real labeled security datasets (synthetic-soc-v1.json) calculating live Precision and Recall.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#151C2E] border border-[#263248] space-y-3">
              <div className="p-3 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] w-fit">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Dual-Gated Containment</h3>
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                Four-eyes principle strictly enforced: analysts request containment, commanders approve. Actions execute through simulated adapters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#263248] bg-[#070D19] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#6B7280]">
          <div className="flex items-center gap-3">
            <SocForgeLogo size="sm" showWordmark={true} />
            <span>• Evidence-Driven Security Operations Platform</span>
          </div>
          <div>
            Author: <span className="text-[#A7B0C0] font-semibold">Sandeep Mothukuri</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
