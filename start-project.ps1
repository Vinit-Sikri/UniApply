# UniApply Platform Startup Script
# Starts both backend and frontend servers

Write-Host "`n🚀 Starting UniApply Platform...`n" -ForegroundColor Cyan

# Check if backend is running
$backendRunning = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($backendRunning) {
    Write-Host "✅ Backend is already running on port 5000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend is not running" -ForegroundColor Yellow
    Write-Host "   Please start backend in a separate terminal:" -ForegroundColor Gray
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   npm run dev`n" -ForegroundColor Gray
}

# Check if frontend is running
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($frontendRunning) {
    Write-Host "✅ Frontend is already running on port 3000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend is not running" -ForegroundColor Yellow
    Write-Host "   Starting frontend...`n" -ForegroundColor Gray
    
    Set-Location "frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    Set-Location ..
    
    Write-Host "   Frontend server starting in new window...`n" -ForegroundColor Gray
}

Write-Host "📝 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5000/api`n" -ForegroundColor White

Write-Host "💡 If servers are not running, start them manually:" -ForegroundColor Yellow
Write-Host "   Terminal 1 (Backend): cd backend && npm run dev" -ForegroundColor Gray
Write-Host "   Terminal 2 (Frontend): cd frontend && npm run dev`n" -ForegroundColor Gray

Write-Host "Press any key to open the application in browser..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:3000"

