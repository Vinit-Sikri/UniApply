const { sequelize } = require('../config/database');
const { User, University, DocumentType } = require('../models');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    // Check if data already exists
    const docTypeCount = await DocumentType.count();
    const universityCount = await University.count();
    const adminCount = await User.count({ where: { role: ['admin', 'super_admin'] } });
    
    // Seed document types if empty
    if (docTypeCount === 0) {
      console.log('📄 Seeding document types...');
      const documentTypes = [
        { name: 'Aadhar Card', code: 'AADHAR', description: 'Identity verification document', isRequired: true, maxFileSize: 5242880, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'], isActive: true },
        { name: 'Driver License', code: 'DRIVING_LICENSE', description: 'Optional secondary ID', isRequired: false, maxFileSize: 5242880, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'], isActive: true },
        { name: '10th Marksheet', code: 'TENTH_MARKSHEET', description: 'Secondary education qualification', isRequired: true, maxFileSize: 5242880, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'], isActive: true },
        { name: '12th Marksheet', code: 'TWELFTH_MARKSHEET', description: 'Higher secondary qualification', isRequired: true, maxFileSize: 5242880, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'], isActive: true },
        { name: 'Graduation Certificate', code: 'GRADUATION_CERTIFICATE', description: 'Graduation degree certificate', isRequired: false, maxFileSize: 5242880, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'], isActive: true },
        { name: 'Passport', code: 'PASSPORT', description: 'Passport document', isRequired: false, maxFileSize: 5242880, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'], isActive: true }
      ];

      for (const docType of documentTypes) {
        const [type, created] = await DocumentType.findOrCreate({
          where: { code: docType.code },
          defaults: docType
        });
        if (created) {
          console.log(`  ✅ Created: ${type.name}`);
        }
      }
      console.log('✅ Document types seeded');
    } else {
      console.log(`ℹ️  Document types already exist (${docTypeCount} found)`);
    }
    
    // Seed universities if empty
    if (universityCount === 0) {
      console.log('🏫 Seeding universities...');
      const universities = [
        { name: 'Indian Institute of Technology Delhi', code: 'IITD', description: 'Premier engineering and technology institute', location: 'New Delhi', country: 'India', website: 'https://www.iitd.ac.in', applicationFee: 2000, isActive: true },
        { name: 'Indian Institute of Technology Bombay', code: 'IITB', description: 'Leading institute for engineering and technology', location: 'Mumbai', country: 'India', website: 'https://www.iitb.ac.in', applicationFee: 2000, isActive: true },
        { name: 'Indian Institute of Technology Madras', code: 'IITM', description: 'Top-ranked engineering institute', location: 'Chennai', country: 'India', website: 'https://www.iitm.ac.in', applicationFee: 2000, isActive: true },
        { name: 'Indian Institute of Technology Kanpur', code: 'IITK', description: 'Premier institute for engineering education', location: 'Kanpur', country: 'India', website: 'https://www.iitk.ac.in', applicationFee: 2000, isActive: true },
        { name: 'Indian Institute of Technology Kharagpur', code: 'IITKGP', description: 'Oldest IIT, excellence in engineering', location: 'Kharagpur', country: 'India', website: 'https://www.iitkgp.ac.in', applicationFee: 2000, isActive: true },
        { name: 'National Institute of Technology Tiruchirappalli', code: 'NITT', description: 'Premier NIT for engineering', location: 'Tiruchirappalli', country: 'India', website: 'https://www.nitt.edu', applicationFee: 1500, isActive: true },
        { name: 'National Institute of Technology Warangal', code: 'NITW', description: 'Leading NIT for technical education', location: 'Warangal', country: 'India', website: 'https://www.nitw.ac.in', applicationFee: 1500, isActive: true },
        { name: 'Delhi University', code: 'DU', description: 'Premier university for arts, science, and commerce', location: 'New Delhi', country: 'India', website: 'https://www.du.ac.in', applicationFee: 750, isActive: true },
        { name: 'Jawaharlal Nehru University', code: 'JNU', description: 'Leading university for social sciences and languages', location: 'New Delhi', country: 'India', website: 'https://www.jnu.ac.in', applicationFee: 1000, isActive: true },
        { name: 'University of Delhi', code: 'UD', description: 'Comprehensive university offering diverse programs', location: 'New Delhi', country: 'India', website: 'https://www.du.ac.in', applicationFee: 750, isActive: true },
        { name: 'Indian Institute of Science', code: 'IISc', description: 'Premier research institute for science and engineering', location: 'Bangalore', country: 'India', website: 'https://www.iisc.ac.in', applicationFee: 2500, isActive: true },
        { name: 'Birla Institute of Technology and Science', code: 'BITS', description: 'Private engineering institute', location: 'Pilani', country: 'India', website: 'https://www.bits-pilani.ac.in', applicationFee: 3000, isActive: true }
      ];

      for (const uni of universities) {
        const [university, created] = await University.findOrCreate({
          where: { code: uni.code },
          defaults: uni
        });
        if (created) {
          console.log(`  ✅ Created: ${university.name}`);
        }
      }
      console.log('✅ Universities seeded');
    } else {
      console.log(`ℹ️  Universities already exist (${universityCount} found)`);
    }
    
    // Create admin if doesn't exist
    if (adminCount === 0) {
      console.log('👤 Creating admin user...');
      const email = 'admin@university.edu';
      const password = 'admin123';
      
      const admin = await User.create({
        email,
        password,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      
      console.log('✅ Admin user created');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.log(`ℹ️  Admin user already exists (${adminCount} found)`);
    }
    
    console.log('✨ Database initialization completed!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initializeDatabase;
