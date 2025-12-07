const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Document, DocumentType, Application } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get document types (public for authenticated users)
router.get('/types', authenticate, async (req, res, next) => {
  try {
    const documentTypes = await DocumentType.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.json({ documentTypes });
  } catch (error) {
    next(error);
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  }
});

// Get all documents
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, applicationId, documentTypeId, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Students can only see their own documents
    if (req.user.role === 'student') {
      where.userId = req.user.id;
    }

    if (applicationId) where.applicationId = applicationId;
    if (documentTypeId) where.documentTypeId = documentTypeId;
    if (status) where.status = status;

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Application,
          as: 'application',
          attributes: ['id', 'applicationNumber']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      documents: rows,
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

// Get document by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: DocumentType,
          as: 'documentType'
        },
        {
          model: Application,
          as: 'application'
        }
      ]
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Students can only view their own documents
    if (req.user.role === 'student' && document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ document });
  } catch (error) {
    next(error);
  }
});

// Download document
router.get('/:id/download', authenticate, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Students can only download their own documents
    // Admins can download any document
    if (req.user.role === 'student' && document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!document.filePath || !fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');

    // Send file
    res.sendFile(path.resolve(document.filePath));
  } catch (error) {
    next(error);
  }
});

// Upload document
router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { applicationId, documentTypeId } = req.body;

    // Verify document type exists
    const documentType = await DocumentType.findByPk(documentTypeId);
    if (!documentType || !documentType.isActive) {
      return res.status(404).json({ error: 'Invalid document type' });
    }

    // Verify file size
    if (req.file.size > documentType.maxFileSize) {
      fs.unlinkSync(req.file.path); // Delete uploaded file
      return res.status(400).json({ 
        error: `File size exceeds maximum allowed size of ${documentType.maxFileSize} bytes` 
      });
    }

    // Verify MIME type
    if (!documentType.allowedMimeTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'File type not allowed for this document type' });
    }

    // Verify application belongs to user (if provided)
    if (applicationId) {
      const application = await Application.findByPk(applicationId);
      if (!application || application.studentId !== req.user.id) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ error: 'Invalid application' });
      }
    }

    const document = await Document.create({
      userId: req.user.id,
      applicationId: applicationId || null,
      documentTypeId,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'pending'
    });

    const createdDoc = await Document.findByPk(document.id, {
      include: [
        {
          model: DocumentType,
          as: 'documentType'
        }
      ]
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: createdDoc
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// Review document (admin only)
router.post('/:id/review', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.update({
      status,
      reviewNotes,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    res.json({
      message: 'Document reviewed successfully',
      document
    });
  } catch (error) {
    next(error);
  }
});

// Delete document
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Students can only delete their own pending documents
    if (req.user.role === 'student') {
      if (document.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (document.status !== 'pending') {
        return res.status(400).json({ error: 'Only pending documents can be deleted' });
      }
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

