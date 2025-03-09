-- Step 3: Insert demo data
-- Run this script in the Supabase SQL Editor after running 2-enable-rls.sql

-- Insert basic categories
INSERT INTO course_categories (name, slug, description, image)
VALUES
('Nutrition', 'nutrition', 'Learn about nutrition principles', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000'),
('Wellness', 'wellness', 'Discover holistic approaches to health', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000'),
('Fitness', 'fitness', 'Physical training programs', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000')
ON CONFLICT (slug) DO NOTHING;

-- Insert basic courses
INSERT INTO courses (title, slug, description, content, image, instructor, duration, level, price, is_free, categories)
VALUES
(
  'Nutrition Fundamentals', 
  'nutrition-fundamentals', 
  'Learn the basics of nutrition and healthy eating habits.', 
  '<p>This course covers the essential principles of nutrition that everyone should know.</p>', 
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
  '<p>This course focuses on functional fitness exercises.</p>', 
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000', 
  'Alex Rodriguez', 
  '5 weeks', 
  'beginner', 
  0, 
  true, 
  ARRAY['Fitness']
)
ON CONFLICT (slug) DO NOTHING;

-- Connect courses to categories
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories)
ON CONFLICT DO NOTHING; 