# Database Setup Guide

## Prerequisites

1. **PostgreSQL Installation**

   - Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
   - Ensure `psql` command is available in your PATH
   - Start the PostgreSQL service

2. **Database User Setup**
   - Ensure you have a PostgreSQL user with database creation privileges
   - Default setup uses `postgres` user (you can change this in `.env`)

## Quick Setup

### Option 1: Automated Setup (Recommended)

**For Windows:**

```bash
npm run setup-db-win
```

**For Linux/Mac:**

```bash
npm run setup-db
```

This will:

- Create the `ug_gym_db` database
- Run all migrations
- Insert sample university data
- Display test student IDs

### Option 2: Manual Setup

1. **Create the database:**

   ```sql
   CREATE DATABASE ug_gym_db;
   ```

2. **Run migrations:**

   ```bash
   # Create user tables
   psql -U postgres -d ug_gym_db -f migrations/001_create_users_tables.sql

   # Add sample university data
   psql -U postgres -d ug_gym_db -f migrations/002_sample_university_data.sql
   ```

3. **Update environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

## Sample University Data

The setup includes realistic test data:

### 📚 **Active Students** (Can register for gym)

- **10001234** - John Doe (Computer Science, Level 400, expires 2025-07-31)
- **10005678** - Jane Smith (Business Administration, Level 300, expires 2026-07-31)
- **10009876** - Kwame Asante (Medicine, Level 200, expires 2027-07-31)
- **10001111** - Akosua Mensah (Law, Level 100, expires 2028-07-31)
- **10002222** - Emmanuel Osei (Engineering, Level 400, expires 2024-07-31)

### 🎓 **Graduated Students** (Cannot register - expired)

- **10000001** - Kofi Asamoah (Computer Science, graduated 2022)
- **10000002** - Ama Boateng (Economics, graduated 2021)

### 👨‍🏫 **Staff Members** (No expiry)

- **20001234** - Dr. Michael Johnson (Computer Science Department)
- **20005678** - Prof. Sarah Williams (Department of Finance)
- **20009999** - Dr. Kwaku Adjei (Department of Medicine)

## Database Schema

### University Members Table

```sql
university_members (
    id VARCHAR(8) PRIMARY KEY,           -- University ID
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    hall_of_residence VARCHAR(100),      -- For students
    member_type VARCHAR(10),             -- 'student' or 'staff'
    pin_hash VARCHAR(255),               -- Encrypted PIN
    issue_date DATE,                     -- When ID was issued
    expiry_date DATE,                    -- When ID expires (NULL for staff)
    academic_year VARCHAR(20),           -- e.g., "2024/2025"
    program VARCHAR(100),                -- e.g., "Computer Science"
    level VARCHAR(20),                   -- e.g., "Level 400"
    faculty VARCHAR(100),                -- e.g., "Faculty of Physical Sciences"
    department VARCHAR(100),             -- e.g., "Computer Science Department"
    status VARCHAR(20),                  -- 'active', 'graduated', 'suspended', 'inactive'
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Validation Rules

### Student ID Validation

1. **Format**: Must be exactly 8 digits
2. **Active Status**: `status` must be 'active'
3. **Not Expired**: Current date must be before `expiry_date`
4. **Not Graduated**: Students with 'graduated' status cannot register

### Staff ID Validation

1. **Format**: Must be exactly 8 digits (usually starts with '2')
2. **Active Status**: `status` must be 'active'
3. **No Expiry**: Staff members don't have expiry dates

## API Testing

Once the database is set up, test the university ID lookup:

```bash
curl -X POST http://localhost:5000/api/v1/auth/lookup/university-id \
  -H "Content-Type: application/json" \
  -d '{"universityId": "10001234"}'
```

Expected response for active student:

```json
{
  "success": true,
  "message": "University member found",
  "data": {
    "found": true,
    "isExpired": false,
    "data": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@st.ug.edu.gh",
      "hallOfResidence": "Legon Hall",
      "userType": "student",
      "issueDate": "2021-09-01",
      "expiryDate": "2025-07-31",
      "academicYear": "2024/2025",
      "program": "Computer Science",
      "level": "Level 400",
      "faculty": "Faculty of Physical Sciences",
      "department": "Computer Science Department",
      "status": "active"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure PostgreSQL is running and credentials are correct
2. **Permission Error**: User needs `CREATEDB` privilege
3. **Port Conflict**: Check if port 5432 is available or update `.env`

### Database Connection Test

```bash
# Test connection
psql -h localhost -p 5432 -U postgres -c "SELECT version();"
```

## Environment Configuration

Update your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ug_gym_db
DB_USER=postgres
DB_PASSWORD=your_password
```
