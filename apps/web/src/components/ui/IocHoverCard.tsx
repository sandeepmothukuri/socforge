"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Globe,
  Hash,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Radio,
  Server,
  Crosshair,
  ShieldCheck,
  Zap,
  ChevronRight
} from "lucide-react";

export type IocType = "ip" | "domain" | "hash" | "cve" | "user" | "process";

export interface IocHoverCardProps {
  value: string;
  type?: IocType;
  children?: React.ReactNode;
  className?: string;
}

interface EnrichmentData {
  value: string;
  type: IocType;
  reputation: "malicious" | "suspicious" | "clean" | "unknown";
  score: number; // 0-100
  detectionRatio: string;
  asn?: string;
  geo?: { country: string; flag: string; city: string };
  threatActors?: string[];
  mitreTechniques?: string[];
  firstSeen?: string;
  lastSeen?: string;
  engineBreakdown?: { vendor: string; result: string }[];
}

// Generate realistic dynamic enrichment data based on IOC string
function getEnrichmentData(value: string, type?: IocType): EnrichmentData {
  const inferredType: IocType =
    type ||
    (value.startsWith("CVE-")
      ? "cve"
      : /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value)
      ? "ip"
      : /^[a-fA-F0-9]{32,64}$/.test(value)
      ? "hash"
      : value.includes(".") && !value.endsWith(".exe")
      ? "domain"
      : value.endsWith(".exe") || value.endsWith(".dll")
      ? "process"
      : "user");

  if (inferredType === "ip") {
    const isLocal = value.startsWith("192.168.") || value.startsWith("10.") || value.startsWith("172.");
    if (isLocal) {
      return {
        value,
        type: "ip",
        reputation: "suspicious",
        score: 65,
        detectionRatio: "Internal RFC1918 Host",
        asn: "Enterprise Core LAN (VLAN 402)",
        geo: { country: "Internal DC", flag: "🏢", city: "Sector-7 On-Prem" },
        threatActors: ["Potential Lateral Ingress"],
        mitreTechniques: ["T1021.002", "T1078"],
        firstSeen: "2026-09-26 18:30:12 UTC",
        lastSeen: "2026-09-27 07:15:00 UTC",
      };
    }
    return {
      value,
      type: "ip",
      reputation: "malicious",
      score: 92,
      detectionRatio: "58/72 Engines (VirusTotal / AbuseIPDB)",
      asn: "AS13335 Cloudflare, Inc. / Bulletproof Proxy",
      geo: { country: "Netherlands", flag: "🇳🇱", city: "Amsterdam" },
      threatActors: ["APT29 (Cozy Bear)", "Midnight Blizzard"],
      mitreTechniques: ["T1071.001", "T1573", "T1090.003"],
      firstSeen: "2026-09-24 03:12:44 UTC",
      lastSeen: "2026-09-27 12:44:20 UTC",
      engineBreakdown: [
        { vendor: "CrowdStrike", result: "C2 / Beaconing Endpoint" },
        { vendor: "Microsoft Defender", result: "Backdoor:Win64/CobaltStrike" },
        { vendor: "Kaspersky", result: "Trojan.Agent.Generic" },
        { vendor: "AbuseIPDB", result: "Confidence Score: 100%" }
      ]
    };
  }

  if (inferredType === "hash") {
    return {
      value,
      type: "hash",
      reputation: "malicious",
      score: 98,
      detectionRatio: "68/72 Engines (VirusTotal)",
      asn: "SHA-256 Authentihash Verified",
      threatActors: ["LockBit 3.0", "BlackCat / ALPHV"],
      mitreTechniques: ["T1059.001", "T1003.001", "T1486"],
      firstSeen: "2026-09-25 11:20:00 UTC",
      lastSeen: "2026-09-27 09:12:00 UTC",
      engineBreakdown: [
        { vendor: "SentinelOne", result: "Ransom.Lockbit.Win64" },
        { vendor: "Palo Alto", result: "Malicious PE Injector" },
        { vendor: "Sophos", result: "Troj/Stl-A" }
      ]
    };
  }

  if (inferredType === "domain") {
    return {
      value,
      type: "domain",
      reputation: "malicious",
      score: 88,
      detectionRatio: "44/70 Engines (Passive DNS)",
      asn: "AS20940 Fastly CDN / Dynamic DNS",
      geo: { country: "Switzerland", flag: "🇨🇭", city: "Zurich" },
      threatActors: ["Volt Typhoon", "Storm-0558"],
      mitreTechniques: ["T1071.001", "T1566.002"],
      firstSeen: "2026-09-20 14:00:00 UTC",
      lastSeen: "2026-09-27 11:30:00 UTC",
    };
  }

  if (inferredType === "cve") {
    return {
      value,
      type: "cve",
      reputation: "malicious",
      score: 98,
      detectionRatio: "CVSS v3.1: 9.8 (CRITICAL)",
      asn: "NVD / NIST ExploitDB Verified",
      threatActors: ["Actively Exploited In-The-Wild (KEV)"],
      mitreTechniques: ["T1190", "T1068", "T1210"],
      firstSeen: "2026-01-15 00:00:00 UTC",
      lastSeen: "2026-09-27 12:00:00 UTC",
    };
  }

  return {
    value,
    type: inferredType,
    reputation: "suspicious",
    score: 75,
    detectionRatio: "Internal Telemetry Correlated",
    threatActors: ["Suspicious Entity"],
    mitreTechniques: ["T1078", "T1059"],
    firstSeen: "2026-09-27 00:00:00 UTC",
    lastSeen: "2026-09-27 12:00:00 UTC",
  };
}

