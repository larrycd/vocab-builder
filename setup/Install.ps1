#requires -version 5.1
<#
  Vocab Builder installer - by Larry Dalton
  Installs for the current Windows account only (no administrator rights), in %LOCALAPPDATA%\VocabBuilder.
  Your progress (Documents\vocab-builder) is never touched by installing or uninstalling.
  Steps: back up any previous version, free port 8773 only if the previous Vocab Builder holds it,
  copy the files, start the server, verify it over HTTP, add a sign-in shortcut, open Vocab Builder.
  On any failure the previous version is restored. The result is written to %TEMP%\VocabBuilder-install-result.txt.
#>
param(
    [string]$Source = '',
    [switch]$NoBrowser
)
$ErrorActionPreference = 'Stop'
$Port = 8773
$Version = '1.2.1'
$ResultFile = Join-Path $env:TEMP 'VocabBuilder-install-result.txt'
if (-not $Source) { $Source = Join-Path $PSScriptRoot 'payload' }
$App = Join-Path $env:LOCALAPPDATA 'VocabBuilder'
$Startup = [Environment]::GetFolderPath('Startup')
$StartupLnk = Join-Path $Startup 'Vocab Builder.lnk'
$PsExe = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
$Backup = $null

function Write-Result([string]$Text) { [System.IO.File]::WriteAllText($ResultFile, $Text, [System.Text.Encoding]::ASCII) }
function Step([string]$Text) { Write-Host ('  - ' + $Text) }
function Get-Url([string]$Url, [int]$TimeoutMs = 4000) {
    $rq = [System.Net.WebRequest]::Create($Url)
    $rq.Proxy = $null; $rq.Timeout = $TimeoutMs
    $rs = $rq.GetResponse()
    try {
        $ms = New-Object System.IO.MemoryStream
        $rs.GetResponseStream().CopyTo($ms)
        return , $ms.ToArray()
    } finally { $rs.Close() }
}
function Get-Text([string]$Url) { return [System.Text.Encoding]::UTF8.GetString((Get-Url $Url)) }
function Stop-Studio {
    Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match '\\VocabBuilder\\server\.ps1' -and $_.ProcessId -ne $PID } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Milliseconds 800
}
function Test-PortFree {
    try { $l = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port); $l.Start(); $l.Stop(); return $true } catch { return $false }
}
function Start-StudioDirect {
    $srv = Join-Path $App 'server.ps1'
    Start-Process -FilePath $PsExe -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', ('"' + $srv + '"')) -WindowStyle Hidden | Out-Null
}
# ---- Keep-alive (scheduled task) - by Larry Dalton ----
$KeepName = 'Vocab Builder'
$script:KeepTask = $null
function Start-Studio {
    if ($script:KeepTask -and (Test-Path -LiteralPath (Join-Path $App 'start-server.vbs'))) { try { Start-ScheduledTask -TaskName $script:KeepTask -ErrorAction Stop; return } catch { } }
    Start-StudioDirect
}
function Write-KeepVbs {
    $common = @"
Function IsUp()
  On Error Resume Next
  Dim x
  Set x = CreateObject("MSXML2.ServerXMLHTTP.6.0")
  x.setTimeouts 2000, 2000, 2000, 3000
  x.open "GET", "http://localhost:$Port/api/health", False
  x.send
  IsUp = (Err.Number = 0 And x.status = 200)
  On Error Goto 0
End Function
Sub StartServer()
  Dim sh, fso, dir
  Set sh = CreateObject("WScript.Shell")
  Set fso = CreateObject("Scripting.FileSystemObject")
  dir = fso.GetParentFolderName(WScript.ScriptFullName)
  sh.Run """" & sh.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\WindowsPowerShell\v1.0\powershell.exe"" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & dir & "\server.ps1""", 0, False
End Sub
"@
    $start = "' $KeepName`: starts the server hidden if it is not already answering on port $Port.`r`n' Run by the scheduled task '$KeepName - keep running'. By Larry Dalton.`r`nOption Explicit`r`n" + $common + "`r`nIf Not IsUp() Then StartServer`r`n"
    $open = "' $KeepName`: starts the server if needed, waits for it, then opens http://localhost:$Port/`r`n' By Larry Dalton.`r`nOption Explicit`r`n" + $common + @"

Dim i, ok
ok = IsUp()
If Not ok Then
  StartServer
  For i = 1 To 60
    WScript.Sleep 500
    If IsUp() Then ok = True: Exit For
  Next
End If
If ok Then
  CreateObject("WScript.Shell").Run "http://localhost:$Port/"
Else
  MsgBox "$KeepName did not start within 30 seconds." & vbCrLf & vbCrLf & "Please run its installer again.", vbExclamation, "$KeepName"
End If
"@
    [System.IO.File]::WriteAllText((Join-Path $App 'start-server.vbs'), $start.Replace("`r`n", "`n").Replace("`n", "`r`n"), [System.Text.Encoding]::ASCII)
    [System.IO.File]::WriteAllText((Join-Path $App 'open-studio.vbs'), $open.Replace("`r`n", "`n").Replace("`n", "`r`n"), [System.Text.Encoding]::ASCII)
}
function Register-KeepTask {
    $task = "$KeepName - keep running"
    $me = [System.Security.SecurityElement]::Escape([System.Security.Principal.WindowsIdentity]::GetCurrent().Name)
    $wscript = [System.Security.SecurityElement]::Escape((Join-Path $env:WINDIR 'System32\wscript.exe'))
    $arg = [System.Security.SecurityElement]::Escape('//B //Nologo "' + (Join-Path $App 'start-server.vbs') + '"')
    $desc = [System.Security.SecurityElement]::Escape("Keeps $KeepName running at http://localhost:$Port/ - starts it at sign-in, on unlock and every 5 minutes if it has stopped.")
    $xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo><Author>Larry Dalton</Author><Description>$desc</Description></RegistrationInfo>
  <Triggers>
    <LogonTrigger><Enabled>true</Enabled><UserId>$me</UserId></LogonTrigger>
    <SessionStateChangeTrigger><Enabled>true</Enabled><StateChange>SessionUnlock</StateChange><UserId>$me</UserId></SessionStateChangeTrigger>
    <TimeTrigger><Repetition><Interval>PT5M</Interval><StopAtDurationEnd>false</StopAtDurationEnd></Repetition><StartBoundary>2026-01-01T00:00:00</StartBoundary><Enabled>true</Enabled></TimeTrigger>
  </Triggers>
  <Principals><Principal id="Author"><UserId>$me</UserId><LogonType>InteractiveToken</LogonType><RunLevel>LeastPrivilege</RunLevel></Principal></Principals>
  <Settings><MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy><DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries><StopIfGoingOnBatteries>false</StopIfGoingOnBatteries><AllowHardTerminate>true</AllowHardTerminate><StartWhenAvailable>true</StartWhenAvailable><RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable><IdleSettings><StopOnIdleEnd>false</StopOnIdleEnd><RestartOnIdle>false</RestartOnIdle></IdleSettings><AllowStartOnDemand>true</AllowStartOnDemand><Enabled>true</Enabled><Hidden>false</Hidden><RunOnlyIfIdle>false</RunOnlyIfIdle><WakeToRun>false</WakeToRun><ExecutionTimeLimit>PT5M</ExecutionTimeLimit><Priority>7</Priority></Settings>
  <Actions Context="Author"><Exec><Command>$wscript</Command><Arguments>$arg</Arguments></Exec></Actions>
</Task>
"@
    try { Register-ScheduledTask -TaskName $task -Xml $xml -Force -ErrorAction Stop | Out-Null }
    catch {
        $tmp = Join-Path $env:TEMP ('studio-task-' + $Port + '.xml')
        [System.IO.File]::WriteAllText($tmp, $xml, [System.Text.Encoding]::Unicode)
        $out = & schtasks.exe /Create /TN $task /XML $tmp /F 2>&1
        Remove-Item $tmp -Force -ErrorAction SilentlyContinue
        if ($LASTEXITCODE -ne 0) { throw ('could not create the scheduled task: ' + ($out -join ' ')) }
    }
    [void](Get-ScheduledTask -TaskName $task -ErrorAction Stop)
    return $task
}
# ---- end keep-alive ----

