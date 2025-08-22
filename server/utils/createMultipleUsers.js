import { connectToDatabase } from '../lib/db.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

// Script to create multiple test users for concurrent testing
// Usage: node utils/createMultipleUsers.js

const createMultipleUsers = async () => {
  let connection;
  try {
    connection = await connectToDatabase();
    
    // Define test users with different roles
    const testUsers = [
      {
        username: 'admin_user',
        password: 'admin123',
        role: 'admin',
        description: 'Administrator with full access'
      },
      {
        username: 'content_manager',
        password: 'content123',
        role: 'content_manager',
        description: 'Content manager with content and file permissions'
      },
      {
        username: 'branch_manager',
        password: 'branch123',
        role: 'branch_manager',
        description: 'Branch manager with branch management permissions'
      },
      {
        username: 'viewer_user',
        password: 'viewer123',
        role: 'viewer',
        description: 'Viewer with read-only access'
      },
      {
        username: 'test_user1',
        password: 'test123',
        role: 'content_manager',
        description: 'Test user 1 for concurrent testing'
      },
      {
        username: 'test_user2',
        password: 'test123',
        role: 'branch_manager',
        description: 'Test user 2 for concurrent testing'
      }
    ];
    
    console.log('🚀 Creating multiple test users...\n');
    
    for (const user of testUsers) {
      // Check if user already exists
      const [existingUser] = await connection.execute(
        'SELECT id, username, role FROM users WHERE username = ?',
        [user.username]
      );
      
      if (existingUser.length > 0) {
        console.log(`⚠️  User '${user.username}' already exists`);
        console.log(`   ID: ${existingUser[0].id}, Role: ${existingUser[0].role}\n`);
        continue;
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Create user
      const [result] = await connection.execute(
        'INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())',
        [user.username, hashedPassword, user.role]
      );
      
      console.log(`✅ Created user: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${result.insertId}`);
      console.log(`   Description: ${user.description}\n`);
    }
    
    console.log('🎉 All users created successfully!');
    console.log('\n📋 Quick Reference:');
    console.log('┌─────────────────┬──────────────┬─────────────────┐');
    console.log('│ Username        │ Password     │ Role            │');
    console.log('├─────────────────┼──────────────┼─────────────────┤');
    
    for (const user of testUsers) {
      console.log(`│ ${user.username.padEnd(15)} │ ${user.password.padEnd(12)} │ ${user.role.padEnd(15)} │`);
    }
    console.log('└─────────────────┴──────────────┴─────────────────┘');
    
    console.log('\n🔧 Testing Concurrent Users:');
    console.log('1. Open 3 different browsers or incognito windows');
    console.log('2. Login with different users simultaneously');
    console.log('3. Test branch management, content editing, etc.');
    console.log('\n⚠️  IMPORTANT: Change passwords in production!');
    
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
};

// Run the script
createMultipleUsers();
