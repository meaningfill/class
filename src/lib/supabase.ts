import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Class {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_weeks: number;
  level: string;
  image_url: string;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Portfolio {
  id: string;
  title: string;
  description: string;
  event_type: string;
  guest_count: number;
  image_url: string;
  date: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  author: string;
  published_at: string;
  created_at: string;
}

export interface Curriculum {
  id: string;
  class_id: string;
  week_number: number;
  title: string;
  description: string;
  topics: string[];
}

export interface Schedule {
  id: string;
  class_id: string;
  start_date: string;
  end_date: string;
  day_of_week: string;
  time: string;
  available_slots: number;
}

export interface Enrollment {
  id: string;
  class_id: string;
  schedule_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  status: string;
  payment_status: string;
  created_at: string;
}
