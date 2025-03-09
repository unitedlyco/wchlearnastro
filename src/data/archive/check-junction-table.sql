-- Check the junction table relationships

-- Show all records in the junction table
SELECT 
  cc.id as category_id, 
  cc.name as category_name, 
  cc.slug as category_slug,
  c.id as course_id,
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

-- Check if there are any categories without courses
SELECT 
  cc.id, 
  cc.name, 
  cc.slug,
  (SELECT COUNT(*) FROM course_categories_courses ccc WHERE ccc.category_id = cc.id) as course_count
FROM 
  course_categories cc
ORDER BY 
  course_count, cc.name;

-- Check if there are any courses without categories
SELECT 
  c.id, 
  c.title, 
  c.slug,
  (SELECT COUNT(*) FROM course_categories_courses ccc WHERE ccc.course_id = c.id) as category_count
FROM 
  courses c
ORDER BY 
  category_count, c.title; 