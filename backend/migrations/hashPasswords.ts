import bcrypt from 'bcrypt';
import { db } from '../src/config/database';

async function hashAdminPasswords() {
  try {
    console.log('Updating admin passwords with proper hashes...');
    
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const updateQuery = `
      UPDATE admin_users 
      SET password_hash = $1 
      WHERE email IN ('admin@ug.edu.gh', 'gym.admin@ug.edu.gh', 'sports.admin@ug.edu.gh')
    `;
    
    await db.query(updateQuery, [hashedPassword]);
    
    console.log('✅ Admin passwords updated with proper bcrypt hashes');
    console.log('📝 Login credentials:');
    console.log('   Email: admin@ug.edu.gh');
    console.log('   Password: admin123');
    console.log('   (Please change these passwords in production!)');
    
    // Close connection
    await db.end();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Password hashing failed:', error);
    process.exit(1);
  }
}

hashAdminPasswords();