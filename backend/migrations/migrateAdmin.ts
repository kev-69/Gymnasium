import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../src/config/database';

async function runAdminMigrations() {
  try {
    console.log('Starting admin migrations...');
    
    const migrations = [
      '005_create_admin_users_table.sql',
      '006_insert_admin_users.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`Running migration: ${migrationFile}`);
      
      try {
        const migrationSQL = readFileSync(
          join(__dirname, migrationFile),
          'utf8'
        );
        
        await db.query(migrationSQL);
        console.log(`✅ ${migrationFile} completed`);
      } catch (error: any) {
        if (error.code === '42P07') {
          console.log(`⚠️  ${migrationFile} skipped (table already exists)`);
        } else if (error.code === '23505') {
          console.log(`⚠️  ${migrationFile} skipped (data already exists)`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('🎉 Admin migrations completed successfully');
    
    // Close connection
    await db.end();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin migration failed:', error);
    process.exit(1);
  }
}

runAdminMigrations();