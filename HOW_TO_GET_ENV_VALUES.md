# How to Get Environment Variable Values

This guide shows you where to find or generate each environment variable value.

## Database Connection Values

### From Render PostgreSQL Database:

1. **Go to your PostgreSQL database** in Render dashboard
2. Click on the database service (e.g., `uniapply-db`)
3. Go to **"Info"** tab
4. You'll see **"Internal Database URL"** - it looks like:

   ```
   postgresql://uniapply_user:password123@dpg-xxxxx-a.oregon-postgres.render.com:5432/uniapply_db
   ```

5. **Extract values from the URL:**
   - Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
   - **DB_HOST**: The hostname part (e.g., `dpg-xxxxx-a.oregon-postgres.render.com`)
   - **DB_PORT**: Usually `5432`
   - **DB_USER**: The username (e.g., `uniapply_user`)
   - **DB_PASSWORD**: The password (after the `:` and before `@`)
   - **DB_NAME**: The database name (e.g., `uniapply_db`)

### Example:

If URL is: `postgresql://user123:pass456@dpg-abc123.oregon-postgres.render.com:5432/uniapply_db`

Then:

- **DB_HOST** = `dpg-abc123.oregon-postgres.render.com`
- **DB_PORT** = `5432`
- **DB_USER** = `user123`
- **DB_PASSWORD** = `pass456`
- **DB_NAME** = `uniapply_db`

---

## JWT_SECRET

### Generate a Random String:

**Option 1: Online Generator**

1. Go to: https://randomkeygen.com/
2. Use **"CodeIgniter Encryption Keys"** section
3. Copy any key (64 characters long)
4. Example: `aB3$kL9mN2pQ5rS8tU1vW4xY7zA0bC2dE4fG6hI8jK0lM1nO3pQ5rS7tU9vW1xY3zA5`

**Option 2: PowerShell (Windows)**

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

**Option 3: Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 4: Simple Random String**
Just use any long random string like:

```
mySuperSecretJWTKeyForUniApply2024Production
```

---

## Razorpay Keys

### From Razorpay Dashboard:

1. **Sign in** to Razorpay: https://dashboard.razorpay.com/
2. Go to **"Settings"** → **"API Keys"**
3. You'll see:

   - **Key ID** (starts with `rzp_`)
   - **Key Secret** (click "Reveal" to see it)

4. Copy:
   - **RAZORPAY_KEY_ID** = Your Key ID
   - **RAZORPAY_KEY_SECRET** = Your Key Secret

**Note**: If you don't have Razorpay account:

- Sign up at: https://razorpay.com/
- Go to Settings → API Keys
- Generate test keys (for testing) or live keys (for production)

---

## Gemini API Key

### From Google AI Studio:

1. **Go to**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. Click **"Create API Key"**
4. Select a project (or create new)
5. Copy the generated API key

**GEMINI_API_KEY** = The key you copied (starts with `AIza...`)

**Note**: If you don't have one:

- Sign up for free at Google AI Studio
- Free tier includes generous usage limits

---

## Frontend URL

### After Frontend is Deployed:

1. **Deploy frontend first** (see deployment guide)
2. **Copy the URL** from Render dashboard
3. It will be: `https://uniapply-frontend.onrender.com`
   (or whatever name you gave it)

**FRONTEND_URL** = Your frontend service URL

**Note**: Update this in backend after frontend is deployed!

---

## Fixed Values (No Need to Find)

These are standard values - just copy them:

```
NODE_ENV = production
PORT = 10000
JWT_EXPIRE = 7d
UPLOAD_DIR = ./uploads
MAX_FILE_SIZE = 10485760
```

---

## Frontend Environment Variable

### VITE_API_URL

**After Backend is Deployed:**

1. **Deploy backend first**
2. **Copy the backend URL** from Render dashboard
3. It will be: `https://uniapply-backend.onrender.com`
   (or whatever name you gave it)

**VITE_API_URL** = Your backend service URL

---

## Quick Checklist

### Backend Variables:

- [ ] **NODE_ENV** = `production` (fixed)
- [ ] **PORT** = `10000` (fixed)
- [ ] **DB_HOST** = From database Info tab
- [ ] **DB_PORT** = `5432` (usually fixed)
- [ ] **DB_NAME** = `uniapply_db` (or from database)
- [ ] **DB_USER** = From database Info tab
- [ ] **DB_PASSWORD** = From database Info tab
- [ ] **JWT_SECRET** = Generate random string
- [ ] **JWT_EXPIRE** = `7d` (fixed)
- [ ] **FRONTEND_URL** = Frontend service URL (after deployment)
- [ ] **RAZORPAY_KEY_ID** = From Razorpay dashboard
- [ ] **RAZORPAY_KEY_SECRET** = From Razorpay dashboard
- [ ] **GEMINI_API_KEY** = From Google AI Studio
- [ ] **UPLOAD_DIR** = `./uploads` (fixed)
- [ ] **MAX_FILE_SIZE** = `10485760` (fixed)

### Frontend Variables:

- [ ] **VITE_API_URL** = Backend service URL (after deployment)

---

## Step-by-Step: Getting Database Values

1. **In Render Dashboard:**

   - Click on your PostgreSQL database service
   - Go to **"Info"** tab
   - Find **"Internal Database URL"**

2. **Parse the URL:**

   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   ```

3. **Example parsing:**

   ```
   postgresql://myuser:mypass123@dpg-abc123.oregon-postgres.render.com:5432/uniapply_db

   USER = myuser
   PASSWORD = mypass123
   HOST = dpg-abc123.oregon-postgres.render.com
   PORT = 5432
   DATABASE = uniapply_db
   ```

4. **Use these in environment variables:**
   - DB_USER = `myuser`
   - DB_PASSWORD = `mypass123`
   - DB_HOST = `dpg-abc123.oregon-postgres.render.com`
   - DB_PORT = `5432`
   - DB_NAME = `uniapply_db`

---

## Troubleshooting

### Can't find database URL?

- Make sure database is fully created (green status)
- Check "Info" tab, not "Settings"
- Look for "Internal Database URL" or "Connection String"

### Razorpay keys not working?

- Make sure you're using correct environment (test vs live)
- Verify keys are active in Razorpay dashboard
- Check for extra spaces when copying

### Gemini API key invalid?

- Make sure you copied the full key
- Check if API is enabled in Google Cloud Console
- Verify no extra spaces

### Frontend can't connect?

- Make sure backend URL is correct
- Include `https://` in the URL
- Don't include `/api` in VITE_API_URL (it's added automatically)

---

## Quick Reference Table

| Variable            | Where to Get          | Example                                  |
| ------------------- | --------------------- | ---------------------------------------- |
| DB_HOST             | Database Info tab     | `dpg-abc123.render.com`                  |
| DB_PORT             | Database Info tab     | `5432`                                   |
| DB_USER             | Database Info tab     | `uniapply_user`                          |
| DB_PASSWORD         | Database Info tab     | `abc123xyz`                              |
| DB_NAME             | Database Info tab     | `uniapply_db`                            |
| JWT_SECRET          | Generate random       | `aB3$kL9mN2pQ5...`                       |
| RAZORPAY_KEY_ID     | Razorpay dashboard    | `rzp_test_xxxxx`                         |
| RAZORPAY_KEY_SECRET | Razorpay dashboard    | `xxxxx`                                  |
| GEMINI_API_KEY      | Google AI Studio      | `AIzaSyB...`                             |
| FRONTEND_URL        | After frontend deploy | `https://uniapply-frontend.onrender.com` |
| VITE_API_URL        | After backend deploy  | `https://uniapply-backend.onrender.com`  |

