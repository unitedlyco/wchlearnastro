-- Insert a test course
INSERT INTO courses (title, slug, description, content, image, instructor, duration, level, price, is_free, categories)
VALUES (
  'Test Course ' || NOW(), 
  'test-course-' || EXTRACT(EPOCH FROM NOW())::TEXT, 
  'This is a test course to verify the database connection.', 
  '<p>This is the content of the test course.</p>', 
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000', 
  'Test Instructor', 
  '1 week', 
  'beginner', 
  0, 
  true, 
  ARRAY['Nutrition', 'Wellness']
);

-- Connect the test course to categories
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories)
AND co.title LIKE 'Test Course %'
AND NOT EXISTS (
  SELECT 1 FROM course_categories_courses cc 
  WHERE cc.course_id = co.id AND cc.category_id = c.id
); 