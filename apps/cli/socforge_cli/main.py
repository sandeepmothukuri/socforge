"""SOCForge Command-Line Interface.

Provides operational and administrative controls for SOCForge:
- Investigation management
- Detection testing & validation
- Alert querying
- Deterministic demo execution via live API calls
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import httpx
from rich.console import Console
from rich.table import Table
import typer

app = typer.Typer(
    name="socforge",
    help="SOCForge CLI — Evidence-driven security operations platform",
)

detections_app = typer.Typer(help="Manage and validate detection rules")
alerts_app = typer.Typer(help="Query and inspect security alerts")
investigations_app = typer.Typer(help="Manage investigations and evidence findings")

console = Console()

API_BASE_URL = os.environ.get("SOCFORGE_API_URL", "http://localhost:8000/api/v1")
AUTH_TOKEN = os.environ.get("SOCFORGE_API_KEY", "")
TOKEN_FILE = Path.home() / ".socforge" / "token"


def get_headers() -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    token = AUTH_TOKEN
    if not token and TOKEN_FILE.exists():
        try:
            token = TOKEN_FILE.read_text(encoding="utf-8").strip()
        except Exception:
            token = ""
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


@app.command("login")
def login(
    email: str = typer.Option("admin@socforge.local", "--email", "-e"),
    password: str = typer.Option("admin12345!", "--password", "-p"),
):
    """Authenticate with SOCForge API and store access token."""
    login_url = f"{API_BASE_URL}/auth/login"
    try:
        resp = httpx.post(
            login_url,
            data={"username": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10.0,
        )
        if resp.status_code == 200:
            token = resp.json().get("access_token")
            TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
            TOKEN_FILE.write_text(token, encoding="utf-8")
            console.print(f"[bold green][OK] Successfully authenticated as {email}[/bold green]")
        else:
            console.print(f"[bold red]Authentication failed: HTTP {resp.status_code} {resp.text}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]Login error: {e}[/bold red]")


# ── Alerts ───────────────────────────────────────────────────────────────────

app.add_typer(alerts_app, name="alerts")


@alerts_app.command("list")
def list_alerts(
    severity: Optional[str] = typer.Option(None, "--severity", "-s"),
    limit: int = typer.Option(20, "--limit", "-n"),
):
    """List security alerts."""
    url = f"{API_BASE_URL}/alerts"
    params = {"page_size": limit}
    if severity:
        params["severity"] = severity

    try:
        resp = httpx.get(url, headers=get_headers(), params=params, timeout=10.0)
        if resp.status_code == 200:
            data = resp.json()
            alerts = data.get("items", []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
            total = data.get("total", len(alerts)) if isinstance(data, dict) else len(alerts)
            table = Table(title=f"Security Alerts ({total})")
            table.add_column("ID", style="cyan")
            table.add_column("Severity", style="bold")
            table.add_column("Status", style="yellow")
            table.add_column("Source", style="green")
            table.add_column("Title")

            for a in alerts:
                sev_style = {
                    "critical": "bold red",
                    "high": "red",
                    "medium": "yellow",
                    "low": "blue",
                    "informational": "dim",
                }.get(a.get("severity", ""), "")
                table.add_row(
                    str(a.get("id", ""))[:8],
                    f"[{sev_style}]{a.get('severity', '')}[/{sev_style}]",
                    str(a.get("status", "")),
                    str(a.get("source", "")),
                    str(a.get("title", ""))[:50],
                )
            console.print(table)
        else:
            console.print(f"[bold red]Failed: HTTP {resp.status_code} {resp.text}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]Connection error: {e}[/bold red]")


# ── Detections ───────────────────────────────────────────────────────────────

app.add_typer(detections_app, name="detections")


@detections_app.command("list")
def list_detections():
    """List detection engineering rules."""
    url = f"{API_BASE_URL}/detections"
    try:
        resp = httpx.get(url, headers=get_headers(), timeout=10.0)
        if resp.status_code == 200:
            detections = resp.json()
            table = Table(title="Detection Rules")
            table.add_column("ID", style="cyan")
            table.add_column("Language", style="yellow")
            table.add_column("State", style="green")
            table.add_column("Name")

            for d in detections:
                table.add_row(d["id"][:8], d["rule_language"], d["validation_state"], d["name"])
            console.print(table)
        else:
            console.print(f"[bold red]Failed: {resp.text}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")


@detections_app.command("validate")
def validate_detection_cli(detection_id: str):
    """Validate a detection rule's syntax."""
    url = f"{API_BASE_URL}/detections/{detection_id}/validate"
    try:
        resp = httpx.post(url, headers=get_headers(), timeout=10.0)
        if resp.status_code == 200:
            res = resp.json()
            if res["syntax_valid"]:
                console.print(f"[bold green][PASS] Rule syntax is valid ({res['rule_language']})[/bold green]")
            else:
                console.print(f"[bold red][FAIL] Rule syntax errors:[/bold red] {res.get('errors')}")
        else:
            console.print(f"[bold red]Failed: {resp.text}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")


