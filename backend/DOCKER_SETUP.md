# Docker PostgreSQL Setup Guide

Using Docker for PostgreSQL eliminates installation issues and provides a consistent development environment across different operating systems.

## Prerequisites

1. **Docker Desktop**

   - Download and install from [docker.com](https://www.docker.com/products/docker-desktop/)
   - Ensure Docker is running before proceeding

2. **Docker Compose**
   - Included with Docker Desktop
   - Verify with: `docker-compose --version`

## Quick Setup (Recommended)

### Option 1: Automated Docker Setup

**For Windows:**

```bash
npm run setup-db-docker-win
```

**For Linux/Mac:**

```bash
npm run setup-db-docker
```

This will:

- Start PostgreSQL in a Docker container
- Create the `ug_gym_db` database
- Run all migrations automatically
- Display connection details and test data

### Option 2: Manual Docker Setup

1. **Start PostgreSQL container:**

   ```bash
   npm run docker:up
   # or
   docker-compose up -d postgres
   ```

2. **Copy environment file:**

   ```bash
   cp .env.example .env
   ```

3. **Wait for PostgreSQL to be ready:**

   ```bash
   # Check logs
   npm run docker:logs
   ```

4. **Migrations run automatically** on first container start

## Docker Configuration

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: ug_gym_postgres
    environment:
      POSTGRES_DB: ug_gym_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: gympassword123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d # Auto-run migrations
```

### Environment Variables (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ug_gym_db
DB_USER=postgres
DB_PASSWORD=gympassword123
```

## Useful Docker Commands

### Database Management

```bash
# Start PostgreSQL container
npm run docker:up
# or
docker-compose up -d postgres

# Stop PostgreSQL container
npm run docker:down
# or
docker-compose down

# View PostgreSQL logs
npm run docker:logs
# or
docker logs ug_gym_postgres

# Access PostgreSQL shell
npm run docker:psql
# or
docker exec -it ug_gym_postgres psql -U postgres -d ug_gym_db

# Restart PostgreSQL
docker-compose restart postgres
```

### Container Status

```bash
# List running containers
docker ps

# Check container health
docker inspect ug_gym_postgres

# Container resource usage
docker stats ug_gym_postgres
```

## Optional: pgAdmin (Database GUI)

Start pgAdmin for visual database management:

```bash
# Start with pgAdmin
docker-compose --profile admin up -d

# Access pgAdmin
# URL: http://localhost:8080
# Email: admin@ugym.local
# Password: admin123
```

### Adding Server in pgAdmin:

- **Host**: postgres (container name)
- **Port**: 5432
- **Database**: ug_gym_db
- **Username**: postgres
- **Password**: gympassword123

## Data Persistence

- **Volume**: `postgres_data` persists database data
- **Location**: Docker manages volume location
- **Backup**: Use `docker exec` with `pg_dump`

```bash
# Create backup
docker exec ug_gym_postgres pg_dump -U postgres ug_gym_db > backup.sql

# Restore backup
docker exec -i ug_gym_postgres psql -U postgres -d ug_gym_db < backup.sql
```

## Sample Data

The Docker setup automatically includes sample university data:

### 📚 **Active Students** (Can register)

- **10001234** - John Doe (Computer Science, Level 400)
- **10005678** - Jane Smith (Business Administration, Level 300)
- **10009876** - Kwame Asante (Medicine, Level 200)
- **10001111** - Akosua Mensah (Law, Level 100)
- **10002222** - Emmanuel Osei (Engineering, Level 400)

### 🎓 **Graduated Students** (Cannot register)

- **10000001** - Kofi Asamoah (Graduated 2022)
- **10000002** - Ama Boateng (Graduated 2021)

### 👨‍🏫 **Staff Members** (No expiry)

- **20001234** - Dr. Michael Johnson
- **20005678** - Prof. Sarah Williams
- **20009999** - Dr. Kwaku Adjei

## Testing the Setup

1. **Test database connection:**

   ```bash
   npm run docker:psql
   \dt  # List tables
   \q   # Quit
   ```

2. **Test API endpoint:**

   ```bash
   # Start the development server
   npm run dev

   # Test university ID lookup
   curl -X POST http://localhost:5000/api/v1/auth/lookup/university-id \
     -H "Content-Type: application/json" \
     -d '{"universityId": "10001234"}'
   ```

## Troubleshooting

### Common Issues

**Container won't start:**

```bash
# Check Docker daemon
docker info

# Check port conflicts
netstat -an | grep 5432
lsof -i :5432  # On Mac/Linux
```

**Permission errors:**

```bash
# Ensure Docker has proper permissions
docker run hello-world
```

**Connection refused:**

```bash
# Wait for container to be ready
docker exec ug_gym_postgres pg_isready -U postgres -d ug_gym_db

# Check container logs
docker logs ug_gym_postgres
```

**Migration issues:**

```bash
# Check init scripts
docker exec ug_gym_postgres ls -la /docker-entrypoint-initdb.d/

# Manually run migrations
docker exec ug_gym_postgres psql -U postgres -d ug_gym_db -f /docker-entrypoint-initdb.d/001_create_users_tables.sql
```

### Clean Reset

If you need to start fresh:

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes all data)
docker-compose down -v

# Remove images
docker rmi postgres:15-alpine

# Start fresh
npm run setup-db-docker
```

## Production Considerations

For production deployment:

1. **Change default passwords**
2. **Use environment-specific configs**
3. **Set up proper backup strategies**
4. **Configure SSL/TLS**
5. **Use Docker secrets for sensitive data**

## Benefits of Docker Setup

✅ **No local PostgreSQL installation required**  
✅ **Consistent environment across team members**  
✅ **Easy to reset and reproduce issues**  
✅ **Automatic migration running**  
✅ **Optional pgAdmin included**  
✅ **Data persistence with volumes**  
✅ **Easy backup and restore**
