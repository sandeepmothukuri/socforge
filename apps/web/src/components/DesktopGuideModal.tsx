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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0F172A] border border-[#38BDF8]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#070D19] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SocForgeLogo size="sm" showWordmark={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#F8FAFC]">
                  SOCForge Desktop & Mobile Suite
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  INSTALLED
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Native Windows standalone executables, WebView2 console, and mobile triage client.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1E293B] bg-[#0A101D] px-5 gap-2 overflow-x-auto">
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
                  ? "border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/5"
                  : "border-transparent text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#94A3B8] flex-1">
          {/* TAB 1: NATIVE WINDOW (WEBVIEW2) */}
          {activeTab === "window" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#1E293B]/50 border border-[#334155] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-sm">
                  <Laptop className="w-4 h-4" />
                  <span>Standalone Native Desktop Window (Microsoft Edge WebView2)</span>
                </div>
                <p className="leading-relaxed">
                  Runs the full SOCForge security console as a standalone Windows desktop application without opening an external web browser. Includes an animated cyber splash loader that automatically detects container startup and seamlessly transitions into the console.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-[#F8FAFC] text-xs uppercase tracking-wider">
                  How to Launch (3 Methods)
                </h4>

                {/* Method 1: Desktop Shortcut */}
                <div className="p-3.5 rounded-lg bg-[#070D19] border border-[#1E293B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">1. From Windows Desktop Shortcut (Recommended)</span>
                    <span className="text-[10px] text-[#38BDF8] font-mono">1-Click</span>
                  </div>
                  <p className="text-[11px]">
                    Double-click the shortcut placed on your Windows Desktop:
                  </p>
                  <div className="flex items-center justify-between bg-[#030712] p-2 rounded border border-[#334155] font-mono text-[11px] text-[#38BDF8]">
                    <span>C:\Users\sande\Desktop\SOCForge Console Window.lnk</span>
                    <button
                      onClick={() => copyToClipboard("C:\\Users\\sande\\Desktop\\SOCForge Console Window.lnk")}
                      className="text-[#64748B] hover:text-white"
                    >
                      {copiedText === "C:\\Users\\sande\\Desktop\\SOCForge Console Window.lnk" ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Method 2: Standalone .EXE */}
                <div className="p-3.5 rounded-lg bg-[#070D19] border border-[#1E293B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">2. Direct Standalone Executable</span>
                    <span className="text-[10px] text-[#22C55E] font-mono">18.07 MB Binary</span>
                  </div>
                  <p className="text-[11px]">
                    Run the pre-compiled portable binary in the repository root (requires no Python):
                  </p>
                  <div className="flex items-center justify-between bg-[#030712] p-2 rounded border border-[#334155] font-mono text-[11px] text-[#22C55E]">
                    <span>SOCForge-Window.exe</span>
                    <button
                      onClick={() => copyToClipboard(".\\SOCForge-Window.exe")}
                      className="text-[#64748B] hover:text-white"
                    >
                      {copiedText === ".\\SOCForge-Window.exe" ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Method 3: Python Source */}
                <div className="p-3.5 rounded-lg bg-[#070D19] border border-[#1E293B] space-y-2">
                  <span className="font-bold text-[#F8FAFC]">3. Via Terminal Command</span>
                  <div className="flex items-center justify-between bg-[#030712] p-2 rounded border border-[#334155] font-mono text-[11px] text-[#F8FAFC]">
                    <span>python apps\desktop\socforge_desktop_window.py</span>
                    <button
                      onClick={() => copyToClipboard("python apps\\desktop\\socforge_desktop_window.py")}
                      className="text-[#64748B] hover:text-white"
                    >
                      {copiedText === "python apps\\desktop\\socforge_desktop_window.py" ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
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
              <div className="bg-[#1E293B]/50 border border-[#334155] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#22C55E] font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>Desktop Operations Control Center (`SOCForge-Operations.exe`)</span>
                </div>
                <p className="leading-relaxed">
                  Native Windows desktop GUI providing real-time port heartbeat monitoring (Web 3000, API 8000, Postgres 5432, Redis 6379), Docker service lifecycle buttons, streaming terminal logs, and fast navigation into all modules.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-[#F8FAFC] text-xs uppercase tracking-wider">
                  How to Launch (3 Methods)
                </h4>

                {/* Method 1: Desktop Shortcut */}
                <div className="p-3.5 rounded-lg bg-[#070D19] border border-[#1E293B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">1. From Windows Desktop Shortcut</span>
                    <span className="text-[10px] text-[#38BDF8] font-mono">1-Click</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#030712] p-2 rounded border border-[#334155] font-mono text-[11px] text-[#38BDF8]">
                    <span>C:\Users\sande\Desktop\SOCForge Operations.lnk</span>
                    <button
                      onClick={() => copyToClipboard("C:\\Users\\sande\\Desktop\\SOCForge Operations.lnk")}
                      className="text-[#64748B] hover:text-white"
                    >
                      {copiedText === "C:\\Users\\sande\\Desktop\\SOCForge Operations.lnk" ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Method 2: Standalone .EXE */}
                <div className="p-3.5 rounded-lg bg-[#070D19] border border-[#1E293B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">2. Direct Standalone Executable</span>
                    <span className="text-[10px] text-[#22C55E] font-mono">11.60 MB Binary</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#030712] p-2 rounded border border-[#334155] font-mono text-[11px] text-[#22C55E]">
                    <span>SOCForge-Operations.exe</span>
                    <button
                      onClick={() => copyToClipboard(".\\SOCForge-Operations.exe")}
                      className="text-[#64748B] hover:text-white"
                    >
                      {copiedText === ".\\SOCForge-Operations.exe" ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Method 3: Python Source */}
                <div className="p-3.5 rounded-lg bg-[#070D19] border border-[#1E293B] space-y-2">
                  <span className="font-bold text-[#F8FAFC]">3. Terminal Python Execution</span>
                  <div className="flex items-center justify-between bg-[#030712] p-2 rounded border border-[#334155] font-mono text-[11px] text-[#F8FAFC]">
                    <span>python apps\desktop\socforge_app.py</span>
                    <button
                      onClick={() => copyToClipboard("python apps\\desktop\\socforge_app.py")}
                      className="text-[#64748B] hover:text-white"
                    >
                      {copiedText === "python apps\\desktop\\socforge_app.py" ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
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
              <div className="bg-[#1E293B]/50 border border-[#334155] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-sm">
                  <Terminal className="w-4 h-4" />
                  <span>Batch Launchers & Automated PyInstaller Rebuilding</span>
                </div>
                <p className="leading-relaxed">
                  Easily launch the entire system from File Explorer or recompile fresh standalone executables if you make code changes.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-[#070D19] border border-[#1E293B] space-y-2">
                  <span className="font-bold text-[#F8FAFC]">1-Click Batch Launcher</span>
                  <p className="text-[11px]">
                    Double-click in the root directory to verify dependencies and start the app:
                  </p>
                  <div className="flex items-center justify-between bg-[#030712] p-2 rounded border border-[#334155] font-mono text-[11px] text-[#38BDF8]">
                    <span>.\SOCForge-Launcher.bat</span>
                    <button
                      onClick={() => copyToClipboard(".\\SOCForge-Launcher.bat")}
                      className="text-[#64748B] hover:text-white"
                    >
                      {copiedText === ".\\SOCForge-Launcher.bat" ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#070D19] border border-[#1E293B] space-y-2">
                  <span className="font-bold text-[#F8FAFC]">Recompile Executables Script</span>
                  <p className="text-[11px]">
                    To re-generate single-file .exe files with PyInstaller at any time:
                  </p>
                  <div className="flex items-center justify-between bg-[#030712] p-2 rounded border border-[#334155] font-mono text-[11px] text-[#F59E0B]">
                    <span>.\build-exe.bat</span>
                    <button
                      onClick={() => copyToClipboard(".\\build-exe.bat")}
                      className="text-[#64748B] hover:text-white"
                    >
                      {copiedText === ".\\build-exe.bat" ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
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
              <div className="bg-[#1E293B]/50 border border-[#334155] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#A855F7] font-bold text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>SOCForge Mobile Incident Response (iOS & Android)</span>
                </div>
                <p className="leading-relaxed">
                  On-call security triage app for iPhones and Android devices. Review real-time intrusion alerts with MITRE ATT&CK tags and approve 4-eyes containment actions (host isolation, user disablement) from anywhere.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-[#F8FAFC] text-xs uppercase tracking-wider">
                  How to Run with Expo Go
                </h4>

                <div className="p-3.5 rounded-lg bg-[#070D19] border border-[#1E293B] space-y-3">
                  <div>
                    <div className="font-bold text-[#F8FAFC]">Step 1: Install & Launch Expo Dev Server</div>
                    <div className="flex items-center justify-between bg-[#030712] p-2 rounded border border-[#334155] font-mono text-[11px] text-[#A855F7] mt-1">
                      <span>cd apps\mobile && npm install && npm start</span>
                      <button
                        onClick={() => copyToClipboard("cd apps\\mobile && npm install && npm start")}
                        className="text-[#64748B] hover:text-white"
                      >
                        {copiedText === "cd apps\\mobile && npm install && npm start" ? (
                          <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-[#F8FAFC]">Step 2: Preview on Phone</div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      Download the free <strong>Expo Go</strong> app from the iOS App Store or Google Play Store, then scan the terminal QR code.
                    </p>
                  </div>

                  <div>
                    <div className="font-bold text-[#F8FAFC]">Step 3: Connect to Local API Gateway</div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      In the mobile app Settings tab, change the URL from <code>localhost:8000</code> to your PC's local network IP (e.g. <code>http://192.168.1.100:8000</code>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E293B] bg-[#070D19] flex items-center justify-between">
          <div className="text-[11px] text-[#64748B] font-mono">
            Platform Author: Sandeep Mothukuri • All executables ready in dist/
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#38BDF8] text-[#0B1020] font-bold text-xs hover:bg-[#38BDF8]/90 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
