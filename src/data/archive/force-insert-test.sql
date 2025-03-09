-- Force insert a test course
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

-- Get the ID of the course we just inserted
DO $$
DECLARE
  test_course_id UUID;
  nutrition_category_id UUID;
  wellness_category_id UUID;
BEGIN
  -- Get the course ID
  SELECT id INTO test_course_id FROM courses WHERE title LIKE 'Test Course %' ORDER BY created_at DESC LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO nutrition_category_id FROM course_categories WHERE name = 'Nutrition';
  SELECT id INTO wellness_category_id FROM course_categories WHERE name = 'Wellness';
  
  -- Force insert relationships
  INSERT INTO course_categories_courses (category_id, course_id) VALUES (nutrition_category_id, test_course_id);
  INSERT INTO course_categories_courses (category_id, course_id) VALUES (wellness_category_id, test_course_id);
END $$; 