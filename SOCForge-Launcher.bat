@echo off
title SOCForge Desktop Launcher
echo ============================================================
echo           SOCForge Windows Local App Launcher
echo ============================================================
echo.

set REPO_DIR=%~dp0
cd /d "%REPO_DIR%"

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.12+ and try again.
    pause
    exit /b 1
)

echo [*] Starting SOCForge Desktop Control Center...
start "" python "%REPO_DIR%apps\desktop\socforge_app.py"

exit /b 0
