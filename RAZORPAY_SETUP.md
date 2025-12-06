# Razorpay Payment Integration Setup

## ✅ Three-Tier Payment System Implemented

### 1. **Free Tier** (No Payment Required)
- ✅ Application form submission
- ✅ Document upload
- ✅ Basic status tracking

### 2. **Issue Resolution Fee** (₹500)
- ✅ Triggered when admin raises an issue
- ✅ Student must pay to:
  - View detailed issue comments
  - See specific modification requirements
  - Resubmit application with changes
- ✅ After payment, application re-enters verification cycle

### 3. **Application Fee** (University-specific)
- ✅ Triggered after application is VERIFIED
- ✅ Student pays full application fee
- ✅ Application moves to PAYMENT_RECEIVED status

## 🔧 Razorpay Setup

### Step 1: Get Razorpay Keys

1. **Sign up for Razorpay:**
   - Go to: https://razorpay.com/
   - Create an account
   - Complete KYC verification

2. **Get API Keys:**
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - Generate Test Keys (for development)
   - Copy `Key ID` and `Key Secret`

### Step 2: Configure Backend

1. **Update `backend/.env` file:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
   ```

2. **Restart backend server:**
   ```powershell
   cd backend
   npm run dev
   ```

### Step 3: Test Payment Flow

1. **Create an application**
2. **Admin verifies it** (status → `verified`)
3. **Student sees payment button**
4. **Click "Pay Now"**
5. **Razorpay popup opens**
6. **Use test card:**
   - Card Number: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date
   - Name: Any name

## 📋 Payment Flow

### Application Fee Flow:
1. Student submits application
2. Admin reviews and verifies → Status: `verified`
3. Student sees "Pay Application Fee" button
4. Student clicks → Razorpay popup opens
5. Student pays → Status: `payment_received`
6. Application proceeds to final review

### Issue Resolution Flow:
1. Admin reviews application
2. Admin raises issue → Status: `issue_raised`
3. Student sees "Pay to View Issue Details"
4. Student pays ₹500 → Can view issue details
5. Student resubmits → Status: `under_review`
6. Application re-enters verification cycle

## 🎯 API Endpoints

### Create Payment Order
- **POST** `/api/payments/create-order`
- **Body:**
  ```json
  {
    "applicationId": "uuid",
    "amount": 1000,
    "paymentType": "application_fee"
  }
  ```

### Verify Payment
- **POST** `/api/payments/verify`
- **Body:**
  ```json
  {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature",
    "paymentId": "uuid"
  }
  ```

### Get Issue Details
- **GET** `/api/applications/:id/issue-details`
- Returns issue details if payment made, otherwise requires payment

## 🔐 Security

- Payment signature verification
- Secure payment handling
- Transaction logging
- Status updates on payment success

## 📝 Application Status Flow

```
draft → submitted → under_review → verified → payment_received → approved
                                    ↓
                              issue_raised → (pay fee) → under_review
```

## 🧪 Testing

### Test Cards (Razorpay Test Mode):
- **Success:** `4111 1111 1111 1111`
- **Failure:** `4000 0000 0000 0002`
- **CVV:** Any 3 digits
- **Expiry:** Any future date

## ⚠️ Important Notes

1. **Use Test Keys for Development**
   - Get test keys from Razorpay dashboard
   - Test mode doesn't charge real money

2. **Production Setup**
   - Complete Razorpay KYC
   - Get live keys
   - Update `.env` with live keys
   - Test thoroughly before going live

3. **Issue Resolution Fee**
   - Currently set to ₹500
   - Can be configured in backend
   - Update in `PaymentPage.jsx` if needed

## 🚀 Ready to Use!

Once Razorpay keys are configured:
1. Restart backend server
2. Test payment flow
3. All three tiers are working!

