"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Search,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Globe,
  Terminal,
  Activity,
  Layers,
  Lock,
  ArrowRight,
  Crosshair,
  UserCheck
} from "lucide-react";

interface TriageTraceStep {
  phase: string;
  title: string;
  detail: string;
  badge?: string;
  type: "thought" | "tool_call" | "observation" | "decision";
}

interface TriageResult {
  observable: string;
  type: "IP" | "COMMAND" | "DOMAIN" | "HASH";
  confidence: number;
  threatActor: string;
  actorGroup: string;
  mitreTtp: string;
  victimAsset: string;
  recommendations: Array<{
    id: string;
    action: string;
    target: string;
    impact: string;
    status: "PENDING" | "AUTHORIZED" | "EXECUTED";
  }>;
}

export function AutonomousAIAgentPlayground() {
  const [inputVal, setInputVal] = useState("185.220.101.5");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({});

  const PRESETS = [
    { label: "Cobalt Strike C2 IP", value: "185.220.101.5", type: "IP" },
    { label: "LSASS Memory Dump", value: "powershell.exe -enc JABzACAAPQAgAE4AZQB3...", type: "COMMAND" },
    { label: "Volt Typhoon Domain", value: "cobalt-c2.corp-update.org", type: "DOMAIN" },
    { label: "Mimikatz SHA-256", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", type: "HASH" }
  ];

  const SIMULATED_STEPS: TriageTraceStep[] = [
    {
      phase: "PHASE 1",
      title: "Telemetry Blast-Radius Scan",
      detail: "Probed Wazuh EDR, Splunk HEC, and Zeek logs. Found 18 candidate events correlated to host WIN-FIN-04 within the 1-hour detection window.",
      badge: "Wazuh + Splunk",
      type: "tool_call"
    },
    {
      phase: "PHASE 2",
      title: "Diamond Model Adversary Attribution",
      detail: "Cross-referenced TTPs against 312+ threat actors in STIX 2.1 repository. High-confidence alignment identified with APT29 (Midnight Blizzard).",
      badge: "98.4% Confidence",
      type: "thought"
    },
    {
      phase: "PHASE 3",
      title: "MITRE ATT&CK TTP Alignment",
      detail: "Identified T1059.001 (Command & Scripting Interpreter) chained to T1003.001 (OS Credential Dumping: LSASS Memory) and T1071.004 (DNS C2 Exfiltration).",
      badge: "T1003.001",
      type: "observation"
    },
    {
      phase: "PHASE 4",
      title: "Autonomous Dual-Control SOAR Formulation",
      detail: "Synthesized automated containment checklist requiring dual human signatures before network isolation of host WIN-FIN-04.",
      badge: "Containment Gate",
      type: "decision"
    }
  ];

  const handleRunTriage = () => {
    if (!inputVal.trim() || isRunning) return;
    setIsRunning(true);
    setCurrentStepIndex(0);
    setTriageResult(null);
    setActionStates({});

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < SIMULATED_STEPS.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setTriageResult({
          observable: inputVal,
          type: inputVal.includes("powershell") ? "COMMAND" : inputVal.includes(".") && !inputVal.includes(".org") ? "IP" : inputVal.includes(".org") ? "DOMAIN" : "HASH",
          confidence: 98.4,
          threatActor: "APT29 (Midnight Blizzard)",
          actorGroup: "State-Sponsored Advanced Threat Group",
          mitreTtp: "T1059.001 → T1003.001 → T1071.004",
          victimAsset: "WIN-FIN-04 (Finance Subnet 192.168.1.144)",
          recommendations: [
            { id: "act-1", action: "Network Isolation via CrowdStrike / Wazuh", target: "Host: WIN-FIN-04", impact: "Zero network ingress/egress except SIEM telemetry", status: "PENDING" },
            { id: "act-2", action: "Revoke Kerberos TGT & Entra ID Tokens", target: "Account: svc_backup", impact: "Immediately invalidates all active sessions", status: "PENDING" },
            { id: "act-3", action: "Block Observable on Cloudflare Edge WAF", target: inputVal, impact: "Blocks perimeter egress across corporate gateway", status: "PENDING" }
          ]
        });
      }
    }, 600);
  };

  const handleAuthorizeAction = (id: string) => {
    setActionStates(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="bg-[#050505] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white font-sans">Autonomous AI SOC Agent Triage Playground</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                LIVE INTERACTIVE SANDBOX
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans">
              Test zero-pivot reasoning on any IP, domain, hash, or suspicious command line.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="px-3.5 py-1.5 rounded-xl border border-[#262626] bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <span>Open Full War Room</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </Link>
      </div>

      {/* Preset Observable Pills */}
      <div className="space-y-2">
        <label className="text-neutral-500 text-[10px] uppercase font-bold block">
          Select Threat Observable or Paste Any Custom Indicator:
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputVal(p.value);
                setTriageResult(null);
                setCurrentStepIndex(-1);
              }}
              className={`px-3 py-1.5 rounded-xl border text-[11px] transition flex items-center gap-1.5 ${
                inputVal === p.value
                  ? "bg-white text-black font-bold border-white"
                  : "bg-black border-[#262626] text-neutral-300 hover:text-white hover:border-neutral-500"
              }`}
            >
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono">
                {p.type}
              </span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Field + Launch Action */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter Observable (e.g. 185.220.101.5, powershell.exe -enc...)"
            className="w-full px-4 py-2.5 bg-[#020202] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        <button
          onClick={handleRunTriage}
          disabled={isRunning || !inputVal.trim()}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Observable...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Execute Autonomous Triage</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Multi-Step Agent Execution Trace */}
      {currentStepIndex >= 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-white font-sans">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Autonomous Agent Trace Telemetry
            </span>
            <span>Step {Math.min(currentStepIndex + 1, SIMULATED_STEPS.length)} of {SIMULATED_STEPS.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SIMULATED_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex && isRunning;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition duration-200 space-y-1.5 ${
                    isCurrent
                      ? "bg-emerald-950/20 border-emerald-500/50 text-white animate-pulse"
                      : isPast
                      ? "bg-black border-[#2a2a2a] text-neutral-200"
                      : "bg-[#080808] border-[#1a1a1a] text-neutral-600 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400">{step.phase}</span>
                    {step.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-neutral-900 border border-[#262626] text-neutral-300">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-white text-xs font-sans">{step.title}</div>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Synthesized Triage & Diamond Model Card */}
      {triageResult && (
        <div className="p-5 rounded-2xl bg-black border border-emerald-500/30 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Synthesized Threat Dossier</span>
              <h3 className="text-sm font-bold text-white font-sans">{triageResult.observable}</h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                CRITICAL THREAT
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                CONFIDENCE: {triageResult.confidence}%
              </span>
            </div>
          </div>

          {/* Diamond Model 4 Quadrants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#090909] border border-[#222] space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold block">1. Adversary</span>
              <div className="text-white font-bold text-xs">{triageResult.threatActor}</div>
              <div className="text-[10px] text-neutral-400 font-sans">{triageResult.actorGroup}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#090909] border border-[#222] space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold block">2. Capability / TTP</span>
              <div className="text-amber-400 font-bold text-xs">{triageResult.mitreTtp}</div>
              <div className="text-[10px] text-neutral-400 font-sans">PowerShell Injection + LSASS Dump</div>
            </div>

            <div className="p-3 rounded-xl bg-[#090909] border border-[#222] space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold block">3. Infrastructure</span>
              <div className="text-cyan-400 font-bold text-xs">{triageResult.observable}</div>
              <div className="text-[10px] text-neutral-400 font-sans">Tor Exit Relay / Cloudflare Egress</div>
            </div>

            <div className="p-3 rounded-xl bg-[#090909] border border-[#222] space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold block">4. Victim Asset</span>
              <div className="text-red-400 font-bold text-xs">{triageResult.victimAsset}</div>
              <div className="text-[10px] text-neutral-400 font-sans">Critical Finance Subnet Node</div>
            </div>
          </div>

          {/* Dual-Gated Containment Authorization List */}
          <div className="space-y-2 pt-2 border-t border-[#1a1a1a]">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5 font-sans">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                Proposed 4-Eyes SOAR Containment Actions:
              </span>
              <span className="text-[10px] text-neutral-500">Requires Analyst Signature</span>
            </div>

            <div className="space-y-2">
              {triageResult.recommendations.map((rec) => {
                const isAuthorized = actionStates[rec.id];
                return (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-[#080808] border border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="text-white font-bold text-xs font-sans flex items-center gap-2">
                        <span>{rec.action}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono">
                          {rec.target}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-sans">{rec.impact}</div>
                    </div>

                    <button
                      onClick={() => handleAuthorizeAction(rec.id)}
                      disabled={isAuthorized}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                        isAuthorized
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                          : "bg-white hover:bg-neutral-200 text-black shadow-md"
                      }`}
                    >
                      {isAuthorized ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>4-EYES AUTHORIZED</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Authorize Action</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
