"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Clock,
  ShieldAlert,
  Flame,
  Activity,
  Terminal,
  Layers,
  ChevronRight
} from "lucide-react";

export interface TimelineStep {
  id: string;
  stepNumber: number;
  timestamp: string;
  relativeTime: string;
  tactic: string;
  technique: string;
  techniqueId: string;
  sourceEntity: string;
  targetEntity: string;
  action: string;
  commandLine?: string;
  riskScore: number;
  severity: "critical" | "high" | "medium" | "low";
}

export interface AttackTimelineScrubberProps {
  steps?: TimelineStep[];
  activeStepIndex?: number;
  onStepChange?: (index: number, step: TimelineStep) => void;
  className?: string;
}

const DEFAULT_ATTACK_STEPS: TimelineStep[] = [
  {
    id: "step-1",
    stepNumber: 1,
    timestamp: "2026-09-27 08:14:22 UTC",
    relativeTime: "T+00:00",
    tactic: "Initial Access",
    technique: "Spearphishing Attachment",
    techniqueId: "T1566.001",
    sourceEntity: "mail.external-relay.net",
    targetEntity: "WS-FINANCE-04 (j.smith)",
    action: "Inbound malicious invoice attachment 'Q3_Rebate_Report.xlsm' executed by user.",
    commandLine: "excel.exe /e C:\\Users\\jsmith\\Downloads\\Q3_Rebate_Report.xlsm",
    riskScore: 78,
    severity: "high"
  },
  {
    id: "step-2",
    stepNumber: 2,
    timestamp: "2026-09-27 08:14:59 UTC",
    relativeTime: "T+00:37",
    tactic: "Execution",
    technique: "PowerShell In-Memory Download",
    techniqueId: "T1059.001",
    sourceEntity: "WS-FINANCE-04",
    targetEntity: "185.220.101.5 (C2 Beacon)",
    action: "Obfuscated PowerShell spawned from Excel VBA macro, initiates HTTPS C2 beacon.",
    commandLine: "powershell.exe -w hidden -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...",
    riskScore: 88,
    severity: "high"
  },
  {
    id: "step-3",
    stepNumber: 3,
    timestamp: "2026-09-27 08:18:10 UTC",
    relativeTime: "T+03:48",
    tactic: "Defense Evasion",
    technique: "Process Injection (Process Hollowing)",
    techniqueId: "T1055.012",
    sourceEntity: "powershell.exe (PID 4892)",
    targetEntity: "svchost.exe (PID 1120)",
    action: "Injected Cobalt Strike payload into legit svchost.exe memory space to evade EDR hooks.",
    commandLine: "VirtualAllocEx -> WriteProcessMemory -> CreateRemoteThread",
    riskScore: 92,
    severity: "critical"
  },
  {
    id: "step-4",
    stepNumber: 4,
    timestamp: "2026-09-27 08:24:45 UTC",
    relativeTime: "T+10:23",
    tactic: "Credential Access",
    technique: "LSASS Memory Dumping",
    techniqueId: "T1003.001",
    sourceEntity: "svchost.exe (Injected)",
    targetEntity: "lsass.exe (PID 672)",
    action: "Spawned comsvcs.dll mini-dump routine to extract NTLM hashes & plaintext Kerberos tickets.",
    commandLine: "rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 672 C:\\temp\\ls.dmp full",
    riskScore: 98,
    severity: "critical"
  },
  {
    id: "step-5",
    stepNumber: 5,
    timestamp: "2026-09-27 08:31:02 UTC",
    relativeTime: "T+16:40",
    tactic: "Lateral Movement",
    technique: "Pass the Hash / SMB Remote Exec",
    techniqueId: "T1021.002",
    sourceEntity: "WS-FINANCE-04 (192.168.4.12)",
    targetEntity: "DC01.corp.internal (192.168.1.10)",
    action: "Authenticates to Domain Controller using extracted Domain Admin hash via SMB PsExec.",
    commandLine: "psexec.exe \\\\DC01.corp.internal -u CORP\\da_svc -p [NTLM:4b89...] cmd.exe",
    riskScore: 99,
    severity: "critical"
  },
  {
    id: "step-6",
    stepNumber: 6,
    timestamp: "2026-09-27 08:42:15 UTC",
    relativeTime: "T+27:53",
    tactic: "Exfiltration",
    technique: "Automated Archive & Cloud Exfil",
    techniqueId: "T1560.001",
    sourceEntity: "DC01.corp.internal",
    targetEntity: "vault-sync-api.mega.nz (Exfil)",
    action: "Staged NTDS.dit active directory database archive compressed and uploaded via encrypted HTTPS.",
    commandLine: "7za.exe a -pEncPass2026! C:\\temp\\ad_backup.7z C:\\Windows\\NTDS\\ntds.dit",
    riskScore: 96,
    severity: "critical"
  },
  {
    id: "step-7",
    stepNumber: 7,
    timestamp: "2026-09-27 08:45:00 UTC",
    relativeTime: "T+30:38",
    tactic: "Impact & Response",
    technique: "Four-Eyes Host Isolation Executed",
    techniqueId: "T1489 (Defended)",
    sourceEntity: "SOCForge SOAR Responder",
    targetEntity: "WS-FINANCE-04 & DC01",
    action: "SOC containment policy triggered: Host network isolated, Kerberos KRBTGT reset dispatched.",
    commandLine: "socforge-containment-agent isolate-host --dual-approved=true",
    riskScore: 20,
    severity: "low"
  }
];

