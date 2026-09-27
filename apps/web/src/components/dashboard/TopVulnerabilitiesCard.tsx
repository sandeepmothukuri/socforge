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
    <div className="space-y-1.5 font-mono text-xs overflow-y-auto max-h-[300px] pr-1">
      {items.map((cve) => (
        <div
          key={cve.cveId}
          className="p-2 rounded-lg bg-[#070C18] border border-[#1E293B] hover:border-[#38BDF8]/40 transition flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-[11px]">{cve.cveId}</span>
                <span
                  className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                    cve.severity === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  CVSS {cve.cvss}
                </span>
              </div>
              <div className="text-[10px] text-[#64748B] truncate">{cve.affectedProduct}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-bold text-[#38BDF8]">{cve.count}</span>
            <Link
              href="/detections"
              title="View Detection Rule"
              className="p-1 rounded bg-[#111827] text-[#64748B] hover:text-white"
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
