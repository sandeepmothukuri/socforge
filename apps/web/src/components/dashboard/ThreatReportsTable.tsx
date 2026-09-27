"use client";

import React from "react";
import { FileText, Shield, Tag, ExternalLink } from "lucide-react";
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
        return "bg-slate-800 text-slate-300 border-slate-700";
      case "GREEN":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "AMBER":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "AMBER+STRICT":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "RED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  return (
    <div className="overflow-x-auto font-mono text-xs w-full">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#070C18] text-[#64748B] text-[10px] uppercase border-b border-[#1E293B]">
          <tr>
            <th className="p-2.5">Type</th>
            <th className="p-2.5">Dossier / Report Name</th>
            <th className="p-2.5">Author & Source</th>
            <th className="p-2.5">Ingested Date</th>
            <th className="p-2.5">TLP Marking</th>
            <th className="p-2.5">Tags & MITRE Labels</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E293B]/60">
          {reports.map((rep) => (
            <tr key={rep.id} className="hover:bg-[#151C2E] transition">
              <td className="p-2.5 whitespace-nowrap">
                <span className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#263248] text-[10px] text-[#38BDF8]">
                  {rep.type}
                </span>
              </td>
              <td className="p-2.5 font-bold text-white max-w-sm truncate">
                <Link href="/intel" className="hover:text-[#38BDF8] transition">
                  {rep.name}
                </Link>
              </td>
              <td className="p-2.5 text-[#94A3B8] whitespace-nowrap">{rep.author}</td>
              <td className="p-2.5 text-[#64748B] whitespace-nowrap">{rep.createdAt}</td>
              <td className="p-2.5 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getTlpColor(rep.tlp)}`}>
                  TLP:{rep.tlp}
                </span>
              </td>
              <td className="p-2.5">
                <div className="flex flex-wrap gap-1">
                  {rep.labels.map((lbl) => (
                    <span key={lbl} className="px-1.5 py-0.2 rounded bg-[#070C18] border border-[#263248] text-[9px] text-[#94A3B8]">
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
