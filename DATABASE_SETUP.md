# Database Setup Guide

## 🔴 Current Issue

The application crashed because **PostgreSQL is not installed** on your system.

## ✅ What I've Fixed

1. ✅ Created `.env` file in `backend/` directory
2. ✅ Improved error messages in the server
3. ✅ Added helpful troubleshooting information

## 📋 Next Steps: Install PostgreSQL

### Option 1: Install PostgreSQL (Recommended)

#### Step 1: Download PostgreSQL

1. Visit: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download PostgreSQL 15 or 16 (latest stable version)
4. Run the installer

#### Step 2: Installation Settings

During installation:
- **Installation Directory**: Use default (usually `C:\Program Files\PostgreSQL\XX`)
- **Data Directory**: Use default
- **Password**: **IMPORTANT** - Remember this password! You'll need it for the `.env` file
- **Port**: Use default (5432)
- **Locale**: Use default

#### Step 3: Complete Installation

- Let the installer complete
- **Uncheck** "Stack Builder" when prompted (not needed)

#### Step 4: Update .env File

Edit `backend/.env` and update:
```env
DB_PASSWORD=your_postgres_password_here
```

Replace `your_postgres_password_here` with the password you set during installation.

#### Step 5: Create Database

Open **Command Prompt** or **PowerShell** as Administrator and run:

```powershell
# Navigate to PostgreSQL bin directory (adjust version number)
cd "C:\Program Files\PostgreSQL\15\bin"

# Create database
.\createdb.exe -U postgres uniapply_db

# You'll be prompted for password - enter your PostgreSQL password
```

**OR** use pgAdmin (GUI tool installed with PostgreSQL):
1. Open pgAdmin 4
2. Connect to PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `uniapply_db`
5. Click "Save"

#### Step 6: Start the Server

```powershell
cd C:\Users\hp\Desktop\hero\vinit\backend
npm run dev
```

### Option 2: Using Chocolatey (If Installed)

If you have Chocolatey package manager:

```powershell
# Install PostgreSQL
choco install postgresql

# Start service
net start postgresql-x64-15

# Create database (after setting password)
createdb -U postgres uniapply_db
```

### Option 3: Using Docker (Advanced)

If you have Docker installed:

```powershell
# Run PostgreSQL in Docker
docker run --name uniapply-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=uniapply_db -p 5432:5432 -d postgres:15

# Update .env
DB_PASSWORD=postgres
```

## 🔍 Verify Installation

After installing PostgreSQL, verify it's working:

```powershell
# Check if service is running
Get-Service -Name postgresql*

# Test connection (if psql is in PATH)
psql -U postgres -c "SELECT version();"
```

## 🚀 Quick Start After Installation

1. **Start PostgreSQL service** (if not auto-started):
   ```powershell
   net start postgresql-x64-15
   ```
   (Replace 15 with your version number)

2. **Create database**:
   ```powershell
   createdb -U postgres uniapply_db
   ```

3. **Update `.env` file** with your PostgreSQL password

4. **Start the backend**:
   ```powershell
   cd backend
   npm run dev
   ```

## ⚠️ Common Issues

### Issue: "Service not found"
- PostgreSQL might not be installed
- Service name might be different
- Check Services app (Win+R → services.msc)

### Issue: "Password authentication failed"
- Check `.env` file has correct `DB_PASSWORD`
- Try resetting PostgreSQL password

### Issue: "Database does not exist"
- Run: `createdb -U postgres uniapply_db`
- Or create via pgAdmin

## 📞 Need Help?

If you encounter issues:
1. Check `TROUBLESHOOTING.md` for detailed solutions
2. Verify PostgreSQL service is running
3. Check `.env` file has correct credentials
4. Ensure database `uniapply_db` exists

## ✅ Success Indicators

When everything is set up correctly, you should see:
```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server running on port 5000
```

