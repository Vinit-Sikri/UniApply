# Fix for "Not Found" on Page Refresh (SPA Routing)

## Problem
When you refresh a page (like `/admin/applications`), you get a "404 Not Found" error. This happens because the server tries to find a file at that path, but in a React SPA, all routes should serve `index.html` and let React Router handle routing.

## Solution Applied

I've created an Express server that:
1. Serves static files from the `dist` directory
2. Handles all routes by serving `index.html` (SPA routing)
3. Works with Render's Web Service

## Files Created/Updated

1. **`frontend/server.js`** - Express server for production
2. **`frontend/package.json`** - Added Express dependency and updated start script
3. **`frontend/public/_redirects`** - For Netlify (if needed)
4. **`frontend/vercel.json`** - For Vercel (if needed)

## Update Render Configuration

### If using Web Service:

1. Go to your **Frontend Service** in Render
2. Go to **"Settings"** tab
3. Update **"Start Command"**:
   ```
   npm start
   ```
   (This will use the Express server)

4. Make sure **"Build Command"** is:
   ```
   npm install && npm run build
   ```

5. Click **"Save Changes"**

### If using Static Site:

Static sites on Render should handle this automatically, but if not:
- Switch to **Web Service** instead
- Use the configuration above

## How It Works

The Express server (`frontend/server.js`):
- Serves all static files (JS, CSS, images) from `dist/`
- For any route (like `/admin/applications`), serves `index.html`
- React Router then handles the routing on the client side

## Test After Deployment

1. Deploy the updated code
2. Visit your frontend URL
3. Navigate to any page (e.g., `/admin/applications`)
4. **Refresh the page** (F5 or Ctrl+R)
5. Should work without "404 Not Found" error

## Alternative: Using Vite Preview (Simpler)

If you prefer not to use Express, you can also use Vite's preview server:

1. Update **Start Command** in Render:
   ```
   npm run preview -- --host 0.0.0.0 --port $PORT
   ```

2. Vite preview handles SPA routing automatically

But the Express server approach is more reliable for production.

