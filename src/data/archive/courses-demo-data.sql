-- Create course_categories table
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  categories TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}'
);

-- Create course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  order INTEGER NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_course_progress table
CREATE TABLE IF NOT EXISTS user_course_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  completed_lessons UUID[] NOT NULL DEFAULT '{}',
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);

-- Create course_categories_courses junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS course_categories_courses (
  category_id UUID NOT NULL REFERENCES course_categories(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, course_id)
);

-- Insert demo categories
INSERT INTO course_categories (name, slug, description, image) VALUES
('Nutrition', 'nutrition', 'Learn about nutrition principles and healthy eating habits.', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000'),
('Wellness', 'wellness', 'Discover holistic approaches to health and wellness.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000'),
('Fitness', 'fitness', 'Physical training and exercise programs for all levels.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000'),
('Mindfulness', 'mindfulness', 'Practices for mental clarity, focus, and emotional well-being.', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000'),
('Business', 'business', 'Build and grow your health coaching practice.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000');

-- Insert demo courses
INSERT INTO courses (title, slug, description, content, image, instructor, duration, level, price, is_free, categories, tags) VALUES
(
  'Nutrition Fundamentals', 
  'nutrition-fundamentals', 
  'Learn the basics of nutrition and healthy eating habits.', 
  '<p>This course covers the essential principles of nutrition that everyone should know. You will learn about macronutrients, micronutrients, and how to create balanced meal plans.</p><p>By the end of this course, you will have a solid understanding of how nutrition affects your health and how to make better food choices.</p>', 
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000', 
  'Dr. Sarah Johnson', 
  '4 weeks', 
  'beginner', 
  0, 
  true, 
  ARRAY['Nutrition', 'Wellness'], 
  ARRAY['nutrition', 'diet', 'health']
),
(
  'Advanced Nutritional Therapy', 
  'advanced-nutritional-therapy', 
  'Deep dive into therapeutic applications of nutrition for health professionals.', 
  '<p>This advanced course explores how nutrition can be used therapeutically to address various health conditions. It is designed for health professionals who want to incorporate nutritional therapy into their practice.</p><p>Topics include nutritional approaches to inflammation, gut health, hormonal balance, and more.</p>', 
  'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=1000', 
  'Prof. Michael Chen', 
  '8 weeks', 
  'advanced', 
  99.99, 
  false, 
  ARRAY['Nutrition'], 
  ARRAY['nutrition', 'therapy', 'clinical']
),
(
  'Mindfulness Meditation', 
  'mindfulness-meditation', 
  'Learn meditation techniques to reduce stress and improve focus.', 
  '<p>This course introduces you to the practice of mindfulness meditation. You will learn various techniques to help you stay present, reduce stress, and improve your mental clarity.</p><p>Each module includes guided meditations and practical exercises you can incorporate into your daily life.</p>', 
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000', 
  'Emma Wilson', 
  '6 weeks', 
  'beginner', 
  49.99, 
  false, 
  ARRAY['Mindfulness', 'Wellness'], 
  ARRAY['meditation', 'stress', 'mental health']
),
(
  'Functional Fitness Basics', 
  'functional-fitness-basics', 
  'Build strength and mobility with functional movement patterns.', 
  '<p>This course focuses on functional fitness - exercises that help you perform real-life activities with ease. You will learn proper form for fundamental movement patterns and how to build a balanced workout routine.</p><p>Suitable for all fitness levels, this course emphasizes quality of movement over intensity.</p>', 
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000', 
  'Alex Rodriguez', 
  '5 weeks', 
  'beginner', 
  0, 
  true, 
  ARRAY['Fitness'], 
  ARRAY['fitness', 'strength', 'mobility']
),
(
  'Health Coaching Business Essentials', 
  'health-coaching-business', 
  'Learn how to build and grow your health coaching practice.', 
  '<p>This comprehensive course covers everything you need to know to start and grow a successful health coaching business. From defining your niche to marketing your services, you will learn practical strategies to attract clients and create a sustainable business.</p><p>Includes templates for client agreements, session plans, and marketing materials.</p>', 
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000', 
  'Jessica Taylor', 
  '10 weeks', 
  'intermediate', 
  149.99, 
  false, 
  ARRAY['Business'], 
  ARRAY['business', 'coaching', 'marketing']
);

-- Connect courses to categories using the junction table
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories);

-- Insert modules for Nutrition Fundamentals course
WITH course AS (SELECT id FROM courses WHERE slug = 'nutrition-fundamentals')
INSERT INTO course_modules (course_id, title, description, order) VALUES
((SELECT id FROM course), 'Introduction to Nutrition', 'Overview of basic nutrition concepts and why they matter.', 1),
((SELECT id FROM course), 'Macronutrients', 'Deep dive into proteins, carbohydrates, and fats.', 2),
((SELECT id FROM course), 'Micronutrients', 'Understanding vitamins and minerals.', 3),
((SELECT id FROM course), 'Meal Planning', 'Practical application of nutrition principles.', 4);

-- Insert lessons for Introduction module
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Introduction to Nutrition'
)
INSERT INTO course_lessons (module_id, title, description, content, duration, order, is_free) VALUES
(
  (SELECT id FROM module),
  'What is Nutrition?',
  'Basic definition and importance of nutrition.',
  '<p>Nutrition is the science that interprets the nutrients and other substances in food in relation to maintenance, growth, reproduction, health and disease of an organism. It includes food intake, absorption, assimilation, biosynthesis, catabolism and excretion.</p>',
  '15 minutes',
  1,
  true
),
(
  (SELECT id FROM module),
  'The Impact of Nutrition on Health',
  'How nutrition affects overall health and wellbeing.',
  '<p>This lesson explores the profound impact that nutrition has on your overall health, energy levels, immune function, and disease prevention. We will look at research showing the connections between diet and health outcomes.</p>',
  '20 minutes',
  2,
  true
);

