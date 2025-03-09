-- Comprehensive fix for category-course relationships

-- 1. First, let's check if the categories exist with the correct slugs
SELECT id, name, slug FROM course_categories;

-- 2. Make sure the courses have the correct categories array
-- This query shows courses and their categories array
SELECT id, title, categories FROM courses;

-- 3. Fix the junction table relationships
-- This will ensure that the junction table correctly links courses to categories
-- based on the categories array in the courses table

-- First, clear existing junction table entries to avoid duplicates
DELETE FROM course_categories_courses;

-- Then, insert the correct relationships
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories);

-- 4. Verify the fix by checking the junction table
SELECT 
  cc.name as category_name, 
  cc.slug as category_slug,
  c.title as course_title,
  c.slug as course_slug
FROM 
  course_categories_courses ccc
JOIN 
  course_categories cc ON ccc.category_id = cc.id
JOIN 
  courses c ON ccc.course_id = c.id
ORDER BY 
  cc.name, c.title;

-- 5. Check if any categories have no courses
SELECT 
  cc.name, 
  cc.slug,
  (SELECT COUNT(*) FROM course_categories_courses ccc WHERE ccc.category_id = cc.id) as course_count
FROM 
  course_categories cc
ORDER BY 
  course_count, cc.name;

-- 6. Check if any courses have no categories
SELECT 
  c.title, 
  c.slug,
  (SELECT COUNT(*) FROM course_categories_courses ccc WHERE ccc.course_id = c.id) as category_count
FROM 
  courses c
ORDER BY 
  category_count, c.title; 