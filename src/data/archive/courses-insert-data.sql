-- Insert basic categories if they don't exist
INSERT INTO course_categories (name, slug, description, image)
SELECT name, slug, description, image
FROM (VALUES
  ('Nutrition', 'nutrition', 'Learn about nutrition principles', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000'),
  ('Wellness', 'wellness', 'Discover holistic approaches to health', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000'),
  ('Fitness', 'fitness', 'Physical training programs', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000')
) AS new_categories(name, slug, description, image)
WHERE NOT EXISTS (
  SELECT 1 FROM course_categories WHERE slug = new_categories.slug
);

-- Insert basic courses if they don't exist
INSERT INTO courses (title, slug, description, content, image, instructor, duration, level, price, is_free, categories)
SELECT title, slug, description, content, image, instructor, duration, level, price, is_free, categories
FROM (VALUES
  (
    'Nutrition Fundamentals', 
    'nutrition-fundamentals', 
    'Learn the basics of nutrition and healthy eating habits.', 
    'This course covers the essential principles of nutrition that everyone should know.', 
    'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000', 
    'Dr. Sarah Johnson', 
    '4 weeks', 
    'beginner', 
    0, 
    true, 
    ARRAY['Nutrition', 'Wellness']
  ),
  (
    'Functional Fitness Basics', 
    'functional-fitness-basics', 
    'Build strength and mobility with functional movement patterns.', 
    'This course focuses on functional fitness exercises.', 
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000', 
    'Alex Rodriguez', 
    '5 weeks', 
    'beginner', 
    0, 
    true, 
    ARRAY['Fitness']
  )
) AS new_courses(title, slug, description, content, image, instructor, duration, level, price, is_free, categories)
WHERE NOT EXISTS (
  SELECT 1 FROM courses WHERE slug = new_courses.slug
);

-- Connect courses to categories only for newly inserted courses
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories)
AND NOT EXISTS (
  SELECT 1 FROM course_categories_courses cc 
  WHERE cc.course_id = co.id AND cc.category_id = c.id
); 