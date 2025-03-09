# Courses Database Setup

This directory contains the SQL scripts needed to set up the courses functionality in the Supabase database.

## SQL Scripts

I've broken down the setup into smaller, manageable scripts:

1. `1-create-tables.sql` - Creates all the necessary tables
2. `2-enable-rls.sql` - Enables Row Level Security and creates policies
3. `3-insert-demo-data.sql` - Inserts basic demo data
4. `4-verify-setup.sql` - Verifies that everything was set up correctly

## How to Use

### Using Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard at https://app.supabase.io/
2. Navigate to your project (ekupvddxbtrlczfwjoyo)
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of each script in order (1, 2, 3, 4)
6. Run each script one at a time

### Using Supabase CLI (If installed)

If you have the Supabase CLI installed and configured, you can run:

```bash
# First, link to your project
npx supabase link --project-ref ekupvddxbtrlczfwjoyo

# Then run each script
cat src/data/1-create-tables.sql | npx supabase db remote sql
cat src/data/2-enable-rls.sql | npx supabase db remote sql
cat src/data/3-insert-demo-data.sql | npx supabase db remote sql
cat src/data/4-verify-setup.sql | npx supabase db remote sql
```

## Tables Created

These scripts create the following tables:

- `course_categories` - Categories for courses
- `courses` - Main courses table
- `course_categories_courses` - Junction table connecting categories and courses
- `course_modules` - Modules within courses
- `course_lessons` - Lessons within modules
- `user_course_progress` - Tracks user progress through courses

## Demo Data

The scripts also insert basic demo data:

- 3 categories (Nutrition, Wellness, Fitness)
- 2 courses (Nutrition Fundamentals, Functional Fitness Basics)
- Connections between courses and categories

## Troubleshooting

If you encounter any errors:

1. Make sure you run the scripts in order (1, 2, 3, 4)
2. Check if the tables already exist. The scripts use `IF NOT EXISTS` so it should be safe to run multiple times.
3. If you get policy errors, you might need to drop the existing policies first.
4. Make sure you have the necessary permissions to create tables in your Supabase project. 