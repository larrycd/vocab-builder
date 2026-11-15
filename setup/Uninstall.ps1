# Vocab Builder - uninstall helper (run by the Windows uninstaller)
$ErrorActionPreference = 'SilentlyContinue'
try { Unregister-ScheduledTask -TaskName 'Vocab Builder - keep running' -Confirm:$false -ErrorAction Stop } catch { schtasks.exe /Delete /TN 'Vocab Builder - keep running' /F 2>$null | Out-Null }
Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" |
    Where-Object { $_.CommandLine -match '\\VocabBuilder\\server\.ps1' -and $_.ProcessId -ne $PID } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Start-Sleep -Seconds 1
$app = Join-Path $env:LOCALAPPDATA 'VocabBuilder'
if (Test-Path $app) { Remove-Item $app -Recurse -Force }
$lnk = Join-Path ([Environment]::GetFolderPath('Startup')) 'Vocab Builder.lnk'
if (Test-Path $lnk) { Remove-Item $lnk -Force }
# Your progress in Documents\vocab-builder is left in place.