-- Insert lessons for Macronutrients module
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Macronutrients'
)
INSERT INTO course_lessons (module_id, title, description, content, duration, order, is_free) VALUES
(
  (SELECT id FROM module),
  'Proteins: Building Blocks of Life',
  'Understanding protein structure, function, and dietary sources.',
  '<p>Proteins are essential macronutrients composed of amino acids. This lesson covers protein structure, functions in the body, dietary sources, and recommended intake levels.</p>',
  '25 minutes',
  1,
  true
),
(
  (SELECT id FROM module),
  'Carbohydrates: Energy Source',
  'Types of carbohydrates and their role in the body.',
  '<p>Carbohydrates are the body\'s primary energy source. This lesson explores simple vs. complex carbohydrates, fiber, glycemic index, and how to make healthy carbohydrate choices.</p>',
  '25 minutes',
  2,
  false
),
(
  (SELECT id FROM module),
  'Fats: Essential Nutrients',
  'The different types of fats and their importance.',
  '<p>Fats are often misunderstood but play crucial roles in the body. This lesson covers saturated, unsaturated, and trans fats, omega fatty acids, and guidelines for healthy fat consumption.</p>',
  '25 minutes',
  3,
  false
);

-- Insert modules and lessons for Mindfulness Meditation course
WITH course AS (SELECT id FROM courses WHERE slug = 'mindfulness-meditation')
INSERT INTO course_modules (course_id, title, description, order) VALUES
((SELECT id FROM course), 'Foundations of Mindfulness', 'Understanding what mindfulness is and its benefits.', 1),
((SELECT id FROM course), 'Meditation Techniques', 'Various approaches to meditation practice.', 2),
((SELECT id FROM course), 'Mindfulness in Daily Life', 'Applying mindfulness to everyday activities.', 3);

-- Insert lessons for Foundations module
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'mindfulness-meditation' AND m.title = 'Foundations of Mindfulness'
)
INSERT INTO course_lessons (module_id, title, description, content, video_url, duration, order, is_free) VALUES
(
  (SELECT id FROM module),
  'What is Mindfulness?',
  'Definition and core concepts of mindfulness.',
  '<p>Mindfulness is the practice of purposely bringing one\'s attention to the present moment without judgment. This lesson introduces the concept and its origins.</p>',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '15 minutes',
  1,
  true
),
(
  (SELECT id FROM module),
  'The Science of Mindfulness',
  'Research on how mindfulness affects the brain and body.',
  '<p>This lesson explores the scientific research behind mindfulness, including studies on its effects on stress reduction, brain structure, and overall wellbeing.</p>',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '20 minutes',
  2,
  false
); 