-- Updated university database schema with comprehensive student/staff information
-- This simulates the university's student information system

-- Drop existing table if it exists
DROP TABLE IF EXISTS university_members;

-- Create comprehensive university members table
CREATE TABLE IF NOT EXISTS university_members (
    id VARCHAR(8) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hall_of_residence VARCHAR(100),
    member_type VARCHAR(10) NOT NULL CHECK (
        member_type IN ('student', 'staff')
    ),
    pin_hash VARCHAR(255), -- For authentication (encrypted)
    issue_date DATE NOT NULL, -- When the ID was issued
    expiry_date DATE, -- When the ID expires (NULL for staff)
    academic_year VARCHAR(20), -- e.g., "2023/2024"
    program VARCHAR(100), -- e.g., "Computer Science", "Engineering"
    level VARCHAR(20), -- e.g., "Level 100", "Level 400", "Graduate"
    faculty VARCHAR(100), -- e.g., "Faculty of Physical Sciences"
    department VARCHAR(100), -- e.g., "Computer Science Department"
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN (
            'active',
            'graduated',
            'suspended',
            'inactive'
        )
    ),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_university_members_email ON university_members (email);

CREATE INDEX IF NOT EXISTS idx_university_members_type ON university_members (member_type);

CREATE INDEX IF NOT EXISTS idx_university_members_status ON university_members (status);

CREATE INDEX IF NOT EXISTS idx_university_members_expiry ON university_members (expiry_date);

CREATE INDEX IF NOT EXISTS idx_university_members_active ON university_members (is_active);

-- Sample student data with realistic information
INSERT INTO
    university_members (
        id,
        first_name,
        last_name,
        email,
        hall_of_residence,
        member_type,
        issue_date,
        expiry_date,
        academic_year,
        program,
        level,
        faculty,
        department,
        status
    )
VALUES
    -- Current students (valid)
    (
        '10001234',
        'John',
        'Doe',
        'john.doe@st.ug.edu.gh',
        'Legon Hall',
        'student',
        '2021-09-01',
        '2025-07-31',
        '2024/2025',
        'Computer Science',
        'Level 400',
        'Faculty of Physical Sciences',
        'Computer Science Department',
        'active'
    ),
    (
        '10005678',
        'Jane',
        'Smith',
        'jane.smith@st.ug.edu.gh',
        'Commonwealth Hall',
        'student',
        '2022-09-01',
        '2026-07-31',
        '2024/2025',
        'Business Administration',
        'Level 300',
        'University of Ghana Business School',
        'Department of Marketing',
        'active'
    ),
    (
        '10009876',
        'Kwame',
        'Asante',
        'kwame.asante@st.ug.edu.gh',
        'Akuafo Hall',
        'student',
        '2023-09-01',
        '2027-07-31',
        '2024/2025',
        'Medicine',
        'Level 200',
        'School of Medicine and Dentistry',
        'Department of Medicine',
        'active'
    ),
    (
        '10001111',
        'Akosua',
        'Mensah',
        'akosua.mensah@st.ug.edu.gh',
        'Volta Hall',
        'student',
        '2024-09-01',
        '2028-07-31',
        '2024/2025',
        'Law',
        'Level 100',
        'University of Ghana School of Law',
        'Department of Law',
        'active'
    ),
    (
        '10002222',
        'Emmanuel',
        'Osei',
        'emmanuel.osei@st.ug.edu.gh',
        'Independence Hall',
        'student',
        '2020-09-01',
        '2024-07-31',
        '2023/2024',
        'Engineering',
        'Level 400',
        'College of Engineering Sciences',
        'Department of Computer Engineering',
        'active'
    ),

-- Graduated students (expired - should not be able to register)
(
    '10000001',
    'Kofi',
    'Asamoah',
    'kofi.asamoah@st.ug.edu.gh',
    'Legon Hall',
    'student',
    '2018-09-01',
    '2022-07-31',
    '2021/2022',
    'Computer Science',
    'Graduate',
    'Faculty of Physical Sciences',
    'Computer Science Department',
    'graduated'
),
(
    '10000002',
    'Ama',
    'Boateng',
    'ama.boateng@st.ug.edu.gh',
    'Volta Hall',
    'student',
    '2017-09-01',
    '2021-07-31',
    '2020/2021',
    'Economics',
    'Graduate',
    'Faculty of Social Studies',
    'Department of Economics',
    'graduated'
),

-- Staff members (no expiry date)
(
    '20001234',
    'Dr. Michael',
    'Johnson',
    'michael.johnson@ug.edu.gh',
    NULL,
    'staff',
    '2015-01-15',
    NULL,
    NULL,
    NULL,
    NULL,
    'Faculty of Physical Sciences',
    'Computer Science Department',
    'active'
),
(
    '20005678',
    'Prof. Sarah',
    'Williams',
    'sarah.williams@ug.edu.gh',
    NULL,
    'staff',
    '2010-03-01',
    NULL,
    NULL,
    NULL,
    NULL,
    'University of Ghana Business School',
    'Department of Finance',
    'active'
),
(
    '20009999',
    'Dr. Kwaku',
    'Adjei',
    'kwaku.adjei@ug.edu.gh',
    NULL,
    'staff',
    '2018-08-15',
    NULL,
    NULL,
    NULL,
    NULL,
    'School of Medicine and Dentistry',
    'Department of Medicine',
    'active'
) ON CONFLICT (id) DO
UPDATE
SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    hall_of_residence = EXCLUDED.hall_of_residence,
    member_type = EXCLUDED.member_type,
    issue_date = EXCLUDED.issue_date,
    expiry_date = EXCLUDED.expiry_date,
    academic_year = EXCLUDED.academic_year,
    program = EXCLUDED.program,
    level = EXCLUDED.level,
    faculty = EXCLUDED.faculty,
    department = EXCLUDED.department,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;