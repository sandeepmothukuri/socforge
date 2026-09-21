"use client";

import React from "react";
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
  Home,
  User
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/alerts", label: "Alerts", icon: AlertTriangle },
    { href: "/investigations", label: "Investigations & Graph", icon: Share2 },
    { href: "/detections", label: "Detection Engineering", icon: FileCode },
    { href: "/hunts", label: "Threat Hunting", icon: Crosshair },
    { href: "/incidents", label: "Incidents", icon: ShieldAlert },
    { href: "/integrations", label: "Integrations", icon: Database },
    { href: "/audit", label: "Audit Log", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#050811] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/70 bg-[#070c18] flex flex-col flex-shrink-0">
        <div className="h-16 border-b border-slate-800/70 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-tr from-blue-700 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
              SF
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              SOC<span className="text-cyan-400">Forge</span>
            </span>
          </Link>
          <Link href="/" title="Home" className="text-slate-500 hover:text-slate-300 transition">
            <Home className="w-4 h-4" />
          </Link>
        </div>

        <nav className="p-4 space-y-1.5 text-sm font-medium flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-xs font-semibold ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 font-bold shadow-sm shadow-cyan-950/40"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/70 space-y-2 bg-[#060a14]/60">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate font-semibold">Sandeep Mothukuri</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              FastAPI: Online
            </span>
            <span className="text-slate-500">v0.1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
