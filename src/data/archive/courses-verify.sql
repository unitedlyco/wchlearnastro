-- Verify that the tables exist and have data

-- Check if tables exist
SELECT 
  table_name 
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' 
  AND table_name IN (
    'course_categories', 
    'courses', 
    'course_categories_courses', 
    'course_modules', 
    'course_lessons', 
    'user_course_progress'
  )
ORDER BY 
  table_name;

-- Count rows in each table
SELECT 'course_categories' as table_name, COUNT(*) as row_count FROM course_categories
UNION ALL
SELECT 'courses' as table_name, COUNT(*) as row_count FROM courses
UNION ALL
SELECT 'course_categories_courses' as table_name, COUNT(*) as row_count FROM course_categories_courses
UNION ALL
SELECT 'course_modules' as table_name, COUNT(*) as row_count FROM course_modules
UNION ALL
SELECT 'course_lessons' as table_name, COUNT(*) as row_count FROM course_lessons
UNION ALL
SELECT 'user_course_progress' as table_name, COUNT(*) as row_count FROM user_course_progress
ORDER BY table_name; 