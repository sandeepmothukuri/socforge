"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Server,
  AlertTriangle,
  FileCode,
  Flame,
  Radio,
  Clock,
  Laptop,
  CheckCircle2,
  TrendingUp,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Layers,
  Activity,
  Globe,
  Lock,
  ArrowUpRight,
  Sliders,
  Filter,
  Eye
} from "lucide-react";

export function EnterpriseSocHubDashboard() {
  // Global Filters & Toggles
  const [alertTrendTime, setAlertTrendTime] = useState<"day" | "week" | "month">("day");
  const [alertSource, setAlertSource] = useState<string>("all");
  const [topAlertSourceType, setTopAlertSourceType] = useState<"protocol" | "ip">("protocol");
  const [assetTab, setAssetTab] = useState<"vulnerabilities" | "alerts">("vulnerabilities");
  const [deviceTab, setDeviceTab] = useState<"agent" | "ad">("agent");
  const [vulnTrendTime, setVulnTrendTime] = useState<"day" | "week" | "month">("day");
  const [vulnSeverityTab, setVulnSeverityTab] = useState<"overall" | "unique">("overall");
  const [mitreTab, setMitreTab] = useState<"tactics" | "techniques">("tactics");
  const [rulesFileTypeTab, setRulesFileTypeTab] = useState<"fileTypes" | "protocols">("fileTypes");
  const [ruleSeverityTab, setRuleSeverityTab] = useState<"severity" | "tags">("severity");

  return (
    <div className="space-y-4 pb-12 text-neutral-200">
      
      {/* ─────────────────────────────────────────────────────────────────────────
          TOP ROW: 5 KPI CARDS
         ───────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* 1. New Alerts */}
        <div className="p-4 rounded-xl bg-[#090D14] border border-[#1E293B] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">New Alerts</span>
            <span className="p-1 rounded bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">500</span>
            <span className="text-[11px] font-mono text-red-400 font-semibold flex items-center">
              ↑ 15% from last week
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1E293B] grid grid-cols-2 text-[11px] font-mono text-neutral-400">
            <div>
              <span className="text-neutral-500 block text-[10px]">Network Alerts:</span>
              <strong className="text-white">200</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Endpoint Alerts:</span>
              <strong className="text-white">300</strong>
            </div>
          </div>
        </div>

        {/* 2. Assets */}
        <div className="p-4 rounded-xl bg-[#090D14] border border-[#1E293B] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">Assets</span>
            <span className="p-1 rounded bg-cyan-500/10 text-cyan-400">
              <Laptop className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">1,400</span>
            <span className="text-[11px] font-mono text-neutral-400 font-semibold">
              0% from last week
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1E293B] grid grid-cols-2 text-[11px] font-mono text-neutral-400">
            <div>
              <span className="text-neutral-500 block text-[10px]">Active Agents:</span>
              <strong className="text-emerald-400">1,200</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Inactive Agents:</span>
              <strong className="text-neutral-300">200</strong>
            </div>
          </div>
        </div>

        {/* 3. Vulnerabilities */}
        <div className="p-4 rounded-xl bg-[#090D14] border border-[#1E293B] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">Vulnerabilities</span>
            <span className="p-1 rounded bg-red-500/10 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">1,000</span>
            <span className="text-[11px] font-mono text-red-400 font-semibold flex items-center">
              ↑ 10% from last week
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1E293B] grid grid-cols-2 text-[11px] font-mono text-neutral-400">
            <div>
              <span className="text-neutral-500 block text-[10px]">Critical:</span>
              <strong className="text-red-400">100</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Vulnerable Agents:</span>
              <strong className="text-amber-400">900</strong>
            </div>
          </div>
        </div>

        {/* 4. Rules */}
        <div className="p-4 rounded-xl bg-[#090D14] border border-[#1E293B] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">Rules</span>
            <span className="p-1 rounded bg-purple-500/10 text-purple-400">
              <FileCode className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">100,000</span>
            <span className="text-[11px] font-mono text-neutral-400 font-semibold">
              0% from last week
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1E293B] grid grid-cols-2 text-[11px] font-mono text-neutral-400">
            <div>
              <span className="text-neutral-500 block text-[10px]">HIDS Rules:</span>
              <strong className="text-white">50,000</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">NIDS Rules:</span>
              <strong className="text-white">50,000</strong>
            </div>
          </div>
        </div>

        {/* 5. Threats */}
        <div className="p-4 rounded-xl bg-[#090D14] border border-[#1E293B] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">Threats</span>
            <span className="p-1 rounded bg-amber-500/10 text-amber-400">
              <Flame className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">500</span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center">
              ↑ 18% from last week
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1E293B] grid grid-cols-2 text-[11px] font-mono text-neutral-400">
            <div>
              <span className="text-neutral-500 block text-[10px]">IOAs Collected:</span>
              <strong className="text-white">338</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Operational Threats:</span>
              <strong className="text-white">162</strong>
            </div>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          ROW 1: SECURITY ALERT TRENDS | ALERTS AGE MATRIX | TOP ALERT SOURCES
         ───────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Security Alert Trends (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Security Alert Trends
              </h3>
              <p className="text-[10px] text-neutral-400">22,331 alerts detected</p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono">
              <div className="flex bg-[#04060A] p-0.5 rounded border border-[#1E293B]">
                {(["day", "week", "month"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAlertTrendTime(t)}
                    className={`px-2 py-0.5 rounded capitalize transition ${
                      alertTrendTime === t ? "bg-amber-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <select 
                value={alertSource}
                onChange={(e) => setAlertSource(e.target.value)}
                className="bg-[#04060A] text-neutral-300 border border-[#1E293B] rounded px-2 py-0.5 focus:outline-none"
              >
                <option value="all">All Sources</option>
                <option value="edr">CrowdStrike EDR</option>
                <option value="network">Suricata NIDS</option>
                <option value="auth">Active Directory</option>
              </select>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-neutral-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
          </div>

          {/* Spline Area SVG Curve */}
          <div className="flex-1 mt-2 min-h-[170px] relative">
            <svg viewBox="0 0 500 170" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="alertGradYellow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="alertGradRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[30, 70, 110, 150].map((y) => (
                <line key={y} x1="20" y1={y} x2="490" y2={y} stroke="#1E293B" strokeDasharray="3 3" />
              ))}

              {/* Yellow Curve (Medium Alerts) */}
              <path
                d="M 20 150 C 90 148, 140 135, 180 30 C 220 10, 260 90, 310 140 C 370 148, 430 150, 490 150 L 490 150 L 20 150 Z"
                fill="url(#alertGradYellow)"
              />
              <path
                d="M 20 150 C 90 148, 140 135, 180 30 C 220 10, 260 90, 310 140 C 370 148, 430 150, 490 150"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="2.5"
              />

              {/* Red Curve (Critical/High Alerts) */}
              <path
                d="M 20 150 C 90 150, 130 145, 180 65 C 210 50, 240 105, 290 142 C 350 148, 420 150, 490 150 L 490 150 L 20 150 Z"
                fill="url(#alertGradRed)"
              />
              <path
                d="M 20 150 C 90 150, 130 145, 180 65 C 210 50, 240 105, 290 142 C 350 148, 420 150, 490 150"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.2"
              />

              {/* Peak points */}
              <circle cx="180" cy="30" r="4" fill="#FBBF24" className="animate-pulse" />
              <circle cx="180" cy="65" r="4" fill="#EF4444" className="animate-pulse" />

              {/* X Axis Labels */}
              <text x="25" y="165" fill="#64748B" fontSize="9" fontFamily="monospace">4 May</text>
              <text x="110" y="165" fill="#64748B" fontSize="9" fontFamily="monospace">5 May</text>
              <text x="180" y="165" fill="#64748B" fontSize="9" fontFamily="monospace">6 May</text>
              <text x="260" y="165" fill="#64748B" fontSize="9" fontFamily="monospace">7 May</text>
              <text x="340" y="165" fill="#64748B" fontSize="9" fontFamily="monospace">8 May</text>
              <text x="420" y="165" fill="#64748B" fontSize="9" fontFamily="monospace">9 May</text>
              <text x="470" y="165" fill="#64748B" fontSize="9" fontFamily="monospace">10 May</text>
            </svg>
          </div>
        </div>

        {/* Alerts Age Matrix (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Alerts Age Matrix
              </h3>
              <p className="text-[10px] text-neutral-400">Overview of alert age distribution</p>
            </div>
            <span className="text-[9px] font-mono text-neutral-500">Updated 2h ago</span>
          </div>

          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-[10px] font-mono text-center border-collapse">
              <thead>
                <tr className="text-neutral-500 border-b border-[#1E293B]/70">
                  <th className="text-left py-1 text-[9px]">Age Group</th>
                  <th className="py-1 text-amber-400">New</th>
                  <th className="py-1">Assigned</th>
                  <th className="py-1">In Prog</th>
                  <th className="py-1 text-red-400">Escalated</th>
                  <th className="py-1">False Pos</th>
                  <th className="py-1 text-emerald-400">Resolved</th>
                  <th className="py-1 text-neutral-400">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/40">
                {[
                  { age: "< 7 Days", new: "180", assigned: "5.7k", prog: "9.8k", esc: "472", fp: "0", res: "0", cl: "0", heat: 1 },
                  { age: "7-14 Days", new: "440", assigned: "170", prog: "450", esc: "780", fp: "900", res: "340", cl: "170", heat: 2 },
                  { age: "14-21 Days", new: "450", assigned: "90", prog: "900", esc: "450", fp: "4.3k", res: "4.8k", cl: "350", heat: 3 },
                  { age: "21-30 Days", new: "40", assigned: "350", prog: "340", esc: "230", fp: "54k", res: "350", cl: "370", heat: 4 },
                  { age: "> 30 Days", new: "230", assigned: "240", prog: "4.7k", esc: "3.5k", fp: "4.7k", res: "4.7k", cl: "46k", heat: 5 },
                ].map((row) => (
                  <tr key={row.age} className="hover:bg-white/5 transition">
                    <td className="text-left py-1.5 text-neutral-300 whitespace-nowrap">{row.age}</td>
                    <td className="py-1.5 bg-amber-500/15 text-amber-300 font-bold">{row.new}</td>
                    <td className="py-1.5 text-neutral-300">{row.assigned}</td>
                    <td className="py-1.5 text-neutral-300">{row.prog}</td>
                    <td className="py-1.5 bg-red-500/15 text-red-300 font-bold">{row.esc}</td>
                    <td className="py-1.5 text-neutral-400">{row.fp}</td>
                    <td className="py-1.5 text-emerald-400">{row.res}</td>
                    <td className="py-1.5 text-neutral-400">{row.cl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Alert Sources (3 Cols) */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                Top Alert Sources
              </h3>
              <p className="text-[10px] text-neutral-400">Common origins of alerts</p>
            </div>

            <div className="flex bg-[#04060A] p-0.5 rounded border border-[#1E293B] text-[10px] font-mono">
              <button
                onClick={() => setTopAlertSourceType("protocol")}
                className={`px-2 py-0.5 rounded transition ${
                  topAlertSourceType === "protocol" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Protocol
              </button>
              <button
                onClick={() => setTopAlertSourceType("ip")}
                className={`px-2 py-0.5 rounded transition ${
                  topAlertSourceType === "ip" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                IP
              </button>
            </div>
          </div>

          {/* Donut Chart with glowing center */}
          <div className="relative w-44 h-44 my-auto mt-2">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* HTTPS 58% */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#F97316" strokeWidth="12" strokeDasharray="140 100" strokeDashoffset="0" />
              {/* SSH 22% */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#FBBF24" strokeWidth="12" strokeDasharray="55 185" strokeDashoffset="-140" />
              {/* HTTP 12% */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#38BDF8" strokeWidth="12" strokeDasharray="30 210" strokeDashoffset="-195" />
              {/* FTP 8% */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#A855F7" strokeWidth="12" strokeDasharray="15 225" strokeDashoffset="-225" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold font-mono text-white">HTTPS</span>
              <span className="text-[10px] font-mono text-orange-400">58.4%</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-neutral-400 px-2 pt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> HTTPS</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> SSH</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> HTTP</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> FTP</span>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          ROW 2: TOP 7 ASSETS | ASSET STATUS | DEVICE STATUS
         ───────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Top 7 Assets (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                Top 7 Assets
              </h3>
              <p className="text-[10px] text-neutral-400">Assets driving alert and security focus</p>
            </div>

            <div className="flex bg-[#04060A] p-0.5 rounded border border-[#1E293B] text-[10px] font-mono">
              <button
                onClick={() => setAssetTab("vulnerabilities")}
                className={`px-2 py-0.5 rounded transition ${
                  assetTab === "vulnerabilities" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Vulnerabilities
              </button>
              <button
                onClick={() => setAssetTab("alerts")}
                className={`px-2 py-0.5 rounded transition ${
                  assetTab === "alerts" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Alerts
              </button>
            </div>
          </div>

          <div className="mt-2 space-y-1.5 font-mono text-[11px]">
            <div className="grid grid-cols-12 text-[10px] text-neutral-500 pb-1 border-b border-[#1E293B]/40">
              <span className="col-span-4">Asset Id</span>
              <span className="col-span-5">Custodian Name</span>
              <span className="col-span-3 text-right">Count</span>
            </div>

            {[
              { id: "asset-7", custodian: "Custodian G", count: 700 },
              { id: "asset-6", custodian: "Custodian F", count: 600 },
              { id: "asset-5", custodian: "Custodian E", count: 500 },
              { id: "asset-4", custodian: "Custodian D", count: 400 },
              { id: "asset-3", custodian: "Custodian C", count: 300 },
              { id: "asset-2", custodian: "Custodian B", count: 200 },
              { id: "asset-1", custodian: "Custodian A", count: 100 },
            ].map((item) => (
              <div key={item.id} className="grid grid-cols-12 py-1 items-center hover:bg-white/5 rounded px-1 transition">
                <span className="col-span-4 text-orange-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  {item.id}
                </span>
                <span className="col-span-5 text-neutral-300">{item.custodian}</span>
                <span className="col-span-3 text-right text-orange-400 font-bold flex items-center justify-end gap-0.5">
                  ↑ {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Status (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                  Asset Status
                </h3>
                <p className="text-[10px] text-neutral-400">Devices with active agents and AD</p>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 font-bold">500 devices</span>
            </div>

            {/* Agent vs AD Header Metric */}
            <div className="mt-3 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Agent: 90%
              </span>
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                AD: 64%
              </span>
            </div>

            {/* Device Categories Grid */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-mono">
              {[
                { name: "Server", val1: 100, val2: 90 },
                { name: "Laptop", val1: 100, val2: 90 },
                { name: "Desktop", val1: 100, val2: 90 },
                { name: "Network device", val1: 100, val2: 90 },
                { name: "Virtual machine", val1: 100, val2: 90 },
              ].map((dev) => (
                <div key={dev.name} className="p-2 rounded bg-[#04060A] border border-[#1E293B]">
                  <span className="text-neutral-400 block truncate">{dev.name}</span>
                  <div className="mt-1 flex items-center justify-between text-white font-bold">
                    <span className="text-cyan-400">{dev.val1}</span>
                    <span className="text-sky-400">{dev.val2}</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1 rounded mt-1 overflow-hidden flex">
                    <div className="bg-cyan-400 h-full" style={{ width: "90%" }} />
                    <div className="bg-sky-500 h-full" style={{ width: "64%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>Active Agents: <strong className="text-emerald-400">450/500</strong></span>
            <span>Active AD: <strong className="text-sky-400">320/500</strong></span>
            <span className="text-neutral-500">17:33</span>
          </div>
        </div>

        {/* Device Status & Deployment Progress (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Device Status
              </h3>
              <p className="text-[10px] text-neutral-400">Deployment progress</p>
            </div>

            <div className="flex bg-[#04060A] p-0.5 rounded border border-[#1E293B] text-[10px] font-mono">
              <button
                onClick={() => setDeviceTab("agent")}
                className={`px-2 py-0.5 rounded transition ${
                  deviceTab === "agent" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Agent
              </button>
              <button
                onClick={() => setDeviceTab("ad")}
                className={`px-2 py-0.5 rounded transition ${
                  deviceTab === "ad" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                AD
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-3 font-mono text-xs flex-1">
            {[
              { type: "Laptop", count: "310/400", pct: 78, color: "bg-amber-400" },
              { type: "Desktop", count: "110/390", pct: 28, color: "bg-orange-500" },
              { type: "Network", count: "100/300", pct: 33, color: "bg-red-500" },
              { type: "WebApplication", count: "100/500", pct: 20, color: "bg-sky-400" },
              { type: "Server", count: "90/100", pct: 90, color: "bg-emerald-400" },
              { type: "VirtualMachine", count: "90/200", pct: 45, color: "bg-teal-400" },
            ].map((d) => (
              <div key={d.type} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-300">{d.type}</span>
                  <span className="text-neutral-400">
                    <strong className="text-white">{d.count}</strong> ({d.pct}%)
                  </span>
                </div>
                <div className="w-full bg-[#1E293B]/70 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          ROW 3: VULNERABILITY AGE MATRIX | VULNERABILITY TRENDS | SEVERITY DISTRIBUTION
         ───────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Vulnerability Age Matrix (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Vulnerability Age Matrix
              </h3>
              <p className="text-[10px] text-neutral-400">Track age of vulnerabilities for timely remediation</p>
            </div>
            <span className="text-[9px] font-mono text-neutral-500">Updated 2h ago</span>
          </div>

          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-[10px] font-mono text-center border-collapse">
              <thead>
                <tr className="text-neutral-500 border-b border-[#1E293B]/70">
                  <th className="text-left py-1 text-[9px]">Age Group</th>
                  <th className="py-1 text-red-400">Critical</th>
                  <th className="py-1 text-amber-400">High</th>
                  <th className="py-1 text-yellow-300">Medium</th>
                  <th className="py-1 text-emerald-400">Low</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/40">
                {[
                  { age: "< 7 Days", crit: "40", high: "446", med: "1.0k", low: "49" },
                  { age: "7-14 Days", crit: "284", high: "4.4k", med: "8.2k", low: "454" },
                  { age: "14-21 Days", crit: "106", high: "1.2k", med: "2.6k", low: "129" },
                  { age: "21-30 Days", crit: "508", high: "9.1k", med: "18k", low: "924" },
                  { age: "> 30 Days", crit: "880", high: "19k", med: "37k", low: "2.0k" },
                ].map((row) => (
                  <tr key={row.age} className="hover:bg-white/5 transition">
                    <td className="text-left py-1.5 text-neutral-300 whitespace-nowrap">{row.age}</td>
                    <td className="py-1.5 bg-red-500/20 text-red-300 font-bold">{row.crit}</td>
                    <td className="py-1.5 bg-amber-500/15 text-amber-300 font-bold">{row.high}</td>
                    <td className="py-1.5 bg-yellow-500/10 text-yellow-200">{row.med}</td>
                    <td className="py-1.5 bg-emerald-500/10 text-emerald-300">{row.low}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vulnerability Trends (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Vulnerability Trends
              </h3>
              <p className="text-[10px] text-neutral-400">Track vulnerability trends over time</p>
            </div>

            <div className="flex bg-[#04060A] p-0.5 rounded border border-[#1E293B] text-[10px] font-mono">
              {(["day", "week", "month"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setVulnTrendTime(t)}
                  className={`px-2 py-0.5 rounded capitalize transition ${
                    vulnTrendTime === t ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-neutral-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
          </div>

          <div className="flex-1 mt-2 min-h-[170px] relative">
            <svg viewBox="0 0 500 170" className="w-full h-full overflow-visible">
              {[30, 70, 110, 150].map((y) => (
                <line key={y} x1="20" y1={y} x2="490" y2={y} stroke="#1E293B" strokeDasharray="3 3" />
              ))}

              {/* Yellow Curve */}
              <path
                d="M 20 100 C 100 140, 200 145, 300 130 C 370 120, 390 30, 420 70 C 450 110, 470 140, 490 145"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="2.5"
              />
              {/* Red Curve */}
              <path
                d="M 20 135 C 100 145, 200 148, 300 140 C 370 135, 400 110, 420 115 C 450 130, 470 145, 490 148"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.2"
              />

              <circle cx="400" cy="50" r="4" fill="#FBBF24" />
              <circle cx="410" cy="112" r="4" fill="#EF4444" />

              <text x="20" y="165" fill="#64748B" fontSize="8" fontFamily="monospace">2026-05-23</text>
              <text x="140" y="165" fill="#64748B" fontSize="8" fontFamily="monospace">2026-05-25</text>
              <text x="260" y="165" fill="#64748B" fontSize="8" fontFamily="monospace">2026-05-26</text>
              <text x="380" y="165" fill="#64748B" fontSize="8" fontFamily="monospace">2026-05-27</text>
              <text x="440" y="165" fill="#64748B" fontSize="8" fontFamily="monospace">2026-05-28</text>
            </svg>
          </div>
        </div>

        {/* Severity Distribution Donut (3 Cols) */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                Severity Distribution
              </h3>
              <p className="text-[10px] text-neutral-400">Vulnerabilities as severity</p>
            </div>

            <div className="flex bg-[#04060A] p-0.5 rounded border border-[#1E293B] text-[10px] font-mono">
              <button
                onClick={() => setVulnSeverityTab("overall")}
                className={`px-2 py-0.5 rounded transition ${
                  vulnSeverityTab === "overall" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Overall
              </button>
              <button
                onClick={() => setVulnSeverityTab("unique")}
                className={`px-2 py-0.5 rounded transition ${
                  vulnSeverityTab === "unique" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Unique
              </button>
            </div>
          </div>

          <div className="relative w-44 h-44 my-auto mt-2">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* High 52% - Purple/Indigo */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#8B5CF6" strokeWidth="12" strokeDasharray="125 115" strokeDashoffset="0" />
              {/* Medium 32% - Sky */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#38BDF8" strokeWidth="12" strokeDasharray="75 165" strokeDashoffset="-125" />
              {/* Critical 10% - Red */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#EF4444" strokeWidth="12" strokeDasharray="24 216" strokeDashoffset="-200" />
              {/* Low 6% - Emerald */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="12" strokeDasharray="15 225" strokeDashoffset="-224" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold font-mono text-purple-400">High</span>
              <span className="text-[10px] font-mono text-neutral-400">52.1%</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-[10px] font-mono text-neutral-400 px-2 pt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          ROW 4: MITRE FRAMEWORK | RULES FILE TYPE DISTRIBUTION | RULE SEVERITY
         ───────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* MITRE Framework (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                MITRE Framework
              </h3>
              <p className="text-[10px] text-neutral-400">Most common tactics</p>
            </div>

            <div className="flex bg-[#04060A] p-0.5 rounded border border-[#1E293B] text-[10px] font-mono">
              <button
                onClick={() => setMitreTab("tactics")}
                className={`px-2 py-0.5 rounded transition ${
                  mitreTab === "tactics" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Tactics
              </button>
              <button
                onClick={() => setMitreTab("techniques")}
                className={`px-2 py-0.5 rounded transition ${
                  mitreTab === "techniques" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Techniques
              </button>
            </div>
          </div>

          <div className="mt-3 flex-1 flex items-end justify-between gap-3 px-2 min-h-[160px] pb-2 border-b border-[#1E293B]/60">
            {[
              { label: "Initial Access", val: "17,932", height: "92%", color: "bg-orange-500" },
              { label: "Command & Control", val: "17,496", height: "88%", color: "bg-orange-500" },
              { label: "Impact", val: "6,280", height: "35%", color: "bg-orange-600" },
              { label: "Exfiltration", val: "5,126", height: "28%", color: "bg-orange-700" },
              { label: "Resource Dev", val: "1,108", height: "12%", color: "bg-orange-800" },
            ].map((col) => (
              <div key={col.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[9px] font-mono text-neutral-300 font-bold mb-1 opacity-90 group-hover:opacity-100">
                  {col.val}
                </span>
                <div className={`w-full ${col.color} rounded-t-sm transition-all duration-300`} style={{ height: col.height }} />
                <span className="text-[8px] font-mono text-neutral-500 mt-2 truncate max-w-[55px] text-center">
                  {col.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rules File Type Distribution (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                Rules File Type Distribution
              </h3>
              <p className="text-[10px] text-neutral-400">Breakdown of file types or network protocols in use</p>
            </div>

            <div className="flex bg-[#04060A] p-0.5 rounded border border-[#1E293B] text-[10px] font-mono">
              <button
                onClick={() => setRulesFileTypeTab("fileTypes")}
                className={`px-2 py-0.5 rounded transition ${
                  rulesFileTypeTab === "fileTypes" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                File Types
              </button>
              <button
                onClick={() => setRulesFileTypeTab("protocols")}
                className={`px-2 py-0.5 rounded transition ${
                  rulesFileTypeTab === "protocols" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Protocols
              </button>
            </div>
          </div>

          <div className="relative w-44 h-44 my-auto mt-2">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Malware 48% - Orange */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#F97316" strokeWidth="12" strokeDasharray="115 125" strokeDashoffset="0" />
              {/* Phishing 17% - Amber */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#FBBF24" strokeWidth="12" strokeDasharray="40 200" strokeDashoffset="-115" />
              {/* Deleted 10% - Slate */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#64748B" strokeWidth="12" strokeDasharray="24 216" strokeDashoffset="-155" />
              {/* Info 11% - Cyan */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#38BDF8" strokeWidth="12" strokeDasharray="26 214" strokeDashoffset="-179" />
              {/* Web Apps 14% - Purple */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#A855F7" strokeWidth="12" strokeDasharray="34 206" strokeDashoffset="-205" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold font-mono text-white">75,893</span>
              <span className="text-[9px] font-mono text-neutral-400">Total Rules</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-[9px] font-mono text-neutral-400 px-1 pt-1">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Malware (48%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Phishing (17%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Info (11%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Web (14%)</span>
          </div>
        </div>

        {/* Severity Distribution Bars (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Rule Severity Distribution
              </h3>
              <p className="text-[10px] text-neutral-400">Rule severity distribution</p>
            </div>

            <div className="flex bg-[#04060A] p-0.5 rounded border border-[#1E293B] text-[10px] font-mono">
              <button
                onClick={() => setRuleSeverityTab("severity")}
                className={`px-2 py-0.5 rounded transition ${
                  ruleSeverityTab === "severity" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Severity
              </button>
              <button
                onClick={() => setRuleSeverityTab("tags")}
                className={`px-2 py-0.5 rounded transition ${
                  ruleSeverityTab === "tags" ? "bg-amber-500 text-black font-bold" : "text-neutral-400"
                }`}
              >
                Tags
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-3 font-mono text-xs flex-1">
            {[
              { level: "Major", count: "66,066", pct: 85, color: "bg-neutral-600" },
              { level: "Critical", count: "16,194", pct: 45, color: "bg-red-500" },
              { level: "Informational", count: "13,978", pct: 38, color: "bg-sky-400" },
              { level: "Minor", count: "7,417", pct: 22, color: "bg-emerald-400" },
              { level: "Unknown", count: "4,601", pct: 14, color: "bg-neutral-400" },
            ].map((s) => (
              <div key={s.level} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-300">{s.level}</span>
                  <span className="font-bold text-white">{s.count}</span>
                </div>
                <div className="w-full bg-[#1E293B]/70 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          ROW 5 (BOTTOM ROW): CIS GAUGE | INCIDENT AGE MATRIX | IOC TYPES DONUT
         ───────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Average CIS Score Gauge (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Average CIS Score
              </h3>
              <p className="text-[10px] text-neutral-400">Summary of incident severity and frequency</p>
            </div>
            <span className="text-[9px] font-mono text-neutral-500">Updated 2h ago</span>
          </div>

          {/* Semi-circular Speedometer Gauge */}
          <div className="relative w-56 h-32 my-auto mt-4">
            <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              {/* Background Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1E293B"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* 50% Active Glowing Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 100 20"
                fill="none"
                stroke="#F97316"
                strokeWidth="16"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
              />

              {/* Tick Marks & Labels */}
              <text x="18" y="118" fill="#64748B" fontSize="9" fontFamily="monospace">0%</text>
              <text x="38" y="60" fill="#64748B" fontSize="9" fontFamily="monospace">20%</text>
              <text x="56" y="22" fill="#64748B" fontSize="9" fontFamily="monospace">40%</text>
              <text x="135" y="22" fill="#64748B" fontSize="9" fontFamily="monospace">60%</text>
              <text x="156" y="60" fill="#64748B" fontSize="9" fontFamily="monospace">80%</text>
              <text x="175" y="118" fill="#64748B" fontSize="9" fontFamily="monospace">100%</text>

              {/* Needle Needle Line */}
              <line x1="100" y1="100" x2="100" y2="28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="100" r="7" fill="#F97316" />
              <circle cx="100" cy="100" r="3" fill="#FFFFFF" />
            </svg>

            {/* Score in Center */}
            <div className="absolute inset-x-0 bottom-0 text-center">
              <div className="text-2xl font-bold font-mono text-orange-400">50%</div>
              <span className="text-[10px] font-mono text-neutral-400">Average CIS Score</span>
            </div>
          </div>

          <div className="w-full pt-2 border-t border-[#1E293B] text-[10px] font-mono text-neutral-400 text-center">
            Benchmark: CIS Controls v8.1 Baseline
          </div>
        </div>

        {/* Incident Age Matrix (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                Incident Age Matrix
              </h3>
              <p className="text-[10px] text-neutral-400">Overview of incident age distribution</p>
            </div>
            <span className="text-[9px] font-mono text-neutral-500">Updated 2h ago</span>
          </div>

          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-[10px] font-mono text-center border-collapse">
              <thead>
                <tr className="text-neutral-500 border-b border-[#1E293B]/70">
                  <th className="text-left py-1 text-[9px]">Department</th>
                  <th className="py-1 text-sky-400">&lt; 7 Days</th>
                  <th className="py-1">7-14 Days</th>
                  <th className="py-1">14-21 Days</th>
                  <th className="py-1">21-30 Days</th>
                  <th className="py-1 text-purple-400">&gt; 30 Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/40">
                {[
                  { dept: "DIR", d7: "2", d14: "1", d21: "3", d30: "2", dPlus: "15" },
                  { dept: "HR", d7: "0", d14: "0", d21: "0", d30: "0", dPlus: "0" },
                  { dept: "Legal", d7: "0", d14: "0", d21: "0", d30: "0", dPlus: "0" },
                  { dept: "DevSecOps", d7: "0", d14: "0", d21: "0", d30: "0", dPlus: "0" },
                  { dept: "Purchase", d7: "0", d14: "0", d21: "0", d30: "0", dPlus: "2" },
                  { dept: "Finance", d7: "0", d14: "0", d21: "0", d30: "0", dPlus: "0" },
                  { dept: "Infra", d7: "0", d14: "0", d21: "0", d30: "0", dPlus: "134" },
                  { dept: "Others", d7: "0", d14: "0", d21: "0", d30: "1", dPlus: "2" },
                ].map((row) => (
                  <tr key={row.dept} className="hover:bg-white/5 transition">
                    <td className="text-left py-1 text-neutral-300 font-semibold">{row.dept}</td>
                    <td className="py-1 text-sky-300">{row.d7}</td>
                    <td className="py-1 text-neutral-400">{row.d14}</td>
                    <td className="py-1 text-neutral-400">{row.d21}</td>
                    <td className="py-1 text-neutral-400">{row.d30}</td>
                    <td className={`py-1 font-bold ${row.dPlus === "134" ? "bg-purple-500/20 text-purple-300" : "text-neutral-400"}`}>
                      {row.dPlus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* IOC Types Distribution Donut (3 Cols) */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-[#090D14] border border-[#1E293B] flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                IOC Types Distribution
              </h3>
              <p className="text-[10px] text-neutral-400">Proportion of different IOC types</p>
            </div>
          </div>

          <div className="relative w-44 h-44 my-auto mt-2">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* IP Address 68% - Cyan */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#06B6D4" strokeWidth="12" strokeDasharray="163 77" strokeDashoffset="0" />
              {/* File Hash 18% - Yellow */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#FBBF24" strokeWidth="12" strokeDasharray="43 197" strokeDashoffset="-163" />
              {/* URL 14% - Purple */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#A855F7" strokeWidth="12" strokeDasharray="34 206" strokeDashoffset="-206" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold font-mono text-cyan-400">IP Address</span>
              <span className="text-[10px] font-mono text-neutral-400">68.2%</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-[10px] font-mono text-neutral-400 px-2 pt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> IP Address</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> File Hash</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> URL</span>
          </div>
        </div>

      </div>

    </div>
  );
}
