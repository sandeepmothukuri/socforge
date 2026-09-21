"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  getResponseActions,
  executeResponseAction,
  approveResponseAction,
  ResponseActionItem,
} from "@/lib/api";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Zap,
} from "lucide-react";

export default function ResponsesPage() {
  const [actions, setActions] = useState<ResponseActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [actionType, setActionType] = useState("isolate_host");
  const [targetType, setTargetType] = useState("endpoint");
  const [targetValue, setTargetValue] = useState("SRV-DC01");
  const [justification, setJustification] = useState("Empirical T1003.001 LSASS dump detected on critical host");
  const [submitting, setSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getResponseActions();
      setActions(data);
    } catch (err) {
      console.error("Failed to load response actions:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRequestAction(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await executeResponseAction(actionType, targetType, targetValue, justification);
      setNotice(`Containment action '${actionType}' submitted for approval.`);
      setRequestModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Failed to request containment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(id: string) {
    setApprovingId(id);
    try {
      await approveResponseAction(id);
      setNotice(`Action ${id.slice(0, 8)} approved and executed [SIMULATED]`);
      await loadData();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  }

  const pendingActions = actions.filter((a) => a.status === "pending_approval");
  const executedActions = actions.filter((a) => a.status === "executed");

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626]/80 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-[#F8FAFC]">
                Containment & Response Approval Ledger
              </h1>
              <p className="text-[11px] font-mono text-[#A7B0C0]">
                Dual-Gated Human Approval • Four-Eyes Enforcement • Safe Simulated Adapters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setRequestModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 text-[#38BDF8] transition font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request Containment</span>
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#263248] bg-[#151C2E] text-[#A7B0C0] hover:text-[#F8FAFC] transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#38BDF8]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Notice */}
        {notice && (
          <div className="bg-[#151C2E] border-b border-[#38BDF8]/40 px-8 py-2.5 text-xs text-[#38BDF8] flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#38BDF8]" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-[#6B7280] hover:text-[#F8FAFC]">×</button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* Policy Banner */}
          <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Containment Guardrails Active
                </h3>
              </div>
              <p className="text-xs text-[#A7B0C0]">
                All containment actions require Incident Commander approval. Automated unverified execution is prohibited. Adapter executions operate in simulated mode with full audit logging.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
                Four-Eyes: ENFORCED
              </span>
              <span className="px-2.5 py-1 rounded bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] font-bold">
                Adapters: SIMULATED
              </span>
            </div>
          </div>

          {/* Status Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#A7B0C0] font-mono">Total Actions</span>
              <div className="text-2xl font-black text-white font-mono">{actions.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#F59E0B] font-mono">Pending Approval</span>
              <div className="text-2xl font-black text-[#F59E0B] font-mono">{pendingActions.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#22C55E] font-mono">Executed Actions</span>
              <div className="text-2xl font-black text-[#22C55E] font-mono">{executedActions.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#38BDF8] font-mono">Approval Mode</span>
              <div className="text-2xl font-black text-[#38BDF8] font-mono">Safe Gate</div>
            </div>
          </div>

          {/* Actions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Ledger Entries ({actions.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-[#6B7280] font-mono">Loading approval ledger...</div>
            ) : actions.length === 0 ? (
              <div className="p-12 rounded-xl bg-[#151C2E] border border-dashed border-[#263248] text-center space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#6B7280] mx-auto" />
                <p className="text-xs text-[#A7B0C0]">No containment actions requested yet.</p>
                <button
                  onClick={() => setRequestModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#38BDF8] text-[#0B1020] font-semibold text-xs hover:bg-[#38BDF8]/90 transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Request First Action
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {actions.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl bg-[#151C2E] border border-[#263248] flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-[#38BDF8]/30"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/40 font-bold">
                          {act.action_type.replace("_", " ")}
                        </span>
                        <span className="text-xs font-mono text-white font-bold">
                          Target: {act.target_entity_value} ({act.target_entity_type})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            act.status === "executed"
                              ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40"
                              : act.status === "pending_approval"
                              ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 animate-pulse"
                              : "bg-[#263248] text-[#A7B0C0]"
                          }`}
                        >
                          {act.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#A7B0C0]">{act.justification}</p>
                      <div className="text-[11px] text-[#6B7280] font-mono flex items-center gap-4">
                        <span>ID: {act.id.slice(0, 8)}</span>
                        <span>Requested: {new Date(act.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {act.status === "pending_approval" && (
                        <button
                          onClick={() => handleApprove(act.id)}
                          disabled={approvingId === act.id}
                          className="px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0B1020] font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-[#22C55E]/20"
                        >
                          <ShieldCheck className={`w-3.5 h-3.5 ${approvingId === act.id ? "animate-spin" : ""}`} />
                          <span>Approve & Execute [Simulated]</span>
                        </button>
                      )}
                      {act.status === "executed" && (
                        <span className="text-[11px] font-mono text-[#22C55E] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Executed Safely
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Request Containment Modal */}
        {requestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-[#111827] border border-[#38BDF8]/40 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-[#263248] flex items-center justify-between bg-[#0B1020]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                    Request Containment Action
                  </span>
                </div>
                <button onClick={() => setRequestModalOpen(false)} className="text-[#A7B0C0] hover:text-white text-lg font-mono">
                  ×
                </button>
              </div>

              <form onSubmit={handleRequestAction} className="p-5 space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[#A7B0C0] block">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full p-2 rounded bg-[#0B1020] border border-[#263248] text-white outline-none focus:border-[#38BDF8]"
                  >
                    <option value="isolate_host">isolate_host (Network Isolation)</option>
                    <option value="unisolate_host">unisolate_host (Restore Network)</option>
                    <option value="block_ip">block_ip (Firewall Null Route)</option>
                    <option value="revoke_session">revoke_session (Invalidate Tokens)</option>
                    <option value="disable_user">disable_user (AD Account Lock)</option>
                    <option value="quarantine_file">quarantine_file (EDR File Vault)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#A7B0C0] block">Target Entity Type</label>
                    <select
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value)}
                      className="w-full p-2 rounded bg-[#0B1020] border border-[#263248] text-white outline-none focus:border-[#38BDF8]"
                    >
                      <option value="endpoint">endpoint</option>
                      <option value="user">user</option>
                      <option value="ip_address">ip_address</option>
                      <option value="domain">domain</option>
                      <option value="file">file</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#A7B0C0] block">Target Value</label>
                    <input
                      type="text"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder="e.g. SRV-DC01, 10.0.1.50"
                      className="w-full p-2 rounded bg-[#0B1020] border border-[#263248] text-white outline-none focus:border-[#38BDF8]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A7B0C0] block">Operational Justification</label>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={3}
                    placeholder="Provide empirical evidence and reason for containment..."
                    className="w-full p-2 rounded bg-[#0B1020] border border-[#263248] text-white outline-none focus:border-[#38BDF8]"
                    required
                  />
                </div>

                <div className="pt-2 border-t border-[#263248] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="px-3 py-1.5 rounded bg-[#151C2E] text-[#A7B0C0] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded bg-[#38BDF8] text-[#0B1020] font-bold hover:bg-[#38BDF8]/90 transition"
                  >
                    {submitting ? "Submitting..." : "Submit for Approval"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
