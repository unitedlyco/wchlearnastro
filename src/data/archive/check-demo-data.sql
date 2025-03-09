-- Check if there are any issues with the demo data

-- 1. Check if the categories exist
SELECT id, name, slug, description FROM course_categories;

-- 2. Check if the courses exist
SELECT id, title, slug, description, level, is_free, price FROM courses;

-- 3. Check if the junction table has entries
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

-- 4. Check if the categories array in courses matches the junction table
SELECT 
  c.title,
  c.categories as categories_array,
  array_agg(cc.name) as actual_categories
FROM 
  courses c
JOIN 
  course_categories_courses ccc ON c.id = ccc.course_id
JOIN 
  course_categories cc ON ccc.category_id = cc.id
GROUP BY 
  c.id, c.title, c.categories
ORDER BY 
  c.title;

-- 5. Check for any courses without categories in the junction table
SELECT 
  c.title,
  c.slug,
  c.categories
FROM 
  courses c
LEFT JOIN 
  course_categories_courses ccc ON c.id = ccc.course_id
WHERE 
  ccc.course_id IS NULL;

-- 6. Check for any categories without courses in the junction table
SELECT 
  cc.name,
  cc.slug
FROM 
  course_categories cc
LEFT JOIN 
  course_categories_courses ccc ON cc.id = ccc.category_id
WHERE 
  ccc.category_id IS NULL; 