@detections_app.command("test")
def test_detection_cli(detection_id: str, dataset: str = "synthetic-soc-v1"):
    """Execute detection rule test replay against telemetry."""
    url = f"{API_BASE_URL}/detections/{detection_id}/test"
    try:
        resp = httpx.post(url, headers=get_headers(), json={"dataset_name": dataset}, timeout=15.0)
        if resp.status_code == 200:
            res = resp.json()
            console.print(f"[bold green][OK] Detection test completed in {res.get('duration_ms')}ms[/bold green]")
            console.print(f"Dataset: {res.get('dataset_name')} | Events: {res.get('total_events')} | Matched: {res.get('matched_events')}")
            console.print(f"Confusion Matrix -> TP: {res.get('true_positives')} | FP: {res.get('false_positives')} | FN: {res.get('false_negatives')} | TN: {res.get('true_negatives')}")
            console.print(f"Precision: {res.get('precision')} | Recall: {res.get('recall')} | F1: {res.get('f1')}")
        else:
            console.print(f"[bold red]Failed: {resp.text}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")


# ── Investigations ──────────────────────────────────────────────────────────

app.add_typer(investigations_app, name="investigations")


@investigations_app.command("list")
def list_investigations():
    """List security investigations."""
    url = f"{API_BASE_URL}/investigations"
    try:
        resp = httpx.get(url, headers=get_headers(), timeout=10.0)
        if resp.status_code == 200:
            data = resp.json()
            invs = data if isinstance(data, list) else data.get("items", [])
            table = Table(title=f"Investigations ({len(invs)})")
            table.add_column("ID", style="cyan")
            table.add_column("Severity", style="bold")
            table.add_column("Status", style="yellow")
            table.add_column("Alerts", style="magenta")
            table.add_column("Findings", style="green")
            table.add_column("Title")

            for inv in invs:
                sev = inv.get("severity", "")
                sev_style = {
                    "critical": "bold red",
                    "high": "red",
                    "medium": "yellow",
                    "low": "blue",
                }.get(sev, "")
                table.add_row(
                    str(inv.get("id", ""))[:8],
                    f"[{sev_style}]{sev}[/{sev_style}]",
                    str(inv.get("status", "")),
                    str(inv.get("alert_count", 0)),
                    str(inv.get("finding_count", 0)),
                    str(inv.get("title", ""))[:50],
                )
            console.print(table)
        else:
            console.print(f"[bold red]Failed: HTTP {resp.status_code} {resp.text}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")


