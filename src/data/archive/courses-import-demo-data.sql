-- Import demo categories if they don't exist

-- Create course_modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_lessons table if it doesn't exist
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

-- Create policies for public read access
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

INSERT INTO course_categories (name, slug, description, image)
SELECT name, slug, description, image
FROM (VALUES
  ('Nutrition', 'nutrition', 'Learn about nutrition principles and healthy eating habits.', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000'),
  ('Wellness', 'wellness', 'Discover holistic approaches to health and wellness.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000'),
  ('Fitness', 'fitness', 'Physical training and exercise programs for all levels.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000'),
  ('Mindfulness', 'mindfulness', 'Practices for mental clarity, focus, and emotional well-being.', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000'),
  ('Business', 'business', 'Build and grow your health coaching practice.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000')
) AS new_categories(name, slug, description, image)
WHERE NOT EXISTS (
  SELECT 1 FROM course_categories WHERE slug = new_categories.slug
);

-- Import demo courses if they don't exist
INSERT INTO courses (title, slug, description, content, image, instructor, duration, level, price, is_free, categories)
SELECT title, slug, description, content, image, instructor, duration, level, price, is_free, categories
FROM (VALUES
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
    ARRAY['Nutrition', 'Wellness']
  ),
  (
    'Mindful Eating Practices', 
    'mindful-eating-practices', 
    'Develop a healthier relationship with food through mindfulness.', 
    '<p>This course teaches you how to apply mindfulness to your eating habits. You will learn techniques to become more aware of your body''s hunger and fullness cues, how to savor your food, and how to make conscious food choices.</p><p>By practicing mindful eating, you can improve digestion, manage weight, and develop a more positive relationship with food.</p>', 
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1000', 
    'Lisa Chen', 
    '3 weeks', 
    'beginner', 
    29.99, 
    false, 
    ARRAY['Nutrition', 'Mindfulness']
  ),
  (
    'Functional Fitness Basics', 
    'functional-fitness-basics', 
    'Build strength and mobility with functional movement patterns.', 
    '<p>This course focuses on functional fitness exercises that improve your ability to perform everyday activities. You will learn proper form for key movement patterns and how to build a balanced workout routine.</p><p>Functional fitness training helps prevent injuries, improves balance and coordination, and enhances overall quality of life.</p>', 
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000', 
    'Alex Rodriguez', 
    '5 weeks', 
    'beginner', 
    0, 
    true, 
    ARRAY['Fitness']
  ),
  (
    'Advanced Nutrition Coaching', 
    'advanced-nutrition-coaching', 
    'Take your nutrition knowledge to the professional level.', 
    '<p>This advanced course is designed for health professionals and serious enthusiasts who want to deepen their understanding of nutritional science. You will explore complex topics like nutrient timing, supplementation strategies, and personalized nutrition planning.</p><p>By the end of this course, you will be able to create evidence-based nutrition plans for various health goals and dietary needs.</p>', 
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=1000', 
    'Dr. Michael Wong', 
    '8 weeks', 
    'advanced', 
    99.99, 
    false, 
    ARRAY['Nutrition', 'Business']
  ),
  (
    'Meditation for Beginners', 
    'meditation-for-beginners', 
    'Start your meditation practice with simple, effective techniques.', 
    '<p>This course provides a gentle introduction to meditation for complete beginners. You will learn several meditation techniques, how to establish a regular practice, and ways to overcome common challenges.</p><p>Regular meditation can reduce stress, improve focus, and promote emotional well-being.</p>', 
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000', 
    'Emma Wilson', 
    '2 weeks', 
    'beginner', 
    19.99, 
    false, 
    ARRAY['Mindfulness', 'Wellness']
  ),
  (
    'Building Your Health Coaching Business', 
    'building-health-coaching-business', 
    'Learn how to launch and grow a successful health coaching practice.', 
    '<p>This comprehensive course covers everything you need to know to start and grow your health coaching business. Topics include defining your niche, creating service packages, marketing strategies, client management, and legal considerations.</p><p>Whether you''re just starting out or looking to scale your existing practice, this course provides actionable steps for business success.</p>', 
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000', 
    'James Peterson', 
    '6 weeks', 
    'intermediate', 
    149.99, 
    false, 
    ARRAY['Business']
  )
) AS new_courses(title, slug, description, content, image, instructor, duration, level, price, is_free, categories)
WHERE NOT EXISTS (
  SELECT 1 FROM courses WHERE slug = new_courses.slug
);

-- Connect courses to categories only for newly inserted courses
INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories)
AND NOT EXISTS (
  SELECT 1 FROM course_categories_courses cc 
  WHERE cc.course_id = co.id AND cc.category_id = c.id
);

