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

-- Enable RLS for user_course_progress
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_course_progress (allow read/write for own data only)
CREATE POLICY "Allow read access for own data" ON user_course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert access for own data" ON user_course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update access for own data" ON user_course_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow delete access for own data" ON user_course_progress
  FOR DELETE USING (auth.uid() = user_id); 