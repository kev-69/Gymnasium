#!/bin/bash

# Docker-based PostgreSQL setup script for UG Gym Management System
# This script sets up PostgreSQL using Docker and runs the migrations

echo "🐳 Setting up University of Ghana Gym Database with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker Desktop and try again"
    echo "Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available"
    echo "Please ensure Docker Compose is installed"
    exit 1
fi

echo "✅ Docker is available"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker daemon is running"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Build and start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres
else
    docker compose up -d postgres
fi

if [ $? -ne 0 ]; then
    echo "❌ Failed to start PostgreSQL container"
    exit 1
fi

echo "✅ PostgreSQL container started"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=60
count=0

while [ $count -lt $timeout ]; do
    if docker exec ug_gym_postgres pg_isready -U postgres -d ug_gym_db >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    
    echo "  ... waiting (${count}s/${timeout}s)"
    sleep 2
    count=$((count + 2))
done

if [ $count -ge $timeout ]; then
    echo "❌ PostgreSQL failed to start within ${timeout} seconds"
    echo "Check container logs: docker logs ug_gym_postgres"
    exit 1
fi

# The migrations are automatically run by Docker's init scripts
echo "📊 Database and migrations are automatically applied on first run"

# Verify the setup
echo "🔍 Verifying database setup..."
if docker exec ug_gym_postgres psql -U postgres -d ug_gym_db -c "\dt" >/dev/null 2>&1; then
    echo "✅ Database tables verified"
else
    echo "❌ Database verification failed"
    exit 1
fi

echo ""
echo "🎉 Docker PostgreSQL setup completed successfully!"
echo ""
echo "📋 Database Connection Details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: ug_gym_db"
echo "  Username: postgres"
echo "  Password: gympassword123"
echo ""
echo "🔧 Useful Docker Commands:"
echo "  Start database:    docker-compose up -d postgres"
echo "  Stop database:     docker-compose down"
echo "  View logs:         docker logs ug_gym_postgres"
echo "  Access database:   docker exec -it ug_gym_postgres psql -U postgres -d ug_gym_db"
echo "  Restart database:  docker-compose restart postgres"
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
echo "🎛️  Optional: Start pgAdmin for database management:"
echo "  docker-compose --profile admin up -d"
echo "  Access at: http://localhost:8080"
echo "  Email: admin@ugym.local, Password: admin123"
echo ""
echo "🚀 You can now start the development server with: npm run dev"