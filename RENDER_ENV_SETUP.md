# How to Add Environment Variables in Render

## Method 1: Through Render Dashboard (Recommended)

### For Backend Service:

1. **Go to your Backend Service** in Render dashboard
2. Click on **"Environment"** tab (left sidebar)
3. Click **"Add Environment Variable"** button
4. Add each variable one by one:

#### Required Environment Variables:

```
NODE_ENV = production
```

```
PORT = 10000
```

```
DB_HOST = <Copy from Database dashboard - Internal Database URL>
```

```
DB_PORT = <Copy from Database dashboard - usually 5432>
```

```
DB_NAME = uniapply_db
```

```
DB_USER = <Copy from Database dashboard>
```

```
DB_PASSWORD = <Copy from Database dashboard>
```

```
JWT_SECRET = <Generate a random string like: aB3$kL9mN2pQ5rS8tU1vW4xY7zA0>
```

```
JWT_EXPIRE = 7d
```

```
FRONTEND_URL = https://uniapply-frontend.onrender.com
```
*(Update this after frontend is deployed)*

```
RAZORPAY_KEY_ID = <Your Razorpay Key ID>
```

```
RAZORPAY_KEY_SECRET = <Your Razorpay Key Secret>
```

```
GEMINI_API_KEY = <Your Gemini API Key>
```

```
UPLOAD_DIR = ./uploads
```

```
MAX_FILE_SIZE = 10485760
```

### For Frontend Service:

1. **Go to your Frontend Service** in Render dashboard
2. Click on **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:

```
VITE_API_URL = https://uniapply-backend.onrender.com
```
*(Update with your actual backend URL)*

## Method 2: Using render.yaml (Advanced)

You can also define environment variables in `render.yaml`, but for sensitive keys (like API keys), it's better to add them through the dashboard.

## How to Get Database Connection Details:

1. Go to your **PostgreSQL Database** service in Render
2. In the **"Info"** tab, you'll see:
   - **Internal Database URL** - Use this for services on Render
   - **External Database URL** - For local connections
3. The URL format is: `postgresql://user:password@host:port/database`
4. Extract:
   - **Host**: The hostname part
   - **Port**: Usually 5432
   - **User**: The username
   - **Password**: The password
   - **Database**: The database name

## Quick Copy-Paste Format:

### Backend Environment Variables:
```
NODE_ENV=production
PORT=10000
DB_HOST=<from database>
DB_PORT=5432
DB_NAME=uniapply_db
DB_USER=<from database>
DB_PASSWORD=<from database>
JWT_SECRET=<generate random string>
JWT_EXPIRE=7d
FRONTEND_URL=https://uniapply-frontend.onrender.com
RAZORPAY_KEY_ID=<your key>
RAZORPAY_KEY_SECRET=<your secret>
GEMINI_API_KEY=<your key>
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend Environment Variables:
```
VITE_API_URL=https://uniapply-backend.onrender.com
```

## Important Notes:

1. **No spaces around `=`** - Render expects `KEY=value` format
2. **Case sensitive** - Make sure variable names match exactly
3. **Update FRONTEND_URL** - After frontend deploys, update backend's `FRONTEND_URL`
4. **Generate JWT_SECRET** - Use a strong random string (you can use: https://randomkeygen.com/)
5. **Save after adding** - Click "Save Changes" after adding variables

## Step-by-Step Visual Guide:

1. **Navigate to Service**: Click on your service name
2. **Click "Environment"**: Left sidebar menu
3. **Click "Add Environment Variable"**: Blue button
4. **Enter Key**: Variable name (e.g., `NODE_ENV`)
5. **Enter Value**: Variable value (e.g., `production`)
6. **Click "Save"**: Green button
7. **Repeat**: For each environment variable
8. **Redeploy**: Service will automatically redeploy after saving

## Troubleshooting:

- **Variables not working?** - Make sure you clicked "Save Changes"
- **Service not starting?** - Check logs for missing variables
- **Database connection failed?** - Verify DB credentials are correct
- **Frontend can't connect?** - Check `VITE_API_URL` matches backend URL

