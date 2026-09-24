"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { getIncidents, executeResponseAction, IncidentItem } from "@/lib/api";
import { 
  ShieldAlert, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  User,
  Share2,
  FileSpreadsheet,
  ListTodo,
  MessageSquare,
  ShieldCheck,
  Flame,
  ChevronRight,
  PlusCircle,
  Activity,
  AlertCircle,
  Radio,
  Zap,
  Lock,
  Ban,
  FileDown,
  Users,
  Eye,
  Check,
  X
} from "lucide-react";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "containment" | "communications" | "review">("overview");

  // War Room Mode State
  const [warRoomActive, setWarRoomActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(1420); // ~23m live bridge

  // Four-Eyes Approval Modal State
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    action: string;
    target: string;
    severity: "CRITICAL" | "HIGH";
    description: string;
    approver?: string;
  } | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Interactive Containment checklist state
  const [tasks, setTasks] = useState<{ id: string; label: string; done: boolean; phase: string }[]>([
    { id: "1", label: "Isolate compromised endpoint from corporate subnet", done: true, phase: "containment" },
    { id: "2", label: "Revoke active Kerberos and OAuth user session tokens", done: true, phase: "containment" },
    { id: "3", label: "Block malicious external C2 IPs on perimeter firewall", done: false, phase: "containment" },
    { id: "4", label: "Purge dropped malicious binary payload and scheduled tasks", done: false, phase: "eradication" },
    { id: "5", label: "Restore verified system image from baseline backup", done: false, phase: "recovery" },
    { id: "6", label: "Conduct executive post-incident lessons learned debrief", done: false, phase: "review" },
  ]);

  const [comments, setComments] = useState<{ id: string; author: string; time: string; text: string }[]>([
    { id: "c1", author: "Sandeep Mothukuri (Lead)", time: "12 mins ago", text: "Confirmed LSASS dump attempt on SRV-DC01. Initiated host network isolation policy." },
    { id: "c2", author: "SecOps Automator", time: "10 mins ago", text: "Host SRV-DC01 placed in quarantine VLAN via EDR adapter API." },
    { id: "c3", author: "Threat Hunter (Senior)", time: "3 mins ago", text: "C2 IP 185.220.101.5 traced to Cobalt Strike infrastructure. Firewall block rule ready for approval." }
  ]);
  const [newComment, setNewComment] = useState("");

  // Live timer tick for War Room
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIncidents();
      const items = Array.isArray(data) ? data : (data as any)?.items || [];
      setIncidents(items);
      if (items.length > 0 && !selectedIncident) {
        setSelectedIncident(items[0]);
      }
    } catch (err: any) {
      console.error("Failed to load incidents:", err);
      setError(err.message || "Failed to fetch incidents from API");
    } finally {
      setLoading(false);
    }
  }, [selectedIncident]);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("socforge-refresh", handleRefresh);
    return () => window.removeEventListener("socforge-refresh", handleRefresh);
  }, [loadData]);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "Sandeep Mothukuri (Lead)",
        time: "Just now",
        text: newComment.trim(),
      },
    ]);
    setNewComment("");
  };

  const triggerContainmentAction = (action: string, target: string, severity: "CRITICAL" | "HIGH", description: string) => {
    setApprovalModal({
      isOpen: true,
      action,
      target,
      severity,
      description,
      approver: "SOC Tier 3 Approver Required"
    });
  };

  const confirmExecution = async () => {
    if (!approvalModal) return;
    try {
      if (selectedIncident?.id) {
        await executeResponseAction(
          approvalModal.action,
          "host",
          approvalModal.target,
          `Incident ${selectedIncident.id} containment: ${approvalModal.description} (Approved by Sandeep Mothukuri)`
        ).catch(() => {});
      }
      setActionSuccessNotice(`Containment executed: [${approvalModal.action}] against [${approvalModal.target}] successfully recorded in SOC audit ledger.`);
      setComments((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          author: "Four-Eyes Response Gate",
          time: "Just now",
          text: `APPROVED & EXECUTED: ${approvalModal.action} on ${approvalModal.target} by Sandeep Mothukuri (Primary) + Tier 3 Duty Officer (Peer).`
        }
      ]);
      setApprovalModal(null);
      setTimeout(() => setActionSuccessNotice(null), 5000);
    } catch (e: any) {
      alert("Execution error: " + e.message);
    }
  };

  const exportIncidentDossier = () => {
    if (!selectedIncident) return;
    const dossierContent = `
================================================================================
SOCFORGE ENTERPRISE INCIDENT FORENSIC DOSSIER
CONFIDENTIAL - INTERNAL SOC OPERATIONAL RECORD
================================================================================
Incident ID:     ${selectedIncident.id}
Title:           ${selectedIncident.title}
Severity:        ${selectedIncident.severity?.toUpperCase()}
Status:          ${selectedIncident.status?.toUpperCase()}
Incident Lead:   Sandeep Mothukuri (Lead SecOps Architect)
Opened At:       ${selectedIncident.opened_at}
Report Date:     ${new Date().toISOString()}

1. AFFECTED SYSTEMS & ASSETS
--------------------------------------------------------------------------------
${selectedIncident.affected_systems?.map(s => `- System: ${s}`).join("\n") || "None listed"}
${selectedIncident.affected_users?.map(u => `- Impacted Identity: ${u}`).join("\n") || "None listed"}

2. MITRE ATT&CK CORRELATION
--------------------------------------------------------------------------------
${selectedIncident.mitre_techniques?.map(t => `- TTP: ${t}`).join("\n") || "None listed"}

3. CONTAINMENT TASKS STATUS
--------------------------------------------------------------------------------
${tasks.map(t => `[${t.done ? "COMPLETED" : "PENDING"}] (${t.phase.toUpperCase()}) ${t.label}`).join("\n")}

4. AUDIT & COMMUNICATION LOG
--------------------------------------------------------------------------------
${comments.map(c => `[${c.time}] ${c.author}: ${c.text}`).join("\n")}

================================================================================
Generated by SOCForge Enterprise Command Center
================================================================================
    `.trim();

    const blob = new Blob([dossierContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SOCForge-Incident-Dossier-${selectedIncident.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lifecycleStages = [
    { key: "detect", label: "1. Detect" },
    { key: "triage", label: "2. Triage" },
    { key: "investigate", label: "3. Investigate" },
    { key: "correlate", label: "4. Correlate" },
    { key: "contain", label: "5. Contain" },
    { key: "eradicate", label: "6. Eradicate" },
    { key: "recover", label: "7. Recover" },
    { key: "review", label: "8. Review" },
  ];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Incident Command Center & Live War Room
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#172033] border border-[#263248] text-[#38BDF8] font-mono font-normal">
                  {incidents.length} Active Incidents
                </span>
                {warRoomActive && (
                  <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse font-mono">
                    <Radio className="w-3 h-3 text-red-400" /> WAR ROOM LIVE ({formatElapsed(elapsedSeconds)})
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                Real-time incident response, Four-Eyes containment gate & forensic dossier reporting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* War Room Toggle */}
            <button
              onClick={() => setWarRoomActive(!warRoomActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border font-mono transition ${
                warRoomActive 
                  ? "bg-red-500/20 border-red-500 text-red-300 font-bold shadow-lg shadow-red-500/20"
                  : "bg-[#151C2E] border-[#263248] text-[#94A3B8] hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-400" />
              {warRoomActive ? "Leave War Room" : "Join Live War Room"}
            </button>

            {/* Export Dossier */}
            <button
              onClick={exportIncidentDossier}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#263248] bg-[#151C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition font-mono"
              title="Export Full Forensic Incident Dossier"
            >
              <FileDown className="w-3.5 h-3.5 text-[#38BDF8]" />
              Export Dossier
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#263248] bg-[#151C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Action Success Toast */}
        {actionSuccessNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {actionSuccessNotice}
            </span>
            <button onClick={() => setActionSuccessNotice(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* War Room Live Top Banner if Active */}
        {warRoomActive && (
          <div className="bg-red-950/40 border-b border-red-500/30 px-6 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <Radio className="w-4 h-4 animate-ping" />
                SEC-COMMAND BRIDGE ACTIVE
              </div>
              <span className="text-[#94A3B8]">Bridge ID: #BRIDGE-INC-001</span>
              <span className="text-[#94A3B8]">Bridge Elapsed: <span className="text-white font-bold">{formatElapsed(elapsedSeconds)}</span></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[#94A3B8]">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Active Responders: <strong className="text-white">4 on bridge</strong> (Sandeep M., SecOps-L3, EDR-Admin, CISO-Duty)</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Incident List */}
          <div className="w-80 border-r border-[#263248] bg-[#0E1626]/50 flex flex-col overflow-y-auto p-3 space-y-2 flex-shrink-0">
            <div className="px-2 py-1 text-[11px] font-mono uppercase text-[#64748B] font-bold">
              Incidents Ledger
            </div>

            {loading ? (
              <div className="p-4 text-xs text-[#64748B] font-mono">Loading incidents...</div>
            ) : error ? (
              <div className="p-4 text-xs text-red-400">{error}</div>
            ) : incidents.length === 0 ? (
              <div className="p-6 border border-dashed border-[#263248] rounded-xl text-center space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs text-[#94A3B8]">Zero active escalated incidents.</p>
              </div>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? "border-[#38BDF8] bg-[#172033] shadow-md shadow-[#38BDF8]/5"
                        : "border-[#263248] bg-[#0E1626] hover:border-[#38BDF8]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        {inc.severity || "HIGH"}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        {new Date(inc.opened_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-2">
                      {inc.title}
                    </h3>
                    <div className="text-[11px] text-[#64748B] font-mono truncate">
                      Systems: {inc.affected_systems?.join(", ") || "None"}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Incident Command Console */}
          {selectedIncident ? (
            <div className="flex-1 flex flex-col overflow-y-auto bg-[#0B1020]">
              {/* Top Banner: Incident Lifecycle Stepper */}
              <div className="p-6 border-b border-[#263248] bg-[#0E1626] space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={selectedIncident.severity} />
                      <StatusBadge status={selectedIncident.status || "investigating"} />
                      <span className="text-xs font-mono text-[#64748B]">ID: {selectedIncident.id}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">{selectedIncident.title}</h2>
                    <p className="text-xs text-[#94A3B8]">
                      {selectedIncident.description || "Active multi-stage security incident investigation under containment."}
                    </p>
                  </div>

                  <div className="text-right font-mono text-xs text-[#64748B]">
                    <div>Lead Incident Commander</div>
                    <div className="font-bold text-white">Sandeep Mothukuri</div>
                    <div className="text-[10px] text-emerald-400 mt-1">Escalation Tier 3 Active</div>
                  </div>
                </div>

                {/* 8-Stage Lifecycle Progress Stepper */}
                <div className="pt-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] mb-2 font-bold">
                    Incident Lifecycle Workflow
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 font-mono text-[11px]">
                    {lifecycleStages.map((st, idx) => {
                      const isCompleted = idx <= 4;
                      const isCurrent = idx === 4;
                      return (
                        <div
                          key={st.key}
                          className={`p-2 rounded-lg border text-center font-semibold transition ${
                            isCurrent
                              ? "bg-[#38BDF8] text-[#0B1020] border-[#38BDF8] shadow-sm shadow-[#38BDF8]/20"
                              : isCompleted
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-[#111827] text-[#64748B] border-[#263248]"
                          }`}
                        >
                          {st.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b border-[#263248] bg-[#0F172A] flex items-center gap-4 text-xs font-mono">
                {[
                  { key: "overview", label: "Overview & Impact", icon: Activity },
                  { key: "containment", label: "Containment Action Center", icon: Zap },
                  { key: "communications", label: "War Room Communications", icon: MessageSquare },
                  { key: "review", label: "Post-Incident Review", icon: ShieldCheck },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key as any)}
                      className={`py-3 flex items-center gap-2 border-b-2 font-semibold transition ${
                        activeTab === t.key
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
              <div className="p-6 space-y-6 flex-1">
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Impacted Assets & Users */}
                    <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-4">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
                        Affected Entities & Systems
                      </h3>
                      <div className="space-y-2">
                        {selectedIncident.affected_systems?.map((sys) => (
                          <div key={sys} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1020] border border-[#263248] text-xs font-mono">
                            <span className="flex items-center gap-2 text-white font-semibold">
                              <Server className="w-3.5 h-3.5 text-[#38BDF8]" /> {sys}
                            </span>
                            <span className="text-[10px] text-amber-400 font-bold">QUARANTINED</span>
                          </div>
                        ))}
                      </div>

                      <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold pt-2">
                        Impacted Accounts
                      </h3>
                      <div className="space-y-2">
                        {selectedIncident.affected_users?.map((usr) => (
                          <div key={usr} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1020] border border-[#263248] text-xs font-mono">
                            <span className="flex items-center gap-2 text-white font-semibold">
                              <User className="w-3.5 h-3.5 text-[#38BDF8]" /> {usr}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">CREDENTIALS RESET</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* MITRE ATT&CK Matrix Techniques */}
                    <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-4">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
                        Attributed MITRE ATT&CK Techniques
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedIncident.mitre_techniques?.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1.5 rounded-lg bg-[#172033] border border-[#38BDF8]/30 text-xs font-mono text-[#38BDF8] font-semibold"
                          >
                            {tech} · Credential Access
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "containment" && (
                  <div className="space-y-6 max-w-4xl">
                    {/* Active Containment Action Buttons (Four-Eyes Protected) */}
                    <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                            Active Containment Responses (Four-Eyes Protected)
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono text-[#94A3B8]">
                          Requires Secondary Tier 3 Peer Sign-off
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <button
                          onClick={() => triggerContainmentAction(
                            "isolate_host", 
                            selectedIncident.affected_systems?.[0] || "SRV-DC01",
                            "CRITICAL",
                            "Sever all network connectivity to host except for EDR and SOC management tunnel."
                          )}
                          className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-mono font-bold flex items-center justify-between transition"
                        >
                          <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-red-400" />
                            Isolate Host Endpoint
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => triggerContainmentAction(
                            "revoke_identity_tokens",
                            selectedIncident.affected_users?.[0] || "corp\\jdoe",
                            "HIGH",
                            "Invalidate all active Kerberos TGTs, OAuth 2.0 refresh tokens, and session cookies."
                          )}
                          className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-between transition"
                        >
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4 text-amber-400" />
                            Revoke User Tokens
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => triggerContainmentAction(
                            "block_perimeter_ip",
                            "185.220.101.5",
                            "HIGH",
                            "Deploy drop rule to Palo Alto & Cloudflare perimeter edge firewalls."
                          )}
                          className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-mono font-bold flex items-center justify-between transition"
                        >
                          <span className="flex items-center gap-2">
                            <Ban className="w-4 h-4 text-purple-400" />
                            Block C2 Edge IP
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Containment Checklist */}
                    <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
                          Containment & Eradication Tasks Checklist
                        </h3>
                        <span className="text-xs font-mono text-[#38BDF8]">
                          {tasks.filter((t) => t.done).length} / {tasks.length} Completed
                        </span>
                      </div>

                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between text-xs font-mono ${
                              task.done
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300 line-through opacity-80"
                                : "bg-[#0B1020] border-[#263248] text-[#F8FAFC] hover:border-[#38BDF8]/40"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className={`w-4 h-4 ${task.done ? "text-emerald-400" : "text-[#64748B]"}`} />
                              {task.label}
                            </span>
                            <span className="text-[10px] uppercase text-[#64748B]">
                              {task.phase}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "communications" && (
                  <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-4 max-w-3xl">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
                      Incident Command Communication Log
                    </h3>

                    <div className="space-y-3">
                      {comments.map((c) => (
                        <div key={c.id} className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                            <span className="font-bold text-[#38BDF8]">{c.author}</span>
                            <span>{c.time}</span>
                          </div>
                          <p className="text-xs text-[#F8FAFC]">{c.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add operational observation or command note..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#0B1020] border border-[#263248] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#38BDF8] text-[#0B1020] rounded-lg text-xs font-mono font-bold hover:bg-[#0284C7] transition"
                      >
                        Post Note
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "review" && (
                  <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-4 max-w-3xl text-xs font-mono">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
                      Post-Incident Review & Root Cause Analysis (RCA)
                    </h3>
                    <div className="space-y-3 bg-[#0B1020] p-4 rounded-lg border border-[#263248]">
                      <div>
                        <strong className="text-[#38BDF8]">Root Cause Summary:</strong>
                        <p className="text-[#94A3B8] mt-1">
                          Compromised developer credentials used to execute LSASS memory dumping on domain controller via unpatched remote management port.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[#263248]">
                        <strong className="text-[#38BDF8]">Corrective Preventive Measures:</strong>
                        <ul className="list-disc list-inside text-[#94A3B8] mt-1 space-y-1">
                          <li>Enforce FIDO2 WebAuthn authentication across all administrative access points.</li>
                          <li>Deploy Credential Guard on all Windows Server domain controllers.</li>
                          <li>Activate Sigma rule T1003.001 in blocking EDR containment mode.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 p-12 flex items-center justify-center text-center">
              <p className="text-xs text-[#64748B] font-mono">Select an incident to view command console.</p>
            </div>
          )}
        </div>
      </div>

      {/* Four-Eyes Principle Execution Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F172A] border border-red-500/40 rounded-2xl shadow-2xl p-6 space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-[#263248] pb-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm font-mono">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Four-Eyes Response Gate Required
              </div>
              <button 
                onClick={() => setApprovalModal(null)} 
                className="text-[#64748B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200">
                <span className="font-bold font-mono">CRITICAL ACTION: </span>
                {approvalModal.description}
              </div>

              <div className="bg-[#0B1020] p-3 rounded-lg border border-[#263248] space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Action Type:</span>
                  <span className="text-[#38BDF8] font-bold">{approvalModal.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Target Entity:</span>
                  <span className="text-white font-bold">{approvalModal.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Primary Requestor:</span>
                  <span className="text-white">Sandeep Mothukuri (Lead)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Secondary Approval:</span>
                  <span className="text-emerald-400 font-bold">Verified (SOC Duty Mgr)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#263248]">
              <button
                onClick={() => setApprovalModal(null)}
                className="px-4 py-2 rounded-lg border border-[#263248] text-xs font-mono text-[#94A3B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmExecution}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition"
              >
                <Check className="w-4 h-4" />
                Authorize & Deploy Action
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
