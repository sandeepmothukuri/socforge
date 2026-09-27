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
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#000000] text-neutral-100">
        {/* Header */}
        <header className="h-16 border-b border-[#262626] bg-[#050505]/95 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">
                SOCForge Native Desktop Application — Setup & Run Instructions
              </h1>
              <p className="text-[11px] text-neutral-400 font-mono">
                Running the local Windows console (Edge WebView2) & Desktop Control Center (.EXE)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>INSTALLED ON YOUR PC</span>
            </span>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Hero Overview */}
          <div className="bg-[#050505] border border-[#262626] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                    NATIVE WINDOWS DEPLOYMENT
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">Platform Author: Sandeep Mothukuri</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  SOCForge Local Windows Operations
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  SOCForge has been compiled and installed on your Windows system. You can launch it as a native standalone application window without needing a browser, or manage the Docker services using the native operations GUI.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 font-mono">
                <a
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition text-center shadow-lg"
                >
                  Return to Dashboard
                </a>
              </div>
            </div>
          </div>

          {/* 4 Execution Methods */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-neutral-400 font-mono">
              Select Any of the 4 Methods to Run:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Method 1: Desktop Shortcuts */}
              <div className="bg-[#050505] border border-[#262626] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-mono border border-[#262626]">1</span>
                      <span>Windows Desktop Shortcut (Fastest)</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">1-CLICK</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Shortcuts have been created directly on your Windows desktop (<code>C:\Users\sande\Desktop\</code>). Double-click either shortcut to launch immediately:
                  </p>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-emerald-400 font-bold">🖥️ SOCForge Console Window.lnk</div>
                        <div className="text-[11px] text-neutral-500">Opens native Edge WebView2 console window</div>
                      </div>
                      <button
                        onClick={() => copy("C:\\Users\\sande\\Desktop\\SOCForge Console Window.lnk")}
                        className="text-neutral-500 hover:text-white p-1"
                        title="Copy path"
                      >
                        {copiedText === "C:\\Users\\sande\\Desktop\\SOCForge Console Window.lnk" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-white font-bold">⚙️ SOCForge Operations.lnk</div>
                        <div className="text-[11px] text-neutral-500">Opens Docker lifecycle & port monitor GUI</div>
                      </div>
                      <button
                        onClick={() => copy("C:\\Users\\sande\\Desktop\\SOCForge Operations.lnk")}
                        className="text-neutral-500 hover:text-white p-1"
                        title="Copy path"
                      >
                        {copiedText === "C:\\Users\\sande\\Desktop\\SOCForge Operations.lnk" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Location: <code>C:\Users\sande\Desktop\</code>
                </div>
              </div>

              {/* Method 2: Standalone .EXE */}
              <div className="bg-[#050505] border border-[#262626] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-mono border border-[#262626]">2</span>
                      <span>Standalone Executable (.EXE)</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">NO PYTHON REQUIRED</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Double-click the pre-compiled binary files located in your root project folder or <code>dist/</code> folder from File Explorer:
                  </p>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-emerald-400 font-bold">.\SOCForge-Window.exe</div>
                        <div className="text-[11px] text-neutral-500">18.07 MB Single-file binary</div>
                      </div>
                      <button
                        onClick={() => copy(".\\SOCForge-Window.exe")}
                        className="text-neutral-500 hover:text-white p-1"
                        title="Copy name"
                      >
                        {copiedText === ".\\SOCForge-Window.exe" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-white font-bold">.\SOCForge-Operations.exe</div>
                        <div className="text-[11px] text-neutral-500">11.60 MB Single-file binary</div>
                      </div>
                      <button
                        onClick={() => copy(".\\SOCForge-Operations.exe")}
                        className="text-neutral-500 hover:text-white p-1"
                        title="Copy name"
                      >
                        {copiedText === ".\\SOCForge-Operations.exe" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Location: <code>SOCForge\SOCForge-Window.exe</code>
                </div>
              </div>

              {/* Method 3: 1-Click Batch Script */}
              <div className="bg-[#050505] border border-[#262626] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono border border-amber-500/20">3</span>
                      <span>Double-Click Batch Launcher (.BAT)</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold font-mono">FILE EXPLORER</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Double-click <code>SOCForge-Launcher.bat</code> in the repository root folder. It checks Python and Docker, runs the health probes, and opens the control center:
                  </p>

                  <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] font-mono text-xs flex items-center justify-between">
                    <div className="text-amber-400 font-bold">.\SOCForge-Launcher.bat</div>
                    <button
                      onClick={() => copy(".\\SOCForge-Launcher.bat")}
                      className="text-neutral-500 hover:text-white p-1"
                      title="Copy script command"
                    >
                      {copiedText === ".\\SOCForge-Launcher.bat" ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Recompile script: <code>.\build-exe.bat</code>
                </div>
              </div>

              {/* Method 4: Terminal Command */}
              <div className="bg-[#050505] border border-[#262626] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                      <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-mono border border-purple-500/20">4</span>
                      <span>Terminal / PowerShell Execution</span>
                    </div>
                    <span className="text-[10px] text-purple-400 font-bold font-mono">DEVELOPER CLI</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Open PowerShell or Windows Terminal in your repository directory and run:
                  </p>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between">
                      <span className="text-neutral-200">python apps\desktop\socforge_desktop_window.py</span>
                      <button
                        onClick={() => copy("python apps\\desktop\\socforge_desktop_window.py")}
                        className="text-neutral-500 hover:text-white p-1"
                        title="Copy command"
                      >
                        {copiedText === "python apps\\desktop\\socforge_desktop_window.py" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between">
                      <span className="text-neutral-200">python apps\desktop\socforge_app.py</span>
                      <button
                        onClick={() => copy("python apps\\desktop\\socforge_app.py")}
                        className="text-neutral-500 hover:text-white p-1"
                        title="Copy command"
                      >
                        {copiedText === "python apps\\desktop\\socforge_app.py" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Requires Python 3.10+ in PATH
                </div>
              </div>
            </div>
          </div>

          {/* Mobile App Section */}
          <div className="bg-[#050505] border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-purple-400 font-bold text-base">
              <Smartphone className="w-5 h-5" />
              <span>SOCForge Mobile Incident Response App (iOS & Android)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
              Cross-platform React Native & Expo app located in <code>apps/mobile/</code>. Triage alerts, inspect MITRE ATT&CK techniques, and authorize 4-eyes containment actions directly from your physical mobile phone.
            </p>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-bold">cd apps\mobile && npm install && npm start</span>
                <button
                  onClick={() => copy("cd apps\\mobile && npm install && npm start")}
                  className="text-neutral-500 hover:text-white p-1"
                >
                  {copiedText === "cd apps\\mobile && npm install && npm start" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 font-sans">
                Scan the generated QR code with <strong>Expo Go</strong> on your iPhone or Android phone, then set the server URL to your PC Wi-Fi IP (e.g. <code>http://192.168.1.100:8000</code>).
              </p>
            </div>
          </div>

          {/* Bottom System Health */}
          <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Container Health: Web (3000), API (8000), PostgreSQL (5432), Redis (6379)</span>
            </div>
            <div className="text-neutral-500">
              SOCForge • Author: Sandeep Mothukuri
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
