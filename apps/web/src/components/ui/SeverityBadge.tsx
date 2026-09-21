import React from "react";

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "informational";

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  size?: "sm" | "md";
  showDot?: boolean;
}

export function SeverityBadge({ severity, size = "md", showDot = true }: SeverityBadgeProps) {
  const norm = severity.toLowerCase() as SeverityLevel;

  const styles: Record<SeverityLevel, { bg: string; text: string; border: string; dot: string }> = {
    critical: {
      bg: "bg-[#EF4444]/15",
      text: "text-[#EF4444]",
      border: "border-[#EF4444]/40",
      dot: "bg-[#EF4444]",
    },
    high: {
      bg: "bg-[#F97316]/15",
      text: "text-[#F97316]",
      border: "border-[#F97316]/40",
      dot: "bg-[#F97316]",
    },
    medium: {
      bg: "bg-[#F59E0B]/15",
      text: "text-[#F59E0B]",
      border: "border-[#F59E0B]/40",
      dot: "bg-[#F59E0B]",
    },
    low: {
      bg: "bg-[#38BDF8]/15",
      text: "text-[#38BDF8]",
      border: "border-[#38BDF8]/40",
      dot: "bg-[#38BDF8]",
    },
    informational: {
      bg: "bg-[#6B7280]/15",
      text: "text-[#A7B0C0]",
      border: "border-[#6B7280]/40",
      dot: "bg-[#6B7280]",
    },
  };

  const current = styles[norm] || styles.informational;
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium uppercase tracking-wider rounded border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />}
      {severity}
    </span>
  );
}