@investigations_app.command("get")
def get_investigation(investigation_id: str):
    """Get investigation details by ID."""
    url = f"{API_BASE_URL}/investigations/{investigation_id}"
    try:
        resp = httpx.get(url, headers=get_headers(), timeout=10.0)
        if resp.status_code == 200:
            inv = resp.json()
            console.print(f"[bold cyan]Investigation:[/bold cyan] {inv.get('title')}")
            console.print(f"ID: {inv.get('id')} | Status: {inv.get('status')} | Severity: {inv.get('severity')}")
            console.print(f"Description: {inv.get('description')}")
            console.print(f"MITRE Techniques: {', '.join(inv.get('mitre_techniques') or [])}")
            console.print(f"Alerts: {inv.get('alert_count')} | Findings: {inv.get('finding_count')}")
        else:
            console.print(f"[bold red]Failed: HTTP {resp.status_code} {resp.text}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")


# ── Demo Workflow (Real API Operations) ──────────────────────────────────────

@app.command()
def demo():
    """Execute end-to-end security operations demo workflow via live API calls."""
    console.print("[bold cyan][*] Running SOCForge deterministic demo workflow against API...[/bold cyan]")
    client = httpx.Client(base_url=API_BASE_URL.replace("/api/v1", ""), timeout=15.0)

    # 1. Health verification
    try:
        health_resp = client.get("/health")
        if health_resp.status_code != 200:
            console.print(f"[bold red][FAIL] API health check failed: HTTP {health_resp.status_code}[/bold red]")
            return
        console.print("[green][OK] API connected & healthy[/green]")
    except Exception as e:
        console.print(f"[bold red][FAIL] Cannot connect to API: {e}[/bold red]")
        return

    # 2. Acquire authentication token
    auth_headers = {"Content-Type": "application/json"}
    token = AUTH_TOKEN
    if not token:
        login_url = "/api/v1/auth/login"
        try:
            admin_email = os.environ.get("DEFAULT_ADMIN_EMAIL", "admin@socforge.local")
            admin_pwd = os.environ.get("DEFAULT_ADMIN_PASSWORD", "admin12345!")
            login_resp = client.post(
                login_url,
                data={"username": admin_email, "password": admin_pwd},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if login_resp.status_code == 200:
                token = login_resp.json().get("access_token")
                try:
                    TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
                    TOKEN_FILE.write_text(token, encoding="utf-8")
                except Exception:
                    pass
                console.print(f"[green][OK] Authenticated as {admin_email}[/green]")
            else:
                console.print(f"[yellow][WARN] Auto-login skipped (HTTP {login_resp.status_code}); attempting unauthenticated demo[/yellow]")
        except Exception as e:
            console.print(f"[yellow][WARN] Auto-login error: {e}[/yellow]")

    if token:
        auth_headers["Authorization"] = f"Bearer {token}"

    # 3. Create Demo Alert
    alert_payload = {
        "source": "endpoint_edr",
        "title": "Mimikatz LSASS Memory Dump Anomaly",
        "description": "Suspicious process mimikatz.exe requested PROCESS_VM_READ against lsass.exe on domain controller.",
        "severity": "critical",
        "source_host": "SRV-DC01",
        "username": "SYSTEM",
        "process_name": "mimikatz.exe",
        "process_command_line": "mimikatz.exe privilege::debug sekurlsa::logonpasswords exit",
        "mitre_techniques": ["T1003.001"],
        "mitre_tactics": ["credential_access"],
    }
    alert_id = None
    try:
        alert_resp = client.post("/api/v1/alerts", json=alert_payload, headers=auth_headers)
        if alert_resp.status_code == 201:
            alert_id = alert_resp.json().get("id")
            console.print(f"[green][OK] Created demo alert: {alert_id[:8]} - {alert_payload['title']}[/green]")
        else:
            console.print(f"[yellow]Alert creation status: {alert_resp.status_code} ({alert_resp.text[:80]})[/yellow]")
    except Exception as e:
        console.print(f"[yellow]Alert API error: {e}[/yellow]")

    # 4. Create Demo Investigation
    inv_id = None
    try:
        inv_payload = {
            "title": "Investigate DC01 Credential Dumping Campaign",
            "description": "Cross-correlation of LSASS process access telemetry and lateral movement indicators.",
            "severity": "critical",
            "alert_ids": [alert_id] if alert_id else [],
            "mitre_techniques": ["T1003.001"],
            "mitre_tactics": ["credential_access"],
        }
        inv_resp = client.post("/api/v1/investigations", json=inv_payload, headers=auth_headers)
        if inv_resp.status_code == 201:
            inv_id = inv_resp.json().get("id")
            console.print(f"[green][OK] Created investigation: {inv_id[:8]} - {inv_payload['title']}[/green]")
    except Exception as e:
        console.print(f"[yellow]Investigation API error: {e}[/yellow]")

    # 5. Create Evidence-Backed Finding
    finding_id = None
    if inv_id:
        try:
            finding_payload = {
                "title": "Confirmed LSASS Memory Access with Debug Privileges",
                "description": "Process mimikatz.exe executed with SeDebugPrivilege enabled; LSASS memory targeted for credential extraction.",
                "confidence": "confirmed",
                "mitre_techniques": ["T1003.001"],
                "mitre_tactics": ["credential_access"],
                "supporting_event_ids": [],
                "justification": "Evidence verified from memory telemetry and kernel ETW process creation logs.",
                "response_recommendations": ["isolate_host", "revoke_session"],
            }
            finding_resp = client.post(f"/api/v1/investigations/{inv_id}/findings", json=finding_payload, headers=auth_headers)
            if finding_resp.status_code == 201:
                finding_id = finding_resp.json().get("id")
                console.print(f"[green][OK] Created finding: {finding_id[:8]} (Evidence backed)[/green]")
        except Exception as e:
            console.print(f"[yellow]Finding API error: {e}[/yellow]")

    # 6. Create Detection Rule & Run Replay Engine
    sigma_rule = """title: Mimikatz LSASS Credential Dumping
id: 5b7d90e2-8b63-4b68-b8f4-2f22c1db55c1
status: test
description: Detects command line executions of Mimikatz attempting LSASS dumping
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|contains: mimikatz
  condition: selection
falsepositives:
  - Authorized security auditing
level: critical
"""
    try:
        detection_payload = {
            "name": "Mimikatz LSASS Dump Detection",
            "description": "Detects LSASS memory extraction tool execution",
            "rule_language": "sigma",
            "rule_content": sigma_rule,
            "mitre_techniques": ["T1003.001"],
            "mitre_tactics": ["credential_access"],
            "finding_id": finding_id,
        }
        det_resp = client.post("/api/v1/detections", json=detection_payload, headers=auth_headers)
        if det_resp.status_code == 201:
            det_id = det_resp.json().get("id")
            console.print(f"[green][OK] Created detection rule: {det_id[:8]}[/green]")

            # Validate rule syntax
            val_resp = client.post(f"/api/v1/detections/{det_id}/validate", headers=auth_headers)
            if val_resp.status_code == 200:
                console.print(f"[green][OK] Syntax validated (valid={val_resp.json().get('syntax_valid')})[/green]")

            # Run detection test replay against synthetic dataset
            test_resp = client.post(f"/api/v1/detections/{det_id}/test", json={"dataset_name": "synthetic-soc-v1"}, headers=auth_headers)
            if test_resp.status_code == 200:
                tr = test_resp.json()
                console.print(f"[green][OK] Replay test completed against {tr.get('dataset_name')}:[/green]")
                console.print(f"     Events: {tr.get('total_events')} | Matched: {tr.get('matched_events')} | Precision: {tr.get('precision')} | Recall: {tr.get('recall')}")
    except Exception as e:
        console.print(f"[yellow]Detection API error: {e}[/yellow]")

    console.print("\n[bold green]✓ SOCForge deterministic demo workflow completed via live API calls.[/bold green]")
    console.print("[bold]Console interface available at:[/bold] [link=http://localhost:3000]http://localhost:3000[/link]")


if __name__ == "__main__":
    app()
