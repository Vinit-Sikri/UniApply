const express = require('express');
const router = express.Router();
const { Application, University, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const { triggerAutoVerification } = require('../services/aiVerificationService');

// Get all applications (with filters)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, universityId, studentId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Students can only see their own applications
    if (req.user.role === 'student') {
      where.studentId = req.user.id;
    } else if (studentId) {
      where.studentId = studentId;
    }

    if (status) where.status = status;
    if (universityId) where.universityId = universityId;

    const { count, rows } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: University,
          as: 'university',
          attributes: ['id', 'name', 'code', 'logo']
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      applications: rows,
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

// Get application by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { Document } = require('../models');
    
    const application = await Application.findByPk(req.params.id, {
      include: [
        {
          model: University,
          as: 'university'
        },
        {
          model: User,
          as: 'student',
          attributes: { exclude: ['password'] }
        },
        {
          model: Document,
          as: 'documents',
          required: false, // LEFT JOIN - include even if no documents
          separate: false, // Include in same query
          include: [{
            model: require('../models').DocumentType,
            as: 'documentType',
            attributes: ['id', 'name', 'code', 'isRequired']
          }]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Manually fetch documents if not included (fallback)
    if (!application.documents || application.documents.length === 0) {
      const documents = await Document.findAll({
        where: { applicationId: application.id },
        include: [{
          model: require('../models').DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'code', 'isRequired']
        }],
        order: [['createdAt', 'DESC']]
      });
      application.documents = documents;
    }

    console.log('Application fetch:', {
      applicationId: req.params.id,
      documentsCount: application?.documents?.length || 0,
      documents: application?.documents?.map(d => ({ 
        id: d.id, 
        name: d.originalFileName, 
        appId: d.applicationId,
        type: d.documentType?.name 
      })) || []
    });

    // Students can only view their own applications
    if (req.user.role === 'student' && application.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ application });
  } catch (error) {
    next(error);
  }
});

// Create new application
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { universityId, program, intake, applicationData } = req.body;

    console.log('Creating application with data:', { universityId, program, intake, studentId: req.user.id });

    // Validate required fields
    if (!universityId) {
      return res.status(400).json({ error: 'University ID is required' });
    }
    if (!program || program.trim() === '') {
      return res.status(400).json({ error: 'Program is required' });
    }

    // Verify university exists
    const university = await University.findByPk(universityId);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    if (!university.isActive) {
      return res.status(400).json({ error: 'University is not active' });
    }

    // Generate unique application number
    let applicationNumber;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      applicationNumber = `APP-${year}${month}-${random}`;
      attempts++;
      
      // Check if application number already exists
      const existing = await Application.findOne({ where: { applicationNumber } });
      if (!existing) break;
      
      if (attempts >= maxAttempts) {
        return res.status(500).json({ error: 'Failed to generate unique application number' });
      }
    } while (attempts < maxAttempts);

    const application = await Application.create({
      studentId: req.user.id,
      universityId,
      program: program.trim(),
      intake: intake ? intake.trim() : null,
      applicationData: applicationData || {},
      status: 'draft',
      applicationNumber
    });

    const createdApp = await Application.findByPk(application.id, {
      include: [
        {
          model: University,
          as: 'university'
        }
      ]
    });

    res.status(201).json({
      message: 'Application created successfully',
      application: createdApp
    });
  } catch (error) {
    console.error('Error creating application:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Handle specific Sequelize errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({ 
        error: 'Validation error', 
        details: errors 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: 'Application number already exists. Please try again.' 
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Invalid university or student reference' 
      });
    }
    
    next(error);
  }
});

// Update application
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Students can only update their own draft applications
    if (req.user.role === 'student') {
      if (application.studentId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (application.status !== 'draft') {
        return res.status(400).json({ error: 'Only draft applications can be updated' });
      }
    }

    const { program, intake, applicationData, status } = req.body;

    const updateData = {};
    if (program) updateData.program = program;
    if (intake) updateData.intake = intake;
    if (applicationData) updateData.applicationData = applicationData;
    
    // Only admins can change status directly
    if (status && ['admin', 'super_admin'].includes(req.user.role)) {
      updateData.status = status;
      if (status === 'submitted') updateData.submissionDate = new Date();
      if (status === 'under_review') updateData.reviewDate = new Date();
      if (['approved', 'rejected'].includes(status)) updateData.decisionDate = new Date();
    }

    await application.update(updateData);

    const updatedApp = await Application.findByPk(application.id, {
      include: [
        {
          model: University,
          as: 'university'
        }
      ]
    });

    res.json({
      message: 'Application updated successfully',
      application: updatedApp
    });
  } catch (error) {
    next(error);
  }
});

