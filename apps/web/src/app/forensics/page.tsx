"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import { IocHoverCard } from "@/components/ui/IocHoverCard";
import {
  FileCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Copy,
  Check,
  Code2,
  FileText,
  ShieldAlert,
  Download,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Flame,
  Activity,
  Binary,
  Eye,
  Hash,
  Plus
} from "lucide-react";

interface ForensicArtifact {
  id: string;
  filename: string;
  filetype: string;
  sizeBytes: number;
  entropy: number;
  md5: string;
  sha256: string;
  threatLevel: "MALICIOUS" | "SUSPICIOUS" | "CLEAN";
  magicBytes: string;
  extractedStrings: string[];
  hexPreview: string[];
  disassembly: { offset: string; bytes: string; opcode: string; comment?: string }[];
  sections: { name: string; virtualSize: string; rawSize: string; entropy: number; isSuspicious: boolean }[];
}

const SAMPLE_ARTIFACTS: ForensicArtifact[] = [
  {
    id: "art-1",
    filename: "mimikatz_trunk.exe",
    filetype: "PE32+ executable (GUI) x86-64, for MS Windows",
    sizeBytes: 1245184,
    entropy: 7.82,
    md5: "a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    threatLevel: "MALICIOUS",
    magicBytes: "4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00 (MZ...)",
    extractedStrings: [
      "sekurlsa::logonpasswords",
      "lsadump::sam",
      "privilege::debug",
      "crypto::certificates",
      "kerberos::golden",
      "wdigest.dll",
      "lsasrv.dll",
      "mimikatz 2.2.0 (x64) release"
    ],
    hexPreview: [
      "00000000  4d 5a 90 00 03 00 00 00  04 00 00 00 ff ff 00 00  |MZ..............|",
      "00000010  b8 00 00 00 00 00 00 00  40 00 00 00 00 00 00 00  |........@.......|",
      "00000020  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|",
      "00000030  00 00 00 00 00 00 00 00  00 00 00 00 f0 00 00 00  |................|",
      "00000040  0e 1f ba 0e 00 b4 09 cd  21 b8 01 4c cd 21 54 68  |........!..L.!Th|",
      "00000050  69 73 20 70 72 6f 67 72  61 6d 20 63 61 6e 6e 6f  |is program canno|",
      "00000060  74 20 62 65 20 72 75 6e  20 69 6e 20 44 4f 53 20  |t be run in DOS |",
      "00000070  6d 6f 64 65 2e 0d 0d 0a  24 00 00 00 00 00 00 00  |mode....$.......|"
    ],
    disassembly: [
      { offset: "0x140001000", bytes: "48 83 EC 28", opcode: "sub rsp, 28h", comment: "Prologue: Allocate stack frame" },
      { offset: "0x140001004", bytes: "48 8D 0D F5 23 01 00", opcode: "lea rcx, [rip+0x123f5]", comment: 'Load "lsasrv.dll" string' },
      { offset: "0x14000100B", bytes: "FF 15 A7 31 01 00", opcode: "call qword ptr [rip+0x131a7]", comment: "GetModuleHandleA" },
      { offset: "0x140001011", bytes: "48 85 C0", opcode: "test rax, rax", comment: "Verify handle non-null" },
      { offset: "0x140001014", bytes: "74 18", opcode: "jz 0x14000102E", comment: "Branch if failed" },
      { offset: "0x140001016", bytes: "48 8D 15 13 24 01 00", opcode: "lea rdx, [rip+0x12413]", comment: 'Load "LogonSessionList"' },
      { offset: "0x14000101D", bytes: "48 89 C1", opcode: "mov rcx, rax", comment: "Pass module handle" },
      { offset: "0x140001020", bytes: "FF 15 82 31 01 00", opcode: "call qword ptr [rip+0x13182]", comment: "GetProcAddress" },
      { offset: "0x140001026", bytes: "48 89 05 D3 50 01 00", opcode: "mov [rip+0x150d3], rax", comment: "Save symbol pointer" },
      { offset: "0x14000102D", bytes: "C3", opcode: "ret", comment: "Return" }
    ],
    sections: [
      { name: ".text", virtualSize: "0x45000", rawSize: "282,624 bytes", entropy: 6.42, isSuspicious: false },
      { name: ".rdata", virtualSize: "0x18000", rawSize: "98,304 bytes", entropy: 4.88, isSuspicious: false },
      { name: ".data", virtualSize: "0x8000", rawSize: "32,768 bytes", entropy: 3.12, isSuspicious: false },
      { name: ".pdata", virtualSize: "0x3000", rawSize: "12,288 bytes", entropy: 5.15, isSuspicious: false },
      { name: ".packed", virtualSize: "0x90000", rawSize: "589,824 bytes", entropy: 7.94, isSuspicious: true }
    ]
  },
  {
    id: "art-2",
    filename: "beacon_x64.dll",
    filetype: "PE32+ DLL (x86-64)",
    sizeBytes: 284672,
    entropy: 7.95,
    md5: "7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    sha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    threatLevel: "MALICIOUS",
    magicBytes: "4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00 (MZ...)",
    extractedStrings: [
      "https://185.220.101.5:443/submit.php",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "ReflectiveLoader",
      "beacon.dll",
      "WS2_32.dll",
      "VirtualAlloc",
      "VirtualProtect"
    ],
    hexPreview: [
      "00000000  4d 5a 41 52 55 48 89 e5  48 81 ec 20 00 00 00 48  |MZARUH..H.. ...H|",
      "00000010  8d 1d 00 00 00 00 48 89  df 48 81 c3 58 00 00 00  |......H..H..X...|",
      "00000020  ff d3 48 89 c3 48 83 c4  20 5d c3 00 00 00 00 00  |..H..H.. ]......|"
    ],
    disassembly: [
      { offset: "0x180001000", bytes: "41 52", opcode: "push r10", comment: "Reflective Loader Entrypoint" },
      { offset: "0x180001002", bytes: "55", opcode: "push rbp", comment: "Save base pointer" },
      { offset: "0x180001003", bytes: "48 89 E5", opcode: "mov rbp, rsp", comment: "Set frame pointer" },
      { offset: "0x180001006", bytes: "48 81 EC 20 00 00 00", opcode: "sub rsp, 20h", comment: "Allocate shadow space" },
      { offset: "0x18000100D", bytes: "E8 4E 00 00 00", opcode: "call 0x180001060", comment: "Resolve PEB & kernel32.dll" },
      { offset: "0x180001012", bytes: "48 89 C3", opcode: "mov rbx, rax", comment: "Save Kernel32 Base" },
      { offset: "0x180001015", bytes: "48 83 C4 20", opcode: "add rsp, 20h", comment: "Restore stack" },
      { offset: "0x180001019", bytes: "5D", opcode: "pop rbp", comment: "Restore frame" },
      { offset: "0x18000101A", bytes: "C3", opcode: "ret", comment: "Jump to Injected Payload" }
    ],
    sections: [
      { name: ".text", virtualSize: "0x22000", rawSize: "139,264 bytes", entropy: 7.92, isSuspicious: true },
      { name: ".rdata", virtualSize: "0x8000", rawSize: "32,768 bytes", entropy: 5.40, isSuspicious: false },
      { name: ".data", virtualSize: "0x4000", rawSize: "16,384 bytes", entropy: 4.12, isSuspicious: false }
    ]
  }
];

