-- Check the actual data in the courses and categories tables

-- Check categories
SELECT id, name, slug, description FROM course_categories ORDER BY name;

-- Check courses
SELECT id, title, slug, categories FROM courses ORDER BY title;

-- Check if the categories array in courses table matches the actual categories
SELECT 
  c.title as course_title, 
  c.categories as course_categories_array,
  array_agg(cc.name) as actual_categories
FROM 
  courses c
LEFT JOIN 
  course_categories_courses ccc ON c.id = ccc.course_id
LEFT JOIN 
  course_categories cc ON ccc.category_id = cc.id
GROUP BY 
  c.id, c.title, c.categories
ORDER BY 
  c.title; 