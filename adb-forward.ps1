# ADB Port Forwarding for SportBuddy Mobile Development
# Run this script after connecting your phone via USB

$env:Path += ";$env:USERPROFILE\platform-tools"

Write-Host "🔍 Checking connected devices..." -ForegroundColor Cyan
adb devices

Write-Host "`n📱 Setting up port forwarding..." -ForegroundColor Cyan
adb reverse tcp:3000 tcp:3000
adb reverse tcp:3001 tcp:3001

Write-Host "`n✅ Port forwarding set up successfully!" -ForegroundColor Green
Write-Host "📱 Open Chrome on your phone and navigate to: localhost:3000" -ForegroundColor Yellow
