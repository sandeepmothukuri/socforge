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
  AlertCircle
} from "lucide-react";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";
import { GlobalSearchModal } from "@/components/GlobalSearchModal";
import { getHealthStatus } from "@/lib/api";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<"Production" | "Staging" | "Sandbox">("Production");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<string>("60s");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  // Global Keyboard Listener for Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastRefreshed(new Date().toLocaleTimeString());
    getHealthStatus().then((res) => {
      if (res) setHealthStatus(res);
    }).catch(() => {});
    // Dispatch custom event for child views
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("socforge-refresh"));
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const navSections = [
    {
      title: "OPERATIONS",
      items: [
        { href: "/dashboard", label: "SOC Command Center", icon: Activity },
        { href: "/alerts", label: "Alert Triage Queue", icon: AlertTriangle },
        { href: "/incidents", label: "Incident Command", icon: ShieldAlert },
        { href: "/investigations", label: "Investigation Studio", icon: Share2 },
      ]
    },
    {
      title: "ENGINEERING & INTEL",
      items: [
        { href: "/detections", label: "Detection Engineering", icon: FileCode },
        { href: "/analytics", label: "Analytics & MITRE", icon: BarChart3 },
        { href: "/entities", label: "Assets & Indicators", icon: Globe },
        { href: "/hunts", label: "Threat Hunting", icon: Crosshair },
      ]
    },
    {
      title: "GOVERNANCE & PLATFORM",
      items: [
        { href: "/responses", label: "Response Ledger", icon: ShieldCheck },
        { href: "/integrations", label: "SIEM Connectors", icon: Database },
        { href: "/audit", label: "Audit & Security Logs", icon: FileText },
        { href: "/desktop", label: "Client Workspace", icon: Laptop },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#0B1020] text-[#F8FAFC] overflow-hidden font-sans">
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Sidebar */}
      <aside className="w-64 border-r border-[#263248] bg-[#111827] flex flex-col flex-shrink-0 z-30">
        {/* Brand Header */}
        <div className="h-16 border-b border-[#263248] px-4 flex items-center justify-between bg-[#0B1020]">
          <Link href="/" className="hover:opacity-90 transition">
            <SocForgeLogo size="sm" showWordmark={true} />
          </Link>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#172033] border border-[#263248] text-[#38BDF8]">
              v1.0
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4 text-xs font-medium flex-1 overflow-y-auto">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                {sec.title}
              </span>
              <div className="space-y-0.5 pt-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition font-medium ${
                        isActive
                          ? "bg-[#172033] text-[#38BDF8] border border-[#263248] font-semibold shadow-sm"
                          : "text-[#94A3B8] hover:bg-[#151C2E] hover:text-[#F8FAFC]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#38BDF8]" : "text-[#64748B]"}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Workspace Footer */}
        <div className="p-3 border-t border-[#263248] bg-[#0B1020] flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="font-semibold text-[#F8FAFC] text-[11px]">SOCForge Enterprise</span>
            </div>
            <span className="text-[10px] text-[#64748B] font-mono">Workspace: default (SecOps)</span>
          </div>
          <span 
            className={`h-2 w-2 rounded-full ${healthStatus.status === "healthy" ? "bg-[#22C55E]" : "bg-[#F59E0B]"} animate-pulse`} 
            title={`System Status: ${healthStatus.status}`} 
          />
        </div>
      </aside>

      {/* Main Content Area with Global Header */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Top Control Bar */}
        <header className="h-16 border-b border-[#263248] bg-[#0E1626] px-6 flex items-center justify-between flex-shrink-0 z-20">
          {/* Left: Organization & Environment Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#151C2E] border border-[#263248] text-xs font-mono">
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="text-[#94A3B8]">Env:</span>
              <select
                value={selectedEnv}
                onChange={(e) => setSelectedEnv(e.target.value as any)}
                className="bg-transparent text-[#F8FAFC] font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="Production" className="bg-[#0F172A] text-white">Production (Corp)</option>
                <option value="Staging" className="bg-[#0F172A] text-white">Staging (SecLab)</option>
                <option value="Sandbox" className="bg-[#0F172A] text-white">Sandbox (Replay)</option>
              </select>
            </div>

            {/* Global Search Button (⌘K) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#263248] bg-[#151C2E] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#38BDF8]/40 transition text-xs font-mono"
            >
              <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="hidden sm:inline">Search telemetry, IOCs, rules...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#0B1020] text-[10px] text-[#64748B] border border-[#263248]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Controls: Time Range, Auto-Refresh, Refresh, Notifications, Profile */}
          <div className="flex items-center gap-2.5 text-xs font-mono">
            {/* Time Range Selector */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#151C2E] border border-[#263248] text-[#94A3B8]">
              <span>Window:</span>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-transparent text-[#F8FAFC] font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="15m" className="bg-[#0F172A] text-white">Last 15 min</option>
                <option value="1h" className="bg-[#0F172A] text-white">Last 1 hour</option>
                <option value="6h" className="bg-[#0F172A] text-white">Last 6 hours</option>
                <option value="24h" className="bg-[#0F172A] text-white">Last 24 hours</option>
                <option value="7d" className="bg-[#0F172A] text-white">Last 7 days</option>
                <option value="30d" className="bg-[#0F172A] text-white">Last 30 days</option>
              </select>
            </div>

            {/* Auto Refresh */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#151C2E] border border-[#263248] text-[#94A3B8]">
              <span>Sync:</span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(e.target.value)}
                className="bg-transparent text-[#38BDF8] font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="off" className="bg-[#0F172A] text-white">Manual</option>
                <option value="30s" className="bg-[#0F172A] text-white">30s</option>
                <option value="60s" className="bg-[#0F172A] text-white">1m</option>
                <option value="300s" className="bg-[#0F172A] text-white">5m</option>
              </select>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              title={`Last refreshed: ${lastRefreshed}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#263248] bg-[#151C2E] hover:bg-[#1E293B] text-[#F8FAFC] transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden xl:inline text-[11px] text-[#94A3B8]">{lastRefreshed}</span>
            </button>

            {/* Health Indicator Badge */}
            <div 
              title={`API & Database: ${healthStatus.status}`}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[#263248] bg-[#151C2E] text-[11px]"
            >
              <HeartPulse className={`w-3.5 h-3.5 ${healthStatus.status === "healthy" ? "text-emerald-400" : "text-amber-400"}`} />
              <span className="hidden md:inline font-semibold text-emerald-400 uppercase text-[10px]">HEALTHY</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 rounded-lg border border-[#263248] bg-[#151C2E] text-[#94A3B8] hover:text-[#F8FAFC] transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0F172A] border border-[#263248] rounded-xl shadow-2xl p-4 z-50 space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-[#263248] pb-2 font-mono">
                    <span className="text-xs font-bold text-[#F8FAFC]">Live Security Notifications</span>
                    <span className="text-[10px] text-[#38BDF8]">3 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-[#1E293B] border border-[#334155] space-y-1">
                      <div className="flex items-center gap-1.5 text-red-400 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> High-Severity Alert
                      </div>
                      <p className="text-[#94A3B8] text-[11px]">Mimikatz LSASS memory dump flagged on SRV-DC01</p>
                    </div>
                    <div className="p-2 rounded bg-[#1E293B] border border-[#334155] space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Detection Validated
                      </div>
                      <p className="text-[#94A3B8] text-[11px]">Sigma rule T1003.001 passed replay test (F1=1.0)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analyst Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#263248]">
              <div className="w-7 h-7 rounded-full bg-[#172033] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] font-bold text-xs">
                SM
              </div>
              <div className="hidden xl:flex flex-col">
                <span className="text-xs font-semibold text-[#F8FAFC] leading-none">Sandeep Mothukuri</span>
                <span className="text-[10px] text-[#64748B] font-mono leading-tight">Lead SecOps Architect</span>
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
