# Loading Demo Courses into Supabase

Follow these instructions to load the demo courses data into your Supabase database.

## Option 1: Using Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard at https://app.supabase.io/
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of the `courses-demo-data.sql` file into the SQL editor
6. Click "Run" to execute the SQL

## Option 2: Using Supabase CLI (If installed)

If you have the Supabase CLI installed and configured, you can run:

```bash
supabase db execute --file=src/data/courses-demo-data.sql
```

## Verifying the Data

After running the SQL, you can verify that the data was loaded correctly:

1. Go to the "Table Editor" in the Supabase dashboard
2. You should see the following tables:
   - `course_categories` (with 5 categories)
   - `courses` (with 5 courses)
   - `course_modules` (with modules for the courses)
   - `course_lessons` (with lessons for the modules)
   - `course_categories_courses` (junction table connecting categories and courses)
   - `user_course_progress` (empty table for tracking user progress)

## Troubleshooting

If you encounter any errors:

1. Check if the tables already exist. If they do, you might need to drop them first or use the `IF NOT EXISTS` clause (which is already included in the SQL).
2. Make sure you have the necessary permissions to create tables in your Supabase project.
3. If you get foreign key constraint errors, make sure you're running the entire SQL script at once, not in parts.

## Next Steps

Once the data is loaded, you can:

1. Visit `/courses` to see all courses
2. Visit `/courses/categories` to see all categories
3. Click on a category to see courses in that category
4. Click on a course to view its details 