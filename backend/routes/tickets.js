const express = require('express');
const router = express.Router();
const { Ticket, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get all tickets
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, priority } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Students can only see their own tickets
    if (req.user.role === 'student') {
      where.userId = req.user.id;
    }

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'assignedToUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          foreignKey: 'assignedTo'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      tickets: rows,
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

// Get ticket by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: User,
          as: 'assignedToUser',
          attributes: { exclude: ['password'] },
          foreignKey: 'assignedTo'
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Students can only view their own tickets
    if (req.user.role === 'student' && ticket.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ ticket });
  } catch (error) {
    next(error);
  }
});

// Create ticket
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { subject, description, category, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }

    const ticket = await Ticket.create({
      userId: req.user.id,
      subject,
      description,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open'
    });

    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: createdTicket
    });
  } catch (error) {
    next(error);
  }
});

// Update ticket
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Students can only update their own open tickets
    if (req.user.role === 'student') {
      if (ticket.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (ticket.status !== 'open') {
        return res.status(400).json({ error: 'Only open tickets can be updated' });
      }
    }

    const { subject, description, status, assignedTo, resolutionNotes } = req.body;

    const updateData = {};
    if (subject) updateData.subject = subject;
    if (description) updateData.description = description;
    
    // Only admins can change status, assign, and add resolution notes
    if (['admin', 'super_admin'].includes(req.user.role)) {
      if (status) {
        updateData.status = status;
        if (status === 'resolved' || status === 'closed') {
          updateData.resolvedAt = new Date();
        }
      }
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    }

    await ticket.update(updateData);

    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    next(error);
  }
});

// Delete ticket (admin only)
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await ticket.destroy();
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

