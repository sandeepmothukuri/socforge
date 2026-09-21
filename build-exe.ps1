# SOCForge Windows Executable Build Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   SOCForge Windows Standalone Executable Builder   " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

python scripts\build_exe.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "[+] Executables built successfully in dist/!" -ForegroundColor Green
} else {
    Write-Host "[!] Build encountered an error." -ForegroundColor Red
}
