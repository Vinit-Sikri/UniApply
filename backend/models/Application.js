const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  applicationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  universityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'universities',
      key: 'id'
    }
  },
  program: {
    type: DataTypes.STRING,
    allowNull: false
  },
  intake: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'documents_pending', 'verified', 'issue_raised', 'payment_received', 'approved', 'rejected', 'withdrawn'),
    defaultValue: 'draft',
    allowNull: false
  },
  submissionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  decisionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  issueDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed issue comments (requires payment to view)'
  },
  issueRaisedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  issueResolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  issuePaymentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'payments',
      key: 'id'
    }
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  applicationData: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  // AI Verification Fields
  aiVerificationStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    allowNull: false,
    validate: {
      isIn: [['pending', 'processing', 'completed', 'failed']]
    }
  },
  aiVerificationResult: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'AI verification results including document quality, correspondence, and eligibility checks'
  },
  aiVerificationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  aiVerificationFlags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of issues flagged by AI for admin review'
  },
  eligibilityCriteria: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Eligibility criteria for the program (set by admin)'
  }
}, {
  tableName: 'applications',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['applicationNumber']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['universityId']
    },
    {
      fields: ['status']
    }
  ]
});

// Generate application number before create (only if not provided)
Application.beforeCreate(async (application) => {
  if (!application.applicationNumber) {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      application.applicationNumber = `APP-${year}${month}-${random}`;
    } catch (error) {
      console.error('Error generating application number:', error);
      throw error;
    }
  }
});

module.exports = Application;

