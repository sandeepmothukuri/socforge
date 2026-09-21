import React from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Share2, 
  Crosshair, 
  Terminal, 
  FileCode, 
  ArrowRight, 
  CheckCircle2, 
  Activity,
  Layers,
  Database
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-[#0c121e]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              SF
            </div>
            <span className="font-semibold text-lg tracking-tight">SOC<span className="text-blue-500">Forge</span></span>
            <span className="text-xs px-2 py-0.5 rounded border border-blue-500/30 text-blue-400 bg-blue-500/10 ml-2">
              v0.1.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#architecture" className="hover:text-white transition">Architecture</Link>
            <Link href="#evidence-graph" className="hover:text-white transition">Evidence Graph</Link>
            <Link href="#pipeline" className="hover:text-white transition">Closed Loop</Link>
            <Link href="#docs" className="hover:text-white transition">Docs</Link>
            <a href="https://github.com/sandeepmothukuri" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition shadow-md shadow-blue-600/20"
            >
              Launch Console
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 border-b border-slate-800/80 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-xs text-blue-400 mb-2">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            Vendor-Neutral Security Operations Engineering Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Evidence-Driven Security Operations for <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Investigation, Threat Hunting & Detection
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Ingest telemetry. Build attack context via typed Evidence Graphs. Synthesize analyst findings into validated Sigma, SPL, and KQL rules — with deterministic safety and human approval gates.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-sm transition shadow-lg shadow-blue-600/25"
            >
              Explore Investigation Workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 px-5 py-3 rounded-lg text-sm font-mono">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span>socforge demo</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Closed Workflow Section */}
      <section id="pipeline" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-xs font-semibold tracking-wider text-blue-400 uppercase">Core Engineering Loop</h2>
          <p className="text-3xl font-bold text-white tracking-tight">Closing the Gap between SOC and Detection Engineering</p>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            SOCForge replaces disjointed alert triage by connecting incident evidence directly to detection hypothesis creation, rule validation, and controlled response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0f172a]/50 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">1. Telemetry & Evidence</h3>
            <p className="text-sm text-slate-400">
              Ingest normalized telemetry from Wazuh, Sysmon, Zeek, or JSON. Construct typed entity relationship graphs on PostgreSQL.
            </p>
          </div>

          <div className="bg-[#0f172a]/50 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">2. Investigation & Findings</h3>
            <p className="text-sm text-slate-400">
              Correlate IPs, processes, hashes and users. Every finding is linked to supporting events and MITRE ATT&CK techniques.
            </p>
          </div>

          <div className="bg-[#0f172a]/50 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">3. Detection Pipeline</h3>
            <p className="text-sm text-slate-400">
              Formulate Sigma, SPL, and KQL rules directly from findings. Validate syntax, test against datasets, and measure precision.
            </p>
          </div>

          <div className="bg-[#0f172a]/50 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">4. Controlled Response</h3>
            <p className="text-sm text-slate-400">
              Action recommendations are strictly gated behind analyst review and policy validation. Full audit trails on every step.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#090d16] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Built by <span className="text-slate-300 font-medium">Sandeep Mothukuri</span> — Independent open-source security operations platform.
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/sandeepmothukuri" target="_blank" rel="noreferrer" className="hover:text-slate-300">GitHub</a>
            <a href="/docs" className="hover:text-slate-300">Documentation</a>
            <a href="/docs/api" className="hover:text-slate-300">API Reference</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
