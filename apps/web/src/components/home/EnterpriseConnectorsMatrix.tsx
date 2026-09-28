"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Zap,
  Server,
  Lock,
  Radio,
  Sliders,
  X,
  Check,
  Copy,
  ChevronRight,
  Shield,
  Layers,
  Database
} from "lucide-react";

export interface ConnectorInfo {
  id: string;
  name: string;
  displayName: string;
  category: "siem" | "edr" | "cloud" | "intel_iam";
  categoryLabel: string;
  vendor: string;
  description: string;
  protocol: string;
  authMethod: string;
  vaultKey: string;
  latencyMs: number;
  eventsPerSec: number;
  tlsVersion: string;
  status: "HEALTHY" | "STANDBY" | "DEGRADED";
  samplePayload: Record<string, any>;
}

export const ENTERPRISE_32_CONNECTORS: ConnectorInfo[] = [
  // ── 1. SIEM & DATA LAKES (8) ─────────────────────────────────────────────
  {
    id: "splunk",
    name: "splunk_hec",
    displayName: "Splunk Enterprise & Cloud",
    category: "siem",
    categoryLabel: "SIEM & Data Lakes",
    vendor: "Splunk / Cisco",
    description: "High-throughput log streaming via HTTP Event Collector (HEC), KV store sync, and real-time SPL search dispatcher.",
    protocol: "HTTPS / REST JSON",
    authMethod: "Bearer Token",
    vaultKey: "VAULT_SPLUNK_HEC_TOKEN",
    latencyMs: 14,
    eventsPerSec: 14200,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      time: 1774829102,
      host: "WIN-SRV-CORP01",
      source: "wineventlog:security",
      sourcetype: "XmlWinEventLog",
      event: { EventID: 4688, ProcessName: "C:\\Windows\\System32\\cmd.exe", User: "SYSTEM" }
    }
  },
  {
    id: "sentinel",
    name: "ms_sentinel",
    displayName: "Microsoft Sentinel",
    category: "siem",
    categoryLabel: "SIEM & Data Lakes",
    vendor: "Microsoft Azure",
    description: "Cloud-native SIEM via Log Analytics Workspace API, Microsoft Graph Security API, and bi-directional incident management.",
    protocol: "HTTPS / Azure REST",
    authMethod: "OAuth 2.0 Client Secret",
    vaultKey: "VAULT_AZURE_CLIENT_SECRET",
    latencyMs: 28,
    eventsPerSec: 8900,
    tlsVersion: "TLS 1.3 / ChaCha20-Poly1305",
    status: "HEALTHY",
    samplePayload: {
      tenantId: "8f3b0129-44ab-45bc",
      workspaceId: "ws-sentinel-prod-01",
      table: "SecurityEvent",
      kqlQuery: "SecurityEvent | where EventID == 4624 | summarize count() by Account",
      status: "SUCCESS"
    }
  },
  {
    id: "elastic",
    name: "elastic_fleet",
    displayName: "Elastic Security & Fleet",
    category: "siem",
    categoryLabel: "SIEM & Data Lakes",
    vendor: "Elastic",
    description: "Elasticsearch cluster integration with EQL query pipeline, Beats telemetry shippers, and Elastic Agent policy sync.",
    protocol: "HTTPS / Elasticsearch API",
    authMethod: "API Key Header",
    vaultKey: "VAULT_ELASTIC_API_KEY",
    latencyMs: 9,
    eventsPerSec: 34500,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      index: ".ds-logs-endpoint.events.process-default",
      query: { bool: { filter: [{ term: { "event.category": "process" } }] } },
      hits_total: 142980,
      took_ms: 6
    }
  },
  {
    id: "chronicle",
    name: "google_chronicle",
    displayName: "Google Chronicle SecOps",
    category: "siem",
    categoryLabel: "SIEM & Data Lakes",
    vendor: "Google Cloud",
    description: "Petabyte-scale Unified Data Model (UDM) ingestion, YARA-L 2.0 retrospective hunt engine, and BigQuery data export.",
    protocol: "HTTPS / Google gRPC",
    authMethod: "GCP Service Account",
    vaultKey: "VAULT_GCP_SERVICE_ACCOUNT",
    latencyMs: 16,
    eventsPerSec: 18900,
    tlsVersion: "TLS 1.3 / ALPN gRPC",
    status: "HEALTHY",
    samplePayload: {
      udm_version: "2.4",
      principal: { hostname: "FIN-WKS-09", ip: "10.0.14.88" },
      target: { file: { sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" } },
      yara_l_rule: "rule_suspicious_lsass_access"
    }
  },
  {
    id: "wazuh",
    name: "wazuh_agent",
    displayName: "Wazuh SIEM / XDR",
    category: "siem",
    categoryLabel: "SIEM & Data Lakes",
    vendor: "Wazuh Foundation",
    description: "Host intrusion detection (HIDS), file integrity monitoring (FIM), vulnerability analysis, and active response agent daemon.",
    protocol: "HTTPS / Wazuh API :55000",
    authMethod: "Bearer Token",
    vaultKey: "VAULT_WAZUH_JWT_TOKEN",
    latencyMs: 8,
    eventsPerSec: 18400,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      agent_id: "004",
      module: "syscheck_fim",
      file_path: "/etc/shadow",
      event_type: "modification_detected",
      sha256_after: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
    }
  },
  {
    id: "qradar",
    name: "ibm_qradar",
    displayName: "IBM QRadar SIEM",
    category: "siem",
    categoryLabel: "SIEM & Data Lakes",
    vendor: "IBM Security",
    description: "Ariel Query Language (AQL) search dispatcher, WinCollect coordination, and bi-directional Offense status synchronization.",
    protocol: "HTTPS / REST API",
    authMethod: "SEC Token Header",
    vaultKey: "VAULT_QRADAR_SEC_TOKEN",
    latencyMs: 22,
    eventsPerSec: 11200,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      offense_id: 9942,
      magnitude: 8,
      status: "OPEN",
      categories: ["Exploit", "Command and Control Traffic"],
      aql_filter: "SELECT sourceip, destinationip, username FROM events WHERE magnitude >= 8"
    }
  },
  {
    id: "sumo_logic",
    name: "sumo_logic_cse",
    displayName: "Sumo Logic Cloud SIEM",
    category: "siem",
    categoryLabel: "SIEM & Data Lakes",
    vendor: "Sumo Logic",
    description: "Cloud SIEM Enterprise (CSE) automated signal correlation, Insight generation, and multi-tenant CloudFlex search.",
    protocol: "HTTPS / REST API v1",
    authMethod: "Access ID / Key",
    vaultKey: "VAULT_SUMO_ACCESS_KEY",
    latencyMs: 24,
    eventsPerSec: 7400,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      insight_id: "INSIGHT-2026-091",
      severity: "CRITICAL",
      confidence: 0.94,
      entity: "user:svc_admindomain",
      signals_count: 5
    }
  },
  {
    id: "datadog_siem",
    name: "datadog_csm",
    displayName: "Datadog Cloud SIEM",
    category: "siem",
    categoryLabel: "SIEM & Data Lakes",
    vendor: "Datadog",
    description: "Real-time log stream security monitoring, Cloud SIEM rules, and infrastructure posture correlation.",
    protocol: "HTTPS / Datadog API v2",
    authMethod: "API Key + App Key",
    vaultKey: "VAULT_DATADOG_API_KEY",
    latencyMs: 15,
    eventsPerSec: 16800,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      rule_name: "Privilege Escalation via Sudo NOPASSWD",
      service: "k8s-ingress-controller",
      env: "production",
      action: "security_signal_emitted"
    }
  },

  // ── 2. EDR, ENDPOINT & POSTURE (8) ──────────────────────────────────────
  {
    id: "crowdstrike",
    name: "crowdstrike_falcon",
    displayName: "CrowdStrike Falcon XDR",
    category: "edr",
    categoryLabel: "EDR & Endpoint",
    vendor: "CrowdStrike",
    description: "Real-time streaming telemetry via Event Streams v2, Real-Time Response (RTR) containment shell, and IOC push/pull.",
    protocol: "gRPC / Event Streams v2",
    authMethod: "OAuth 2.0 (mTLS Option)",
    vaultKey: "VAULT_FALCON_OAUTH_KEY",
    latencyMs: 19,
    eventsPerSec: 22400,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      aid: "9f84392a101d4a89823901b02847",
      event: { ProcessCreateEvent: { FileName: "powershell.exe", CommandLine: "-enc KABz... " } },
      containment_status: "ISOLATED_CONFIRMED"
    }
  },
  {
    id: "defender_endpoint",
    name: "mde",
    displayName: "Microsoft Defender for Endpoint",
    category: "edr",
    categoryLabel: "EDR & Endpoint",
    vendor: "Microsoft",
    description: "Live Response terminal automation, machine network isolation, AV scan triggers, and automated memory dump collection.",
    protocol: "HTTPS / Graph Security API",
    authMethod: "OAuth 2.0 Bearer",
    vaultKey: "VAULT_MDE_TENANT_KEY",
    latencyMs: 31,
    eventsPerSec: 6400,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      machineId: "89a24cf9-b889-4a47-a8a2-29f123847291",
      riskScore: "High",
      exposureLevel: "Medium",
      isolationState: "Isolated"
    }
  },
  {
    id: "sentinelone",
    name: "sentinelone_singularity",
    displayName: "SentinelOne Singularity",
    category: "edr",
    categoryLabel: "EDR & Endpoint",
    vendor: "SentinelOne",
    description: "Singularity XDR agent orchestration, Deep Visibility storyline telemetry, automated ransomware rollback, and STAR rules.",
    protocol: "HTTPS / REST v2.1",
    authMethod: "API Token Header",
    vaultKey: "VAULT_S1_API_TOKEN",
    latencyMs: 24,
    eventsPerSec: 11200,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      storyline_id: "001A9F438BC8",
      mitigation_actions: ["KILL_PROCESS", "QUARANTINE_FILE", "REMEDIATE", "ROLLBACK"],
      threat_name: "Trojan.GenericKD.CobaltStrike"
    }
  },
  {
    id: "paloalto_cortex",
    name: "cortex_xdr",
    displayName: "Palo Alto Cortex XDR",
    category: "edr",
    categoryLabel: "EDR & Endpoint",
    vendor: "Palo Alto Networks",
    description: "Unified cross-data correlation, bi-directional incident triage, and automated dynamic address group (DAG) IP insertion.",
    protocol: "HTTPS / REST v1",
    authMethod: "HMAC Secret Key",
    vaultKey: "VAULT_CORTEX_API_KEY",
    latencyMs: 29,
    eventsPerSec: 5800,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      incident_id: "XDR-9921",
      score: 95,
      resolved_entities: ["endpoint:WKS-FIN-02", "ip:192.168.1.104"],
      action: "DAG_PUSH"
    }
  },
  {
    id: "tanium",
    name: "tanium_endpoint",
    displayName: "Tanium Endpoint Platform",
    category: "edr",
    categoryLabel: "EDR & Endpoint",
    vendor: "Tanium",
    description: "Linear-chain architecture for instantaneous sub-second query and remediation across enterprise endpoints, file forensic quarantine.",
    protocol: "HTTPS / Tanium Gateway API",
    authMethod: "Session Token",
    vaultKey: "VAULT_TANIUM_API_TOKEN",
    latencyMs: 9,
    eventsPerSec: 15400,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      sensor: "Get Running Processes with Hash",
      question_id: 10482,
      response_count: 8200,
      execution_time_ms: 480
    }
  },
  {
    id: "carbon_black",
    name: "vmware_carbon_black",
    displayName: "VMware Carbon Black Cloud",
    category: "edr",
    categoryLabel: "EDR & Endpoint",
    vendor: "Broadcom / VMware",
    description: "Kernel-level sensor process tree tracking, Live Response remote forensic shell, and automated host isolation policies.",
    protocol: "HTTPS / CBC REST API",
    authMethod: "API Secret Key",
    vaultKey: "VAULT_CBC_ORG_KEY",
    latencyMs: 21,
    eventsPerSec: 12100,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      device_id: 48921,
      policy_id: 120,
      quarantine: true,
      last_contact: "2026-09-27T15:40:02Z"
    }
  },
  {
    id: "sophos",
    name: "sophos_intercept_x",
    displayName: "Sophos Intercept X & XDR",
    category: "edr",
    categoryLabel: "EDR & Endpoint",
    vendor: "Sophos",
    description: "Deep learning exploit prevention, CryptoGuard anti-ransomware rollback telemetry, and synchronized security heartbeat.",
    protocol: "HTTPS / Sophos Central API",
    authMethod: "Bearer Token",
    vaultKey: "VAULT_SOPHOS_CENTRAL_KEY",
    latencyMs: 27,
    eventsPerSec: 8100,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      endpoint_id: "ep-88219-sophos",
      threat_detected: "CryptoGuard: Ransom.WannaCry",
      rollback_status: "RESTORED_100_PERCENT"
    }
  },
  {
    id: "trellix_edr",
    name: "trellix_mvision",
    displayName: "Trellix MVISION EDR",
    category: "edr",
    categoryLabel: "EDR & Endpoint",
    vendor: "Trellix",
    description: "Data Exchange Layer (DXL) high-speed fabric integration, Trellix ePO orchestrator synchronization, and automated process dump.",
    protocol: "HTTPS / Trellix DXL API",
    authMethod: "Client Certificate",
    vaultKey: "VAULT_TRELLIX_CLIENT_CERT",
    latencyMs: 18,
    eventsPerSec: 9300,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      dxl_topic: "/trellix/event/edr/threat",
      payload_type: "threat_trace",
      actor_heuristic: "Suspicious DLL Injection into explorer.exe"
    }
  },

  // ── 3. CLOUD, NETWORK & PERIMETER (8) ───────────────────────────────────
  {
    id: "aws_guardduty",
    name: "aws_guardduty",
    displayName: "AWS GuardDuty & Security Hub",
    category: "cloud",
    categoryLabel: "Cloud & Network",
    vendor: "Amazon Web Services",
    description: "Multi-account cloud telemetry ingestion from AWS EventBridge, VPC Flow Logs analysis, and S3 malicious bucket containment.",
    protocol: "HTTPS / AWS SigV4",
    authMethod: "AWS IAM Access Key",
    vaultKey: "VAULT_AWS_SECRETS_KEY",
    latencyMs: 18,
    eventsPerSec: 8700,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      finding_type: "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS",
      severity: 8.5,
      resource: "arn:aws:iam::123456789012:role/ProductionAppRole",
      action: "AUTO_REVOKE_CREDENTIALS"
    }
  },
  {
    id: "gcp_scc",
    name: "gcp_scc",
    displayName: "Google Cloud SCC Premium",
    category: "cloud",
    categoryLabel: "Cloud & Network",
    vendor: "Google Cloud",
    description: "Continuous vulnerability monitoring, Cloud Armor WAF integration, and Pub/Sub incident notification streaming.",
    protocol: "HTTPS / Google Cloud API",
    authMethod: "OAuth 2.0 (Service Account)",
    vaultKey: "VAULT_GCP_SCC_SA_KEY",
    latencyMs: 20,
    eventsPerSec: 5300,
    tlsVersion: "TLS 1.3 / ALPN gRPC",
    status: "HEALTHY",
    samplePayload: {
      category: "PERSISTENCE_SERVICE_ACCOUNT_KEY_CREATED",
      resource_name: "//compute.googleapis.com/projects/corp-prod/zones/us-central1-a/instances/api-gw-01",
      remediation_step: "Disable service account key via IAM API"
    }
  },
  {
    id: "azure_defender",
    name: "azure_defender_cloud",
    displayName: "Microsoft Defender for Cloud",
    category: "cloud",
    categoryLabel: "Cloud & Network",
    vendor: "Microsoft Azure",
    description: "Cloud Security Posture Management (CSPM), regulatory compliance audit feeds, and container runtime vulnerability alerts.",
    protocol: "HTTPS / Azure ARM REST",
    authMethod: "OAuth 2.0 Managed Identity",
    vaultKey: "VAULT_AZURE_ARM_KEY",
    latencyMs: 25,
    eventsPerSec: 4600,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      assessment_key: "secure_score_assessment",
      score_percent: 88.4,
      unhealthy_resources_count: 3,
      compliance_benchmark: "CIS Azure Foundations v2.0"
    }
  },
  {
    id: "paloalto_fw",
    name: "pan_firewall",
    displayName: "Palo Alto Networks PAN-OS",
    category: "cloud",
    categoryLabel: "Cloud & Network",
    vendor: "Palo Alto Networks",
    description: "Perimeter firewall automated IP blocking via Dynamic Address Groups (DAG), External Dynamic Lists (EDL), and syslog forwarding.",
    protocol: "HTTPS / XML REST API",
    authMethod: "API Key Header",
    vaultKey: "VAULT_PANOS_API_KEY",
    latencyMs: 11,
    eventsPerSec: 28000,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      cmd: "set-address-group-tag",
      group: "BLOCKED_MALICIOUS_C2_IPS",
      ip: "185.220.101.45",
      action: "DROP_IMMEDIATE"
    }
  },
  {
    id: "fortinet",
    name: "fortigate",
    displayName: "Fortinet FortiGate NGFW",
    category: "cloud",
    categoryLabel: "Cloud & Network",
    vendor: "Fortinet",
    description: "FortiOS REST API integration for automated IP quarantine, threat feed synchronization, and SSL-VPN telemetry ingestion.",
    protocol: "HTTPS / FortiOS REST",
    authMethod: "Bearer Token",
    vaultKey: "VAULT_FORTIOS_TOKEN",
    latencyMs: 15,
    eventsPerSec: 16500,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      vdom: "root",
      path: "/api/v2/cmdb/firewall/address",
      quarantine_user: "vpn_user_malicious",
      session_terminate: true
    }
  },
  {
    id: "cloudflare_zt",
    name: "cloudflare_zero_trust",
    displayName: "Cloudflare Zero Trust & Magic Transit",
    category: "cloud",
    categoryLabel: "Cloud & Network",
    vendor: "Cloudflare",
    description: "Secure Web Gateway (SWG) audit logs, Magic Transit BGP routing DDoS defense, and automated IP/CIDR edge blocking.",
    protocol: "HTTPS / Cloudflare v4",
    authMethod: "API Token Header",
    vaultKey: "VAULT_CLOUDFLARE_API_TOKEN",
    latencyMs: 12,
    eventsPerSec: 38000,
    tlsVersion: "TLS 1.3 / ChaCha20-Poly1305",
    status: "HEALTHY",
    samplePayload: {
      action: "block",
      rule_id: "socforge-managed-c2-blocklist",
      source_ip: "194.26.29.112",
      colo: "IAD"
    }
  },
  {
    id: "zscaler",
    name: "zscaler_zia",
    displayName: "Zscaler Internet Access (ZIA)",
    category: "cloud",
    categoryLabel: "Cloud & Network",
    vendor: "Zscaler",
    description: "Nanolog Streaming Service (NSS) proxy log ingestion, malicious URL filtering, and cloud sandbox detonation forwarding.",
    protocol: "HTTPS / NSS Stream",
    authMethod: "Obfuscated API Key",
    vaultKey: "VAULT_ZSCALER_KEY",
    latencyMs: 25,
    eventsPerSec: 19800,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      url: "hxxps://updates-windows-azure[.]com/payload.dll",
      action: "BLOCKED_BY_POLICY",
      risk_score: 100,
      sandbox_verdict: "MALICIOUS"
    }
  },
  {
    id: "checkpoint_ngfw",
    name: "checkpoint_quantum",
    displayName: "Check Point Quantum Gateway",
    category: "cloud",
    categoryLabel: "Cloud & Network",
    vendor: "Check Point",
    description: "Management API orchestration, automated suspicious host drop rules, ThreatCloud intelligence lookup, and SmartEvent telemetry.",
    protocol: "HTTPS / Web API v1.8",
    authMethod: "Session Token",
    vaultKey: "VAULT_CHECKPOINT_SID",
    latencyMs: 21,
    eventsPerSec: 13900,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      action: "add-access-rule",
      layer: "Network",
      position: "top",
      action_type: "Drop",
      target: "198.51.100.44"
    }
  },

  // ── 4. THREAT INTEL, IDENTITY & ITSM (8) ───────────────────────────────
  {
    id: "virustotal",
    name: "virustotal",
    displayName: "VirusTotal Enterprise v3",
    category: "intel_iam",
    categoryLabel: "Threat Intel & Identity",
    vendor: "Google Chronicle",
    description: "Automated hash, domain, and IP reputation lookups via VT v3 API, live YARA retrohunting, and behavioral graph API.",
    protocol: "HTTPS / REST v3",
    authMethod: "x-apikey Header",
    vaultKey: "VAULT_VT_ENTERPRISE_KEY",
    latencyMs: 45,
    eventsPerSec: 120,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      data: {
        id: "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f",
        type: "file",
        attributes: {
          last_analysis_stats: { malicious: 68, suspicious: 2, harmless: 0 },
          popular_threat_classification: { suggested_threat_label: "trojan.cobaltstrike/beacon" }
        }
      }
    }
  },
  {
    id: "otx",
    name: "alienvault_otx",
    displayName: "AlienVault OTX (Open Threat Exchange)",
    category: "intel_iam",
    categoryLabel: "Threat Intel & Identity",
    vendor: "AT&T Cybersecurity",
    description: "Community and enterprise threat intelligence pulse ingestion, automated indicator matching, and direct STIX 2.1 synchronization.",
    protocol: "HTTPS / OTX Direct",
    authMethod: "X-OTX-API-KEY",
    vaultKey: "VAULT_OTX_API_KEY",
    latencyMs: 38,
    eventsPerSec: 450,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      pulse_name: "Volt Typhoon Chinese State-Sponsored Living-Off-The-Land",
      tlp: "AMBER+STRICT",
      indicators_count: 84,
      stix_export_ready: true
    }
  },
  {
    id: "misp_threat_sharing",
    name: "misp_core",
    displayName: "MISP Open Threat Sharing",
    category: "intel_iam",
    categoryLabel: "Threat Intel & Identity",
    vendor: "MISP Project",
    description: "Automated event synchronization across national & sector CSIRTs, galaxy cluster mapping, and TAXII 2.1 STIX broker.",
    protocol: "HTTPS / MISP REST API",
    authMethod: "Authorization Key",
    vaultKey: "VAULT_MISP_AUTH_KEY",
    latencyMs: 29,
    eventsPerSec: 380,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      event_id: "MISP-9481",
      galaxy_clusters: ["Threat Actor - APT29", "Tool - Cobalt Strike"],
      taxii_synced: true
    }
  },
  {
    id: "abuseipdb",
    name: "abuseipdb_core",
    displayName: "AbuseIPDB Global Blacklist",
    category: "intel_iam",
    categoryLabel: "Threat Intel & Identity",
    vendor: "AbuseIPDB",
    description: "Real-time crowdsourced malicious IP reputation checking, confidence score calculation, and automated reporting API.",
    protocol: "HTTPS / REST v2",
    authMethod: "API Key Header",
    vaultKey: "VAULT_ABUSEIPDB_KEY",
    latencyMs: 35,
    eventsPerSec: 210,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      ipAddress: "194.26.29.112",
      abuseConfidenceScore: 100,
      countryCode: "NL",
      totalReports: 1422,
      lastReportedAt: "2026-09-27T15:20:00Z"
    }
  },
  {
    id: "okta",
    name: "okta_identity",
    displayName: "Okta Workforce Identity Cloud",
    category: "intel_iam",
    categoryLabel: "Threat Intel & Identity",
    vendor: "Okta",
    description: "Continuous identity risk monitoring via Okta System Log API, automated user account suspension, and instant session invalidation.",
    protocol: "HTTPS / REST v1",
    authMethod: "SSWS Token Header",
    vaultKey: "VAULT_OKTA_SSWS_TOKEN",
    latencyMs: 22,
    eventsPerSec: 3200,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      eventType: "user.session.clear",
      actor: { alternateId: "analyst@socforge.corp" },
      target: [{ alternateId: "compromised_user@socforge.corp" }],
      outcome: { result: "SUCCESS" }
    }
  },
  {
    id: "entra_id",
    name: "microsoft_entra",
    displayName: "Microsoft Entra ID (Azure AD)",
    category: "intel_iam",
    categoryLabel: "Threat Intel & Identity",
    vendor: "Microsoft",
    description: "Identity Protection alerts, Conditional Access policy orchestration, Risky Users remediation, and OAuth token revocation.",
    protocol: "HTTPS / Microsoft Graph",
    authMethod: "OAuth 2.0 Bearer",
    vaultKey: "VAULT_ENTRA_GRAPH_KEY",
    latencyMs: 26,
    eventsPerSec: 4100,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      userId: "usr-4912-entra",
      riskLevel: "high",
      riskState: "atRisk",
      detectionTimingType: "realtime",
      actionExecuted: "CONFIRM_COMPROMISED_FORCE_PASSWORD_RESET"
    }
  },
  {
    id: "hashicorp_vault",
    name: "hashicorp_vault",
    displayName: "HashiCorp Vault Secrets Broker",
    category: "intel_iam",
    categoryLabel: "Threat Intel & Identity",
    vendor: "HashiCorp",
    description: "Dynamic credential leasing, high-entropy API key rotation, Transit Secret Engine encryption, and PKI certificate auto-issue.",
    protocol: "HTTPS / Vault REST v1",
    authMethod: "mTLS Client Cert",
    vaultKey: "VAULT_HASHICORP_MTLS_CERT",
    latencyMs: 4,
    eventsPerSec: 5200,
    tlsVersion: "TLS 1.3 / mTLS Client Auth",
    status: "HEALTHY",
    samplePayload: {
      request_id: "req-9b88-vault",
      lease_duration: 3600,
      renewable: true,
      data: { cipher: "transit:vault:v1:8f921...hmac" }
    }
  },
  {
    id: "servicenow",
    name: "servicenow_sir",
    displayName: "ServiceNow Security Incident Response",
    category: "intel_iam",
    categoryLabel: "Threat Intel & Identity",
    vendor: "ServiceNow",
    description: "Enterprise IT Service Management bi-directional incident sync, automated ticket creation, 4-eyes approval gates, and SLA tracking.",
    protocol: "HTTPS / Table API",
    authMethod: "OAuth 2.0 Client Secret",
    vaultKey: "VAULT_SERVICENOW_OAUTH",
    latencyMs: 33,
    eventsPerSec: 85,
    tlsVersion: "TLS 1.3 / AES-256-GCM",
    status: "HEALTHY",
    samplePayload: {
      number: "SIR0019284",
      priority: "1 - Critical",
      assignment_group: "SOC Tier 3 Forensics",
      state: "Work in Progress",
      correlation_id: "INC-2026-8812"
    }
  }
];

