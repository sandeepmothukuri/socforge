"use client";

import React from "react";
import { FileText, Shield, Tag, ExternalLink, Calendar, User } from "lucide-react";
import Link from "next/link";

interface ThreatReportItem {
  id: string;
  type: string;
  name: string;
  author: string;
  createdAt: string;
  tlp: "CLEAR" | "GREEN" | "AMBER" | "AMBER+STRICT" | "RED";
  status: "ANALYZED" | "IN_PROGRESS" | "NEW";
  labels: string[];
}

const DEFAULT_REPORTS: ThreatReportItem[] = [
  {
    id: "rep-1",
    type: "Threat Advisory",
    name: "Volt Typhoon Pre-Positioning in Critical Infrastructure Edge Routers",
    author: "CISA / NSA / FBI Joint Advisory",
    createdAt: "2026-09-26",
    tlp: "CLEAR",
    status: "ANALYZED",
    labels: ["APT", "Living-off-the-Land", "T1059.001", "C2-Proxy"]
  },
  {
    id: "rep-2",
    type: "Malware Analysis",
    name: "DarkGate v6.2 In-Memory Loader & Process Hollowing Dissection",
    author: "SOCForge Intel Lab",
    createdAt: "2026-09-25",
    tlp: "AMBER",
    status: "ANALYZED",
    labels: ["Malware", "Evasion", "T1055", "Process Injection"]
  },
  {
    id: "rep-3",
    type: "Intrusion Incident",
    name: "LockBit 3.0 Ransomware Campaign Targeting Healthcare Subnets",
    author: "Mandiant / RecordedFuture Feed",
    createdAt: "2026-09-24",
    tlp: "AMBER+STRICT",
    status: "IN_PROGRESS",
    labels: ["Ransomware", "Impact", "T1486", "T1490"]
  },
  {
    id: "rep-4",
    type: "Campaign Dossier",
    name: "APT29 Midnight Blizzard OAuth Consent Replay & Exfiltration",
    author: "Microsoft MSTIC",
    createdAt: "2026-09-23",
    tlp: "CLEAR",
    status: "ANALYZED",
    labels: ["Identity", "OAuth Abuse", "T1098.005", "Cloud SaaS"]
  }
];

export function ThreatReportsTable({ reports = DEFAULT_REPORTS }: { reports?: ThreatReportItem[] }) {
  const getTlpColor = (tlp: ThreatReportItem["tlp"]) => {
    switch (tlp) {
      case "CLEAR":
        return "bg-neutral-900 text-neutral-300 border-neutral-800";
      case "GREEN":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "AMBER":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "AMBER+STRICT":
        return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "RED":
        return "bg-red-500/15 text-red-400 border-red-500/30";
    }
  };

  return (
    <div className="overflow-x-auto font-sans text-xs w-full">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#000000] text-neutral-400 text-[11px] font-semibold uppercase tracking-wider border-b border-neutral-800">
          <tr>
            <th className="p-3">Category</th>
            <th className="p-3">Dossier / Report Title</th>
            <th className="p-3">Author & Feed Source</th>
            <th className="p-3">Ingested</th>
            <th className="p-3">TLP Classification</th>
            <th className="p-3">MITRE TTP Tags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {reports.map((rep) => (
            <tr key={rep.id} className="hover:bg-neutral-900/50 transition-colors">
              <td className="p-3 whitespace-nowrap">
                <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] font-medium text-white">
                  {rep.type}
                </span>
              </td>
              <td className="p-3 font-medium text-white max-w-sm truncate">
                <Link href="/intel" className="hover:text-emerald-400 transition-colors font-semibold">
                  {rep.name}
                </Link>
              </td>
              <td className="p-3 text-neutral-300 whitespace-nowrap">{rep.author}</td>
              <td className="p-3 text-neutral-400 font-mono text-[11px] whitespace-nowrap">{rep.createdAt}</td>
              <td className="p-3 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold ${getTlpColor(rep.tlp)}`}>
                  TLP:{rep.tlp}
                </span>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1.5">
                  {rep.labels.map((lbl) => (
                    <span key={lbl} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 font-mono">
                      {lbl}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
