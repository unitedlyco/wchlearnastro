-- Step 2: Enable RLS and create policies
-- Run this script in the Supabase SQL Editor after running 1-create-tables.sql

-- Enable RLS for all tables
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Create policies with error handling for duplicate policies
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