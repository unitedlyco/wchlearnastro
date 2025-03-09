-- Fix any potential issues with the demo data

-- 1. Make sure the categories have the correct slugs
UPDATE course_categories SET slug = 'nutrition' WHERE name = 'Nutrition' AND slug != 'nutrition';
UPDATE course_categories SET slug = 'wellness' WHERE name = 'Wellness' AND slug != 'wellness';
UPDATE course_categories SET slug = 'fitness' WHERE name = 'Fitness' AND slug != 'fitness';

-- 2. Make sure the courses have the correct categories array
-- Update Nutrition Fundamentals
UPDATE courses 
SET categories = ARRAY['Nutrition', 'Wellness']
WHERE slug = 'nutrition-fundamentals' AND NOT (categories @> ARRAY['Nutrition', 'Wellness']);

-- Update Functional Fitness Basics
UPDATE courses 
SET categories = ARRAY['Fitness']
WHERE slug = 'functional-fitness-basics' AND NOT (categories @> ARRAY['Fitness']);

-- Update Mindfulness Meditation
UPDATE courses 
SET categories = ARRAY['Wellness']
WHERE slug = 'mindfulness-meditation' AND NOT (categories @> ARRAY['Wellness']);

-- Update Advanced Nutrition Coaching
UPDATE courses 
SET categories = ARRAY['Nutrition']
WHERE slug = 'advanced-nutrition-coaching' AND NOT (categories @> ARRAY['Nutrition']);

-- Update Meditation for Beginners
UPDATE courses 
SET categories = ARRAY['Wellness']
WHERE slug = 'meditation-for-beginners' AND NOT (categories @> ARRAY['Wellness']);

-- Update Mindful Eating Practices
UPDATE courses 
SET categories = ARRAY['Nutrition', 'Wellness']
WHERE slug = 'mindful-eating-practices' AND NOT (categories @> ARRAY['Nutrition', 'Wellness']);

-- 3. Rebuild the junction table
DELETE FROM course_categories_courses;

INSERT INTO course_categories_courses (category_id, course_id)
SELECT c.id, co.id
FROM course_categories c, courses co
WHERE c.name = ANY(co.categories);

-- 4. Verify the fix
SELECT 
  cc.name as category_name, 
  cc.slug as category_slug,
  c.title as course_title,
  c.slug as course_slug
FROM 
  course_categories_courses ccc
JOIN 
  course_categories cc ON ccc.category_id = cc.id
JOIN 
  courses c ON ccc.course_id = c.id
ORDER BY 
  cc.name, c.title; 