-- Import modules for Nutrition Fundamentals course if they don't exist
WITH course AS (SELECT id FROM courses WHERE slug = 'nutrition-fundamentals')
INSERT INTO course_modules (course_id, title, description, "order")
SELECT course_id, title, description, "order"
FROM (
  SELECT 
    (SELECT id FROM course) as course_id,
    m.title,
    m.description,
    m."order"
  FROM (VALUES
    ('Introduction to Nutrition', 'Overview of basic nutrition concepts and why they matter.', 1),
    ('Macronutrients', 'Deep dive into proteins, carbohydrates, and fats.', 2),
    ('Micronutrients', 'Understanding vitamins and minerals.', 3),
    ('Meal Planning', 'Practical application of nutrition principles.', 4)
  ) AS m(title, description, "order")
) AS new_modules
WHERE NOT EXISTS (
  SELECT 1 FROM course_modules cm 
  WHERE cm.course_id = new_modules.course_id AND cm.title = new_modules.title
);

-- Import lessons for Introduction module if they don't exist
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Introduction to Nutrition'
)
INSERT INTO course_lessons (module_id, title, description, content, duration, "order", is_free)
SELECT module_id, title, description, content, duration, "order", is_free
FROM (
  SELECT 
    (SELECT id FROM module) as module_id,
    l.title,
    l.description,
    l.content,
    l.duration,
    l."order",
    l.is_free
  FROM (VALUES
    (
      'What is Nutrition?',
      'Basic definition and importance of nutrition.',
      '<p>Nutrition is the science that interprets the nutrients and other substances in food in relation to maintenance, growth, reproduction, health and disease of an organism. It includes food intake, absorption, assimilation, biosynthesis, catabolism and excretion.</p>',
      '15 minutes',
      1,
      true
    ),
    (
      'The Impact of Nutrition on Health',
      'How nutrition affects overall health and wellbeing.',
      '<p>This lesson explores the profound impact that nutrition has on your overall health, energy levels, immune function, and disease prevention. We will look at research showing the connections between diet and health outcomes.</p>',
      '20 minutes',
      2,
      true
    )
  ) AS l(title, description, content, duration, "order", is_free)
) AS new_lessons
WHERE NOT EXISTS (
  SELECT 1 FROM course_lessons cl 
  WHERE cl.module_id = new_lessons.module_id AND cl.title = new_lessons.title
);

-- Import lessons for Macronutrients module if they don't exist
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Macronutrients'
)
INSERT INTO course_lessons (module_id, title, description, content, duration, "order", is_free)
SELECT module_id, title, description, content, duration, "order", is_free
FROM (
  SELECT 
    (SELECT id FROM module) as module_id,
    l.title,
    l.description,
    l.content,
    l.duration,
    l."order",
    l.is_free
  FROM (VALUES
    (
      'Proteins: The Building Blocks',
      'Understanding protein functions and sources.',
      '<p>Proteins are essential macronutrients composed of amino acids. This lesson covers protein functions in the body, complete vs. incomplete proteins, and how to ensure adequate protein intake from various sources.</p>',
      '25 minutes',
      1,
      true
    ),
    (
      'Carbohydrates: Energy Sources',
      'Types of carbohydrates and their role in the body.',
      '<p>Carbohydrates are your body''s primary energy source. Learn about simple vs. complex carbohydrates, fiber, glycemic index, and how to make healthy carbohydrate choices.</p>',
      '25 minutes',
      2,
      false
    ),
    (
      'Fats: Essential Nutrients',
      'The importance of healthy fats in your diet.',
      '<p>Dietary fats are crucial for health despite their bad reputation. This lesson explains the different types of fats, their functions, and how to incorporate healthy fats into your diet while limiting unhealthy ones.</p>',
      '25 minutes',
      3,
      false
    )
  ) AS l(title, description, content, duration, "order", is_free)
) AS new_lessons
WHERE NOT EXISTS (
  SELECT 1 FROM course_lessons cl 
  WHERE cl.module_id = new_lessons.module_id AND cl.title = new_lessons.title
);

