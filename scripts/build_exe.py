"""Automated PyInstaller compilation for SOCForge Windows executables.

Builds:
1. dist/SOCForge-Operations.exe (Control Center GUI)
2. dist/SOCForge-Window.exe (Native WebView2 Desktop Window)
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = REPO_ROOT / "dist"
BUILD_DIR = REPO_ROOT / "build"


def build_app(entry_point: Path, name: str, console: bool = False) -> bool:
    print(f"\n========================================================")
    print(f"[*] Building {name} from {entry_point.name}...")
    print(f"========================================================")

    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--onefile",
        "--clean",
        "--name",
        name,
        "--distpath",
        str(DIST_DIR),
        "--workpath",
        str(BUILD_DIR),
        "--specpath",
        str(BUILD_DIR),
    ]

    if not console:
        cmd.append("--noconsole")

    cmd.append(str(entry_point))

    result = subprocess.run(cmd, cwd=str(REPO_ROOT))
    if result.returncode != 0:
        print(f"[!] Build failed for {name} with code {result.returncode}")
        return False

    exe_path = DIST_DIR / f"{name}.exe"
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print(f"[+] Successfully built: {exe_path} ({size_mb:.2f} MB)")
        root_exe = REPO_ROOT / f"{name}.exe"
        try:
            shutil.copy2(exe_path, root_exe)
            print(f"[+] Copied executable to repository root: {root_exe}")
        except Exception as e:
            print(f"[*] Note: Executable ready in dist/: {exe_path}")
        return True
    return False


def main():
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    BUILD_DIR.mkdir(parents=True, exist_ok=True)

    ops_script = REPO_ROOT / "apps" / "desktop" / "socforge_app.py"
    window_script = REPO_ROOT / "apps" / "desktop" / "socforge_desktop_window.py"

    success_ops = build_app(ops_script, "SOCForge-Operations")
    success_win = build_app(window_script, "SOCForge-Window")

    if success_ops or success_win:
        print("\n[+] Build process complete! Executables available in dist/ directory.")
    else:
        print("\n[!] Compilation encountered issues. Check logs above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
