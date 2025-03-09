export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
  categories: string[];
  tags: string[];
  modules: CourseModule[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  duration: string;
  order: number;
  is_free: boolean;
}

export interface UserCourseProgress {
  user_id: string;
  course_id: string;
  progress_percentage: number;
  completed_lessons: string[];
  last_accessed: string;
  is_completed: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
} 