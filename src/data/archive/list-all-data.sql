-- List all categories
SELECT * FROM course_categories;

-- List all courses
SELECT * FROM courses;

-- List all relationships between courses and categories
SELECT 
  cc.name AS category_name, 
  c.title AS course_title,
  cc.id AS category_id,
  c.id AS course_id
FROM course_categories cc
JOIN course_categories_courses ccc ON cc.id = ccc.category_id
JOIN courses c ON c.id = ccc.course_id; 