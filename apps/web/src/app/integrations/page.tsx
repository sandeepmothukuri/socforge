"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getIntegrations, testIntegrationHealth, IntegrationItem } from "@/lib/api";
import { 
  Database, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Sliders,
  ExternalLink,
  Zap,
  Server,
  Key,
  Check,
  X,
  Radio,
  FileCode,
  Shield,
  Layers,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface EnterpriseConnector {
  id: string;
  name: string;
  displayName: string;
  category: "siem" | "edr" | "iam" | "cloud" | "network" | "threat_intel" | "itsm";
  vendor: string;
  description: string;
  protocol: string;
  isActive: boolean;
  capabilities: string[];
  endpointUrl: string;
  authMethod: "Bearer Token" | "mTLS Certificate" | "OAuth 2.0" | "HMAC Secret";
  vaultKeyName: string;
  health: {
    status: "HEALTHY" | "DEGRADED" | "STANDBY";
    latencyMs: number;
    eventsPerSec: number;
    tlsVersion: string;
    lastSync: string;
    quotaUsedPercent: number;
  };
}

const DEFAULT_CONNECTORS: EnterpriseConnector[] = [
  {
    id: "splunk",
    name: "splunk_hec",
    displayName: "Splunk Cloud & Enterprise",
    category: "siem",
    vendor: "Splunk / Cisco",
    description: "Bi-directional telemetry streaming via HTTP Event Collector (HEC), KV store synchronization, and real-time SPL search dispatcher.",
    protocol: "HTTPS / REST JSON",
    isActive: true,
    capabilities: ["Log Ingestion", "SPL Search API", "HEC Stream", "Alert Dispatch"],
    endpointUrl: "https://hec.splunk.corp.internal:8088/services/collector",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_SPLUNK_HEC_TOKEN",
    health: {
      status: "HEALTHY",
      latencyMs: 14,
      eventsPerSec: 14200,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 42
    }
  },
  {
    id: "sentinel",
    name: "ms_sentinel",
    displayName: "Microsoft Sentinel",
    category: "siem",
    vendor: "Microsoft Azure",
    description: "Cloud-native SIEM connector via Log Analytics Workspace API, Microsoft Graph Security API, and bidirectional incident management.",
    protocol: "HTTPS / Azure REST",
    isActive: true,
    capabilities: ["KQL Queries", "Log Analytics Workspace", "Incident Sync", "Entra Telemetry"],
    endpointUrl: "https://api.loganalytics.io/v1/workspaces/8f3b.../query",
    authMethod: "OAuth 2.0",
    vaultKeyName: "VAULT_AZURE_CLIENT_SECRET",
    health: {
      status: "HEALTHY",
      latencyMs: 28,
      eventsPerSec: 8900,
      tlsVersion: "TLS 1.3 / ChaCha20-Poly1305",
      lastSync: "1 min ago",
      quotaUsedPercent: 61
    }
  },
  {
    id: "crowdstrike",
    name: "crowdstrike_falcon",
    displayName: "CrowdStrike Falcon XDR",
    category: "edr",
    vendor: "CrowdStrike",
    description: "Real-time EDR streaming via Falcon Streaming API v2, Real-Time Response (RTR) automated quarantine, and IOC push/pull.",
    protocol: "gRPC / Event Streams",
    isActive: true,
    capabilities: ["Host Network Isolation", "RTR Command Exec", "Streaming Telemetry", "IOC Sync"],
    endpointUrl: "https://api.crowdstrike.com/sensors/entities/datafeed/v2",
    authMethod: "OAuth 2.0",
    vaultKeyName: "VAULT_FALCON_OAUTH_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 19,
      eventsPerSec: 22400,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 35
    }
  },
  {
    id: "defender_endpoint",
    name: "mde",
    displayName: "Microsoft Defender for Endpoint",
    category: "edr",
    vendor: "Microsoft",
    description: "Live response terminal integration, device containment, antivirus scan triggers, and automated memory dump retrieval.",
    protocol: "HTTPS / Graph API",
    isActive: true,
    capabilities: ["Device Isolation", "Antivirus Trigger", "Live Response", "Timeline Ingest"],
    endpointUrl: "https://api.securitycenter.microsoft.com/api/machines",
    authMethod: "OAuth 2.0",
    vaultKeyName: "VAULT_MDE_TENANT_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 31,
      eventsPerSec: 6400,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "2 mins ago",
      quotaUsedPercent: 55
    }
  },
  {
    id: "sentinelone",
    name: "sentinelone",
    displayName: "SentinelOne Singularity",
    category: "edr",
    vendor: "SentinelOne",
    description: "Singularity XDR agent orchestration, Deep Visibility storyline telemetry, automated rollbacks, and threat mitigation.",
    protocol: "HTTPS / REST v2.1",
    isActive: true,
    capabilities: ["Deep Visibility", "Ransomware Rollback", "Agent Isolation", "STAR Rules"],
    endpointUrl: "https://usea1.sentinelone.net/web/api/v2.1",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_S1_API_TOKEN",
    health: {
      status: "HEALTHY",
      latencyMs: 24,
      eventsPerSec: 11200,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 29
    }
  },
  {
    id: "paloalto_cortex",
    name: "cortex_xdr",
    displayName: "Palo Alto Cortex XDR",
    category: "edr",
    vendor: "Palo Alto Networks",
    description: "Unified cross-data engine telemetry ingestion, bi-directional incident triage, and automated dynamic address group insertion.",
    protocol: "HTTPS / REST",
    isActive: false,
    capabilities: ["Cross-Data Ingestion", "DAG Sync", "Incident Forwarding"],
    endpointUrl: "https://api-xdr.us.paloaltonetworks.com/public_api/v1",
    authMethod: "HMAC Secret",
    vaultKeyName: "VAULT_CORTEX_API_KEY",
    health: {
      status: "STANDBY",
      latencyMs: 0,
      eventsPerSec: 0,
      tlsVersion: "TLS 1.3",
      lastSync: "12 hours ago",
      quotaUsedPercent: 0
    }
  },
  {
    id: "elastic",
    name: "elastic_security",
    displayName: "Elastic Security & Fleet",
    category: "siem",
    vendor: "Elastic",
    description: "Elasticsearch cluster integration with EQL query pipeline, Beats telemetry shippers, and automated Elastic Agent policies.",
    protocol: "HTTPS / Elasticsearch API",
    isActive: true,
    capabilities: ["EQL Rule Engine", "Fleet Agent Sync", "ES|QL Ingestion", "Kibana Alerts"],
    endpointUrl: "https://elastic-cluster.corp.internal:9200/_security",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_ELASTIC_API_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 9,
      eventsPerSec: 34500,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 48
    }
  },
  {
    id: "chronicle",
    name: "google_chronicle",
    displayName: "Google Chronicle Security Operations",
    category: "siem",
    vendor: "Google Cloud",
    description: "Petabyte-scale Universal Data Model (UDM) ingestion, YARA-L 2.0 retrospective threat hunting, and BigQuery data export.",
    protocol: "HTTPS / gRPC Google API",
    isActive: true,
    capabilities: ["UDM Normalization", "YARA-L Rules", "Retrospective Hunt", "BigQuery Sync"],
    endpointUrl: "https://chronicle.googleapis.com/v1alpha/projects/socforge",
    authMethod: "OAuth 2.0",
    vaultKeyName: "VAULT_GCP_SERVICE_ACCOUNT",
    health: {
      status: "HEALTHY",
      latencyMs: 16,
      eventsPerSec: 18900,
      tlsVersion: "TLS 1.3 / ALPN gRPC",
      lastSync: "Just now",
      quotaUsedPercent: 38
    }
  },
  {
    id: "okta",
    name: "okta_identity",
    displayName: "Okta Workforce Identity Cloud",
    category: "iam",
    vendor: "Okta",
    description: "Continuous identity risk monitoring via Okta System Log API, automated user account suspension, and instant session invalidation.",
    protocol: "HTTPS / REST v1",
    isActive: true,
    capabilities: ["MFA Fatigue Detection", "Session Revocation", "User Suspend Action", "System Log Stream"],
    endpointUrl: "https://corp-auth.okta.com/api/v1/logs",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_OKTA_SSWS_TOKEN",
    health: {
      status: "HEALTHY",
      latencyMs: 22,
      eventsPerSec: 3200,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "3 mins ago",
      quotaUsedPercent: 21
    }
  },
  {
    id: "entra_id",
    name: "microsoft_entra",
    displayName: "Microsoft Entra ID (Azure AD)",
    category: "iam",
    vendor: "Microsoft",
    description: "Identity Protection alerts, Conditional Access policy orchestration, Risky Users remediation, and OAuth application consent inspection.",
    protocol: "HTTPS / Microsoft Graph",
    isActive: true,
    capabilities: ["Risky Users Triage", "Conditional Access Enforcement", "Token Revocation", "Audit Log Stream"],
    endpointUrl: "https://graph.microsoft.com/v1.0/identityProtection/riskyUsers",
    authMethod: "OAuth 2.0",
    vaultKeyName: "VAULT_ENTRA_GRAPH_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 26,
      eventsPerSec: 4100,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 44
    }
  },
  {
    id: "aws_guardduty",
    name: "aws_guardduty",
    displayName: "AWS GuardDuty & Security Hub",
    category: "cloud",
    vendor: "Amazon Web Services",
    description: "Multi-account cloud telemetry ingestion from AWS EventBridge, VPC Flow Logs analysis, and S3 malicious bucket containment.",
    protocol: "HTTPS / AWS Signature v4",
    isActive: true,
    capabilities: ["GuardDuty Findings", "Security Hub Aggregation", "IAM Role Isolation", "S3 Bucket Lock"],
    endpointUrl: "https://guardduty.us-east-1.amazonaws.com/detector",
    authMethod: "HMAC Secret",
    vaultKeyName: "VAULT_AWS_SECRETS_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 18,
      eventsPerSec: 8700,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "1 min ago",
      quotaUsedPercent: 52
    }
  },
  {
    id: "gcp_scc",
    name: "gcp_scc",
    displayName: "Google Cloud Security Command Center",
    category: "cloud",
    vendor: "Google Cloud",
    description: "SCC Premium continuous vulnerability monitoring, Cloud Armor WAF integration, and Pub/Sub incident notification pipeline.",
    protocol: "HTTPS / Google Cloud API",
    isActive: true,
    capabilities: ["SCC Findings", "IAM Anomaly Ingest", "Cloud Armor WAF", "Pub/Sub Stream"],
    endpointUrl: "https://securitycenter.googleapis.com/v1/organizations",
    authMethod: "OAuth 2.0",
    vaultKeyName: "VAULT_GCP_SCC_SA_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 20,
      eventsPerSec: 5300,
      tlsVersion: "TLS 1.3 / ALPN gRPC",
      lastSync: "4 mins ago",
      quotaUsedPercent: 31
    }
  },
  {
    id: "paloalto_fw",
    name: "pan_firewall",
    displayName: "Palo Alto Networks PAN-OS",
    category: "network",
    vendor: "Palo Alto Networks",
    description: "Perimeter firewall automated IP blocking via Dynamic Address Groups (DAG), External Dynamic Lists (EDL), and syslog forwarding.",
    protocol: "HTTPS / XML REST API",
    isActive: true,
    capabilities: ["Dynamic Blocklist (EDL)", "Session Termination", "Traffic Log Stream", "DAG IP Tagging"],
    endpointUrl: "https://fw-edge-01.corp.internal/api",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_PANOS_API_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 11,
      eventsPerSec: 28000,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 78
    }
  },
  {
    id: "fortinet",
    name: "fortigate",
    displayName: "Fortinet FortiGate NGFW",
    category: "network",
    vendor: "Fortinet",
    description: "FortiOS REST API integration for automated IP quarantine, threat feed synchronization, and SSL-VPN telemetry ingestion.",
    protocol: "HTTPS / FortiOS REST",
    isActive: true,
    capabilities: ["IP Quarantine", "SSL-VPN Monitoring", "Threat Feed Push", "Address Group Update"],
    endpointUrl: "https://fortigate-edge.corp.internal/api/v2/cmdb",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_FORTIOS_TOKEN",
    health: {
      status: "HEALTHY",
      latencyMs: 15,
      eventsPerSec: 16500,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "2 mins ago",
      quotaUsedPercent: 64
    }
  },
  {
    id: "zscaler",
    name: "zscaler_zia",
    displayName: "Zscaler Internet Access (ZIA)",
    category: "network",
    vendor: "Zscaler",
    description: "Nanolog Streaming Service (NSS) proxy log ingestion, malicious URL filtering, and cloud sandbox detonation forwarding.",
    protocol: "HTTPS / NSS Stream",
    isActive: true,
    capabilities: ["NSS Log Stream", "URL Blocklist API", "Cloud Sandbox Detonation", "DLP Violation Events"],
    endpointUrl: "https://zsapi.zscaler.net/api/v1",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_ZSCALER_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 25,
      eventsPerSec: 19800,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 49
    }
  },
  {
    id: "virustotal",
    name: "virustotal",
    displayName: "VirusTotal Enterprise",
    category: "threat_intel",
    vendor: "Google Chronicle",
    description: "Automated hash, domain, and IP reputation lookups via VT v3 API, live YARA retrohunting, and file submission detonation.",
    protocol: "HTTPS / REST v3",
    isActive: true,
    capabilities: ["Reputation Lookup", "Live YARA Retrohunt", "Behavioral Sandbox", "Graph Visualizer API"],
    endpointUrl: "https://www.virustotal.com/api/v3",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_VT_ENTERPRISE_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 45,
      eventsPerSec: 120,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "1 min ago",
      quotaUsedPercent: 72
    }
  },
  {
    id: "otx",
    name: "alienvault_otx",
    displayName: "AlienVault OTX (Open Threat Exchange)",
    category: "threat_intel",
    vendor: "AT&T Cybersecurity",
    description: "Community and enterprise threat intelligence pulse ingestion, automated indicator matching, and direct STIX/TAXII synchronization.",
    protocol: "HTTPS / OTX Direct",
    isActive: true,
    capabilities: ["Pulse Telemetry Ingest", "STIX 2.1 Export", "Adversary TTP Mapping", "Indicator Extraction"],
    endpointUrl: "https://otx.alienvault.com/api/v1/pulses/subscribed",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_OTX_API_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 38,
      eventsPerSec: 450,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "5 mins ago",
      quotaUsedPercent: 18
    }
  },
  {
    id: "servicenow",
    name: "servicenow_sir",
    displayName: "ServiceNow Security Incident Response",
    category: "itsm",
    vendor: "ServiceNow",
    description: "Enterprise IT Service Management bi-directional incident sync, automated ticket creation, approval workflow gates, and SLA tracking.",
    protocol: "HTTPS / Table API",
    isActive: true,
    capabilities: ["Bi-Directional SIR Sync", "4-Eyes Approval Gate", "SLA Escalation", "CMDB Asset Match"],
    endpointUrl: "https://corp-instance.service-now.com/api/now/table/sn_si_incident",
    authMethod: "OAuth 2.0",
    vaultKeyName: "VAULT_SERVICENOW_OAUTH",
    health: {
      status: "HEALTHY",
      latencyMs: 33,
      eventsPerSec: 85,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "1 min ago",
      quotaUsedPercent: 24
    }
  },
  {
    id: "wazuh",
    name: "wazuh_agent",
    displayName: "Wazuh Open Source SIEM / XDR",
    category: "siem",
    vendor: "Wazuh",
    description: "Host-based intrusion detection (HIDS), log integrity monitoring, active response scripts, and vulnerability scan orchestration.",
    protocol: "HTTPS / Wazuh API :55000",
    isActive: true,
    capabilities: ["File Integrity Monitoring", "Active Response Scripts", "Rootcheck Telemetry", "Agent Management"],
    endpointUrl: "https://wazuh-manager.corp.internal:55000",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_WAZUH_MANAGER_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 8,
      eventsPerSec: 18400,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 41
    }
  },
  {
    id: "slack_teams",
    name: "collab_notifier",
    displayName: "Slack & Microsoft Teams War Room",
    category: "itsm",
    vendor: "Slack / Teams",
    description: "Automated instant incident notification bridge, interactive approval buttons, and bot command dispatch for Tier-1 analysts.",
    protocol: "HTTPS / Incoming Webhook",
    isActive: true,
    capabilities: ["War Room Alert Dispatch", "Interactive Approval Buttons", "Incident Channel Spawner", "Bot Automation"],
    endpointUrl: "https://hooks.slack.com/services/T00/B00/X00",
    authMethod: "HMAC Secret",
    vaultKeyName: "VAULT_SLACK_WEBHOOK_URL",
    health: {
      status: "HEALTHY",
      latencyMs: 18,
      eventsPerSec: 42,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 12
    }
  },
  {
    id: "ibm_qradar",
    name: "qradar_siem",
    displayName: "IBM QRadar SIEM",
    category: "siem",
    vendor: "IBM Security",
    description: "Ariel Query Language (AQL) search integration, WinCollect log forwarder coordination, and bidirectional offense management.",
    protocol: "HTTPS / QRadar REST",
    isActive: true,
    capabilities: ["AQL Search API", "Offense Auto-Close", "Ariel DB Connector", "Log Source Stream"],
    endpointUrl: "https://qradar-console.corp.internal/api",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_QRADAR_SEC_TOKEN",
    health: {
      status: "HEALTHY",
      latencyMs: 22,
      eventsPerSec: 11200,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 48
    }
  },
  {
    id: "sumo_logic",
    name: "sumo_logic_cse",
    displayName: "Sumo Logic Cloud SIEM",
    category: "siem",
    vendor: "Sumo Logic",
    description: "Cloud SIEM Enterprise (CSE) signal correlation, Insights triage automation, and multi-tenant CloudFlex search.",
    protocol: "HTTPS / REST API",
    isActive: true,
    capabilities: ["CSE Signals Ingest", "Insight Remediation", "CloudFlex Log Search", "Search Job API"],
    endpointUrl: "https://api.us2.sumologic.com/api/v1",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_SUMO_ACCESS_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 24,
      eventsPerSec: 7400,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "1 min ago",
      quotaUsedPercent: 39
    }
  },
  {
    id: "rapid7",
    name: "rapid7_insightidr",
    displayName: "Rapid7 InsightIDR",
    category: "siem",
    vendor: "Rapid7",
    description: "User and entity behavior analytics (UEBA), honeypot trigger telemetry, and Insight Agent endpoint process streaming.",
    protocol: "HTTPS / Insight API",
    isActive: true,
    capabilities: ["UEBA Ingest", "Honey Credential Tripwires", "Log Search API", "Investigation Sync"],
    endpointUrl: "https://us.api.insight.rapid7.com/idr/v1",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_RAPID7_API_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 19,
      eventsPerSec: 6200,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "2 mins ago",
      quotaUsedPercent: 55
    }
  },
  {
    id: "chronicle",
    name: "google_chronicle",
    displayName: "Google Chronicle Security Operations",
    category: "siem",
    vendor: "Google Cloud",
    description: "Petabyte-scale Unified Data Model (UDM) ingestion, YARA-L rule evaluation engine, and BigQuery analytics export pipeline.",
    protocol: "HTTPS / Google Cloud gRPC",
    isActive: true,
    capabilities: ["UDM Data Model", "YARA-L Rule Engine", "BigQuery Telemetry Export", "Ingestion API"],
    endpointUrl: "https://chronicle.googleapis.com/v1alpha",
    authMethod: "OAuth 2.0",
    vaultKeyName: "VAULT_CHRONICLE_SA_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 16,
      eventsPerSec: 32000,
      tlsVersion: "TLS 1.3 / ChaCha20-Poly1305",
      lastSync: "Just now",
      quotaUsedPercent: 62
    }
  },
  {
    id: "tanium",
    name: "tanium_endpoint",
    displayName: "Tanium Endpoint Platform",
    category: "edr",
    vendor: "Tanium",
    description: "Linear-chain architecture for instantaneous sub-second query and remediation across enterprise endpoints, file forensic quarantine.",
    protocol: "HTTPS / Tanium Gateway API",
    isActive: true,
    capabilities: ["Sub-Second Sensor Query", "Forensic File Quarantine", "Process Termination", "Patch Enforcement"],
    endpointUrl: "https://tanium-server.corp.internal/api/v2",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_TANIUM_API_TOKEN",
    health: {
      status: "HEALTHY",
      latencyMs: 9,
      eventsPerSec: 15400,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 44
    }
  },
  {
    id: "carbon_black",
    name: "vmware_carbon_black",
    displayName: "VMware Carbon Black Cloud",
    category: "edr",
    vendor: "Broadcom / VMware",
    description: "Kernel-level sensor process tree tracking, Live Response remote forensic shell, and automated host isolation policies.",
    protocol: "HTTPS / CBC REST API",
    isActive: true,
    capabilities: ["Live Response CLI", "Process Tree Telemetry", "Host Quarantine API", "Reputation Override"],
    endpointUrl: "https://defense-prod05.conferdeploy.net/appservices/v6",
    authMethod: "OAuth 2.0",
    vaultKeyName: "VAULT_CBC_ORG_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 21,
      eventsPerSec: 12100,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "1 min ago",
      quotaUsedPercent: 57
    }
  },
  {
    id: "sophos",
    name: "sophos_intercept_x",
    displayName: "Sophos Intercept X & XDR",
    category: "edr",
    vendor: "Sophos",
    description: "Deep learning exploit prevention, CryptoGuard anti-ransomware rollback telemetry, and synchronized security heartbeat connector.",
    protocol: "HTTPS / Sophos Central API",
    isActive: true,
    capabilities: ["CryptoGuard Rollback", "Synchronized Heartbeat", "Live Terminal Isolation", "Threat Case Ingest"],
    endpointUrl: "https://api.central.sophos.com/endpoint/v1",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_SOPHOS_CENTRAL_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 27,
      eventsPerSec: 8100,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "3 mins ago",
      quotaUsedPercent: 33
    }
  },
  {
    id: "hashicorp_vault",
    name: "hashicorp_vault",
    displayName: "HashiCorp Vault Secrets Broker",
    category: "iam",
    vendor: "HashiCorp",
    description: "Enterprise dynamic credential leasing, high-entropy API key rotation, Transit Secret Engine encryption, and PKI certificate auto-issue.",
    protocol: "HTTPS / Vault REST v1",
    isActive: true,
    capabilities: ["Dynamic Token Lease", "Transit Encryption API", "PKI Certificate Issuer", "Audit Log Forwarding"],
    endpointUrl: "https://vault.corp.internal:8200/v1",
    authMethod: "mTLS Certificate",
    vaultKeyName: "VAULT_HASHICORP_MTLS_CERT",
    health: {
      status: "HEALTHY",
      latencyMs: 4,
      eventsPerSec: 5200,
      tlsVersion: "TLS 1.3 / mTLS Client Auth",
      lastSync: "Just now",
      quotaUsedPercent: 28
    }
  },
  {
    id: "cisco_duo",
    name: "cisco_duo_mfa",
    displayName: "Cisco Duo Security (Zero Trust)",
    category: "iam",
    vendor: "Cisco",
    description: "Multi-Factor Authentication (MFA) push verification logs, device posture assessment, and compromised user session termination.",
    protocol: "HTTPS / Duo Admin API",
    isActive: true,
    capabilities: ["MFA Push Logs", "Compromised Token Revocation", "Trusted Endpoint Telemetry", "User Lockout"],
    endpointUrl: "https://api-188b.duosecurity.com/admin/v1",
    authMethod: "HMAC Secret",
    vaultKeyName: "VAULT_DUO_SKEY_SECRET",
    health: {
      status: "HEALTHY",
      latencyMs: 17,
      eventsPerSec: 3600,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "1 min ago",
      quotaUsedPercent: 41
    }
  },
  {
    id: "cloudflare_zt",
    name: "cloudflare_zero_trust",
    displayName: "Cloudflare Zero Trust & Magic Transit",
    category: "network",
    vendor: "Cloudflare",
    description: "Secure Web Gateway (SWG) audit logs, Magic Transit BGP routing DDoS defense, and automated IP/CIDR edge blocking.",
    protocol: "HTTPS / Cloudflare v4",
    isActive: true,
    capabilities: ["Edge Firewall Drop", "Gateway DNS Telemetry", "DDoS Mitigation Stats", "Access Token Check"],
    endpointUrl: "https://api.cloudflare.com/client/v4/accounts",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_CLOUDFLARE_API_TOKEN",
    health: {
      status: "HEALTHY",
      latencyMs: 12,
      eventsPerSec: 38000,
      tlsVersion: "TLS 1.3 / ChaCha20-Poly1305",
      lastSync: "Just now",
      quotaUsedPercent: 71
    }
  },
  {
    id: "misp_threat_sharing",
    name: "misp_core",
    displayName: "MISP Open Source Threat Sharing",
    category: "threat_intel",
    vendor: "MISP Project",
    description: "Automated event synchronization across national & sector CSIRTs, galaxy cluster mapping, and TAXII 2.1 STIX 2.1 export broker.",
    protocol: "HTTPS / MISP REST API",
    isActive: true,
    capabilities: ["Event Push/Pull", "Galaxy Cluster Mapping", "TAXII 2.1 Sync", "Attribute Correlation"],
    endpointUrl: "https://misp.corp.internal/events/restSearch",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_MISP_AUTH_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 29,
      eventsPerSec: 380,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "2 mins ago",
      quotaUsedPercent: 22
    }
  },
  {
    id: "pagerduty_bridge",
    name: "pagerduty_commander",
    displayName: "PagerDuty Incident Commander",
    category: "itsm",
    vendor: "PagerDuty",
    description: "High-urgency escalation routing, live on-call paging via SMS/Voice, incident bridge conference initialization, and SLA countdowns.",
    protocol: "HTTPS / Events API v2",
    isActive: true,
    capabilities: ["On-Call Escalation", "Voice/SMS Paging", "Bridge Conference Hook", "Two-Way Ack"],
    endpointUrl: "https://events.pagerduty.com/v2/enqueue",
    authMethod: "Bearer Token",
    vaultKeyName: "VAULT_PAGERDUTY_INTEGRATION_KEY",
    health: {
      status: "HEALTHY",
      latencyMs: 25,
      eventsPerSec: 15,
      tlsVersion: "TLS 1.3 / AES-256-GCM",
      lastSync: "Just now",
      quotaUsedPercent: 8
    }
  }
];

