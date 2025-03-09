# Setting Up the Courses Database in Supabase

Follow these steps to set up the courses database in your Supabase project:

## Step 1: Create the Basic Tables

1. Log in to your Supabase dashboard at https://app.supabase.io/
2. Navigate to your project (ekupvddxbtrlczfwjoyo)
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of `courses-simple-setup.sql` into the SQL editor
6. Click "Run" to execute the SQL

This will create the following tables:
- `course_categories`
- `courses`
- `course_categories_courses` (junction table)

And insert some basic demo data.

## Step 2: Add Modules and Lessons

1. Create a new query in the SQL Editor
2. Copy and paste the contents of `courses-modules-lessons.sql` into the SQL editor
3. Click "Run" to execute the SQL

This will create the following tables:
- `course_modules`
- `course_lessons`

And insert some basic module and lesson data.

## Step 3: Add User Progress Table

1. Create a new query in the SQL Editor
2. Copy and paste the contents of `courses-user-progress.sql` into the SQL editor
3. Click "Run" to execute the SQL

This will create the `user_course_progress` table with appropriate RLS policies.

## Step 4: Verify the Setup

1. Create a new query in the SQL Editor
2. Copy and paste the contents of `courses-check-tables.sql` into the SQL editor
3. Click "Run" to execute the SQL

This will show you the tables that have been created and the data that has been inserted.

## Troubleshooting

If you encounter any errors:

1. Check if the tables already exist. If they do, you might need to drop them first or use the `IF NOT EXISTS` clause (which is already included in the SQL).
2. Make sure you have the necessary permissions to create tables in your Supabase project.
3. If you get foreign key constraint errors, make sure you're running the scripts in the correct order.

After setting up the database, refresh your application and visit the `/courses` page to see the courses and categories. 