const express = require('express');
const router = express.Router();
const { FAQ } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get all FAQs (public, but filtered for students)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, category } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Students can only see active FAQs
    if (!req.user || !['admin', 'super_admin'].includes(req.user?.role)) {
      where.isActive = true;
    }

    if (category) where.category = category;

    const { count, rows } = await FAQ.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      faqs: rows,
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

// Get FAQ by ID
router.get('/:id', async (req, res, next) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Students can only see active FAQs
    if (!faq.isActive && (!req.user || !['admin', 'super_admin'].includes(req.user?.role))) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Increment views
    await faq.increment('views');

    res.json({ faq });
  } catch (error) {
    next(error);
  }
});

// Create FAQ (admin only)
router.post('/', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { question, answer, category, order, isActive } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'general',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      message: 'FAQ created successfully',
      faq
    });
  } catch (error) {
    next(error);
  }
});

// Update FAQ (admin only)
router.put('/:id', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    const { question, answer, category, order, isActive } = req.body;

    await faq.update({
      question: question || faq.question,
      answer: answer || faq.answer,
      category: category || faq.category,
      order: order !== undefined ? order : faq.order,
      isActive: isActive !== undefined ? isActive : faq.isActive
    });

    res.json({
      message: 'FAQ updated successfully',
      faq
    });
  } catch (error) {
    next(error);
  }
});

// Delete FAQ (admin only)
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    await faq.destroy();
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

