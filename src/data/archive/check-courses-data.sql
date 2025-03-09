-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('course_categories', 'courses', 'course_modules', 'course_lessons', 'course_categories_courses');

-- Count records in each table
SELECT 'course_categories' as table_name, COUNT(*) as record_count FROM course_categories
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'course_modules', COUNT(*) FROM course_modules
UNION ALL
SELECT 'course_lessons', COUNT(*) FROM course_lessons
UNION ALL
SELECT 'course_categories_courses', COUNT(*) FROM course_categories_courses;

-- Check categories
SELECT id, name, slug FROM course_categories;

-- Check courses
SELECT id, title, slug, categories FROM courses;

-- Check relationships
SELECT cc.name as category_name, c.title as course_title
FROM course_categories cc
JOIN course_categories_courses ccc ON cc.id = ccc.category_id
JOIN courses c ON c.id = ccc.course_id; 