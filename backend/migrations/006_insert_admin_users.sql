-- Insert default admin users
-- Password for all accounts is 'admin123' (hashed with bcrypt)
INSERT INTO
    admin_users (
        email,
        password_hash,
        first_name,
        last_name,
        role
    )
VALUES (
        'admin@ug.edu.gh',
        '$2b$10$rOvHrKkrQJjDQyGzEKZQjOxKxjYmGcDyWkKC9HZT9K4UZHrK5XHGK',
        'System',
        'Administrator',
        'super_admin'
    ),
    (
        'gym.admin@ug.edu.gh',
        '$2b$10$rOvHrKkrQJjDQyGzEKZQjOxKxjYmGcDyWkKC9HZT9K4UZHrK5XHGK',
        'Gym',
        'Manager',
        'admin'
    ),
    (
        'sports.admin@ug.edu.gh',
        '$2b$10$rOvHrKkrQJjDQyGzEKZQjOxKxjYmGcDyWkKC9HZT9K4UZHrK5XHGK',
        'Sports',
        'Director',
        'admin'
    ) ON CONFLICT (email) DO NOTHING;

-- Note: In production, these passwords should be changed immediately
-- The bcrypt hash above corresponds to the password 'admin123'