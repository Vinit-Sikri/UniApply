# How to Find/Set Start Command in Render

## Where to Find Start Command

The location depends on whether you're using **Static Site** or **Web Service**:

### Option 1: Web Service (Has Start Command)

1. Go to your **Frontend Service** in Render dashboard
2. Click on the service name
3. Look for tabs at the top: **"Settings"**, **"Environment"**, **"Logs"**, etc.
4. Click **"Settings"** tab
5. Scroll down to find:
   - **"Build Command"**
   - **"Start Command"** ← This is what you need!

### Option 2: Static Site (No Start Command)

If you're using **Static Site**, there's **NO Start Command** field. Instead:

1. Go to **"Settings"** tab
2. You'll see:
   - **"Build Command"**: `npm install && npm run build`
   - **"Publish Directory"**: `dist`
   - **No Start Command** (because static sites don't need one)

## Solution: Switch to Web Service

If you need SPA routing (to fix refresh issue), switch to **Web Service**:

### Steps to Switch:

1. **Delete current Static Site** (or keep it, create new Web Service)
2. **Create new Web Service**:
   - "New +" → "Web Service"
   - Connect same repository
3. **Configure**:
   - **Name**: `uniapply-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` ← **This is what you need!**
   - **Plan**: Free

4. **Add Environment Variable**:
   - **VITE_API_URL** = `https://uniapply-backend.onrender.com`

5. **Save and Deploy**

## Alternative: Update Existing Service

If you can't find "Start Command":

1. Go to your service
2. Click **"Settings"** (or gear icon)
3. Look for **"Commands"** section
4. Or look for **"Build & Deploy"** section
5. You should see fields for:
   - Build Command
   - Start Command (if Web Service)

## Visual Guide

### Web Service Settings Page:
```
Settings Tab
├── General
│   ├── Name
│   ├── Region
│   └── Branch
├── Build & Deploy
│   ├── Build Command ← Here
│   └── Start Command ← HERE!
└── Environment
    └── Environment Variables
```

### Static Site Settings Page:
```
Settings Tab
├── General
│   ├── Name
│   ├── Region
│   └── Branch
├── Build & Deploy
│   ├── Build Command ← Here
│   └── Publish Directory ← Here
│   └── (No Start Command)
└── Environment
    └── Environment Variables
```

## Quick Fix: Use Vite Preview

If you can't find Start Command, you can also use Vite's preview:

**Start Command** (if using Web Service):
```
npm run preview -- --host 0.0.0.0 --port $PORT
```

This handles SPA routing automatically.

