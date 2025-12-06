# Setup Guide

## ✅ Completed Steps

1. **PowerShell Execution Policy Fixed**
   - Changed execution policy to `RemoteSigned` for current user
   - This allows npm scripts to run properly

2. **Dependencies Installed**
   - Root dependencies installed
   - Backend dependencies installed
   - Frontend dependencies installed

## 📋 Next Steps

### 1. Database Setup

You need to set up a PostgreSQL database:

1. **Install PostgreSQL** (if not already installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Or use a package manager like Chocolatey: `choco install postgresql`

2. **Create the database**:
   ```powershell
   # Open PostgreSQL command line (psql)
   createdb uniapply_db
   ```

   Or using psql:
   ```sql
   CREATE DATABASE uniapply_db;
   ```

### 2. Backend Configuration

1. **Navigate to backend directory**:
   ```powershell
   cd backend
   ```

2. **Create `.env` file** (copy from `.env.example` if it exists, or create new):
   ```env
   PORT=5000
   NODE_ENV=development

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=uniapply_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password

   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d

   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760

   FRONTEND_URL=http://localhost:3000
   ```

   **Important**: Replace `your_postgres_password` with your actual PostgreSQL password.

### 3. Start the Application

#### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

#### Option 2: Run Both from Root (if concurrently works)
```powershell
cd ..  # Go back to root
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔧 Troubleshooting

### PowerShell Execution Policy Issues

If you still encounter execution policy errors:

1. **Run PowerShell as Administrator** and execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Or use Command Prompt (cmd)** instead of PowerShell:
   ```cmd
   npm install
   ```

### Database Connection Issues

- Ensure PostgreSQL service is running
- Check that the database name, user, and password in `.env` are correct
- Verify PostgreSQL is listening on port 5432

### Port Already in Use

If port 5000 or 3000 is already in use:
- Change `PORT` in backend `.env` file
- Change port in `frontend/vite.config.js`

## 📝 Notes

- The database will be automatically synced in development mode
- First user registration will create a student account
- To create an admin account, you'll need to manually update the database or create a seed script

## 🚀 Ready to Go!

Once the database is set up and `.env` is configured, you can start developing!

