-- Comprehensive courses database setup
-- This migration creates all necessary tables for the courses feature

-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STEP 1: Create basic tables
-- =============================================

-- Create course_categories table
CREATE TABLE IF NOT EXISTS public.course_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
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
CREATE TABLE IF NOT EXISTS public.course_categories_courses (
  category_id UUID REFERENCES public.course_categories(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, course_id)
);

-- =============================================
-- STEP 2: Create modules and lessons tables
-- =============================================

-- Create course_modules table
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.user_course_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
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
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.course_categories_courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.course_modules FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.course_lessons FOR SELECT USING (true);

-- Create policies for user_course_progress
CREATE POLICY "Allow read access for own data" ON public.user_course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert access for own data" ON public.user_course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update access for own data" ON public.user_course_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow delete access for own data" ON public.user_course_progress
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- STEP 5: Insert basic demo data
-- =============================================

-- Insert basic categories
INSERT INTO public.course_categories (name, slug, description, image)
VALUES
('Nutrition', 'nutrition', 'Learn about nutrition principles', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000'),
('Wellness', 'wellness', 'Discover holistic approaches to health', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000'),
('Fitness', 'fitness', 'Physical training programs', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000'),
('Mindfulness', 'mindfulness', 'Practices for mental wellbeing', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000'),
('Health Coaching', 'health-coaching', 'Learn to coach others on health', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1000')
ON CONFLICT (slug) DO NOTHING;

-- Insert basic courses
INSERT INTO public.courses (title, slug, description, content, image, instructor, duration, level, price, is_free, categories)
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
),
(
  'Advanced Nutrition Coaching', 
  'advanced-nutrition-coaching', 
  'Learn advanced nutrition principles and coaching techniques.', 
  '<p>This course is designed for nutrition professionals who want to enhance their coaching skills.</p>', 
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000', 
  'Dr. Michael Brown', 
  '8 weeks', 
  'advanced', 
  99.99, 
  false, 
  ARRAY['Nutrition', 'Health Coaching']
),
(
  'Meditation for Beginners', 
  'meditation-for-beginners', 
  'A gentle introduction to meditation practices for beginners.', 
  '<p>This course provides simple meditation techniques for those new to the practice.</p>', 
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000', 
  'Lisa Wong', 
  '2 weeks', 
  'beginner', 
  0, 
  true, 
  ARRAY['Wellness', 'Mindfulness']
),
(
  'Mindful Eating Practices', 
  'mindful-eating-practices', 
  'Learn to develop a healthier relationship with food through mindfulness.', 
  '<p>This course combines nutrition knowledge with mindfulness techniques.</p>', 
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000', 
  'Dr. Sarah Johnson', 
  '3 weeks', 
  'intermediate', 
  49.99, 
  false, 
  ARRAY['Nutrition', 'Mindfulness']
),
(
  'Building Your Health Coaching Business', 
  'building-health-coaching-business', 
  'Learn how to build and grow a successful health coaching practice.', 
  '<p>This course covers business strategies specifically for health coaches.</p>', 
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1000', 
  'James Wilson', 
  '6 weeks', 
  'intermediate', 
  149.99, 
  false, 
  ARRAY['Health Coaching']
)
ON CONFLICT (slug) DO NOTHING;

-- Connect courses to categories
INSERT INTO public.course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM public.course_categories c, public.courses co
WHERE c.name = ANY(co.categories)
ON CONFLICT DO NOTHING;

-- Insert modules for Nutrition Fundamentals course
WITH course AS (SELECT id FROM public.courses WHERE slug = 'nutrition-fundamentals')
INSERT INTO public.course_modules (course_id, title, description, "order")
VALUES
((SELECT id FROM course), 'Introduction to Nutrition', 'Overview of basic nutrition concepts and why they matter.', 1),
((SELECT id FROM course), 'Macronutrients', 'Deep dive into proteins, carbohydrates, and fats.', 2)
ON CONFLICT DO NOTHING;

-- Insert lessons for Introduction module
WITH module AS (
  SELECT m.id 
  FROM public.course_modules m
  JOIN public.courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Introduction to Nutrition'
)
INSERT INTO public.course_lessons (module_id, title, description, content, duration, "order", is_free)
VALUES
(
  (SELECT id FROM module),
  'What is Nutrition?',
  'Basic definition and importance of nutrition.',
  '<p>Nutrition is the science that interprets the nutrients and other substances in food in relation to maintenance, growth, reproduction, health and disease of an organism.</p>',
  '15 minutes',
  1,
  true
)
ON CONFLICT DO NOTHING; 