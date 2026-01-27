-- 0. Enable Vector Extension (REQUIRED for embedding)
create extension if not exists vector;

-- 1. Knowledge Base (Source of Truth for RAG)
create table if not exists rag_knowledge_base (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  category text, -- 'menu', 'pricing', 'general'
  tags text[],
  embedding vector(768), -- Reserved for future Vector Search
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Consultations (Sessions)
create table if not exists ai_consultations (
  id uuid default gen_random_uuid() primary key,
  session_id text unique not null,
  user_email text,
  extracted_intent jsonb, -- { "intent": "purchase", "score": 5 }
  conversion_status text default 'active', -- 'active', 'hot_lead', 'closed'
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Messages (Chat Logs)
create table if not exists ai_messages (
  id uuid default gen_random_uuid() primary key,
  consultation_id uuid references ai_consultations(id),
  role text not null, -- 'user', 'assistant', 'system'
  content text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Candidate Q&A (Suggestions from Auto-Learning Agent)
create table if not exists rag_candidates (
  id uuid default gen_random_uuid() primary key,
  source_message_id uuid references ai_messages(id),
  question text not null,
  answer text not null,
  reasoning text,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) - modify policies as needed
alter table rag_knowledge_base enable row level security;
alter table ai_consultations enable row level security;
alter table ai_messages enable row level security;
alter table rag_candidates enable row level security;

-- Allow public read/write for now (for development simplicity, tighten later)
create policy "Allow public access" on rag_knowledge_base for all using (true);
create policy "Allow public access" on ai_consultations for all using (true);
create policy "Allow public access" on ai_messages for all using (true);
create policy "Allow public access" on rag_candidates for all using (true);
