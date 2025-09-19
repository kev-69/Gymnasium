import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Single database connection for both gym and university data
export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ug_gym_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Aliases for backwards compatibility
export const gymDb = db;
export const universityDb = db;

// Test database connection
export const testConnections = async () => {
  try {
    await db.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

// Graceful shutdown
export const closeConnections = async () => {
  await db.end();
  console.log('Database connection closed');
};