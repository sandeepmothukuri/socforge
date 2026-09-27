"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  Radio,
  Copy,
  Check,
  Terminal,
  Code2,
  FileCode,
  Flame,
  Layers,
  ChevronRight,
  ExternalLink,
  Cpu
} from "lucide-react";

interface D3fendMapping {
  attackId: string;
  attackName: string;
  d3fendId: string;
  d3fendName: string;
  category: "Harden" | "Detect" | "Isolate" | "Deceive" | "Evict" | "Model";
  summary: string;
  hardeningScripts: {
    powershell: string;
    bash: string;
    gpo: string;
  };
}

const D3FEND_TACTICS = [
  { name: "All", count: 6 },
  { name: "Harden", count: 2, desc: "Application & OS Configuration Hardening" },
  { name: "Detect", count: 2, desc: "Process & Network Anomaly Telemetry" },
  { name: "Isolate", count: 1, desc: "Network Segmentation & Execution Sandboxing" },
  { name: "Deceive", count: 1, desc: "Decoy Credentials & Canary Tokens" },
  { name: "Evict", count: 1, desc: "Credential Revocation & Session Invalidation" }
];

const D3FEND_MAPPINGS: D3fendMapping[] = [
  {
    attackId: "T1003.001",
    attackName: "OS Credential Dumping: LSASS Memory",
    d3fendId: "D3-PTA",
    d3fendName: "Process Threat Analysis & LSA Protection",
    category: "Harden",
    summary: "Enforce Windows Protected Process Light (RunAsPPL) and Credential Guard to prevent unprivileged handles to lsass.exe.",
    hardeningScripts: {
      powershell: `# Enforce LSA Protection (RunAsPPL) & Credential Guard
Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Lsa" -Name "RunAsPPL" -Value 1 -Type DWord
Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Lsa" -Name "LsaCfgFlags" -Value 1 -Type DWord
Write-Host "[+] LSA Protected Process Light Enabled. Reboot required." -ForegroundColor Green`,
      bash: `# Linux /proc filesystem protection against memory scraping (hidepid=2)
mount -o remount,rw,hidepid=2 /proc
echo "proc /proc proc defaults,hidepid=2 0 0" >> /etc/fstab
echo "[+] Procfs hidepid=2 applied. Memory inspection restricted."`,
      gpo: `Computer Configuration -> Administrative Templates -> System -> Device Guard -> Turn On Virtualization Based Security -> Credential Guard Configuration: Enabled with UEFI lock`
    }
  },
  {
    attackId: "T1059.001",
    attackName: "Command & Scripting Interpreter: PowerShell",
    d3fendId: "D3-EUA",
    d3fendName: "Executable & Script Allowlisting (ConstrainedLanguage)",
    category: "Harden",
    summary: "Enforce PowerShell Constrained Language Mode and Script Block Logging (Event ID 4104) across all endpoints.",
    hardeningScripts: {
      powershell: `# Enforce PowerShell ScriptBlock Logging and Transcription
$Key = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging"
If (!(Test-Path $Key)) { New-Item -Path $Key -Force }
Set-ItemProperty -Path $Key -Name "EnableScriptBlockLogging" -Value 1 -Type DWord
[Environment]::SetEnvironmentVariable("__PSLockdownPolicy", "4", "Machine")
Write-Host "[+] PowerShell Constrained Language Mode enforced." -ForegroundColor Green`,
      bash: `# Enforce restrictive bash shell logging and disable unapproved interpreters
chmod 700 /usr/bin/perl /usr/bin/python3
echo 'export HISTTIMEFORMAT="%F %T "' >> /etc/profile
echo "[+] Shell execution logging configured."`,
      gpo: `Computer Configuration -> Administrative Templates -> Windows Components -> Windows PowerShell -> Turn on PowerShell Script Block Logging: Enabled`
    }
  },
  {
    attackId: "T1021.002",
    attackName: "Remote Services: SMB/Windows Admin Shares",
    d3fendId: "D3-NI",
    d3fendName: "Network Microsegmentation & SMB Hardening",
    category: "Isolate",
    summary: "Disable SMBv1, enforce SMB Signing/Encryption, and block lateral port 445 traffic between client workstations.",
    hardeningScripts: {
      powershell: `# Disable SMBv1 and enforce SMB encryption and signing
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart
Set-SmbServerConfiguration -RequireSecuritySignature $true -EncryptData $true -Force
# Block inbound SMB port 445 from workstation subnets
New-NetFirewallRule -Name "Block-Workstation-SMB" -DisplayName "Block Lateral SMB 445" -Direction Inbound -LocalPort 445 -Protocol TCP -Action Block -RemoteAddress 192.168.4.0/24`,
      bash: `# Linux iptables lateral SMB & SSH isolation
iptables -A INPUT -p tcp --dport 445 -s 10.0.0.0/24 -j DROP
iptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/24 -j DROP
echo "[+] Lateral port filtering enabled."`,
      gpo: `Computer Configuration -> Windows Settings -> Security Settings -> Local Policies -> Security Options -> Microsoft network server: Digitally sign communications (always): Enabled`
    }
  },
  {
    attackId: "T1078.002",
    attackName: "Valid Accounts: Domain Accounts",
    d3fendId: "D3-DC",
    d3fendName: "Decoy Credentials & Honey Accounts",
    category: "Deceive",
    summary: "Deploy canary decoy SPNs (Service Principal Names) and honey tokens to trap Kerberoasting and AS-REP roasting activity instantly.",
    hardeningScripts: {
      powershell: `# Create Decoy Honey Account with SPN to detect Kerberoasting
# Set-ADUser -Identity "svc_sql_backup" -ServicePrincipalNames @{Add="MSSQLSvc/db01.corp.internal:1433"}
Write-Host "[+] Honey SPN configured. Alert triggers on Event ID 4769 (Kerberos TGS Request)." -ForegroundColor Yellow`,
      bash: `# Deploy decoy SSH keypair with CanaryToken beacon
curl -s https://canarytokens.org/generate?type=fast-ssh-key -o ~/.ssh/id_rsa_decoy
echo "[+] Decoy canary token deployed in ~/.ssh/"`,
      gpo: `Configure SACL on Honey AD Objects -> Audit 'Read all properties' for Domain Users group`
    }
  },
  {
    attackId: "T1055",
    attackName: "Process Injection: Memory Allocation Hooks",
    d3fendId: "D3-SCM",
    d3fendName: "System Call Monitoring & Memory Guard",
    category: "Detect",
    summary: "Monitor kernel-level syscalls (`NtAllocateVirtualMemory`, `NtProtectVirtualMemory`) to catch in-memory beacon staging.",
    hardeningScripts: {
      powershell: `# Enable Sysmon Event 10 (ProcessAccess) and Event 8 (CreateRemoteThread)
# sysmon.exe -c sysmonconfig-export.xml
Write-Host "[+] Sysmon kernel memory monitoring active." -ForegroundColor Green`,
      bash: `# Linux eBPF syscall tracing for execve & mprotect
bpftrace -e 'tracepoint:syscalls:sys_enter_mprotect { printf("PID %d mprotect prot: %d\\n", pid, args->prot); }'`,
      gpo: `Audit Policy -> Advanced Audit Policy Configuration -> Detailed Tracking -> Audit Process Termination / Process Creation (Include Command Line): Success and Failure`
    }
  },
  {
    attackId: "T1560.001",
    attackName: "Archive Collected Data: Automated Compression",
    d3fendId: "D3-CR",
    d3fendName: "Credential Invalidation & Session Termination",
    category: "Evict",
    summary: "Automated revocation of OAuth refresh tokens and Active Directory session tickets upon exfiltration stage confirmation.",
    hardeningScripts: {
      powershell: `# Revoke all active Kerberos TGT and TGS tickets for compromised account
# Revoke-AzureADUserAllRefreshToken -ObjectId $CompromisedUserGuid
klist purge
Write-Host "[+] Active Kerberos and OAuth session tokens terminated." -ForegroundColor Red`,
      bash: `# Terminate all active sessions for targeted compromised user
pkill -u jsmith -KILL
passwd -l jsmith
echo "[+] User sessions invalidated and account locked."`,
      gpo: `Account Policies -> Account Lockout Policy -> Account lockout threshold: 5 invalid attempts`
    }
  }
];

