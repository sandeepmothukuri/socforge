"""SOCForge Native Desktop Window (Microsoft Edge WebView2).

Embeds the full SOCForge Next.js Web Console into a dedicated Windows application window
using Microsoft Edge WebView2, with automatic service health probing, cyber splash loader,
and native desktop communication.
"""

from __future__ import annotations

import os
import sys
import threading
import time
import urllib.request
import webbrowser
from pathlib import Path
import webview

WEB_URL = os.environ.get("SOCFORGE_WEB_URL", "http://localhost:3000")
API_URL = os.environ.get("SOCFORGE_API_URL", "http://localhost:8000")

SPLASH_HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SOCForge — Initializing Security Console</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #030712;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
      user-select: none;
    }}
    .shield-container {{
      position: relative;
      width: 96px;
      height: 96px;
      margin-bottom: 24px;
    }}
    .pulse-ring {{
      position: absolute;
      inset: -12px;
      border-radius: 50%;
      border: 2px solid rgba(56, 189, 248, 0.4);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }}
    @keyframes pulse {{
      0%, 100% {{ transform: scale(0.95); opacity: 0.3; }}
      50% {{ transform: scale(1.15); opacity: 0.8; }}
    }}
    .shield-icon {{
      width: 96px;
      height: 96px;
      filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.5));
    }}
    h1 {{
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .accent {{
      color: #38BDF8;
    }}
    .badge {{
      font-size: 11px;
      font-weight: 600;
      background: rgba(56, 189, 248, 0.15);
      color: #38BDF8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 2px 8px;
      border-radius: 9999px;
      letter-spacing: 0.05em;
    }}
    p.status {{
      color: #94A3B8;
      font-size: 14px;
      margin: 0 0 32px 0;
    }}
    .progress-bar {{
      width: 280px;
      height: 4px;
      background: #1F2937;
      border-radius: 9999px;
      overflow: hidden;
      position: relative;
    }}
    .progress-fill {{
      height: 100%;
      background: linear-gradient(90deg, #38BDF8, #06B6D4);
      width: 40%;
      border-radius: 9999px;
      animation: indeterminate 1.5s infinite ease-in-out;
    }}
    @keyframes indeterminate {{
      0% {{ transform: translateX(-100%); width: 30%; }}
      50% {{ transform: translateX(100%); width: 60%; }}
      100% {{ transform: translateX(300%); width: 30%; }}
    }}
    .footer {{
      position: absolute;
      bottom: 24px;
      font-size: 12px;
      color: #64748B;
      font-family: monospace;
    }}
  </style>
</head>
<body>
  <div class="shield-container">
    <div class="pulse-ring"></div>
    <svg class="shield-icon" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 3L4 8V17C4 24.5 9.9 31.4 18 33C26.1 31.4 32 24.5 32 17V8L18 3Z" fill="#0B1528" stroke="#38BDF8" stroke-width="2" />
      <path d="M18 7L8 11V17C8 22.8 12.3 28.1 18 29.5C23.7 28.1 28 22.8 28 17V11L18 7Z" fill="#0F2038" stroke="#0284C7" stroke-width="1.2" />
      <path d="M18 12L23 20H13L18 12Z" fill="#38BDF8" opacity="0.9" />
    </svg>
  </div>

  <h1>SOCForge <span class="badge">NATIVE DESKTOP</span></h1>
  <p class="status" id="status-text">Connecting to Security Console at {WEB_URL}...</p>

  <div class="progress-bar">
    <div class="progress-fill"></div>
  </div>

  <div class="footer">Target: {WEB_URL} • API: {API_URL}</div>

  <script>
    function updateStatus(msg) {{
      var el = document.getElementById("status-text");
      if (el) el.innerText = msg;
    }}
  </script>
</body>
</html>
"""


class DesktopApi:
    """Python API exposed to the JavaScript context inside WebView2."""

    def __init__(self, window: webview.Window):
        self.window = window

    def get_system_status(self) -> dict:
        api_ok = False
        try:
            with urllib.request.urlopen(f"{API_URL}/health", timeout=1.5) as resp:
                api_ok = resp.status == 200
        except Exception:
            pass

        return {
            "api_url": API_URL,
            "web_url": WEB_URL,
            "api_online": api_ok,
            "platform": "windows-native-webview2",
        }


def check_web_available() -> bool:
    try:
        req = urllib.request.Request(WEB_URL, headers={"User-Agent": "SOCForge-Desktop/1.0"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            return resp.status in (200, 304, 307, 308)
    except Exception:
        return False


def wait_and_load(window: webview.Window):
    max_retries = 60
    for i in range(max_retries):
        if check_web_available():
            time.sleep(0.3)
            window.load_url(WEB_URL)
            return
        try:
            window.evaluate_js(f"updateStatus('Waiting for SOCForge containers to be ready... ({i + 1}s)')")
        except Exception:
            pass
        time.sleep(1.0)

    try:
        window.evaluate_js("updateStatus('Could not reach Web Console. Please check Docker containers.')")
    except Exception:
        pass


def main():
    if check_web_available():
        start_url = WEB_URL
        splash = False
    else:
        start_url = None
        splash = True

    window = webview.create_window(
        title="SOCForge — Security Operations Console",
        url=start_url if not splash else None,
        html=SPLASH_HTML if splash else None,
        width=1440,
        height=900,
        min_size=(1024, 680),
        background_color="#030712",
        text_select=True,
    )
    window.expose(DesktopApi(window))

    if splash:
        t = threading.Thread(target=wait_and_load, args=(window,), daemon=True)
        t.start()

    webview.start(gui="edgechromium")


if __name__ == "__main__":
    main()
