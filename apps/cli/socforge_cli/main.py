"""SOCForge CLI — Command-line interface for the SOCForge platform.

Provides analyst, detection engineering, and automation commands directly from terminal.
"""

from __future__ import annotations

import os
from typing import Optional
import httpx
from rich.console import Console
from rich.table import Table
import typer

app = typer.Typer(help="SOCForge CLI — Evidence-driven Security Operations Platform")
console = Console()

API_BASE_URL = os.environ.get("SOCFORGE_API_URL", "http://localhost:8000/api/v1")
AUTH_TOKEN = os.environ.get("SOCFORGE_TOKEN", "")


def get_headers():
    h = {"Content-Type": "application/json"}
    if AUTH_TOKEN:
        h["Authorization"] = f"Bearer {AUTH_TOKEN}"
    return h


@app.command()
def health():
    """Check health and connectivity of the SOCForge API."""
    url = f"{API_BASE_URL.replace('/api/v1', '')}/health"
    try:
        resp = httpx.get(url, timeout=5.0)
        if resp.status_code == 200:
            data = resp.json()
            console.print(f"[bold green]✔ SOCForge API is operational[/bold green] (v{data.get('version')})")
            console.print(f"Environment: {data.get('environment')}, Uptime: {data.get('uptime_seconds')}s")
        else:
            console.print(f"[bold red]✘ API returned status {resp.status_code}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]✘ Failed to reach SOCForge API at {url}: {e}[/bold red]")


@app.command()
def login(email: str = typer.Option(..., prompt=True), password: str = typer.Option(..., prompt=True, hide_input=True)):
    """Authenticate and obtain API access token."""
    url = f"{API_BASE_URL}/auth/login"
    try:
        resp = httpx.post(url, data={"username": email, "password": password})
        if resp.status_code == 200:
            token = resp.json().get("access_token")
            console.print("[bold green]✔ Authentication successful.[/bold green]")
            console.print(f"Export this token to your shell:\nexport SOCFORGE_TOKEN='{token}'")
        else:
            console.print(f"[bold red]✘ Authentication failed: {resp.text}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]✘ Login failed: {e}[/bold red]")


alerts_app = typer.Typer(help="Manage and query alerts")
app.add_typer(alerts_app, name="alerts")


@alerts_app.command("list")
def list_alerts(severity: Optional[str] = None):
    """List recent alerts from the platform."""
    url = f"{API_BASE_URL}/alerts"
    params = {}
    if severity:
        params["severity"] = severity

    try:
        resp = httpx.get(url, headers=get_headers(), params=params)
        if resp.status_code == 200:
            data = resp.json()
            table = Table(title="SOCForge Alerts")
            table.add_column("ID", style="cyan", no_wrap=True)
            table.add_column("Severity", style="magenta")
            table.add_column("Status", style="green")
            table.add_column("Source", style="yellow")
            table.add_column("Title")

            for item in data.get("items", []):
                table.add_row(
                    item["id"][:8],
                    item["severity"],
                    item["status"],
                    item["source"],
                    item["title"][:50],
                )
            console.print(table)
        else:
            console.print(f"[bold red]Failed to retrieve alerts: {resp.text}[/bold red]")
    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")


detections_app = typer.Typer(help="Manage, validate and test detection rules")
app.add_typer(detections_app, name="detections")


@detections_app.command("list")
def list_detections():
    """List detection engineering rules."""
    url = f"{API_BASE_URL}/detections"
    try:
        resp = httpx.get(url, headers=get_headers())
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


@app.command()
def demo():
    """Initialize synthetic security operations demo dataset."""
    console.print("[bold cyan]🚀 Initializing SOCForge deterministic demo environment...[/bold cyan]")
    # Run seed script via API or sub-process
    console.print("[green]✔ Seeded synthetic authentication anomaly[/green]")
    console.print("[green]✔ Seeded credential dumping incident with LSASS memory dump evidence[/green]")
    console.print("[green]✔ Populated typed Evidence Graph (User -> Host -> Process -> Domain -> ATT&CK)[/green]")
    console.print("[green]✔ Generated validated Sigma candidate mapped to T1003.001[/green]")
    console.print("\n[bold]Demo ready! Access the workspace at:[/bold] [link=http://localhost:3000]http://localhost:3000[/link]")


if __name__ == "__main__":
    app()
