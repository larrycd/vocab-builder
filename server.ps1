#requires -version 5.1
<#
  Vocab Builder - local web server (Windows PowerShell 5.1)
  by Larry Dalton
  Serves the studio from the 'app' folder next to this script at http://localhost:8773/
  Your progress and the words you add are kept in Documents\vocab-builder\progress.json,
  with one dated backup a day in Documents\vocab-builder\backups (the last 30 are kept).
#>
param(
    [int]$Port = 8773,
    [string]$Root = '',
    [switch]$Open,
    [string]$DataDir = ''
)
$ErrorActionPreference = 'Stop'
$Version = '1.2.0'
if (-not $Root) { $Root = Join-Path $PSScriptRoot 'app' }
$Root = [System.IO.Path]::GetFullPath($Root)
if (-not (Test-Path -LiteralPath (Join-Path $Root 'index.html'))) { throw "Vocab Builder files not found in $Root" }
if (-not $DataDir) {
    $docs = [Environment]::GetFolderPath('MyDocuments')
    if (-not $docs -and $env:USERPROFILE) { $docs = Join-Path $env:USERPROFILE 'Documents' }
    if (-not $docs) { $docs = $PSScriptRoot }
    $DataDir = Join-Path $docs 'vocab-builder'
}
$ProgressFile = Join-Path $DataDir 'progress.json'

$Mime = @{
    '.html' = 'text/html; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.ico' = 'image/x-icon'; '.ttf' = 'font/ttf'; '.txt' = 'text/plain; charset=utf-8'
}
function Send-Bytes {
    param($Response, [byte[]]$Bytes, [string]$Type, [int]$Status = 200)
    $Response.StatusCode = $Status
    $Response.ContentType = $Type
    $Response.Headers['Cache-Control'] = 'no-cache'
    $Response.Headers['X-Content-Type-Options'] = 'nosniff'
    $Response.ContentLength64 = $Bytes.Length
    if ($Bytes.Length -gt 0) { $Response.OutputStream.Write($Bytes, 0, $Bytes.Length) }
}
function Send-Text {
    param($Response, [string]$Text, [string]$Type = 'text/plain; charset=utf-8', [int]$Status = 200)
    Send-Bytes -Response $Response -Bytes ([System.Text.Encoding]::UTF8.GetBytes($Text)) -Type $Type -Status $Status
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() }
catch { Write-Error "Vocab Builder could not listen on port $Port. Another program may be using it. ($($_.Exception.Message))"; exit 2 }
Write-Host "Vocab Builder $Version is running at http://localhost:$Port/  (Ctrl+C to stop)"
if ($Open) { Start-Process "http://localhost:$Port/" }

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $req = $ctx.Request; $res = $ctx.Response
        try {
            $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
            if ($path -eq '/api/health') {
                Send-Text $res ('{"name":"Vocab Builder","version":"' + $Version + '","author":"Larry Dalton","port":' + $Port + '}') 'application/json; charset=utf-8'; continue
            }
            if ($path -eq '/api/progress' -and $req.HttpMethod -eq 'GET') {
                if (Test-Path -LiteralPath $ProgressFile -PathType Leaf) { Send-Bytes $res ([System.IO.File]::ReadAllBytes($ProgressFile)) 'application/json; charset=utf-8' }
                else { Send-Text $res '{}' 'application/json; charset=utf-8' }
                continue
            }
            if ($path -eq '/api/progress' -and $req.HttpMethod -eq 'POST') {
                # Only this page can save: the custom header makes browsers refuse the request from any other site,
                # and the Origin (when sent) must be this studio.
                $origin = $req.Headers['Origin']
                if ($req.Headers['X-VB-Save'] -ne '1' -or ($origin -and $origin -ne "http://localhost:$Port")) { Send-Text $res 'Forbidden' -Status 403; continue }
                if ($req.ContentLength64 -gt 50MB) { Send-Text $res 'Too large' -Status 413; continue }
                $sr = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8); $body = $sr.ReadToEnd(); $sr.Close()
                $head = if ($body.Length -gt 300) { $body.Substring(0, 300) } else { $body }
                if ($head -notmatch '^\s*\{\s*"app"\s*:\s*"Vocab Builder"' -or $body.TrimEnd() -notmatch '\}$') { Send-Text $res 'Not a Vocab Builder progress file' -Status 400; continue }
                if (-not (Test-Path -LiteralPath $DataDir)) { New-Item -ItemType Directory -Path $DataDir -Force | Out-Null }
                $bdir = Join-Path $DataDir 'backups'
                if (Test-Path -LiteralPath $ProgressFile -PathType Leaf) {
                    if (-not (Test-Path -LiteralPath $bdir)) { New-Item -ItemType Directory -Path $bdir | Out-Null }
                    $daily = Join-Path $bdir ('progress-' + (Get-Date -Format 'yyyy-MM-dd') + '.json')
                    if (-not (Test-Path -LiteralPath $daily)) {
                        Copy-Item -LiteralPath $ProgressFile -Destination $daily -Force
                        Get-ChildItem -LiteralPath $bdir -Filter 'progress-*.json' -File | Sort-Object Name -Descending | Select-Object -Skip 30 | Remove-Item -Force -ErrorAction SilentlyContinue
                    }
                }
                $tmp = $ProgressFile + '.saving'
                [System.IO.File]::WriteAllText($tmp, $body, (New-Object System.Text.UTF8Encoding($false)))
                [System.IO.File]::Copy($tmp, $ProgressFile, $true); Remove-Item -LiteralPath $tmp -Force
                Send-Text $res '{"saved":true}' 'application/json; charset=utf-8'; continue
            }
            if ($req.HttpMethod -ne 'GET' -and $req.HttpMethod -ne 'HEAD') { Send-Text $res 'Method not allowed' -Status 405; continue }
            if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
            $rel = $path.TrimStart('/').Replace('/', '\')
            if ($rel -match '(^|\\)\.\.(\\|$)' -or $rel -match ':') { Send-Text $res 'Not found' -Status 404; continue }
            $full = [System.IO.Path]::GetFullPath((Join-Path $Root $rel))
            if (-not $full.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $full -PathType Leaf)) {
                Send-Text $res 'Not found' -Status 404; continue
            }
            $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
            $type = $Mime[$ext]; if (-not $type) { $type = 'application/octet-stream' }
            $bytes = [System.IO.File]::ReadAllBytes($full)
            if ($req.HttpMethod -eq 'HEAD') { $res.ContentType = $type; $res.ContentLength64 = $bytes.Length; continue }
            Send-Bytes $res $bytes $type
        }
        catch {
            try { Send-Text $res ('Server error: ' + $_.Exception.Message) -Status 500 } catch { }
        }
        finally {
            try { $res.OutputStream.Close() } catch { }
        }
    }
}
finally {
    $listener.Stop(); $listener.Close()
}