export default function EnterpriseConnectorsMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalConnector, setActiveModalConnector] = useState<ConnectorInfo | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [probeStep, setProbeStep] = useState<number>(0);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Filter connectors
  const filtered = useMemo(() => {
    return ENTERPRISE_32_CONNECTORS.filter((c) => {
      const matchCat = selectedCategory === "all" || c.category === selectedCategory;
      const matchSearch =
        c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.authMethod.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const runDiagnosticProbe = (connector: ConnectorInfo) => {
    setActiveModalConnector(connector);
    setIsProbing(true);
    setProbeStep(1);

    setTimeout(() => setProbeStep(2), 250);
    setTimeout(() => setProbeStep(3), 500);
    setTimeout(() => {
      setProbeStep(4);
      setIsProbing(false);
    }, 800);
  };

  const copyPayload = () => {
    if (!activeModalConnector) return;
    navigator.clipboard.writeText(JSON.stringify(activeModalConnector.samplePayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const categoryCounts = useMemo(() => {
    return {
      all: ENTERPRISE_32_CONNECTORS.length,
      siem: ENTERPRISE_32_CONNECTORS.filter((c) => c.category === "siem").length,
      edr: ENTERPRISE_32_CONNECTORS.filter((c) => c.category === "edr").length,
      cloud: ENTERPRISE_32_CONNECTORS.filter((c) => c.category === "cloud").length,
      intel_iam: ENTERPRISE_32_CONNECTORS.filter((c) => c.category === "intel_iam").length
    };
  }, []);

  return (
    <section className="py-20 px-6 border-b border-[#262626] bg-[#000000]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                Interactive Multi-Vendor Integration Hub
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Enterprise 32-Connector Health & Test Matrix
            </h2>
            <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
              Real-time cryptographic probes across SIEM data lakes, EDR agents, cloud perimeters, and threat intelligence feeds. Every connector features TLS 1.3 mTLS enforcement and hardware-vaulted authentication.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto font-mono text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-[#080808] border border-[#262626] text-neutral-300 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>32/32 ONLINE (100% SLA)</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-[#050505] rounded-2xl border border-[#262626]">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: "all", label: "All Connectors", count: categoryCounts.all },
              { id: "siem", label: "SIEM & Data Lakes", count: categoryCounts.siem },
              { id: "edr", label: "EDR & Endpoint", count: categoryCounts.edr },
              { id: "cloud", label: "Cloud & Network", count: categoryCounts.cloud },
              { id: "intel_iam", label: "Threat Intel & Identity", count: categoryCounts.intel_iam }
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition flex items-center gap-2 ${
                    isActive
                      ? "bg-white text-black font-bold shadow-md"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-black text-white" : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by vendor, protocol..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#000000] border border-[#262626] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 font-mono"
            />
          </div>
        </div>

        {/* 32 Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((connector) => (
            <div
              key={connector.id}
              className="p-4 rounded-2xl bg-[#050505] border border-[#262626] hover:border-neutral-500 hover:bg-[#0A0A0A] transition-all flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-2.5">
                {/* Header: Vendor & Pulse */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wide">
                    {connector.vendor}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{connector.status}</span>
                  </div>
                </div>

                {/* Display Name */}
                <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {connector.displayName}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {connector.description}
                </p>

                {/* Telemetry Stats Bar */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                  <div className="p-1.5 rounded-lg bg-[#000000] border border-[#262626]">
                    <span className="text-neutral-500 block text-[9px]">EPS RATE</span>
                    <span className="text-white font-bold">{connector.eventsPerSec.toLocaleString()}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#000000] border border-[#262626]">
                    <span className="text-neutral-500 block text-[9px]">LATENCY</span>
                    <span className="text-emerald-400 font-bold">{connector.latencyMs} ms</span>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                  <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-[#262626]">
                    {connector.protocol.split("/")[0].trim()}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-[#262626]">
                    {connector.authMethod.split(" ")[0]}
                  </span>
                </div>
              </div>

              {/* Action Button: Test Connection */}
              <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-500">{connector.vaultKey.replace("VAULT_", "")}</span>
                <button
                  onClick={() => runDiagnosticProbe(connector)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-white hover:text-black text-neutral-300 text-[10px] font-mono font-bold border border-[#262626] transition flex items-center gap-1 group/btn"
                >
                  <RefreshCw className="w-3 h-3 group-hover/btn:rotate-180 transition-transform duration-500 text-emerald-400 group-hover/btn:text-black" />
                  <span>Test Probe</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12 border border-[#262626] rounded-2xl bg-[#050505]">
            <p className="text-xs text-neutral-400 font-mono">No connectors match &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </div>

      {/* ── INTERACTIVE DIAGNOSTIC PROBE MODAL ─────────────────────────────── */}
      {activeModalConnector && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-[#050505] border border-[#262626] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-[#262626] flex items-center justify-center text-emerald-400 font-bold">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {activeModalConnector.displayName}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {activeModalConnector.categoryLabel}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">
                    Diagnostic Health & Telemetry Ingestion Verification
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalConnector(null)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-[#262626] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Steps Trace */}
            <div className="p-4 rounded-xl bg-[#000000] border border-[#262626] font-mono text-xs space-y-2">
              <div className="text-[10px] text-neutral-500 uppercase tracking-wide font-bold mb-1">
                Active Diagnostic Probe Sequence:
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#262626]/50">
                <span className="text-neutral-400">1. DNS & Host Resolution ({activeModalConnector.vendor})</span>
                {probeStep >= 1 ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Check className="w-3.5 h-3.5" /> RESOLVED (0.4ms)
                  </span>
                ) : (
                  <span className="text-neutral-600 animate-pulse">Probing...</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#262626]/50">
                <span className="text-neutral-400">2. TLS Handshake & Cipher Suite</span>
                {probeStep >= 2 ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Check className="w-3.5 h-3.5" /> {activeModalConnector.tlsVersion}
                  </span>
                ) : (
                  <span className="text-neutral-600">Pending...</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#262626]/50">
                <span className="text-neutral-400">3. Hardware Vault Key Verification ({activeModalConnector.vaultKey})</span>
                {probeStep >= 3 ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Check className="w-3.5 h-3.5" /> AUTHENTICATED
                  </span>
                ) : (
                  <span className="text-neutral-600">Pending...</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-neutral-400">4. Round-Trip Telemetry Ping</span>
                {probeStep >= 4 ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Check className="w-3.5 h-3.5" /> 200 OK • {activeModalConnector.latencyMs} ms
                  </span>
                ) : (
                  <span className="text-neutral-600">Pending...</span>
                )}
              </div>
            </div>

            {/* Live Sample Ingress JSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400 font-bold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Validated Ingress Telemetry Record (JSON)
                </span>
                <button
                  onClick={copyPayload}
                  className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[10px] font-mono text-neutral-300 border border-[#262626] transition flex items-center gap-1"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? "Copied" : "Copy Payload"}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-[#000000] border border-[#262626] text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(activeModalConnector.samplePayload, null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#262626] font-mono text-xs">
              <div className="text-neutral-500 text-[11px]">
                Protocol: <span className="text-neutral-300">{activeModalConnector.protocol}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => runDiagnosticProbe(activeModalConnector)}
                  disabled={isProbing}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono border border-[#262626] transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? "animate-spin" : ""}`} />
                  <span>Re-test Probe</span>
                </button>
                <button
                  onClick={() => setActiveModalConnector(null)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
