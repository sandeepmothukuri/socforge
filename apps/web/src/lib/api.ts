/**
 * SOCForge API Client
 * Provides typed REST communication with the FastAPI backend.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

let cachedToken: string | null = null;

export function setAuthToken(token: string) {
  cachedToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("socforge_token", token);
  }
}

export function getAuthToken(): string | null {
  if (cachedToken) return cachedToken;
  if (typeof window !== "undefined") {
    cachedToken = localStorage.getItem("socforge_token");
  }
  return cachedToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP Error ${res.status}: ${res.statusText}`
      );
    }

    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`API request failed [${options.method || "GET"} ${url}]:`, err);
    throw err;
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────
export async function login(username: string = "admin@socforge.local", password: string = "admin12345!") {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!res.ok) {
    throw new Error("Failed to authenticate with SOCForge API");
  }

  const data = await res.json();
  setAuthToken(data.access_token);
  return data;
}

// ── Alerts ──────────────────────────────────────────────────────────────────
export interface AlertItem {
  id: string;
  external_id?: string;
  source: string;
  title: string;
  description?: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  status: "new" | "triaged" | "investigating" | "resolved" | "closed";
  risk_score?: number;
  source_ip?: string;
  destination_ip?: string;
  source_host?: string;
  destination_host?: string;
  username?: string;
  process_name?: string;
  process_command_line?: string;
  domain?: string;
  file_hash?: string;
  mitre_techniques?: string[];
  mitre_tactics?: string[];
  created_at: string;
}

export async function getAlerts(severity?: string): Promise<{ items: AlertItem[]; total: number }> {
  try {
    const query = severity ? `?severity=${severity}` : "";
    const res = await request<any>(`/alerts${query}`);
    if (Array.isArray(res)) {
      return { items: res, total: res.length };
    }
    return { items: res?.items || [], total: res?.total || 0 };
  } catch {
    await login();
    const query = severity ? `?severity=${severity}` : "";
    const res = await request<any>(`/alerts${query}`);
    if (Array.isArray(res)) {
      return { items: res, total: res.length };
    }
    return { items: res?.items || [], total: res?.total || 0 };
  }
}

// ── Investigations ──────────────────────────────────────────────────────────
export interface InvestigationItem {
  id: string;
  title: string;
  description?: string;
  severity?: string;
  status: string;
  risk_score?: number;
  mitre_techniques: string[];
  mitre_tactics: string[];
  opened_at: string;
  alert_count: number;
  finding_count: number;
}

export async function getInvestigations(): Promise<InvestigationItem[]> {
  try {
    const res = await request<any>("/investigations");
    return Array.isArray(res) ? res : res?.items || [];
  } catch {
    await login();
    const res = await request<any>("/investigations");
    return Array.isArray(res) ? res : res?.items || [];
  }
}

export async function getInvestigationById(id: string): Promise<InvestigationItem> {
  try {
    return await request<InvestigationItem>(`/investigations/${id}`);
  } catch {
    await login();
    return await request<InvestigationItem>(`/investigations/${id}`);
  }
}

export interface FindingItem {
  id: string;
  investigation_id: string;
  title: string;
  description: string;
  confidence: string;
  mitre_techniques: string[];
  mitre_tactics: string[];
  supporting_event_ids: string[];
  supporting_entity_ids: string[];
  response_recommendations: string[];
  has_detection_hypothesis: boolean;
  created_at: string;
}

export async function getInvestigationFindings(investigationId: string): Promise<FindingItem[]> {
  try {
    const res = await request<any>(`/investigations/${investigationId}/findings`);
    return Array.isArray(res) ? res : res?.items || [];
  } catch {
    await login();
    const res = await request<any>(`/investigations/${investigationId}/findings`);
    return Array.isArray(res) ? res : res?.items || [];
  }
}

export interface EvidenceGraphNode {
  id: string;
  label: string;
  type: string;
  risk_score: number;
  properties: Record<string, any>;
}

export interface EvidenceGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  evidence_count: number;
}

export interface EvidenceGraphData {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
}

export async function getInvestigationGraph(id: string): Promise<EvidenceGraphData> {
  try {
    return await request<EvidenceGraphData>(`/investigations/${id}/graph`);
  } catch {
    await login();
    return await request<EvidenceGraphData>(`/investigations/${id}/graph`);
  }
}

// ── Detections ──────────────────────────────────────────────────────────────
export interface DetectionItem {
  id: string;
  name: string;
  description?: string;
  rule_language: "sigma" | "spl" | "kql";
  rule_content: string;
  validation_state: string;
  severity?: string;
  version?: string;
  mitre_techniques: string[];
  mitre_tactics: string[];
  author_id?: string;
  reviewed_by_id?: string;
  created_at: string;
}

export interface ValidationReport {
  syntax_valid: boolean;
  errors?: string[];
  warnings?: string[];
  rule_language?: string;
}

export async function getDetections(): Promise<DetectionItem[]> {
  try {
    const res = await request<any>("/detections");
    return Array.isArray(res) ? res : res?.items || [];
  } catch {
    await login();
    const res = await request<any>("/detections");
    return Array.isArray(res) ? res : res?.items || [];
  }
}

export async function getDetectionById(id: string): Promise<DetectionItem> {
  try {
    return await request<DetectionItem>(`/detections/${id}`);
  } catch {
    await login();
    return await request<DetectionItem>(`/detections/${id}`);
  }
}

export async function validateDetection(id: string): Promise<ValidationReport> {
  try {
    return await request<ValidationReport>(`/detections/${id}/validate`, {
      method: "POST",
    });
  } catch {
    await login();
    return await request<ValidationReport>(`/detections/${id}/validate`, {
      method: "POST",
    });
  }
}

export async function approveDetection(id: string): Promise<any> {
  try {
    return await request<any>(`/detections/${id}/approve`, {
      method: "POST",
    });
  } catch {
    await login();
    return await request<any>(`/detections/${id}/approve`, {
      method: "POST",
    });
  }
}

export async function testDetectionRule(id: string, datasetName: string = "synthetic-soc-v1"): Promise<any> {
  try {
    return await request<any>(`/detections/${id}/test`, {
      method: "POST",
      body: JSON.stringify({ dataset_name: datasetName }),
    });
  } catch {
    await login();
    return await request<any>(`/detections/${id}/test`, {
      method: "POST",
      body: JSON.stringify({ dataset_name: datasetName }),
    });
  }
}

// ── Containment Response Actions ────────────────────────────────────────────
export interface ResponseActionItem {
  id: string;
  action_type: string;
  status: string;
  target_entity_type: string;
  target_entity_value: string;
  justification: string;
  created_at: string;
}

export async function getResponseActions(): Promise<ResponseActionItem[]> {
  try {
    const res = await request<any>("/responses");
    return Array.isArray(res) ? res : res?.items || [];
  } catch {
    await login();
    const res = await request<any>("/responses");
    return Array.isArray(res) ? res : res?.items || [];
  }
}

export async function executeResponseAction(
  actionType: string,
  targetType: string,
  targetValue: string,
  justification: string
): Promise<any> {
  try {
    return await request<any>("/responses", {
      method: "POST",
      body: JSON.stringify({
        action_type: actionType,
        target_entity_type: targetType,
        target_entity_value: targetValue,
        justification,
      }),
    });
  } catch {
    await login();
    return await request<any>("/responses", {
      method: "POST",
      body: JSON.stringify({
        action_type: actionType,
        target_entity_type: targetType,
        target_entity_value: targetValue,
        justification,
      }),
    });
  }
}

export async function approveResponseAction(id: string): Promise<any> {
  try {
    return await request<any>(`/responses/${id}/approve`, {
      method: "POST",
    });
  } catch {
    await login();
    return await request<any>(`/responses/${id}/approve`, {
      method: "POST",
    });
  }
}

// ── Threat Hunts ────────────────────────────────────────────────────────────
export interface HuntItem {
  id: string;
  title: string;
  hypothesis: string;
  status: string;
  data_sources: string[];
  mitre_techniques: string[];
  queries: Array<{
    id: string;
    query_text: string;
    query_language: string;
  }>;
  observations: Array<{
    id: string;
    title: string;
    description: string;
    promoted_to_finding_id?: string;
  }>;
}

export async function getHunts(): Promise<HuntItem[]> {
  try {
    const res = await request<any>("/hunts");
    return Array.isArray(res) ? res : res?.items || [];
  } catch {
    await login();
    const res = await request<any>("/hunts");
    return Array.isArray(res) ? res : res?.items || [];
  }
}

// ── Incidents ───────────────────────────────────────────────────────────────
export interface IncidentItem {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  affected_systems: string[];
  affected_users: string[];
  mitre_techniques: string[];
  opened_at: string;
}

export async function getIncidents(): Promise<IncidentItem[]> {
  try {
    const res = await request<any>("/incidents");
    return Array.isArray(res) ? res : res?.items || [];
  } catch {
    await login();
    const res = await request<any>("/incidents");
    return Array.isArray(res) ? res : res?.items || [];
  }
}

// ── Integrations ────────────────────────────────────────────────────────────
export interface IntegrationItem {
  name: string;
  display_name: string;
  integration_type: string;
  is_active: boolean;
  capabilities: string[];
  config?: Record<string, any>;
  last_check_ok?: boolean | null;
  last_checked_at?: string | null;
  last_check_error?: string | null;
}

export async function getIntegrations(): Promise<IntegrationItem[]> {
  try {
    const res = await request<any>("/integrations");
    return Array.isArray(res) ? res : res?.items || [];
  } catch {
    await login();
    const res = await request<any>("/integrations");
    return Array.isArray(res) ? res : res?.items || [];
  }
}

export async function testIntegrationHealth(name: string): Promise<any> {
  return await request<any>(`/integrations/${name}/health`, {
    method: "POST",
  });
}

// ── Entities & Assets ────────────────────────────────────────────────────────
export interface EntityItem {
  id: string;
  entity_type: "ip" | "domain" | "url" | "file_hash" | "user" | "host";
  value: string;
  display_name?: string;
  first_seen_at: string;
  last_seen_at: string;
  event_count: number;
  risk_score?: number;
  is_malicious: boolean;
  enrichment?: Record<string, any>;
  metadata?: Record<string, any>;
}

export async function getEntities(params?: {
  entity_type?: string;
  search?: string;
  is_malicious?: boolean;
}): Promise<EntityItem[]> {
  try {
    const query = new URLSearchParams();
    if (params?.entity_type) query.append("entity_type", params.entity_type);
    if (params?.search) query.append("search", params.search);
    if (params?.is_malicious !== undefined) query.append("is_malicious", String(params.is_malicious));
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await request<any>(`/entities${qs}`);
    return Array.isArray(res) ? res : res?.items || [];
  } catch {
    await login();
    const query = new URLSearchParams();
    if (params?.entity_type) query.append("entity_type", params.entity_type);
    if (params?.search) query.append("search", params.search);
    if (params?.is_malicious !== undefined) query.append("is_malicious", String(params.is_malicious));
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await request<any>(`/entities${qs}`);
    return Array.isArray(res) ? res : res?.items || [];
  }
}

// ── Workspaces & Health ──────────────────────────────────────────────────────
export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export async function getWorkspaces(): Promise<WorkspaceItem[]> {
  try {
    const res = await request<any>("/workspaces");
    return Array.isArray(res) ? res : [];
  } catch {
    await login();
    const res = await request<any>("/workspaces");
    return Array.isArray(res) ? res : [];
  }
}

export async function getHealthStatus(): Promise<{ status: string; uptime_seconds: number; components: Record<string, string> }> {
  try {
    const res = await fetch("http://localhost:8000/health");
    if (res.ok) return await res.json();
    return { status: "degraded", uptime_seconds: 0, components: { database: "unreachable" } };
  } catch {
    return { status: "degraded", uptime_seconds: 0, components: { database: "unreachable" } };
  }
}

// ── Audit Logs ──────────────────────────────────────────────────────────────
export interface AuditItem {
  id: string;
  action: string;
  actor_email?: string;
  target_type?: string;
  metadata?: any;
  occurred_at: string;
}

export async function getAuditLogs(): Promise<{ items: AuditItem[]; total: number }> {
  try {
    const res = await request<any>("/audit");
    if (Array.isArray(res)) {
      return { items: res, total: res.length };
    }
    return { items: res?.items || [], total: res?.total || 0 };
  } catch {
    await login();
    const res = await request<any>("/audit");
    if (Array.isArray(res)) {
      return { items: res, total: res.length };
    }
    return { items: res?.items || [], total: res?.total || 0 };
  }
}

// ── End-to-End Demo Workflow ────────────────────────────────────────────────
export async function runDemoWorkflow(): Promise<{ success: boolean; steps: string[] }> {
  const steps: string[] = [];
  try {
    steps.push("Authenticating with SOCForge API engine...");
    await login();
    steps.push("Authenticated as Administrator");

    // 1. Create Demo Alert
    steps.push("Ingesting Mimikatz LSASS credential access alert...");
    const alertRes = await request<any>("/alerts", {
      method: "POST",
      body: JSON.stringify({
        source: "endpoint_edr",
        title: "Mimikatz LSASS Memory Dump Anomaly",
        description: "Process mimikatz.exe requested PROCESS_VM_READ against lsass.exe on domain controller.",
        severity: "critical",
        source_host: "SRV-DC01",
        username: "SYSTEM",
        process_name: "mimikatz.exe",
        process_command_line: "mimikatz.exe privilege::debug sekurlsa::logonpasswords exit",
        mitre_techniques: ["T1003.001"],
        mitre_tactics: ["credential_access"],
      }),
    });
    const alertId = alertRes?.id || "demo-alert";
    steps.push(`Alert created (${alertId.slice(0, 8)}) — T1003.001 flagged`);

    // 2. Create Investigation
    steps.push("Constructing active Investigation workspace...");
    const invRes = await request<any>("/investigations", {
      method: "POST",
      body: JSON.stringify({
        title: "Investigate DC01 Credential Dumping Campaign",
        description: "Cross-correlation of LSASS process access telemetry and lateral movement indicators.",
        severity: "critical",
        alert_ids: alertId ? [alertId] : [],
        mitre_techniques: ["T1003.001"],
        mitre_tactics: ["credential_access"],
      }),
    });
    const invId = invRes?.id || "";
    steps.push(`Investigation workspace created (${invId.slice(0, 8)})`);

    // 3. Create Evidence Finding
    if (invId) {
      steps.push("Attaching evidence-backed analytical finding...");
      await request<any>(`/investigations/${invId}/findings`, {
        method: "POST",
        body: JSON.stringify({
          title: "Confirmed LSASS Memory Access with Debug Privileges",
          description: "Process mimikatz.exe executed with SeDebugPrivilege enabled; LSASS memory targeted for credential extraction.",
          confidence: "confirmed",
          mitre_techniques: ["T1003.001"],
          mitre_tactics: ["credential_access"],
          supporting_event_ids: [],
          justification: "Verified from kernel ETW process creation logs and memory access flags.",
          response_recommendations: ["isolate_host", "revoke_session"],
        }),
      });
      steps.push("Evidence linked to PostgreSQL relational tables");
    }

    // 4. Create Detection Rule & Replay Test
    steps.push("Formulating Sigma detection rule candidate...");
    const sigmaRule = `title: Mimikatz LSASS Credential Dumping
status: test
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|contains: mimikatz
  condition: selection
falsepositives:
  - Authorized security auditing
level: critical`;

    const detRes = await request<any>("/detections", {
      method: "POST",
      body: JSON.stringify({
        name: "Mimikatz LSASS Dump Detection",
        description: "Detects LSASS memory extraction tool execution",
        rule_language: "sigma",
        rule_content: sigmaRule,
        mitre_techniques: ["T1003.001"],
        mitre_tactics: ["credential_access"],
      }),
    });
    const detId = detRes?.id;
    steps.push(`Sigma rule candidate registered (${detId?.slice(0, 8) || "sigma"})`);

    if (detId) {
      steps.push("Executing Detection Replay Engine against synthetic-soc-v1.json...");
      const testRes = await request<any>(`/detections/${detId}/test`, {
        method: "POST",
        body: JSON.stringify({ dataset_name: "synthetic-soc-v1" }),
      });
      steps.push(
        `Replay Test Complete: Precision=${testRes.precision} | Recall=${testRes.recall} | F1=${testRes.f1}`
      );
    }

    steps.push("SOCForge end-to-end workflow successfully executed!");
    return { success: true, steps };
  } catch (err: any) {
    steps.push(`Error: ${err.message || String(err)}`);
    return { success: false, steps };
  }
}
