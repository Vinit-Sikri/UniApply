const { sequelize, User } = require('../models');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = process.argv[2] || 'admin@university.edu';
    const password = process.argv[3] || 'admin123';
    const firstName = process.argv[4] || 'Admin';
    const lastName = process.argv[5] || 'User';
    const role = process.argv[6] || 'admin'; // 'admin' or 'super_admin'

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email } });
    if (existingAdmin) {
      console.log(`⚠️  User with email ${email} already exists.`);
      console.log(`   Current role: ${existingAdmin.role}`);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin' && existingAdmin.role !== 'super_admin') {
        await existingAdmin.update({ role });
        console.log(`✅ Updated user role to: ${role}`);
      } else {
        console.log(`   User is already an admin.`);
      }
      
      // Update password if provided
      if (process.argv[3]) {
        existingAdmin.password = password;
        await existingAdmin.save();
        console.log(`✅ Password updated`);
      }
      
      process.exit(0);
    }

    // Create new admin user
    const admin = await User.create({
      email,
      password,
      firstName,
      lastName,
      role
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`\n🔗 Access admin panel at: http://localhost:3000/admin`);
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

createAdmin();

