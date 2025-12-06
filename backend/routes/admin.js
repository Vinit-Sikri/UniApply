const express = require('express');
const router = express.Router();
const { Application, Payment, Ticket, User, Refund, Document } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// Dashboard statistics
router.get('/dashboard', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate);
      if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate);
    }

    // Total applications
    const totalApplications = await Application.count({ where: dateFilter });
    const pendingApplications = await Application.count({ 
      where: { ...dateFilter, status: 'under_review' } 
    });
    const approvedApplications = await Application.count({ 
      where: { ...dateFilter, status: 'approved' } 
    });

    // Total revenue
    const revenueResult = await Payment.sum('amount', {
      where: { ...dateFilter, status: 'completed' }
    });
    const totalRevenue = revenueResult || 0;

    // Pending tickets
    const pendingTickets = await Ticket.count({ 
      where: { ...dateFilter, status: { [Op.in]: ['open', 'in_progress'] } } 
    });

    // Pending refunds
    const pendingRefunds = await Refund.count({ 
      where: { ...dateFilter, status: 'pending' } 
    });

    // Recent applications
    const recentApplications = await Application.findAll({
      where: dateFilter,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: require('../models').University,
          as: 'university',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Applications by status
    const applicationsByStatus = await Application.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: dateFilter,
      group: ['status'],
      raw: true
    });

    res.json({
      statistics: {
        totalApplications,
        pendingApplications,
        approvedApplications,
        totalRevenue: parseFloat(totalRevenue),
        pendingTickets,
        pendingRefunds
      },
      recentApplications,
      applicationsByStatus
    });
  } catch (error) {
    next(error);
  }
});

// Get refunds
router.get('/refunds', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Refund.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'transactionId', 'amount']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      refunds: rows,
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

// Review refund
router.post('/refunds/:id/review', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;
    const refund = await Refund.findByPk(req.params.id);
    
    if (!refund) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    const updateData = {
      status,
      reviewNotes,
      reviewedBy: req.user.id
    };

    if (status === 'processed') {
      updateData.processedAt = new Date();
      // Update payment status to refunded
      const payment = await Payment.findByPk(refund.paymentId);
      if (payment) {
        await payment.update({ status: 'refunded' });
      }
    }

    await refund.update(updateData);

    res.json({
      message: 'Refund reviewed successfully',
      refund
    });
  } catch (error) {
    next(error);
  }
});

// Document types management
router.get('/document-types', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const documentTypes = await require('../models').DocumentType.findAll({
      order: [['name', 'ASC']]
    });

    res.json({ documentTypes });
  } catch (error) {
    next(error);
  }
});

router.post('/document-types', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { name, code, description, isRequired, maxFileSize, allowedMimeTypes, isActive } = req.body;

    const documentType = await require('../models').DocumentType.create({
      name,
      code,
      description,
      isRequired: isRequired || false,
      maxFileSize: maxFileSize || 5242880,
      allowedMimeTypes: allowedMimeTypes || ['application/pdf', 'image/jpeg', 'image/png'],
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      message: 'Document type created successfully',
      documentType
    });
  } catch (error) {
    next(error);
  }
});

router.put('/document-types/:id', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const documentType = await require('../models').DocumentType.findByPk(req.params.id);
    if (!documentType) {
      return res.status(404).json({ error: 'Document type not found' });
    }

    const { name, description, isRequired, maxFileSize, allowedMimeTypes, isActive } = req.body;

    await documentType.update({
      name: name || documentType.name,
      description: description !== undefined ? description : documentType.description,
      isRequired: isRequired !== undefined ? isRequired : documentType.isRequired,
      maxFileSize: maxFileSize !== undefined ? maxFileSize : documentType.maxFileSize,
      allowedMimeTypes: allowedMimeTypes || documentType.allowedMimeTypes,
      isActive: isActive !== undefined ? isActive : documentType.isActive
    });

    res.json({
      message: 'Document type updated successfully',
      documentType
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/document-types/:id', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const documentType = await require('../models').DocumentType.findByPk(req.params.id);
    if (!documentType) {
      return res.status(404).json({ error: 'Document type not found' });
    }

    await documentType.destroy();

    res.json({
      message: 'Document type deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

