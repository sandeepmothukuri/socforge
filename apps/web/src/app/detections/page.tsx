"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { 
  getDetections, 
  validateDetection, 
  approveDetection, 
  testDetectionRule,
  DetectionItem, 
  ValidationReport 
} from "@/lib/api";
import { 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  ShieldCheck, 
  RefreshCw, 
  Activity,
  BarChart3,
  Flame,
} from "lucide-react";

export default function DetectionsPage() {
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [selectedDet, setSelectedDet] = useState<DetectionItem | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [replayReport, setReplayReport] = useState<any | null>(null);
  const [validating, setValidating] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [langFilter, setLangFilter] = useState("all");

  async function loadData() {
    setLoading(true);
    try {
      const data = await getDetections();
      setDetections(data);
      if (data.length > 0) {
        setSelectedDet(data[0]);
      }
    } catch (err) {
      console.error("Failed to load detections:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleValidate() {
    if (!selectedDet) return;
    setValidating(true);
    try {
      const report = await validateDetection(selectedDet.id);
      setValidationReport(report);
    } catch (err) {
      console.error("Validation failed:", err);
    } finally {
      setValidating(false);
    }
  }

  async function handleReplay() {
    if (!selectedDet) return;
    setReplaying(true);
    try {
      const report = await testDetectionRule(selectedDet.id, "synthetic-soc-v1");
      setReplayReport(report);
    } catch (err: any) {
      alert(`Replay test failed: ${err.message}`);
    } finally {
      setReplaying(false);
    }
  }

  async function handleApprove() {
    if (!selectedDet) return;
    try {
      const updated = await approveDetection(selectedDet.id);
      setSelectedDet(updated);
      await loadData();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  }

  const filtered = detections.filter(
    (d) => langFilter === "all" || d.rule_language === langFilter
  );

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626]/80 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">Detection Engineering Studio</h1>
              <p className="text-[11px] font-mono text-[#A7B0C0]">
                Sigma • SPL • KQL Multi-Format Rule Formulation & Telemetry Replay Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-[#263248] bg-[#151C2E] hover:bg-[#172033] text-[#A7B0C0] hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#38BDF8]" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Rule Catalog */}
          <div className="w-80 border-r border-[#263248] bg-[#0E1626] flex flex-col overflow-hidden">
            <div className="p-3 border-b border-[#263248] flex gap-1.5">
              {["all", "sigma", "spl", "kql"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLangFilter(lang)}
                  className={`flex-1 py-1 text-xs uppercase font-mono rounded transition ${
                    langFilter === lang
                      ? "bg-[#38BDF8] text-[#0B1020] font-bold"
                      : "bg-[#151C2E] text-[#A7B0C0] hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDet(d);
                    setValidationReport(null);
                    setReplayReport(null);
                  }}
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    selectedDet?.id === d.id
                      ? "border-[#38BDF8] bg-[#38BDF8]/10"
                      : "border-[#263248] bg-[#151C2E] hover:border-[#38BDF8]/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="uppercase font-mono font-bold text-[#38BDF8]">
                      {d.rule_language}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-[#111827] text-[#A7B0C0] border border-[#263248]">
                      {d.validation_state}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">{d.name}</h4>
                  <p className="text-[11px] text-[#A7B0C0] font-mono mt-1">{d.mitre_techniques?.join(", ") || "ATT&CK"}</p>
                  <div className="flex justify-end mt-1.5">
                    <a
                      href={`/detections/${d.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-[#38BDF8] hover:underline font-mono"
                    >
                      View Detail →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rule Editor & Inspector */}
          {selectedDet ? (
            <div className="flex-1 flex flex-col bg-[#0B1020] overflow-hidden">
              {/* Rule Action Toolbar */}
              <div className="p-4 border-b border-[#263248] bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedDet.name}
                    <span className="text-xs px-2 py-0.5 rounded bg-[#172033] border border-[#263248] text-[#38BDF8] font-mono font-normal uppercase">
                      {selectedDet.rule_language}
                    </span>
                  </h2>
                  <p className="text-xs text-[#A7B0C0] mt-0.5">{selectedDet.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151C2E] hover:bg-[#172033] border border-[#263248] text-[#A7B0C0] hover:text-white rounded-lg font-semibold transition"
                  >
                    <Play className={`w-3.5 h-3.5 ${validating ? "animate-spin text-[#38BDF8]" : ""}`} />
                    Syntax Check
                  </button>

                  <button
                    onClick={handleReplay}
                    disabled={replaying}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B1020] rounded-lg font-bold transition shadow-md shadow-[#38BDF8]/20"
                  >
                    <Activity className={`w-3.5 h-3.5 ${replaying ? "animate-spin" : ""}`} />
                    Replay Against Dataset
                  </button>

                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0B1020] rounded-lg font-bold transition shadow-md shadow-[#22C55E]/20"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Approve Rule
                  </button>
                </div>
              </div>

              {/* Code Canvas & Validation/Replay Inspector */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-[#F8FAFC] leading-relaxed bg-[#070C18]">
                  <pre className="whitespace-pre-wrap">{selectedDet.rule_content}</pre>
                </div>

                {/* Inspection Side Panel */}
                <div className="w-full lg:w-96 border-l border-[#263248] bg-[#111827] p-5 space-y-5 overflow-y-auto text-xs font-mono">
                  {/* Replay Test Report */}
                  {replayReport && (
                    <div className="space-y-3 p-4 rounded-xl bg-[#151C2E] border border-[#38BDF8]/40">
                      <div className="flex items-center justify-between border-b border-[#263248] pb-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
                          <span className="font-bold text-white uppercase tracking-wider">Replay Evaluation</span>
                        </div>
                        <span className="text-[10px] text-[#22C55E] font-bold">DATASET REPLAY</span>
                      </div>

                      <div className="text-[11px] text-[#A7B0C0]">
                        Dataset: <strong className="text-white">{replayReport.dataset_name || "synthetic-soc-v1"}</strong> ({replayReport.total_events || 100} events)
                      </div>

                      {/* Confusion Matrix Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded bg-[#0B1020] border border-[#263248]">
                          <span className="text-[10px] text-[#A7B0C0] block">Precision</span>
                          <span className="text-sm font-bold text-[#38BDF8]">
                            {replayReport.precision !== undefined ? `${(replayReport.precision * 100).toFixed(0)}%` : "N/A"}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-[#0B1020] border border-[#263248]">
                          <span className="text-[10px] text-[#A7B0C0] block">Recall</span>
                          <span className="text-sm font-bold text-[#22C55E]">
                            {replayReport.recall !== undefined ? `${(replayReport.recall * 100).toFixed(0)}%` : "N/A"}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-[#0B1020] border border-[#263248]">
                          <span className="text-[10px] text-[#A7B0C0] block">F1 Score</span>
                          <span className="text-sm font-bold text-[#F59E0B]">
                            {replayReport.f1 !== undefined ? (replayReport.f1 * 100).toFixed(0) : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Confusion Matrix Breakdown */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex justify-between">
                          <span>True Pos (TP):</span>
                          <strong>{replayReport.true_positives ?? 0}</strong>
                        </div>
                        <div className="p-2 rounded bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] flex justify-between">
                          <span>False Pos (FP):</span>
                          <strong>{replayReport.false_positives ?? 0}</strong>
                        </div>
                        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 flex justify-between">
                          <span>False Neg (FN):</span>
                          <strong>{replayReport.false_negatives ?? 0}</strong>
                        </div>
                        <div className="p-2 rounded bg-[#172033] border border-[#263248] text-[#A7B0C0] flex justify-between">
                          <span>True Neg (TN):</span>
                          <strong>{replayReport.true_negatives ?? 0}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Syntax Validation Status */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A7B0C0] block">
                      Syntax & Parser Validation
                    </span>

                    {validationReport ? (
                      <div
                        className={`p-3 rounded-xl border flex items-center gap-3 ${
                          validationReport.syntax_valid
                            ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]"
                            : "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]"
                        }`}
                      >
                        {validationReport.syntax_valid ? (
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-bold">
                            {validationReport.syntax_valid ? "Syntax Valid" : "Syntax Errors"}
                          </div>
                          <div className="text-[11px] opacity-80">
                            Language: {validationReport.rule_language?.toUpperCase() || selectedDet.rule_language.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-[#263248] text-xs text-[#6B7280] text-center">
                        Click &quot;Syntax Check&quot; or &quot;Replay Against Dataset&quot; above to run automated analysis.
                      </div>
                    )}
                  </div>

                  {/* ATT&CK Mapping */}
                  <div className="pt-4 border-t border-[#263248] space-y-2">
                    <span className="font-bold text-[#A7B0C0] uppercase tracking-wider block">ATT&CK Mapping</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDet.mitre_techniques?.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#6B7280] font-mono">
              Select a detection rule from catalog to inspect.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
