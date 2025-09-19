# University of Ghana Gym Management System - Backend

A comprehensive backend API for managing gym access and memberships for the University of Ghana, supporting both public users and university members (students & staff).

## Features

- **Dual Authentication System**
  - Public users: Email/password registration and login
  - University members: 8-digit ID/PIN registration and login
- **University Database Integration**
  - Automatic profile filling for university members
  - Student and staff differentiation
- **Secure Authentication**
  - JWT-based authentication
  - Password/PIN hashing with bcrypt
  - Rate limiting and security headers
- **Input Validation**
  - Comprehensive request validation
  - Ghana phone number validation
  - University ID format validation

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (v13+ recommended)
- npm or yarn

## Installation

### Option A: Docker Setup (Recommended)

1. **Install Docker Desktop**

   - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
   - Ensure Docker is running

2. **Clone and navigate to the backend directory**

   ```bash
   cd backend
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Quick Docker setup**

   ```bash
   # Windows
   npm run setup-db-docker-win

   # Linux/Mac
   npm run setup-db-docker
   ```

   This automatically:

   - Starts PostgreSQL in a Docker container
   - Creates the database
   - Runs all migrations
   - Sets up sample data

5. **Start the development server**
   ```bash
   npm run dev
   ```

For detailed Docker instructions, see [DOCKER_SETUP.md](./DOCKER_SETUP.md)

### Option B: Local PostgreSQL Setup

1. **Clone and navigate to the backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database credentials.

4. **Set up databases**

   ```bash
   # Windows
   setup-database.bat

   # Linux/Mac
   setup-database.sh
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

For detailed local database instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

The API will be available at `http://localhost:5000`

## Environment Variables

### Docker Setup (Default)

Copy `.env.example` to `.env` - Docker credentials are pre-configured:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database (Docker)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ug_gym_db
DB_USER=postgres
DB_PASSWORD=gympassword123

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Local PostgreSQL Setup

For local database setup, edit these values in `.env`:

```env
# Database (Local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ug_gym_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# University Database (if using separate database)
UNI_DB_HOST=localhost
UNI_DB_PORT=5432
UNI_DB_NAME=university_db
UNI_DB_USER=uni_user
UNI_DB_PASSWORD=uni_password
```

## API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### 1. Public User Registration

```http
POST /auth/register/public
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+233244123456",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Public user registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+233244123456",
      "userType": "public",
      "isActive": true
    },
    "token": "jwt_token_here"
  }
}
```

#### 2. University ID Lookup

```http
POST /auth/lookup/university-id
Content-Type: application/json

{
  "universityId": "10001234"
}
```

**Response:**

```json
{
  "success": true,
  "message": "University member found",
  "data": {
    "found": true,
    "data": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@ug.edu.gh",
      "hallOfResidence": "Legon Hall",
      "userType": "student"
    }
  }
}
```

#### 3. University Member Registration

```http
POST /auth/register/university
Content-Type: application/json

{
  "universityId": "10001234",
  "pin": "1234"
}
```

#### 4. Login (Auto-detect)

```http
POST /auth/login
Content-Type: application/json

# For public users
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}

# For university members
{
  "universityId": "10001234",
  "pin": "1234"
}
```

#### 5. Get User Profile

```http
GET /auth/profile
Authorization: Bearer jwt_token_here
```

#### 6. Logout

```http
POST /auth/logout
```

### Health Check

```http
GET /health
```

## Database Schema

### Public Users Table

```sql
CREATE TABLE public_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(10) DEFAULT 'public',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### University Users Table

```sql
CREATE TABLE university_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id VARCHAR(8) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hall_of_residence VARCHAR(100),
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('student', 'staff')),
    pin_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start production server
- `npm test` - Run tests

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── authController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── models/
│   │   └── User.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   └── index.ts
│   ├── services/
│   │   └── authService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── auth.ts
│   └── index.ts
├── migrations/
│   ├── 001_create_users_tables.sql
│   └── 002_sample_university_data.sql
├── package.json
├── tsconfig.json
└── .env.example
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, and numbers
- **JWT Security**: Signed tokens with expiration
- **Input Sanitization**: XSS protection
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Sample University Data

The system includes sample university data for testing:

- Student ID: `10001234` (John Doe, Legon Hall)
- Student ID: `10005678` (Jane Smith, Commonwealth Hall)
- Staff ID: `20001234` (Dr. Michael Johnson)
- Staff ID: `20005678` (Prof. Sarah Williams)

## Next Steps

1. **Frontend Integration**: Connect with React/Next.js frontend
2. **Gym Features**: Add booking, equipment tracking, membership management
3. **Admin Panel**: Administrative interface for gym management
4. **Real University Integration**: Connect to actual university database
5. **Mobile App**: React Native mobile application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
