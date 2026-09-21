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
} from "lucide-react";
import { SocForgeLogo } from "@/components/ui/SocForgeLogo";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/alerts", label: "Alerts", icon: AlertTriangle },
    { href: "/investigations", label: "Investigations & Graph", icon: Share2 },
    { href: "/detections", label: "Detection Studio", icon: FileCode },
    { href: "/hunts", label: "Threat Hunting", icon: Crosshair },
    { href: "/incidents", label: "Incidents", icon: ShieldAlert },
    { href: "/integrations", label: "Connectors", icon: Database },
    { href: "/audit", label: "Audit Log", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#0B1020] text-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#263248] bg-[#111827] flex flex-col flex-shrink-0">
        <div className="h-16 border-b border-[#263248] px-4 flex items-center justify-between bg-[#0B1020]">
          <Link href="/" className="hover:opacity-90 transition">
            <SocForgeLogo size="sm" showWordmark={true} />
          </Link>
          <Link href="/" title="Home" className="text-[#6B7280] hover:text-[#A7B0C0] transition p-1">
            <Home className="w-4 h-4" />
          </Link>
        </div>

        <nav className="p-3 space-y-1 text-xs font-medium flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded transition font-medium ${
                  isActive
                    ? "bg-[#172033] text-[#38BDF8] border border-[#263248] font-semibold"
                    : "text-[#A7B0C0] hover:bg-[#151C2E] hover:text-[#F8FAFC]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#38BDF8]" : "text-[#6B7280]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Workspace Footer */}
        <div className="p-3 border-t border-[#263248] bg-[#0B1020] flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="font-semibold text-[#F8FAFC]">Active Workspace</span>
            <span className="text-[11px] text-[#A7B0C0] font-mono">default (Production)</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" title="Workspace Active" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0B1020]">
        {children}
      </main>
    </div>
  );
}
