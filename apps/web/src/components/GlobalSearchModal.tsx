"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Command,
  Sparkles,
  Zap,
  BarChart3,
  Network,
  Crosshair,
  FileText,
  Sliders,
  Radio,
  Boxes,
  Lock,
  ChevronRight
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

type SearchCategory = "all" | "commands" | "alerts" | "incidents" | "investigations" | "detections" | "entities";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "commands" | "actions" | "alerts" | "incidents" | "investigations" | "detections" | "entities";
  href?: string;
  action?: () => void;
  badge?: string;
  badgeColor?: string;
  icon?: any;
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

  // Global Command shortcuts list
  const navigationCommands: SearchResultItem[] = useMemo(() => [
    {
      id: "cmd-dash",
      title: "CTI Overview & Threat Dashboard",
      subtitle: "Global threat arc radar, live telemetry feeds, enterprise health",
      category: "commands",
      href: "/dashboard",
      badge: "PAGE",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      icon: BarChart3
    },
    {
      id: "cmd-alerts",
      title: "Alert Triage Queue",
      subtitle: "Multi-vendor alert ingestion, triage status, correlation",
      category: "commands",
      href: "/alerts",
      badge: "TRIAGE",
      badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      icon: AlertTriangle
    },
    {
      id: "cmd-graph",
      title: "Attack Path & Evidence Graph",
      subtitle: "Visual attack graph, multi-hop entity blast radius, temporal kill-chain",
      category: "commands",
      href: "/graph",
      badge: "GRAPH",
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      icon: Network
    },
    {
      id: "cmd-incidents",
      title: "Incident Command War Room",
      subtitle: "Critical severity containment, 4-eyes approval gates, timeline",
      category: "commands",
      href: "/incidents",
      badge: "INCIDENT",
      badgeColor: "text-red-400 border-red-500/30 bg-red-500/10",
      icon: ShieldAlert
    },
    {
      id: "cmd-detections",
      title: "Detection Engineering Catalog",
      subtitle: "Sigma, Splunk SPL, Microsoft KQL rule catalog and validator",
      category: "commands",
      href: "/detections",
      badge: "RULES",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      icon: FileCode
    },
    {
      id: "cmd-hunts",
      title: "Threat Hunting Studio",
      subtitle: "Hypothesis-driven adversary hunting, data lake telemetry queries",
      category: "commands",
      href: "/hunts",
      badge: "HUNT",
      badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      icon: Crosshair
    },
    {
      id: "cmd-intel",
      title: "Threat Actor & Diamond Model Matrix",
      subtitle: "APT tracking, adversary capabilities, infrastructure correlation",
      category: "commands",
      href: "/intel",
      badge: "INTEL",
      badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      icon: Globe
    },
    {
      id: "cmd-playbooks",
      title: "SOAR Playbook Studio",
      subtitle: "Automated orchestration workflows and containment logic",
      category: "commands",
      href: "/playbooks",
      badge: "SOAR",
      badgeColor: "text-orange-400 border-orange-500/30 bg-orange-500/10",
      icon: Zap
    },
    {
      id: "cmd-audit",
      title: "FAIR Risk & Immutable Audit Ledger",
      subtitle: "Cryptographic HMAC compliance audit and executive dossier",
      category: "commands",
      href: "/audit",
      badge: "AUDIT",
      badgeColor: "text-neutral-400 border-neutral-700 bg-neutral-900",
      icon: FileText
    }
  ], []);

  const operatorActions: SearchResultItem[] = useMemo(() => [
    {
      id: "act-copilot",
      title: "Open Autonomous AI Security Co-Pilot",
      subtitle: "Multi-step reasoning agent for alert triage and attack analysis (Ctrl+\\)",
      category: "actions",
      action: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("socforge-open-copilot"));
        }
      },
      badge: "AI ASSIST",
      badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/20",
      icon: Sparkles
    },
    {
      id: "act-new-hunt",
      title: "Initialize Threat Hunt Hypothesis",
      subtitle: "Draft empirical hypothesis for adversary lateral movement or persistence",
      category: "actions",
      href: "/hunts",
      badge: "NEW HUNT",
      badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      icon: Crosshair
    },
    {
      id: "act-new-rule",
      title: "Author New Sigma Detection Rule",
      subtitle: "Open detection studio with YAML syntax validator and translation compiler",
      category: "actions",
      href: "/detections",
      badge: "AUTHOR",
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      icon: FileCode
    },
    {
      id: "act-export-audit",
      title: "Download Executive Risk & Compliance Dossier",
      subtitle: "Generate cryptographically attested markdown audit ledger",
      category: "actions",
      href: "/audit",
      badge: "EXPORT",
      badgeColor: "text-neutral-300 border-neutral-700 bg-neutral-800",
      icon: FileText
    }
  ], []);

  // Execute unified search across all entities and commands
  useEffect(() => {
    if (!isOpen) return;

    const q = query.toLowerCase().trim();

    if (!q) {
      // If empty query, show quick navigation commands & operator actions
      if (category === "all" || category === "commands") {
        setResults([...operatorActions, ...navigationCommands]);
      } else {
        setResults([]);
      }
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchPromises: Promise<SearchResultItem[]>[] = [];

        // Match against navigation commands
        const matchedCommands = navigationCommands.filter((c) =>
          c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
        );
        const matchedActions = operatorActions.filter((a) =>
          a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
        );

        // Fetch telemetry candidates in parallel
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
                .slice(0, 4)
                .map((a: AlertItem) => ({
                  id: a.id,
                  title: a.title,
                  subtitle: `Alert · Host: ${a.source_host || "N/A"} · User: ${a.username || "SYSTEM"}`,
                  category: "alerts" as const,
                  href: `/alerts?search=${encodeURIComponent(a.title)}`,
                  badge: a.severity.toUpperCase(),
                  badgeColor: a.severity === "critical" ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10",
                  icon: AlertTriangle
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
                .slice(0, 4)
                .map((inc) => ({
                  id: inc.id,
                  title: inc.title,
                  subtitle: `Incident · Status: ${inc.status} · Systems: ${inc.affected_systems?.join(", ") || "N/A"}`,
                  category: "incidents" as const,
                  href: `/incidents?id=${inc.id}`,
                  badge: inc.severity?.toUpperCase() || "HIGH",
                  badgeColor: "text-red-400 border-red-500/30 bg-red-500/10",
                  icon: ShieldAlert
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
                .slice(0, 4)
                .map((inv) => ({
                  id: inv.id,
                  title: inv.title,
                  subtitle: `Investigation · ${inv.alert_count || 0} Alerts · ${inv.finding_count || 0} Findings`,
                  category: "investigations" as const,
                  href: `/investigations/${inv.id}`,
                  badge: inv.status.toUpperCase(),
                  badgeColor: "text-white border-neutral-800 bg-neutral-900",
                  icon: Share2
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
                .slice(0, 4)
                .map((det) => ({
                  id: det.id,
                  title: det.name,
                  subtitle: `Rule · Language: ${det.rule_language.toUpperCase()} · Status: ${det.validation_state}`,
                  category: "detections" as const,
                  href: `/detections/${det.id}`,
                  badge: det.rule_language.toUpperCase(),
                  badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
                  icon: FileCode
                }));
            })
          );
        }

        if (category === "all" || category === "entities") {
          searchPromises.push(
            getEntities({ search: q }).catch(() => []).then((items: EntityItem[]) => {
              return (items || [])
                .slice(0, 4)
                .map((ent) => ({
                  id: ent.id,
                  title: ent.value,
                  subtitle: `Entity · Type: ${ent.entity_type.toUpperCase()} · Events: ${ent.event_count}`,
                  category: "entities" as const,
                  href: `/entities?search=${encodeURIComponent(ent.value)}`,
                  badge: ent.is_malicious ? "MALICIOUS" : "OBSERVED",
                  badgeColor: ent.is_malicious ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-neutral-400 border-neutral-800 bg-neutral-900",
                  icon: Globe
                }));
            })
          );
        }

        const resolvedArrays = await Promise.all(searchPromises);
        const combinedTelemetry = resolvedArrays.flat();
        
        const finalResults = [
          ...matchedActions,
          ...matchedCommands,
          ...combinedTelemetry
        ];

        setResults(finalResults);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, category, isOpen, navigationCommands, operatorActions]);

  const handleSelect = (item: SearchResultItem) => {
    if (query.trim() && !recentQueries.includes(query.trim())) {
      setRecentQueries((prev) => [query.trim(), ...prev.slice(0, 4)]);
    }
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#060606] border border-[#2a2a2a] rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-[#1f1f1f] flex items-center gap-3 bg-[#0a0a0a]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Command className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, page name, IP, rule, CVE, or technique (e.g. 'mimikatz', 'graph', 'T1003')..."
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-sans"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 border-b border-[#1f1f1f] bg-[#070707] flex items-center gap-2 overflow-x-auto text-xs font-mono">
          {[
            { id: "all", label: "All Items" },
            { id: "commands", label: "Commands & Pages" },
            { id: "alerts", label: "Alerts" },
            { id: "incidents", label: "Incidents" },
            { id: "investigations", label: "Investigations" },
            { id: "detections", label: "Detections" },
            { id: "entities", label: "Assets & IOCs" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as SearchCategory)}
              className={`px-2.5 py-1 rounded-lg transition font-medium whitespace-nowrap text-[11px] ${
                category === cat.id
                  ? "bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/30"
                  : "bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-[#222]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#040404] overscroll-contain">
          {loading ? (
            <div className="p-10 text-center space-y-2">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-xs text-neutral-400 font-mono">Querying SOCForge knowledge graph and PostgreSQL...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-semibold text-neutral-300">No matches found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-neutral-500 font-mono">
                Try searching by MITRE technique (<span className="text-emerald-400">T1059</span>), hostname (<span className="text-cyan-400">SRV-DC01</span>), or tool name (<span className="text-amber-400">powershell</span>).
              </p>
              <div className="pt-3 flex justify-center gap-2">
                {recentQueries.map((rq) => (
                  <button
                    key={rq}
                    onClick={() => setQuery(rq)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 text-xs font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition"
                  >
                    {rq}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const ItemIcon = item.icon || Command;
                return (
                  <div
                    key={`${item.category}-${item.id}-${idx}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition ${
                      selectedIndex === idx
                        ? "bg-[#141414] border border-neutral-700 shadow-md"
                        : "hover:bg-[#0c0c0c] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-[#0e0e0e] border border-neutral-800 text-white flex-shrink-0">
                        <ItemIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate font-sans flex items-center gap-2">
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
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-[#1a1a1a] bg-[#090909] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800 text-[10px] text-neutral-300">↑</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800 text-[10px] text-neutral-300">↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800 text-[10px] text-neutral-300">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800 text-[10px] text-neutral-300">ESC</kbd> Close</span>
          </div>
          <span className="text-emerald-400/80 font-bold">SOCForge Global Dispatcher</span>
        </div>
      </div>
    </div>
  );
}
