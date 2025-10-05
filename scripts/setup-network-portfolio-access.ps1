# Setup Network Portfolio Access
# Run as Administrator

Write-Host "🔧 Setting up network access to portfolio folders..." -ForegroundColor Green

# Share the portfolio folder for network access
$portfolioPath = "C:\Users\wolft\Desktop\McCal's Dev Website\McCals-Website\src\images\Portfolios"
$shareName = "McCal-Portfolios"

try {
    # Create network share
    New-SmbShare -Name $shareName -Path $portfolioPath -FullAccess "Everyone" -ErrorAction SilentlyContinue
    Write-Host "✅ Created network share: \\$env:COMPUTERNAME\$shareName" -ForegroundColor Green
    
    # Get network info
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*"}).IPAddress[0]
    Write-Host "📱 Access from phone/tablet:" -ForegroundColor Yellow
    Write-Host "   \\$ip\$shareName" -ForegroundColor Cyan
    Write-Host "   \\$env:COMPUTERNAME\$shareName" -ForegroundColor Cyan
    
    Write-Host "`n📂 Folder structure:" -ForegroundColor Yellow
    Write-Host "   Concert/[Band Name]/[Month Year]/" -ForegroundColor Cyan
    Write-Host "   Events/[Event Name]/[Date]/" -ForegroundColor Cyan
    Write-Host "   Journalism/[Article]/[Date]/" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Run as Administrator to create network shares" -ForegroundColor Yellow
}

Write-Host "`n🔄 Next: Start auto-manifest watcher with 'npm run watch:auto-manifest'" -ForegroundColor Green