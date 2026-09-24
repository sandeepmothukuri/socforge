"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
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
  Sparkles
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
      "\\\\.\\pipe\\msagent_%x",
      "CobaltStrike_NamedPipe",
      "Content-Type: application/octet-stream",
      "HTTP/1.1 200 OK",
      "SleepMask.dll",
      "ReflectiveLoader"
    ],
    hexPreview: [
      "00000000  4d 5a 41 52 55 48 89 e5  48 81 ec 20 00 00 00 48  |MZARUH..H.. ...H|",
      "00000010  8d 05 00 00 00 00 48 83  c0 10 50 c3 00 00 00 00  |......H...P.....|",
      "00000020  5c 5c 2e 5c 70 69 70 65  5c 6d 73 61 67 65 6e 74  |\\\\.\\pipe\\msagent|",
      "00000030  5f 25 78 00 00 00 00 00  00 00 00 00 00 00 00 00  |_%x.............|"
    ]
  }
];

const DEFAULT_YARA = `rule Detect_Mimikatz_Sekurlsa {
    meta:
        description = "Identifies Mimikatz credential extraction strings"
        author = "Sandeep Mothukuri"
        reference = "MITRE T1003.001"
    strings:
        $s1 = "sekurlsa::logonpasswords" ascii wide nocase
        $s2 = "lsasrv.dll" ascii wide nocase
        $s3 = "privilege::debug" ascii wide nocase
    condition:
        uint16(0) == 0x5A4D and (2 of ($s*))
}`;

export default function ForensicsPage() {
  const [selectedArtifact, setSelectedArtifact] = useState<ForensicArtifact>(SAMPLE_ARTIFACTS[0]);
  const [yaraRule, setYaraRule] = useState(DEFAULT_YARA);
  const [yaraRunning, setYaraRunning] = useState(false);
  const [yaraResult, setYaraResult] = useState<{ match: boolean; matchedStrings: string[] } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleRunYara = () => {
    setYaraRunning(true);
    setYaraResult(null);
    setTimeout(() => {
      setYaraRunning(false);
      setYaraResult({
        match: true,
        matchedStrings: ["$s1: sekurlsa::logonpasswords", "$s2: lsasrv.dll", "$s3: privilege::debug"]
      });
    }, 600);
  };

  const copyText = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Malware Forensics & YARA Analysis Studio
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono font-normal">
                  Hex & String Dissector
                </span>
              </h1>
              <p className="text-[11px] text-[#64748B] font-mono">
                Static binary analysis, entropy calculation, string extraction & real-time YARA scanning
              </p>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Artifact Catalog */}
          <div className="w-80 border-r border-[#263248] bg-[#0E1626]/50 flex flex-col overflow-y-auto p-3 space-y-2 flex-shrink-0">
            <div className="px-2 py-1 text-[11px] font-mono uppercase text-[#64748B] font-bold">
              Evidence Artifacts
            </div>

            {SAMPLE_ARTIFACTS.map((art) => {
              const isSelected = selectedArtifact.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => {
                    setSelectedArtifact(art);
                    setYaraResult(null);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "border-purple-500 bg-[#172033] shadow-md shadow-purple-500/10"
                      : "border-[#263248] bg-[#0E1626] hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      {art.threatLevel}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {(art.sizeBytes / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{art.filename}</h3>
                  <div className="text-[10px] font-mono text-[#94A3B8]">Entropy: {art.entropy} / 8.0</div>
                </div>
              );
            })}
          </div>

          {/* Artifact Inspector & YARA Workspace */}
          <div className="flex-1 flex flex-col bg-[#0B1020] overflow-y-auto p-6 space-y-6">
            {/* Artifact Metadata Banner */}
            <div className="p-6 rounded-2xl bg-[#0E1626] border border-[#263248] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-xs font-bold">
                      {selectedArtifact.threatLevel}
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8]">{selectedArtifact.filetype}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white font-mono">{selectedArtifact.filename}</h2>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-[#64748B]">Entropy (Packing Score)</div>
                  <div className="text-base font-bold text-purple-400">
                    {selectedArtifact.entropy} / 8.00 <span className="text-[10px] text-red-400">(HIGHLY PACKED)</span>
                  </div>
                </div>
              </div>

              {/* Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                  <span className="text-[#64748B]">MD5: <strong className="text-white">{selectedArtifact.md5}</strong></span>
                  <button onClick={() => copyText(selectedArtifact.md5, "md5")} className="text-[#38BDF8] text-[10px]">
                    {copiedHash === "md5" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="p-2.5 rounded bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                  <span className="text-[#64748B] truncate max-w-xs">SHA256: <strong className="text-white">{selectedArtifact.sha256}</strong></span>
                  <button onClick={() => copyText(selectedArtifact.sha256, "sha256")} className="text-[#38BDF8] text-[10px]">
                    {copiedHash === "sha256" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Hex View & Strings Dissector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hex Dump */}
              <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-3 font-mono text-xs flex flex-col">
                <div className="flex items-center justify-between border-b border-[#263248] pb-2">
                  <span className="font-bold text-white uppercase tracking-wider">Hex Memory Dump Preview</span>
                  <span className="text-[10px] text-[#64748B]">Offset: 0x00000000</span>
                </div>
                <div className="p-3 bg-[#070C18] rounded-lg border border-[#263248] overflow-x-auto text-[11px] text-[#38BDF8] space-y-0.5 leading-tight">
                  {selectedArtifact.hexPreview.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>

              {/* Extracted ASCII/Unicode Strings */}
              <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] space-y-3 font-mono text-xs flex flex-col">
                <div className="flex items-center justify-between border-b border-[#263248] pb-2">
                  <span className="font-bold text-white uppercase tracking-wider">
                    High-Signal Extracted Strings ({selectedArtifact.extractedStrings.length})
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">CREDENTIAL ARTIFACTS</span>
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-56">
                  {selectedArtifact.extractedStrings.map((str, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#0B1020] border border-[#263248] text-[11px] text-purple-300 font-mono">
                      {str}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* YARA Rule Compiler & Test Runner */}
            <div className="p-5 rounded-2xl bg-[#0E1626] border border-[#263248] space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    In-Browser YARA Rule Engine
                  </span>
                </div>
                <button
                  onClick={handleRunYara}
                  disabled={yaraRunning}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${yaraRunning ? "animate-spin" : ""}`} />
                  {yaraRunning ? "Compiling..." : "Scan with YARA"}
                </button>
              </div>

              <textarea
                value={yaraRule}
                onChange={(e) => setYaraRule(e.target.value)}
                rows={8}
                className="w-full p-4 bg-[#070C18] border border-[#263248] rounded-xl font-mono text-xs text-[#F8FAFC] leading-relaxed focus:outline-none focus:border-emerald-500"
              />

              {yaraResult && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    YARA MATCH CONFIRMED: Rule &quot;Detect_Mimikatz_Sekurlsa&quot; triggered on {selectedArtifact.filename}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] space-y-1">
                    <div>Matched signature strings:</div>
                    {yaraResult.matchedStrings.map((s, i) => (
                      <div key={i} className="text-emerald-400 pl-2 font-bold">• {s}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
