#!/bin/bash

# Database setup script for UG Gym Management System
# This script creates the database and runs the migrations

echo "🏗️  Setting up University of Ghana Gym Database..."

# Database configuration
DB_NAME="ug_gym_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5433"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL and try again"
    exit 1
fi

# Check if we can connect to PostgreSQL
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c '\q' 2>/dev/null; then
    echo "❌ Cannot connect to PostgreSQL"
    echo "Please ensure PostgreSQL is running and you have the correct credentials"
    echo "You may need to:"
    echo "  1. Start PostgreSQL service"
    echo "  2. Update your .env file with correct database credentials"
    echo "  3. Ensure the user has database creation privileges"
    exit 1
fi

echo "✅ PostgreSQL connection successful"

# Create database if it doesn't exist
echo "📊 Creating database: $DB_NAME"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
    echo "✅ Database '$DB_NAME' created"
}

# Run migrations
echo "🔄 Running database migrations..."

echo "  📋 Creating user tables..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/001_create_users_tables.sql; then
    echo "  ✅ User tables created successfully"
else
    echo "  ❌ Failed to create user tables"
    exit 1
fi

echo "  👥 Adding sample university data..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/002_sample_university_data.sql; then
    echo "  ✅ Sample university data added successfully"
else
    echo "  ❌ Failed to add sample university data"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📋 Sample University IDs for testing:"
echo "  Students (Active):"
echo "    • 10001234 - John Doe (Computer Science, Level 400)"
echo "    • 10005678 - Jane Smith (Business Administration, Level 300)"
echo "    • 10009876 - Kwame Asante (Medicine, Level 200)"
echo "    • 10001111 - Akosua Mensah (Law, Level 100)"
echo "    • 10002222 - Emmanuel Osei (Engineering, Level 400)"
echo ""
echo "  Students (Expired/Graduated):"
echo "    • 10000001 - Kofi Asamoah (Graduated)"
echo "    • 10000002 - Ama Boateng (Graduated)"
echo ""
echo "  Staff:"
echo "    • 20001234 - Dr. Michael Johnson"
echo "    • 20005678 - Prof. Sarah Williams"
echo "    • 20009999 - Dr. Kwaku Adjei"
echo ""
echo "🚀 You can now start the development server with: npm run dev"