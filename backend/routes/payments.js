const express = require('express');
const router = express.Router();
const { Payment, Application, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { createOrder, verifyPayment, getPaymentDetails } = require('../utils/razorpay');

// Get all payments
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, applicationId, paymentType } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Students can only see their own payments
    if (req.user.role === 'student') {
      where.userId = req.user.id;
    }

    if (status) where.status = status;
    if (applicationId) where.applicationId = applicationId;
    if (paymentType) where.paymentType = paymentType;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Application,
          as: 'application',
          attributes: ['id', 'applicationNumber', 'program'],
          include: [{
            model: require('../models').University,
            as: 'university',
            attributes: ['id', 'name']
          }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      payments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get payment by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Application,
          as: 'application',
          include: [{
            model: require('../models').University,
            as: 'university'
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Students can only view their own payments
    if (req.user.role === 'student' && payment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
});

// Create payment order (Razorpay)
router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    const { applicationId, amount, paymentType = 'application_fee' } = req.body;

    console.log('Create order request:', { applicationId, amount, paymentType, userId: req.user.id });

    if (!applicationId || amount === undefined || amount === null) {
      return res.status(400).json({ 
        error: 'Application ID and amount are required',
        received: { applicationId, amount, paymentType }
      });
    }

    // Verify application belongs to user (include university for fee)
    const application = await Application.findByPk(applicationId, {
      include: [{
        model: require('../models').University,
        as: 'university',
        attributes: ['id', 'name', 'applicationFee']
      }]
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    if (application.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Invalid application' });
    }
    
    console.log('Application found:', {
      id: application.id,
      status: application.status,
      studentId: application.studentId,
      userId: req.user.id,
      universityFee: application.university?.applicationFee
    });

    // Validate payment type and status - CRITICAL: Application must be verified before payment
    if (paymentType === 'application_fee') {
      if (application.status !== 'verified') {
        return res.status(400).json({ 
          error: 'Application must be verified before paying application fee',
          currentStatus: application.status,
          requiredStatus: 'verified',
          message: 'Please wait for admin verification before making payment'
        });
      }
      
      // Check if payment already exists for this application
      const existingPayment = await Payment.findOne({
        where: {
          applicationId,
          paymentType: 'application_fee',
          status: 'completed'
        }
      });
      
      if (existingPayment) {
        return res.status(400).json({ 
          error: 'Application fee has already been paid for this application' 
        });
      }
    }

    if (paymentType === 'issue_resolution_fee') {
      if (application.status !== 'issue_raised') {
        return res.status(400).json({ 
          error: 'No issue raised for this application',
          currentStatus: application.status,
          requiredStatus: 'issue_raised'
        });
      }
      
      // Check if issue payment already exists and is completed
      if (application.issuePaymentId) {
        const issuePayment = await Payment.findByPk(application.issuePaymentId);
        if (issuePayment && issuePayment.status === 'completed') {
          return res.status(400).json({ 
            error: 'Issue resolution fee has already been paid' 
          });
        }
      }
    }

    // Validate amount
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    
    // Ensure amount is properly formatted for DECIMAL(10, 2)
    const formattedAmount = Math.round(paymentAmount * 100) / 100; // Round to 2 decimal places

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys missing:', {
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
      });
      return res.status(500).json({ 
        error: 'Payment gateway not configured',
        message: 'Razorpay keys are missing. Please contact administrator.'
      });
    }
    
    console.log('Razorpay configuration check passed');

    // Create Razorpay order
    // Generate receipt ID (max 40 chars for Razorpay)
    // Format: app_<short_app_id>_<timestamp>
    const shortAppId = applicationId.replace(/-/g, '').slice(0, 8); // Remove dashes and take first 8 chars
    const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
    const receiptId = `app_${shortAppId}_${timestamp}`; // Total: 4 + 8 + 1 + 10 = 23 chars (well under 40)
    
    let order;
    try {
      order = await createOrder(
        paymentAmount,
        'INR',
        receiptId
      );
    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError);
      console.error('Razorpay error details:', {
        message: razorpayError.message,
        description: razorpayError.description,
        field: razorpayError.field,
        source: razorpayError.source,
        step: razorpayError.step,
        reason: razorpayError.reason,
        metadata: razorpayError.metadata,
        error: razorpayError.error
      });
      
      // Extract meaningful error message
      let errorMessage = 'Payment gateway error. Please try again.';
      if (razorpayError.error) {
        errorMessage = razorpayError.error.description || razorpayError.error.message || errorMessage;
      } else if (razorpayError.message) {
        errorMessage = razorpayError.message;
      }
      
      // Extract error details properly
      const errorDetails = {};
      if (razorpayError.error) {
        errorDetails.razorpayError = {
          description: razorpayError.error.description,
          field: razorpayError.error.field,
          source: razorpayError.error.source,
          step: razorpayError.error.step,
          reason: razorpayError.error.reason,
          code: razorpayError.error.code
        };
      }
      if (razorpayError.message) errorDetails.message = razorpayError.message;
      if (razorpayError.description) errorDetails.description = razorpayError.description;
      
      return res.status(400).json({ 
        error: 'Failed to create payment order',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      });
    }

    // Create payment record
    let payment;
    try {
      payment = await Payment.create({
        userId: req.user.id,
        applicationId: applicationId || null,
        amount: formattedAmount,
        currency: 'INR',
        paymentMethod: 'razorpay',
        paymentType,
        status: 'pending',
        gatewayTransactionId: order.id,
        gatewayResponse: order
      });
    } catch (dbError) {
      console.error('Payment record creation error:', dbError);
      console.error('Payment record creation error details:', {
        name: dbError.name,
        message: dbError.message,
        errors: dbError.errors,
        fields: dbError.fields,
        stack: dbError.stack
      });
      
      // Provide more detailed error message
      let errorMessage = 'Payment order was created but record failed. Please contact support.';
      if (dbError.errors && dbError.errors.length > 0) {
        errorMessage = dbError.errors.map(e => e.message).join(', ');
      } else if (dbError.message) {
        errorMessage = dbError.message;
      }
      
      return res.status(500).json({ 
        error: 'Failed to create payment record',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          name: dbError.name,
          message: dbError.message,
          errors: dbError.errors
        } : undefined
      });
    }

    res.json({
      orderId: order.id,
      amount: order.amount, // Razorpay returns amount in paise
      currency: order.currency,
      paymentId: payment.id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

// Verify and capture payment
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    // Verify signature
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Get payment details from Razorpay
    const razorpayPayment = await getPaymentDetails(razorpay_payment_id);

    // Update payment record
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update payment
    await payment.update({
      status: razorpayPayment.status === 'captured' ? 'completed' : 'failed',
      gatewayTransactionId: razorpay_payment_id,
      gatewayResponse: razorpayPayment,
      paidAt: new Date()
    });

    // Update application status based on payment type
    const application = await Application.findByPk(payment.applicationId);
    if (application && payment.status === 'completed') {
      if (payment.paymentType === 'application_fee') {
        await application.update({
          status: 'payment_received'
        });
      } else if (payment.paymentType === 'issue_resolution_fee') {
        await application.update({
          status: 'under_review',
          issueResolvedAt: new Date()
        });
      }
    }

    res.json({
      message: 'Payment verified successfully',
      payment: {
        id: payment.id,
        status: payment.status,
        transactionId: payment.transactionId
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
});

// Create payment (legacy - for non-Razorpay)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { applicationId, amount, paymentMethod, paymentGateway, paymentType } = req.body;

    // Verify application belongs to user
    if (applicationId) {
      const application = await Application.findByPk(applicationId);
      if (!application || application.studentId !== req.user.id) {
        return res.status(403).json({ error: 'Invalid application' });
      }

      // Get university application fee
      const university = await require('../models').University.findByPk(application.universityId);
      if (!university) {
        return res.status(404).json({ error: 'University not found' });
      }

      // Use university fee if amount not specified
      const paymentAmount = amount || university.applicationFee;
      
      const payment = await Payment.create({
        userId: req.user.id,
        applicationId,
        amount: paymentAmount,
        paymentMethod: paymentMethod || 'other',
        paymentType: paymentType || 'application_fee',
        paymentGateway: paymentGateway || null,
        status: 'pending'
      });

      res.status(201).json({
        message: 'Payment initiated successfully',
        payment
      });
    } else {
      return res.status(400).json({ error: 'Application ID is required' });
    }
  } catch (error) {
    next(error);
  }
});

// Update payment status (for payment gateway callbacks or admin)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Only admins can update payment status directly
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, gatewayTransactionId, gatewayResponse } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.paidAt = new Date();
      }
    }
    if (gatewayTransactionId) updateData.gatewayTransactionId = gatewayTransactionId;
    if (gatewayResponse) updateData.gatewayResponse = gatewayResponse;

    await payment.update(updateData);

    res.json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
