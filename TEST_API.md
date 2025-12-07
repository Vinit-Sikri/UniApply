# Testing the API - Step by Step

## ✅ Your API is Working!

The response you're seeing is **correct** - it's showing you all available endpoints.

## 🧪 Let's Test Registration

### Option 1: Using Browser (Quick Test)

Unfortunately, browsers can only do GET requests easily. For POST requests (like registration), use one of the options below.

### Option 2: Using PowerShell (Windows)

Open a **new PowerShell window** and run:

```powershell
# Test Registration
$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Option 3: Using curl (If Installed)

```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}'
```

### Option 4: Using Postman (Recommended)

1. **Download Postman**: https://www.postman.com/downloads/
2. **Create New Request**:
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/register`
   - Headers: 
     - Key: `Content-Type`
     - Value: `application/json`
   - Body (select "raw" and "JSON"):
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User"
     }
     ```
3. Click **Send**

### Option 5: Using Thunder Client (VS Code Extension)

1. Install "Thunder Client" extension in VS Code
2. Create new request
3. Set method to `POST`
4. URL: `http://localhost:5000/api/auth/register`
5. Add JSON body:
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "firstName": "Test",
     "lastName": "User"
   }
   ```
6. Click Send

## 🎯 Test Other Endpoints

### Health Check
```
http://localhost:5000/api/health
```
(Open in browser - this works!)

### List Universities
```
http://localhost:5000/api/universities
```
(Open in browser - this works!)

## 📝 Expected Responses

### Successful Registration
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "student"
  }
}
```

### Error Response (if database not connected)
```json
{
  "error": "Database error",
  "message": "Unable to connect to the database..."
}
```

## ⚠️ Important Notes

1. **Database Must Be Running**: If you get database errors, make sure PostgreSQL is installed and running (see previous setup guides)

2. **Use http:// not https://**: The server runs on HTTP in development

3. **Content-Type Header**: Always include `Content-Type: application/json` for POST/PUT requests

## 🚀 Next Steps

1. **Test Registration** using one of the methods above
2. **If successful**: You'll get a token - save it for authenticated requests
3. **If error**: Check the error message and fix accordingly
   - Database error → Install/start PostgreSQL
   - Validation error → Check your input data

## 💡 Quick Test Script

Save this as `test-api.ps1` and run it:

```powershell
# Test Registration
Write-Host "Testing Registration..." -ForegroundColor Yellow

$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ Registration Successful!" -ForegroundColor Green
    Write-Host "Token: $($response.token)" -ForegroundColor Cyan
    Write-Host "User: $($response.user.email)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
```

Run it with:
```powershell
.\test-api.ps1
```


