"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  ShieldAlert, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Lock, 
  Activity, 
  Network, 
  Cpu, 
  Server, 
  ShieldCheck, 
  X, 
  Radio, 
  ArrowRight,
  Zap,
  Clock
} from "lucide-react";

export interface SimulationStep {
  stage: number;
  phase: string;
  mitreId: string;
  name: string;
  description: string;
  targetAsset: string;
  actor: string;
  telemetryLogs: string[];
  status: "pending" | "running" | "completed" | "contained";
  severity: "low" | "medium" | "high" | "critical";
}

const DEFAULT_STAGES: SimulationStep[] = [
  {
    stage: 1,
    phase: "Initial Access",
    mitreId: "T1566.001",
    name: "Spearphishing Attachment Delivery",
    description: "Weaponized macro-enabled XLSX payload delivered to Finance workstation WKSTN-FIN-04.",
    targetAsset: "WKSTN-FIN-04 (10.0.4.18)",
    actor: "APT29 (Cozy Bear)",
    telemetryLogs: [
      "[14:22:01.104] [SYSMON EID 15] FileCreateStreamHash: WKSTN-FIN-04\\jdoe downloaded invoice_q3_report.xlsm:Zone.Identifier",
      "[14:22:03.220] [EXCEL.EXE] Process spawned with PID 3892, spawning child script interpreter",
      "[14:22:03.882] [EDR TELEMETRY] Low-reputation binary dropped to %APPDATA%\\Local\\Temp\\scvhost.vbs"
    ],
    status: "pending",
    severity: "medium"
  },
  {
    stage: 2,
    phase: "Execution",
    mitreId: "T1059.001",
    name: "Obfuscated PowerShell Memory Injection",
    description: "AMSI memory patch executed followed by base64 encoded reflective payload staging.",
    targetAsset: "WKSTN-FIN-04 (10.0.4.18)",
    actor: "APT29 (Cozy Bear)",
    telemetryLogs: [
      "[14:22:08.411] [SYSMON EID 1] Image: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
      "[14:22:08.412] [CMDLINE] powershell.exe -noni -w hidden -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...",
      "[14:22:09.004] [AMSI BUFFER] Pattern match bypassed: Memory patch applied to AmsiScanBuffer address 0x7FFA8E12",
      "[14:22:09.430] [SYSMON EID 7] ImageLoaded: System.Management.Automation.ni.dll into unmanaged memory space"
    ],
    status: "pending",
    severity: "high"
  },
  {
    stage: 3,
    phase: "Credential Access",
    mitreId: "T1003.001",
    name: "LSASS Process Memory Dump (Mimikatz)",
    description: "Reflective DLL injects into LSASS to scrape plaintext Kerberos tickets and NTLM hashes.",
    targetAsset: "WKSTN-FIN-04 -> SRV-DC-01 (10.0.0.1)",
    actor: "APT29 (Cozy Bear)",
    telemetryLogs: [
      "[14:22:15.110] [SYSMON EID 10] ProcessAccess: Source=powershell.exe (PID 4892) -> Target=lsass.exe (PID 644)",
      "[14:22:15.112] [SECURITY EID 4673] Privileged Service Called: SeDebugPrivilege granted to corp\\jdoe token",
      "[14:22:16.002] [KERBEROS EXPLOIT] DCSync request detected targeting krbtgt service account on SRV-DC-01",
      "[14:22:16.890] [NTDS DUMP] Extracted NTLM hash for Domain Administrator corp\\da_smith"
    ],
    status: "pending",
    severity: "critical"
  },
  {
    stage: 4,
    phase: "Detection & SIEM Correlation",
    mitreId: "RULE-MATCH",
    name: "Sigma Rule Match & High-Fidelity Alert Triaged",
    description: "Correlation engine triggers SIGMA-0042 (LSASS Memory Read) & behavioral anomaly engine.",
    targetAsset: "SOCForge Detection Pipeline",
    actor: "SOCForge Real-Time Engine",
    telemetryLogs: [
      "[14:22:18.012] [CORRELATION MATCH] Rule 'SIGMA-0042: LSASS Memory Dumping via OpenProcess' fired (Weight: 98)",
      "[14:22:18.150] [THREAT SCORE] Workstation WKSTN-FIN-04 risk escalated from 22 -> 96 (CRITICAL)",
      "[14:22:18.290] [INCIDENT CREATED] INC-2026-8812 automatically opened and classified TLP:AMBER",
      "[14:22:18.410] [NOTIFICATION] On-duty SecOps Lead & CISO alerted via PagerDuty webhook"
    ],
    status: "pending",
    severity: "critical"
  },
  {
    stage: 5,
    phase: "Autonomous Response",
    mitreId: "T1078-MITIGATION",
    name: "Two-Man Rule Dual-Auth Host Containment & Token Revocation",
    description: "SOAR playbook executes cryptographic host network isolation & Entra ID token revocation.",
    targetAsset: "WKSTN-FIN-04 (Isolated) + Entra ID",
    actor: "SOAR Auto-Containment Agent",
    telemetryLogs: [
      "[14:22:21.050] [SOAR ACTION] Host isolation command sent to CrowdStrike Falcon / Defender EDR agent",
      "[14:22:21.400] [FIREWALL] Port quarantine VLAN enforced on switch port Gi1/0/18 (All egress dropped except SOC C2)",
      "[14:22:22.100] [IDP WEBHOOK] Microsoft Graph API revoked all active refresh tokens for corp\\jdoe",
      "[14:22:22.950] [INCIDENT RESOLVED] Threat neutralized. Dwell time: 21.84 seconds. Data exfiltration blocked."
    ],
    status: "pending",
    severity: "critical"
  }
];

interface LiveAttackSimulationEngineProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerDualAuth?: (host: string) => void;
}

export function LiveAttackSimulationEngine({
  isOpen,
  onClose,
  onTriggerDualAuth
}: LiveAttackSimulationEngineProps) {
  const [stages, setStages] = useState<SimulationStep[]>(DEFAULT_STAGES);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(1);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM READY] SOCForge APT Breach Simulator initialized.",
    "[SYSTEM READY] Target Environment: Simulated Corporate Subnet (10.0.0.0/16).",
    "[STANDBY] Press 'Play Simulation' to initiate adversary campaign playback."
  ]);
  const [dwellSeconds, setDwellSeconds] = useState<number>(0);
  const [breachContained, setBreachContained] = useState<boolean>(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Handle Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalDelay = 3500 / speedMultiplier;

    timerRef.current = setInterval(() => {
      setCurrentStageIdx((prevIdx) => {
        if (prevIdx >= stages.length) {
          setIsPlaying(false);
          setBreachContained(true);
          return prevIdx;
        }

        const activeStage = stages[prevIdx];
        
        // Append telemetry logs
        setTerminalLogs((prev) => [
          ...prev,
          `--- [STAGE ${activeStage.stage}/5: ${activeStage.phase.toUpperCase()}] ---`,
          ...activeStage.telemetryLogs
        ]);

        // Update stage status
        setStages((prevStages) =>
          prevStages.map((st, i) => {
            if (i < prevIdx) return { ...st, status: "completed" };
            if (i === prevIdx) return { ...st, status: i === 4 ? "contained" : "completed" };
            if (i === prevIdx + 1) return { ...st, status: "running" };
            return st;
          })
        );

        if (prevIdx + 1 >= stages.length) {
          setIsPlaying(false);
          setBreachContained(true);
          return prevIdx + 1;
        }

        return prevIdx + 1;
      });
    }, intervalDelay);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMultiplier, stages]);

  // Dwell time counter
  useEffect(() => {
    let dwellInterval: NodeJS.Timeout;
    if (isPlaying) {
      dwellInterval = setInterval(() => {
        setDwellSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(dwellInterval);
  }, [isPlaying]);

  const handlePlay = () => {
    if (currentStageIdx >= stages.length) {
      handleReset();
      setTimeout(() => setIsPlaying(true), 200);
    } else {
      setIsPlaying(true);
      if (currentStageIdx === 0 && stages[0].status === "pending") {
        setStages((prev) => prev.map((s, i) => (i === 0 ? { ...s, status: "running" } : s)));
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStageIdx(0);
    setDwellSeconds(0);
    setBreachContained(false);
    setStages(DEFAULT_STAGES.map((s) => ({ ...s, status: "pending" })));
    setTerminalLogs([
      "[SYSTEM RESET] Simulation pipeline restored to pre-breach baseline.",
      "[STANDBY] Press 'Play Simulation' to execute scenario."
    ]);
  };

  const handleStepForward = () => {
    if (currentStageIdx >= stages.length) return;
    const activeStage = stages[currentStageIdx];
    setTerminalLogs((prev) => [
      ...prev,
      `--- [MANUAL STEP ${activeStage.stage}/5: ${activeStage.phase.toUpperCase()}] ---`,
      ...activeStage.telemetryLogs
    ]);
    setStages((prev) =>
      prev.map((st, i) => {
        if (i < currentStageIdx) return { ...st, status: "completed" };
        if (i === currentStageIdx) return { ...st, status: i === 4 ? "contained" : "completed" };
        if (i === currentStageIdx + 1) return { ...st, status: "running" };
        return st;
      })
    );
    const nextIdx = currentStageIdx + 1;
    setCurrentStageIdx(nextIdx);
    if (nextIdx >= stages.length) {
      setIsPlaying(false);
      setBreachContained(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-5xl bg-[#050505] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-neutral-200">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-[#0A0A0A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  Live APT Breach Playback & Automated Containment Simulation
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-semibold">
                  APT29 / COZY BEAR
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Interactive real-time execution harness mapping adversary telemetry to automated SOAR quarantine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playback Controls & Status Stats */}
        <div className="px-6 py-3 border-b border-neutral-800 bg-[#080808] flex flex-wrap items-center justify-between gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs transition shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{currentStageIdx >= stages.length ? "Replay Simulation" : "Play Simulation"}</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs transition"
              >
                <Pause className="w-3.5 h-3.5 fill-black" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStepForward}
              disabled={isPlaying || currentStageIdx >= stages.length}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-neutral-200 border border-neutral-800 font-mono text-xs transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Step Next</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-mono text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center ml-2 border border-neutral-800 rounded-lg overflow-hidden bg-black text-[11px] font-mono">
              {([1, 2, 4] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2.5 py-1 transition ${
                    speedMultiplier === spd 
                      ? "bg-white text-black font-bold" 
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Status Badges */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-400">Dwell Clock:</span>
              <span className="text-white font-bold">{dwellSeconds}s</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-neutral-400">Active Stage:</span>
              <span className="text-cyan-400 font-bold">
                {Math.min(currentStageIdx + (isPlaying ? 1 : 0), 5)} / 5
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                breachContained 
                  ? "bg-emerald-400" 
                  : isPlaying 
                  ? "bg-red-400 animate-ping" 
                  : "bg-neutral-500"
              }`} />
              <span className={`font-bold ${
                breachContained 
                  ? "text-emerald-400" 
                  : isPlaying 
                  ? "text-red-400" 
                  : "text-neutral-400"
              }`}>
                {breachContained ? "CONTAINED & QUARANTINED" : isPlaying ? "ATTACK IN PROGRESS" : "READY"}
              </span>
            </div>
          </div>
        </div>

        {/* Simulation Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Attack Stages Progression (5 Cols) */}
          <div className="lg:col-span-6 border-r border-neutral-800 p-5 overflow-y-auto space-y-3 bg-[#030303]">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                Kill Chain Attack Stages
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                MITRE Enterprise Matrix
              </span>
            </div>

            {stages.map((st, idx) => {
              const isCurrent = (idx === currentStageIdx && isPlaying) || (idx === currentStageIdx - 1 && !isPlaying && st.status === "running");
              const isPast = st.status === "completed" || st.status === "contained";

              return (
                <div
                  key={st.stage}
                  className={`p-3.5 rounded-xl border transition ${
                    st.status === "contained"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                      : isCurrent
                      ? "bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/10"
                      : isPast
                      ? "bg-neutral-900/60 border-neutral-800 text-neutral-300"
                      : "bg-black/40 border-neutral-900 text-neutral-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        st.status === "contained"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : isCurrent
                          ? "bg-red-500/20 text-red-300 animate-pulse"
                          : isPast
                          ? "bg-neutral-800 text-neutral-300"
                          : "bg-neutral-900 text-neutral-600"
                      }`}>
                        STAGE {st.stage}
                      </span>
                      <span className="text-xs font-bold font-mono text-white">
                        {st.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-neutral-400 border border-neutral-800 px-1.5 py-0.5 rounded bg-black">
                        {st.mitreId}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                    {st.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-500">Target: <strong className="text-neutral-300">{st.targetAsset}</strong></span>
                    <span className={`font-semibold ${
                      st.status === "contained" 
                        ? "text-emerald-400" 
                        : isCurrent 
                        ? "text-red-400 flex items-center gap-1" 
                        : isPast 
                        ? "text-neutral-400" 
                        : "text-neutral-600"
                    }`}>
                      {st.status === "contained" && "Mitigated & Quarantined"}
                      {isCurrent && <><Radio className="w-3 h-3 animate-spin text-red-400" /> Executing...</>}
                      {isPast && st.status !== "contained" && "Executed (Captured)"}
                      {st.status === "pending" && "Standby"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Trigger Two-Man Containment Gate button if Stage 4 or 5 */}
            {currentStageIdx >= 3 && onTriggerDualAuth && (
              <div className="pt-2 animate-in fade-in">
                <button
                  onClick={() => onTriggerDualAuth("WKSTN-FIN-04")}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 transition shadow-xl shadow-red-600/20"
                >
                  <Lock className="w-4 h-4" />
                  <span>Launch Two-Man Rule Containment Gate</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Telemetry Terminal & Threat Map (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col bg-[#010101] overflow-hidden">
            
            {/* Simulation Topology Mini-Diagram */}
            <div className="p-4 border-b border-neutral-800 bg-[#060606]">
              <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-neutral-400">
                <span className="uppercase font-bold text-neutral-300">Active Subnet Node Topology</span>
                <span className="text-[10px] text-cyan-400">Live Agent Heartbeat</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-xl border text-center transition ${
                  breachContained
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : currentStageIdx >= 1
                    ? "bg-red-500/15 border-red-500/50 shadow-md shadow-red-500/20"
                    : "bg-black border-neutral-800"
                }`}>
                  <Server className={`w-5 h-5 mx-auto mb-1 ${
                    breachContained ? "text-emerald-400" : currentStageIdx >= 1 ? "text-red-400" : "text-neutral-500"
                  }`} />
                  <div className="text-[11px] font-bold font-mono text-white truncate">WKSTN-FIN-04</div>
                  <div className="text-[9px] font-mono text-neutral-400">10.0.4.18 (Victim)</div>
                  <div className="mt-1 text-[9px] font-mono font-bold">
                    {breachContained ? (
                      <span className="text-emerald-400">ISOLATED</span>
                    ) : currentStageIdx >= 1 ? (
                      <span className="text-red-400 animate-pulse">COMPROMISED</span>
                    ) : (
                      <span className="text-neutral-500">CLEAN</span>
                    )}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-center transition ${
                  currentStageIdx >= 3
                    ? "bg-amber-500/15 border-amber-500/50"
                    : "bg-black border-neutral-800"
                }`}>
                  <Cpu className={`w-5 h-5 mx-auto mb-1 ${
                    currentStageIdx >= 3 ? "text-amber-400" : "text-neutral-500"
                  }`} />
                  <div className="text-[11px] font-bold font-mono text-white truncate">SRV-DC-01</div>
                  <div className="text-[9px] font-mono text-neutral-400">10.0.0.1 (Domain Ctrl)</div>
                  <div className="mt-1 text-[9px] font-mono font-bold">
                    {currentStageIdx >= 3 ? (
                      <span className="text-amber-400">TARGETED (DCSync)</span>
                    ) : (
                      <span className="text-neutral-500">PROTECTED</span>
                    )}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-center transition ${
                  currentStageIdx >= 4
                    ? "bg-cyan-500/15 border-cyan-500/50"
                    : "bg-black border-neutral-800"
                }`}>
                  <ShieldCheck className={`w-5 h-5 mx-auto mb-1 ${
                    currentStageIdx >= 4 ? "text-cyan-400" : "text-neutral-500"
                  }`} />
                  <div className="text-[11px] font-bold font-mono text-white truncate">SOAR Pipeline</div>
                  <div className="text-[9px] font-mono text-neutral-400">SOC Automation</div>
                  <div className="mt-1 text-[9px] font-mono font-bold">
                    {currentStageIdx >= 4 ? (
                      <span className="text-cyan-400">ENFORCING</span>
                    ) : (
                      <span className="text-neutral-500">LISTENING</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Terminal Header */}
            <div className="px-4 py-2 border-b border-neutral-800 bg-[#0A0A0A] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-300">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Adversary & Sensor Telemetry Feed</span>
              </div>
              <span className="text-[10px] text-neutral-500">
                Sysmon • EventLog • EDR Raw JSON
              </span>
            </div>

            {/* Live Streaming Terminal Output */}
            <div 
              ref={terminalRef}
              className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1.5 bg-[#000000] text-neutral-300"
            >
              {terminalLogs.map((log, index) => {
                const isHeader = log.startsWith("---");
                const isError = log.includes("EXPLOIT") || log.includes("CRITICAL") || log.includes("COMPROMISED") || log.includes("DCSync");
                const isSuccess = log.includes("RESOLVED") || log.includes("ISOLATED") || log.includes("READY") || log.includes("MATCH");
                const isCmd = log.includes("[CMDLINE]") || log.includes("[SYSMON");

                return (
                  <div
                    key={index}
                    className={`${
                      isHeader
                        ? "text-yellow-400 font-bold pt-2 border-t border-neutral-900"
                        : isError
                        ? "text-red-400 font-semibold"
                        : isSuccess
                        ? "text-emerald-400"
                        : isCmd
                        ? "text-cyan-300"
                        : "text-neutral-400"
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-[#080808] flex items-center justify-between text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">Adversary TTP:</span>
            <span>T1566.001 ➔ T1059.001 ➔ T1003.001 (Mimikatz) ➔ T1078 (Lateral Movement)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-semibold">MTTD: 17.2s</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">MTTR: 21.8s</span>
          </div>
        </div>

      </div>
    </div>
  );
}
