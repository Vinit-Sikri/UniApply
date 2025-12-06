# Manual Deployment to Render (Step-by-Step)

Follow these steps to deploy UniApply manually on Render.

## Step 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"PostgreSQL"**
4. Fill in the form:
   - **Name**: `uniapply-db`
   - **Database**: `uniapply_db`
   - **User**: `uniapply_user` (or leave default)
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: Latest (14 or 15)
   - **Plan**: Free
5. Click **"Create Database"**
6. **Wait for database to be created** (takes 1-2 minutes)
7. **Copy the connection details** from the "Info" tab:
   - Internal Database URL
   - Host, Port, Database, User, Password

## Step 2: Deploy Backend Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. **Connect your GitHub account** (if not already connected)
3. **Select your repository**: `UniApply` (or your repo name)
4. **Configure the service**:
   - **Name**: `uniapply-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click **"Create Web Service"**

### Add Backend Environment Variables:

After the service is created, go to **"Environment"** tab and add:

1. Click **"Add Environment Variable"**
2. Add each variable:

```
Key: NODE_ENV
Value: production
```

```
Key: PORT
Value: 10000
```

```
Key: DB_HOST
Value: <Copy from database Info tab - Internal Database URL>
```

```
Key: DB_PORT
Value: 5432
```

```
Key: DB_NAME
Value: uniapply_db
```

```
Key: DB_USER
Value: <Copy from database Info tab>
```

```
Key: DB_PASSWORD
Value: <Copy from database Info tab>
```

```
Key: JWT_SECRET
Value: <Generate a random string - use https://randomkeygen.com/>
```

```
Key: JWT_EXPIRE
Value: 7d
```

```
Key: FRONTEND_URL
Value: https://uniapply-frontend.onrender.com
(Update this after frontend is deployed)
```

```
Key: RAZORPAY_KEY_ID
Value: <Your Razorpay Key ID>
```

```
Key: RAZORPAY_KEY_SECRET
Value: <Your Razorpay Key Secret>
```

```
Key: GEMINI_API_KEY
Value: <Your Gemini API Key>
```

```
Key: UPLOAD_DIR
Value: ./uploads
```

```
Key: MAX_FILE_SIZE
Value: 10485760
```

3. Click **"Save Changes"** after adding all variables
4. The service will automatically redeploy

## Step 3: Deploy Frontend Service

1. In Render dashboard, click **"New +"** → **"Static Site"**
   - **OR** if Static Site is not available, use **"Web Service"**
2. **Select your repository**: Same repository
3. **Configure**:
   - **Name**: `uniapply-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

### If using Web Service instead of Static Site:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`

### Add Frontend Environment Variables:

Go to **"Environment"** tab:

```
Key: VITE_API_URL
Value: https://uniapply-backend.onrender.com
(Use your actual backend URL)
```

Click **"Save Changes"**

## Step 4: Update Backend with Frontend URL

1. Go back to **Backend Service**
2. Go to **"Environment"** tab
3. Find `FRONTEND_URL` variable
4. Update the value to your actual frontend URL:
   ```
   https://uniapply-frontend.onrender.com
   ```
5. Click **"Save Changes"**

## Step 5: Initialize Database

1. Go to **Backend Service** → **"Shell"** tab
2. Wait for shell to connect
3. Run these commands one by one:

```bash
cd backend
npm run seed-docs
```

```bash
npm run seed-universities
```

```bash
npm run create-admin
```

## Step 6: Verify Deployment

1. **Check Backend**:

   - Go to backend service → "Logs" tab
   - Should see: "Server running on port 10000"
   - Test: `https://uniapply-backend.onrender.com/api/health`

2. **Check Frontend**:
   - Go to frontend service → "Logs" tab
   - Should see build success
   - Visit: `https://uniapply-frontend.onrender.com`

## Troubleshooting

### Backend won't start:

- Check logs for errors
- Verify all environment variables are set
- Check database connection string

### Database connection error:

- Verify DB credentials match database Info tab
- Check if database is running (should be green)
- Ensure using Internal Database URL, not External

### Frontend can't connect to backend:

- Check `VITE_API_URL` matches backend URL
- Verify backend is running
- Check CORS settings

### Services keep spinning down:

- Free tier services sleep after 15 min inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading to paid plan for always-on

## Quick Reference: Environment Variables Checklist

### Backend (12 variables):

- [ ] NODE_ENV
- [ ] PORT
- [ ] DB_HOST
- [ ] DB_PORT
- [ ] DB_NAME
- [ ] DB_USER
- [ ] DB_PASSWORD
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] FRONTEND_URL
- [ ] RAZORPAY_KEY_ID
- [ ] RAZORPAY_KEY_SECRET
- [ ] GEMINI_API_KEY
- [ ] UPLOAD_DIR
- [ ] MAX_FILE_SIZE

### Frontend (1 variable):

- [ ] VITE_API_URL

## Your URLs After Deployment:

- **Frontend**: `https://uniapply-frontend.onrender.com`
- **Backend API**: `https://uniapply-backend.onrender.com/api`
- **Health Check**: `https://uniapply-backend.onrender.com/api/health`

## Next Steps:

1. Test the application
2. Create admin user (if not done via script)
3. Test login functionality
4. Test payment flow (if configured)
5. Monitor logs for any errors
