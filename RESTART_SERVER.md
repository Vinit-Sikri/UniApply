# Server Restart Instructions

## Issue Fixed
The login 500 error was caused by a database schema issue with the Application model. The ENUM type for `aiVerificationStatus` was causing problems during database sync.

## Solution Applied
- Changed `aiVerificationStatus` from ENUM to STRING with validation
- Added better error logging to login function
- This allows the database to sync properly without errors

## How to Restart

### Option 1: Using npm scripts (Recommended)
```bash
# Stop the current server (Ctrl+C in the terminal running the server)
# Then restart:
cd backend
npm run dev
```

### Option 2: Manual restart
1. Stop the current backend server (press Ctrl+C in the terminal)
2. Navigate to backend directory:
   ```bash
   cd backend
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   OR
   ```bash
   npm start
   ```

### Option 3: Full restart (if issues persist)
1. Stop both frontend and backend servers
2. Restart backend:
   ```bash
   cd backend
   npm run dev
   ```
3. In a new terminal, restart frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## What to Check After Restart

1. **Backend Server**: Should show:
   - ✅ Database connection established successfully
   - ✅ Database models synchronized
   - 🚀 Server running on port 5000

2. **Login Test**: Try logging in with:
   - Email: admin@university.edu
   - Password: admin123
   - Role: admin

3. **If Still Having Issues**:
   - Check backend terminal for error messages
   - Verify database is running
   - Check .env file has correct database credentials

## Database Sync
The server will automatically sync the database schema on startup (in development mode). The new Application model fields will be added automatically.

