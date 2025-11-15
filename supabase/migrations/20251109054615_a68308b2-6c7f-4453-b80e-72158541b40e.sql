-- Create labels table for current affairs categorization
CREATE TABLE public.labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for current affairs and labels (many-to-many)
CREATE TABLE public.current_affair_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_affair_id UUID NOT NULL REFERENCES public.current_affairs(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(current_affair_id, label_id)
);

-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  placement TEXT NOT NULL CHECK (placement IN ('quiz', 'dashboard', 'results', 'current_affairs')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on labels
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

-- Labels policies
CREATE POLICY "Anyone can view labels"
  ON public.labels FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage labels"
  ON public.labels FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on current_affair_labels
ALTER TABLE public.current_affair_labels ENABLE ROW LEVEL SECURITY;

-- Current affair labels policies
CREATE POLICY "Anyone can view current affair labels"
  ON public.current_affair_labels FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage current affair labels"
  ON public.current_affair_labels FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on advertisements
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Advertisements policies
CREATE POLICY "Anyone can view active advertisements"
  ON public.advertisements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all advertisements"
  ON public.advertisements FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage advertisements"
  ON public.advertisements FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add some default labels
INSERT INTO public.labels (name, color) VALUES
  ('Politics', '#ef4444'),
  ('Economy', '#f59e0b'),
  ('Science', '#3b82f6'),
  ('Technology', '#8b5cf6'),
  ('Sports', '#10b981'),
  ('Entertainment', '#ec4899'),
  ('Environment', '#14b8a6'),
  ('Health', '#f97316');