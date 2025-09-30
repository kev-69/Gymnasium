import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../src/config/database';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    const migrations = [
      '001_create_users_tables.sql',
      '002_sample_university_data.sql',
      '003_create_subscription_tables.sql',
      '004_insert_subscription_plans.sql',
      '005_create_admin_users_table.sql',
      '006_insert_admin_users.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`Running migration: ${migrationFile}`);
      
      const migrationSQL = readFileSync(
        join(__dirname, migrationFile),
        'utf8'
      );
      
      await db.query(migrationSQL);
      console.log(`✅ ${migrationFile} completed`);
    }
    
    console.log('🎉 All migrations completed successfully');
    
    // Close connection
    await db.end();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();