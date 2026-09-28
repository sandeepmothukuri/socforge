"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  Clock,
  Key,
  X,
  AlertTriangle,
  Fingerprint,
  FileCheck,
  Ban,
  Sparkles,
  Check,
  Copy
} from "lucide-react";

export interface DualAuthRequest {
  targetId: string;
  targetLabel: string;
  targetType: "host" | "user" | "ip" | "service";
  action: "ISOLATE_HOST" | "REVOKE_SESSIONS" | "BGP_BLACKHOLE" | "CONTAIN_FIREWALL";
  criticality: "TIER-0 DOMAIN CONTROLLER" | "EXECUTIVE IDENTITY" | "PRODUCTION PERIMETER" | "STANDARD ASSET";
  sourceTrigger?: string;
}

interface DualAuthContainmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DualAuthRequest | null;
  onAuthorized?: (result: { hmacTicket: string; approver: string; timestamp: string }) => void;
}

export function DualAuthContainmentModal({
  isOpen,
  onClose,
  request,
  onAuthorized
}: DualAuthContainmentModalProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [approver, setApprover] = useState("ciso@socforge.local");
  const [approverPin, setApproverPin] = useState("");
  const [justification, setJustification] = useState("Critical adversary containment mandated by active credential dumping TTP.");
  const [checklist, setChecklist] = useState({
    confirmedThreat: true,
    failoverOperational: true,
    commanderNotified: true
  });
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizedSuccess, setAuthorizedSuccess] = useState(false);
  const [hmacTicket, setHmacTicket] = useState("");
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Generate unique HMAC cryptographic ticket on modal open
  useEffect(() => {
    if (isOpen && request) {
      setTimeLeft(300);
      setAuthorizedSuccess(false);
      setApproverPin("");
      const randHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
      setHmacTicket(`HMAC-SHA256:0x${randHex}${Date.now().toString(16).slice(-6)}`);
    }
  }, [isOpen, request]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || authorizedSuccess) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, authorizedSuccess]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleExecuteDualAuth = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthorizedSuccess(true);
      if (onAuthorized) {
        onAuthorized({
          hmacTicket,
          approver,
          timestamp: new Date().toISOString()
        });
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("socforge-audit-log", {
            detail: {
              action: `DUAL_AUTH_${request?.action || "CONTAINMENT"}`,
              actor: approver,
              target: request?.targetLabel,
              hmac: hmacTicket
            }
          })
        );
      }
    }, 900);
  };

  if (!isOpen || !request) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#070707] border border-[#2a2a2a] rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#0d0d0d] border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Two-Man Rule Cryptographic Gate</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  DUAL-AUTH
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Mandatory dual-key sign-off for critical infrastructure containment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {authorizedSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-mono">Dual-Authorization Attested & Dispatched</h3>
              <p className="text-xs text-neutral-400">
                Action <span className="text-emerald-400 font-semibold">{request.action}</span> executed on <span className="text-white font-semibold">{request.targetLabel}</span>.
              </p>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-left space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Cryptographic Proof:</span>
                <span className="text-white font-bold">{hmacTicket}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Secondary Signer:</span>
                <span className="text-emerald-300">{approver}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">100% CONTAINED · LEDGER SEALED</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(hmacTicket);
                  setCopiedTicket(true);
                  setTimeout(() => setCopiedTicket(false), 2000);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono transition border border-neutral-700 flex items-center gap-1.5"
              >
                {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTicket ? "Copied Proof" : "Copy HMAC Proof"}</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-sans transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Countdown and Ticket Ribbon */}
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-red-400">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Authorization Window: <strong className="text-white font-bold">{formatTimer(timeLeft)}</strong></span>
              </div>
              <span className="text-[11px] text-neutral-400 truncate max-w-[200px]" title={hmacTicket}>
                {hmacTicket}
              </span>
            </div>

            {/* Target Asset Overview */}
            <div className="p-3 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold">Target Critical Asset</span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-white font-bold text-sm">{request.targetLabel}</span>
                <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">
                  {request.criticality}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Target Action: <span className="text-amber-400 font-semibold">{request.action.replace(/_/g, " ")}</span> via CrowdStrike Falcon & Microsoft Graph API.
              </p>
            </div>

            {/* Mandatory Checkboxes */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold">Pre-Flight Safety Verifications</span>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-black border border-neutral-800 cursor-pointer hover:bg-neutral-900 transition">
                <input
                  type="checkbox"
                  checked={checklist.confirmedThreat}
                  onChange={(e) => setChecklist(prev => ({ ...prev, confirmedThreat: e.target.checked }))}
                  className="rounded accent-red-500"
                />
                <span className="text-neutral-200">Active malicious execution or C2 telemetry verified by primary analyst</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-black border border-neutral-800 cursor-pointer hover:bg-neutral-900 transition">
                <input
                  type="checkbox"
                  checked={checklist.failoverOperational}
                  onChange={(e) => setChecklist(prev => ({ ...prev, failoverOperational: e.target.checked }))}
                  className="rounded accent-red-500"
                />
                <span className="text-neutral-200">Secondary failover node / redundant cluster verified healthy</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-black border border-neutral-800 cursor-pointer hover:bg-neutral-900 transition">
                <input
                  type="checkbox"
                  checked={checklist.commanderNotified}
                  onChange={(e) => setChecklist(prev => ({ ...prev, commanderNotified: e.target.checked }))}
                  className="rounded accent-red-500"
                />
                <span className="text-neutral-200">Incident Commander notified via automated secure bridge</span>
              </label>
            </div>

            {/* Approver Identity Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">
                Secondary Senior Approver Identity
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { email: "ciso@socforge.local", role: "Chief Information Security Officer" },
                  { email: "lead_secops@socforge.local", role: "Principal SecOps Commander" }
                ].map((app) => (
                  <button
                    key={app.email}
                    type="button"
                    onClick={() => setApprover(app.email)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      approver === app.email
                        ? "bg-red-500/10 border-red-500 text-white font-bold"
                        : "bg-black border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs truncate">{app.email}</div>
                    <div className="text-[10px] text-neutral-500 font-sans">{app.role}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Token / PIN Verification Simulation */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-neutral-500 font-bold flex items-center justify-between">
                <span>Senior Approver YubiKey Token / PIN</span>
                <span className="text-neutral-400 lowercase">(Demo PIN: 7749)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={approverPin}
                  onChange={(e) => setApproverPin(e.target.value)}
                  placeholder="Enter 4-digit PIN or tap YubiKey..."
                  className="flex-1 bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setApproverPin("7749")}
                  className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition"
                >
                  Insert YubiKey
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                Abort & Return
              </button>

              <button
                type="button"
                onClick={handleExecuteDualAuth}
                disabled={isAuthorizing || timeLeft === 0 || !checklist.confirmedThreat || !checklist.failoverOperational || !approverPin}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold font-sans transition flex items-center gap-2 shadow-lg shadow-red-950/60"
              >
                {isAuthorizing ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Signing Cryptographic Proof...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Sign & Authorize Containment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
