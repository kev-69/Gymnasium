import { readFileSync } from 'fs';
import { join } from 'path';
import { gymDb, universityDb } from '../src/config/database';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read and execute gym database migration
    const gymMigration = readFileSync(
      join(__dirname, '001_create_users_tables.sql'),
      'utf8'
    );
    
    await gymDb.query(gymMigration);
    console.log('✅ Gym database migration completed');
    
    // Read and execute university database migration
    const uniMigration = readFileSync(
      join(__dirname, '002_sample_university_data.sql'),
      'utf8'
    );
    
    await universityDb.query(uniMigration);
    console.log('✅ University database migration completed');
    
    console.log('🎉 All migrations completed successfully');
    
    // Close connections
    await gymDb.end();
    await universityDb.end();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();