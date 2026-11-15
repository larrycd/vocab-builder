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
$Version = '1.2.0'
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
function Start-Studio {
    $srv = Join-Path $App 'server.ps1'
    Start-Process -FilePath $PsExe -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', ('"' + $srv + '"')) -WindowStyle Hidden | Out-Null
}

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

    $ws = New-Object -ComObject WScript.Shell
    $lnk = $ws.CreateShortcut($StartupLnk)
    $lnk.TargetPath = $PsExe
    $lnk.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $App 'server.ps1') + '"'
    $lnk.WindowStyle = 7
    $lnk.Description = 'Vocab Builder server (http://localhost:8773/)'
    $ico = Join-Path $App 'vocab.ico'; if (Test-Path -LiteralPath $ico) { $lnk.IconLocation = $ico }
    $lnk.Save()
    Step 'Starts automatically when you sign in'

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
