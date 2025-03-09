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

-- Enable RLS but with public access
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access with error handling
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Allow public read access" ON course_modules FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- policy already exists, do nothing
  END;
  
  BEGIN
    CREATE POLICY "Allow public read access" ON course_lessons FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- policy already exists, do nothing
  END;
END
$$;

-- Insert modules for Nutrition Fundamentals course
WITH course AS (SELECT id FROM courses WHERE slug = 'nutrition-fundamentals')
INSERT INTO course_modules (course_id, title, description, "order") VALUES
((SELECT id FROM course), 'Introduction to Nutrition', 'Overview of basic nutrition concepts and why they matter.', 1),
((SELECT id FROM course), 'Macronutrients', 'Deep dive into proteins, carbohydrates, and fats.', 2);

-- Insert lessons for Introduction module
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Introduction to Nutrition'
)
INSERT INTO course_lessons (module_id, title, description, content, duration, "order", is_free) VALUES
(
  (SELECT id FROM module),
  'What is Nutrition?',
  'Basic definition and importance of nutrition.',
  '<p>Nutrition is the science that interprets the nutrients and other substances in food in relation to maintenance, growth, reproduction, health and disease of an organism.</p>',
  '15 minutes',
  1,
  true
); 