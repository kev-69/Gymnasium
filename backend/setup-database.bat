@echo off
REM Database setup script for UG Gym Management System (Windows)
REM This script creates the database and runs the migrations

echo 🏗️  Setting up University of Ghana Gym Database...

REM Database configuration
set DB_NAME=ug_gym_db
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

REM Check if PostgreSQL is available
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL and try again
    pause
    exit /b 1
)

echo ✅ PostgreSQL found

REM Check connection
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "\q" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Cannot connect to PostgreSQL
    echo Please ensure PostgreSQL is running and you have the correct credentials
    echo You may need to:
    echo   1. Start PostgreSQL service
    echo   2. Update your .env file with correct database credentials
    echo   3. Ensure the user has database creation privileges
    pause
    exit /b 1
)

echo ✅ PostgreSQL connection successful

REM Create database if it doesn't exist
echo 📊 Creating database: %DB_NAME%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | find "1" >nul
if %ERRORLEVEL% NEQ 0 (
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"
    echo ✅ Database '%DB_NAME%' created
) else (
    echo ✅ Database '%DB_NAME%' already exists
)

REM Run migrations
echo 🔄 Running database migrations...

echo   📋 Creating user tables...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f migrations/001_create_users_tables.sql
if %ERRORLEVEL% EQU 0 (
    echo   ✅ User tables created successfully
) else (
    echo   ❌ Failed to create user tables
    pause
    exit /b 1
)

echo   👥 Adding sample university data...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f migrations/002_sample_university_data.sql
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Sample university data added successfully
) else (
    echo   ❌ Failed to add sample university data
    pause
    exit /b 1
)

echo.
echo 🎉 Database setup completed successfully!
echo.
echo 📋 Sample University IDs for testing:
echo   Students (Active):
echo     • 10001234 - John Doe (Computer Science, Level 400)
echo     • 10005678 - Jane Smith (Business Administration, Level 300)
echo     • 10009876 - Kwame Asante (Medicine, Level 200)
echo     • 10001111 - Akosua Mensah (Law, Level 100)
echo     • 10002222 - Emmanuel Osei (Engineering, Level 400)
echo.
echo   Students (Expired/Graduated):
echo     • 10000001 - Kofi Asamoah (Graduated)
echo     • 10000002 - Ama Boateng (Graduated)
echo.
echo   Staff:
echo     • 20001234 - Dr. Michael Johnson
echo     • 20005678 - Prof. Sarah Williams
echo     • 20009999 - Dr. Kwaku Adjei
echo.
echo 🚀 You can now start the development server with: npm run dev
pause