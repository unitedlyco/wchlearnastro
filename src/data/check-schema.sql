-- Check schema of tables
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%course%';

-- Check if tables exist in public schema
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'course_categories'
);

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'courses'
);

-- Check if tables exist without schema prefix
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'course_categories'
);

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'courses'
); 