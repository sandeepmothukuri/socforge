# SOCForge Windows Installer & Setup Script
# Run with: powershell -ExecutionPolicy Bypass -File .\install-windows.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "          SOCForge Windows Local App Installer               " -ForegroundColor Cyan
Write-Host "  Evidence-Driven Security Operations Platform on Windows    " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Verify Python Installation
Write-Host "[1/5] Checking Python installation..." -ForegroundColor Yellow
$PythonVersion = python --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Python 3 not found in PATH. Please install Python 3.12+ from python.org" -ForegroundColor Red
    exit 1
}
Write-Host "[+] Detected $PythonVersion" -ForegroundColor Green

# 2. Verify Docker Desktop
Write-Host "[2/5] Checking Docker installation..." -ForegroundColor Yellow
$DockerVersion = docker --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Docker not detected. Please ensure Docker Desktop for Windows is installed and running." -ForegroundColor Yellow
} else {
    Write-Host "[+] Detected $DockerVersion" -ForegroundColor Green
}

# 3. Setup Environment File
Write-Host "[3/5] Checking environment configuration (.env)..." -ForegroundColor Yellow
$EnvFile = Join-Path $RepoRoot ".env"
$EnvExample = Join-Path $RepoRoot ".env.example"
if (-not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
        Copy-Item $EnvExample $EnvFile
        Write-Host "[+] Initialized .env from .env.example" -ForegroundColor Green
    } else {
        Write-Host "[!] .env.example not found; skipping copy." -ForegroundColor Yellow
    }
} else {
    Write-Host "[+] .env already exists" -ForegroundColor Green
}

# 4. Create Desktop Shortcut for SOCForge
Write-Host "[4/5] Creating Desktop Shortcut..." -ForegroundColor Yellow
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "SOCForge Operations.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "python.exe"
$Shortcut.Arguments = "`"$RepoRoot\apps\desktop\socforge_app.py`""
$Shortcut.WorkingDirectory = $RepoRoot
$Shortcut.Description = "SOCForge Security Operations Desktop Control Center"
$Shortcut.Save()
Write-Host "[+] Desktop Shortcut created: '$ShortcutPath'" -ForegroundColor Green

# 5. Create Start Menu Shortcut
$StartMenuPath = [Environment]::GetFolderPath("Programs")
$StartShortcutPath = Join-Path $StartMenuPath "SOCForge Operations.lnk"
$StartShortcut = $WScriptShell.CreateShortcut($StartShortcutPath)
$StartShortcut.TargetPath = "python.exe"
$StartShortcut.Arguments = "`"$RepoRoot\apps\desktop\socforge_app.py`""
$StartShortcut.WorkingDirectory = $RepoRoot
$StartShortcut.Description = "SOCForge Security Operations Desktop Control Center"
$StartShortcut.Save()
Write-Host "[+] Start Menu Shortcut created" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   Installation Complete! Launching SOCForge Desktop App... " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

# Launch the desktop control center
Start-Process "python" -ArgumentList "`"$RepoRoot\apps\desktop\socforge_app.py`"" -WorkingDirectory $RepoRoot
