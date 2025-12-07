# Fix: No Start Command Field in Render

## Problem
You're looking for "Start Command" but can't find it. This means you're likely using a **Static Site** instead of a **Web Service**.

## Solution Options

### Option 1: Switch to Web Service (Recommended)

**Static Sites don't have Start Command** - they just serve static files. For SPA routing, you need a **Web Service**.

#### Steps to Switch:

1. **Note your current frontend service name** (e.g., `uniapply-frontend`)

2. **Create a NEW Web Service**:
   - In Render dashboard, click **"New +"** button (top right)
   - Select **"Web Service"** (NOT Static Site)
   - Connect your repository
   - Select the same branch (usually `main`)

3. **Configure the Web Service**:
   - **Name**: `uniapply-frontend` (or any name you prefer)
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` ← **THIS IS WHERE YOU'LL SEE IT!**
   - **Plan**: Free

4. **Add Environment Variable**:
   - Go to **"Environment"** tab
   - Add:
     ```
     Key: VITE_API_URL
     Value: https://uniapply-backend.onrender.com
     ```
   - (Use your actual backend URL)

5. **Click "Create Web Service"**

6. **After it deploys**, you can delete the old Static Site if you want

---

### Option 2: Use Vite Preview (Alternative)

If you want to keep using Static Site, you can't use Express server. Instead:

1. **Update `frontend/package.json`**:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview --host 0.0.0.0 --port $PORT",
     "start": "vite preview --host 0.0.0.0 --port $PORT"
   }
   ```

2. **But wait** - Static Sites don't run commands, they just serve files!

   **So this won't work with Static Site** - you MUST use Web Service.

---

### Option 3: Use Render's Redirects (Static Site Only)

If you MUST use Static Site, you can add a `_redirects` file:

1. **Create `frontend/public/_redirects`** (already created)
   ```
   /*    /index.html   200
   ```

2. **But Render Static Sites might not support this** - depends on their setup

3. **This is why Web Service is recommended**

---

## How to Identify Your Service Type

### Check in Render Dashboard:

1. Go to your **Frontend Service**
2. Look at the **service type badge** at the top:
   - **"Static Site"** = No Start Command (just serves files)
   - **"Web Service"** = Has Start Command (runs Node.js)

3. Or check the **Settings** tab:
   - **Static Site** has: "Build Command" and "Publish Directory"
   - **Web Service** has: "Build Command" and **"Start Command"** ← This is what you need!

---

## Step-by-Step: Create Web Service

### Step 1: Create New Service

1. In Render dashboard, click **"New +"** (top right)
2. Click **"Web Service"**
3. Click **"Connect account"** or select your Git provider
4. Select your repository

### Step 2: Configure Service

Fill in these fields:

```
Name: uniapply-frontend
Region: (choose closest to you)
Branch: main
Root Directory: frontend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start  ← HERE IT IS!
Instance Type: Free
```

### Step 3: Add Environment Variable

1. Scroll down to **"Environment Variables"** section
2. Click **"Add Environment Variable"**
3. Add:
   ```
   Key: VITE_API_URL
   Value: https://uniapply-backend.onrender.com
   ```
   (Replace with your actual backend URL)

### Step 4: Create Service

1. Click **"Create Web Service"** button at bottom
2. Wait for deployment (2-5 minutes)
3. Your service will be live!

---

## Visual Guide: Where to Find Start Command

### In Web Service Settings:

```
┌─────────────────────────────────────┐
│  uniapply-frontend                  │
│  [Settings] [Environment] [Logs]    │
├─────────────────────────────────────┤
│                                     │
│  Build & Deploy                     │
│  ┌───────────────────────────────┐  │
│  │ Build Command:               │  │
│  │ npm install && npm run build  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Start Command:               │  │ ← HERE!
│  │ npm start                     │  │
│  └───────────────────────────────┘  │
│                                     │
│  Environment Variables              │
│  ┌───────────────────────────────┐  │
│  │ VITE_API_URL                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### In Static Site Settings (NO Start Command):

```
┌─────────────────────────────────────┐
│  uniapply-frontend                  │
│  [Settings] [Environment] [Logs]    │
├─────────────────────────────────────┤
│                                     │
│  Build & Deploy                     │
│  ┌───────────────────────────────┐  │
│  │ Build Command:               │  │
│  │ npm install && npm run build  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Publish Directory:           │  │
│  │ dist                         │  │
│  └───────────────────────────────┘  │
│  (NO Start Command field!)          │
└─────────────────────────────────────┘
```

---

## Quick Answer

**If you don't see "Start Command":**
- You're using **Static Site**
- **Solution**: Create a **NEW Web Service** (not Static Site)
- **Then** you'll see the "Start Command" field
- **Set it to**: `npm start`

---

## After Switching to Web Service

1. **Wait for deployment** (2-5 minutes)
2. **Test your frontend URL**
3. **Try refreshing a page** (like `/admin/applications`)
4. **Should work without "404 Not Found"!**

---

## Still Can't Find It?

If you've created a Web Service and still don't see it:

1. **Check you're in the right service** (not the backend)
2. **Check you're in "Settings" tab** (not Environment or Logs)
3. **Scroll down** - it's in the "Build & Deploy" section
4. **Try refreshing the page**

If still not there, take a screenshot of your Settings page and I can help identify the issue!


