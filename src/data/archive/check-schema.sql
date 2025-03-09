-- Check table structure
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name IN ('course_categories', 'courses', 'course_modules', 'course_lessons', 'course_categories_courses')
ORDER BY 
  table_name, 
  ordinal_position; 