import { connectToDatabase } from '../lib/db.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

// Script to create an admin user
// Usage: node utils/createAdmin.js

const createAdminUser = async () => {
  let connection;
  try {
    // Configuration - Change these values as needed
    const adminUsername = 'admin';
    const adminPassword = 'admin123'; // Change this to a secure password
    
    connection = await connectToDatabase();
    
    // Check if admin user already exists
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [adminUsername]
    );
    
    if (existingAdmin.length > 0) {
      console.log(`Admin user '${adminUsername}' already exists with ID: ${existingAdmin[0].id}`);
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())',
      [adminUsername, hashedPassword, 'admin']
    );
    
    console.log(`✅ Admin user created successfully!`);
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   User ID: ${result.insertId}`);
    console.log(`   Role: admin`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
};

// Run the script
createAdminUser();