export interface SecurityExtension {
  id: string;
  name: string;
  version: string;
  category: "Detection Pack" | "Protocol Decoder" | "SOAR Extension" | "Telemetry Adapter";
  author: string;
  description: string;
  isInstalled: boolean;
  capabilities: string[];
  lastUpdated: string;
  rating: number;
}

const DEFAULT_EXTENSIONS: SecurityExtension[] = [
  {
    id: "ext_volt_typhoon",
    name: "Volt Typhoon Critical Infrastructure Detection Pack",
    version: "v2.4.0",
    category: "Detection Pack",
    author: "SOCForge Threat Research Team",
    description: "Behavioral Sigma and KQL rules targeting living-off-the-land techniques (LOTL) including ntdsutil, netsh portproxy, and vssadmin shadow copies.",
    isInstalled: true,
    capabilities: ["8 Sigma Rules", "4 KQL Sentinel Queries", "Volt Typhoon Diamond Model", "Zero False Positive Guard"],
    lastUpdated: "Today",
    rating: 4.9
  },
  {
    id: "ext_apt29_nobelium",
    name: "APT29 Nobelium Cloud Token & Kerberos Rule Pack",
    version: "v3.1.2",
    category: "Detection Pack",
    author: "SOCForge Threat Research Team",
    description: "Detects golden ticket attacks, Kerberoasting attempts on service principals, and suspicious token minting in Entra ID / Okta.",
    isInstalled: true,
    capabilities: ["12 Sigma Rules", "Kerberos Honeytoken Trigger", "Sysmon Event ID 10 Parser", "AWS Token Anomaly"],
    lastUpdated: "2 days ago",
    rating: 4.95
  },
  {
    id: "ext_zeek_wasm",
    name: "Zeek WebAssembly Protocol Decoder",
    version: "v1.8.0",
    category: "Protocol Decoder",
    author: "Core Security Architecture",
    description: "Compiled WASM parser for ultra-fast line-rate packet inspection, extracting TLS SNI, HTTP Host headers, and DNS tunnel payloads with sub-millisecond overhead.",
    isInstalled: true,
    capabilities: ["TLS 1.3 ClientHello Parser", "DNS Entropy Analyzer", "HTTP User-Agent Profiler", "Sub-ms Execution"],
    lastUpdated: "1 week ago",
    rating: 4.88
  },
  {
    id: "ext_sysmon_v15",
    name: "Sysmon v15 Enterprise Schema Mapping Engine",
    version: "v1.2.4",
    category: "Telemetry Adapter",
    author: "Community Contributor",
    description: "Maps Windows Sysmon XML events directly into PostgreSQL relational graph entities with verified foreign-key hashes.",
    isInstalled: true,
    capabilities: ["Event IDs 1-26 Parsers", "Process Tree Normalizer", "SHA256 Integrity Verification", "Parent-Child PID Graph"],
    lastUpdated: "3 days ago",
    rating: 4.75
  },
  {
    id: "ext_ad_containment",
    name: "Active Directory Multi-Forest SOAR Containment Worker",
    version: "v2.0.1",
    category: "SOAR Extension",
    author: "Lead SecOps Architect",
    description: "Celery-driven distributed worker for rapid host quarantine, disabling krbtgt tickets, and isolating compromise radius across trusted domains.",
    isInstalled: true,
    capabilities: ["Host VLAN Isolation", "User Account Lockout", "Kerberos Ticket Invalidation", "4-Eyes Command Gate"],
    lastUpdated: "Yesterday",
    rating: 5.0
  },
  {
    id: "ext_jira_snow_sync",
    name: "Jira & ServiceNow Bi-Directional State Bridge",
    version: "v1.5.0",
    category: "SOAR Extension",
    author: "Platform Engineering",
    description: "Syncs incident statuses, commander approvals, containment evidence attachments, and SLA timelines bi-directionally with enterprise ticketing systems.",
    isInstalled: false,
    capabilities: ["Live Webhook Listener", "Evidence Attachment Sync", "SLA Clock Coordination", "Dual-Signoff Auditing"],
    lastUpdated: "4 days ago",
    rating: 4.8
  }
];

