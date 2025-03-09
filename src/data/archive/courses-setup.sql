-- Comprehensive courses database setup
-- This script creates all necessary tables for the courses feature

-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STEP 1: Create basic tables
-- =============================================

-- Create course_categories table
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  instructor TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  categories TEXT[] DEFAULT '{}'
);

-- Create junction table
CREATE TABLE IF NOT EXISTS course_categories_courses (
  category_id UUID REFERENCES course_categories(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, course_id)
);

-- =============================================
-- STEP 2: Create modules and lessons tables
-- =============================================

-- Create course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  duration TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 3: Create user progress table
-- =============================================

-- Create user_course_progress table
CREATE TABLE IF NOT EXISTS user_course_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  completed_lessons UUID[] NOT NULL DEFAULT '{}',
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);

-- =============================================
-- STEP 4: Enable RLS and create policies
-- =============================================

-- Enable RLS for all tables
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Create policies with error handling
DO $$
BEGIN
  -- Policies for course_categories
  BEGIN
    CREATE POLICY "Allow public read access" ON course_categories FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Policies for courses
  BEGIN
    CREATE POLICY "Allow public read access" ON courses FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Policies for course_categories_courses
  BEGIN
    CREATE POLICY "Allow public read access" ON course_categories_courses FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Policies for course_modules
  BEGIN
    CREATE POLICY "Allow public read access" ON course_modules FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Policies for course_lessons
  BEGIN
    CREATE POLICY "Allow public read access" ON course_lessons FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Policies for user_course_progress
  BEGIN
    CREATE POLICY "Allow read access for own data" ON user_course_progress
      FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    CREATE POLICY "Allow insert access for own data" ON user_course_progress
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    CREATE POLICY "Allow update access for own data" ON user_course_progress
      FOR UPDATE USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    CREATE POLICY "Allow delete access for own data" ON user_course_progress
      FOR DELETE USING (auth.uid() = user_id);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END
$$;

-- =============================================
-- STEP 5: Insert basic demo data
-- =============================================

-- Insert basic categories if they don't exist
INSERT INTO course_categories (name, slug, description, image)
VALUES
('Nutrition', 'nutrition', 'Learn about nutrition principles', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000'),
('Wellness', 'wellness', 'Discover holistic approaches to health', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000'),
('Fitness', 'fitness', 'Physical training programs', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000'),
('Mindfulness', 'mindfulness', 'Practices for mental wellbeing', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000'),
('Health Coaching', 'health-coaching', 'Learn to coach others on health', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1000')
ON CONFLICT (slug) DO NOTHING;

-- Insert basic courses if they don't exist
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
),
(
  'Mindfulness Meditation', 
  'mindfulness-meditation', 
  'Learn meditation techniques for stress reduction and mental clarity.', 
  '<p>This course teaches various mindfulness meditation practices.</p>', 
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000', 
  'Emma Chen', 
  '3 weeks', 
  'beginner', 
  0, 
  true, 
  ARRAY['Wellness', 'Mindfulness']
)
ON CONFLICT (slug) DO NOTHING;

-- Connect courses to categories
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories)
ON CONFLICT DO NOTHING;

-- Insert modules for Nutrition Fundamentals course
WITH course AS (SELECT id FROM courses WHERE slug = 'nutrition-fundamentals')
INSERT INTO course_modules (course_id, title, description, "order")
VALUES
((SELECT id FROM course), 'Introduction to Nutrition', 'Overview of basic nutrition concepts and why they matter.', 1),
((SELECT id FROM course), 'Macronutrients', 'Deep dive into proteins, carbohydrates, and fats.', 2)
ON CONFLICT DO NOTHING;

-- Insert lessons for Introduction module
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Introduction to Nutrition'
)
INSERT INTO course_lessons (module_id, title, description, content, duration, "order", is_free)
VALUES
(
  (SELECT id FROM module),
  'What is Nutrition?',
  'Understanding the basic concept of nutrition.',
  '<p>Nutrition is the study of nutrients in food, how the body uses them, and the relationship between diet, health, and disease.</p>',
  '15 minutes',
  1,
  true
),
(
  (SELECT id FROM module),
  'Why Nutrition Matters',
  'The importance of nutrition for overall health.',
  '<p>Good nutrition is an important part of leading a healthy lifestyle. Combined with physical activity, your diet can help you reach and maintain a healthy weight, reduce your risk of chronic diseases, and promote your overall health.</p>',
  '20 minutes',
  2,
  true
)
ON CONFLICT DO NOTHING;

-- =============================================
-- STEP 6: Verification query
-- =============================================

-- This query can be run separately to verify the setup
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('course_categories', 'courses', 'course_categories_courses', 'course_modules', 'course_lessons', 'user_course_progress'); 