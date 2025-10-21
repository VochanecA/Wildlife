-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'officer' CHECK (role IN ('officer', 'supervisor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create wildlife_sightings table
CREATE TABLE IF NOT EXISTS public.wildlife_sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on wildlife_sightings
ALTER TABLE public.wildlife_sightings ENABLE ROW LEVEL SECURITY;

-- Wildlife sightings policies
CREATE POLICY "Users can view all sightings" ON public.wildlife_sightings FOR SELECT USING (true);
CREATE POLICY "Users can insert own sightings" ON public.wildlife_sightings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sightings" ON public.wildlife_sightings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sightings" ON public.wildlife_sightings FOR DELETE USING (auth.uid() = user_id);

-- Create hazard_reports table
CREATE TABLE IF NOT EXISTS public.hazard_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on hazard_reports
ALTER TABLE public.hazard_reports ENABLE ROW LEVEL SECURITY;

-- Hazard reports policies
CREATE POLICY "Users can view all hazard reports" ON public.hazard_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert own hazard reports" ON public.hazard_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hazard reports" ON public.hazard_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hazard reports" ON public.hazard_reports FOR DELETE USING (auth.uid() = user_id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can view all tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update tasks assigned to them" ON public.tasks FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_to);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Create activity_plans table
CREATE TABLE IF NOT EXISTS public.activity_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  season TEXT NOT NULL CHECK (season IN ('summer', 'winter')),
  season_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on activity_plans
ALTER TABLE public.activity_plans ENABLE ROW LEVEL SECURITY;

-- Activity plans policies
CREATE POLICY "Users can view all activity plans" ON public.activity_plans FOR SELECT USING (true);
CREATE POLICY "Users can insert own activity plans" ON public.activity_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activity plans" ON public.activity_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activity plans" ON public.activity_plans FOR DELETE USING (auth.uid() = user_id);

-- Create activity_plan_items table
CREATE TABLE IF NOT EXISTS public.activity_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.activity_plans(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  duration TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on activity_plan_items
ALTER TABLE public.activity_plan_items ENABLE ROW LEVEL SECURITY;

-- Activity plan items policies
CREATE POLICY "Users can view all activity plan items" ON public.activity_plan_items FOR SELECT USING (true);
CREATE POLICY "Users can insert activity plan items" ON public.activity_plan_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.activity_plans WHERE id = plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update activity plan items" ON public.activity_plan_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.activity_plans WHERE id = plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete activity plan items" ON public.activity_plan_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.activity_plans WHERE id = plan_id AND user_id = auth.uid())
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can insert messages they send" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update messages they received" ON public.messages FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Users can delete messages they sent or received" ON public.messages FOR DELETE USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