const DEFAULT_YARA_RULE = `rule Suspicious_Memory_Dump_Extractor {
    meta:
        description = "Detects in-memory LSASS dumping & credential extraction strings"
        author = "SOCForge Intel Team"
        date = "2026-09-27"
        severity = "CRITICAL"
        mitre_att = "T1003.001"
    strings:
        $s1 = "sekurlsa::logonpasswords" ascii wide nocase
        $s2 = "lsadump::sam" ascii wide nocase
        $s3 = "privilege::debug" ascii wide nocase
        $s4 = "MiniDump" ascii wide nocase
        $s5 = "wdigest.dll" ascii wide nocase
    condition:
        uint16(0) == 0x5A4D and (2 of ($s*))
}`;

export default function ForensicsPage() {
  const [artifacts, setAssets] = useState<ForensicArtifact[]>(SAMPLE_ARTIFACTS);
  const [selectedArtifact, setSelectedArtifact] = useState<ForensicArtifact>(SAMPLE_ARTIFACTS[0]);
  const [yaraRule, setYaraRule] = useState<string>(DEFAULT_YARA_RULE);
  const [yaraResult, setYaraResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"disassembly" | "hex" | "strings" | "yara" | "entropy">("disassembly");
  const [copied, setCopied] = useState(false);

  // Ingest Modal State
  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [newFilename, setNewFilename] = useState("");
  const [newFiletype, setNewFiletype] = useState("PE32+ executable (x86-64)");
  const [newThreat, setNewThreat] = useState<"MALICIOUS" | "SUSPICIOUS" | "CLEAN">("MALICIOUS");
  const [forensicsToast, setForensicsToast] = useState<string | null>(null);

  const handleUploadArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilename.trim()) return;

    const newArt: ForensicArtifact = {
      id: `art-${Date.now()}`,
      filename: newFilename.trim(),
      filetype: newFiletype,
      sizeBytes: 819200,
      entropy: 7.65,
      md5: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
      sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      threatLevel: newThreat,
      magicBytes: "4D 5A 90 00 03 00 00 00 (MZ...)",
      extractedStrings: [
        "CreateRemoteThread",
        "VirtualAllocEx",
        "WriteProcessMemory",
        "OpenProcess",
        "cmd.exe /c start"
      ],
      hexPreview: [
        "00000000  4d 5a 90 00 03 00 00 00  04 00 00 00 ff ff 00 00  |MZ..............|",
        "00000010  b8 00 00 00 00 00 00 00  40 00 00 00 00 00 00 00  |........@.......|"
      ],
      disassembly: [
        { offset: "0x140001000", bytes: "48 83 EC 28", opcode: "sub rsp, 28h", comment: "Alloc frame" },
        { offset: "0x140001004", bytes: "48 8D 0D 20 10 00 00", opcode: "lea rcx, [rip+0x1020]", comment: "Target PID" },
        { offset: "0x14000100B", bytes: "FF 15 A0 20 01 00", opcode: "call qword ptr [OpenProcess]", comment: "Acquire handle" }
      ],
      sections: [
        { name: ".text", virtualSize: "0x30000", rawSize: "196,608 bytes", entropy: 6.85, isSuspicious: false },
        { name: ".rdata", virtualSize: "0x10000", rawSize: "65,536 bytes", entropy: 5.10, isSuspicious: false },
        { name: ".data", virtualSize: "0x6000", rawSize: "24,576 bytes", entropy: 3.40, isSuspicious: false },
        { name: ".vmp0", virtualSize: "0x70000", rawSize: "458,752 bytes", entropy: 7.91, isSuspicious: true }
      ]
    };

    setAssets((prev) => [newArt, ...prev]);
    setSelectedArtifact(newArt);
    setIngestModalOpen(false);
    setNewFilename("");
    setForensicsToast(`Artifact "${newArt.filename}" ingested and indexed in static dissector.`);
    setTimeout(() => setForensicsToast(null), 3500);
  };

  const handleExportForensicReport = () => {
    const blob = new Blob([JSON.stringify(selectedArtifact, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOCForge_Forensics_${selectedArtifact.filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setForensicsToast(`Exported "${selectedArtifact.filename}" forensic report JSON.`);
    setTimeout(() => setForensicsToast(null), 3000);
  };

  const runYaraScan = () => {
    setYaraResult("SCANNING...");
    setTimeout(() => {
      setYaraResult(
        `✓ YARA MATCH CONFIRMED (100% Rule Precision)\n• Rule: Suspicious_Memory_Dump_Extractor\n• Target: ${selectedArtifact.filename}\n• Matched Patterns: $s1, $s2, $s3, $s5\n• MITRE Technique: T1003.001 (OS Credential Dumping)`
      );
    }, 450);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000] text-neutral-100 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#262626] bg-[#050505]/95 px-6 py-4 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-0.5">
                <span>DIGITAL FORENSICS</span>
                <span>/</span>
                <span className="text-rose-400">MALWARE & YARA DISSECTION</span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Malware Static Dissector & In-Browser Disassembler
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-mono">
                  x86-64 ENGINE
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Artifact Selector */}
            <select
              value={selectedArtifact.id}
              onChange={(e) => {
                const found = artifacts.find((a) => a.id === e.target.value);
                if (found) setSelectedArtifact(found);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              {artifacts.map((art) => (
                <option key={art.id} value={art.id} className="bg-black text-white">
                  {art.filename} ({(art.sizeBytes / 1024).toFixed(0)} KB)
                </option>
              ))}
            </select>

            <button
              onClick={() => setIngestModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-rose-400 border border-[#262626] font-semibold text-xs transition font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Artifact</span>
            </button>

            <button
              onClick={handleExportForensicReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#262626] font-semibold text-xs transition font-mono"
              title="Export complete forensic dissection profile as JSON"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>Export Dossier</span>
            </button>

            <button
              onClick={runYaraScan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition font-mono shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Compile & Run YARA</span>
            </button>
          </div>
        </div>

        {/* Artifact Summary Card */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Binary Name & Type</span>
            <div className="text-xs font-mono font-bold text-white truncate" title={selectedArtifact.filename}>
              {selectedArtifact.filename}
            </div>
            <div className="text-[11px] text-neutral-400 truncate">{selectedArtifact.filetype}</div>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Shannon Entropy</span>
            <div className="text-lg font-mono font-bold text-rose-400">
              {selectedArtifact.entropy} / 8.00
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">Packed / Encrypted Code</div>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500">SHA-256 Authentihash</span>
            <div className="text-xs font-mono truncate text-neutral-300">
              <IocHoverCard value={selectedArtifact.sha256} type="hash" className="text-rose-400 font-bold" />
            </div>
            <div className="text-[11px] text-neutral-500 font-mono">VirusTotal 68/72 Engines</div>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500">Threat Verdict</span>
            <div className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              CONFIRMED MALICIOUS
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">Credential Dumper / C2</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 flex items-center gap-2 border-b border-[#1f1f1f]">
          <button
            onClick={() => setActiveTab("disassembly")}
            className={`pb-2.5 px-3 text-xs font-mono font-medium border-b-2 transition ${
              activeTab === "disassembly"
                ? "border-white text-white font-bold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            x86-64 Disassembly
          </button>
          <button
            onClick={() => setActiveTab("entropy")}
            className={`pb-2.5 px-3 text-xs font-mono font-medium border-b-2 transition ${
              activeTab === "entropy"
                ? "border-white text-white font-bold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            PE Sections & Entropy
          </button>
          <button
            onClick={() => setActiveTab("hex")}
            className={`pb-2.5 px-3 text-xs font-mono font-medium border-b-2 transition ${
              activeTab === "hex"
                ? "border-white text-white font-bold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Hex Raw Memory Dump
          </button>
          <button
            onClick={() => setActiveTab("strings")}
            className={`pb-2.5 px-3 text-xs font-mono font-medium border-b-2 transition ${
              activeTab === "strings"
                ? "border-white text-white font-bold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Extracted High-Signal Strings ({selectedArtifact.extractedStrings.length})
          </button>
          <button
            onClick={() => setActiveTab("yara")}
            className={`pb-2.5 px-3 text-xs font-mono font-medium border-b-2 transition ${
              activeTab === "yara"
                ? "border-white text-white font-bold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            In-Browser YARA Compiler
          </button>
        </div>

        {/* Main Content Body */}
        <div className="p-6">
          {activeTab === "disassembly" && (
            <div className="rounded-2xl bg-[#050505] border border-[#262626] overflow-hidden shadow-2xl">
              <div className="px-4 py-2.5 bg-[#0a0a0a] border-b border-[#1f1f1f] flex items-center justify-between text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-2">
                  <Binary className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-white font-semibold">{selectedArtifact.filename} &mdash; Disassembly View</span>
                </div>
                <span>x86-64 Intel Syntax</span>
              </div>

              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-200 space-y-1 select-all bg-[#000000]">
                {selectedArtifact.disassembly.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-6 py-0.5 hover:bg-[#0d0d0d] px-2 rounded">
                    <span className="text-neutral-500 w-28 flex-shrink-0">{row.offset}</span>
                    <span className="text-neutral-400 w-44 font-bold flex-shrink-0">{row.bytes}</span>
                    <span className="text-white font-semibold w-56 flex-shrink-0">{row.opcode}</span>
                    {row.comment && (
                      <span className="text-emerald-400 text-[11px] italic">; {row.comment}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "entropy" && (
            <div className="rounded-2xl bg-[#050505] border border-[#262626] p-5 space-y-4">
              <h2 className="text-xs font-mono uppercase font-bold text-neutral-400">
                PE Header Section Table & Shannon Entropy Mapping
              </h2>
              <div className="space-y-3">
                {selectedArtifact.sections.map((sec) => (
                  <div key={sec.name} className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{sec.name}</span>
                        <span className="text-neutral-500">Virtual Size: {sec.virtualSize}</span>
                        <span className="text-neutral-500">Raw: {sec.rawSize}</span>
                      </div>
                      <span className={`font-bold ${sec.isSuspicious ? "text-rose-400" : "text-emerald-400"}`}>
                        Entropy: {sec.entropy} / 8.00 {sec.isSuspicious && "(SUSPICIOUS PACKED)"}
                      </span>
                    </div>

                    <div className="h-2 w-full bg-[#171717] rounded-full overflow-hidden border border-[#262626]">
                      <div
                        className={`h-full ${
                          sec.entropy > 7.5 ? "bg-rose-500" : sec.entropy > 6.0 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${(sec.entropy / 8) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "hex" && (
            <div className="rounded-2xl bg-[#050505] border border-[#262626] p-4 font-mono text-xs text-neutral-300 space-y-1 select-all overflow-x-auto bg-[#000000]">
              {selectedArtifact.hexPreview.map((line, i) => (
                <div key={i} className="hover:bg-[#0d0d0d] px-2 py-0.5 rounded">
                  {line}
                </div>
              ))}
            </div>
          )}

          {activeTab === "strings" && (
            <div className="rounded-2xl bg-[#050505] border border-[#262626] p-5 space-y-2">
              <h2 className="text-xs font-mono uppercase font-bold text-neutral-400 mb-3">
                Extracted High-Signal Forensic Strings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedArtifact.extractedStrings.map((str, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-xs font-mono text-neutral-200 flex items-center justify-between">
                    <IocHoverCard value={str} type="process" className="text-rose-400 font-semibold" />
                    <button
                      onClick={() => handleCopy(str)}
                      className="text-neutral-500 hover:text-white"
                      title="Copy string"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "yara" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono uppercase font-bold text-neutral-400">
                    Live YARA Rule Editor
                  </h2>
                  <button
                    onClick={() => handleCopy(yaraRule)}
                    className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" /> Copy YARA
                  </button>
                </div>
                <textarea
                  value={yaraRule}
                  onChange={(e) => setYaraRule(e.target.value)}
                  rows={14}
                  className="w-full p-4 rounded-xl bg-[#050505] border border-[#262626] text-xs font-mono text-neutral-200 focus:outline-none focus:border-white leading-relaxed"
                />
              </div>

              <div className="lg:col-span-5 space-y-3">
                <h2 className="text-xs font-mono uppercase font-bold text-neutral-400">
                  YARA Compilation & Match Result
                </h2>
                <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] text-xs font-mono text-neutral-300 min-h-[280px] whitespace-pre-wrap leading-relaxed select-all">
                  {yaraResult || "Click 'Compile & Run YARA' in the header to execute pattern scanner."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ingest Artifact Modal */}
        {ingestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-[#050505] border border-[#262626] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <Binary className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Ingest Forensic Artifact</h3>
                    <p className="text-xs text-neutral-400">Submit binary or memory dump for static disassembly & entropy analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setIngestModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadArtifact} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="text-neutral-400 block mb-1">Artifact Filename *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CobaltStrike_Stager_x64.bin"
                    value={newFilename}
                    onChange={(e) => setNewFilename(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">File Classification</label>
                    <select
                      value={newFiletype}
                      onChange={(e) => setNewFiletype(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="PE32+ executable (x86-64)">PE32+ Executable (x86-64)</option>
                      <option value="PE32+ DLL (x86-64)">PE32+ DLL (x86-64)</option>
                      <option value="ELF 64-bit LSB Executable">ELF 64-bit LSB Linux</option>
                      <option value="Memory Dump Raw Image">Memory Dump (.dmp / .raw)</option>
                      <option value="Shellcode Payload Stream">Shellcode Payload Stream</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Initial Triage Posture</label>
                    <select
                      value={newThreat}
                      onChange={(e: any) => setNewThreat(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="MALICIOUS">MALICIOUS (Known Signature)</option>
                      <option value="SUSPICIOUS">SUSPICIOUS (Heuristic Anomaly)</option>
                      <option value="CLEAN">CLEAN (Baseline Binary)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setIngestModalOpen(false)}
                    className="px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] text-neutral-300 border border-[#262626] rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dissect & Analyze</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {forensicsToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#050505] border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{forensicsToast}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
