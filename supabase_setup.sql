-- Supabase Schema Setup

-- Table for user bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id text NOT NULL, -- subjectId or moduleId
  type text NOT NULL, -- "subject" or "module"
  title text NOT NULL,
  subtitle text NOT NULL,
  subject_id text,
  subject_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Enable RLS for bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for bookmarks
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks" 
  ON public.bookmarks FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can insert their own bookmarks" 
  ON public.bookmarks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete their own bookmarks" 
  ON public.bookmarks FOR DELETE 
  USING (auth.uid() = user_id);

-- Table for completed items
CREATE TABLE IF NOT EXISTS public.completed_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Enable RLS for completed_items
ALTER TABLE public.completed_items ENABLE ROW LEVEL SECURITY;

-- Policies for completed_items
DROP POLICY IF EXISTS "Users can view their own completed items" ON public.completed_items;
CREATE POLICY "Users can view their own completed items" 
  ON public.completed_items FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own completed items" ON public.completed_items;
CREATE POLICY "Users can insert their own completed items" 
  ON public.completed_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own completed items" ON public.completed_items;
CREATE POLICY "Users can delete their own completed items" 
  ON public.completed_items FOR DELETE 
  USING (auth.uid() = user_id);
