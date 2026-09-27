"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  AlertTriangle, 
  Share2, 
  FileCode, 
  Crosshair, 
  ShieldAlert, 
  Database, 
  FileText,
  BarChart3,
  Globe,
  Home,
  ShieldCheck,
  Laptop,
  Search,
  RefreshCw,
  Bell,
  ChevronDown,
  User,
  Shield,
  Layers,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  Network,
  Radio,
  Sparkles,
  Zap,
  Cpu,
  Users,
  ChevronLeft,
  ChevronRight,
  Cloud,
  FolderOpen,
  Boxes,
  Compass
} from "lucide-react";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";
import { GlobalSearchModal } from "@/components/GlobalSearchModal";
import { SOCCopilotDrawer } from "@/components/SOCCopilotDrawer";
import { getHealthStatus } from "@/lib/api";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<"Production" | "Staging" | "Sandbox">("Production");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<string>("60s");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{ status: string; uptime_seconds: number; components: Record<string, string> }>({
    status: "healthy",
    uptime_seconds: 3600,
    components: { database: "healthy", redis: "healthy", api: "healthy" }
  });

  useEffect(() => {
    setLastRefreshed(new Date().toLocaleTimeString());
    getHealthStatus().then((res) => {
      if (res) setHealthStatus(res);
    }).catch(() => {});
  }, []);

  // Global Keyboard Listener for Search (Cmd+K) and Copilot (Cmd+J)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setCopilotOpen((prev) => !prev);
      }
    }

    const handleCustomOpenCopilot = () => setCopilotOpen(true);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("socforge-open-copilot", handleCustomOpenCopilot);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("socforge-open-copilot", handleCustomOpenCopilot);
    };
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastRefreshed(new Date().toLocaleTimeString());
    getHealthStatus().then((res) => {
      if (res) setHealthStatus(res);
    }).catch(() => {});
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("socforge-refresh"));
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // OpenCTI-style Categorized Navigation Hierarchy
  const navSections = [
    {
      title: "CTI & ANALYSES",
      items: [
        { href: "/dashboard", label: "CTI Overview", icon: Home },
        { href: "/intel", label: "Threat Actor Matrix", icon: Globe },
        { href: "/analytics", label: "Analytics & MITRE", icon: BarChart3 },
      ]
    },
    {
      title: "CASES & RESPONSE",
      items: [
        { href: "/incidents", label: "Incident War Room", icon: ShieldAlert },
        { href: "/investigations", label: "Investigation Studio", icon: Share2 },
        { href: "/graph", label: "Attack Path Visualizer", icon: Network },
      ]
    },
    {
      title: "EVENTS & OBSERVATIONS",
      items: [
        { href: "/alerts", label: "Alert Triage Queue", icon: AlertTriangle },
        { href: "/entities", label: "Observables & Indicators", icon: Layers },
      ]
    },
    {
      title: "SECURITY ARSENAL",
      items: [
        { href: "/detections", label: "Detection Engineering", icon: FileCode },
        { href: "/playbooks", label: "Visual SOAR Playbooks", icon: Zap },
        { href: "/simulation", label: "Adversary BAS Simulator", icon: ShieldCheck },
        { href: "/forensics", label: "Malware & YARA Lab", icon: Cpu },
      ]
    },
    {
      title: "OPERATIONS & PLATFORM",
      items: [
        { href: "/hunts", label: "Threat Hunting Studio", icon: Crosshair },
        { href: "/operations", label: "Shift Handoff & SLAs", icon: Users },
        { href: "/wallboard", label: "OLED Command Wallboard", icon: Radio },
        { href: "/integrations", label: "SIEM Connectors", icon: Database },
        { href: "/audit", label: "Audit & Security Logs", icon: FileText },
        { href: "/desktop", label: "Client Workspace", icon: Laptop },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#070C18] text-[#F8FAFC] overflow-hidden font-sans select-none">
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <SOCCopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* Collapsible OpenCTI-style Sidebar */}
      <aside className={`${isCollapsed ? "w-16" : "w-64"} border-r border-[#1E293B] bg-[#0A0F1D] flex flex-col flex-shrink-0 z-30 transition-all duration-300 ease-in-out`}>
        {/* Brand Header */}
        <div className="h-16 border-b border-[#1E293B] px-4 flex items-center justify-between bg-[#070C18]">
          <Link href="/" className="hover:opacity-90 transition flex items-center gap-2 overflow-hidden">
            <SocForgeLogo size="sm" showWordmark={!isCollapsed} />
          </Link>
          {!isCollapsed && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#172033] border border-[#263248] text-[#38BDF8]">
              v2.0
            </span>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-2 space-y-4 text-xs font-medium flex-1 overflow-y-auto">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  {sec.title}
                </span>
              )}
              <div className="space-y-0.5 pt-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition font-medium ${
                        isActive
                          ? "bg-slate-800 text-sky-400 border border-slate-700 font-semibold shadow-sm"
                          : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Workspace & Collapse Toggle Footer */}
        <div className="p-2 border-t border-slate-800 bg-[#070C18] flex items-center justify-between text-xs">
          {!isCollapsed && (
            <div className="flex flex-col truncate pr-1">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold text-white text-[11px] truncate">SOCForge Enterprise</span>
              </div>
              <span className="text-[10px] text-slate-500">OpenCTI + Falcon Engine</span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px]"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area with OpenCTI-style Top Bar */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Top Control Bar */}
        <header className="h-16 border-b border-slate-800 bg-[#0A0F1D] px-6 flex items-center justify-between flex-shrink-0 z-20">
          {/* Left: Search the Platform (Omnisearch matching OpenCTI) */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-800 bg-[#070C18] text-slate-400 hover:text-slate-100 hover:border-sky-500/40 transition text-xs shadow-inner"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-sky-400" />
                <span>Search the platform (IOCs, CVEs, TTPs, Threat Actors)...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 border border-slate-800 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Controls: Cloud Feeds, Copilot, Time Range, Health, Notifications, Profile */}
          <div className="flex items-center gap-2.5 text-xs">
            {/* Live Threat Feed Sync Status */}
            <div 
              title="TAXII / MISP / VirusTotal Threat Feeds Connected"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#070C18] text-slate-400"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">FEEDS SYNCED</span>
            </div>

            {/* SOC AI Copilot Button (⌘J) */}
            <button
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 transition text-xs shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline font-semibold">SOC Copilot</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#070C18] text-[10px] text-indigo-400 border border-indigo-500/30 font-mono">
                ⌘J
              </kbd>
            </button>

            {/* Time Window Selector */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070C18] border border-slate-800 text-slate-400">
              <span>Window:</span>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="1h" className="bg-[#0A0F1D] text-white">Last 1 hour</option>
                <option value="24h" className="bg-[#0A0F1D] text-white">Last 24 hours</option>
                <option value="7d" className="bg-[#0A0F1D] text-white">Last 7 days</option>
                <option value="3m" className="bg-[#0A0F1D] text-white">Last 3 months</option>
                <option value="1y" className="bg-[#0A0F1D] text-white">Last 1 year</option>
              </select>
            </div>

            {/* Manual Refresh */}
            <button
              onClick={handleManualRefresh}
              title={`Last synced: ${lastRefreshed}`}
              className="p-2 rounded-lg border border-[#1E293B] bg-[#070C18] hover:bg-[#172033] text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg border border-[#1E293B] bg-[#070C18] text-[#94A3B8] hover:text-white transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0A0F1D] border border-[#1E293B] rounded-xl shadow-2xl p-4 z-50 space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 font-mono">
                    <span className="text-xs font-bold text-white">Live Threat Intelligence Alerts</span>
                    <span className="text-[10px] text-[#38BDF8]">3 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-[#070C18] border border-[#1E293B] space-y-1">
                      <div className="flex items-center gap-1.5 text-red-400 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> New High-Confidence Exploit
                      </div>
                      <p className="text-[#94A3B8] text-[11px]">CVE-2024-1709 added to CISA Known Exploited Vulnerabilities</p>
                    </div>
                    <div className="p-2 rounded bg-[#070C18] border border-[#1E293B] space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> TAXII Feed Ingested
                      </div>
                      <p className="text-[#94A3B8] text-[11px]">Processed 26,002 new IP/domain IOC observables</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analyst Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-xs">
                SM
              </div>
              <div className="hidden xl:flex flex-col">
                <span className="text-xs font-semibold text-white leading-none">Sandeep Mothukuri</span>
                <span className="text-[11px] text-slate-400 leading-tight">Lead SecOps Architect</span>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
