# Quick Start Guide

## Current Status

✅ Dependencies installed  
✅ `.env` file created  
❌ PostgreSQL not installed (this is why the app crashed)

## Immediate Action Required

**You need to install PostgreSQL** to run the application.

### Fastest Way to Get Started:

1. **Download PostgreSQL**: https://www.postgresql.org/download/windows/
2. **Install** with default settings (remember your password!)
3. **Update** `backend/.env` file with your PostgreSQL password
4. **Create database**:
   ```powershell
   createdb -U postgres uniapply_db
   ```
5. **Start server**:
   ```powershell
   cd backend
   npm run dev
   ```

## Detailed Instructions

See `DATABASE_SETUP.md` for complete step-by-step instructions.

## What Happened?

The error you saw:
```
ConnectionRefusedError [SequelizeConnectionRefusedError]
ECONNREFUSED
```

This means the application tried to connect to PostgreSQL but couldn't because:
- PostgreSQL is not installed, OR
- PostgreSQL service is not running, OR  
- Database doesn't exist

## After Installing PostgreSQL

Once PostgreSQL is installed and the database is created, the server will start successfully and you'll see:

```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server running on port 5000
```

Then you can start the frontend in another terminal:
```powershell
cd frontend
npm run dev
```

And access the application at: http://localhost:3000