export function MitreD3fendMatrix() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedMapping, setSelectedMapping] = useState<D3fendMapping>(D3FEND_MAPPINGS[0]);
  const [scriptLang, setScriptLang] = useState<"powershell" | "bash" | "gpo">("powershell");
  const [copied, setCopied] = useState(false);

  const filteredMappings =
    activeCategory === "All"
      ? D3FEND_MAPPINGS
      : D3FEND_MAPPINGS.filter((m) => m.category === activeCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedMapping.hardeningScripts[scriptLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "Harden":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Detect":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Isolate":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "Deceive":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "Evict":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  return (
    <div className="space-y-6 text-xs text-neutral-300">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-[#262626] flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">
                MITRE D3FEND™ Defensive Countermeasure Engine
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                ATT&CK TO D3FEND MAPPED
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Correlate adversary ATT&CK techniques with quantitative defensive countermeasures and instant hardening scripts
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0a0a] p-1.5 rounded-xl border border-[#1f1f1f]">
          {D3FEND_TACTICS.map((t) => (
            <button
              key={t.name}
              onClick={() => setActiveCategory(t.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === t.name
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-[#171717]"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Mapping List + Detailed Script Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Technique Mappings List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 px-1">
            Active ATT&CK $\to$ D3FEND Matrix ({filteredMappings.length} Rules)
          </div>
          <div className="space-y-2">
            {filteredMappings.map((item) => {
              const isSelected = selectedMapping.attackId === item.attackId;
              return (
                <div
                  key={item.attackId}
                  onClick={() => setSelectedMapping(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-[#0d0d0d] border-white ring-1 ring-white/10"
                      : "bg-[#050505] border-[#1f1f1f] hover:border-[#333333]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-[#262626] font-mono text-[10px] text-rose-400 font-bold">
                        {item.attackId}
                      </span>
                      <ChevronRight className="w-3 h-3 text-neutral-600" />
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border ${getCategoryBadge(item.category)}`}>
                        {item.d3fendId} ({item.category})
                      </span>
                    </div>
                  </div>

                  <div className="font-semibold text-white text-xs mb-1">
                    {item.d3fendName}
                  </div>
                  <div className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Countermeasure Deep Dive & Hardening Scripts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1f1f1f]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Defensive Countermeasure</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getCategoryBadge(selectedMapping.category)}`}>
                    {selectedMapping.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {selectedMapping.d3fendName} ({selectedMapping.d3fendId})
                </h3>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono text-neutral-500 uppercase">Neutralizes ATT&CK</div>
                <div className="text-xs font-mono font-semibold text-rose-400">
                  {selectedMapping.attackId} — {selectedMapping.attackName}
                </div>
              </div>
            </div>

            {/* Rationale / Summary */}
            <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-neutral-300 leading-relaxed">
              <span className="text-white font-semibold">Implementation Rationale: </span>
              {selectedMapping.summary}
            </div>

            {/* Script Language Switcher & Copy Header */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 bg-[#0a0a0a] p-1 rounded-lg border border-[#1f1f1f]">
                <button
                  onClick={() => setScriptLang("powershell")}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    scriptLang === "powershell"
                      ? "bg-white text-black font-semibold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  PowerShell (Win)
                </button>
                <button
                  onClick={() => setScriptLang("bash")}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    scriptLang === "bash"
                      ? "bg-white text-black font-semibold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Bash / Linux
                </button>
                <button
                  onClick={() => setScriptLang("gpo")}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    scriptLang === "gpo"
                      ? "bg-white text-black font-semibold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  GPO Policy
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121212] hover:bg-[#1a1a1a] text-white border border-[#262626] text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Script" : "Copy Policy"}</span>
              </button>
            </div>

            {/* Script Output Code Box */}
            <div className="relative rounded-xl bg-[#080808] border border-[#1f1f1f] overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#0d0d0d] border-b border-[#1f1f1f] text-[10px] font-mono text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                  <span>hardening_deploy_{selectedMapping.d3fendId.toLowerCase()}_{scriptLang}.ps1</span>
                </div>
                <span>Ready to Execute</span>
              </div>
              <pre className="p-4 text-xs font-mono text-neutral-200 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-64">
                {selectedMapping.hardeningScripts[scriptLang]}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MitreD3fendMatrix;