export function AttackTimelineScrubber({
  steps = DEFAULT_ATTACK_STEPS,
  activeStepIndex: externalIndex,
  onStepChange,
  className
}: AttackTimelineScrubberProps) {
  const [currentIndex, setCurrentIndex] = useState(externalIndex || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (externalIndex !== undefined) {
      setCurrentIndex(externalIndex);
    }
  }, [externalIndex]);

  const activeStep = steps[currentIndex] || steps[0];

  const handleStepSelect = (idx: number) => {
    setCurrentIndex(idx);
    if (onStepChange && steps[idx]) {
      onStepChange(idx, steps[idx]);
    }
  };

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          if (onStepChange && steps[next]) {
            onStepChange(next, steps[next]);
          }
          return next;
        });
      }, 2400 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, steps, onStepChange]);

  const togglePlay = () => {
    if (currentIndex >= steps.length - 1) {
      handleStepSelect(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    handleStepSelect(0);
  };

  const handleStepForward = () => {
    if (currentIndex < steps.length - 1) {
      handleStepSelect(currentIndex + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentIndex > 0) {
      handleStepSelect(currentIndex - 1);
    }
  };

  const cycleSpeed = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(2);
    else if (playbackSpeed === 2) setPlaybackSpeed(4);
    else setPlaybackSpeed(1);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className={`p-4 rounded-xl bg-[#050505] border border-[#262626] shadow-2xl text-xs ${className || ""}`}>
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-[#262626] flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">
                Attack Sequence Time-Scrubber & Replay
              </span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-[#262626] text-[10px] font-mono text-neutral-300">
                Step {currentIndex + 1} of {steps.length}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              Interactive timeline visualization mapping causal lateral movement step-by-step
            </div>
          </div>
        </div>

        {/* Media Player Controls */}
        <div className="flex items-center gap-1.5 self-end md:self-auto bg-[#0a0a0a] p-1.5 rounded-lg border border-[#1f1f1f]">
          <button
            onClick={handleReset}
            title="Rewind to start"
            className="p-1.5 rounded hover:bg-[#1a1a1a] text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleStepBackward}
            disabled={currentIndex === 0}
            title="Step backward"
            className="p-1.5 rounded hover:bg-[#1a1a1a] disabled:opacity-30 text-neutral-400 hover:text-white transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={togglePlay}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-white hover:bg-neutral-200 text-black"
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? "Pause" : "Play Sequence"}</span>
          </button>
          <button
            onClick={handleStepForward}
            disabled={currentIndex === steps.length - 1}
            title="Step forward"
            className="p-1.5 rounded hover:bg-[#1a1a1a] disabled:opacity-30 text-neutral-400 hover:text-white transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={cycleSpeed}
            title="Cycle playback speed"
            className="px-2 py-1 rounded bg-[#171717] hover:bg-[#262626] text-[11px] font-mono font-medium text-neutral-300 transition-colors"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* Scrubbing Track Bar */}
      <div className="py-4">
        <div className="relative flex items-center justify-between">
          {/* Background Connecting Line */}
          <div className="absolute left-0 right-0 h-1 bg-[#1a1a1a] rounded-full z-0" />
          {/* Active Progress Fill Line */}
          <div
            className="absolute left-0 h-1 bg-white rounded-full transition-all duration-300 z-0"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />

          {/* Interactive Steps Nodes */}
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={step.id}
                onClick={() => handleStepSelect(idx)}
                className="relative z-10 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border transition-all duration-200 ${
                    isCurrent
                      ? "bg-white text-black border-white ring-4 ring-white/20 scale-125"
                      : isCompleted
                      ? "bg-[#171717] text-white border-neutral-400 hover:border-white"
                      : "bg-[#0a0a0a] text-neutral-500 border-[#262626] hover:border-neutral-500"
                  }`}
                >
                  {step.stepNumber}
                </div>
                <div className="absolute top-8 flex flex-col items-center pointer-events-none hidden md:flex">
                  <span
                    className={`text-[10px] font-mono whitespace-nowrap transition-colors ${
                      isCurrent ? "text-white font-bold" : "text-neutral-500 group-hover:text-neutral-300"
                    }`}
                  >
                    {step.relativeTime}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Narration & Telemetry Card */}
      <div className="mt-4 p-3.5 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded border text-[11px] font-mono uppercase bg-neutral-900 text-neutral-200 border-[#262626]">
              {activeStep.tactic}
            </span>
            <span className="text-xs font-mono font-medium text-white">
              {activeStep.technique} ({activeStep.techniqueId})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
              <Clock className="w-3 h-3" />
              <span>{activeStep.timestamp}</span>
            </div>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase font-bold ${getSeverityBadge(activeStep.severity)}`}>
              Risk {activeStep.riskScore}/100
            </span>
          </div>
        </div>

        {/* Action Description */}
        <div className="text-xs text-neutral-300 leading-relaxed">
          {activeStep.action}
        </div>

        {/* Causal Node Direction */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 bg-[#050505] px-2.5 py-1.5 rounded border border-[#171717]">
          <span className="text-neutral-500">Source:</span>
          <span className="text-neutral-200 font-semibold">{activeStep.sourceEntity}</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-500">Target:</span>
          <span className="text-rose-400 font-semibold">{activeStep.targetEntity}</span>
        </div>

        {/* Command Line / Artifact */}
        {activeStep.commandLine && (
          <div className="flex items-center gap-2 text-[11px] font-mono bg-[#050505] p-2 rounded border border-[#171717] overflow-x-auto text-neutral-300">
            <Terminal className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
            <span className="text-neutral-400 select-all">{activeStep.commandLine}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttackTimelineScrubber;
