"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getIntegrations, testIntegrationHealth, IntegrationItem } from "@/lib/api";
import { Database, Activity, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingName, setTestingName] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

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

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0f1a]/50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-white">Security Integrations & Connectors</h1>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        <div className="flex-1 p-8 overflow-y-auto max-w-5xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">Connector Catalog</h2>
            <p className="text-xs text-slate-400">
              Vendor-neutral adapters connecting external SIEM, EDR, and cloud log analytics platforms into SOCForge normalized schemas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((item) => {
              const res = testResults[item.name];
              return (
                <div
                  key={item.name}
                  className="p-6 bg-[#0f172a]/60 border border-slate-800 rounded-xl space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.display_name}</h3>
                      <span className="text-xs font-mono text-slate-500 uppercase">
                        Type: {item.integration_type}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase ${
                        item.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.enabled ? "Active" : "Planned"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-mono"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {res && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="font-semibold text-slate-200">
                        Status: <span className="font-mono text-blue-400">{res.status}</span>
                      </div>
                      <pre className="text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap font-mono">
                        {JSON.stringify(res.details, null, 2)}
                      </pre>
                    </div>
                  )}

                  <button
                    onClick={() => handleTest(item.name)}
                    disabled={testingName === item.name}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <Activity className={`w-3.5 h-3.5 ${testingName === item.name ? "animate-spin" : ""}`} />
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
