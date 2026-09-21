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
  Radio
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
      <section className="relative pt-24 pb-24 px-6 border-b border-[#263248] overflow-hidden">
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
            Stop treating security alerts as isolated flat log events. SOCForge constructs <strong className="text-white font-semibold">typed Evidence Graphs</strong> on PostgreSQL, turns empirical findings into production <strong className="text-white font-semibold">Sigma, SPL, and KQL rules</strong>, and enforces strict <strong className="text-white font-semibold">human-in-the-loop response approval gates</strong>.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B1020] px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-[#38BDF8]/20"
            >
              Enter Investigation Console <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Interactive Live Demo Trigger Button */}
            <button
              onClick={handleTriggerDemo}
              disabled={demoRunning}
              className="flex items-center gap-2 bg-[#151C2E] hover:bg-[#172033] border border-[#263248] text-[#F8FAFC] px-5 py-3 rounded-lg text-xs font-mono transition shadow-inner group"
            >
              <Play className={`w-3.5 h-3.5 text-[#38BDF8] ${demoRunning ? "animate-spin" : "group-hover:scale-110"}`} />
              <span className="text-[#A7B0C0]">Run</span>
              <strong className="text-white">socforge demo</strong>
            </button>
          </div>
        </div>

        {/* Live Metrics Showcase */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] text-center space-y-1">
            <div className="text-2xl font-black text-white font-mono">100%</div>
            <div className="text-[11px] text-[#A7B0C0] uppercase tracking-wider font-medium">Relational Evidence Graph</div>
          </div>
          <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] text-center space-y-1">
            <div className="text-2xl font-black text-[#22C55E] font-mono">3 Formats</div>
            <div className="text-[11px] text-[#A7B0C0] uppercase tracking-wider font-medium">Sigma • SPL • KQL</div>
          </div>
          <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] text-center space-y-1">
            <div className="text-2xl font-black text-[#38BDF8] font-mono">0 Shell Access</div>
            <div className="text-[11px] text-[#A7B0C0] uppercase tracking-wider font-medium">Controlled AI Sandbox</div>
          </div>
          <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] text-center space-y-1">
            <div className="text-2xl font-black text-[#F59E0B] font-mono">Dual-Gated</div>
            <div className="text-[11px] text-[#A7B0C0] uppercase tracking-wider font-medium">Containment Approvals</div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/detections" className="p-6 rounded-xl bg-[#151C2E] border border-[#263248] hover:border-[#38BDF8]/40 transition group space-y-3">
          <div className="p-2.5 rounded bg-[#111827] border border-[#263248] text-[#38BDF8] w-fit">
            <FileCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition">
            Detection Studio →
          </h3>
          <p className="text-xs text-[#A7B0C0] leading-relaxed">
            Formulate high-fidelity rules in Sigma YAML, Splunk SPL, and Sentinel KQL. Replay rules against labeled baseline telemetry datasets to measure precision and recall.
          </p>
        </Link>

        <Link href="/integrations" className="p-6 rounded-xl bg-[#151C2E] border border-[#263248] hover:border-[#38BDF8]/40 transition group space-y-3">
          <div className="p-2.5 rounded bg-[#111827] border border-[#263248] text-[#38BDF8] w-fit">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition">
            Connectors Hub →
          </h3>
          <p className="text-xs text-[#A7B0C0] leading-relaxed">
            Plug into Wazuh SIEM/EDR, Microsoft Sentinel, and Splunk with AES-256 encrypted credential storage and live connection diagnostics.
          </p>
        </Link>

        <Link href="/investigations" className="p-6 rounded-xl bg-[#151C2E] border border-[#263248] hover:border-[#38BDF8]/40 transition group space-y-3">
          <div className="p-2.5 rounded bg-[#111827] border border-[#263248] text-[#38BDF8] w-fit">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition">
            Evidence Graph →
          </h3>
          <p className="text-xs text-[#A7B0C0] leading-relaxed">
            Explore correlated attack sequences linking users, hosts, processes, and domains with relational database backing and MITRE ATT&CK mapping.
          </p>
        </Link>
      </section>

      {/* Interactive Demo Execution Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#111827] border border-[#38BDF8]/40 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#263248] flex items-center justify-between bg-[#0B1020]">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  SOCForge End-to-End Demo Workflow
                </span>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-[#A7B0C0] hover:text-white text-lg font-mono"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                Executing automated telemetry ingestion, evidence graph correlation, analytical finding derivation, Sigma rule formulation, and precision replay against <code className="text-[#38BDF8]">synthetic-soc-v1.json</code>.
              </p>

              <div className="bg-[#0B1020] border border-[#263248] rounded-lg p-3 font-mono text-xs max-h-60 overflow-y-auto space-y-1.5">
                {demoLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#38BDF8]">›</span>
                    <span className={log.includes("Complete") || log.includes("created") || log.includes("Authenticated") ? "text-[#22C55E]" : log.includes("Error") ? "text-[#EF4444]" : "text-[#F8FAFC]"}>
                      {log}
                    </span>
                  </div>
                ))}
                {demoRunning && (
                  <div className="flex items-center gap-2 text-[#38BDF8] animate-pulse">
                    <span>›</span>
                    <span>Processing live telemetry pipeline...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#263248] bg-[#0B1020] flex items-center justify-between">
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-[#38BDF8] hover:underline"
              >
                Open Dashboard Console →
              </Link>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="px-4 py-1.5 rounded bg-[#38BDF8] text-[#0B1020] font-semibold text-xs hover:bg-[#38BDF8]/90 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#263248] bg-[#0B1020] py-8 text-center text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SocForgeLogo size="sm" showWordmark={true} />
          <p>© {new Date().getFullYear()} Sandeep Mothukuri. Open source under Apache 2.0 License.</p>
        </div>
      </footer>
    </div>
  );
}
