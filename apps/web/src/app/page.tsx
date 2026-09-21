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
  Database,
  Cpu,
  Lock,
  Zap,
  Radio,
  ExternalLink,
  Search
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#060a12] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-blue-900/40 border-b border-blue-500/20 px-6 py-2 text-center text-xs text-blue-300 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping"></span>
        <span className="font-semibold text-white">SOCForge v0.1.0 Released</span> — Evidence-driven, vendor-neutral security operations & detection engineering platform.
      </div>

      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-[#080d1a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              SF
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                SOC<span className="text-blue-500">Forge</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-normal border border-blue-500/30 text-blue-400 bg-blue-500/10">
                  CORE
                </span>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Link href="#architecture" className="hover:text-blue-400 transition">Architecture</Link>
            <Link href="#evidence-graph" className="hover:text-blue-400 transition">Evidence Graph</Link>
            <Link href="#detections" className="hover:text-blue-400 transition">Detection Studio</Link>
            <Link href="#integrations" className="hover:text-blue-400 transition">Connectors</Link>
            <a href="https://github.com/sandeepmothukuri" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              Launch Console <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-24 px-6 border-b border-slate-800/80 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[250px] bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 text-xs text-blue-300 shadow-inner">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Bridging Telemetry, Relational Investigation, and Detection-as-Code</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Evidence-Driven Security Operations for <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Investigation, Threat Hunting & Detection
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300/90 max-w-3xl mx-auto leading-relaxed">
            Stop treating security alerts as isolated flat log events. SOCForge constructs <strong className="text-white font-semibold">typed Evidence Graphs</strong> on PostgreSQL, turns empirical findings into production <strong className="text-white font-semibold">Sigma, SPL, and KQL rules</strong>, and enforces strict <strong className="text-white font-semibold">human-in-the-loop response approval gates</strong>.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-blue-600/30"
            >
              Enter Investigation Console <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 text-slate-300 px-5 py-3 rounded-xl text-xs font-mono shadow-inner">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>socforge demo</span>
            </div>
          </div>
        </div>

        {/* Live Metrics Showcase */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur text-center space-y-1">
            <div className="text-2xl font-black text-white font-mono">100%</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Relational Evidence Graph</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur text-center space-y-1">
            <div className="text-2xl font-black text-emerald-400 font-mono">3 Formats</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Sigma • SPL • KQL</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur text-center space-y-1">
            <div className="text-2xl font-black text-blue-400 font-mono">0 Shell Access</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Controlled AI Sandbox</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur text-center space-y-1">
            <div className="text-2xl font-black text-amber-400 font-mono">Dual-Gated</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Safe Response Advisor</div>
          </div>
        </div>
      </section>

      {/* Closed Detection Loop Section */}
      <section id="architecture" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-blue-400 uppercase">Core Engineering Loop</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">From Telemetry to Validated Detection</p>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Traditional SOC workflows drop context between alert triage and detection writing. SOCForge closes the entire loop into a single auditable lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] border border-slate-800/90 p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">1. Ingest & Correlate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingest normalized events from Wazuh SIEM, Windows Sysmon, Zeek, or raw JSON. Map entities into PostgreSQL relational tables.
            </p>
          </div>

          <div className="bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] border border-slate-800/90 p-6 rounded-2xl space-y-3 hover:border-indigo-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">2. Evidence Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authoritative graph connecting IP, User, Host, Process, and ATT&CK techniques with typed semantic relationships.
            </p>
          </div>

          <div className="bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] border border-slate-800/90 p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">3. Detection Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize findings directly into Sigma, Splunk SPL, or Microsoft Sentinel KQL with automated AST syntax validation.
            </p>
          </div>

          <div className="bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] border border-slate-800/90 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">4. Gated Response</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Containment actions (`isolate_host`, `disable_user`) require mandatory human analyst approval. Fully audited.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Evidence Graph Showcase */}
      <section id="evidence-graph" className="py-20 px-6 bg-[#04070e] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">Differentiator</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Relational Evidence Graph Topology</h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Every edge in the graph represents a verified event record persisted in PostgreSQL. Sub-second pivoting during active enterprise intrusion investigations.
              </p>
            </div>
            <Link 
              href="/investigations"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition flex items-center gap-1.5"
            >
              Explore Live Canvas <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </Link>
          </div>

          {/* Graphical Topology Map */}
          <div className="p-8 rounded-2xl bg-[#090e18] border border-slate-800/80 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/50 shadow-lg text-center space-y-1 w-44">
                <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold block">User Entity</span>
                <span className="font-bold text-white text-sm">svc_backup</span>
                <span className="text-[10px] text-slate-500 block">Active Directory Account</span>
              </div>

              <div className="text-slate-500 flex flex-col items-center">
                <span className="text-[10px] text-blue-400 uppercase font-semibold">AUTHENTICATED_TO</span>
                <span>────────►</span>
              </div>

              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 shadow-lg text-center space-y-1 w-44">
                <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold block">Host Entity</span>
                <span className="font-bold text-white text-sm">DC-PRIMARY-01</span>
                <span className="text-[10px] text-red-400/70 block">Risk: 90.0</span>
              </div>

              <div className="text-slate-500 flex flex-col items-center">
                <span className="text-[10px] text-amber-400 uppercase font-semibold">RAN_PROCESS</span>
                <span>────────►</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 shadow-lg text-center space-y-1 w-44">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">Process Entity</span>
                <span className="font-bold text-white text-sm">powershell.exe</span>
                <span className="text-[10px] text-slate-500 block">PID 4912 (Sysmon 10)</span>
              </div>

              <div className="text-slate-500 flex flex-col items-center">
                <span className="text-[10px] text-indigo-400 uppercase font-semibold">MAPS_TO</span>
                <span>────────►</span>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/50 shadow-lg text-center space-y-1 w-44">
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold block">MITRE Technique</span>
                <span className="font-bold text-white text-sm">T1003.001</span>
                <span className="text-[10px] text-indigo-400/80 block">LSASS Memory Dump</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#060a12] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md">
              SF
            </div>
            <span>
              SOCForge — Engineered by <span className="text-slate-300 font-semibold">Sandeep Mothukuri</span>. Licensed under Apache 2.0.
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="https://github.com/sandeepmothukuri" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition">GitHub Profile</a>
            <Link href="/dashboard" className="hover:text-slate-300 transition">Console</Link>
            <Link href="/investigations" className="hover:text-slate-300 transition">Investigations</Link>
            <Link href="/detections" className="hover:text-slate-300 transition">Detections</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
