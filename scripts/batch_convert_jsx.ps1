# Batch convert .js files containing JSX to .jsx
$tmp = Join-Path $PSScriptRoot '..\tmp_jsx_files.txt'
if (-Not (Test-Path $tmp)) {
  Write-Host "tmp_jsx_files.txt not found at $tmp; trying project root path"
  $tmp = Join-Path $PSScriptRoot '..\..\tmp_jsx_files.txt'
}
if (-Not (Test-Path $tmp)) {
  Write-Error "tmp_jsx_files.txt not found. Aborting."
  exit 1
}
$files = Get-Content $tmp | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
foreach ($f in $files) {
  $new = $f -replace '\.js$','.jsx'
  Write-Host "Converting: $f -> $new"
  Copy-Item -Path $f -Destination $new -Force
  Remove-Item $f -Force
}
Write-Host 'Batch conversion complete.'
