# Deploy UniApply to Render

This guide will help you deploy the UniApply platform to Render.

## Prerequisites

1. GitHub account with the code pushed
2. Render account (sign up at https://render.com)

## Step 1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `uniapply-db`
   - **Database**: `uniapply_db`
   - **User**: `uniapply_user`
   - **Plan**: Free (or paid if needed)
4. Click **"Create Database"**
5. **Save the connection details** - you'll need them later

## Step 2: Deploy Backend Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `uniapply-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables** (Add these):
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<from database connection string>
   DB_PORT=<from database connection string>
   DB_NAME=uniapply_db
   DB_USER=<from database connection string>
   DB_PASSWORD=<from database connection string>
   JWT_SECRET=<generate a strong random string>
   JWT_EXPIRE=7d
   FRONTEND_URL=https://uniapply-frontend.onrender.com
   RAZORPAY_KEY_ID=<your razorpay key>
   RAZORPAY_KEY_SECRET=<your razorpay secret>
   GEMINI_API_KEY=<your gemini api key>
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   ```

5. Click **"Create Web Service"**

6. **Wait for deployment** - Note the backend URL (e.g., `https://uniapply-backend.onrender.com`)

## Step 3: Deploy Frontend Service

1. In Render dashboard, click **"New +"** → **"Static Site"** (or Web Service)
2. Connect your GitHub repository
3. Configure:
   - **Name**: `uniapply-frontend`
   - **Environment**: `Node`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. **Environment Variables**:
   ```
   VITE_API_URL=https://uniapply-backend.onrender.com
   ```

5. Click **"Create Static Site"**

6. **Wait for deployment** - Note the frontend URL

## Step 4: Update Backend with Frontend URL

1. Go back to your **Backend Service** settings
2. Update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://uniapply-frontend.onrender.com
   ```
3. Click **"Save Changes"** - This will trigger a redeploy

## Step 5: Run Database Migrations

After backend is deployed, you need to initialize the database:

1. Go to your backend service on Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd backend
   npm run migrate
   ```
   (If migrate script doesn't exist, the tables will be created automatically on first start)

## Step 6: Seed Initial Data

In the backend shell, run:
```bash
npm run seed-docs
npm run seed-universities
npm run create-admin
```

## Step 7: Access Your Application

- **Frontend**: `https://uniapply-frontend.onrender.com`
- **Backend API**: `https://uniapply-backend.onrender.com/api`

## Important Notes

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Database has connection limits on free tier

### Environment Variables

Make sure all sensitive keys are set:
- `JWT_SECRET` - Generate a strong random string
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` - From Razorpay dashboard
- `GEMINI_API_KEY` - From Google AI Studio

### Database Connection

Render provides connection details in the database dashboard. Use:
- **Internal Database URL** (for services on Render)
- **External Database URL** (for local connections)

### CORS Configuration

The backend is configured to accept requests from the frontend URL. Make sure `FRONTEND_URL` matches your actual frontend URL.

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Check database connection string

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend URL is accessible

### Database connection errors
- Verify database credentials
- Check if database is running
- Ensure database is in the same region

## Updating the Application

1. Push changes to GitHub
2. Render will automatically detect and deploy
3. Or manually trigger deploy from Render dashboard

## Custom Domain (Optional)

1. Go to service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Update DNS records as instructed


