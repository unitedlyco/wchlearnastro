# Courses Demo Data

This directory contains demo data for the courses functionality in the Learn platform.

## Database Setup

The `courses-demo-data.sql` file contains SQL statements to:

1. Create the necessary tables for courses functionality
2. Insert demo categories
3. Insert demo courses
4. Create relationships between courses and categories
5. Insert demo modules and lessons for selected courses

## How to Use

### Option 1: Using Supabase UI

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `courses-demo-data.sql`
5. Run the query

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db execute --file=src/data/courses-demo-data.sql
```

## Demo Content

The demo data includes:

### Categories
- Nutrition
- Wellness
- Fitness
- Mindfulness
- Business

### Courses
- Nutrition Fundamentals (Free)
- Advanced Nutritional Therapy (Paid)
- Mindfulness Meditation (Paid)
- Functional Fitness Basics (Free)
- Health Coaching Business Essentials (Paid)

Each course has:
- Title, description, and content
- Instructor information
- Duration and difficulty level
- Price information
- Categories and tags

Some courses also have modules and lessons with content.

## Testing

After importing the data, you can test the courses functionality by:

1. Visiting `/courses` to see all courses
2. Visiting `/courses/categories` to see all categories
3. Clicking on a course to view its details
4. Testing the enrollment functionality (for free courses)

## Customization

You can modify the demo data to fit your needs by editing the SQL file before importing it. You can:

- Change course titles, descriptions, and content
- Adjust pricing
- Add more categories, courses, modules, or lessons
- Modify the relationships between entities 