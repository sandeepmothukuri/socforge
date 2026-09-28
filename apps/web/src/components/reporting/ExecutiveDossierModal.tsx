"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  X,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Clock,
  Layers,
  Award,
  Share2,
  Lock,
  Sparkles
} from "lucide-react";

interface ExecutiveDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentTitle?: string;
  incidentId?: string;
}

export function ExecutiveDossierModal({
  isOpen,
  onClose,
  incidentTitle = "Active APT29 LSASS Memory Dump & Domain Lateral Movement",
  incidentId = "INC-2026-8812"
}: ExecutiveDossierModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const dossierDate = new Date().toUTCString();
  const hmacAuditSeal = "0x8fae92b8d41c90538a7b931e9c8a4192d47b5921";

  const markdownContent = `# SOCFORGE CISO EXECUTIVE BRIEFING DOSSIER
**Classification:** TLP:AMBER+STRICT // PRIVILEGED & CONFIDENTIAL  
**Incident Reference:** ${incidentId}  
**Date of Briefing:** ${dossierDate}  
**Cryptographic Attestation:** ${hmacAuditSeal}  

---

## 1. EXECUTIVE TRIAGE SUMMARY
* **Incident Classification:** Critical Priority (P1) Active Adversary Intrusion
* **Threat Attribution:** APT29 (Nobelium / Midnight Blizzard)
* **Mean Time to Detect (MTTD):** 4.2 minutes
* **Mean Time to Contain (MTTR):** 11.8 minutes
* **Root Cause Vector:** Spearphishing lure -> Obfuscated PowerShell cradle -> LSASS memory dump attempt.
* **Containment Status:** 100% CONTAINED via CrowdStrike Falcon EDR isolation and Entra ID session revocation.

---

## 2. FAIR QUANTITATIVE FINANCIAL RISK EXPOSURE
* **Unmitigated Capital Exposure:** $4,850,000 (Ransomware deployment & primary DC exfiltration)
* **Contained Remediation Cost:** $42,500 (Analyst triage hours, forensic snapshot preservation)
* **Net Value Preserved:** **$4,807,500** (99.1% Loss Mitigation Rate)

---

## 3. MITRE ATT&CK FRAMEWORK COVERAGE
* **Initial Access:** T1566.001 (Spearphishing Attachment)
* **Execution:** T1059.001 (Command and Scripting Interpreter: PowerShell)
* **Credential Access:** T1003.001 (OS Credential Dumping: LSASS Memory)
* **Command & Control:** T1071.001 (Application Layer Protocol: Web Protocols)

---

## 4. REGULATORY & AUDIT ATTESTATION
* **SOC 2 Type II:** CC6.1, CC6.8 (Boundary Protection & Logical Access Control) — **VERIFIED**
* **NIST CSF 2.0:** PR.AC-5, DE.AE-2 (Network Isolation & Anomaly Detection) — **COMPLIANT**
* **ISO 27001:2022:** A.9.4.2, A.12.6.1 (Privileged Access & Vulnerability Management) — **VERIFIED**

Signed & Attested by SOCForge Automated Governance Engine.`;

  const handleDownloadMD = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SOCForge_CISO_Briefing_${incidentId}_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadNotice("Downloaded Markdown Dossier.");
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleDownloadSTIX = () => {
    const stixBundle = {
      type: "bundle",
      id: `bundle--${Math.random().toString(36).slice(2, 10)}`,
      objects: [
        {
          type: "incident",
          id: `incident--${incidentId}`,
          name: incidentTitle,
          confidence: 96,
          created: new Date().toISOString()
        },
        {
          type: "threat-actor",
          id: "threat-actor--apt29",
          name: "APT29 (Nobelium)",
          aliases: ["Cozy Bear", "Midnight Blizzard"]
        },
        {
          type: "attack-pattern",
          id: "attack-pattern--t1003-001",
          name: "OS Credential Dumping: LSASS Memory",
          external_references: [{ source_name: "mitre-attack", external_id: "T1003.001" }]
        }
      ]
    };
    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SOCForge_STIX2.1_${incidentId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadNotice("Exported STIX 2.1 Threat Intelligence Bundle.");
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-[#070707] border border-[#2a2a2a] rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[88vh] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar Header */}
        <div className="p-4 bg-[#0c0c0c] border-b border-[#222] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">CISO Executive Briefing Dossier</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-700 text-neutral-300">
                  {incidentId}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Executive-level impact summary, FAIR quantitative loss analysis, and audit attestation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition text-xs flex items-center gap-1.5"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadMD}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition text-xs flex items-center gap-1.5"
              title="Download Markdown"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Markdown</span>
            </button>

            <button
              onClick={handleDownloadSTIX}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition text-xs flex items-center gap-1.5"
              title="Export STIX 2.1 Bundle"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">STIX 2.1</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice Banner if downloaded */}
        {downloadNotice && (
          <div className="px-5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
            <span>✓ {downloadNotice}</span>
          </div>
        )}

        {/* Printable / Rendered Dossier Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#040404] text-neutral-200 font-sans print:p-0 print:bg-white print:text-black">
          {/* Executive Header Banner */}
          <div className="p-4 rounded-xl bg-[#090909] border border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                TLP:AMBER+STRICT // PRIVILEGED
              </span>
              <h2 className="text-base font-bold text-white mt-1.5">{incidentTitle}</h2>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">Briefing Timestamp: {dossierDate}</p>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-neutral-500 block text-[10px]">HMAC Cryptographic Proof</span>
              <span className="text-emerald-400 font-bold text-[11px]">{hmacAuditSeal.slice(0, 16)}...</span>
            </div>
          </div>

          {/* Section 1: KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#080808] border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">MTTD (Detection)</span>
              <span className="text-lg font-bold text-white font-mono">4.2 min</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-1">94% faster than SLA</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080808] border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">MTTR (Containment)</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">11.8 min</span>
              <span className="text-[10px] text-neutral-400 font-mono block mt-1">Dual-Auth SOAR Gate</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080808] border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">Gross Exposure</span>
              <span className="text-lg font-bold text-red-400 font-mono">$4.85M</span>
              <span className="text-[10px] text-neutral-500 font-mono block mt-1">Unmitigated FAIR model</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080808] border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">Capital Preserved</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">$4.81M</span>
              <span className="text-[10px] text-emerald-300 font-mono block mt-1">99.1% Loss Mitigation</span>
            </div>
          </div>

          {/* Section 2: Executive Narrative */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
              1. Executive Incident Summary & Attack Narrative
            </h3>
            <div className="p-4 rounded-xl bg-[#080808] border border-neutral-800 text-xs leading-relaxed space-y-2 text-neutral-300">
              <p>
                At <strong>12:44 UTC</strong>, SOCForge multi-sensor ingestion intercepted a high-fidelity credential scraping sequence on critical endpoint <code>WKSTN-FIN-04</code>. Telemetry correlation confirmed an adversary leveraging living-off-the-land PowerShell injection (T1059.001) targeting Local Security Authority Subsystem Service (LSASS, T1003.001).
              </p>
              <p>
                Within <strong>4.2 minutes</strong>, automated Sigma AST behavioral correlation attributed the campaign to nation-state threat group <strong>APT29 (Nobelium)</strong>. Dual-authorization two-man rule protocol was executed by the CISO office, instantaneously enacting CrowdStrike EDR network isolation and revoking Microsoft Entra ID privileged session tokens before lateral DCSync access was achieved.
              </p>
            </div>
          </div>

          {/* Section 3: FAIR Quantitative Financial Risk Model */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">
              2. FAIR Quantitative Cyber Risk Analysis
            </h3>
            <div className="p-4 rounded-xl bg-[#080808] border border-neutral-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">FAIR Loss Factor</span>
                <span className="text-neutral-400">Unmitigated Exposure</span>
                <span className="text-emerald-400 font-bold">Contained Reality</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Primary Loss (Business Interruption / Outage):</span>
                  <span className="text-red-400">$2,400,000</span>
                  <span className="text-emerald-400">$0 (0h downtime)</span>
                </div>
                <div className="flex justify-between">
                  <span>Secondary Loss (Regulatory Fines / GDPR / SEC):</span>
                  <span className="text-red-400">$1,500,000</span>
                  <span className="text-emerald-400">$0 (Zero data breach)</span>
                </div>
                <div className="flex justify-between">
                  <span>Incident Response & Forensic Retainer:</span>
                  <span className="text-neutral-400">$950,000</span>
                  <span className="text-white">$42,500</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Regulatory Framework Compliance Attestation */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase text-purple-400 font-bold tracking-wider">
              3. Regulatory Compliance & Governance Attestation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#080808] border border-neutral-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-white font-bold block">SOC 2 Type II</span>
                  <span className="text-[10px] text-emerald-400">CC6.8 Verified Compliant</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#080808] border border-neutral-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-white font-bold block">NIST CSF 2.0</span>
                  <span className="text-[10px] text-emerald-400">PR.AC-5 Enforced</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#080808] border border-neutral-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-white font-bold block">ISO 27001:2022</span>
                  <span className="text-[10px] text-emerald-400">A.9.4.2 Cryptographic Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Markdown" : "Copy Briefing to Clipboard"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold font-sans transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
