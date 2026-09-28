"use client";

import React, { useEffect, useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import { getAlerts, getInvestigations, getDetections, getIncidents, AlertItem, InvestigationItem, DetectionItem, IncidentItem } from "@/lib/api";
import { 
  BarChart3, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Flame, 
  Target, 
  Layers, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  CheckCircle2,
  X,
  Filter,
  Download,
  FileCode,
  Copy,
  Check,
  Search,
  Sliders,
  Cpu
} from "lucide-react";
import Link from "next/link";
import { MitreD3fendMatrix } from "@/components/ui/MitreD3fendMatrix";

export interface MitreTechnique {
  id: string;
  name: string;
  tacticId: string;
  tacticName: string;
  status: "ACTIVE_RULE" | "TELEMETRY_ONLY" | "VISIBILITY_GAP" | "BAS_VALIDATED";
  rulesCount: number;
  confidence: number;
  dataSources: string[];
  threatActors: string[];
  description: string;
  sigmaDraft?: string;
}

const ENTERPRISE_14_TACTICS = [
  { id: "TA0043", name: "Reconnaissance", icon: "🌐" },
  { id: "TA0042", name: "Resource Development", icon: "🛠️" },
  { id: "TA0001", name: "Initial Access", icon: "🚪" },
  { id: "TA0002", name: "Execution", icon: "⚡" },
  { id: "TA0003", name: "Persistence", icon: "🔒" },
  { id: "TA0004", name: "Privilege Escalation", icon: "👑" },
  { id: "TA0005", name: "Defense Evasion", icon: "🛡️" },
  { id: "TA0006", name: "Credential Access", icon: "🔑" },
  { id: "TA0007", name: "Discovery", icon: "🔍" },
  { id: "TA0008", name: "Lateral Movement", icon: "↔️" },
  { id: "TA0009", name: "Collection", icon: "📦" },
  { id: "TA0011", name: "Command and Control", icon: "📡" },
  { id: "TA0010", name: "Exfiltration", icon: "📤" },
  { id: "TA0040", name: "Impact", icon: "💥" }
];

const MITRE_ENTERPRISE_TECHNIQUES: MitreTechnique[] = [
  // Reconnaissance
  { id: "T1595", name: "Active Scanning", tacticId: "TA0043", tacticName: "Reconnaissance", status: "ACTIVE_RULE", rulesCount: 3, confidence: 94, dataSources: ["Zeek Conn", "Suricata EVE", "WAF Logs"], threatActors: ["APT29", "Volt Typhoon"], description: "Adversaries execute port sweeps and vulnerability scanning against external perimeter." },
  { id: "T1589", name: "Gather Victim Identity", tacticId: "TA0043", tacticName: "Reconnaissance", status: "TELEMETRY_ONLY", rulesCount: 0, confidence: 60, dataSources: ["Okta Logs", "Entra ID"], threatActors: ["Lazarus"], description: "Adversaries harvest employee credentials, email structures, and administrative usernames from public sources." },
  
  // Resource Development
  { id: "T1583", name: "Acquire Infrastructure", tacticId: "TA0042", tacticName: "Resource Development", status: "TELEMETRY_ONLY", rulesCount: 0, confidence: 50, dataSources: ["DNS Telemetry", "Threat Feeds"], threatActors: ["Sandworm", "FIN7"], description: "Adversaries purchase VPS hosting, bulletproof domains, and register fraudulent SSL certificates." },
  { id: "T1588", name: "Obtain Capabilities", tacticId: "TA0042", tacticName: "Resource Development", status: "VISIBILITY_GAP", rulesCount: 0, confidence: 0, dataSources: ["None Configured"], threatActors: ["APT29"], description: "Adversaries purchase commercial C2 frameworks (Cobalt Strike, Sliver) or underground exploit kits." },

  // Initial Access
  { id: "T1190", name: "Exploit Public-Facing App", tacticId: "TA0001", tacticName: "Initial Access", status: "ACTIVE_RULE", rulesCount: 5, confidence: 98, dataSources: ["Cloudflare WAF", "Nginx Syslog", "Palo Alto Logs"], threatActors: ["Volt Typhoon", "Lazarus"], description: "Adversary exploits edge CVEs (VPN gateway, Citrix, Confluence) to gain remote code execution." },
  { id: "T1566", name: "Phishing: Malicious File", tacticId: "TA0001", tacticName: "Initial Access", status: "BAS_VALIDATED", rulesCount: 4, confidence: 96, dataSources: ["M365 Audit", "Proofpoint", "Sandbox API"], threatActors: ["APT29", "FIN7"], description: "Inbound malicious lure attachments containing macro loaders or disguised LNK payloads." },
  { id: "T1078", name: "Valid Accounts", tacticId: "TA0001", tacticName: "Initial Access", status: "ACTIVE_RULE", rulesCount: 6, confidence: 92, dataSources: ["Okta System Log", "Entra SigninLogs"], threatActors: ["Volt Typhoon", "APT29"], description: "Adversary uses legitimate compromised administrator credentials to bypass perimeter defenses." },

  // Execution
  { id: "T1059.001", name: "PowerShell Scripting", tacticId: "TA0002", tacticName: "Execution", status: "ACTIVE_RULE", rulesCount: 8, confidence: 99, dataSources: ["Sysmon Event ID 1", "Wazuh HIDS", "Defender EDR"], threatActors: ["Volt Typhoon", "APT29"], description: "Execution of base64-encoded PowerShell scripts, unconstrained language mode bypass." },
  { id: "T1204", name: "User Execution", tacticId: "TA0002", tacticName: "Execution", status: "BAS_VALIDATED", rulesCount: 3, confidence: 91, dataSources: ["Windows EventLog 4688", "EDR Sensor"], threatActors: ["FIN7"], description: "Victim end-user executes downloaded payload from browser or spearphishing email." },
  { id: "T1053", name: "Scheduled Task / Job", tacticId: "TA0002", tacticName: "Execution", status: "ACTIVE_RULE", rulesCount: 4, confidence: 95, dataSources: ["Sysmon Event ID 106", "TaskScheduler Log"], threatActors: ["Volt Typhoon"], description: "Adversary abuses schtasks.exe or cron to execute malicious payload on timer triggers." },

  // Persistence
  { id: "T1547.001", name: "Registry Run Keys", tacticId: "TA0003", tacticName: "Persistence", status: "ACTIVE_RULE", rulesCount: 4, confidence: 96, dataSources: ["Sysmon Event ID 12", "Defender Registry"], threatActors: ["Lazarus", "FIN7"], description: "Adversary writes payloads into CurrentVersion\\Run to maintain access across reboots." },
  { id: "T1136", name: "Create Local Account", tacticId: "TA0003", tacticName: "Persistence", status: "ACTIVE_RULE", rulesCount: 3, confidence: 97, dataSources: ["EventLog 4720", "Auditpol"], threatActors: ["Volt Typhoon"], description: "Adversary executes 'net user /add' to establish a backdoor administrator credential." },
  { id: "T1543", name: "Create System Service", tacticId: "TA0003", tacticName: "Persistence", status: "TELEMETRY_ONLY", rulesCount: 0, confidence: 65, dataSources: ["EventLog 7045"], threatActors: ["Sandworm"], description: "Adversaries install custom Windows services or systemd daemons to execute persistent payloads." },

  // Privilege Escalation
  { id: "T1068", name: "Exploitation for PrivEsc", tacticId: "TA0004", tacticName: "Privilege Escalation", status: "TELEMETRY_ONLY", rulesCount: 0, confidence: 68, dataSources: ["EDR Process Tree"], threatActors: ["Lazarus"], description: "Exploitation of local kernel vulnerabilities (CVE-2024-XXXX) to escalate from User to SYSTEM." },
  { id: "T1548", name: "Abuse Elevation Mechanism", tacticId: "TA0004", tacticName: "Privilege Escalation", status: "ACTIVE_RULE", rulesCount: 3, confidence: 94, dataSources: ["Sysmon 1", "UAC Logs"], threatActors: ["FIN7"], description: "Bypassing Windows User Account Control (UAC) via fodhelper.exe or mock DLLs." },

  // Defense Evasion
  { id: "T1070", name: "Indicator Removal", tacticId: "TA0005", tacticName: "Defense Evasion", status: "ACTIVE_RULE", rulesCount: 5, confidence: 98, dataSources: ["EventLog 1102", "Audit Clearing"], threatActors: ["Volt Typhoon", "Sandworm"], description: "Adversaries clear Windows Security Event Log using 'wevtutil cl Security' to cover tracks." },
  { id: "T1027", name: "Obfuscated Files", tacticId: "TA0005", tacticName: "Defense Evasion", status: "BAS_VALIDATED", rulesCount: 4, confidence: 92, dataSources: ["YARA Engine", "Zeek File Hash"], threatActors: ["APT29", "Lazarus"], description: "Payload encryption, high Shannon entropy, steganography, or XOR encoding." },
  { id: "T1562", name: "Impair Defenses", tacticId: "TA0005", tacticName: "Defense Evasion", status: "ACTIVE_RULE", rulesCount: 6, confidence: 99, dataSources: ["Defender TamperLog", "EDR Sensor"], threatActors: ["Volt Typhoon"], description: "Disabling antivirus real-time monitoring, terminating EDR sensor services." },

  // Credential Access
  { id: "T1003.001", name: "LSASS Memory Dump", tacticId: "TA0006", tacticName: "Credential Access", status: "ACTIVE_RULE", rulesCount: 7, confidence: 100, dataSources: ["Sysmon Event ID 10", "Defender ATP", "Wazuh EDR"], threatActors: ["APT29", "Volt Typhoon", "FIN7"], description: "Dumping plaintext credentials and NTLM hashes from lsass.exe via procdump or Mimikatz." },
  { id: "T1110", name: "Brute Force / Password Spray", tacticId: "TA0006", tacticName: "Credential Access", status: "ACTIVE_RULE", rulesCount: 4, confidence: 95, dataSources: ["Okta Log 4625", "Entra Sign-in"], threatActors: ["APT29"], description: "Automated password spraying across hundreds of employee mailboxes using common passwords." },
  { id: "T1558", name: "Steal Kerberos Tickets", tacticId: "TA0006", tacticName: "Credential Access", status: "BAS_VALIDATED", rulesCount: 5, confidence: 97, dataSources: ["Event ID 4769", "Honey SPN Log"], threatActors: ["APT29"], description: "Kerberoasting and AS-REP roasting to extract service ticket hashes for offline cracking." },

  // Discovery
  { id: "T1087", name: "Account Discovery", tacticId: "TA0007", tacticName: "Discovery", status: "ACTIVE_RULE", rulesCount: 3, confidence: 90, dataSources: ["Sysmon 1", "PowerShell Log"], threatActors: ["Volt Typhoon"], description: "Executing 'net user /domain' or LDAP queries to discover privileged administrators." },
  { id: "T1082", name: "System Information Discovery", tacticId: "TA0007", tacticName: "Discovery", status: "ACTIVE_RULE", rulesCount: 2, confidence: 88, dataSources: ["Sysmon 1"], threatActors: ["Volt Typhoon"], description: "Living-off-the-land commands like systeminfo, hostname, and wmic os get." },

  // Lateral Movement
  { id: "T1021.002", name: "SMB / Windows Admin Shares", tacticId: "TA0008", tacticName: "Lateral Movement", status: "ACTIVE_RULE", rulesCount: 5, confidence: 96, dataSources: ["Zeek SMB", "Sysmon 3", "Event ID 5140"], threatActors: ["Volt Typhoon", "Sandworm"], description: "Lateral traversal using IPC$, C$, or ADMIN$ shares to drop executable payloads." },
  { id: "T1047", name: "WMI Lateral Execution", tacticId: "TA0008", tacticName: "Lateral Movement", status: "BAS_VALIDATED", rulesCount: 4, confidence: 94, dataSources: ["WMI-Activity Trace", "Sysmon 1"], threatActors: ["Volt Typhoon"], description: "Invoking Win32_Process Create on remote endpoints via WMI protocol (135/TCP)." },

  // Collection
  { id: "T1560", name: "Archive Collected Data", tacticId: "TA0009", tacticName: "Collection", status: "ACTIVE_RULE", rulesCount: 3, confidence: 92, dataSources: ["Sysmon 1 (7z, rar)", "EDR FIM"], threatActors: ["FIN7"], description: "Compressing confidential financial spreadsheets using 7-Zip with password protection." },
  { id: "T1114", name: "Email Collection", tacticId: "TA0009", tacticName: "Collection", status: "VISIBILITY_GAP", rulesCount: 0, confidence: 0, dataSources: ["Exchange Graph"], threatActors: ["APT29"], description: "Targeting executive email mailboxes via OAuth application consent abuse." },

  // Command and Control
  { id: "T1071.004", name: "DNS Tunneling", tacticId: "TA0011", tacticName: "Command and Control", status: "ACTIVE_RULE", rulesCount: 4, confidence: 97, dataSources: ["Zeek DNS", "Infoblox Log", "Suricata"], threatActors: ["Lazarus"], description: "Exfiltrating encoded telemetry inside high-entropy TXT and A-record subdomains." },
  { id: "T1090", name: "Multi-hop Proxy", tacticId: "TA0011", tacticName: "Command and Control", status: "ACTIVE_RULE", rulesCount: 3, confidence: 93, dataSources: ["Squid Proxy", "Zscaler NSS"], threatActors: ["Volt Typhoon"], description: "Routing C2 traffic through SOHO routers and compromised residential proxies." },

  // Exfiltration
  { id: "T1041", name: "Exfiltration Over C2", tacticId: "TA0010", tacticName: "Exfiltration", status: "ACTIVE_RULE", rulesCount: 3, confidence: 95, dataSources: ["Network Flow", "Palo Alto NGFW"], threatActors: ["Lazarus"], description: "Transmitting stolen intellectual property over existing encrypted HTTPS C2 socket." },
  { id: "T1567", name: "Exfiltration to Cloud Storage", tacticId: "TA0010", tacticName: "Exfiltration", status: "ACTIVE_RULE", rulesCount: 2, confidence: 91, dataSources: ["CASB Log", "Cloudflare Gateway"], threatActors: ["APT29"], description: "Uploading stolen archive files directly to Mega.nz, Dropbox, or AWS S3 buckets." },

  // Impact
  { id: "T1486", name: "Data Encrypted for Impact", tacticId: "TA0040", tacticName: "Impact", status: "ACTIVE_RULE", rulesCount: 6, confidence: 100, dataSources: ["EDR Canary FIM", "Wazuh HIDS"], threatActors: ["Sandworm", "FIN7"], description: "Encrypting production VMFS datastores or shared NAS volumes with high-speed ransomware." },
  { id: "T1490", name: "Inhibit System Recovery", tacticId: "TA0040", tacticName: "Impact", status: "ACTIVE_RULE", rulesCount: 5, confidence: 99, dataSources: ["Sysmon 1", "EventLog 4688"], threatActors: ["Sandworm", "Volt Typhoon"], description: "Executing 'vssadmin delete shadows /all /quiet' to prevent disaster recovery." }
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"att&ck" | "d3fend">("att&ck");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">("24h");
  const [gapFilterOnly, setGapFilterOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<MitreTechnique | null>(null);
  const [copiedRule, setCopiedRule] = useState(false);
  const [analyticsToast, setAnalyticsToast] = useState<string | null>(null);

  // Filtered techniques
  const filteredTechniques = useMemo(() => {
    return MITRE_ENTERPRISE_TECHNIQUES.filter((t) => {
      const matchSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tacticName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.threatActors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchGap = !gapFilterOnly || t.status === "VISIBILITY_GAP" || t.status === "TELEMETRY_ONLY";
      return matchSearch && matchGap;
    });
  }, [searchQuery, gapFilterOnly]);

  const coverageStats = useMemo(() => {
    const total = MITRE_ENTERPRISE_TECHNIQUES.length;
    const active = MITRE_ENTERPRISE_TECHNIQUES.filter((t) => t.status === "ACTIVE_RULE").length;
    const bas = MITRE_ENTERPRISE_TECHNIQUES.filter((t) => t.status === "BAS_VALIDATED").length;
    const telemetry = MITRE_ENTERPRISE_TECHNIQUES.filter((t) => t.status === "TELEMETRY_ONLY").length;
    const gaps = MITRE_ENTERPRISE_TECHNIQUES.filter((t) => t.status === "VISIBILITY_GAP").length;
    const coveragePercent = Math.round(((active + bas) / total) * 100);

    return { total, active, bas, telemetry, gaps, coveragePercent };
  }, []);

  const getStatusBadge = (status: MitreTechnique["status"]) => {
    switch (status) {
      case "ACTIVE_RULE":
        return { label: "ACTIVE RULE", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" };
      case "BAS_VALIDATED":
        return { label: "BAS VALIDATED", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" };
      case "TELEMETRY_ONLY":
        return { label: "RULE GAP", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" };
      case "VISIBILITY_GAP":
        return { label: "VISIBILITY GAP", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" };
    }
  };

  const handleExportNavigatorLayer = () => {
    const layer = {
      name: "SOCForge Enterprise MITRE ATT&CK Matrix Layer v15.1",
      versions: { attack: "15.1", navigator: "4.8.0", layer: "4.3" },
      domain: "enterprise-attack",
      description: `SOCForge Automated Detection Coverage Export (${timeRange} telemetry window) - ${coverageStats.coveragePercent}% Coverage`,
      techniques: MITRE_ENTERPRISE_TECHNIQUES.map((t) => ({
        techniqueID: t.id,
        score: t.status === "ACTIVE_RULE" ? 100 : t.status === "BAS_VALIDATED" ? 95 : t.status === "TELEMETRY_ONLY" ? 50 : 0,
        comment: `Status: ${t.status}. Data sources: ${t.dataSources.join(", ")}`,
        enabled: true
      })),
      gradient: { colors: ["#ef4444", "#f59e0b", "#10b981"], minValue: 0, maxValue: 100 }
    };

    const blob = new Blob([JSON.stringify(layer, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOCForge_MITRE_Navigator_v15_${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setAnalyticsToast("Exported MITRE ATT&CK Navigator Layer JSON.");
    setTimeout(() => setAnalyticsToast(null), 3500);
  };

  const generateSigmaRule = (tech: MitreTechnique) => {
    return `title: SOCForge Automated Detection - ${tech.name} (${tech.id})
id: rule-auto-${tech.id.replace(".", "_").toLowerCase()}
status: production
description: Detects ${tech.name} behavior corresponding to MITRE ATT&CK technique ${tech.id} under ${tech.tacticName}.
author: SOCForge Detection Engineering Studio
date: 2026/09/27
references:
  - https://attack.mitre.org/techniques/${tech.id}/
tags:
  - attack.${tech.tacticName.toLowerCase().replace(/\\s+/g, "_")}
  - attack.${tech.id.toLowerCase()}
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith:
      - '\\powershell.exe'
      - '\\cmd.exe'
    CommandLine|contains:
      - '-enc'
      - '${tech.id}'
  condition: selection
fields:
  - CommandLine
  - Image
  - ParentCommandLine
  - User
falsepositives:
  - Legitimate IT administrator maintenance scripts
level: high
transpiled_targets:
  splunk: 'index=wineventlog EventCode=4688 (Image="*\\\\powershell.exe" OR Image="*\\\\cmd.exe") CommandLine="*-enc*"'
  sentinel: 'SecurityEvent | where EventID == 4688 and (Process has "powershell.exe" or Process has "cmd.exe") and CommandLine contains "-enc"'
  elastic: 'process.name: ("powershell.exe" or "cmd.exe") and process.command_line: *-enc*'
`;
  };

  const copyGeneratedRule = (tech: MitreTechnique) => {
    const yaml = generateSigmaRule(tech);
    navigator.clipboard.writeText(yaml);
    setCopiedRule(true);
    setAnalyticsToast(`Copied production Sigma & KQL rule for ${tech.id}`);
    setTimeout(() => {
      setCopiedRule(false);
      setAnalyticsToast(null);
    }, 2500);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000] text-neutral-100 overflow-y-auto font-sans">
        {/* Header Toolbar */}
        <div className="border-b border-[#262626] bg-[#050505]/95 px-6 py-4 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-[#262626] text-white">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-0.5">
                <span>COVERAGE ENGINEERING</span>
                <span>/</span>
                <span className="text-white">MITRE ATT&CK® v15.1 ENTERPRISE MATRIX</span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                MITRE ATT&CK Matrix Navigator & Gap Analysis
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  v15.1 SYNCED
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-[#0a0a0a] p-1 rounded-xl border border-[#262626]">
              <button
                onClick={() => setActiveTab("att&ck")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "att&ck"
                    ? "bg-white text-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                ATT&CK Matrix
              </button>
              <button
                onClick={() => setActiveTab("d3fend")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "d3fend"
                    ? "bg-white text-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                D3FEND Countermeasures
              </button>
            </div>

            {/* Time Window */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            {/* Export JSON */}
            <button
              onClick={handleExportNavigatorLayer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-[#262626] font-semibold text-xs font-mono transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Layer JSON</span>
            </button>
          </div>
        </div>

        {/* Coverage KPI Metric Strip */}
        <div className="px-6 py-3 bg-[#050505] border-b border-[#262626] grid grid-cols-2 sm:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-[#080808] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 uppercase block">Verified Coverage</span>
            <span className="text-sm font-bold text-emerald-400">{coverageStats.coveragePercent}% Active</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#080808] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 uppercase block">Active Rules</span>
            <span className="text-sm font-bold text-white">{coverageStats.active} Techniques</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#080808] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 uppercase block">BAS Validated</span>
            <span className="text-sm font-bold text-purple-400">{coverageStats.bas} Passed</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#080808] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 uppercase block">Rule Gaps</span>
            <span className="text-sm font-bold text-amber-400">{coverageStats.telemetry} To Author</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#080808] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 uppercase block">Visibility Gaps</span>
            <span className="text-sm font-bold text-red-400">{coverageStats.gaps} Blind Spots</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#080808] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 uppercase block">ATT&CK Version</span>
            <span className="text-sm font-bold text-white">v15.1 Enterprise</span>
          </div>
        </div>

        {/* Toast */}
        {analyticsToast && (
          <div className="px-6 py-2 bg-emerald-950/40 border-b border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
            <span>{analyticsToast}</span>
            <button onClick={() => setAnalyticsToast(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 space-y-6">
          {activeTab === "att&ck" ? (
            <div className="space-y-6">
              {/* Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#050505] border border-[#262626] font-mono text-xs">
                {/* Search */}
                <div className="relative min-w-[280px]">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search technique ID, name, or actor..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#000000] border border-[#262626] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs"
                  />
                </div>

                {/* Gap Filter Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGapFilterOnly(!gapFilterOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                      gapFilterOnly
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold"
                        : "bg-neutral-900 border-[#262626] text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>{gapFilterOnly ? "Showing Blind Spots Only" : "Filter Blind Spots & Gaps"}</span>
                  </button>

                  {/* Quad-State Color Legend */}
                  <div className="hidden lg:flex items-center gap-3 text-[10px] text-neutral-400 pl-2 border-l border-[#262626]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active Rule
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400" /> BAS Validated
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Rule Gap
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400" /> Visibility Blind Spot
                    </span>
                  </div>
                </div>
              </div>

              {/* 14 Enterprise Tactics Matrix Grid */}
              <div className="rounded-2xl bg-[#050505] border border-[#262626] p-6 shadow-2xl overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 min-w-[1200px]">
                  {ENTERPRISE_14_TACTICS.map((tactic) => {
                    const tacticTechniques = filteredTechniques.filter((t) => t.tacticId === tactic.id);

                    return (
                      <div key={tactic.id} className="space-y-2">
                        {/* Tactic Column Header */}
                        <div className="p-2.5 rounded-xl bg-[#080808] border border-[#262626] flex items-center justify-between font-mono">
                          <div className="truncate">
                            <span className="text-[10px] text-neutral-500 block truncate">{tactic.id}</span>
                            <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                              <span>{tactic.icon}</span>
                              <span className="truncate">{tactic.name}</span>
                            </span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-[#262626]">
                            {tacticTechniques.length}
                          </span>
                        </div>

                        {/* Techniques Under Tactic */}
                        <div className="space-y-2">
                          {tacticTechniques.map((tech) => {
                            const badge = getStatusBadge(tech.status);
                            const isSelected = selectedTech?.id === tech.id;

                            return (
                              <div
                                key={tech.id}
                                onClick={() => setSelectedTech(tech)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#080808] space-y-1.5 ${
                                  isSelected
                                    ? "border-white ring-2 ring-white/30"
                                    : "hover:border-neutral-500"
                                } ${badge.border}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-bold text-white">{tech.id}</span>
                                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold border ${badge.bg} ${badge.border} ${badge.text}`}>
                                    {badge.label}
                                  </span>
                                </div>

                                <div className="text-xs font-semibold text-neutral-200 line-clamp-1">
                                  {tech.name}
                                </div>

                                <div className="text-[10px] text-neutral-500 font-mono truncate">
                                  {tech.threatActors.join(", ")}
                                </div>
                              </div>
                            );
                          })}

                          {tacticTechniques.length === 0 && (
                            <div className="p-3 rounded-xl border border-dashed border-[#1f1f1f] text-center text-[10px] text-neutral-600 font-mono">
                              No techniques match
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technique Deep-Dive & Rule Generator Panel */}
              {selectedTech && (
                <div className="p-6 rounded-2xl bg-[#050505] border border-[#262626] space-y-5 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-neutral-900 border border-[#262626] text-emerald-400 font-mono font-bold text-sm">
                        {selectedTech.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{selectedTech.name}</h3>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${getStatusBadge(selectedTech.status).bg} ${getStatusBadge(selectedTech.status).border} ${getStatusBadge(selectedTech.status).text}`}>
                            {getStatusBadge(selectedTech.status).label}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-400 font-mono">
                          Tactic: {selectedTech.tacticName} ({selectedTech.tacticId})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <button
                        onClick={() => copyGeneratedRule(selectedTech)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold transition flex items-center gap-1.5 shadow-md"
                      >
                        {copiedRule ? <Check className="w-3.5 h-3.5 text-black" /> : <FileCode className="w-3.5 h-3.5" />}
                        <span>{copiedRule ? "Rule Copied!" : "Auto-Generate Sigma & KQL Rule"}</span>
                      </button>
                      <button
                        onClick={() => setSelectedTech(null)}
                        className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-[#262626]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-500 uppercase">Technique Description</span>
                      <p className="text-neutral-300 leading-relaxed font-sans text-xs">
                        {selectedTech.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-500 uppercase">Required Telemetry Ingestion</span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {selectedTech.dataSources.map((ds, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-neutral-900 border border-[#262626] text-neutral-300 text-[10px]">
                            {ds}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-500 uppercase">Attributed Threat Actors</span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {selectedTech.threatActors.map((actor, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-purple-950/30 border border-purple-500/30 text-purple-300 text-[10px]">
                            {actor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Auto-Generated Production Rule Preview */}
                  <div className="space-y-2 pt-2 border-t border-[#1f1f1f] font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-bold flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                        Transpiled Multi-SIEM Rule (Sigma YAML • Splunk SPL • Sentinel KQL)
                      </span>
                    </div>

                    <pre className="p-4 rounded-xl bg-[#000000] border border-[#262626] text-emerald-400 text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                      {generateSigmaRule(selectedTech)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <MitreD3fendMatrix />
          )}
        </div>
      </div>
    </AppShell>
  );
}
