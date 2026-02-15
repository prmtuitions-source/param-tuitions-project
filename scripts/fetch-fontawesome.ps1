param(
    [string]$version = "6.5.0"
)

$zipUrl = "https://github.com/FortAwesome/Font-Awesome/releases/download/$version/fontawesome-free-$version-web.zip"
$dest = Join-Path -Path (Get-Location) -ChildPath "public/vendor/fontawesome"
$tmp = Join-Path -Path $env:TEMP -ChildPath "fontawesome-$version.zip"

Write-Output "Creating destination: $dest"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Write-Output "Downloading Font Awesome $version from $zipUrl ..."
Invoke-WebRequest -Uri $zipUrl -OutFile $tmp -UseBasicParsing

Write-Output "Extracting to $dest ..."
Expand-Archive -LiteralPath $tmp -DestinationPath $dest -Force

# The ZIP extracts into a subfolder like fontawesome-free-6.5.0-web
$extracted = Join-Path -Path $dest -ChildPath "fontawesome-free-$version-web"
if (Test-Path $extracted) {
    Get-ChildItem -Path $extracted | ForEach-Object { Move-Item -Path $_.FullName -Destination $dest -Force }
    Remove-Item -Path $extracted -Recurse -Force
}

Remove-Item -Path $tmp -Force

Write-Output "Font Awesome $version installed to $dest"
Write-Output "Update /index.html to reference /vendor/fontawesome/css/all.min.css (already commented)."
