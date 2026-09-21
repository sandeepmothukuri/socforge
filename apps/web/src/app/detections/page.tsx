"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { 
  getDetections, 
  validateDetection, 
  approveDetection, 
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
  Terminal,
  Code
} from "lucide-react";

export default function DetectionsPage() {
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [selectedDet, setSelectedDet] = useState<DetectionItem | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [validating, setValidating] = useState(false);
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
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-semibold text-white">Detection Engineering Studio</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              Sigma • SPL • KQL
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Rule Catalog */}
          <div className="w-80 border-r border-slate-800 bg-[#0a0f1a] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex gap-2">
              {["all", "sigma", "spl", "kql"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLangFilter(lang)}
                  className={`flex-1 py-1 text-xs uppercase font-mono rounded transition ${
                    langFilter === lang
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDet(d);
                    setValidationReport(null);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    selectedDet?.id === d.id
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="uppercase font-mono font-bold text-emerald-400">
                      {d.rule_language}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-400">
                      {d.validation_state}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">{d.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Version {d.version}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rule Editor & Inspector */}
          {selectedDet ? (
            <div className="flex-1 flex flex-col bg-[#070b12] overflow-hidden">
              {/* Rule Action Toolbar */}
              <div className="p-4 border-b border-slate-800 bg-[#090e18] flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedDet.name}
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-normal">
                      v{selectedDet.version}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">{selectedDet.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-blue-600/20"
                  >
                    <Play className={`w-3.5 h-3.5 ${validating ? "animate-spin" : ""}`} />
                    Run Syntax Validator
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Approve Rule
                  </button>
                </div>
              </div>

              {/* Code Canvas & Validation Report */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-[#060910]">
                  <pre className="whitespace-pre-wrap">{selectedDet.rule_content}</pre>
                </div>

                {/* Validation Panel */}
                <div className="w-full lg:w-96 border-l border-slate-800 bg-[#0a0f1a] p-6 space-y-4 overflow-y-auto">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Validation & Test Status
                  </span>

                  {validationReport ? (
                    <div className="space-y-3">
                      <div
                        className={`p-3 rounded-xl border flex items-center gap-3 ${
                          validationReport.syntax_valid
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                      >
                        {validationReport.syntax_valid ? (
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-bold">
                            {validationReport.syntax_valid
                              ? "Rule Syntax Valid"
                              : "Syntax Validation Errors"}
                          </div>
                          <div className="text-[11px] opacity-80 font-mono">
                            Language: {validationReport.rule_language.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {validationReport.errors.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-red-400">Errors:</span>
                          {validationReport.errors.map((err, idx) => (
                            <div key={idx} className="p-2 rounded bg-red-950/40 border border-red-800/40 text-[11px] text-red-300 font-mono">
                              {err}
                            </div>
                          ))}
                        </div>
                      )}

                      {validationReport.warnings.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-amber-400">Warnings:</span>
                          {validationReport.warnings.map((w, idx) => (
                            <div key={idx} className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300 font-mono">
                              {w}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-800 text-xs text-slate-500 text-center">
                      Click "Run Syntax Validator" above to check this rule against schema rules.
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                    <span className="font-semibold text-slate-400">ATT&CK Mapping:</span>
                    <div className="flex flex-wrap gap-1.5 font-mono">
                      {selectedDet.mitre_techniques?.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Select a detection rule to inspect.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
