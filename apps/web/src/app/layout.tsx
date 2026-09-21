import "./globals.css";
import React from "react";

export const metadata = {
  title: "SOCForge — Evidence-Driven Security Operations Platform",
  description: "Convert security telemetry into evidence-backed investigations, detection hypotheses, validated detections, and auditable response decisions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
