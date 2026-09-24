"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Share2,
  ShieldCheck,
  Zap,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  RefreshCw
} from "lucide-react";

export default function OperationsPage() {
  const [shiftTab, setShiftTab] = useState<"handoff" | "sla" | "tuning">("handoff");
  const [handoffNotes, setHandoffNotes] = useState(
    "Day Shift Summary: Handled 14 alerts, escalated 2 critical incidents (Mimikatz DC dump & Ransomware precursor). SRV-DC01 is isolated in quarantine VLAN. Next shift duty: Monitor EDR heartbeat and oversee secondary approval for Kerberos token reset."
  );
  const [handoffSaved, setHandoffSaved] = useState(false);

  const handleSaveHandoff = () => {
    setHandoffSaved(true);
    setTimeout(() => setHandoffSaved(false), 3000);
  };

  const handleExportBrief = () => {
    const brief = `
================================================================================
SOCFORGE ENTERPRISE SHIFT HANDOFF BRIEFING
TIMESTAMP: ${new Date().toISOString()}
OUTGOING LEAD: Sandeep Mothukuri (Day Shift Commander)
INCOMING LEAD: Tier 3 Duty Officer (Night Shift Commander)
================================================================================

1. ACTIVE ESCALATED INCIDENTS:
- INC-001: Mimikatz LSASS Dump on SRV-DC01 (CRITICAL) - Host Quarantined
- INC-002: LockBit 3.0 Ransomware Precursor (HIGH) - Shadow Deletion Blocked

2. HIGH-PRIORITY OPEN ACTIONS:
- Oversee Kerberos ticket cache invalidation for affected domain identities
- Monitor perimeter firewall drop counters for IP 185.220.101.5

3. SHIFT NOTES:
${handoffNotes}

================================================================================
    `.trim();

    const blob = new Blob([brief], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOCForge-Shift-Handoff-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                SOC Operations, Shift Handoff & SLA Hub
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-normal">
                  Day $\to$ Night Active
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                Shift changeover briefings, escalation velocity SLAs & detection noise tuning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={handleExportBrief}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151C2E] border border-[#263248] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition"
            >
              <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
              Export Shift Brief
            </button>
          </div>
        </header>

        {/* Sub-Nav Tabs */}
        <div className="px-6 border-b border-[#263248] bg-[#0F172A] flex items-center gap-4 text-xs font-mono">
          {[
            { key: "handoff", label: "Shift Changeover Brief", icon: FileText },
            { key: "sla", label: "Escalation Velocity & SLAs", icon: TrendingUp },
            { key: "tuning", label: "False Positive Tuning", icon: SlidersHorizontal },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setShiftTab(t.key as any)}
                className={`py-3 flex items-center gap-2 border-b-2 font-semibold transition ${
                  shiftTab === t.key
                    ? "border-[#38BDF8] text-[#38BDF8]"
                    : "border-transparent text-[#94A3B8] hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {shiftTab === "handoff" && (
            <div className="space-y-6 max-w-4xl">
              {/* Shift Roster Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-1">
                  <span className="text-[#64748B] text-[10px] uppercase block">CURRENT SHIFT</span>
                  <div className="text-base font-bold text-white">Day Shift (Alpha)</div>
                  <span className="text-emerald-400">08:00 - 16:00 Local</span>
                </div>
                <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-1">
                  <span className="text-[#64748B] text-[10px] uppercase block">SHIFT COMMANDER</span>
                  <div className="text-base font-bold text-[#38BDF8]">Sandeep Mothukuri</div>
                  <span className="text-[#94A3B8]">Lead SecOps Architect</span>
                </div>
                <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-1">
                  <span className="text-[#64748B] text-[10px] uppercase block">INCOMING RELIEF</span>
                  <div className="text-base font-bold text-purple-400">Night Shift (Bravo)</div>
                  <span className="text-purple-300">16:00 - 00:00 Local</span>
                </div>
              </div>

              {/* Critical Handover Items */}
              <div className="p-5 rounded-2xl bg-[#0E1626] border border-[#263248] space-y-4 font-mono text-xs">
                <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Active P1/P2 Escalations Pending Relief Oversight
                </h3>

                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[#0B1020] border border-red-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-red-400 font-bold block">INC-001: Mimikatz LSASS Dump on SRV-DC01</span>
                      <span className="text-[#94A3B8] text-[11px]">Status: Quarantined • Action needed: Authorize secondary Kerberos flush</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase">
                      CRITICAL P1
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0B1020] border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-amber-400 font-bold block">INC-002: LockBit 3.0 Ransomware Precursor</span>
                      <span className="text-[#94A3B8] text-[11px]">Status: Investigating • Action needed: Review dropped DLL binary hashes</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">
                      HIGH P2
                    </span>
                  </div>
                </div>
              </div>

              {/* Handoff Notes Editor */}
              <div className="p-5 rounded-2xl bg-[#0E1626] border border-[#263248] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white uppercase tracking-wider">
                    Shift Commander Operational Notes
                  </h3>
                  {handoffSaved && (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved to shift database
                    </span>
                  )}
                </div>

                <textarea
                  value={handoffNotes}
                  onChange={(e) => setHandoffNotes(e.target.value)}
                  rows={4}
                  className="w-full p-4 bg-[#070C18] border border-[#263248] rounded-xl font-mono text-xs text-[#F8FAFC] leading-relaxed focus:outline-none focus:border-[#38BDF8]"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveHandoff}
                    className="px-4 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] font-bold text-xs hover:bg-[#0284C7] transition"
                  >
                    Save Handoff Log
                  </button>
                </div>
              </div>
            </div>
          )}

          {shiftTab === "sla" && (
            <div className="space-y-6 max-w-4xl font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-2">
                  <span className="text-[#64748B] text-[10px] uppercase block">TIER 1 TRIAGE TIME</span>
                  <div className="text-2xl font-bold text-emerald-400">1.8 min</div>
                  <div className="text-[11px] text-[#94A3B8]">SLA Target: &lt; 5.0 min (100% compliant)</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-2">
                  <span className="text-[#64748B] text-[10px] uppercase block">TIER 2 INVESTIGATION TIME</span>
                  <div className="text-2xl font-bold text-emerald-400">8.4 min</div>
                  <div className="text-[11px] text-[#94A3B8]">SLA Target: &lt; 20.0 min (98% compliant)</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-2">
                  <span className="text-[#64748B] text-[10px] uppercase block">TIER 3 CONTAINMENT SPEED</span>
                  <div className="text-2xl font-bold text-[#38BDF8]">14.2 min</div>
                  <div className="text-[11px] text-[#94A3B8]">SLA Target: &lt; 30.0 min (100% compliant)</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0E1626] border border-[#263248] space-y-3">
                <h3 className="font-bold text-white uppercase tracking-wider">
                  Escalation Funnel & Conversion Rates (Last 7 Days)
                </h3>
                <div className="space-y-3 text-[11px]">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B1020] border border-[#263248]">
                    <span>Total Ingested Security Events:</span>
                    <strong className="text-white">12,840,000 events</strong>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B1020] border border-[#263248]">
                    <span>Alerts Triggered (Detection Rules):</span>
                    <strong className="text-[#38BDF8]">142 alerts (0.0011% filter rate)</strong>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B1020] border border-[#263248]">
                    <span>Escalated to Formal Investigations:</span>
                    <strong className="text-purple-400">18 cases (12.6%)</strong>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B1020] border border-[#263248]">
                    <span>Confirmed High/Critical Incidents:</span>
                    <strong className="text-red-400">4 incidents (2.8%)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {shiftTab === "tuning" && (
            <div className="space-y-6 max-w-4xl font-mono text-xs">
              <div className="p-5 rounded-2xl bg-[#0E1626] border border-[#263248] space-y-3">
                <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#38BDF8]" />
                  Automated False Positive Tuning Recommendations
                </h3>
                <p className="text-[#94A3B8] text-[11px]">
                  The engine identified 2 noisy detection rules with high benign match frequency. Apply recommended whitelist exclusions below:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl bg-[#0B1020] border border-[#263248] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Rule: T1059.001 (PowerShell Script Block Execution)</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        18 False Positives / 24h
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      Triggered by legitimate SCCM Configuration Manager scheduled health script on client endpoints.
                    </div>
                    <div className="p-2.5 rounded bg-[#070C18] border border-[#263248] text-emerald-400 text-[10px]">
                      Recommended Whitelist Exclusion: <code>CommandLine NOT LIKE &quot;*C:\\Windows\\CCM\\*&quot;</code>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B1020] border border-[#263248] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Rule: T1078.002 (Domain Account Reconnaissance)</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        12 False Positives / 24h
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      Triggered by Qualys Vulnerability Scanner service account <code>svc_qualys_scan</code>.
                    </div>
                    <div className="p-2.5 rounded bg-[#070C18] border border-[#263248] text-emerald-400 text-[10px]">
                      Recommended Whitelist Exclusion: <code>User != &quot;svc_qualys_scan&quot;</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
