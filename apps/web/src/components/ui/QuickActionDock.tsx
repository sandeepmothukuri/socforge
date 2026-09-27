"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  Radio,
  FileText,
  Keyboard,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  HelpCircle,
  X
} from "lucide-react";

export function QuickActionDock() {
  const [isExpanded, setIsExpanded] = useState(false);

  const triggerCopilot = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("socforge-open-copilot"));
    }
  };

  const triggerSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto select-none">
      {/* Expanded Shortcuts Card */}
      {isExpanded && (
        <div className="p-3.5 rounded-2xl bg-[#050505]/95 border border-[#262626] shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl text-xs text-neutral-300 w-64 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Keyboard className="w-3.5 h-3.5 text-neutral-400" />
              <span>SOC Quick Commands</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <button
              onClick={triggerCopilot}
              className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-[#121212] transition-colors group"
            >
              <span className="flex items-center gap-2 text-neutral-300 group-hover:text-white">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                AI SOC Copilot
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#171717] border border-[#262626] text-[10px] text-neutral-400">
                Ctrl + J
              </kbd>
            </button>

            <button
              onClick={triggerSearch}
              className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-[#121212] transition-colors group"
            >
              <span className="flex items-center gap-2 text-neutral-300 group-hover:text-white">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                Command Palette
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#171717] border border-[#262626] text-[10px] text-neutral-400">
                Ctrl + K
              </kbd>
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#050505]/90 border border-[#262626] shadow-2xl backdrop-blur-md">
        <button
          onClick={triggerCopilot}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold font-mono transition-all shadow-md group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>AI SOC AGENT</span>
          <span className="text-[10px] bg-neutral-200 px-1 py-0.2 rounded font-normal">Ctrl+J</span>
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-full hover:bg-[#171717] text-neutral-400 hover:text-white transition-colors"
          title="Quick Keybindings"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <Keyboard className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default QuickActionDock;
