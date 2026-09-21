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
    <div className="flex h-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0a0f1a] flex flex-col flex-shrink-0">
        <div className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              SF
            </div>
            <span className="font-bold text-base tracking-tight">
              SOC<span className="text-blue-500">Forge</span>
            </span>
          </Link>
          <Link href="/" title="Home" className="text-slate-500 hover:text-slate-300 transition">
            <Home className="w-4 h-4" />
          </Link>
        </div>

        <nav className="p-4 space-y-1 text-sm font-medium flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate">Sandeep Mothukuri</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              FastAPI: Online
            </span>
            <span>v0.1.0</span>
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
