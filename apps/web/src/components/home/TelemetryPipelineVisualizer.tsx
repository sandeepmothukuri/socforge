"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Server, 
  Database, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  Zap, 
  Sliders, 
  HardDrive, 
  Filter, 
  Layers, 
  RefreshCw,
  Terminal,
  ArrowRight,
  Wifi
} from "lucide-react";

interface PipelineChannel {
  id: string;
  name: string;
  category: "endpoint" | "network" | "cloud" | "identity";
  protocol: string;
  eps: number;
  bandwidth: string;
  status: "OPTIMAL" | "PEAK" | "SYNCING";
  latency: string;
}

export function TelemetryPipelineVisualizer() {
  const [activeFilter, setActiveFilter] = useState<"all" | "endpoint" | "network" | "cloud" | "identity">("all");
  const [baseEps, setBaseEps] = useState(14820);
  const [totalProcessed, setTotalProcessed] = useState(124892014);
  const [paused, setPaused] = useState(false);

  // Live jitter for EPS rate
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 320) - 160;
      setBaseEps((prev) => Math.max(12000, prev + delta));
      setTotalProcessed((prev) => prev + Math.floor(Math.random() * 1500) + 1200);
    }, 1200);
    return () => clearInterval(interval);
  }, [paused]);

  const channels: PipelineChannel[] = [
    { id: "ch-1", name: "Wazuh EDR Agent Pool", category: "endpoint", protocol: "TLSv1.3 / TCP 1514", eps: 4280, bandwidth: "18.4 MB/s", status: "OPTIMAL", latency: "0.8ms" },
    { id: "ch-2", name: "Zeek Network Bro Sensor", category: "network", protocol: "PCAP / TCP 5044", eps: 3890, bandwidth: "24.1 MB/s", status: "OPTIMAL", latency: "1.2ms" },
    { id: "ch-3", name: "Suricata NIDS Threat Stream", category: "network", protocol: "EVE-JSON / UDP 514", eps: 2410, bandwidth: "12.8 MB/s", status: "OPTIMAL", latency: "0.6ms" },
    { id: "ch-4", name: "AWS CloudTrail & GuardDuty", category: "cloud", protocol: "HTTPS / SQS Poller", eps: 1720, bandwidth: "6.2 MB/s", status: "OPTIMAL", latency: "2.4ms" },
    { id: "ch-5", name: "Microsoft Sysmon + EventLog", category: "endpoint", protocol: "WinRM / WEC TLS", eps: 1640, bandwidth: "5.1 MB/s", status: "OPTIMAL", latency: "1.1ms" },
    { id: "ch-6", name: "Okta & Entra ID Audit Logs", category: "identity", protocol: "REST Webhook / mTLS", eps: 880, bandwidth: "1.8 MB/s", status: "OPTIMAL", latency: "1.5ms" }
  ];

  const filteredChannels = activeFilter === "all" 
    ? channels 
    : channels.filter(c => c.category === activeFilter);

  return (
    <div className="bg-[#050505] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-6 font-mono text-xs">
      {/* Header & Global EPS Meter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-[#262626] flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white font-sans">Real-Time Telemetry Pipeline & Flow Broker</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                PIPELINE HEALTHY
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans">
              Distributed Vector broker ingestion stream with zero-drop guarantee and real-time AST normalization.
            </p>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-black border border-[#262626] text-right">
            <span className="text-[10px] text-neutral-500 block uppercase">Ingestion Throughput</span>
            <div className="text-base font-bold text-emerald-400 flex items-center justify-end gap-1">
              <span>{baseEps.toLocaleString()}</span>
              <span className="text-[11px] text-neutral-400 font-normal">EPS</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-black border border-[#262626] text-right">
            <span className="text-[10px] text-neutral-500 block uppercase">Total Ingested</span>
            <div className="text-base font-bold text-white flex items-center justify-end gap-1">
              <span>{(totalProcessed / 1_000_000).toFixed(2)}M</span>
              <span className="text-[11px] text-neutral-400 font-normal">Events</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-black border border-[#262626] text-right">
            <span className="text-[10px] text-neutral-500 block uppercase">Packet Loss</span>
            <div className="text-base font-bold text-emerald-400">
              0.00%
            </div>
          </div>

          <button
            onClick={() => setPaused(!paused)}
            className="p-2.5 rounded-xl border border-[#262626] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
            title={paused ? "Resume stream simulation" : "Pause stream simulation"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${paused ? "" : "animate-spin text-emerald-400"}`} />
          </button>
        </div>
      </div>

      {/* 4-Stage Architectural Flow Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Stage 1: Ingestion Sources */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#262626] space-y-2 relative">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-500 font-bold uppercase">Stage 01</span>
            <span className="text-emerald-400 font-semibold">Producers</span>
          </div>
          <div className="text-white font-bold text-xs font-sans">Multi-Source Telemetry</div>
          <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
            Wazuh EDR, Zeek Bro, Suricata, Windows Sysmon, AWS CloudTrail & Okta feeds.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 border-t border-[#1a1a1a]">
            <span>Active Sensors: <strong>142 Nodes</strong></span>
            <span className="text-emerald-400 font-bold">● Streaming</span>
          </div>
        </div>

        {/* Stage 2: Stream Broker */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#262626] space-y-2 relative">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-500 font-bold uppercase">Stage 02</span>
            <span className="text-cyan-400 font-semibold">Vector Broker</span>
          </div>
          <div className="text-white font-bold text-xs font-sans">Normalization & AST Parser</div>
          <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
            High-throughput event deduplication, RFC-5424 schema mapping, and Shannon entropy analyzer.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 border-t border-[#1a1a1a]">
            <span>Buffer: <strong>14.2%</strong></span>
            <span className="text-cyan-400 font-bold">0.8ms latency</span>
          </div>
        </div>

        {/* Stage 3: Datastore Indexing */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#262626] space-y-2 relative">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-500 font-bold uppercase">Stage 03</span>
            <span className="text-amber-400 font-semibold">Security Datastore</span>
          </div>
          <div className="text-white font-bold text-xs font-sans">OpenSearch & PostgreSQL Graph</div>
          <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
            Partitioned cold/hot shards with deterministic multi-hop entity graph persistence.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 border-t border-[#1a1a1a]">
            <span>Shards: <strong>8 Primary</strong></span>
            <span className="text-amber-400 font-bold">100% Synced</span>
          </div>
        </div>

        {/* Stage 4: Detection & SOAR */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#262626] space-y-2 relative">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-500 font-bold uppercase">Stage 04</span>
            <span className="text-red-400 font-semibold">Enforcement</span>
          </div>
          <div className="text-white font-bold text-xs font-sans">Sigma Replay & 4-Eyes SOAR</div>
          <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
            Sub-second detection rule evaluation with strict human-in-the-loop isolation gates.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 border-t border-[#1a1a1a]">
            <span>Precision: <strong>98.4%</strong></span>
            <span className="text-emerald-400 font-bold">Active Shield</span>
          </div>
        </div>
      </div>

      {/* Interactive Channel Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-neutral-500 text-[10px] uppercase font-bold mr-1">Filter Stream:</span>
          {[
            { id: "all", label: "All Telemetry (6)" },
            { id: "endpoint", label: "Endpoint EDR" },
            { id: "network", label: "Network IDS" },
            { id: "cloud", label: "Cloud Audit" },
            { id: "identity", label: "Identity & SSO" }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFilter === btn.id
                  ? "bg-white text-black font-bold"
                  : "bg-neutral-900 border border-[#262626] text-neutral-400 hover:text-white"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <span className="text-neutral-500 text-[11px]">
          Ingesting at <strong>{((baseEps * 4.2) / 1024).toFixed(1)} MB/sec</strong> network bandwidth
        </span>
      </div>

      {/* Live Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredChannels.map((ch) => (
          <div
            key={ch.id}
            className="p-3.5 rounded-xl bg-black border border-[#222] hover:border-neutral-700 transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-500">{ch.protocol}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {ch.latency}
              </span>
            </div>

            <div className="text-white font-bold text-xs font-sans group-hover:text-emerald-400 transition">
              {ch.name}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#1a1a1a] text-[11px]">
              <span className="text-emerald-400 font-bold font-mono">
                {ch.eps.toLocaleString()} <span className="text-[10px] text-neutral-500 font-normal">EPS</span>
              </span>
              <span className="text-neutral-400 font-mono text-[10px]">
                {ch.bandwidth}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
