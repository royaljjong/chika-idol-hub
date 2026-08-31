[CmdletBinding()]
param(
    [switch] $Offline,
    [switch] $NoPause
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[Console]::InputEncoding = $utf8NoBom
[Console]::OutputEncoding = $utf8NoBom
$OutputEncoding = $utf8NoBom
$repoRoot = Split-Path -Parent $PSScriptRoot
$dailyScript = Join-Path $repoRoot 'scripts\daily-update.ts'
$tsxCli = Join-Path $repoRoot 'node_modules\tsx\dist\cli.mjs'
$reportDir = Join-Path $repoRoot '.tmp\daily-update'
$latestReport = Join-Path $reportDir 'latest-report.json'
$launcherLogDir = Join-Path $reportDir 'launcher'
$startedAt = [DateTimeOffset]::Now
$stamp = $startedAt.ToString('yyyyMMdd-HHmmss')
$logPath = Join-Path $launcherLogDir "$stamp.log"
$exitCode = 1

function Wait-ForUser {
    if (-not $NoPause) {
        Write-Host ''
        Read-Host 'Press Enter to close'
    }
}

try {
    Write-Host 'Chika Idol Box daily update'
    Write-Host "Repository: $repoRoot"
    Write-Host 'Official schedules are written only to the candidate queue.'
    Write-Host ''

    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json') -PathType Leaf)) {
        throw "Repository package.json not found: $repoRoot"
    }
    if (-not (Test-Path -LiteralPath $tsxCli -PathType Leaf)) {
        throw "tsx CLI not found. Restore project dependencies first: $tsxCli"
    }
    if (-not (Test-Path -LiteralPath $dailyScript -PathType Leaf)) {
        throw "Daily update script not found: $dailyScript"
    }

    $nodeCommand = Get-Command node -CommandType Application -ErrorAction Stop
    New-Item -ItemType Directory -Force -Path $launcherLogDir | Out-Null

    $dailyArgs = @($tsxCli, $dailyScript)
    if ($Offline) {
        $dailyArgs += '--skip-network'
    } else {
        $dailyArgs += '--write'
    }

    Write-Host "Mode: $(if ($Offline) { 'offline verification' } else { 'write candidates' })"
    Write-Host "Log: $logPath"
    Write-Host ''

    & $nodeCommand.Source @dailyArgs 2>&1 | ForEach-Object {
        $line = $_.ToString()
        Write-Host $line
        Add-Content -LiteralPath $logPath -Value $line -Encoding utf8
    }
    $childExitCode = $LASTEXITCODE
    if ($childExitCode -ne 0) {
        throw "Daily update returned exit code $childExitCode. See $logPath"
    }

    if (-not (Test-Path -LiteralPath $latestReport -PathType Leaf)) {
        throw "Latest report was not created: $latestReport"
    }
    $reportItem = Get-Item -LiteralPath $latestReport
    if ($reportItem.LastWriteTimeUtc -lt $startedAt.UtcDateTime.AddSeconds(-2)) {
        throw "Latest report is stale and was not refreshed by this run: $latestReport"
    }

    try {
        $report = Get-Content -Raw -Encoding utf8 -LiteralPath $latestReport | ConvertFrom-Json
    } catch {
        throw "Latest report is not valid JSON: $latestReport. $($_.Exception.Message)"
    }
    if ($report.success -ne $true) {
        throw "Latest report indicates PARTIAL/FAIL: $latestReport"
    }

    Write-Host ''
    Write-Host '[SUCCESS] Daily update completed and the latest report is valid.' -ForegroundColor Green
    Write-Host "Report: $latestReport"
    Write-Host "Dated report: $(Join-Path $reportDir ($report.japanDate + '.md'))"
    Write-Host "Candidates: $($report.candidates.total); review pending: $($report.candidates.reviewPending); published links: $($report.candidates.published)"
    Write-Host "Upcoming birthdays: $($report.birthdaysNext30Days.Count); missing birthdays: $($report.missingBirthDates.Count)"
    $exitCode = 0
} catch {
    $message = $_.Exception.Message
    Write-Host ''
    Write-Host "[FAILED] $message" -ForegroundColor Red
    if (Test-Path -LiteralPath $launcherLogDir) {
        New-Item -ItemType Directory -Force -Path $launcherLogDir | Out-Null
        Add-Content -LiteralPath $logPath -Value "`n[LAUNCHER FAILED] $message" -Encoding utf8
        Write-Host "Log: $logPath"
    }
    $exitCode = 1
} finally {
    Wait-ForUser
}

exit $exitCode
