"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Share2, 
  Crosshair, 
  Terminal, 
  FileCode, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  CheckCircle,
  Database,
  ArrowUpRight
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0a0f1a] flex flex-col">
        <div className="h-16 border-b border-slate-800/80 px-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            SF
          </div>
          <span className="font-bold text-base tracking-tight">SOC<span className="text-blue-500">Forge</span></span>
        </div>

        <nav className="p-4 space-y-1 text-sm font-medium text-slate-400 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Activity className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/alerts" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-white transition">
            <AlertTriangle className="w-4 h-4" /> Alerts
          </Link>
          <Link href="/investigations" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-white transition">
            <Share2 className="w-4 h-4" /> Investigations & Graph
          </Link>
          <Link href="/detections" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-white transition">
            <FileCode className="w-4 h-4" /> Detection Engineering
          </Link>
          <Link href="/hunts" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-white transition">
            <Crosshair className="w-4 h-4" /> Threat Hunting
          </Link>
          <Link href="/incidents" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-white transition">
            <ShieldAlert className="w-4 h-4" /> Incidents
          </Link>
          <Link href="/integrations" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-white transition">
            <Database className="w-4 h-4" /> Integrations
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
          <span>Backend: <strong className="text-emerald-400">Online</strong></span>
          <span>v0.1.0</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Security Operations Console</h1>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              PostgreSQL Evidence Store Connected
            </span>
            <span className="text-slate-400">Analyst: <strong className="text-slate-200">Sandeep Mothukuri</strong></span>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl">
          {/* Status Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Alerts</span>
              <div className="text-2xl font-bold text-white">1</div>
              <span className="text-xs text-amber-400">1 Critical requiring triage</span>
            </div>

            <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Investigations</span>
              <div className="text-2xl font-bold text-white">1</div>
              <span className="text-xs text-blue-400">Evidence Graph active</span>
            </div>

            <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Detections Formulated</span>
              <div className="text-2xl font-bold text-white">1</div>
              <span className="text-xs text-emerald-400">1 Validated Sigma Rule</span>
            </div>

            <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Response Status</span>
              <div className="text-2xl font-bold text-white">Gated</div>
              <span className="text-xs text-slate-400">1 Action awaiting review</span>
            </div>
          </div>

          {/* Active Investigation Showcase: The Evidence Graph */}
          <div className="bg-[#0f172a]/40 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Featured Investigation: LSASS Memory Access on DC-PRIMARY-01</h2>
                <p className="text-xs text-slate-400">Derived from Sysmon telemetry • MITRE ATT&CK: T1003.001</p>
              </div>
              <Link 
                href="/investigations" 
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Open Investigation Workspace <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Interactive Graph Visual Mockup */}
            <div className="p-8 bg-[#090e18] flex flex-col items-center justify-center space-y-6">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-mono">Authoritative Evidence Graph (PostgreSQL Schema)</div>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200">
                  <span className="text-slate-400 block text-[10px]">USER ENTITY</span>
                  svc_backup
                </div>
                <span className="text-slate-600">─[AUTHENTICATED_TO]─►</span>
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-red-200">
                  <span className="text-red-400 block text-[10px]">HOST ENTITY</span>
                  DC-PRIMARY-01
                </div>
                <span className="text-slate-600">─[RAN_PROCESS]─►</span>
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-200">
                  <span className="text-amber-400 block text-[10px]">PROCESS ENTITY</span>
                  powershell.exe (PID 4912)
                </div>
                <span className="text-slate-600">─[MAPS_TO]─►</span>
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-lg text-indigo-200">
                  <span className="text-indigo-400 block text-[10px]">ATT&CK TECHNIQUE</span>
                  T1003.001 (LSASS Dump)
                </div>
              </div>

              <div className="text-xs text-slate-400 max-w-lg text-center leading-relaxed">
                Relationship edges are stored as typed records in the <code className="text-slate-300 font-mono">entity_relationships</code> table, ensuring every analyst conclusion links directly to verifiable raw logs.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
