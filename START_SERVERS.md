# 🚀 Start Your Application

## Quick Start

Since you've added Razorpay credentials, let's start both servers:

### Option 1: Start Both Servers Together (Recommended)

From the **root directory** (`C:\Users\hp\Desktop\hero\vinit`):

```powershell
npm run dev
```

This will start:
- ✅ Backend server on `http://localhost:5000`
- ✅ Frontend server on `http://localhost:3000` (or Vite's default port)

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

## 🌐 Access Your Application

Once both servers are running:

1. **Frontend:** Open http://localhost:3000 (or the port shown in terminal)
2. **Backend API:** http://localhost:5000/api

## ✅ What to Expect

### Backend Terminal Output:
```
✅ Database connection established successfully.
🔄 Synchronizing database models...
✅ Database models synchronized.
🚀 Server running on port 5000
🌐 API available at: http://localhost:5000/api
```

### Frontend Terminal Output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🧪 Test Payment Flow

1. **Login/Register** at http://localhost:3000 (or 5173)
2. **Create an Application**
3. **Admin verifies it** (or manually set status to `verified` in database)
4. **See "Pay Application Fee" button** on application detail page
5. **Click to pay** → Razorpay popup opens
6. **Use test card:**
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date

## 🔧 Troubleshooting

### Backend won't start?
- Check if PostgreSQL is running
- Verify `.env` file has all required variables including Razorpay keys
- Check terminal for error messages

### Frontend won't start?
- Make sure backend is running first
- Check if port 3000/5173 is already in use
- Try `npm install` in frontend directory

### Payment not working?
- Verify Razorpay keys in `backend/.env`:
  ```
  RAZORPAY_KEY_ID=rzp_test_xxxxx
  RAZORPAY_KEY_SECRET=xxxxx
  ```
- Check browser console for errors
- Make sure Razorpay script loads (check Network tab)

## 📝 Next Steps

1. ✅ Start servers
2. ✅ Login/Register
3. ✅ Create application
4. ✅ Test payment flow
5. ✅ Enjoy! 🎉


