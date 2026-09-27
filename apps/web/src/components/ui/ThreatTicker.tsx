"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  AlertTriangle,
  Radio,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Bell,
  X
} from "lucide-react";

interface ThreatBulletin {
  id: string;
  severity: "CRITICAL" | "ZERO_DAY" | "HIGH";
  title: string;
  source: string;
  time: string;
  cve?: string;
  actor?: string;
}

const LIVE_BULLETINS: ThreatBulletin[] = [
  {
    id: "cve-2026-3192",
    severity: "ZERO_DAY",
    title: "CISA KEV: Active In-The-Wild Exploitation of Ivanti Connect Secure VPN RCE",
    source: "CISA KEV Catalog",
    time: "4m ago",
    cve: "CVE-2026-3192",
    actor: "Volt Typhoon (UNC3886)"
  },
  {
    id: "apt29-oauth",
    severity: "CRITICAL",
    title: "APT29 (Midnight Blizzard) spear-phishing campaign leveraging OAuth app credentials",
    source: "Microsoft MSTIC",
    time: "18m ago",
    actor: "APT29 (Midnight Blizzard)"
  },
  {
    id: "lockbit-3",
    severity: "CRITICAL",
    title: "LockBit 3.0 Ransomware distributing updated Linux ESXi payload with automated shadow deletion",
    source: "FBI Flash Advisory",
    time: "42m ago",
    cve: "CVE-2024-1753",
    actor: "LockBit 3.0"
  },
  {
    id: "cve-2026-1188",
    severity: "HIGH",
    title: "Linux Kernel eBPF Subsystem Local Privilege Escalation disclosed with public PoC",
    source: "NVD Exploit-DB",
    time: "1h ago",
    cve: "CVE-2026-1188"
  },
  {
    id: "fortinet-advisory",
    severity: "HIGH",
    title: "FortiOS SSL-VPN authentication bypass actively probed across European energy infrastructure",
    source: "ENISA Alert",
    time: "2h ago",
    cve: "CVE-2024-21762",
    actor: "Sandworm Team"
  }
];

export function ThreatTicker() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  if (isDismissed) return null;

  const getBadgeStyle = (severity: string) => {
    switch (severity) {
      case "ZERO_DAY":
        return "bg-purple-950/70 text-purple-300 border-purple-500/40 animate-pulse";
      case "CRITICAL":
        return "bg-rose-950/70 text-rose-300 border-rose-500/40";
      default:
        return "bg-amber-950/70 text-amber-300 border-amber-500/40";
    }
  };

  return (
    <div className="relative w-full h-8 bg-[#030303] border-b border-[#1f1f1f] flex items-center overflow-hidden z-20 text-[11px] font-mono select-none">
      {/* Static Left Header Badge */}
      <div className="flex items-center gap-1.5 px-3 h-full bg-[#080808] border-r border-[#1f1f1f] text-neutral-300 font-bold z-10 flex-shrink-0 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span className="text-white uppercase tracking-wider text-[10px] hidden sm:inline">CTI LIVE FEED</span>
        <span className="text-neutral-500 text-[10px]">|</span>
      </div>

      {/* Marquee Container */}
      <div
        className="flex-1 overflow-hidden relative flex items-center h-full cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`flex items-center gap-8 whitespace-nowrap will-change-transform ${
            isPaused ? "" : "animate-[marquee_35s_linear_infinite]"
          }`}
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {/* Repeat twice for continuous loop */}
          {[...LIVE_BULLETINS, ...LIVE_BULLETINS].map((item, idx) => (
            <Link
              key={`${item.id}-${idx}`}
              href="/intel"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
            >
              <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${getBadgeStyle(item.severity)}`}>
                {item.severity === "ZERO_DAY" ? "⚡ ZERO-DAY" : item.severity}
              </span>
              <span className="text-neutral-200 group-hover:underline decoration-neutral-600 underline-offset-2">
                {item.title}
              </span>
              {item.cve && (
                <span className="text-rose-400 font-bold bg-[#121212] px-1 rounded border border-[#262626]">
                  {item.cve}
                </span>
              )}
              {item.actor && (
                <span className="text-neutral-400 bg-[#121212] px-1 rounded border border-[#262626]">
                  [{item.actor}]
                </span>
              )}
              <span className="text-neutral-600 font-normal">({item.time})</span>
              <span className="text-neutral-700">✦</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="px-2.5 h-full flex items-center justify-center text-neutral-500 hover:text-white bg-[#080808] border-l border-[#1f1f1f] transition-colors flex-shrink-0"
        title="Hide Threat Ticker"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default ThreatTicker;
