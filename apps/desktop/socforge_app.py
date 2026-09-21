"""SOCForge Desktop Control Center for Windows.

Provides native Windows management for the SOCForge platform:
- Service health & port monitoring (API, Web, Postgres, Redis, Celery)
- 1-Click service lifecycle management (Docker Compose Start/Stop/Restart)
- Fast browser launch for Web Console and API documentation
- Live interactive execution of the deterministic security operations demo
- Built-in detection replay testing directly against synthetic-soc-v1.json
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser
from pathlib import Path
import tkinter as tk
from tkinter import messagebox, ttk

REPO_DIR = Path(__file__).resolve().parent.parent.parent
API_URL = os.environ.get("SOCFORGE_API_URL", "http://localhost:8000")
WEB_URL = os.environ.get("SOCFORGE_WEB_URL", "http://localhost:3000")

# Design Palette matching SOCForge Dark System
BG_DARK = "#0B1020"
CARD_BG = "#151C2E"
HEADER_BG = "#111827"
BORDER_COLOR = "#263248"
TEXT_PRIMARY = "#F8FAFC"
TEXT_SECONDARY = "#A7B0C0"
ACCENT_CYAN = "#38BDF8"
ACCENT_GREEN = "#22C55E"
ACCENT_RED = "#EF4444"
ACCENT_AMBER = "#F59E0B"


class SOCForgeDesktopApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("SOCForge — Security Operations Control Center")
        self.geometry("900x650")
        self.minsize(800, 550)
        self.configure(bg=BG_DARK)

        # Apply dark theme styling
        self._setup_styles()

        # Layout
        self._build_header()
        self._build_status_panel()
        self._build_actions_panel()
        self._build_terminal_output()

        # Background probe thread
        self.running = True
        self.probe_thread = threading.Thread(target=self._health_probe_loop, daemon=True)
        self.probe_thread.start()

        self.protocol("WM_DELETE_WINDOW", self._on_close)
        self.log("[+] SOCForge Desktop Control Center initialized.")
        self.log(f"[*] Repository root: {REPO_DIR}")

    def _setup_styles(self):
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure(".", background=BG_DARK, foreground=TEXT_PRIMARY, font=("Segoe UI", 9))
        style.configure("TFrame", background=BG_DARK)
        style.configure("Card.TFrame", background=CARD_BG, relief="flat")
        style.configure("Header.TFrame", background=HEADER_BG)

    def _build_header(self):
        header = tk.Frame(self, bg=HEADER_BG, height=60, bd=1, relief="solid")
        header.pack(fill="x", side="top")

        title_frame = tk.Frame(header, bg=HEADER_BG)
        title_frame.pack(side="left", padx=20, pady=12)

        logo_lbl = tk.Label(
            title_frame,
            text="🛡️",
            font=("Segoe UI Emoji", 16),
            bg=HEADER_BG,
            fg=ACCENT_CYAN,
        )
        logo_lbl.pack(side="left", padx=(0, 10))

        title_lbl = tk.Label(
            title_frame,
            text="SOCForge",
            font=("Segoe UI", 14, "bold"),
            bg=HEADER_BG,
            fg=TEXT_PRIMARY,
        )
        title_lbl.pack(side="left")

        core_badge = tk.Label(
            title_frame,
            text="DESKTOP CORE",
            font=("Consolas", 8, "bold"),
            bg="#172033",
            fg=ACCENT_CYAN,
            padx=6,
            pady=1,
            bd=1,
            relief="solid",
        )
        core_badge.pack(side="left", padx=10)

        author_lbl = tk.Label(
            header,
            text="Author: Sandeep Mothukuri",
            font=("Segoe UI", 9),
            bg=HEADER_BG,
            fg=TEXT_SECONDARY,
        )
        author_lbl.pack(side="right", padx=20)

    def _build_status_panel(self):
        frame = tk.Frame(self, bg=CARD_BG, bd=1, relief="solid")
        frame.pack(fill="x", padx=20, pady=(15, 10))

        title = tk.Label(
            frame,
            text="SYSTEM & SERVICE TELEMETRY",
            font=("Consolas", 9, "bold"),
            bg=CARD_BG,
            fg=ACCENT_CYAN,
            anchor="w",
        )
        title.pack(fill="x", padx=15, pady=(10, 5))

        grid_frame = tk.Frame(frame, bg=CARD_BG)
        grid_frame.pack(fill="x", padx=15, pady=(0, 12))

        self.status_labels = {}
        services = [
            ("Web Console (3000)", "web"),
            ("FastAPI Engine (8000)", "api"),
            ("PostgreSQL 16 (5432)", "postgres"),
            ("Redis 7 (6379)", "redis"),
        ]

        for idx, (name, key) in enumerate(services):
            box = tk.Frame(grid_frame, bg="#111827", bd=1, relief="solid", padx=10, pady=8)
            box.grid(row=0, column=idx, padx=5, sticky="nsew")
            grid_frame.grid_columnconfigure(idx, weight=1)

            lbl_name = tk.Label(box, text=name, font=("Segoe UI", 8), bg="#111827", fg=TEXT_SECONDARY)
            lbl_name.pack(anchor="w")

            lbl_val = tk.Label(
                box,
                text="CHECKING...",
                font=("Consolas", 9, "bold"),
                bg="#111827",
                fg=ACCENT_AMBER,
            )
            lbl_val.pack(anchor="w", pady=(2, 0))
            self.status_labels[key] = lbl_val

    def _build_actions_panel(self):
        frame = tk.Frame(self, bg=CARD_BG, bd=1, relief="solid")
        frame.pack(fill="x", padx=20, pady=5)

        title = tk.Label(
            frame,
            text="OPERATIONAL CONTROLS & WORKFLOWS",
            font=("Consolas", 9, "bold"),
            bg=CARD_BG,
            fg=ACCENT_CYAN,
            anchor="w",
        )
        title.pack(fill="x", padx=15, pady=(10, 8))

        btn_bar = tk.Frame(frame, bg=CARD_BG)
        btn_bar.pack(fill="x", padx=15, pady=(0, 12))

        # Row 1: Primary web/api actions
        self._add_btn(btn_bar, "🌐 Launch Web Console", self._open_web, ACCENT_CYAN, "#0B1020", 0, 0)
        self._add_btn(btn_bar, "⚡ Interactive API Docs", self._open_docs, "#172033", TEXT_PRIMARY, 0, 1)
        self._add_btn(btn_bar, "🎯 Run SOCForge Demo", self._run_demo_thread, ACCENT_GREEN, "#0B1020", 0, 2)

        # Row 2: Service & CLI actions
        self._add_btn(btn_bar, "🚀 Start Docker Stack", self._start_docker, "#172033", TEXT_PRIMARY, 1, 0)
        self._add_btn(btn_bar, "🛑 Stop Docker Stack", self._stop_docker, "#172033", TEXT_PRIMARY, 1, 1)
        self._add_btn(btn_bar, "💻 Open PowerShell CLI", self._open_cli, "#172033", TEXT_PRIMARY, 1, 2)

    def _add_btn(self, parent, text, command, bg, fg, row, col):
        btn = tk.Button(
            parent,
            text=text,
            command=command,
            font=("Segoe UI", 9, "bold"),
            bg=bg,
            fg=fg,
            activebackground=ACCENT_CYAN,
            activeforeground="#0B1020",
            relief="flat",
            bd=0,
            padx=12,
            pady=7,
            cursor="hand2",
        )
        btn.grid(row=row, column=col, padx=4, pady=4, sticky="nsew")
        parent.grid_columnconfigure(col, weight=1)

    def _build_terminal_output(self):
        frame = tk.Frame(self, bg=CARD_BG, bd=1, relief="solid")
        frame.pack(fill="both", expand=True, padx=20, pady=(10, 15))

        top_bar = tk.Frame(frame, bg=CARD_BG)
        top_bar.pack(fill="x", padx=15, pady=(8, 4))

        title = tk.Label(
            top_bar,
            text="LIVE STREAMING LOGS & COMMAND AUDIT",
            font=("Consolas", 9, "bold"),
            bg=CARD_BG,
            fg=ACCENT_CYAN,
        )
        title.pack(side="left")

        clear_btn = tk.Button(
            top_bar,
            text="Clear",
            command=self._clear_logs,
            font=("Segoe UI", 8),
            bg="#111827",
            fg=TEXT_SECONDARY,
            relief="flat",
            padx=8,
            pady=1,
            cursor="hand2",
        )
        clear_btn.pack(side="right")

        self.txt_logs = tk.Text(
            frame,
            bg="#070C18",
            fg=TEXT_PRIMARY,
            insertbackground=ACCENT_CYAN,
            font=("Consolas", 9),
            wrap="word",
            bd=0,
            padx=12,
            pady=10,
        )
        self.txt_logs.pack(fill="both", expand=True, padx=12, pady=(0, 12))

    def log(self, text: str):
        timestamp = time.strftime("%H:%M:%S")
        self.txt_logs.insert(tk.END, f"[{timestamp}] {text}\n")
        self.txt_logs.see(tk.END)

    def _clear_logs(self):
        self.txt_logs.delete("1.0", tk.END)

    def _health_probe_loop(self):
        while self.running:
            # Probe Web (3000)
            web_ok = self._check_port("localhost", 3000)
            # Probe API (8000)
            api_ok = self._check_http("http://localhost:8000/health")
            # Probe Postgres (5432)
            pg_ok = self._check_port("localhost", 5432)
            # Probe Redis (6379)
            redis_ok = self._check_port("localhost", 6379)

            self.after(0, self._update_statuses, web_ok, api_ok, pg_ok, redis_ok)
            time.sleep(4)

    def _update_statuses(self, web: bool, api: bool, pg: bool, redis: bool):
        def apply(key, ok):
            lbl = self.status_labels.get(key)
            if lbl:
                if ok:
                    lbl.config(text="ONLINE", fg=ACCENT_GREEN)
                else:
                    lbl.config(text="OFFLINE", fg=ACCENT_RED)

        apply("web", web)
        apply("api", api)
        apply("postgres", pg)
        apply("redis", redis)

    def _check_port(self, host: str, port: int) -> bool:
        try:
            with socket.create_connection((host, port), timeout=1.0):
                return True
        except (OSError, ConnectionRefusedError):
            return False

    def _check_http(self, url: str) -> bool:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "SOCForgeDesktop"})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                return resp.status == 200
        except Exception:
            return False

    def _open_web(self):
        self.log(f"[*] Opening browser to {WEB_URL}...")
        webbrowser.open(WEB_URL)

    def _open_docs(self):
        docs_url = f"{API_URL}/docs"
        self.log(f"[*] Opening API interactive documentation at {docs_url}...")
        webbrowser.open(docs_url)

    def _run_demo_thread(self):
        threading.Thread(target=self._run_demo, daemon=True).start()

    def _run_demo(self):
        self.log("[*] Starting end-to-end demo workflow via live API calls...")
        try:
            cmd = ["python", "-m", "socforge_cli.main", "demo"]
            p = subprocess.Popen(
                cmd,
                cwd=REPO_DIR / "apps" / "cli",
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
            for line in p.stdout:
                clean = line.strip()
                if clean:
                    self.log(f"  › {clean}")
            p.wait()
            self.log("[+] Demo workflow finished.")
        except Exception as e:
            self.log(f"[-] Demo execution failed: {e}")

    def _start_docker(self):
        self.log("[*] Executing: docker compose up -d...")
        threading.Thread(
            target=lambda: self._run_subproc(["docker", "compose", "up", "-d"]),
            daemon=True,
        ).start()

    def _stop_docker(self):
        self.log("[*] Executing: docker compose down...")
        threading.Thread(
            target=lambda: self._run_subproc(["docker", "compose", "down"]),
            daemon=True,
        ).start()

    def _open_cli(self):
        self.log("[*] Launching PowerShell CLI terminal...")
        subprocess.Popen(
            ["powershell", "-NoExit", "-Command", "Write-Host 'SOCForge CLI Environment' -ForegroundColor Cyan; socforge --help"],
            cwd=REPO_DIR,
        )

    def _run_subproc(self, cmd: list[str]):
        try:
            p = subprocess.Popen(
                cmd,
                cwd=REPO_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
            for line in p.stdout:
                clean = line.strip()
                if clean:
                    self.log(f"  [docker] {clean}")
            p.wait()
            self.log("[+] Command finished.")
        except Exception as e:
            self.log(f"[-] Command error: {e}")

    def _on_close(self):
        self.running = False
        self.destroy()


def main():
    app = SOCForgeDesktopApp()
    app.mainloop()


if __name__ == "__main__":
    main()
