"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { Volume2, VolumeX, BellRing, Sparkles } from "lucide-react";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playTone: (type: "critical" | "warning" | "success" | "click") => void;
}

const TacticalAudioContext = createContext<AudioContextType>({
  isMuted: true,
  toggleMute: () => {},
  playTone: () => {}
});

export function TacticalAudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Load preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("socforge-audio-muted");
      if (saved !== null) {
        setIsMuted(saved === "true");
      }
    } catch {}
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("socforge-audio-muted", String(next));
      } catch {}
      if (!next) {
        // Play a short pleasant test chime when unmuting
        playSyntheticTone("success");
      }
      return next;
    });
  };

  const playSyntheticTone = (type: "critical" | "warning" | "success" | "click") => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "critical") {
        // High urgency 2-tone pulse (880Hz -> 660Hz)
        const osc1 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(880, ctx.currentTime);
        osc1.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc1.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.35);
      } else if (type === "warning") {
        // Smooth alert tone (580Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "success") {
        // 2-tone harmonic chord (523Hz C5 -> 659Hz E5)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      } else {
        // Subdued micro-click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {}
  };

  const playTone = (type: "critical" | "warning" | "success" | "click") => {
    if (isMuted) return;
    playSyntheticTone(type);
  };

  return (
    <TacticalAudioContext.Provider value={{ isMuted, toggleMute, playTone }}>
      {children}
    </TacticalAudioContext.Provider>
  );
}

export function useTacticalAudio() {
  return useContext(TacticalAudioContext);
}

export function TacticalAudioToggle() {
  const { isMuted, toggleMute } = useTacticalAudio();

  return (
    <button
      onClick={toggleMute}
      className={`p-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
        !isMuted
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm"
          : "bg-[#0a0a0a] text-neutral-400 hover:text-white border-[#262626]"
      }`}
      title={isMuted ? "Enable SOC Audio Chimes" : "Mute SOC Audio Chimes"}
    >
      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span className="text-[10px] hidden md:inline">
        {isMuted ? "AUDIO OFF" : "AUDIO LIVE"}
      </span>
    </button>
  );
}

export default TacticalAudioToggle;
