# Quick Fix for Database Connection Error

## 🎯 The Problem

PostgreSQL is **NOT installed** on your system. That's why you're getting the connection refused error.

## ✅ The Solution (Choose One)

### **Option A: Install PostgreSQL (Recommended - 10 minutes)**

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Download PostgreSQL 15 or 16

2. **Install:**
   - Run the installer
   - **Set a password** (remember it!)
   - Keep all defaults
   - Finish installation

3. **Start PostgreSQL Service:**
   ```powershell
   # Open PowerShell as Administrator, then:
   net start postgresql-x64-15
   ```
   (Replace 15 with your version)

4. **Create Database:**
   ```powershell
   # Navigate to PostgreSQL bin
   cd "C:\Program Files\PostgreSQL\15\bin"
   
   # Create database
   .\createdb.exe -U postgres uniapply_db
   ```
   (Enter your password when prompted)

5. **Update `.env` file:**
   - Open `backend/.env`
   - Change `DB_PASSWORD=postgres` to your actual password

6. **Restart backend:**
   ```powershell
   cd C:\Users\hp\Desktop\hero\vinit\backend
   npm run dev
   ```

### **Option B: Use Docker (If You Have Docker Desktop)**

```powershell
# Run PostgreSQL in Docker
docker run --name uniapply-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=uniapply_db -p 5432:5432 -d postgres:15

# Update backend/.env
# DB_PASSWORD=postgres

# Restart backend
cd backend
npm run dev
```

### **Option C: Use SQLite for Development (Quick Alternative)**

If you want to skip PostgreSQL installation for now, I can modify the code to use SQLite (simpler, no installation needed). Let me know if you want this option.

---

## 🚀 After Installation

Once PostgreSQL is installed and running, you should see:

```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server running on port 5000
```

Then your registration will work!

---

## 📞 Still Need Help?

1. Check `INSTALL_POSTGRESQL.md` for detailed step-by-step instructions
2. Make sure PostgreSQL service is running: `Get-Service postgresql*`
3. Verify database exists: Use pgAdmin GUI (easier than command line)