Write-Host ''
Write-Host "Vocab Builder $Version installer - by Larry Dalton" -ForegroundColor Yellow
Write-Host ''
try {
    if ($PSVersionTable.PSVersion.Major -lt 5) { throw 'Windows PowerShell 5.1 or later is required.' }
    foreach ($f in @('server.ps1', 'app\index.html', 'app\app.js', 'app\icon.svg', 'app\data\en.json', 'app\data\grk.json', 'app\data\heb.json', 'app\data\la.json', 'app\data\fr.json', 'app\data\th.json', 'app\data\ob.json', 'app\data\me.json', 'app\data\oe.json', 'app\data\id.json', 'app\data\am.json', 'app\data\wk.json', 'app\data\kj.json', 'app\data\rh.json', 'app\data\ww.json', 'app\data\rt.json', 'app\data\mh.json', 'app\data\es.json', 'app\data\ru.json', 'app\data\zh.json', 'app\data\ja.json', 'app\fonts\BLHebrew.ttf', 'app\fonts\BLGreek.ttf', 'app\dict\index.json', 'app\dict\LICENSE-WordNet.txt')) {
        if (-not (Test-Path -LiteralPath (Join-Path $Source $f))) { throw "Package file missing: $f" }
    }
    Step 'Package files present'

    $hadOld = Test-Path -LiteralPath $App
    Stop-Studio
    if (-not (Test-PortFree)) { throw "Port $Port is in use by another program. Vocab Builder did not stop it and did not change the port." }
    Step "Port $Port is free"

    if ($hadOld) {
        $Backup = $App + '-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
        Move-Item -LiteralPath $App -Destination $Backup
        Step "Previous version backed up to $Backup"
    }
    New-Item -ItemType Directory -Path $App -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $Source 'server.ps1') -Destination $App -Force
    Copy-Item -LiteralPath (Join-Path $Source 'app') -Destination $App -Recurse -Force
    foreach ($f in @('Uninstall.ps1', 'vocab.ico')) { $p = Join-Path $Source $f; if (Test-Path -LiteralPath $p) { Copy-Item -LiteralPath $p -Destination $App -Force } }
    Step "Files written to $App"

    try { Write-KeepVbs; $script:KeepTask = Register-KeepTask; Step ('Scheduled task "' + $script:KeepTask + '" registered (sign-in, unlock, every 5 minutes)') }
    catch { $script:KeepTask = $null; Step ('Scheduled task not available (' + $_.Exception.Message + '); a Startup shortcut will be used instead') }
    Start-Studio
    $health = $null
    for ($i = 0; $i -lt 40 -and -not $health; $i++) {
        Start-Sleep -Milliseconds 500
        try { $health = Get-Text "http://localhost:$Port/api/health" } catch { }
    }
    if (-not $health -or $health -notmatch '"Vocab Builder"') { throw 'The server did not start (no answer from /api/health).' }
    Step 'Server started'

    $page = Get-Text "http://localhost:$Port/"
    if ($page -notmatch 'Vocab Builder') { throw 'The Vocab Builder page was not served correctly.' }
    $js = Get-Text "http://localhost:$Port/app.js"
    if ($js -notmatch 'Vocab Builder') { throw 'The program file was not served correctly.' }
    $counts = @()
    foreach ($d in @(@('en', 1200), @('grk', 4800), @('heb', 6300), @('la', 300), @('fr', 190), @('th', 220), @('ob', 290), @('me', 290), @('oe', 290), @('id', 270), @('am', 220), @('wk', 140), @('kj', 190), @('rh', 150), @('ww', 280), @('rt', 320), @('mh', 370), @('es', 190), @('ru', 190), @('zh', 150), @('ja', 150))) {
        $txt = Get-Text ("http://localhost:$Port/data/" + $d[0] + '.json')
        $n = ([regex]::Matches($txt, '"id":"')).Count
        if ($n -lt $d[1]) { throw ('Word list incomplete: ' + $d[0] + ' has ' + $n + ' words.') }
        $counts += ($d[0] + ' ' + $n)
    }
    $di = Get-Text "http://localhost:$Port/dict/index.json"
    if ($di -notmatch '"total":(\d+)' -or [int]$Matches[1] -lt 170000) { throw 'The dictionary index is missing or incomplete.' }
    $dictTotal = [int]$Matches[1]
    foreach ($c in 'abcdefghijklmnopqrstuvwxyz'.ToCharArray()) { if (-not (Test-Path -LiteralPath (Join-Path $App ('app\dict\' + $c + '.json')))) { throw "Dictionary file missing: $c.json" } }
    $da = Get-Text "http://localhost:$Port/dict/a.json"
    if ($da -notmatch '^\[\["') { throw 'The dictionary was not served correctly.' }
    foreach ($pair in @(@('fonts\BLHebrew.ttf', 'fonts/BLHebrew.ttf'), @('fonts\BLGreek.ttf', 'fonts/BLGreek.ttf'))) {
        $local = (Get-Item -LiteralPath (Join-Path $App ('app\' + $pair[0]))).Length
        $served = (Get-Url ("http://localhost:$Port/" + $pair[1]) 20000).Length
        if ($local -ne $served) { throw ('Not served correctly: ' + $pair[1]) }
    }
    $prog = Get-Text "http://localhost:$Port/api/progress"
    if ($prog -notmatch '^\s*\{') { throw 'The progress service did not answer.' }
    $bad = $false; try { Get-Url "http://localhost:$Port/..%5Cserver.ps1" | Out-Null; $bad = $true } catch { }
    if ($bad) { throw 'The server allowed access outside the Vocab Builder folder.' }
    $refused = $false
    try { $rq = [System.Net.WebRequest]::Create("http://localhost:$Port/api/progress"); $rq.Proxy = $null; $rq.Method = 'POST'; $rq.ContentType = 'application/json'; $b = [System.Text.Encoding]::UTF8.GetBytes('{"app":"Vocab Builder"}'); $rq.ContentLength = $b.Length; $s = $rq.GetRequestStream(); $s.Write($b, 0, $b.Length); $s.Close(); $rq.GetResponse().Close() } catch { $refused = $true }
    if (-not $refused) { throw 'The progress service accepted an unprotected save.' }
    Step ('Verified over HTTP: page, program, word lists (' + ($counts -join ', ') + '), dictionary (' + $dictTotal + ' entries), fonts, progress service, save protection, folder protection')

    if ($script:KeepTask) {
        if (Test-Path -LiteralPath $StartupLnk) { Remove-Item -LiteralPath $StartupLnk -Force }
        Step 'Keeps itself running: the scheduled task started the server, and starts it at sign-in, on unlock and every 5 minutes if it stops'
    } else {
        $ws = New-Object -ComObject WScript.Shell
        $lnk = $ws.CreateShortcut($StartupLnk)
        $lnk.TargetPath = $PsExe
        $lnk.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $App 'server.ps1') + '"'
        $lnk.WindowStyle = 7
        $lnk.Description = 'Vocab Builder server (http://localhost:8773/)'
        $ico = Join-Path $App 'vocab.ico'; if (Test-Path -LiteralPath $ico) { $lnk.IconLocation = $ico }
        $lnk.Save()
        Step 'Starts automatically when you sign in (Startup shortcut)'
    }

    Write-Result ("OK Vocab Builder $Version installed at http://localhost:$Port/")
    Write-Host ''
    Write-Host "Vocab Builder is installed and running at http://localhost:$Port/" -ForegroundColor Green
    if (-not $NoBrowser) { Start-Process "http://localhost:$Port/" }
    exit 0
}
catch {
    $msg = $_.Exception.Message
    Write-Host ''
    Write-Host ('Install failed: ' + $msg) -ForegroundColor Red
    try {
        Stop-Studio
        if ($Backup -and (Test-Path -LiteralPath $Backup)) {
            if (Test-Path -LiteralPath $App) { Remove-Item -LiteralPath $App -Recurse -Force }
            Move-Item -LiteralPath $Backup -Destination $App
            Start-Studio
            Write-Host 'The previous version has been restored.'
        }
    } catch { Write-Host ('Restore problem: ' + $_.Exception.Message) }
    Write-Result ('FAIL ' + ($msg -replace '[^\x20-\x7E]', '?'))
    exit 1
}
