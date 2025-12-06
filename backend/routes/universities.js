const express = require('express');
const router = express.Router();
const { University } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all universities (public for students, full access for admins)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Students can only see active universities
    // Check if user is authenticated and is admin (req.user might be undefined if not authenticated)
    const isAdmin = req.user && req.user.role && ['admin', 'super_admin'].includes(req.user.role);
    
    if (!isAdmin) {
      // Non-admin users (or unauthenticated) can only see active universities
      where.isActive = true;
    } else if (isActive !== undefined) {
      // Admins can filter by isActive
      where.isActive = isActive === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await University.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'code', 'description', 'location', 'country', 'website', 'applicationFee', 'isActive']
    });

    res.json({
      universities: rows,
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

// Get university by ID
router.get('/:id', async (req, res, next) => {
  try {
    const university = await University.findByPk(req.params.id);
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Students can only see active universities
    if (!university.isActive && (!req.user || !['admin', 'super_admin'].includes(req.user?.role))) {
      return res.status(404).json({ error: 'University not found' });
    }

    res.json({ university });
  } catch (error) {
    next(error);
  }
});

// Create university (admin only)
router.post('/', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { name, code, description, location, country, website, logo, applicationFee, metadata } = req.body;

    // Check if code already exists
    const existing = await University.findOne({ where: { code } });
    if (existing) {
      return res.status(409).json({ error: 'University code already exists' });
    }

    const university = await University.create({
      name,
      code,
      description,
      location,
      country,
      website,
      logo,
      applicationFee: applicationFee || 0,
      metadata: metadata || {}
    });

    res.status(201).json({
      message: 'University created successfully',
      university
    });
  } catch (error) {
    next(error);
  }
});

// Update university (admin only)
router.put('/:id', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    const { name, description, location, country, website, logo, applicationFee, isActive, metadata } = req.body;

    await university.update({
      name: name || university.name,
      description: description !== undefined ? description : university.description,
      location: location || university.location,
      country: country || university.country,
      website: website || university.website,
      logo: logo || university.logo,
      applicationFee: applicationFee !== undefined ? applicationFee : university.applicationFee,
      isActive: isActive !== undefined ? isActive : university.isActive,
      metadata: metadata || university.metadata
    });

    res.json({
      message: 'University updated successfully',
      university
    });
  } catch (error) {
    next(error);
  }
});

// Delete university (admin only)
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    await university.destroy();
    res.json({ message: 'University deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

