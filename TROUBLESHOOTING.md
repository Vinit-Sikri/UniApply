# Troubleshooting Guide

## Common Errors and Solutions

### 1. Database Connection Error (ECONNREFUSED)

**Error Message:**
```
ConnectionRefusedError [SequelizeConnectionRefusedError]
ECONNREFUSED
```

**Causes:**
- PostgreSQL service is not running
- Database doesn't exist
- Wrong database credentials
- PostgreSQL not installed

**Solutions:**

#### A. Check if PostgreSQL is installed and running

**Windows:**
```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# Start PostgreSQL service (replace XX with your version)
net start postgresql-x64-14
# or
net start postgresql-x64-15
```

**Alternative - Check in Services:**
1. Press `Win + R`, type `services.msc`
2. Look for "postgresql" service
3. Right-click and select "Start"

#### B. Create the database

```powershell
# Using psql (if in PATH)
psql -U postgres
CREATE DATABASE uniapply_db;
\q

# Or using createdb command
createdb -U postgres uniapply_db
```

#### C. Create/Update .env file

Run the setup script:
```powershell
cd backend
npm run create-env
```

Then edit `.env` file and update:
- `DB_PASSWORD` - Your PostgreSQL password
- `DB_USER` - Usually `postgres` or your PostgreSQL username

#### D. Install PostgreSQL (if not installed)

**Option 1: Download from official site**
- Visit: https://www.postgresql.org/download/windows/
- Download and install PostgreSQL
- Remember the password you set during installation

**Option 2: Using Chocolatey (if installed)**
```powershell
choco install postgresql
```

### 2. Missing .env File Error

**Solution:**
```powershell
cd backend
npm run create-env
```

Then edit the `.env` file with your actual database credentials.

### 3. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

**Option 1: Change the port**
Edit `backend/.env`:
```env
PORT=5001
```

**Option 2: Kill the process using the port**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### 4. Module Not Found Errors

**Error:**
```
Cannot find module 'xxx'
```

**Solution:**
```powershell
# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

### 5. Permission Denied Errors

**Error:**
```
EACCES: permission denied
```

**Solution:**
- Run terminal as Administrator
- Or change file/folder permissions

## Quick Setup Checklist

1. ✅ PostgreSQL installed
2. ✅ PostgreSQL service running
3. ✅ Database `uniapply_db` created
4. ✅ `.env` file exists in `backend/` directory
5. ✅ Database credentials correct in `.env`
6. ✅ Dependencies installed (`npm install`)

## Testing Database Connection

You can test if PostgreSQL is accessible:

```powershell
# Test connection
psql -U postgres -h localhost -d uniapply_db

# If successful, you'll see:
# uniapply_db=#
```

## Getting Help

If you're still having issues:

1. Check the full error message in the terminal
2. Verify PostgreSQL is running: `Get-Service postgresql*`
3. Verify database exists: `psql -U postgres -l` (lists all databases)
4. Check `.env` file has correct values
5. Try restarting PostgreSQL service

## Common PostgreSQL Defaults

- **Port:** 5432
- **User:** postgres
- **Password:** (set during installation)
- **Host:** localhost


