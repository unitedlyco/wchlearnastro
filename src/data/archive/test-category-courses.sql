-- Test retrieving courses for a specific category

-- 1. List all categories with their slugs
SELECT id, name, slug FROM course_categories;

-- 2. For a specific category (e.g., 'nutrition'), get all courses
WITH category AS (
  SELECT id FROM course_categories WHERE slug = 'nutrition'
)
SELECT 
  c.id,
  c.title,
  c.slug,
  c.description,
  c.level,
  c.is_free,
  c.price
FROM 
  courses c
JOIN 
  course_categories_courses ccc ON c.id = ccc.course_id
WHERE 
  ccc.category_id = (SELECT id FROM category);

-- 3. For a specific category (e.g., 'wellness'), get all courses
WITH category AS (
  SELECT id FROM course_categories WHERE slug = 'wellness'
)
SELECT 
  c.id,
  c.title,
  c.slug,
  c.description,
  c.level,
  c.is_free,
  c.price
FROM 
  courses c
JOIN 
  course_categories_courses ccc ON c.id = ccc.course_id
WHERE 
  ccc.category_id = (SELECT id FROM category);

-- 4. For a specific category (e.g., 'fitness'), get all courses
WITH category AS (
  SELECT id FROM course_categories WHERE slug = 'fitness'
)
SELECT 
  c.id,
  c.title,
  c.slug,
  c.description,
  c.level,
  c.is_free,
  c.price
FROM 
  courses c
JOIN 
  course_categories_courses ccc ON c.id = ccc.course_id
WHERE 
  ccc.category_id = (SELECT id FROM category); 