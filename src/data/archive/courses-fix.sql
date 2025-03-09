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

-- Enable RLS but with public access
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories_courses ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Allow public read access" ON course_categories FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- policy already exists, do nothing
  END;
  
  BEGIN
    CREATE POLICY "Allow public read access" ON courses FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- policy already exists, do nothing
  END;
  
  BEGIN
    CREATE POLICY "Allow public read access" ON course_categories_courses FOR SELECT USING (true);
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- policy already exists, do nothing
  END;
END
$$; 