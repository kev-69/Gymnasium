@echo off
REM Docker-based PostgreSQL setup script for UG Gym Management System (Windows)
REM This script sets up PostgreSQL using Docker and runs the migrations

echo 🐳 Setting up University of Ghana Gym Database with Docker...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed
    echo Please install Docker Desktop and try again
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker is available

REM Check if Docker daemon is running
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker daemon is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo ✅ Docker daemon is running

REM Stop any existing containers
echo 🛑 Stopping any existing containers...
docker-compose down >nul 2>nul
docker compose down >nul 2>nul

REM Build and start PostgreSQL container
echo 🚀 Starting PostgreSQL container...
docker-compose up -d postgres
if %ERRORLEVEL% NEQ 0 (
    docker compose up -d postgres
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to start PostgreSQL container
        pause
        exit /b 1
    )
)

echo ✅ PostgreSQL container started

REM Wait for PostgreSQL to be ready
echo ⏳ Waiting for PostgreSQL to be ready...
set timeout=60
set count=0

:wait_loop
if %count% GEQ %timeout% (
    echo ❌ PostgreSQL failed to start within %timeout% seconds
    echo Check container logs: docker logs ug_gym_postgres
    pause
    exit /b 1
)

docker exec ug_gym_postgres pg_isready -U postgres -d ug_gym_db >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ PostgreSQL is ready
    goto ready
)

echo   ... waiting (%count%s/%timeout%s)
timeout /t 2 /nobreak >nul
set /a count=%count%+2
goto wait_loop

:ready
REM The migrations are automatically run by Docker's init scripts
echo 📊 Database and migrations are automatically applied on first run

REM Verify the setup
echo 🔍 Verifying database setup...
docker exec ug_gym_postgres psql -U postgres -d ug_gym_db -c "\dt" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Database tables verified
) else (
    echo ❌ Database verification failed
    pause
    exit /b 1
)

echo.
echo 🎉 Docker PostgreSQL setup completed successfully!
echo.
echo 📋 Database Connection Details:
echo   Host: localhost
echo   Port: 5432
echo   Database: ug_gym_db
echo   Username: postgres
echo   Password: gympassword123
echo.
echo 🔧 Useful Docker Commands:
echo   Start database:    docker-compose up -d postgres
echo   Stop database:     docker-compose down
echo   View logs:         docker logs ug_gym_postgres
echo   Access database:   docker exec -it ug_gym_postgres psql -U postgres -d ug_gym_db
echo   Restart database:  docker-compose restart postgres
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
echo 🎛️  Optional: Start pgAdmin for database management:
echo   docker-compose --profile admin up -d
echo   Access at: http://localhost:8080
echo   Email: admin@ugym.local, Password: admin123
echo.
echo 🚀 You can now start the development server with: npm run dev
pause