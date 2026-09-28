"use client";

import React from "react";
import AppShell from "@/components/AppShell";
import { EnterpriseSocHubDashboard } from "@/components/dashboard/EnterpriseSocHubDashboard";
import { LayoutDashboard, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function SocHubPage() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#000000] text-neutral-100 font-sans">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800/80 bg-[#050505] backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neutral-900 text-cyan-400 border border-neutral-800">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white flex items-center gap-2 tracking-tight">
                Enterprise SOC Command Hub
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono">
                  Live Operations
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                5-tier executive & tactical command console: Telemetry, Assets, Vulnerabilities, Rules, and Compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-mono">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white transition font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
              <span>CTI Threat Intel</span>
            </Link>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("socforge-refresh"));
                }
              }}
              className="p-2 rounded-lg border border-neutral-800 bg-[#0A0A0A] hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4 text-neutral-300" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 flex-1 bg-[#000000]">
          <EnterpriseSocHubDashboard />
        </div>
      </div>
    </AppShell>
  );
}
