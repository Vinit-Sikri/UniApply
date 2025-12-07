# Render Frontend Setup - Complete Guide

## Issue 1: Finding Start Command

### If Using Static Site:
- **No Start Command needed** - Static sites don't have one
- But Static Sites don't handle SPA routing well

### If Using Web Service:
1. Go to your service → **"Settings"** tab
2. Scroll to **"Build & Deploy"** section
3. You'll see:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` ← Set this!

## Issue 2: Network Error on Registration

### Causes:
1. **Backend not running** - Check backend service is live
2. **Wrong API URL** - Frontend can't reach backend
3. **CORS issue** - Backend blocking frontend requests
4. **Environment variable not set** - VITE_API_URL missing

### Fixes Applied:

1. **Improved error handling** - Better error messages
2. **CORS configuration** - Backend now allows frontend URL
3. **API URL detection** - Frontend automatically detects correct URL
4. **Timeout added** - 30 second timeout for requests

## Step-by-Step: Fix Network Error

### Step 1: Check Backend is Running

1. Go to **Backend Service** in Render
2. Check **"Logs"** tab
3. Should see: "Server running on port 10000"
4. Test backend: Visit `https://uniapply-backend.onrender.com/api/health`
5. Should return: `{"status":"ok"}`

### Step 2: Set Frontend Environment Variable

1. Go to **Frontend Service** → **"Environment"** tab
2. Add/Update:
   ```
   Key: VITE_API_URL
   Value: https://uniapply-backend.onrender.com
   ```
   (Use your actual backend URL - no trailing slash, no /api)

3. Click **"Save Changes"**
4. Service will redeploy

### Step 3: Update Backend CORS

1. Go to **Backend Service** → **"Environment"** tab
2. Make sure `FRONTEND_URL` is set:
   ```
   Key: FRONTEND_URL
   Value: https://uniapply-frontend.onrender.com
   ```
3. Click **"Save Changes"**
4. Backend will redeploy

### Step 4: Verify Connection

1. Open browser console (F12)
2. Try registering a user
3. Check Network tab for the request
4. Should see request to: `https://uniapply-backend.onrender.com/api/auth/register`

## Quick Checklist

### Frontend Service:
- [ ] Service type: **Web Service** (not Static Site)
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npm start`
- [ ] **Environment Variable**: `VITE_API_URL` = backend URL

### Backend Service:
- [ ] Service is **running** (green status)
- [ ] **Environment Variable**: `FRONTEND_URL` = frontend URL
- [ ] Backend URL is accessible (test `/api/health`)

## Test Registration

After fixing:

1. Go to frontend: `https://uniapply-frontend.onrender.com/register`
2. Fill in the form
3. Click "Create Account"
4. Should work without "Network Error"

## Troubleshooting

### Still getting Network Error?

1. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - Check the API URL being used

2. **Check Network tab** (F12 → Network tab)
   - Find the failed request
   - Check the URL
   - Check status code

3. **Verify backend is accessible**:
   - Visit: `https://uniapply-backend.onrender.com/api/health`
   - Should return JSON, not error

4. **Check environment variables**:
   - Frontend: `VITE_API_URL` must be set
   - Backend: `FRONTEND_URL` must be set

5. **Wait for redeploy**:
   - After changing env vars, wait 2-3 minutes
   - Services need to restart

## Common Issues

### "Cannot GET /admin/applications"
- **Fix**: Use Web Service with `npm start` (Express server)
- **OR**: Use Static Site with proper redirects

### "Network Error" on all requests
- **Fix**: Set `VITE_API_URL` environment variable
- **Fix**: Check backend is running
- **Fix**: Verify CORS allows frontend URL

### "CORS policy" error
- **Fix**: Update `FRONTEND_URL` in backend
- **Fix**: Backend will automatically allow that origin