-- Import lessons for Micronutrients module if they don't exist
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Micronutrients'
)
INSERT INTO course_lessons (module_id, title, description, content, duration, "order", is_free)
SELECT module_id, title, description, content, duration, "order", is_free
FROM (
  SELECT 
    (SELECT id FROM module) as module_id,
    l.title,
    l.description,
    l.content,
    l.duration,
    l."order",
    l.is_free
  FROM (VALUES
    (
      'Vitamins Overview',
      'Essential vitamins and their functions.',
      '<p>Vitamins are organic compounds required in small amounts for normal physiological function. This lesson covers fat-soluble and water-soluble vitamins, their functions, food sources, and recommended intakes.</p>',
      '20 minutes',
      1,
      false
    ),
    (
      'Minerals and Trace Elements',
      'Important minerals for health and wellness.',
      '<p>Minerals are inorganic nutrients that play various roles in body functions and processes. Learn about major minerals, trace minerals, their functions, and how to ensure adequate intake through diet.</p>',
      '20 minutes',
      2,
      false
    )
  ) AS l(title, description, content, duration, "order", is_free)
) AS new_lessons
WHERE NOT EXISTS (
  SELECT 1 FROM course_lessons cl 
  WHERE cl.module_id = new_lessons.module_id AND cl.title = new_lessons.title
);

-- Import lessons for Meal Planning module if they don't exist
WITH module AS (
  SELECT m.id 
  FROM course_modules m
  JOIN courses c ON m.course_id = c.id
  WHERE c.slug = 'nutrition-fundamentals' AND m.title = 'Meal Planning'
)
INSERT INTO course_lessons (module_id, title, description, content, duration, "order", is_free)
SELECT module_id, title, description, content, duration, "order", is_free
FROM (
  SELECT 
    (SELECT id FROM module) as module_id,
    l.title,
    l.description,
    l.content,
    l.duration,
    l."order",
    l.is_free
  FROM (VALUES
    (
      'Balanced Meal Basics',
      'How to create nutritionally balanced meals.',
      '<p>A balanced meal provides the nutrients your body needs in the right proportions. This lesson teaches you how to build meals with appropriate portions of proteins, carbohydrates, fats, and vegetables using simple frameworks like the plate method.</p>',
      '25 minutes',
      1,
      false
    ),
    (
      'Meal Prep Strategies',
      'Practical tips for efficient meal planning and preparation.',
      '<p>Meal preparation can save time, money, and help you maintain healthy eating habits. Learn strategies for planning your meals, efficient grocery shopping, batch cooking, and food storage to make healthy eating more convenient.</p>',
      '30 minutes',
      2,
      false
    ),
    (
      'Creating a Sustainable Eating Plan',
      'Developing eating habits that work for your lifestyle.',
      '<p>The most effective eating plan is one you can maintain long-term. This lesson helps you create a personalized approach to healthy eating that fits your preferences, schedule, and goals while being flexible enough to adapt to different situations.</p>',
      '25 minutes',
      3,
      false
    )
  ) AS l(title, description, content, duration, "order", is_free)
) AS new_lessons
WHERE NOT EXISTS (
  SELECT 1 FROM course_lessons cl 
  WHERE cl.module_id = new_lessons.module_id AND cl.title = new_lessons.title
); 