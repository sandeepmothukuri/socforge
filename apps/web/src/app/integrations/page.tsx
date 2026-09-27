"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getIntegrations, testIntegrationHealth, IntegrationItem } from "@/lib/api";
import { Database, Activity, CheckCircle2, AlertCircle, RefreshCw, Lock, ShieldCheck } from "lucide-react";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingName, setTestingName] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [batchTesting, setBatchTesting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getIntegrations();
      setIntegrations(data);
    } catch (err) {
      console.error("Failed to load integrations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleTest(name: string) {
    setTestingName(name);
    try {
      const res = await testIntegrationHealth(name);
      setTestResults((prev) => ({ ...prev, [name]: res }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [name]: { status: "error", details: { error: err.message } },
      }));
    } finally {
      setTestingName(null);
    }
  }

  async function handleTestAll() {
    setBatchTesting(true);
    for (const item of integrations) {
      await handleTest(item.name);
    }
    setBatchTesting(false);
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000] text-white">
        <header className="h-16 border-b border-neutral-800 bg-[#050505] px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">Security Integrations & Connectors Hub</h1>
              <p className="text-[11px] font-mono text-neutral-400">
                Vendor-Neutral Telemetry Adapters • AES-256 Vault Encryption • Live Diagnostics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              onClick={handleTestAll}
              disabled={batchTesting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 transition font-bold"
            >
              <Activity className={`w-3.5 h-3.5 ${batchTesting ? "animate-spin" : ""}`} />
              <span>Test All Connectors</span>
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-white" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
          {/* Security & Vault Banner */}
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  AES-256-GCM Vault Protected Credentials
                </h3>
              </div>
              <p className="text-xs text-neutral-400">
                API tokens, passwords, and private keys are encrypted at rest with AES-256-GCM authenticated encryption. Zero plaintext secrets in database.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] font-bold">
                ENCRYPTED VAULT: ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {integrations.map((item) => {
              const res = testResults[item.name];
              return (
                <div
                  key={item.name}
                  className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-4 hover:border-neutral-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.display_name}</h3>
                      <span className="text-[11px] font-mono text-neutral-400 uppercase block">
                        Type: {item.integration_type}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        item.is_active
                          ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40"
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                      }`}
                    >
                      {item.is_active ? "Active" : "Ready"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block font-mono">
                      Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded bg-neutral-900 text-white border border-neutral-800 text-[10px] font-mono"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {res && (
                    <div className="p-3 rounded-lg bg-black border border-neutral-800 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Diagnostic:</span>
                        <span className={res.status === "healthy" ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {res.status.toUpperCase()}
                        </span>
                      </div>
                      <pre className="text-[10px] text-neutral-300 overflow-x-auto whitespace-pre-wrap max-h-24">
                        {JSON.stringify(res.details, null, 2)}
                      </pre>
                    </div>
                  )}

                  <button
                    onClick={() => handleTest(item.name)}
                    disabled={testingName === item.name}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <Activity className={`w-3.5 h-3.5 text-emerald-400 ${testingName === item.name ? "animate-spin" : ""}`} />
                    Test Connectivity
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
