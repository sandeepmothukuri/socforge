"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, ExternalLink, Flame } from "lucide-react";
import Link from "next/link";

interface VulnerabilityItem {
  cveId: string;
  count: number;
  cvss: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  affectedProduct: string;
  hasSigmaDetection: boolean;
}

const DEFAULT_CVES: VulnerabilityItem[] = [
  { cveId: "CVE-2024-1709", count: 49, cvss: 10.0, severity: "CRITICAL", affectedProduct: "ConnectWise ScreenConnect Auth Bypass", hasSigmaDetection: true },
  { cveId: "CVE-2024-1708", count: 49, cvss: 8.4, severity: "HIGH", affectedProduct: "ConnectWise ScreenConnect Path Traversal", hasSigmaDetection: true },
  { cveId: "CVE-2023-46805", count: 48, cvss: 8.2, severity: "HIGH", affectedProduct: "Ivanti Connect Secure Auth Bypass", hasSigmaDetection: true },
  { cveId: "CVE-2024-21887", count: 48, cvss: 9.1, severity: "CRITICAL", affectedProduct: "Ivanti Policy Secure Command Injection", hasSigmaDetection: true },
  { cveId: "CVE-2023-36525", count: 40, cvss: 7.8, severity: "HIGH", affectedProduct: "Microsoft Outlook NTLM Relay", hasSigmaDetection: true },
  { cveId: "CVE-2024-21893", count: 40, cvss: 8.2, severity: "HIGH", affectedProduct: "Ivanti SAML Component SSRF", hasSigmaDetection: true },
  { cveId: "CVE-2023-22515", count: 39, cvss: 9.8, severity: "CRITICAL", affectedProduct: "Atlassian Confluence Privilege Escalation", hasSigmaDetection: true },
  { cveId: "CVE-2022-0185", count: 39, cvss: 8.4, severity: "HIGH", affectedProduct: "Linux Kernel Heap Buffer Overflow", hasSigmaDetection: true }
];

export function TopVulnerabilitiesCard({ items = DEFAULT_CVES }: { items?: VulnerabilityItem[] }) {
  return (
    <div className="space-y-2 text-xs font-sans overflow-y-auto max-h-[300px] pr-1">
      {items.map((cve) => (
        <div
          key={cve.cveId}
          className="p-2.5 rounded-xl bg-[#050505] border border-neutral-800/80 hover:border-sky-500/40 hover:bg-neutral-900/60 transition-all duration-150 flex items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-xs tracking-tight">{cve.cveId}</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                    cve.severity === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  CVSS {cve.cvss}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 truncate mt-0.5">{cve.affectedProduct}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-mono text-xs font-bold text-sky-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              {cve.count}
            </span>
            <Link
              href="/detections"
              title="View Detection Rule"
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
