-- Create database schema for UG Gym Management System

-- Create public users table
CREATE TABLE IF NOT EXISTS public_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(10) DEFAULT 'public' CHECK (user_type = 'public'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create university users table
CREATE TABLE IF NOT EXISTS university_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    university_id VARCHAR(8) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hall_of_residence VARCHAR(100),
    user_type VARCHAR(10) NOT NULL CHECK (
        user_type IN ('student', 'staff')
    ),
    pin_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_public_users_email ON public_users (email);

CREATE INDEX IF NOT EXISTS idx_public_users_active ON public_users (is_active);

CREATE INDEX IF NOT EXISTS idx_university_users_id ON university_users (university_id);

CREATE INDEX IF NOT EXISTS idx_university_users_email ON university_users (email);

CREATE INDEX IF NOT EXISTS idx_university_users_type ON university_users (user_type);

CREATE INDEX IF NOT EXISTS idx_university_users_active ON university_users (is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_public_users_updated_at
    BEFORE UPDATE ON public_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_university_users_updated_at
    BEFORE UPDATE ON university_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();