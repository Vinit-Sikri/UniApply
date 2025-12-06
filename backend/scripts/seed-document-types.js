const { DocumentType } = require('../models');
const { sequelize } = require('../config/database');
require('dotenv').config();

const documentTypes = [
  {
    name: 'Aadhar Card',
    code: 'AADHAR',
    description: 'Identity verification document',
    isRequired: true,
    maxFileSize: 5242880, // 5MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    isActive: true
  },
  {
    name: 'Driver License',
    code: 'DRIVING_LICENSE',
    description: 'Optional secondary ID',
    isRequired: false,
    maxFileSize: 5242880,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    isActive: true
  },
  {
    name: '10th Marksheet',
    code: 'TENTH_MARKSHEET',
    description: 'Secondary education qualification',
    isRequired: true,
    maxFileSize: 5242880,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    isActive: true
  },
  {
    name: '12th Marksheet',
    code: 'TWELFTH_MARKSHEET',
    description: 'Higher secondary qualification',
    isRequired: true,
    maxFileSize: 5242880,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    isActive: true
  },
  {
    name: 'Graduation Certificate',
    code: 'GRADUATION_CERTIFICATE',
    description: 'Graduation degree certificate',
    isRequired: false,
    maxFileSize: 5242880,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    isActive: true
  },
  {
    name: 'Passport',
    code: 'PASSPORT',
    description: 'Passport document',
    isRequired: false,
    maxFileSize: 5242880,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    isActive: true
  }
];

async function seedDocumentTypes() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    for (const docType of documentTypes) {
      const [type, created] = await DocumentType.findOrCreate({
        where: { code: docType.code },
        defaults: docType
      });

      if (created) {
        console.log(`✅ Created: ${type.name}`);
      } else {
        console.log(`⏭️  Already exists: ${type.name}`);
      }
    }

    console.log('\n✅ Document types seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding document types:', error);
    process.exit(1);
  }
}

seedDocumentTypes();

