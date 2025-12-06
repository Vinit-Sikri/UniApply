# 🚀 Start the Project - Quick Guide

## ✅ Current Status

- ✅ Backend API is working (registration succeeded!)
- ✅ Database is connected
- ⏳ Frontend needs to be started

## 🎯 Start the Application (2 Steps)

### Step 1: Start Backend (if not running)

Open **Terminal 1** (PowerShell):
```powershell
cd C:\Users\hp\Desktop\hero\vinit\backend
npm run dev
```

You should see:
```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server running on port 5000
```

### Step 2: Start Frontend

Open **Terminal 2** (New PowerShell window):
```powershell
cd C:\Users\hp\Desktop\hero\vinit\frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 🌐 Access the Application

1. **Open your browser**
2. **Go to**: `http://localhost:3000`
3. **You should see**: The login/register page

## 🧪 Test the Application

### Register a New User
1. Click "Sign up" or go to `/register`
2. Fill in the form:
   - Email: `newuser@example.com` (use a different email)
   - Password: `password123`
   - First Name: `John`
   - Last Name: `Doe`
3. Click "Create Account"
4. You should be redirected to the dashboard!

### Login
1. Go to `/login`
2. Use the credentials you just created
3. Click "Sign In"
4. You should see the student dashboard!

## 📝 Quick Commands

### Start Both Servers at Once (Alternative)

From the root directory:
```powershell
cd C:\Users\hp\Desktop\hero\vinit
npm run dev
```

This starts both backend and frontend together.

## ⚠️ Troubleshooting

### Port 3000 Already in Use
```powershell
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Port 5000 Already in Use
```powershell
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Won't Start
```powershell
cd frontend
npm install
npm run dev
```

### Backend Won't Start
```powershell
cd backend
npm install
npm run dev
```

## ✅ Success Indicators

**Backend:**
- ✅ Database connection established
- ✅ Server running on port 5000
- ✅ API accessible at http://localhost:5000/api

**Frontend:**
- ✅ Vite server running
- ✅ Local: http://localhost:3000/
- ✅ Browser shows login page

## 🎉 You're Ready!

Once both servers are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

Open http://localhost:3000 in your browser and start using the application!

