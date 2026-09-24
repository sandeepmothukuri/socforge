"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Clock,
  Maximize2,
  Minimize2,
  Server,
  Zap,
  Globe,
  ArrowLeft,
  AlertTriangle,
  HeartPulse,
  Flame,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";

export default function WallboardPage() {
  const [timeUtc, setTimeUtc] = useState<string>("");
  const [timeLocal, setTimeLocal] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [epsRate, setEpsRate] = useState<number>(14250);

  // Live clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + " UTC");
      setTimeLocal(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulating live EPS jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setEpsRate(14000 + Math.floor(Math.random() * 800));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const liveAlerts = [
    { id: "A-1", sev: "CRITICAL", title: "Mimikatz LSASS Dump via PowerShell", target: "SRV-DC01", time: "09:14:02" },
    { id: "A-2", sev: "HIGH", title: "Cobalt Strike Named Pipe Beaconing", target: "WKSTN-FIN-04", time: "09:12:45" },
    { id: "A-3", sev: "HIGH", title: "Anomalous MFA Push Fatigue Attack", target: "corp\\jdoe", time: "09:08:11" },
    { id: "A-4", sev: "MEDIUM", title: "Perimeter SSH Port Scan Sweep (22/TCP)", target: "FW-EDGE-01", time: "08:59:30" }
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-[#F8FAFC] font-sans flex flex-col p-6 space-y-6 select-none overflow-x-hidden">
      {/* Wallboard Top Command Header */}
      <header className="flex items-center justify-between border-b border-[#1E293B] pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-[#38BDF8] text-[#94A3B8] hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <SocForgeLogo size="md" showWordmark={true} />
          <div className="h-6 w-px bg-[#1E293B]" />
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
              DEFCON 3 • MONITORING LIVE TELEMETRY
            </span>
          </div>
        </div>

        {/* Global Timers & Fullscreen */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-center">
            <span className="text-[10px] text-[#64748B] block">SYSTEM UTC</span>
            <span className="text-sm font-bold text-[#38BDF8]">{timeUtc || "00:00:00 UTC"}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-center">
            <span className="text-[10px] text-[#64748B] block">LOCAL TIME</span>
            <span className="text-sm font-bold text-white">{timeLocal || "00:00:00"}</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#0F172A] border border-[#1E293B] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition"
            title="Toggle Fullscreen Wallboard"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Wallboard KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#090D1A] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="uppercase">INGESTION THROUGHPUT</span>
            <Activity className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {epsRate.toLocaleString()} <span className="text-xs font-normal text-[#94A3B8]">EPS</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Pipeline Health (0 Drop Rate)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090D1A] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="uppercase">MEAN TIME TO DETECT (MTTD)</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 tracking-tight">
            2.4 <span className="text-xs font-normal text-[#94A3B8]">MIN</span>
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            SLA Target: &lt; 15.0m (Exceeding by 84%)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090D1A] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="uppercase">MEAN TIME TO RESPOND (MTTR)</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 tracking-tight">
            11.8 <span className="text-xs font-normal text-[#94A3B8]">MIN</span>
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            SLA Target: &lt; 30.0m (Exceeding by 60%)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090D1A] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="uppercase">ACTIVE ESCALATED INCIDENTS</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400 tracking-tight">
            2 <span className="text-xs font-normal text-red-300">CRITICAL</span>
          </div>
          <div className="text-[11px] text-red-400">
            Containment: 1 Quarantined, 1 War Room Active
          </div>
        </div>
      </div>

      {/* Center Radar & Live Alert Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Cols: Threat Radar & Fleet Matrix */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="p-6 rounded-2xl bg-[#090D1A] border border-[#1E293B] flex flex-col items-center justify-center relative overflow-hidden min-h-[320px]">
            {/* Animated Radar Canvas */}
            <div className="relative w-64 h-64 rounded-full border border-emerald-500/20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-500/10 scale-75" />
              <div className="absolute inset-0 rounded-full border border-emerald-500/10 scale-50" />
              <div className="absolute inset-0 rounded-full border border-emerald-500/10 scale-25" />
              <div className="absolute w-full h-px bg-emerald-500/20" />
              <div className="absolute h-full w-px bg-emerald-500/20" />
              
              {/* Sweeping Beam */}
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.25)_60deg,transparent_65deg)] animate-[spin_4s_linear_infinite]" />

              {/* Blips */}
              <div className="absolute top-12 right-16 w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500 animate-ping" />
              <div className="absolute bottom-20 left-14 w-2 h-2 rounded-full bg-amber-400 shadow-md shadow-amber-400" />
              <div className="absolute top-28 left-20 w-2 h-2 rounded-full bg-[#38BDF8]" />
            </div>

            <div className="absolute bottom-4 left-6 text-xs font-mono text-[#64748B]">
              <span className="text-[#38BDF8] font-bold">RADAR-SCAN:</span> GLOBAL SENSOR BEACONING 360° ACTIVE
            </div>
            <div className="absolute bottom-4 right-6 text-xs font-mono text-emerald-400">
              PROTECTED ENDPOINTS: 1,480 / 1,480 ONLINE
            </div>
          </div>

          {/* Infrastructure Health Status Tiles */}
          <div className="grid grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#090D1A] border border-[#1E293B] space-y-1">
              <span className="text-[#64748B] text-[10px] uppercase block">EDR SENSORS</span>
              <div className="text-sm font-bold text-white">1,480 Active</div>
              <span className="text-[10px] text-emerald-400">100% Coverage</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090D1A] border border-[#1E293B] space-y-1">
              <span className="text-[#64748B] text-[10px] uppercase block">SIEM CLUSTERS</span>
              <div className="text-sm font-bold text-white">4 Clusters</div>
              <span className="text-[10px] text-emerald-400">0ms Lag</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090D1A] border border-[#1E293B] space-y-1">
              <span className="text-[#64748B] text-[10px] uppercase block">FIREWALL GRIDS</span>
              <div className="text-sm font-bold text-white">12 Edges</div>
              <span className="text-[10px] text-emerald-400">Synced</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090D1A] border border-[#1E293B] space-y-1">
              <span className="text-[#64748B] text-[10px] uppercase block">INTEL FEEDS</span>
              <div className="text-sm font-bold text-white">18 Live</div>
              <span className="text-[10px] text-emerald-400">Updated 2m ago</span>
            </div>
          </div>
        </div>

        {/* Right Col: High-Priority Live Ticker Stream */}
        <div className="p-5 rounded-2xl bg-[#090D1A] border border-[#1E293B] flex flex-col space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              LIVE TELEMETRY ALERTS STREAM
            </div>
            <span className="text-[10px] text-[#38BDF8]">AUTO-STREAM</span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {liveAlerts.map((alt) => (
              <div
                key={alt.id}
                className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    alt.sev === "CRITICAL" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                    alt.sev === "HIGH" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {alt.sev}
                  </span>
                  <span className="text-[#64748B]">{alt.time}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{alt.title}</h4>
                <div className="text-[11px] text-[#64748B] flex items-center justify-between">
                  <span>Target: <strong className="text-[#38BDF8]">{alt.target}</strong></span>
                  <span className="text-emerald-400">Triage In-Flight</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1E293B] text-center">
            <Link
              href="/incidents"
              className="text-xs text-[#38BDF8] hover:underline font-bold"
            >
              Open Incident Command Center →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
