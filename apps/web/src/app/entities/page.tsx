"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { getEntities, EntityItem } from "@/lib/api";
import { 
  Globe, 
  Server, 
  User, 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  ExternalLink,
  Filter,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function EntitiesPage() {
  const [entities, setEntities] = useState<EntityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [onlyMalicious, setOnlyMalicious] = useState(false);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEntities({
        entity_type: selectedType !== "all" ? selectedType : undefined,
        search: searchQuery || undefined,
        is_malicious: onlyMalicious ? true : undefined,
      });
      setEntities(data);
    } catch (err: any) {
      console.error("Failed to fetch entities:", err);
      setError(err.message || "Failed to load entity directory");
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchQuery, onlyMalicious]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntities();
  };

  // Metrics calculation
  const totalCount = entities.length;
  const maliciousCount = entities.filter(e => e.is_malicious).length;
  const hostCount = entities.filter(e => e.entity_type === "host").length;
  const userCount = entities.filter(e => e.entity_type === "user").length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "host":
        return <Server className="w-3.5 h-3.5 text-[#38BDF8]" />;
      case "user":
        return <User className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case "ip":
        return <Globe className="w-3.5 h-3.5 text-[#A855F7]" />;
      case "file_hash":
        return <FileCode className="w-3.5 h-3.5 text-[#EC4899]" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1020] text-[#F8FAFC] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#263248] bg-[#111827] px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#A7B0C0] mb-1 font-mono">
                <span>SOC ENGINE</span>
                <span>/</span>
                <span className="text-[#38BDF8]">ASSETS & INDICATORS</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2.5">
                <Globe className="w-6 h-6 text-[#38BDF8]" />
                Asset & Threat Indicator Directory
              </h1>
              <p className="text-xs text-[#94A3B8] mt-1">
                Centralized telemetry graph entities, observed IOCs, affected domain assets, and risk classifications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchEntities()}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-[#1E293B] hover:bg-[#2A374A] border border-[#263248] rounded text-xs font-semibold text-[#F8FAFC] transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#38BDF8]" : ""}`} />
                Refresh Assets
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-[#0F172A] border border-[#263248] rounded-xl p-4 flex flex-col">
              <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Observed Entities</span>
              <div className="text-2xl font-bold text-[#F8FAFC] mt-1 font-mono">{loading ? "..." : totalCount}</div>
              <span className="text-[11px] text-[#64748B] mt-0.5">Active in telemetry graph</span>
            </div>
            <div className="bg-[#0F172A] border border-[#263248] rounded-xl p-4 flex flex-col">
              <span className="text-[11px] font-semibold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Malicious IOCs
              </span>
              <div className="text-2xl font-bold text-[#EF4444] mt-1 font-mono">{loading ? "..." : maliciousCount}</div>
              <span className="text-[11px] text-[#64748B] mt-0.5">Flagged by threat intel</span>
            </div>
            <div className="bg-[#0F172A] border border-[#263248] rounded-xl p-4 flex flex-col">
              <span className="text-[11px] font-semibold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                Protected Endpoints
              </span>
              <div className="text-2xl font-bold text-[#38BDF8] mt-1 font-mono">{loading ? "..." : hostCount}</div>
              <span className="text-[11px] text-[#64748B] mt-0.5">Domain hosts & servers</span>
            </div>
            <div className="bg-[#0F172A] border border-[#263248] rounded-xl p-4 flex flex-col">
              <span className="text-[11px] font-semibold text-[#F59E0B] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Observed User Accounts
              </span>
              <div className="text-2xl font-bold text-[#F59E0B] mt-1 font-mono">{loading ? "..." : userCount}</div>
              <span className="text-[11px] text-[#64748B] mt-0.5">Correlated identities</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111827] p-3 rounded-xl border border-[#263248]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: "all", label: "All Types" },
                { id: "host", label: "Hosts" },
                { id: "user", label: "Users" },
                { id: "ip", label: "IPs" },
                { id: "domain", label: "Domains" },
                { id: "file_hash", label: "Hashes" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedType === tab.id
                      ? "bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40"
                      : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <div className="h-4 w-px bg-[#263248] mx-2 hidden md:block" />

              <label className="flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer pl-1">
                <input
                  type="checkbox"
                  checked={onlyMalicious}
                  onChange={(e) => setOnlyMalicious(e.target.checked)}
                  className="rounded border-[#263248] bg-[#0B1020] text-[#EF4444] focus:ring-0"
                />
                <span className={onlyMalicious ? "text-[#EF4444] font-semibold" : ""}>Flagged Malicious Only</span>
              </label>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search indicator, host, IP..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#0B1020] border border-[#263248] rounded-lg text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
              />
            </form>
          </div>

          {/* Main Entity Table */}
          <div className="bg-[#111827] border border-[#263248] rounded-xl overflow-hidden">
            {error ? (
              <div className="p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-[#EF4444] mx-auto mb-2" />
                <div className="text-sm font-semibold text-[#F8FAFC]">Failed to load entities</div>
                <div className="text-xs text-[#94A3B8] mt-1">{error}</div>
                <button
                  onClick={() => fetchEntities()}
                  className="mt-4 px-3 py-1.5 bg-[#1E293B] hover:bg-[#263248] text-xs font-semibold rounded text-[#38BDF8]"
                >
                  Retry Connection
                </button>
              </div>
            ) : loading ? (
              <div className="p-12 text-center text-[#94A3B8] space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#38BDF8]" />
                <p className="text-xs">Querying asset directory and relational IOC graph...</p>
              </div>
            ) : entities.length === 0 ? (
              <div className="p-12 text-center text-[#94A3B8]">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <div className="text-sm font-semibold text-[#F8FAFC]">No matching entities found</div>
                <p className="text-xs mt-1">Try clearing filters or running a detection replay demo.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B1020] text-[#94A3B8] font-semibold border-b border-[#263248]">
                    <tr>
                      <th className="px-4 py-3">Entity Type</th>
                      <th className="px-4 py-3">Indicator / Value</th>
                      <th className="px-4 py-3">Reputation</th>
                      <th className="px-4 py-3">Event Count</th>
                      <th className="px-4 py-3">Risk Score</th>
                      <th className="px-4 py-3">Last Observed</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F293D]">
                    {entities.map((item) => (
                      <tr key={item.id} className="hover:bg-[#151C2E] transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.entity_type)}
                            <span className="uppercase text-[10px] font-bold tracking-wider text-[#A7B0C0]">
                              {item.entity_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-[#F8FAFC] font-medium truncate max-w-xs" title={item.value}>
                            {item.value}
                          </div>
                          {item.display_name && (
                            <div className="text-[10px] text-[#64748B]">{item.display_name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.is_malicious ? (
                            <span className="px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-semibold text-[10px] inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Malicious
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-semibold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Neutral / Clean
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[#94A3B8]">
                          {item.event_count || 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-[#1F293D] rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${
                                  (item.risk_score || 0) > 75
                                    ? "bg-[#EF4444]"
                                    : (item.risk_score || 0) > 40
                                    ? "bg-[#F59E0B]"
                                    : "bg-[#38BDF8]"
                                }`}
                                style={{ width: `${Math.min(100, item.risk_score || 20)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-[#94A3B8]">
                              {item.risk_score ? item.risk_score.toFixed(0) : "20"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#64748B]">
                          {item.last_seen_at ? new Date(item.last_seen_at).toLocaleString() : "Recently"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/alerts?search=${encodeURIComponent(item.value)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#2A374A] border border-[#263248] rounded text-[11px] font-semibold text-[#38BDF8] transition"
                          >
                            <span>Search Alerts</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
