"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import {
  Laptop,
  Terminal,
  Cpu,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  ArrowRight,
  Play,
  Activity
} from "lucide-react";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";

export default function DesktopGuidePage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626]/80 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-[#F8FAFC]">
                SOCForge Native Desktop Application — Setup & Run Instructions
              </h1>
              <p className="text-[11px] text-[#A7B0C0]">
                Running the local Windows console (Edge WebView2) & Desktop Control Center (.EXE)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>INSTALLED ON YOUR PC</span>
            </span>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Hero Overview */}
          <div className="bg-[#111827] border border-[#38BDF8]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                    NATIVE WINDOWS DEPLOYMENT
                  </span>
                  <span className="text-xs text-[#A7B0C0] font-mono">Platform Author: Sandeep Mothukuri</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  SOCForge Local Windows Operations
                </h2>
                <p className="text-xs text-[#A7B0C0] leading-relaxed">
                  SOCForge has been compiled and installed on your Windows system. You can launch it as a native standalone application window without needing a browser, or manage the Docker services using the native operations GUI.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B1020] font-bold text-xs transition text-center shadow-lg shadow-[#38BDF8]/20"
                >
                  Return to Dashboard
                </a>
              </div>
            </div>
          </div>

          {/* 4 Execution Methods */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#A7B0C0]">
              Select Any of the 4 Methods to Run:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Method 1: Desktop Shortcuts */}
              <div className="bg-[#151C2E] border border-[#263248] rounded-xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-sm">
                      <span className="w-6 h-6 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center text-xs font-mono">1</span>
                      <span>Windows Desktop Shortcut (Fastest)</span>
                    </div>
                    <span className="text-[10px] text-[#22C55E] font-bold font-mono">1-CLICK</span>
                  </div>
                  <p className="text-xs text-[#A7B0C0] leading-relaxed">
                    Shortcuts have been created directly on your Windows desktop (<code>C:\Users\sande\Desktop\</code>). Double-click either shortcut to launch immediately:
                  </p>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-[#38BDF8] font-bold">🖥️ SOCForge Console Window.lnk</div>
                        <div className="text-[11px] text-[#6B7280]">Opens native Edge WebView2 console window</div>
                      </div>
                      <button
                        onClick={() => copy("C:\\Users\\sande\\Desktop\\SOCForge Console Window.lnk")}
                        className="text-[#6B7280] hover:text-white p-1"
                        title="Copy path"
                      >
                        {copiedText === "C:\\Users\\sande\\Desktop\\SOCForge Console Window.lnk" ? (
                          <Check className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-[#22C55E] font-bold">⚙️ SOCForge Operations.lnk</div>
                        <div className="text-[11px] text-[#6B7280]">Opens Docker lifecycle & port monitor GUI</div>
                      </div>
                      <button
                        onClick={() => copy("C:\\Users\\sande\\Desktop\\SOCForge Operations.lnk")}
                        className="text-[#6B7280] hover:text-white p-1"
                        title="Copy path"
                      >
                        {copiedText === "C:\\Users\\sande\\Desktop\\SOCForge Operations.lnk" ? (
                          <Check className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Location: <code>C:\Users\sande\Desktop\</code>
                </div>
              </div>

              {/* Method 2: Standalone .EXE */}
              <div className="bg-[#151C2E] border border-[#263248] rounded-xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#22C55E] font-bold text-sm">
                      <span className="w-6 h-6 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-xs font-mono">2</span>
                      <span>Standalone Executable (.EXE)</span>
                    </div>
                    <span className="text-[10px] text-[#22C55E] font-bold font-mono">NO PYTHON REQUIRED</span>
                  </div>
                  <p className="text-xs text-[#A7B0C0] leading-relaxed">
                    Double-click the pre-compiled binary files located in your root project folder or <code>dist/</code> folder from File Explorer:
                  </p>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-[#22C55E] font-bold">.\SOCForge-Window.exe</div>
                        <div className="text-[11px] text-[#6B7280]">18.07 MB Single-file binary</div>
                      </div>
                      <button
                        onClick={() => copy(".\\SOCForge-Window.exe")}
                        className="text-[#6B7280] hover:text-white p-1"
                        title="Copy name"
                      >
                        {copiedText === ".\\SOCForge-Window.exe" ? (
                          <Check className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-[#38BDF8] font-bold">.\SOCForge-Operations.exe</div>
                        <div className="text-[11px] text-[#6B7280]">11.60 MB Single-file binary</div>
                      </div>
                      <button
                        onClick={() => copy(".\\SOCForge-Operations.exe")}
                        className="text-[#6B7280] hover:text-white p-1"
                        title="Copy name"
                      >
                        {copiedText === ".\\SOCForge-Operations.exe" ? (
                          <Check className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Location: <code>SOCForge\SOCForge-Window.exe</code>
                </div>
              </div>

              {/* Method 3: 1-Click Batch Script */}
              <div className="bg-[#151C2E] border border-[#263248] rounded-xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-sm">
                      <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs font-mono">3</span>
                      <span>Double-Click Batch Launcher (.BAT)</span>
                    </div>
                    <span className="text-[10px] text-[#F59E0B] font-bold font-mono">FILE EXPLORER</span>
                  </div>
                  <p className="text-xs text-[#A7B0C0] leading-relaxed">
                    Double-click <code>SOCForge-Launcher.bat</code> in the repository root folder. It checks Python and Docker, runs the health probes, and opens the control center:
                  </p>

                  <div className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] font-mono text-xs flex items-center justify-between">
                    <div className="text-[#F59E0B] font-bold">.\SOCForge-Launcher.bat</div>
                    <button
                      onClick={() => copy(".\\SOCForge-Launcher.bat")}
                      className="text-[#6B7280] hover:text-white p-1"
                      title="Copy script command"
                    >
                      {copiedText === ".\\SOCForge-Launcher.bat" ? (
                        <Check className="w-4 h-4 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Recompile script: <code>.\build-exe.bat</code>
                </div>
              </div>

              {/* Method 4: Terminal Command */}
              <div className="bg-[#151C2E] border border-[#263248] rounded-xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#A855F7] font-bold text-sm">
                      <span className="w-6 h-6 rounded-full bg-[#A855F7]/20 text-[#A855F7] flex items-center justify-center text-xs font-mono">4</span>
                      <span>Terminal / PowerShell Execution</span>
                    </div>
                    <span className="text-[10px] text-[#A855F7] font-bold font-mono">DEVELOPER CLI</span>
                  </div>
                  <p className="text-xs text-[#A7B0C0] leading-relaxed">
                    Open PowerShell or Windows Terminal in your repository directory and run:
                  </p>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                      <span className="text-[#F8FAFC]">python apps\desktop\socforge_desktop_window.py</span>
                      <button
                        onClick={() => copy("python apps\\desktop\\socforge_desktop_window.py")}
                        className="text-[#6B7280] hover:text-white p-1"
                        title="Copy command"
                      >
                        {copiedText === "python apps\\desktop\\socforge_desktop_window.py" ? (
                          <Check className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#263248] flex items-center justify-between">
                      <span className="text-[#F8FAFC]">python apps\desktop\socforge_app.py</span>
                      <button
                        onClick={() => copy("python apps\\desktop\\socforge_app.py")}
                        className="text-[#6B7280] hover:text-white p-1"
                        title="Copy command"
                      >
                        {copiedText === "python apps\\desktop\\socforge_app.py" ? (
                          <Check className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Requires Python 3.10+ in PATH
                </div>
              </div>
            </div>
          </div>

          {/* Mobile App Section */}
          <div className="bg-[#111827] border border-[#A855F7]/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-[#A855F7] font-bold text-base">
              <Smartphone className="w-5 h-5" />
              <span>SOCForge Mobile Incident Response App (iOS & Android)</span>
            </div>
            <p className="text-xs text-[#A7B0C0] leading-relaxed max-w-3xl">
              Cross-platform React Native & Expo app located in <code>apps/mobile/</code>. Triage alerts, inspect MITRE ATT&CK techniques, and authorize 4-eyes containment actions directly from your physical mobile phone.
            </p>

            <div className="p-4 rounded-xl bg-[#070D19] border border-[#263248] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#A855F7] font-bold">cd apps\mobile && npm install && npm start</span>
                <button
                  onClick={() => copy("cd apps\\mobile && npm install && npm start")}
                  className="text-[#6B7280] hover:text-white p-1"
                >
                  {copiedText === "cd apps\\mobile && npm install && npm start" ? (
                    <Check className="w-4 h-4 text-[#22C55E]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#6B7280] font-sans">
                Scan the generated QR code with <strong>Expo Go</strong> on your iPhone or Android phone, then set the server URL to your PC Wi-Fi IP (e.g. <code>http://192.168.1.100:8000</code>).
              </p>
            </div>
          </div>

          {/* Bottom System Health */}
          <div className="p-4 rounded-xl bg-[#0E1626] border border-[#263248] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#A7B0C0]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E] animate-ping" />
              <span>Container Health: Web (3000), API (8000), PostgreSQL (5432), Redis (6379)</span>
            </div>
            <div className="text-[#6B7280]">
              SOCForge • Author: Sandeep Mothukuri
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
