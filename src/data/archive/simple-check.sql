-- Count records in each table
SELECT 'course_categories' as table_name, COUNT(*) as record_count FROM course_categories;
SELECT 'courses' as table_name, COUNT(*) as record_count FROM courses;
SELECT 'course_categories_courses' as table_name, COUNT(*) as record_count FROM course_categories_courses; 