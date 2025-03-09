-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Insert basic categories
INSERT INTO course_categories (name, slug, description, image) VALUES
('Nutrition', 'nutrition', 'Learn about nutrition principles', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000'),
('Wellness', 'wellness', 'Discover holistic approaches to health', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000'),
('Fitness', 'fitness', 'Physical training programs', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000');

-- Insert basic courses
INSERT INTO courses (title, slug, description, content, image, instructor, duration, level, price, is_free, categories) VALUES
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
);

-- Connect courses to categories
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories);

-- Enable RLS but with public access
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories_courses ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON course_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON course_categories_courses FOR SELECT USING (true); 