# Install PostgreSQL - Step by Step Guide

## ✅ Diagnosis: PostgreSQL is NOT installed on your system

## Solution: Install PostgreSQL

### Option 1: Download and Install PostgreSQL (Recommended)

#### Step 1: Download PostgreSQL

1. **Open your web browser** and go to:
   ```
   https://www.postgresql.org/download/windows/
   ```

2. **Click "Download the installer"** button

3. **Select the latest version** (PostgreSQL 15 or 16)

4. **Download the Windows x86-64 installer**

#### Step 2: Run the Installer

1. **Double-click the downloaded file** (e.g., `postgresql-15.x-windows-x64.exe`)

2. **Follow the installation wizard:**
   - Click "Next" on the welcome screen
   - **Installation Directory**: Keep default (`C:\Program Files\PostgreSQL\15`)
   - **Select Components**: Keep all checked (default)
   - **Data Directory**: Keep default
   - **Password**: ⚠️ **IMPORTANT** - Set a password for the `postgres` user
     - **Remember this password!** You'll need it for the `.env` file
     - Example: `postgres123` (or your own secure password)
   - **Port**: Keep default `5432`
   - **Advanced Options**: Keep default locale
   - **Pre Installation Summary**: Click "Next"
   - **Ready to Install**: Click "Next"
   - Wait for installation to complete

3. **Uncheck "Launch Stack Builder"** when prompted (not needed)

4. Click "Finish"

#### Step 3: Verify Installation

1. **Open PowerShell as Administrator:**
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Check if PostgreSQL service is running:**
   ```powershell
   Get-Service -Name postgresql*
   ```

3. **If service is not running, start it:**
   ```powershell
   # Replace 15 with your PostgreSQL version number
   net start postgresql-x64-15
   ```

   Or find the exact service name:
   ```powershell
   Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}
   ```

#### Step 4: Create the Database

1. **Open Command Prompt or PowerShell**

2. **Navigate to PostgreSQL bin directory** (adjust version number):
   ```powershell
   cd "C:\Program Files\PostgreSQL\15\bin"
   ```

3. **Create the database:**
   ```powershell
   .\createdb.exe -U postgres uniapply_db
   ```

4. **Enter your PostgreSQL password** when prompted

   **Alternative - Using pgAdmin (GUI):**
   - Open "pgAdmin 4" from Start Menu
   - Connect to PostgreSQL server (enter your password)
   - Right-click "Databases" → "Create" → "Database"
   - Name: `uniapply_db`
   - Click "Save"

#### Step 5: Update .env File

1. **Open** `backend/.env` file

2. **Update the password:**
   ```env
   DB_PASSWORD=your_postgres_password_here
   ```
   Replace `your_postgres_password_here` with the password you set during installation.

3. **Save the file**

#### Step 6: Start Your Backend Server

```powershell
cd C:\Users\hp\Desktop\hero\vinit\backend
npm run dev
```

You should now see:
```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server running on port 5000
```

---

### Option 2: Install Using Chocolatey (If You Have It)

If you have Chocolatey package manager installed:

```powershell
# Install PostgreSQL
choco install postgresql

# Start the service
net start postgresql-x64-15

# Create database
createdb -U postgres uniapply_db
```

---

### Option 3: Use Docker (If You Have Docker Desktop)

If you have Docker installed:

```powershell
# Run PostgreSQL in a container
docker run --name uniapply-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=uniapply_db `
  -p 5432:5432 `
  -d postgres:15

# Update .env file
# DB_PASSWORD=postgres
```

---

## Quick Checklist

After installation, verify:

- [ ] PostgreSQL service is running
- [ ] Database `uniapply_db` exists
- [ ] `.env` file has correct `DB_PASSWORD`
- [ ] Backend server starts without errors

## Troubleshooting

### Service Won't Start

1. **Check service status:**
   ```powershell
   Get-Service -Name postgresql*
   ```

2. **Start manually:**
   ```powershell
   net start postgresql-x64-15
   ```

3. **If permission denied, run PowerShell as Administrator**

### Can't Create Database

1. **Check if PostgreSQL is running:**
   ```powershell
   Get-Service -Name postgresql*
   ```

2. **Try using pgAdmin GUI instead** (easier for beginners)

3. **Verify password is correct**

### Connection Still Fails

1. **Check `.env` file** - password must match PostgreSQL password
2. **Verify database exists:**
   ```powershell
   psql -U postgres -l
   ```
3. **Check PostgreSQL is listening on port 5432:**
   ```powershell
   netstat -an | findstr 5432
   ```

## Need Help?

If you encounter issues:
1. Check the error message in the terminal
2. Verify PostgreSQL service is running
3. Ensure database `uniapply_db` exists
4. Confirm `.env` file has correct credentials