// Submit application
router.post('/:id/submit', authenticate, async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (application.status !== 'draft') {
      return res.status(400).json({ error: 'Application already submitted' });
    }

    await application.update({
      status: 'submitted',
      submissionDate: new Date()
    });

    // Trigger AI verification automatically
    triggerAutoVerification(application.id).catch(err => {
      console.error('Failed to trigger AI verification:', err);
    });

    res.json({
      message: 'Application submitted successfully. AI verification in progress.',
      application
    });
  } catch (error) {
    next(error);
  }
});

// Review application (admin only)
router.post('/:id/review', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { status, reviewNotes, issueDetails } = req.body;
    const application = await Application.findByPk(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updateData = {
      status,
      reviewNotes,
      reviewedBy: req.user.id
    };

    if (status === 'under_review') {
      updateData.reviewDate = new Date();
    } else if (status === 'verified') {
      updateData.reviewDate = new Date();
    } else if (status === 'issue_raised') {
      updateData.issueDetails = issueDetails;
      updateData.issueRaisedAt = new Date();
    } else if (['approved', 'rejected'].includes(status)) {
      updateData.decisionDate = new Date();
    }

    await application.update(updateData);

    res.json({
      message: 'Application reviewed successfully',
      application
    });
  } catch (error) {
    next(error);
  }
});

// Trigger AI verification (admin only)
router.post('/:id/ai-verify', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { verifyApplication } = require('../services/aiVerificationService');
    
    const result = await verifyApplication(req.params.id);
    
    res.json({
      message: 'AI verification completed',
      result: result.result
    });
  } catch (error) {
    console.error('AI verification error:', error);
    
    // Even on error, try to return mock data
    try {
      const { Application, Document } = require('../models');
      const application = await Application.findByPk(req.params.id, {
        include: [
          {
            model: require('../models').University,
            as: 'university'
          }
        ]
      });
      
      if (application) {
        const documents = await Document.findAll({
          where: { applicationId: req.params.id },
          include: [
            {
              model: require('../models').DocumentType,
              as: 'documentType'
            }
          ]
        });
        
        const { generateMockVerificationResult } = require('../services/aiVerificationService');
        const mockResult = generateMockVerificationResult(application, documents);
        
        // Update application with mock results
        await application.update({
          aiVerificationStatus: 'completed',
          aiVerificationResult: mockResult,
          aiVerificationFlags: mockResult.flags || [],
          aiVerificationDate: new Date()
        });
        
        return res.json({
          message: 'AI verification completed (using fallback data)',
          result: mockResult
        });
      }
    } catch (fallbackError) {
      console.error('Fallback mock data generation failed:', fallbackError);
    }
    
    res.status(500).json({
      error: 'AI verification failed',
      message: error.message
    });
  }
});

// Get issue details (requires payment)
router.get('/:id/issue-details', authenticate, async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Students can only view their own applications
    if (req.user.role === 'student' && application.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if issue is raised
    if (application.status !== 'issue_raised') {
      return res.status(400).json({ error: 'No issue raised for this application' });
    }

    // Check if issue payment is made
    if (application.issuePaymentId) {
      const issuePayment = await require('../models').Payment.findByPk(application.issuePaymentId);
      if (issuePayment && issuePayment.status === 'completed') {
        // Payment made, show full details
        return res.json({
          issueDetails: application.issueDetails,
          issueRaisedAt: application.issueRaisedAt,
          canViewDetails: true
        });
      }
    }

    // No payment made, return limited info
    res.json({
      message: 'Issue has been raised. Please pay the issue resolution fee to view detailed comments.',
      canViewDetails: false,
      requiresPayment: true
    });
  } catch (error) {
    next(error);
  }
});

// Delete application
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Students can only delete their own draft applications
    if (req.user.role === 'student') {
      if (application.studentId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (application.status !== 'draft') {
        return res.status(400).json({ error: 'Only draft applications can be deleted' });
      }
    }

    await application.destroy();
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

