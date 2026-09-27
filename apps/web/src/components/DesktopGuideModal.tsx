"use client";

import React, { useState } from "react";
import {
  Laptop,
  Terminal,
  Play,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Smartphone,
  Cpu,
  FolderOpen,
  X,
  Radio,
} from "lucide-react";
import { SocForgeLogo } from "./ui/SocForgeLogo";

interface DesktopGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesktopGuideModal({ isOpen, onClose }: DesktopGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"window" | "ops" | "launcher" | "mobile">("window");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#000000] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-[#050505] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SocForgeLogo size="sm" showWordmark={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  SOCForge Desktop & Mobile Suite
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  INSTALLED
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Native Windows standalone executables, WebView2 console, and mobile triage client.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-[#050505] px-5 gap-2 overflow-x-auto">
          {[
            { id: "window", label: "🖥️ Native Window (WebView2)", icon: Laptop },
            { id: "ops", label: "⚙️ Operations Control (.EXE)", icon: Cpu },
            { id: "launcher", label: "🚀 Quick Launcher (.BAT)", icon: Terminal },
            { id: "mobile", label: "📱 Mobile App (iOS / Android)", icon: Smartphone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-white text-white bg-neutral-900"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-400 flex-1 bg-[#000000]">
          {/* TAB 1: NATIVE WINDOW (WEBVIEW2) */}
          {activeTab === "window" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                  <span>Standalone Native Desktop Window (Microsoft Edge WebView2)</span>
                </div>
                <p className="leading-relaxed text-neutral-300">
                  Runs the full SOCForge security console as a standalone Windows desktop application without opening an external web browser. Includes an animated splash loader that automatically detects container startup and seamlessly transitions into the console.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  How to Launch (3 Methods)
                </h4>

                {/* Method 1: Desktop Shortcut */}
                <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">1. From Windows Desktop Shortcut (Recommended)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">1-Click</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Double-click the shortcut placed on your Windows Desktop:
                  </p>
                  <div className="flex items-center justify-between bg-black p-2 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
                    <span>C:\Users\sande\Desktop\SOCForge Console Window.lnk</span>
                    <button
                      onClick={() => copyToClipboard("C:\\Users\\sande\\Desktop\\SOCForge Console Window.lnk")}
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedText === "C:\\Users\\sande\\Desktop\\SOCForge Console Window.lnk" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Method 2: Standalone .EXE */}
                <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">2. Direct Standalone Executable</span>
                    <span className="text-[10px] text-emerald-400 font-mono">18.07 MB Binary</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Run the pre-compiled portable binary in the repository root (requires no Python):
                  </p>
                  <div className="flex items-center justify-between bg-black p-2 rounded-lg border border-neutral-800 font-mono text-[11px] text-emerald-400">
                    <span>SOCForge-Window.exe</span>
                    <button
                      onClick={() => copyToClipboard(".\\SOCForge-Window.exe")}
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedText === ".\\SOCForge-Window.exe" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Method 3: Python Source */}
                <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 space-y-2">
                  <span className="font-bold text-white">3. Via Terminal Command</span>
                  <div className="flex items-center justify-between bg-black p-2 rounded-lg border border-neutral-800 font-mono text-[11px] text-white">
                    <span>python apps\desktop\socforge_desktop_window.py</span>
                    <button
                      onClick={() => copyToClipboard("python apps\\desktop\\socforge_desktop_window.py")}
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedText === "python apps\\desktop\\socforge_desktop_window.py" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATIONS CONTROL CENTER (.EXE) */}
          {activeTab === "ops" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>Desktop Operations Control Center (`SOCForge-Operations.exe`)</span>
                </div>
                <p className="leading-relaxed text-neutral-300">
                  Native Windows desktop GUI providing real-time port heartbeat monitoring (Web 3000, API 8000, Postgres 5432, Redis 6379), Docker service lifecycle buttons, streaming terminal logs, and fast navigation into all modules.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  How to Launch (3 Methods)
                </h4>

                {/* Method 1: Desktop Shortcut */}
                <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">1. From Windows Desktop Shortcut</span>
                    <span className="text-[10px] text-emerald-400 font-mono">1-Click</span>
                  </div>
                  <div className="flex items-center justify-between bg-black p-2 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
                    <span>C:\Users\sande\Desktop\SOCForge Operations.lnk</span>
                    <button
                      onClick={() => copyToClipboard("C:\\Users\\sande\\Desktop\\SOCForge Operations.lnk")}
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedText === "C:\\Users\\sande\\Desktop\\SOCForge Operations.lnk" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Method 2: Standalone .EXE */}
                <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">2. Direct Standalone Executable</span>
                    <span className="text-[10px] text-emerald-400 font-mono">11.60 MB Binary</span>
                  </div>
                  <div className="flex items-center justify-between bg-black p-2 rounded-lg border border-neutral-800 font-mono text-[11px] text-emerald-400">
                    <span>SOCForge-Operations.exe</span>
                    <button
                      onClick={() => copyToClipboard(".\\SOCForge-Operations.exe")}
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedText === ".\\SOCForge-Operations.exe" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Method 3: Python Source */}
                <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 space-y-2">
                  <span className="font-bold text-white">3. Terminal Python Execution</span>
                  <div className="flex items-center justify-between bg-black p-2 rounded-lg border border-neutral-800 font-mono text-[11px] text-white">
                    <span>python apps\desktop\socforge_app.py</span>
                    <button
                      onClick={() => copyToClipboard("python apps\\desktop\\socforge_app.py")}
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedText === "python apps\\desktop\\socforge_app.py" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUICK LAUNCHER & REBUILD SCRIPTS */}
          {activeTab === "launcher" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Terminal className="w-4 h-4" />
                  <span>Batch Launchers & Automated PyInstaller Rebuilding</span>
                </div>
                <p className="leading-relaxed text-neutral-300">
                  Easily launch the entire system from File Explorer or recompile fresh standalone executables if you make code changes.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 space-y-2">
                  <span className="font-bold text-white">1-Click Batch Launcher</span>
                  <p className="text-[11px] text-neutral-400">
                    Double-click in the root directory to verify dependencies and start the app:
                  </p>
                  <div className="flex items-center justify-between bg-black p-2 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200">
                    <span>.\SOCForge-Launcher.bat</span>
                    <button
                      onClick={() => copyToClipboard(".\\SOCForge-Launcher.bat")}
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedText === ".\\SOCForge-Launcher.bat" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 space-y-2">
                  <span className="font-bold text-white">Recompile Executables Script</span>
                  <p className="text-[11px] text-neutral-400">
                    To re-generate single-file .exe files with PyInstaller at any time:
                  </p>
                  <div className="flex items-center justify-between bg-black p-2 rounded-lg border border-neutral-800 font-mono text-[11px] text-amber-400">
                    <span>.\build-exe.bat</span>
                    <button
                      onClick={() => copyToClipboard(".\\build-exe.bat")}
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedText === ".\\build-exe.bat" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MOBILE INCIDENT RESPONSE APP */}
          {activeTab === "mobile" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>SOCForge Mobile Incident Response (iOS & Android)</span>
                </div>
                <p className="leading-relaxed text-neutral-300">
                  On-call security triage app for iPhones and Android devices. Review real-time intrusion alerts with MITRE ATT&CK tags and approve 4-eyes containment actions (host isolation, user disablement) from anywhere.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  How to Run with Expo Go
                </h4>

                <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 space-y-3">
                  <div>
                    <div className="font-bold text-white">Step 1: Install & Launch Expo Dev Server</div>
                    <div className="flex items-center justify-between bg-black p-2 rounded-lg border border-neutral-800 font-mono text-[11px] text-purple-400 mt-1">
                      <span>cd apps\mobile && npm install && npm start</span>
                      <button
                        onClick={() => copyToClipboard("cd apps\\mobile && npm install && npm start")}
                        className="text-neutral-400 hover:text-white"
                      >
                        {copiedText === "cd apps\\mobile && npm install && npm start" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-white">Step 2: Preview on Phone</div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Download the free <strong>Expo Go</strong> app from the iOS App Store or Google Play Store, then scan the terminal QR code.
                    </p>
                  </div>

                  <div>
                    <div className="font-bold text-white">Step 3: Connect to Local API Gateway</div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      In the mobile app Settings tab, change the URL from <code>localhost:8000</code> to your PC&apos;s local network IP (e.g. <code>http://192.168.1.100:8000</code>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-[#050505] flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 font-mono">
            Platform Author: Sandeep Mothukuri • All executables ready in dist/
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200 transition shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
