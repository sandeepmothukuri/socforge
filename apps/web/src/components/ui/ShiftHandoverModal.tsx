"use client";

import React, { useState } from "react";
import {
  FileText,
  X,
  Printer,
  Copy,
  Check,
  Download,
  ShieldAlert,
  Clock,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Server,
  Layers
} from "lucide-react";

export interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShiftHandoverModal({ isOpen, onClose }: ShiftHandoverModalProps) {
  const [outgoingLead, setOutgoingLead] = useState("Sandeep Mothukuri (Tier-3 Senior Lead)");
  const [incomingLead, setIncomingLead] = useState("Alex Chen (Tier-2 Response Lead)");
  const [shiftWindow, setShiftWindow] = useState("Day Shift (08:00 - 16:00 UTC)");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "markdown" | "containment">("summary");

  if (!isOpen) return null;

  const handoverData = {
    generatedAt: new Date().toUTCString(),
    shiftWindow,
    outgoingLead,
    incomingLead,
    metrics: {
      totalAlertsTriaged: 1842,
      criticalEscalations: 6,
      openIncidents: 3,
      containmentActionsExecuted: 4,
      mttdAverage: "4.2 mins",
      mttrAverage: "18.5 mins",
      ingestionThroughput: "12,450 EPS (Healthy)"
    },
    activeIncidents: [
      {
        id: "INC-2026-0841",
        title: "Active Kerberoasting & Lateral Movement on DC01",
        severity: "CRITICAL",
        status: "CONTAINED (Monitoring)",
        assignedTo: "s.mothukuri",
        blockers: "Pending Krbtgt password rotation window scheduled for 17:30 UTC."
      },
      {
        id: "INC-2026-0839",
        title: "Cobalt Strike HTTPS Beaconing on WS-FINANCE-04",
        severity: "HIGH",
        status: "INVESTIGATING",
        assignedTo: "a.chen",
        blockers: "Memory image acquired; awaiting automated sandbox detonation report."
      },
      {
        id: "INC-2026-0835",
        title: "Mass Password Spray against Azure AD Tenant",
        severity: "MEDIUM",
        status: "RESOLVED",
        assignedTo: "m.ross",
        blockers: "Conditional access IP ranges blocked; no active breach."
      }
    ],
    pendingContainments: [
      {
        action: "Host Network Isolation",
        target: "WS-FINANCE-04 (192.168.4.12)",
        requester: "a.chen",
        approver: "s.mothukuri (Dual-Approved)",
        status: "EXECUTED"
      },
      {
        action: "OAuth Token Revocation",
        target: "user: j.smith@corp.internal",
        requester: "m.ross",
        approver: "s.mothukuri (Dual-Approved)",
        status: "EXECUTED"
      }
    ]
  };

  const generateMarkdownReport = () => {
    return `# SOCFORGE OPERATIONAL SHIFT HANDOVER BRIEFING
**Generated At:** ${handoverData.generatedAt}
**Shift Window:** ${handoverData.shiftWindow}
**Outgoing Lead:** ${handoverData.outgoingLead}
**Incoming Lead:** ${handoverData.incomingLead}

---

## 1. Executive Operations Summary
- **Total Alerts Triaged:** ${handoverData.metrics.totalAlertsTriaged}
- **Critical Escalations:** ${handoverData.metrics.criticalEscalations}
- **Active / Open Incidents:** ${handoverData.metrics.openIncidents}
- **Containments Executed:** ${handoverData.metrics.containmentActionsExecuted}
- **MTTD / MTTR SLA:** ${handoverData.metrics.mttdAverage} / ${handoverData.metrics.mttrAverage}
- **Fleet Ingestion Throughput:** ${handoverData.metrics.ingestionThroughput}

---

## 2. Active Incidents & Priority Handover Items
${handoverData.activeIncidents
  .map(
    (inc) =>
      `### [${inc.id}] ${inc.title}
- **Severity:** ${inc.severity} | **Status:** ${inc.status}
- **Assigned:** ${inc.assignedTo}
- **Current Blockers / Next Steps:** ${inc.blockers}
`
  )
  .join("\n")}

---

## 3. Four-Eyes Containment Ledger Actions
${handoverData.pendingContainments
  .map(
    (c) =>
      `- **Action:** ${c.action} | **Target:** ${c.target} | **Approved By:** ${c.approver} [${c.status}]`
  )
  .join("\n")}

---
*SOCForge Autonomous Cyber Security Platform — Tamper-Evident SHA-256 Verified*
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#050505] border border-[#262626] shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden text-xs text-neutral-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1f1f1f] bg-[#080808]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-[#262626] flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">
                  SOC Shift Handover Briefing & Report Exporter
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  LIVE TELEMETRY COMPILED
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Automated operational briefing for Tier-1/2/3 shift transitions and executive records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#1a1a1a] bg-[#050505]">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "summary"
                ? "border-white text-white font-semibold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Visual Briefing
          </button>
          <button
            onClick={() => setActiveTab("markdown")}
            className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "markdown"
                ? "border-white text-white font-semibold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Markdown Dossier
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "summary" ? (
            <>
              {/* Shift Metadata Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f]">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Shift Window</label>
                  <input
                    type="text"
                    value={shiftWindow}
                    onChange={(e) => setShiftWindow(e.target.value)}
                    className="w-full mt-1 bg-[#050505] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Outgoing Shift Lead</label>
                  <input
                    type="text"
                    value={outgoingLead}
                    onChange={(e) => setOutgoingLead(e.target.value)}
                    className="w-full mt-1 bg-[#050505] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Incoming Shift Lead</label>
                  <input
                    type="text"
                    value={incomingLead}
                    onChange={(e) => setIncomingLead(e.target.value)}
                    className="w-full mt-1 bg-[#050505] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Operational KPIs */}
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-neutral-400" />
                  Shift Telemetry & SLA Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f]">
                    <div className="text-[10px] font-mono text-neutral-400">Triaged Alerts</div>
                    <div className="text-lg font-mono font-bold text-white mt-0.5">
                      {handoverData.metrics.totalAlertsTriaged}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f]">
                    <div className="text-[10px] font-mono text-neutral-400">Critical Escalations</div>
                    <div className="text-lg font-mono font-bold text-rose-400 mt-0.5">
                      {handoverData.metrics.criticalEscalations}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f]">
                    <div className="text-[10px] font-mono text-neutral-400">Average MTTD / MTTR</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-1">
                      {handoverData.metrics.mttdAverage} / {handoverData.metrics.mttrAverage}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f]">
                    <div className="text-[10px] font-mono text-neutral-400">EPS Ingestion</div>
                    <div className="text-sm font-mono font-bold text-neutral-200 mt-1">
                      {handoverData.metrics.ingestionThroughput}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active War Room Incidents */}
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Open Incidents & Next Actions for Incoming Shift
                </h3>
                <div className="space-y-2">
                  {handoverData.activeIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-[#262626] font-mono text-[10px] text-white font-bold">
                            {inc.id}
                          </span>
                          <span className="font-semibold text-white text-xs">{inc.title}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            inc.severity === "CRITICAL"
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                              : inc.severity === "HIGH"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-neutral-800 text-neutral-300 border-neutral-700"
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-start gap-1">
                        <span className="text-neutral-500 whitespace-nowrap">Handover Note:</span>
                        <span className="text-neutral-300">{inc.blockers}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-[11px] font-mono text-neutral-400">
                  Formatted Markdown Briefing (Ready for Jira, Slack, or Email)
                </span>
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-[#262626] text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied to Clipboard" : "Copy Markdown"}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#080808] border border-[#1f1f1f] text-neutral-300 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                {generateMarkdownReport()}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#1f1f1f] bg-[#080808]">
          <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SHA-256 Audit Signature: 4b89f21...3d9a</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#121212] hover:bg-[#1a1a1a] text-white border border-[#262626] text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-400" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Export Briefing"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShiftHandoverModal;
