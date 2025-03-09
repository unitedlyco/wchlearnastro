-- Fix the junction table relationships

-- Clear existing junction table entries (optional, uncomment if needed)
-- DELETE FROM course_categories_courses;

-- Insert relationships based on the categories array in courses table
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories)
AND NOT EXISTS (
  SELECT 1 FROM course_categories_courses 
  WHERE category_id = c.id AND course_id = co.id
);

-- Verify the fix
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