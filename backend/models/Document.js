const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'applications',
      key: 'id'
    }
  },
  documentTypeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'document_types',
      key: 'id'
    }
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalFileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
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
    comment: 'AI verification results including quality score, clarity, completeness, and extracted information'
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
  }
}, {
  tableName: 'documents',
  timestamps: true
});

module.exports = Document;

