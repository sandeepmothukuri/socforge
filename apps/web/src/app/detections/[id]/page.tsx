"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import {
  getDetectionById,
  validateDetection,
  approveDetection,
  testDetectionRule,
  DetectionItem,
  ValidationReport,
} from "@/lib/api";
import {
  FileCode,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  ShieldCheck,
  Activity,
  BarChart3,
  ChevronRight,
  Flame,
  Clock,
  Copy,
} from "lucide-react";

// ── Language badge ───────────────────────────────────────────────────────────
function LangBadge({ lang }: { lang: string }) {
  const map: Record<string, string> = {
    sigma: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    spl:   "bg-orange-500/15 text-orange-400 border-orange-500/30",
    kql:   "bg-purple-500/15 text-purple-400 border-purple-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded border text-[11px] font-mono uppercase ${map[lang] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
      {lang}
    </span>
  );
}

// ── Validation state badge ───────────────────────────────────────────────────
function ValidationBadge({ state }: { state: string }) {
  const map: Record<string, string> = {
    valid:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    invalid:  "bg-red-500/15 text-red-400 border-red-500/30",
    pending:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    approved: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded border text-[11px] font-mono uppercase ${map[state] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
      {state}
    </span>
  );
}

// ── Replay score meter ───────────────────────────────────────────────────────
function ScoreMeter({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-mono font-bold">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Copy to clipboard ────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition"
    >
      <Copy className="w-3 h-3" />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function DetectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [detection, setDetection] = useState<DetectionItem | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [replayReport, setReplayReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  const [selectedDataset, setSelectedDataset] = useState("synthetic-soc-v1");
  const DATASETS = [
    "synthetic-soc-v1",
    "apt-lateral-movement",
    "ransomware-pre-deployment",
    "insider-threat-exfiltration",
  ];

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const det = await getDetectionById(id);
      setDetection(det);
    } catch (err: any) {
      setError(err.message || "Detection not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleValidate() {
    if (!id) return;
    setValidating(true);
    setValidationReport(null);
    try {
      const report = await validateDetection(id);
      setValidationReport(report);
    } catch (err: any) {
      setValidationReport({ syntax_valid: false, errors: [err.message] });
    } finally {
      setValidating(false);
    }
  }

  async function handleReplay() {
    if (!id) return;
    setReplaying(true);
    setReplayReport(null);
    try {
      const report = await testDetectionRule(id, selectedDataset);
      setReplayReport(report);
    } catch (err: any) {
      setReplayReport({ error: err.message });
    } finally {
      setReplaying(false);
    }
  }

  async function handleApprove() {
    if (!id) return;
    setApproving(true);
    setApprovalStatus(null);
    try {
      await approveDetection(id);
      setApprovalStatus("✓ Detection rule approved and promoted to production.");
      loadData();
    } catch (err: any) {
      setApprovalStatus(`✗ Approval failed: ${err.message}`);
    } finally {
      setApproving(false);
    }
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/detections")}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Detections
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white truncate max-w-sm">
              {detection?.name || (loading ? "Loading…" : "Detection Rule")}
            </span>
            {detection && (
              <>
                <LangBadge lang={detection.rule_language} />
                <ValidationBadge state={detection.validation_state} />
              </>
            )}
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="p-4 m-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400">{error}</div>
        )}

        {!loading && !error && detection && (
          <div className="flex-1 flex overflow-hidden">
            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Rule content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rule Content</h2>
                  <CopyButton text={detection.rule_content} />
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre leading-relaxed">
                  {detection.rule_content}
                </pre>
              </div>

              {/* Validation section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Syntax Validation</h2>
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition"
                  >
                    <Activity className={`w-3.5 h-3.5 ${validating ? "animate-spin" : ""}`} />
                    {validating ? "Validating…" : "Run Validation"}
                  </button>
                </div>
                {validationReport && (
                  <div className={`p-4 rounded-xl border space-y-2 ${validationReport.syntax_valid ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                    <div className="flex items-center gap-2">
                      {validationReport.syntax_valid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-xs font-semibold ${validationReport.syntax_valid ? "text-emerald-400" : "text-red-400"}`}>
                        {validationReport.syntax_valid ? "Syntax Valid" : "Syntax Errors Detected"}
                      </span>
                    </div>
                    {validationReport.errors && validationReport.errors.length > 0 && (
                      <ul className="space-y-1">
                        {validationReport.errors.map((e, i) => (
                          <li key={i} className="text-[11px] text-red-400 font-mono">✗ {e}</li>
                        ))}
                      </ul>
                    )}
                    {validationReport.warnings && validationReport.warnings.length > 0 && (
                      <ul className="space-y-1">
                        {validationReport.warnings.map((w, i) => (
                          <li key={i} className="text-[11px] text-yellow-400 font-mono">⚠ {w}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Dataset Replay section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detection Replay Engine</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedDataset}
                      onChange={(e) => setSelectedDataset(e.target.value)}
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300 focus:outline-none"
                    >
                      {DATASETS.map((ds) => (
                        <option key={ds} value={ds}>{ds}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleReplay}
                      disabled={replaying}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white transition"
                    >
                      <Play className={`w-3.5 h-3.5 ${replaying ? "animate-pulse" : ""}`} />
                      {replaying ? "Running…" : "Run Replay Test"}
                    </button>
                  </div>
                </div>

                {replayReport && !replayReport.error && (
                  <div className="p-5 bg-[#0f172a]/60 border border-slate-800 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-semibold text-white">Replay Results — {selectedDataset}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[
                        { label: "True Positives",  value: replayReport.true_positives },
                        { label: "False Positives", value: replayReport.false_positives },
                        { label: "False Negatives", value: replayReport.false_negatives },
                      ].map(({ label, value }) => (
                        <div key={label} className="space-y-1">
                          <div className="text-2xl font-bold text-white">{value ?? "–"}</div>
                          <div className="text-[10px] text-slate-500">{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {["precision", "recall", "f1"].map((metric) => (
                        <ScoreMeter
                          key={metric}
                          label={metric.charAt(0).toUpperCase() + metric.slice(1)}
                          value={replayReport[metric] ?? 0}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {replayReport?.error && (
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-400">
                    ✗ {replayReport.error}
                  </div>
                )}
              </div>

              {/* Approval section */}
              {detection.validation_state !== "approved" && (
                <div className="p-5 bg-[#0f172a]/60 border border-indigo-500/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-white">Peer Review & Approval</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Validate the rule syntax and replay results before promoting to production. Approval is logged in the immutable audit trail.
                  </p>
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {approving ? "Approving…" : "Approve & Promote to Production"}
                  </button>
                  {approvalStatus && (
                    <p className={`text-[11px] ${approvalStatus.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
                      {approvalStatus}
                    </p>
                  )}
                </div>
              )}
              {detection.validation_state === "approved" && (
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-400">Approved &amp; Active</p>
                    <p className="text-[11px] text-slate-400">This rule has been peer-reviewed and is deployed to production.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <aside className="w-72 border-l border-slate-800 flex flex-col overflow-y-auto bg-[#0a0f1a]/30">
              <div className="p-5 space-y-5">
                {/* Meta */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rule Metadata</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: "ID",       value: detection.id.slice(0, 16) + "…" },
                      { label: "Language", value: detection.rule_language.toUpperCase() },
                      { label: "State",    value: detection.validation_state },
                      { label: "Created",  value: new Date(detection.created_at).toLocaleDateString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-300 font-mono text-[11px]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {detection.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{detection.description}</p>
                  </div>
                )}

                {/* MITRE */}
                {detection.mitre_techniques.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MITRE ATT&CK</h3>
                    <div className="flex flex-wrap gap-1">
                      {detection.mitre_techniques.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                    {detection.mitre_tactics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {detection.mitre_tactics.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick actions */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
                  <div className="space-y-1.5">
                    <button
                      onClick={handleValidate}
                      disabled={validating}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition disabled:opacity-40"
                    >
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      Validate Syntax
                    </button>
                    <button
                      onClick={handleReplay}
                      disabled={replaying}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition disabled:opacity-40"
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      Run Replay Test
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading detection rule…
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
