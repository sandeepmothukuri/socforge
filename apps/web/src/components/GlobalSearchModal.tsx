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
                  badgeColor: "text-white border-neutral-800 bg-neutral-900",
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
                  badgeColor: ent.is_malicious ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-neutral-400 border-neutral-800 bg-neutral-900",
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#000000] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3 bg-[#050505]">
          <Search className="w-5 h-5 text-white flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search alerts, incidents, hosts, IPs, rules, or MITRE techniques..."
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-sans"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="text-neutral-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 border-b border-neutral-800 bg-[#050505] flex items-center gap-2 overflow-x-auto text-xs font-mono">
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
                  ? "bg-white text-black font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results / Suggestions Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#000000]">
          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-500 font-mono">
              Querying SOCForge knowledge graph and PostgreSQL records...
            </div>
          ) : query.trim() === "" ? (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Recent Queries & Pivots
                </span>
                <div className="flex flex-wrap gap-2">
                  {recentQueries.map((rq) => (
                    <button
                      key={rq}
                      onClick={() => setQuery(rq)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 text-xs font-mono text-neutral-200 hover:bg-neutral-800 hover:text-white transition border border-neutral-800"
                    >
                      {rq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 text-xs text-neutral-400 space-y-1">
                <p className="font-medium text-white">ProTip: Deep Pivot Syntaxes</p>
                <p className="font-mono text-[11px]">· Type <span className="text-emerald-400">T1003.001</span> to jump to LSASS credential access</p>
                <p className="font-mono text-[11px]">· Type <span className="text-emerald-400">SRV-DC01</span> to search Domain Controller telemetry</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs text-neutral-300">No direct telemetry matches for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-neutral-500 font-mono">Try searching with a broader keyword, host name, or MITRE ID.</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={`${item.category}-${item.id}-${idx}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition ${
                  selectedIndex === idx
                    ? "bg-neutral-900 border border-neutral-700"
                    : "hover:bg-neutral-900/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded bg-black border border-neutral-800 text-white flex-shrink-0">
                    {item.category === "alerts" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {item.category === "incidents" && <ShieldAlert className="w-4 h-4 text-red-400" />}
                    {item.category === "investigations" && <Share2 className="w-4 h-4 text-white" />}
                    {item.category === "detections" && <FileCode className="w-4 h-4 text-emerald-400" />}
                    {item.category === "entities" && <Globe className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate font-sans">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate font-mono">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${item.badgeColor || "text-neutral-400 border-neutral-800 bg-neutral-900"}`}>
                      {item.badge}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-neutral-800 bg-[#050505] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>Navigate with <kbd className="px-1 py-0.5 bg-neutral-900 rounded text-[10px] text-neutral-300">↑</kbd> <kbd className="px-1 py-0.5 bg-neutral-900 rounded text-[10px] text-neutral-300">↓</kbd> · Select with <kbd className="px-1 py-0.5 bg-neutral-900 rounded text-[10px] text-neutral-300">↵</kbd></span>
          <span>SOCForge Cross-Correlator v1.0</span>
        </div>
      </div>
    </div>
  );
}