export function IocHoverCard({ value, type, children, className }: IocHoverCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const data = getEnrichmentData(value, type);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 250);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-rose-400 bg-rose-500/15 border-rose-500/30";
    if (score >= 50) return "text-amber-400 bg-amber-500/15 border-amber-500/30";
    return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
  };

  return (
    <span
      className="relative inline-flex items-center group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger text / node */}
      <span
        className={`font-mono transition-colors duration-150 underline decoration-dotted decoration-neutral-600 underline-offset-4 hover:text-white hover:decoration-rose-500 ${className || ""}`}
      >
        {children || value}
      </span>

      {/* Instant Threat Enrichment Hover Card */}
      {isVisible && (
        <div
          className="absolute z-50 bottom-full left-0 mb-2 w-96 p-4 rounded-xl bg-[#050505] border border-[#262626] shadow-[0_20px_50px_rgba(0,0,0,0.95)] text-left text-xs pointer-events-auto backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#121212] border border-[#262626] flex items-center justify-center text-rose-400">
                {data.type === "ip" && <Globe className="w-3.5 h-3.5" />}
                {data.type === "domain" && <Radio className="w-3.5 h-3.5" />}
                {data.type === "hash" && <Hash className="w-3.5 h-3.5" />}
                {data.type === "cve" && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                {data.type === "process" && <FileCode className="w-3.5 h-3.5 text-neutral-300" />}
                {data.type === "user" && <Crosshair className="w-3.5 h-3.5 text-neutral-300" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    {data.type} IOC
                  </span>
                  {data.geo && (
                    <span className="text-xs" title={`${data.geo.city}, ${data.geo.country}`}>
                      {data.geo.flag}
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono font-semibold text-white truncate max-w-[180px]" title={data.value}>
                  {data.value}
                </div>
              </div>
            </div>

            {/* Risk Score Pill */}
            <div className={`px-2 py-0.5 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1 ${getScoreColor(data.score)}`}>
              <ShieldAlert className="w-3 h-3" />
              {data.score}/100
            </div>
          </div>

          {/* Details Body */}
          <div className="py-3 space-y-2 border-b border-[#1f1f1f]">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px]">Detection Engine:</span>
              <span className="text-[11px] font-mono text-neutral-200 font-medium">
                {data.detectionRatio}
              </span>
            </div>

            {data.asn && (
              <div className="flex items-start justify-between gap-2 text-neutral-400">
                <span className="text-[11px] whitespace-nowrap">Origin / ASN:</span>
                <span className="text-[11px] font-mono text-neutral-300 text-right truncate max-w-[200px]" title={data.asn}>
                  {data.asn}
                </span>
              </div>
            )}

            {/* Threat Actors & Attribution */}
            {data.threatActors && data.threatActors.length > 0 && (
              <div className="pt-1">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                  Threat Actor Attribution
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.threatActors.map((actor) => (
                    <span
                      key={actor}
                      className="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-800/40 text-[10px] font-mono font-medium"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* MITRE ATT&CK Mapping */}
            {data.mitreTechniques && data.mitreTechniques.length > 0 && (
              <div className="pt-1">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                  MITRE ATT&CK Techniques
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.mitreTechniques.map((tech) => (
                    <span
                      key={tech}
                      className="px-1.5 py-0.5 rounded bg-[#171717] text-neutral-300 border border-[#262626] text-[10px] font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-3 flex items-center justify-between gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121212] hover:bg-[#1a1a1a] text-neutral-300 hover:text-white border border-[#262626] text-[11px] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy IOC"}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <Link
                href={`/hunts?query=${encodeURIComponent(data.value)}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-[#262626] text-[11px] font-medium transition-colors"
              >
                <Crosshair className="w-3 h-3 text-neutral-400" />
                <span>Threat Hunt</span>
              </Link>

              <Link
                href={`/responses?target=${encodeURIComponent(data.value)}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium transition-colors shadow-sm"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Contain</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

export default IocHoverCard;
