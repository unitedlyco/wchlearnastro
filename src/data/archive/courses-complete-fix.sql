-- Comprehensive fix script for courses database
-- This script handles cases where tables or policies already exist

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
SELECT 'Nutrition', 'nutrition', 'Learn about nutrition principles', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM course_categories WHERE slug = 'nutrition');

INSERT INTO course_categories (name, slug, description, image)
SELECT 'Wellness', 'wellness', 'Discover holistic approaches to health', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM course_categories WHERE slug = 'wellness');

INSERT INTO course_categories (name, slug, description, image)
SELECT 'Fitness', 'fitness', 'Physical training programs', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM course_categories WHERE slug = 'fitness');

-- Insert basic courses if they don't exist
INSERT INTO courses (title, slug, description, content, image, instructor, duration, level, price, is_free, categories)
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'nutrition-fundamentals');

INSERT INTO courses (title, slug, description, content, image, instructor, duration, level, price, is_free, categories)
SELECT
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
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'functional-fitness-basics');

-- Connect courses to categories if not already connected
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories)
AND NOT EXISTS (
  SELECT 1 FROM course_categories_courses 
  WHERE category_id = c.id AND course_id = co.id
);

-- Insert modules for Nutrition Fundamentals course if they don't exist
WITH course AS (SELECT id FROM courses WHERE slug = 'nutrition-fundamentals')
INSERT INTO course_modules (course_id, title, description, "order")
SELECT 
  (SELECT id FROM course), 
  'Introduction to Nutrition', 
  'Overview of basic nutrition concepts and why they matter.', 
  1
WHERE EXISTS (SELECT 1 FROM course)
AND NOT EXISTS (
  SELECT 1 FROM course_modules m 
  JOIN courses c ON m.course_id = c.id 
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Introduction to Nutrition'
);

WITH course AS (SELECT id FROM courses WHERE slug = 'nutrition-fundamentals')
INSERT INTO course_modules (course_id, title, description, "order")
SELECT 
  (SELECT id FROM course), 
  'Macronutrients', 
  'Deep dive into proteins, carbohydrates, and fats.', 
  2
WHERE EXISTS (SELECT 1 FROM course)
AND NOT EXISTS (
  SELECT 1 FROM course_modules m 
  JOIN courses c ON m.course_id = c.id 
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Macronutrients'
);

-- Insert lessons for Introduction module if they don't exist
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Introduction to Nutrition'
)
INSERT INTO course_lessons (module_id, title, description, content, duration, "order", is_free)
SELECT
  (SELECT id FROM module),
  'What is Nutrition?',
  'Basic definition and importance of nutrition.',
  '<p>Nutrition is the science that interprets the nutrients and other substances in food in relation to maintenance, growth, reproduction, health and disease of an organism.</p>',
  '15 minutes',
  1,
  true
WHERE EXISTS (SELECT 1 FROM module)
AND NOT EXISTS (
  SELECT 1 FROM course_lessons l
  JOIN course_modules m ON l.module_id = m.id
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Introduction to Nutrition' AND l.title = 'What is Nutrition?'
); 