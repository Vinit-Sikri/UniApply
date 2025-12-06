# Dashboard Debugging Guide

## If Dashboard Shows No Content

### Check These:

1. **Open Browser Console (F12)**
   - Look for any errors
   - Check Network tab for failed API calls
   - Look for 401 (unauthorized) errors

2. **Check Authentication**
   - Make sure you're logged in
   - Check if token exists: `localStorage.getItem('token')` in console
   - Try logging out and logging back in

3. **Check API Connection**
   - Backend should be running on port 5000
   - Test: http://localhost:5000/api/health
   - Should return: `{"status":"ok",...}`

4. **Check Network Requests**
   - Open DevTools → Network tab
   - Refresh page
   - Look for `/api/applications` request
   - Check if it returns 200 or error

### Common Issues:

#### Issue: 401 Unauthorized
**Solution:** 
- Logout and login again
- Check if token is valid
- Backend might have restarted

#### Issue: CORS Error
**Solution:**
- Make sure frontend proxy is working
- Check `vite.config.js` has proxy setup
- Restart frontend server

#### Issue: Network Error
**Solution:**
- Check backend is running
- Check port 5000 is accessible
- Check firewall settings

#### Issue: Empty Response
**Solution:**
- This is normal if you have no applications
- You should still see the welcome banner and stats (all zeros)
- Create your first application to see data

### Quick Fixes:

1. **Hard Refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear Cache:** Clear browser cache and localStorage
3. **Restart Servers:** Restart both backend and frontend
4. **Check Console:** Look for specific error messages

### Expected Behavior:

- **With No Applications:** 
  - Welcome banner visible
  - Stats showing zeros
  - "No applications yet" message
  - "Create Your First Application" button

- **With Applications:**
  - Welcome banner visible
  - Stats showing counts
  - List of recent applications

### Still Not Working?

Share:
1. Browser console errors (F12 → Console)
2. Network tab errors (F12 → Network → Filter: XHR)
3. Screenshot of what you see

