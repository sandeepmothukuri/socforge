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
  AlertCircle
} from "lucide-react";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "containment" | "communications" | "review">("overview");

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
    { id: "c1", author: "Sandeep Mothukuri (Lead)", time: "10 mins ago", text: "Confirmed LSASS dump attempt on SRV-DC01. Initiated host network isolation policy." },
    { id: "c2", author: "SecOps Automator", time: "8 mins ago", text: "Host SRV-DC01 placed in quarantine VLAN via EDR adapter API." },
  ]);
  const [newComment, setNewComment] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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
                Enterprise Incident Command Center
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#172033] border border-[#263248] text-[#38BDF8] font-mono font-normal">
                  {incidents.length} Active Incident Records
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                Full-lifecycle incident correlation, containment task management & audit trail
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#263248] bg-[#151C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

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
                  { key: "containment", label: "Containment Checklist", icon: ListTodo },
                  { key: "communications", label: "Communication Log", icon: MessageSquare },
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
                  <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-4 max-w-3xl">
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
    </AppShell>
  );
}
