"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  Share2, 
  FileCode, 
  Globe, 
  X, 
  ArrowRight,
  Clock,
  Command
} from "lucide-react";
import { 
  getAlerts, 
  getIncidents, 
  getInvestigations, 
  getDetections, 
  getEntities,
  AlertItem,
  IncidentItem,
  InvestigationItem,
  DetectionItem,
  EntityItem
} from "@/lib/api";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchCategory = "all" | "alerts" | "incidents" | "investigations" | "detections" | "entities";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "alerts" | "incidents" | "investigations" | "detections" | "entities";
  href: string;
  badge?: string;
  badgeColor?: string;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentQueries, setRecentQueries] = useState<string[]>([
    "mimikatz",
    "powershell",
    "T1003.001",
    "SRV-DC01",
    "192.168.1.100",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Execute unified search across all entities
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.toLowerCase().trim();
        const searchPromises: Promise<any>[] = [];

        // Fetch candidates in parallel
        if (category === "all" || category === "alerts") {
          searchPromises.push(
            getAlerts().catch(() => ({ items: [] })).then((res) => {
              const items = Array.isArray(res) ? res : res?.items || [];
              return items
                .filter((a: AlertItem) => 
                  a.title.toLowerCase().includes(q) ||
                  (a.source_host && a.source_host.toLowerCase().includes(q)) ||
                  (a.username && a.username.toLowerCase().includes(q)) ||
                  (a.process_name && a.process_name.toLowerCase().includes(q)) ||
                  (a.id && a.id.toLowerCase().includes(q))
                )
                .slice(0, 5)
                .map((a: AlertItem) => ({
                  id: a.id,
                  title: a.title,
                  subtitle: `Alert · Source: ${a.source} · Host: ${a.source_host || "N/A"}`,
                  category: "alerts" as const,
                  href: `/alerts?search=${encodeURIComponent(a.title)}`,
                  badge: a.severity.toUpperCase(),
                  badgeColor: a.severity === "critical" ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10",
                }));
            })
          );
        }

        if (category === "all" || category === "incidents") {
          searchPromises.push(
            getIncidents().catch(() => []).then((items: IncidentItem[]) => {
              return (items || [])
                .filter((inc) => 
                  inc.title.toLowerCase().includes(q) ||
                  (inc.description && inc.description.toLowerCase().includes(q))
                )
                .slice(0, 5)
                .map((inc) => ({
                  id: inc.id,
                  title: inc.title,
                  subtitle: `Incident · Status: ${inc.status} · Systems: ${inc.affected_systems?.join(", ") || "N/A"}`,
                  category: "incidents" as const,
                  href: `/incidents?id=${inc.id}`,
                  badge: inc.severity?.toUpperCase() || "HIGH",
                  badgeColor: "text-red-400 border-red-500/30 bg-red-500/10",
                }));
            })
          );
        }

        if (category === "all" || category === "investigations") {
          searchPromises.push(
            getInvestigations().catch(() => []).then((items: InvestigationItem[]) => {
              return (items || [])
                .filter((inv) => 
                  inv.title.toLowerCase().includes(q) ||
                  (inv.description && inv.description.toLowerCase().includes(q))
                )
                .slice(0, 5)
                .map((inv) => ({
                  id: inv.id,
                  title: inv.title,
                  subtitle: `Investigation · ${inv.alert_count || 0} Alerts · ${inv.finding_count || 0} Findings`,
                  category: "investigations" as const,
                  href: `/investigations/${inv.id}`,
                  badge: inv.status.toUpperCase(),
                  badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
                }));
            })
          );
        }

        if (category === "all" || category === "detections") {
          searchPromises.push(
            getDetections().catch(() => []).then((items: DetectionItem[]) => {
              return (items || [])
                .filter((det) => 
                  det.name.toLowerCase().includes(q) ||
                  (det.description && det.description.toLowerCase().includes(q)) ||
                  (det.mitre_techniques && det.mitre_techniques.some((t) => t.toLowerCase().includes(q)))
                )
                .slice(0, 5)
                .map((det) => ({
                  id: det.id,
                  title: det.name,
                  subtitle: `Detection Rule · Language: ${det.rule_language.toUpperCase()} · Status: ${det.validation_state}`,
                  category: "detections" as const,
                  href: `/detections/${det.id}`,
                  badge: det.rule_language.toUpperCase(),
                  badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
                }));
            })
          );
        }

        if (category === "all" || category === "entities") {
          searchPromises.push(
            getEntities({ search: q }).catch(() => []).then((items: EntityItem[]) => {
              return (items || [])
                .slice(0, 5)
                .map((ent) => ({
                  id: ent.id,
                  title: ent.value,
                  subtitle: `Entity · Type: ${ent.entity_type.toUpperCase()} · Events: ${ent.event_count}`,
                  category: "entities" as const,
                  href: `/entities?search=${encodeURIComponent(ent.value)}`,
                  badge: ent.is_malicious ? "MALICIOUS" : "OBSERVED",
                  badgeColor: ent.is_malicious ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-slate-400 border-slate-500/30 bg-slate-500/10",
                }));
            })
          );
        }

        const resolved = await Promise.all(searchPromises);
        const combined = resolved.flat();
        setResults(combined);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, category, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    if (query && !recentQueries.includes(query)) {
      setRecentQueries((prev) => [query, ...prev.slice(0, 4)]);
    }
    onClose();
    router.push(item.href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0F172A] border border-[#263248] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-[#263248] flex items-center gap-3 bg-[#0B1020]">
          <Search className="w-5 h-5 text-[#38BDF8] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search alerts, incidents, hosts, IPs, rules, or MITRE techniques..."
            className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none font-sans"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="text-[#64748B] hover:text-[#F8FAFC] p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-[#94A3B8] bg-[#1E293B] border border-[#334155] rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 border-b border-[#263248] bg-[#111827] flex items-center gap-2 overflow-x-auto text-xs font-mono">
          {[
            { id: "all", label: "All Telemetry" },
            { id: "alerts", label: "Alerts" },
            { id: "incidents", label: "Incidents" },
            { id: "investigations", label: "Investigations" },
            { id: "detections", label: "Detections" },
            { id: "entities", label: "Assets & IOCs" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as SearchCategory)}
              className={`px-2.5 py-1 rounded-md transition font-medium whitespace-nowrap ${
                category === cat.id
                  ? "bg-[#38BDF8] text-[#0B1020] font-bold"
                  : "bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results / Suggestions Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#64748B] font-mono">
              Querying SOCForge knowledge graph and PostgreSQL records...
            </div>
          ) : query.trim() === "" ? (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Recent Queries & Pivots
                </span>
                <div className="flex flex-wrap gap-2">
                  {recentQueries.map((rq) => (
                    <button
                      key={rq}
                      onClick={() => setQuery(rq)}
                      className="px-2.5 py-1 rounded bg-[#1E293B] text-xs font-mono text-[#38BDF8] hover:bg-[#263248] transition border border-[#334155]"
                    >
                      {rq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E293B] text-xs text-[#64748B] space-y-1">
                <p className="font-medium text-[#94A3B8]">ProTip: Deep Pivot Syntaxes</p>
                <p className="font-mono text-[11px]">· Type <span className="text-[#38BDF8]">T1003.001</span> to jump to LSASS credential access</p>
                <p className="font-mono text-[11px]">· Type <span className="text-[#38BDF8]">SRV-DC01</span> to search Domain Controller telemetry</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs text-[#94A3B8]">No direct telemetry matches for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-[#64748B] font-mono">Try searching with a broader keyword, host name, or MITRE ID.</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={`${item.category}-${item.id}-${idx}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition ${
                  selectedIndex === idx
                    ? "bg-[#1E293B] border border-[#38BDF8]/40"
                    : "hover:bg-[#151C2E] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded bg-[#0B1020] border border-[#263248] text-[#38BDF8] flex-shrink-0">
                    {item.category === "alerts" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {item.category === "incidents" && <ShieldAlert className="w-4 h-4 text-red-400" />}
                    {item.category === "investigations" && <Share2 className="w-4 h-4 text-blue-400" />}
                    {item.category === "detections" && <FileCode className="w-4 h-4 text-emerald-400" />}
                    {item.category === "entities" && <Globe className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#F8FAFC] truncate font-sans">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate font-mono">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${item.badgeColor || "text-slate-400 border-slate-700 bg-slate-800"}`}>
                      {item.badge}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#263248] bg-[#0B1020] flex items-center justify-between text-[11px] text-[#64748B] font-mono">
          <span>Navigate with <kbd className="px-1 py-0.5 bg-[#1E293B] rounded text-[10px] text-[#94A3B8]">↑</kbd> <kbd className="px-1 py-0.5 bg-[#1E293B] rounded text-[10px] text-[#94A3B8]">↓</kbd> · Select with <kbd className="px-1 py-0.5 bg-[#1E293B] rounded text-[10px] text-[#94A3B8]">↵</kbd></span>
          <span>SOCForge Cross-Correlator v1.0</span>
        </div>
      </div>
    </div>
  );
}
