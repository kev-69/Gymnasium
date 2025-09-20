-- Migration for subscription plans data
-- File: 004_insert_subscription_plans.sql

-- Insert Student Plans
INSERT INTO
    subscription_plans (
        name,
        user_type,
        duration_type,
        price_cedis,
        duration_days,
        description
    )
VALUES (
        'Student Walk-in',
        'student',
        'walk-in',
        10.00,
        1,
        'Single day access for students'
    ),
    (
        'Student Monthly',
        'student',
        'monthly',
        100.00,
        30,
        '30-day unlimited access for students'
    ),
    (
        'Student Semester',
        'student',
        'semester',
        250.00,
        120,
        '4-month semester access for students'
    ),
    (
        'Student Half Year',
        'student',
        'half-year',
        400.00,
        180,
        '6-month access for students'
    ),
    (
        'Student Yearly',
        'student',
        'yearly',
        700.00,
        365,
        '12-month unlimited access for students'
    );

-- Insert Staff Plans
INSERT INTO
    subscription_plans (
        name,
        user_type,
        duration_type,
        price_cedis,
        duration_days,
        description
    )
VALUES (
        'Staff Walk-in',
        'staff',
        'walk-in',
        15.00,
        1,
        'Single day access for university staff'
    ),
    (
        'Staff Monthly',
        'staff',
        'monthly',
        160.00,
        30,
        '30-day unlimited access for university staff'
    ),
    (
        'Staff Semester',
        'staff',
        'semester',
        400.00,
        120,
        '4-month semester access for university staff'
    ),
    (
        'Staff Half Year',
        'staff',
        'half-year',
        700.00,
        180,
        '6-month access for university staff'
    ),
    (
        'Staff Yearly',
        'staff',
        'yearly',
        1200.00,
        365,
        '12-month unlimited access for university staff'
    );

-- Insert Public Plans
INSERT INTO
    subscription_plans (
        name,
        user_type,
        duration_type,
        price_cedis,
        duration_days,
        description
    )
VALUES (
        'Public Walk-in',
        'public',
        'walk-in',
        25.00,
        1,
        'Single day access for public users'
    ),
    (
        'Public Monthly',
        'public',
        'monthly',
        300.00,
        30,
        '30-day unlimited access for public users'
    ),
    (
        'Public Semester',
        'public',
        'semester',
        750.00,
        120,
        '4-month access for public users'
    ),
    (
        'Public Half Year',
        'public',
        'half-year',
        1300.00,
        180,
        '6-month access for public users'
    ),
    (
        'Public Yearly',
        'public',
        'yearly',
        2200.00,
        365,
        '12-month unlimited access for public users'
    );

-- Display inserted plans for verification
SELECT
    user_type,
    duration_type,
    name,
    price_cedis || ' GHS' as price,
    duration_days || ' days' as duration
FROM subscription_plans
ORDER BY
    CASE user_type
        WHEN 'student' THEN 1
        WHEN 'staff' THEN 2
        WHEN 'public' THEN 3
    END,
    CASE duration_type
        WHEN 'walk-in' THEN 1
        WHEN 'monthly' THEN 2
        WHEN 'semester' THEN 3
        WHEN 'half-year' THEN 4
        WHEN 'yearly' THEN 5
    END;