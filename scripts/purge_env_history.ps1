<#[
  purge_env_history.ps1

  Usage: Run from the repository root (PowerShell).
  Example: .\scripts\purge_env_history.ps1 -PathsToRemove ".env" -WhatIf:$false

  This script performs a mirror clone, runs git-filter-repo to remove the specified paths
  (or uses --replace-text if `-ReplaceTextFile` is provided), and force-pushes cleaned refs.

  IMPORTANT: This rewrites git history. Coordinate with your team before running.
#>

param(
  [string]$PathsToRemove = ".env",
  [switch]$UseReplaceText,
  [string]$ReplaceTextFile = "",
  [string]$BackupDir = "..",
  [switch]$DryRun
)

function Abort($msg) {
  Write-Host $msg -ForegroundColor Red
  exit 1
}

Write-Host "Purge helper: will remove [$PathsToRemove] from git history or replace using file [$ReplaceTextFile]." -ForegroundColor Yellow

if ($UseReplaceText -and -not (Test-Path $ReplaceTextFile)) {
  Abort "ReplaceTextFile not found: $ReplaceTextFile"
}

if ($DryRun) {
  Write-Host "Dry run: showing planned actions (no destructive changes will be made)." -ForegroundColor Cyan
  Write-Host "Would run: git clone --mirror . <backup-dir>" -ForegroundColor Gray
  if ($UseReplaceText) { Write-Host "Would run: git filter-repo --replace-text $ReplaceTextFile" -ForegroundColor Gray }
  else { Write-Host "Would run: git filter-repo --invert-paths --paths $PathsToRemove" -ForegroundColor Gray }
  Write-Host "Would push: git push origin --force --all && git push origin --force --tags" -ForegroundColor Gray
  exit 0
}

$confirm = Read-Host "THIS WILL REWRITE GIT HISTORY. Type YES to continue"
if ($confirm -ne 'YES') { Abort "Aborted by user." }

# Check for git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Abort "git not found in PATH." }

# Check for git-filter-repo
$gfr = Get-Command git-filter-repo -ErrorAction SilentlyContinue
if (-not $gfr) {
  # try python -m git_filter_repo
  $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
  if (-not $pythonCmd) { Write-Host "Warning: git-filter-repo not found. Install from https://github.com/newren/git-filter-repo" -ForegroundColor Yellow }
  else { Write-Host "Note: ensure 'git-filter-repo' is available (python -m git_filter_repo)" -ForegroundColor Yellow }
}

$timestamp = Get-Date -Format yyyyMMddHHmmss
$mirrorDir = Join-Path -Path $BackupDir -ChildPath "repo-backup-$timestamp.git"

Write-Host "Creating mirror clone at: $mirrorDir" -ForegroundColor Cyan
git clone --mirror . $mirrorDir
if ($LASTEXITCODE -ne 0) { Abort "Mirror clone failed." }

Push-Location $mirrorDir
try {
  if ($UseReplaceText) {
    if (-not (Test-Path $ReplaceTextFile)) { Abort "Replace text file not found: $ReplaceTextFile" }
    Write-Host "Running: git filter-repo --replace-text $ReplaceTextFile" -ForegroundColor Cyan
    git filter-repo --replace-text $ReplaceTextFile
  } else {
    Write-Host "Running: git filter-repo --invert-paths --paths $PathsToRemove" -ForegroundColor Cyan
    git filter-repo --invert-paths --paths $PathsToRemove
  }

  if ($LASTEXITCODE -ne 0) { Abort "git-filter-repo failed." }

  Write-Host "Filter complete. Forcing push to origin (all refs and tags)." -ForegroundColor Yellow
  git push origin --force --all
  if ($LASTEXITCODE -ne 0) { Abort "Failed to push branches." }
  git push origin --force --tags
  if ($LASTEXITCODE -ne 0) { Abort "Failed to push tags." }

  Write-Host "Success. Mirror backup is at: $mirrorDir" -ForegroundColor Green
  Write-Host "Instruct collaborators to reclone the repository (history rewritten)." -ForegroundColor Yellow
} finally {
  Pop-Location
}