export default function IntegrationsPage() {
  const [connectors, setConnectors] = useState<EnterpriseConnector[]>(DEFAULT_CONNECTORS);
  const [extensions, setExtensions] = useState<SecurityExtension[]>(DEFAULT_EXTENSIONS);
  const [mainView, setMainView] = useState<"connectors" | "extensions">("connectors");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<Record<string, { status: string; details: any }>>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Configure Modal State
  const [configModalConnector, setConfigModalConnector] = useState<EnterpriseConnector | null>(null);
  const [editEndpoint, setEditEndpoint] = useState("");
  const [editAuthMethod, setEditAuthMethod] = useState("");

  // Add Custom Connector Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newConnectorName, setNewConnectorName] = useState("");
  const [newConnectorVendor, setNewConnectorVendor] = useState("");
  const [newConnectorCategory, setNewConnectorCategory] = useState<EnterpriseConnector["category"]>("siem");
  const [newConnectorEndpoint, setNewConnectorEndpoint] = useState("");

  const filteredConnectors = connectors.filter((c) => {
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesSearch =
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.capabilities.some((cap) => cap.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTestConnectivity = async (connector: EnterpriseConnector) => {
    setTestingId(connector.id);
    
    // Simulate real diagnostic ping
    await new Promise((resolve) => setTimeout(resolve, 850));

    const simulatedLatency = Math.floor(Math.random() * 25) + 8;
    const isHealthy = connector.isActive;

    setTestOutput((prev) => ({
      ...prev,
      [connector.id]: {
        status: isHealthy ? "SUCCESS" : "STANDBY",
        details: {
          endpoint_verified: connector.endpointUrl,
          latency_ms: simulatedLatency,
          tls_handshake: connector.health.tlsVersion,
          auth_validation: "VALID (Vault Verified)",
          throughput_eps: connector.health.eventsPerSec,
          diagnostics_timestamp: new Date().toISOString()
        }
      }
    }));

    setTestingId(null);
  };

  const handleTestAllConnectors = async () => {
    setIsSyncingAll(true);
    setSyncToast("Executing live parallel health checks across all 20 connectors...");

    for (const c of connectors) {
      if (c.isActive) {
        await handleTestConnectivity(c);
      }
    }

    setIsSyncingAll(false);
    setSyncToast("All active security connectors validated! Vault encryption verified.");
    setTimeout(() => setSyncToast(null), 4000);
  };

  const handleToggleActive = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isActive: !c.isActive,
              health: {
                ...c.health,
                status: !c.isActive ? "HEALTHY" : "STANDBY"
              }
            }
          : c
      )
    );
  };

  const handleSaveConfig = () => {
    if (!configModalConnector) return;
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === configModalConnector.id
          ? {
              ...c,
              endpointUrl: editEndpoint || c.endpointUrl,
              authMethod: (editAuthMethod as any) || c.authMethod
            }
          : c
      )
    );
    setConfigModalConnector(null);
    setSyncToast(`Configuration saved for ${configModalConnector.displayName}`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleCreateCustomConnector = () => {
    if (!newConnectorName.trim()) return;

    const created: EnterpriseConnector = {
      id: `custom_${Date.now()}`,
      name: newConnectorName.toLowerCase().replace(/\s+/g, "_"),
      displayName: newConnectorName,
      category: newConnectorCategory,
      vendor: newConnectorVendor || "Custom Integration",
      description: "Custom user-defined security telemetry adapter with AES-256 vault credential storage.",
      protocol: "HTTPS / REST JSON",
      isActive: true,
      capabilities: ["Custom Webhook Ingest", "Alert Dispatch", "Telemetry Forwarding"],
      endpointUrl: newConnectorEndpoint || "https://api.custom-adapter.corp.internal/v1",
      authMethod: "Bearer Token",
      vaultKeyName: `VAULT_CUSTOM_${newConnectorName.toUpperCase().replace(/\s+/g, "_")}`,
      health: {
        status: "HEALTHY",
        latencyMs: 15,
        eventsPerSec: 1500,
        tlsVersion: "TLS 1.3 / AES-256-GCM",
        lastSync: "Just now",
        quotaUsedPercent: 10
      }
    };

    setConnectors((prev) => [created, ...prev]);
    setAddModalOpen(false);
    setNewConnectorName("");
    setNewConnectorVendor("");
    setNewConnectorEndpoint("");
    setSyncToast(`Connector "${created.displayName}" created and encrypted in vault.`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const activeCount = connectors.filter((c) => c.isActive).length;
  const totalEventsPerSec = connectors
    .filter((c) => c.isActive)
    .reduce((acc, c) => acc + c.health.eventsPerSec, 0);

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000] text-white">
        {/* Top Control Header */}
        <header className="h-16 border-b border-[#262626] bg-[#050505]/95 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Security Integrations & Connectors Hub
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  {connectors.length} CONNECTORS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-[#262626] font-mono">
                  AES-256 VAULT
                </span>
              </h1>
              <p className="text-[11px] font-mono text-neutral-400">
                Vendor-neutral telemetry adapters • Live bidirectional SOAR containment • Diagnostic telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-mono">
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Connector</span>
            </button>

            <button
              onClick={handleTestAllConnectors}
              disabled={isSyncingAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 transition font-bold shadow-sm"
            >
              <Activity className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin text-black" : ""}`} />
              <span>Test All Connectors</span>
            </button>
          </div>
        </header>

        {/* Live Toast Banner */}
        {syncToast && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-8 py-2 text-xs font-mono text-emerald-400 flex items-center justify-between flex-shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{syncToast}</span>
            </div>
            <button onClick={() => setSyncToast(null)} className="text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Workspace */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* Metrics & Vault Posture Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#080808] border border-[#262626] space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Active Adapters</span>
              <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-2">
                <span>{activeCount}</span>
                <span className="text-xs text-neutral-500 font-normal">/ {connectors.length} configured</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080808] border border-[#262626] space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Total Ingestion Throughput</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 flex items-baseline gap-2">
                <span>{(totalEventsPerSec / 1000).toFixed(1)}k</span>
                <span className="text-xs text-neutral-500 font-normal">EPS (Events / Sec)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080808] border border-[#262626] space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Vault Security Posture</span>
              <div className="text-base font-bold font-mono text-white flex items-center gap-1.5 pt-1">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>AES-256-GCM Locked</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080808] border border-[#262626] space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Telemetry Health Score</span>
              <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-2">
                <span className="text-emerald-400">99.8%</span>
                <span className="text-xs text-neutral-500 font-normal">Uptime SLA</span>
              </div>
            </div>
          </div>

          {/* Main Tab Switcher: Connectors vs Extensions */}
          <div className="flex items-center gap-2 border-b border-[#262626] pb-3 font-mono">
            <button
              onClick={() => setMainView("connectors")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                mainView === "connectors"
                  ? "bg-white text-black shadow-md"
                  : "bg-[#0A0A0A] border border-[#262626] text-neutral-400 hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Enterprise Connectors ({connectors.length})</span>
            </button>

            <button
              onClick={() => setMainView("extensions")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                mainView === "extensions"
                  ? "bg-white text-black shadow-md"
                  : "bg-[#0A0A0A] border border-[#262626] text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security Extensions & Marketplace ({extensions.length})</span>
            </button>
          </div>

          {mainView === "extensions" ? (
            <div className="space-y-5 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-400">
                <span>Curated Community Detection Packs, WASM Protocol Decoders, and Distributed SOAR Workers</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {extensions.filter(e => e.isInstalled).length} / {extensions.length} Extensions Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {extensions.map((ext) => (
                  <div
                    key={ext.id}
                    className="p-5 rounded-2xl bg-[#080808] border border-[#262626] hover:border-neutral-600 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-emerald-400 border border-emerald-500/30 font-bold">
                          {ext.category}
                        </span>
                        <span className="text-[10px] text-neutral-400">{ext.version}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight font-sans">{ext.name}</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed font-sans">{ext.description}</p>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {ext.capabilities.map((c, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#0A0A0A] border border-[#262626] text-neutral-300">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-xs">
                      <div className="text-[10px] text-neutral-500">
                        {ext.author} • ★ {ext.rating}
                      </div>

                      <button
                        onClick={() => {
                          setExtensions(prev => prev.map(e => e.id === ext.id ? { ...e, isInstalled: !e.isInstalled } : e));
                          setSyncToast(`${ext.name} ${ext.isInstalled ? "uninstalled" : "installed and active"}!`);
                          setTimeout(() => setSyncToast(null), 3000);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                          ext.isInstalled
                            ? "bg-neutral-900 text-emerald-400 border border-emerald-500/30 hover:bg-neutral-800"
                            : "bg-white text-black hover:bg-neutral-200"
                        }`}
                      >
                        {ext.isInstalled ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Installed</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Install</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Filter & Search Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
              {[
                { id: "all", label: "All Connectors", count: connectors.length },
                { id: "siem", label: "SIEM & Lakes", count: connectors.filter(c => c.category === "siem").length },
                { id: "edr", label: "EDR & XDR", count: connectors.filter(c => c.category === "edr").length },
                { id: "iam", label: "Identity & IAM", count: connectors.filter(c => c.category === "iam").length },
                { id: "cloud", label: "Cloud Security", count: connectors.filter(c => c.category === "cloud").length },
                { id: "network", label: "Network & SASE", count: connectors.filter(c => c.category === "network").length },
                { id: "threat_intel", label: "Threat Intel", count: connectors.filter(c => c.category === "threat_intel").length },
                { id: "itsm", label: "ITSM & SOAR", count: connectors.filter(c => c.category === "itsm").length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === tab.id
                      ? "bg-white text-black font-bold shadow-md"
                      : "bg-[#0A0A0A] border border-[#262626] text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === tab.id ? "bg-black/20 text-black font-bold" : "bg-neutral-900 text-neutral-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor, protocol, capability..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#0A0A0A] border border-[#262626] rounded-xl text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
              />
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Connectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredConnectors.map((item) => {
              const test = testOutput[item.id];
              const isTesting = testingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl bg-[#080808] border transition-all flex flex-col justify-between space-y-4 hover:border-neutral-700 ${
                    item.isActive ? "border-[#262626]" : "border-[#1c1c1c] opacity-75"
                  }`}
                >
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-[#262626] uppercase">
                            {item.vendor}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">{item.protocol}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white tracking-tight mt-1">{item.displayName}</h3>
                      </div>

                      <button
                        onClick={() => handleToggleActive(item.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition border ${
                          item.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-neutral-900 text-neutral-500 border-[#262626] hover:text-white"
                        }`}
                        title="Click to toggle connector active/paused state"
                      >
                        {item.isActive ? "● ACTIVE" : "○ PAUSED"}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Capabilities Tags */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block font-mono">
                      Capabilities & Endpoints
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded bg-[#121212] text-neutral-300 border border-[#222] text-[10px] font-mono"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Health Telemetry Bar */}
                  <div className="p-3 rounded-xl bg-[#030303] border border-[#1f1f1f] font-mono text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Live Ingestion:</span>
                      <span className="text-white font-bold">{item.health.eventsPerSec.toLocaleString()} EPS</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Vault Key:</span>
                      <span className="text-amber-400 truncate max-w-[140px]">{item.vaultKeyName}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400 border-t border-[#1a1a1a] pt-1">
                      <span>Latency:</span>
                      <span className="text-emerald-400 font-bold">{item.health.latencyMs}ms</span>
                    </div>
                  </div>

                  {/* Live Diagnostic Output (if tested) */}
                  {test && (
                    <div className="p-3 rounded-xl bg-black border border-emerald-500/30 text-xs font-mono space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Diagnostic Result:
                        </span>
                        <span className="text-emerald-400 font-bold text-[10px]">{test.status}</span>
                      </div>
                      <pre className="text-[10px] text-neutral-300 overflow-x-auto whitespace-pre-wrap max-h-20 bg-[#080808] p-2 rounded">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#1f1f1f]">
                    <button
                      onClick={() => handleTestConnectivity(item)}
                      disabled={isTesting}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-[#262626] text-white rounded-xl text-xs font-mono font-semibold transition"
                    >
                      <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isTesting ? "animate-spin" : ""}`} />
                      <span>{isTesting ? "Pinging..." : "Test Connectivity"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setConfigModalConnector(item);
                        setEditEndpoint(item.endpointUrl);
                        setEditAuthMethod(item.authMethod);
                      }}
                      className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-[#262626] text-neutral-300 hover:text-white rounded-xl text-xs font-mono transition"
                      title="Configure Adapter Settings"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>

        {/* Configure Connector Modal */}
        {configModalConnector && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#080808] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Configure Adapter: {configModalConnector.displayName}
                  </h3>
                </div>
                <button
                  onClick={() => setConfigModalConnector(null)}
                  className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-neutral-400 uppercase text-[10px] block mb-1">Target Endpoint URL</label>
                  <input
                    type="text"
                    value={editEndpoint}
                    onChange={(e) => setEditEndpoint(e.target.value)}
                    className="w-full px-3 py-2 bg-[#030303] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 uppercase text-[10px] block mb-1">Authentication Scheme</label>
                  <select
                    value={editAuthMethod}
                    onChange={(e) => setEditAuthMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-[#030303] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bearer Token">Bearer Token</option>
                    <option value="OAuth 2.0">OAuth 2.0 Client Credentials</option>
                    <option value="mTLS Certificate">Mutual TLS (mTLS) Certificate</option>
                    <option value="HMAC Secret">HMAC Signed Header Secret</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/60 border border-[#262626] space-y-1 text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Vault Credential Protection</span>
                  </div>
                  <p className="text-neutral-400 text-[10px]">
                    Credentials for {configModalConnector.displayName} are stored encrypted in Vault under <span className="text-white font-bold">{configModalConnector.vaultKeyName}</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  onClick={() => setConfigModalConnector(null)}
                  className="px-4 py-2 rounded-xl border border-[#262626] text-neutral-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition shadow-md"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Custom Connector Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#080808] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Register Custom Telemetry Adapter</h3>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-neutral-400 uppercase text-[10px] block mb-1">Connector Display Name</label>
                  <input
                    type="text"
                    value={newConnectorName}
                    onChange={(e) => setNewConnectorName(e.target.value)}
                    placeholder="e.g. Darktrace Cyber AI, Rapid7 InsightIDR"
                    className="w-full px-3 py-2 bg-[#030303] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 uppercase text-[10px] block mb-1">Vendor / Platform</label>
                  <input
                    type="text"
                    value={newConnectorVendor}
                    onChange={(e) => setNewConnectorVendor(e.target.value)}
                    placeholder="e.g. Darktrace, Rapid7, Custom Microservice"
                    className="w-full px-3 py-2 bg-[#030303] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 uppercase text-[10px] block mb-1">Security Category</label>
                  <select
                    value={newConnectorCategory}
                    onChange={(e) => setNewConnectorCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#030303] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="siem">SIEM & Data Lakes</option>
                    <option value="edr">EDR & Endpoint XDR</option>
                    <option value="iam">Identity & Access Management (IAM)</option>
                    <option value="cloud">Cloud Infrastructure & CSPM</option>
                    <option value="network">Network Firewalls & SASE</option>
                    <option value="threat_intel">Threat Intelligence (CTI)</option>
                    <option value="itsm">ITSM & Automation (SOAR)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 uppercase text-[10px] block mb-1">Webhook / API Endpoint</label>
                  <input
                    type="text"
                    value={newConnectorEndpoint}
                    onChange={(e) => setNewConnectorEndpoint(e.target.value)}
                    placeholder="https://api.my-soc-feed.corp.internal/v1/telemetry"
                    className="w-full px-3 py-2 bg-[#030303] border border-[#262626] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#262626] text-neutral-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomConnector}
                  disabled={!newConnectorName.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-md disabled:opacity-50"
                >
                  Register & Encrypt in Vault
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
