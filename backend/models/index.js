const { sequelize } = require('../config/database');
const User = require('./User');
const University = require('./University');
const Application = require('./Application');
const Document = require('./Document');
const DocumentType = require('./DocumentType');
const Payment = require('./Payment');
const Ticket = require('./Ticket');
const FAQ = require('./FAQ');
const Refund = require('./Refund');

// Define associations
User.hasMany(Application, { foreignKey: 'studentId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

University.hasMany(Application, { foreignKey: 'universityId', as: 'applications' });
Application.belongsTo(University, { foreignKey: 'universityId', as: 'university' });

User.hasMany(Document, { foreignKey: 'userId', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'user' });

DocumentType.hasMany(Document, { foreignKey: 'documentTypeId', as: 'documents' });
Document.belongsTo(DocumentType, { foreignKey: 'documentTypeId', as: 'documentType' });

Application.hasMany(Document, { foreignKey: 'applicationId', as: 'documents' });
Document.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Application.hasMany(Payment, { foreignKey: 'applicationId', as: 'payments' });
Payment.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

Application.belongsTo(Payment, { foreignKey: 'issuePaymentId', as: 'issuePayment' });

User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Ticket, { foreignKey: 'assignedTo', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedToUser' });

User.hasMany(Refund, { foreignKey: 'userId', as: 'refunds' });
Refund.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Payment.hasOne(Refund, { foreignKey: 'paymentId', as: 'refund' });
Refund.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

module.exports = {
  sequelize,
  User,
  University,
  Application,
  Document,
  DocumentType,
  Payment,
  Ticket,
  FAQ,
  Refund
};

