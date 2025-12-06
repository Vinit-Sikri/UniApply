const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DocumentType = sequelize.define('DocumentType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  maxFileSize: {
    type: DataTypes.INTEGER,
    defaultValue: 5242880, // 5MB in bytes
    comment: 'Maximum file size in bytes'
  },
  allowedMimeTypes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['application/pdf', 'image/jpeg', 'image/png'],
    comment: 'Allowed MIME types for this document'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'document_types',
  timestamps: true
});

module.exports = DocumentType;

