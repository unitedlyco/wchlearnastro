-- Step 4: Verify setup
-- Run this script in the Supabase SQL Editor after running 3-insert-demo-data.sql

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'course_categories', 
  'courses', 
  'course_categories_courses', 
  'course_modules', 
  'course_lessons', 
  'user_course_progress'
);

-- Check categories
SELECT * FROM course_categories;

-- Check courses
SELECT * FROM courses;

-- Check relationships
SELECT 
  cc.name as category_name, 
  c.title as course_title
FROM course_categories cc
JOIN course_categories_courses ccc ON cc.id = ccc.category_id
JOIN courses c ON c.id = ccc.course_id; 