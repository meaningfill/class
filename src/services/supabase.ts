﻿import { createClient } from '@supabase/supabase-js';

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

export interface Product {
  id: number;
  name: string;
  price: number;
  payment_link: string | null;
  image_url: string;
  description: string;
  detailed_description: string | null;
  features: string[] | null;
  components: string[] | null;
  recommended_events: string[] | null;
  ingredients: string[] | null;
  suitable_for: string[] | null;
  event_type: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  show_on_home: boolean | null;
  home_order: number | null;
  options: { name: string; values: string[] }[] | null;
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
export interface SiteSettings {
  id: number;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  updated_at: string | null;
}

export interface PublishQueueItem {
  id: string;
  source_post_id?: string | null;
  title: string;
  excerpt: string;
  content_html: string;
  meta_description: string | null;
  image_url: string | null;
  author: string | null;
  tags: string[] | null;
  seo_score: {
    hasH1: boolean;
    hasH2: boolean;
    hasFAQ: boolean;
    hasMetaDesc: boolean;
    keywordCount: number;
    contentLength: number;
  } | null;
  status: string;
  thread_text: string | null;
  created_at: string;
  published_at: string | null;
}

export interface ProductOrder {
  id: string;
  product_id: number;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}




