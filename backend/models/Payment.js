const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'netbanking', 'upi', 'wallet', 'razorpay', 'other'),
    allowNull: false
  },
  paymentType: {
    type: DataTypes.ENUM('application_fee', 'issue_resolution_fee', 'other'),
    defaultValue: 'application_fee',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentGateway: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gatewayResponse: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['transactionId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['applicationId']
    },
    {
      fields: ['status']
    }
  ]
});

// Generate transaction ID before create
Payment.beforeCreate(async (payment) => {
  if (!payment.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    payment.transactionId = `TXN-${timestamp}-${random}`;
  }
});

module.exports = Payment;

