-- Enable RLS on all tables
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for course_categories (allow read for all, write for authenticated users)
CREATE POLICY "Allow public read access" ON course_categories
  FOR SELECT USING (true);

-- Create policies for courses (allow read for all, write for authenticated users)
CREATE POLICY "Allow public read access" ON courses
  FOR SELECT USING (true);

-- Create policies for course_modules (allow read for all, write for authenticated users)
CREATE POLICY "Allow public read access" ON course_modules
  FOR SELECT USING (true);

-- Create policies for course_lessons (allow read for all, write for authenticated users)
CREATE POLICY "Allow public read access" ON course_lessons
  FOR SELECT USING (true);

-- Create policies for course_categories_courses (allow read for all, write for authenticated users)
CREATE POLICY "Allow public read access" ON course_categories_courses
  FOR SELECT USING (true);

-- Create policies for user_course_progress (allow read/write for own data only)
CREATE POLICY "Allow read access for own data" ON user_course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert access for own data" ON user_course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update access for own data" ON user_course_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow delete access for own data" ON user_course_progress
  FOR DELETE USING (auth.uid() = user_id); 