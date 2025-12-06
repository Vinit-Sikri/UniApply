# 🔍 Razorpay Payment Error Debug Guide

## Current Error
"Failed to create payment order" - The Razorpay API call is failing.

## What I Fixed

### 1. **Error Serialization** (`backend/routes/payments.js`)
   - ✅ Fixed error details to properly extract Razorpay error information
   - ✅ Added detailed logging for Razorpay errors
   - ✅ Improved error message extraction

### 2. **Razorpay Utility** (`backend/utils/razorpay.js`)
   - ✅ Added amount validation (minimum ₹1.00)
   - ✅ Added detailed logging for order creation
   - ✅ Improved error handling and re-throwing with context

## Next Steps to Debug

### 1. **Check Backend Terminal**
   Look for these logs when you click "Pay Now":
   - `"Create order request:"` - Shows what backend received
   - `"Application found:"` - Shows application details
   - `"Razorpay configuration check passed"` - Confirms keys are set
   - `"Creating Razorpay order with options:"` - Shows order details
   - `"Razorpay order creation error:"` - **THIS IS THE KEY ERROR**

### 2. **Common Razorpay Errors**

#### Invalid API Keys
```
Error: Authentication failed
```
**Solution**: Check `backend/.env` has correct Razorpay keys

#### Network Error
```
Error: connect ECONNREFUSED
```
**Solution**: Check internet connection, Razorpay API might be down

#### Invalid Amount
```
Error: Amount should be at least 100 paise
```
**Solution**: Amount must be at least ₹1.00

#### Invalid Currency
```
Error: Invalid currency
```
**Solution**: Currency must be 'INR' for Indian accounts

### 3. **Check Razorpay Keys**

In `backend/.env`, you should have:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

**Important**:
- Test keys start with `rzp_test_`
- Live keys start with `rzp_live_`
- Keys must match (both test or both live)

### 4. **Verify Razorpay Account**

1. Go to https://dashboard.razorpay.com
2. Check if account is active
3. Verify API keys are correct
4. Check if there are any account restrictions

## What to Check Now

1. **Backend Terminal Output** - Look for the actual Razorpay error
2. **Razorpay Keys** - Verify they're correct in `.env`
3. **Network** - Check if backend can reach Razorpay API
4. **Amount** - Verify it's at least ₹1.00 (750 should be fine)

## Expected Backend Logs

When working correctly, you should see:
```
Create order request: { applicationId: '...', amount: 750, paymentType: 'application_fee', userId: '...' }
Application found: { id: '...', status: 'verified', ... }
Razorpay configuration check passed
Creating Razorpay order with options: { amount: 75000, currency: 'INR', receipt: '...' }
Razorpay order created successfully: order_xxxxxxxxxxxxx
```

If there's an error, you'll see:
```
Razorpay order creation error: [Error object]
Razorpay error details: { message: '...', description: '...', ... }
```

**Please check your backend terminal and share the actual error message!**

