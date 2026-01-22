-- Enable vector extension if we want embeddings later (optional for now)
-- create extension if not exists vector;

-- Table: ai_consultations
-- Stores the high-level metadata of a chat session, specifically extracted intent.
create table if not exists public.ai_consultations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  session_id text, -- Browser session ID or User ID
  user_email text, -- Optional if provided
  
  -- Structured Data for Training
  intent_summary jsonb, -- { "budget": "low", "purpose": "wedding", "mood": "luxury" }
  reference_image_urls text[], -- Competitor image URLs uploaded by user
  
  -- Metrics
  sent_product_count int default 0, -- How many products were suggested
  conversion_status text default 'active' -- active, cart_added, ordered
);

-- Table: ai_messages
-- Stores the actual chat log for NLP training
create table if not exists public.ai_messages (
  id uuid default gen_random_uuid() primary key,
  consultation_id uuid references public.ai_consultations(id),
  role text not null, -- 'user', 'assistant', 'system'
  content text,
  metadata jsonb, -- { "recommended_product_ids": [1, 2] }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Open for inserts for now, restricted read)
alter table public.ai_consultations enable row level security;
alter table public.ai_messages enable row level security;

create policy "Allow anonymous inserts to consultations"
  on public.ai_consultations for insert
  with check (true);

create policy "Allow anonymous inserts to messages"
  on public.ai_messages for insert
  with check (true);
