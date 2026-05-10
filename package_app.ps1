# LK Smart Wash - Packaging Script (Source Code Bundle) 📦🌪️

$currentDir = Get-Location
$zipPath = "$HOME\Desktop\LK_SMART_WASH_SRC_V1.zip"

Write-Host "🚧 Initializing LK Smart Wash Packaging..." -ForegroundColor Cyan

# Cleanup existing zip if it exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath
}

# Create a temporary directory for zipping
$tmpDir = New-Item -ItemType Directory -Path "$currentDir\package_tmp" -Force

# Copy Backend (Exclude node_modules)
Write-Host "📦 Bundling Backend..." -ForegroundColor Yellow
$backendFiles = Get-ChildItem -Path "backend" -Exclude "node_modules"
foreach ($file in $backendFiles) {
    Copy-Item -Path "backend\$($file.Name)" -Destination "$tmpDir\backend" -Recurse -Force
}

# Copy Frontend (Exclude node_modules)
Write-Host "📦 Bundling Frontend..." -ForegroundColor Yellow
$frontendFiles = Get-ChildItem -Path "frontend" -Exclude "node_modules"
foreach ($file in $frontendFiles) {
    Copy-Item -Path "frontend\$($file.Name)" -Destination "$tmpDir\frontend" -Recurse -Force
}

# Copy Root Manuals
Write-Host "📖 Adding User Manuals..." -ForegroundColor Green
Copy-Item "USER_MANUAL.md" -Destination "$tmpDir"
Copy-Item "README.md" -Destination "$tmpDir"

# Zip the package
Write-Host "🌪️ Compressing Archive..." -ForegroundColor Magenta
Compress-Archive -Path "$tmpDir\*" -DestinationPath $zipPath -Force

# Cleanup temp dir
Remove-Item $tmpDir -Recurse -Force

Write-Host "✨ SUCCESS! Your application is ready for download." -ForegroundColor Green
Write-Host "📍 Location: $zipPath" -ForegroundColor White
Write-Host "🌪️ Tornado Scaling Phase 8 Complete." -ForegroundColor Yellow
