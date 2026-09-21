@echo off
setlocal
echo ===================================================
echo   SOCForge Windows Standalone Executable Builder
echo ===================================================
echo.
cd /d "%~dp0"
python scripts\build_exe.py
pause
