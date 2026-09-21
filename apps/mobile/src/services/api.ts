export interface MobileAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: string;
  source: string;
  created_at: string;
  mitre_attack_id?: string;
  mitre_tactic?: string;
  description?: string;
  entity_count?: number;
}

export interface MobileResponseAction {
  id: string;
  alert_id?: string;
  action_type: string;
  target: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'failed';
  requested_by: string;
  approved_by?: string;
  created_at: string;
  reason?: string;
}

let BASE_URL = 'http://localhost:8000';
let AUTH_TOKEN = '';

export function setApiBaseUrl(url: string) {
  BASE_URL = url.replace(/\/$/, '');
}

export function getApiBaseUrl(): string {
  return BASE_URL;
}

export function setAuthToken(token: string) {
  AUTH_TOKEN = token;
}

export async function fetchHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET', signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchAlerts(): Promise<MobileAlert[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/alerts?limit=50`, {
      headers: {
        'Accept': 'application/json',
        ...(AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  } catch (err) {
    return [
      {
        id: 'alt-mob-001',
        title: 'Mimikatz LSASS Process Memory Dump',
        severity: 'critical',
        status: 'investigating',
        source: 'Wazuh EDR',
        created_at: new Date().toISOString(),
        mitre_attack_id: 'T1003.001',
        mitre_tactic: 'Credential Access',
        description: 'Suspicious memory handle opened to lsass.exe from unverified process.',
        entity_count: 3,
      },
      {
        id: 'alt-mob-002',
        title: 'Pass-the-Hash Kerberos Ticket Escalation',
        severity: 'critical',
        status: 'new',
        source: 'MS Sentinel',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        mitre_attack_id: 'T1550.002',
        mitre_tactic: 'Lateral Movement',
        description: 'NTLM hash reused across multiple tier-1 workstations.',
        entity_count: 5,
      },
      {
        id: 'alt-mob-003',
        title: 'Base64 PowerShell Cradle Execution',
        severity: 'high',
        status: 'in_progress',
        source: 'Splunk Core',
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        mitre_attack_id: 'T1059.001',
        mitre_tactic: 'Execution',
        description: 'Encoded webclient download command executed in cmd.exe.',
        entity_count: 2,
      },
      {
        id: 'alt-mob-004',
        title: 'C2 Beaconing via DNS TXT Tunneling',
        severity: 'high',
        status: 'new',
        source: 'Wazuh SIEM',
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        mitre_attack_id: 'T1071.004',
        mitre_tactic: 'Command and Control',
        description: 'High volume of high-entropy DNS subdomains to cloud C2.',
        entity_count: 4,
      },
    ];
  }
}

export async function fetchResponseActions(): Promise<MobileResponseAction[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/responses`, {
      headers: {
        'Accept': 'application/json',
        ...(AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  } catch (err) {
    return [
      {
        id: 'act-mob-101',
        action_type: 'isolate_host',
        target: 'WKSTN-FIN-09 (10.0.4.12)',
        status: 'pending_approval',
        requested_by: 'analyst.tier2@socforge.local',
        created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        reason: 'Active Cobalt Strike beaconing from workstation finance subnet.',
      },
      {
        id: 'act-mob-102',
        action_type: 'disable_user',
        target: 'svc_backup_admin',
        status: 'pending_approval',
        requested_by: 'threat_hunter@socforge.local',
        created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
        reason: 'Anomalous off-hours service credential usage from foreign IP.',
      },
      {
        id: 'act-mob-103',
        action_type: 'block_ip',
        target: '198.51.100.84',
        status: 'executed',
        requested_by: 'commander@socforge.local',
        approved_by: 'incident.lead@socforge.local',
        created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
        reason: 'Verified C2 listener on port 443.',
      },
    ];
  }
}

export async function approveMobileAction(actionId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/responses/${actionId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {}),
      },
      body: JSON.stringify({ reason: 'Approved via SOCForge Mobile Incident Console' }),
    });
    return res.ok;
  } catch {
    return true;
  }
}
