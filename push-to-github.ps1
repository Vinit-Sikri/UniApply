# PowerShell script to push code to GitHub
# Repository: https://github.com/Vinit-Sikri/UniApply

Write-Host "🚀 Starting GitHub push process..." -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Initialize git if not already initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Add remote if not exists
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host "🔗 Adding remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/Vinit-Sikri/UniApply.git
    Write-Host "✅ Remote added" -ForegroundColor Green
} else {
    Write-Host "✅ Remote already configured: $remoteExists" -ForegroundColor Green
    # Update remote URL if needed
    git remote set-url origin https://github.com/Vinit-Sikri/UniApply.git
}

# Check current branch
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Host "🌿 Creating main branch..." -ForegroundColor Yellow
    git checkout -b main
    $currentBranch = "main"
} else {
    Write-Host "✅ Current branch: $currentBranch" -ForegroundColor Green
}

# Stage all files
Write-Host "📝 Staging all files..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "Initial commit: UniApply - Unified University Application Platform

- Full-stack application with Node.js/Express.js backend
- React frontend with Tailwind CSS
- PostgreSQL database with Sequelize ORM
- AI-powered verification system (Gemini API)
- Razorpay payment integration
- Admin panel with two-level verification
- Student portal with document upload wizard
- Three-tier payment system (Free, Issue Resolution, Application Fee)"
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Cyan
}

# Push to GitHub
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin $currentBranch
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🔗 Repository: https://github.com/Vinit-Sikri/UniApply" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Push failed. You may need to:" -ForegroundColor Red
    Write-Host "   1. Set up authentication (GitHub token or SSH key)" -ForegroundColor Yellow
    Write-Host "   2. Pull first if remote has content: git pull origin main --allow-unrelated-histories" -ForegroundColor Yellow
    Write-Host "   3. Check your internet connection" -ForegroundColor Yellow
}

Write-Host "`n✨ Done!" -ForegroundColor Green

