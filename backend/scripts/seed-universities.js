const { sequelize, University } = require('../models');
require('dotenv').config();

const seedUniversities = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established for seeding.');

    // Ensure tables are created before seeding
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized for seeding.');

    const universities = [
      {
        name: 'Indian Institute of Technology Delhi',
        code: 'IITD',
        description: 'Premier engineering and technology institute',
        location: 'New Delhi',
        country: 'India',
        website: 'https://www.iitd.ac.in',
        applicationFee: 2000,
        isActive: true
      },
      {
        name: 'Indian Institute of Technology Bombay',
        code: 'IITB',
        description: 'Leading institute for engineering and technology',
        location: 'Mumbai',
        country: 'India',
        website: 'https://www.iitb.ac.in',
        applicationFee: 2000,
        isActive: true
      },
      {
        name: 'Indian Institute of Technology Madras',
        code: 'IITM',
        description: 'Top-ranked engineering institute',
        location: 'Chennai',
        country: 'India',
        website: 'https://www.iitm.ac.in',
        applicationFee: 2000,
        isActive: true
      },
      {
        name: 'Indian Institute of Technology Kanpur',
        code: 'IITK',
        description: 'Premier institute for engineering education',
        location: 'Kanpur',
        country: 'India',
        website: 'https://www.iitk.ac.in',
        applicationFee: 2000,
        isActive: true
      },
      {
        name: 'Indian Institute of Technology Kharagpur',
        code: 'IITKGP',
        description: 'Oldest IIT, excellence in engineering',
        location: 'Kharagpur',
        country: 'India',
        website: 'https://www.iitkgp.ac.in',
        applicationFee: 2000,
        isActive: true
      },
      {
        name: 'National Institute of Technology Tiruchirappalli',
        code: 'NITT',
        description: 'Premier NIT for engineering',
        location: 'Tiruchirappalli',
        country: 'India',
        website: 'https://www.nitt.edu',
        applicationFee: 1500,
        isActive: true
      },
      {
        name: 'National Institute of Technology Warangal',
        code: 'NITW',
        description: 'Leading NIT for technical education',
        location: 'Warangal',
        country: 'India',
        website: 'https://www.nitw.ac.in',
        applicationFee: 1500,
        isActive: true
      },
      {
        name: 'Delhi University',
        code: 'DU',
        description: 'Premier university for arts, science, and commerce',
        location: 'New Delhi',
        country: 'India',
        website: 'https://www.du.ac.in',
        applicationFee: 750,
        isActive: true
      },
      {
        name: 'Jawaharlal Nehru University',
        code: 'JNU',
        description: 'Leading university for social sciences and languages',
        location: 'New Delhi',
        country: 'India',
        website: 'https://www.jnu.ac.in',
        applicationFee: 1000,
        isActive: true
      },
      {
        name: 'University of Delhi',
        code: 'UD',
        description: 'Comprehensive university offering diverse programs',
        location: 'New Delhi',
        country: 'India',
        website: 'https://www.du.ac.in',
        applicationFee: 750,
        isActive: true
      },
      {
        name: 'Indian Institute of Science',
        code: 'IISc',
        description: 'Premier research institute for science and engineering',
        location: 'Bangalore',
        country: 'India',
        website: 'https://www.iisc.ac.in',
        applicationFee: 2500,
        isActive: true
      },
      {
        name: 'Birla Institute of Technology and Science',
        code: 'BITS',
        description: 'Private engineering institute',
        location: 'Pilani',
        country: 'India',
        website: 'https://www.bits-pilani.ac.in',
        applicationFee: 3000,
        isActive: true
      }
    ];

    for (const uni of universities) {
      const [university, created] = await University.findOrCreate({
        where: { code: uni.code },
        defaults: uni
      });

      if (created) {
        console.log(`✅ Created: ${university.name}`);
      } else {
        console.log(`⏭️  Already exists: ${university.name}`);
      }
    }

    console.log('\n✅ Universities seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding universities:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

seedUniversities();

