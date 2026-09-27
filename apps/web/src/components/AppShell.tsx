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
  Compass,
  Eye,
  X
} from "lucide-react";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";
import { GlobalSearchModal } from "@/components/GlobalSearchModal";
import { SOCCopilotDrawer } from "@/components/SOCCopilotDrawer";
import { ThreatTicker } from "@/components/ui/ThreatTicker";
import { TacticalAudioProvider, TacticalAudioToggle } from "@/components/ui/TacticalAudioPlayer";
import { QuickActionDock } from "@/components/ui/QuickActionDock";
import { getHealthStatus } from "@/lib/api";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [densityMode, setDensityMode] = useState<"compact" | "standard" | "executive">("standard");
  const [selectedEnv, setSelectedEnv] = useState<"Production" | "Staging" | "Sandbox">("Production");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<string>("60s");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      severity: "CRITICAL",
      title: "CVE-2024-1709 Active In-Wild Exploit",
      desc: "Added to CISA Known Exploited Vulnerabilities catalog. Remote authentication bypass observed.",
      time: "2m ago",
      href: "/incidents",
      actionText: "Triage Alert"
    },
    {
      id: "notif-2",
      severity: "HIGH",
      title: "LSASS Memory Dump Signature Intercepted",
      desc: "Wazuh EDR blocked OpenProcess mask 0x1F0FFF on WIN-FIN-04. 4-eyes containment approval pending.",
      time: "14m ago",
      href: "/investigations",
      actionText: "View Case"
    },
    {
      id: "notif-3",
      severity: "INFO",
      title: "TAXII 2.1 STIX Threat Feed Ingested",
      desc: "Synchronized 26,002 verified IOCs from AlienVault OTX and Mandiant feeds.",
      time: "38m ago",
      href: "/detections",
      actionText: "Inspect IOCs"
    },
    {
      id: "notif-4",
      severity: "SUCCESS",
      title: "Automated Host Isolation Succeeded",
      desc: "Host DC-PROD-01 network quarantine enforced via CrowdStrike Falcon API integration.",
      time: "1h ago",
      href: "/operations",
      actionText: "Audit Event"
    }
  ]);
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
        { href: "/deception", label: "Deception & Honeypots", icon: Eye },
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
    <TacticalAudioProvider>
      <div className="flex h-screen bg-[#000000] text-[#FFFFFF] overflow-hidden font-sans select-none">
        <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        <SOCCopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* Collapsible OpenCTI-style Sidebar */}
      <aside className={`${isCollapsed ? "w-16" : "w-64"} border-r border-neutral-800/80 bg-[#050505] flex flex-col flex-shrink-0 z-30 transition-all duration-300 ease-in-out`}>
        {/* Brand Header */}
        <div className="h-16 border-b border-neutral-800/80 px-4 flex items-center justify-between bg-[#000000]">
          <Link href="/" className="hover:opacity-90 transition flex items-center gap-2 overflow-hidden">
            <SocForgeLogo size="sm" showWordmark={!isCollapsed} />
          </Link>
          {!isCollapsed && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141414] border border-neutral-800 text-emerald-400">
              v2.0
            </span>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-2 space-y-4 text-xs font-medium flex-1 overflow-y-auto">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
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
                          ? "bg-neutral-900 text-white border border-neutral-700/80 font-semibold shadow-sm"
                          : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-neutral-500"}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Workspace & Collapse Toggle Footer */}
        <div className="p-2 border-t border-neutral-800/80 bg-[#000000] flex items-center justify-between text-xs">
          {!isCollapsed && (
            <div className="flex flex-col truncate pr-1">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-white text-[11px] truncate">SOCForge Enterprise</span>
              </div>
              <span className="text-[10px] text-neutral-400">OpenCTI + Falcon Engine</span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white transition flex items-center gap-1 text-[11px]"
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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#000000]">
        {/* Global Top Control Bar */}
        <header className="h-16 border-b border-neutral-800/80 bg-[#050505] px-6 flex items-center justify-between flex-shrink-0 z-20">
          {/* Left: Search the Platform (Omnisearch matching OpenCTI) */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-neutral-800 bg-[#000000] text-neutral-400 hover:text-white hover:border-neutral-700 transition text-xs shadow-inner"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-neutral-400" />
                <span>Search the platform (IOCs, CVEs, TTPs, Threat Actors)...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 text-[10px] text-neutral-400 border border-neutral-800 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Controls: Cloud Feeds, Copilot, Time Range, Health, Notifications, Profile */}
          <div className="flex items-center gap-2.5 text-xs">
            {/* Live Threat Feed Sync Status */}
            <div 
              title="TAXII / MISP / VirusTotal Threat Feeds Connected"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-[#000000] text-neutral-400"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">FEEDS SYNCED</span>
            </div>

            {/* SOC AI Copilot Button (⌘J) */}
            <button
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700/80 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white transition text-xs shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-semibold">SOC Copilot</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#000000] text-[10px] text-emerald-400 border border-neutral-700 font-mono">
                ⌘J
              </kbd>
            </button>

            {/* Tactical Audio Toggle */}
            <TacticalAudioToggle />

            {/* Viewport Density Switcher */}
            <div className="hidden xl:flex items-center gap-1 bg-[#000000] p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
              <button
                onClick={() => setDensityMode("compact")}
                className={`px-2 py-0.5 rounded transition ${
                  densityMode === "compact" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
                title="Compact Density Mode"
              >
                NOC
              </button>
              <button
                onClick={() => setDensityMode("standard")}
                className={`px-2 py-0.5 rounded transition ${
                  densityMode === "standard" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
                title="Standard Operations Mode"
              >
                STD
              </button>
              <button
                onClick={() => setDensityMode("executive")}
                className={`px-2 py-0.5 rounded transition ${
                  densityMode === "executive" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
                title="Executive Mode"
              >
                EXEC
              </button>
            </div>

            {/* Time Window Selector */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#000000] border border-neutral-800 text-neutral-400">
              <span>Window:</span>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="1h" className="bg-[#0A0A0A] text-white">Last 1 hour</option>
                <option value="24h" className="bg-[#0A0A0A] text-white">Last 24 hours</option>
                <option value="7d" className="bg-[#0A0A0A] text-white">Last 7 days</option>
                <option value="3m" className="bg-[#0A0A0A] text-white">Last 3 months</option>
                <option value="1y" className="bg-[#0A0A0A] text-white">Last 1 year</option>
              </select>
            </div>

            {/* Manual Refresh */}
            <button
              onClick={handleManualRefresh}
              title={`Last synced: ${lastRefreshed}`}
              className="p-2 rounded-lg border border-neutral-800 bg-[#000000] hover:bg-neutral-900 text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-neutral-300 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-lg border transition relative ${
                  notificationsOpen
                    ? "border-amber-500/50 bg-neutral-900 text-amber-400"
                    : "border-neutral-800 bg-[#000000] text-neutral-400 hover:text-white"
                }`}
                aria-label="Notifications"
                title="View Security Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  {/* Backdrop for clicking outside */}
                  <div
                    className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[1px]"
                    onClick={() => setNotificationsOpen(false)}
                  />

                  {/* Notification Dropdown Panel - Fixed to top-right below header */}
                  <div className="fixed top-16 right-4 sm:right-6 w-[380px] sm:w-[440px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5.5rem)] flex flex-col bg-[#070707] border border-[#2a2a2a] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="p-3.5 bg-[#0d0d0d] border-b border-[#222] flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">Security Notifications</span>
                            {unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                                {unreadCount} New
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">Live Telemetry & Response Dispatch</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => setUnreadCount(0)}
                            className="text-[10px] text-neutral-400 hover:text-white font-mono underline transition"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setNotificationsOpen(false)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Scrollable List of Notifications */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 overscroll-contain">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center space-y-2">
                          <ShieldCheck className="w-8 h-8 text-neutral-600 mx-auto" />
                          <div className="text-neutral-400 text-xs font-semibold">All Notifications Cleared</div>
                          <p className="text-neutral-600 text-[11px]">All connected telemetry feeds and automated playbooks are operating normally.</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-3 bg-[#0d0d0d] hover:bg-[#141414] border border-[#222] hover:border-neutral-700 rounded-xl transition duration-150 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                n.severity === "CRITICAL" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                n.severity === "HIGH" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                n.severity === "SUCCESS" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}>
                                {n.severity}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-500">{n.time}</span>
                                <button
                                  onClick={() => {
                                    setNotifications(prev => prev.filter(item => item.id !== n.id));
                                    setUnreadCount(prev => Math.max(0, prev - 1));
                                  }}
                                  className="text-neutral-500 hover:text-neutral-300 p-0.5 rounded hover:bg-neutral-800 transition"
                                  title="Dismiss notification"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="text-white font-semibold text-xs leading-snug break-words">{n.title}</div>
                            <div className="text-neutral-300 text-[11px] leading-relaxed break-words font-sans">{n.desc}</div>
                            <div className="flex items-center justify-between pt-1 border-t border-[#1a1a1a]">
                              <Link
                                href={n.href}
                                onClick={() => setNotificationsOpen(false)}
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                              >
                                <span>{n.actionText}</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                              <span className="text-[10px] text-neutral-600 font-mono">SOCForge SOAR</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-between flex-shrink-0 text-xs">
                      <Link
                        href="/audit"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-neutral-400 hover:text-white flex items-center gap-1.5 font-mono text-[11px] transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Security Audit Log</span>
                      </Link>
                      <button
                        onClick={() => {
                          setNotifications([]);
                          setUnreadCount(0);
                        }}
                        className="text-neutral-500 hover:text-neutral-300 text-[11px] font-mono transition"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Analyst Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs">
                SM
              </div>
              <div className="hidden xl:flex flex-col">
                <span className="text-xs font-semibold text-white leading-none">Sandeep Mothukuri</span>
                <span className="text-[11px] text-neutral-400 leading-tight">Lead SecOps Architect</span>
              </div>
            </div>
          </div>
        </header>

        {/* CTI Live Threat Marquee Ticker */}
        <ThreatTicker />

        {/* View Content */}
        <div className={`flex-1 overflow-hidden flex flex-col bg-[#000000] ${
          densityMode === "compact" ? "text-[11px]" : densityMode === "executive" ? "text-sm" : ""
        }`}>
          {children}
        </div>
      </main>

      {/* Floating Tactical Quick Actions Dock */}
      <QuickActionDock />
    </div>
    </TacticalAudioProvider>
  );
}
