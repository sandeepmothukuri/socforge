import React from "react";

interface SocForgeLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
}

export function SocForgeLogo({
  size = "md",
  showWordmark = true,
  className = "",
}: SocForgeLogoProps) {
  const sizeMap = {
    sm: { icon: 22, text: "text-xs", badge: "text-[9px]" },
    md: { icon: 28, text: "text-sm", badge: "text-[10px]" },
    lg: { icon: 36, text: "text-base", badge: "text-xs" },
    xl: { icon: 48, text: "text-xl", badge: "text-xs" },
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* High-Tech Vector Security Shield & Forge Emblem */}
      <div
        className="relative flex items-center justify-center rounded-lg bg-[#111827] border border-[#263248] shadow-md shadow-[#38BDF8]/10 overflow-hidden flex-shrink-0"
        style={{ width: dim.icon + 10, height: dim.icon + 10 }}
      >
        <svg
          width={dim.icon}
          height={dim.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background facet gradient */}
          <defs>
            <linearGradient id="shieldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#172033" />
              <stop offset="0.5" stopColor="#0E1626" />
              <stop offset="1" stopColor="#0B1020" />
            </linearGradient>
            <linearGradient id="cyanAccent" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="coreGlow" x1="24" y1="14" x2="24" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="0.6" stopColor="#22C55E" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Outer faceted shield boundary */}
          <path
            d="M24 4L39 10V22C39 32.5 32.5 40.5 24 44C15.5 40.5 9 32.5 9 22V10L24 4Z"
            fill="url(#shieldGrad)"
            stroke="#263248"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Inner cyber circuit traces */}
          <path
            d="M24 8L35 12.5V21C35 29.5 29.8 36.2 24 39.5C18.2 36.2 13 29.5 13 21V12.5L24 8Z"
            stroke="url(#cyanAccent)"
            strokeWidth="1.2"
            strokeOpacity="0.6"
            strokeDasharray="2 2"
          />

          {/* Core Forge Anvil / Flame geometric prism */}
          <path
            d="M24 14L30 24H25.5V33L18 22H22.5L24 14Z"
            fill="url(#coreGlow)"
          />

          {/* Radar / lattice focal point */}
          <circle cx="24" cy="24" r="2" fill="#F8FAFC" />
          <circle cx="24" cy="4" r="1.5" fill="#38BDF8" />
          <circle cx="9" cy="22" r="1.5" fill="#38BDF8" />
          <circle cx="39" cy="22" r="1.5" fill="#38BDF8" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-[#F8FAFC] ${dim.text}`}>
              SOC<span className="text-[#38BDF8]">Forge</span>
            </span>
            <span
              className={`font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-[#172033] border border-[#263248] text-[#38BDF8] tracking-widest ${dim.badge}`}
            >
              CORE
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#A7B0C0] tracking-wider uppercase">
            Security Operations
          </span>
        </div>
      )}
    </div>
  );
}
