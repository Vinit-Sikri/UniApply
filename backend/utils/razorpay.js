const Razorpay = require('razorpay');
require('dotenv').config();

let razorpay = null;

// Initialize Razorpay only if keys are provided
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn('⚠️  Razorpay keys not configured. Payment features will not work.');
}

// Create order
const createOrder = async (amount, currency = 'INR', receipt = null) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file');
  }
  
  // Validate amount
  const amountInPaise = Math.round(amount * 100);
  if (amountInPaise < 100) {
    throw new Error('Minimum amount is ₹1.00 (100 paise)');
  }
  
  // Generate receipt if not provided (max 40 characters for Razorpay)
  let receiptId = receipt;
  if (!receiptId) {
    // Use timestamp + random number, max 40 chars
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString();
    receiptId = `rcpt_${timestamp.slice(-10)}${random}`.slice(0, 40);
  } else if (receiptId.length > 40) {
    // Truncate if too long
    receiptId = receiptId.slice(0, 40);
  }
  
  try {
    const options = {
      amount: amountInPaise, // Razorpay expects amount in paise
      currency: currency,
      receipt: receiptId, // Max 40 characters
      payment_capture: 1 // Auto capture
    };

    console.log('Creating Razorpay order with options:', {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt
    });

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', order.id);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error keys:', Object.keys(error));
    
    // Razorpay errors have a specific structure
    if (error.error) {
      console.error('Razorpay API error:', error.error);
    }
    
    // Re-throw with more context
    const enhancedError = new Error(error.error?.description || error.message || 'Failed to create Razorpay order');
    enhancedError.originalError = error;
    enhancedError.error = error.error;
    enhancedError.description = error.error?.description;
    enhancedError.field = error.error?.field;
    enhancedError.source = error.error?.source;
    enhancedError.step = error.error?.step;
    enhancedError.reason = error.error?.reason;
    throw enhancedError;
  }
};

// Verify payment signature
const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  try {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return false;
    }
    
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    return generated_signature === razorpay_signature;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file');
  }
  
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Razorpay fetch payment error:', error);
    throw error;
  }
};

module.exports = {
  razorpay,
  createOrder,
  verifyPayment,
  getPaymentDetails
};

