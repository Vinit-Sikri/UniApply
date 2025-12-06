# UniApply API Test Script
# Tests the registration endpoint

Write-Host "`n🧪 Testing UniApply API Registration...`n" -ForegroundColor Cyan

# Test data
$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Write-Host "Sending request to: http://localhost:5000/api/auth/register" -ForegroundColor Yellow
Write-Host "Body: $body`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ SUCCESS! Registration completed!" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    Write-Host "`n💡 Save the token above for authenticated requests!`n" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ ERROR occurred!`n" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "`nError Details:" -ForegroundColor Yellow
        Write-Host ($errorDetails | ConvertTo-Json -Depth 10) -ForegroundColor Red
    }
    
    Write-Host "`n💡 Common Issues:" -ForegroundColor Yellow
    Write-Host "   - Database not connected (install/start PostgreSQL)" -ForegroundColor Gray
    Write-Host "   - Email already registered (try different email)" -ForegroundColor Gray
    Write-Host "   - Server not running (run 'npm run dev' in backend)" -ForegroundColor Gray
    Write-Host ""
}

