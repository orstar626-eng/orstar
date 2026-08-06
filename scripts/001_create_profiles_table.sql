-- Create profiles table for storing public profile pages
-- This table is publicly accessible (no RLS) since profiles are meant to be shared

CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  name_color TEXT DEFAULT '#ffffff',
  name_font TEXT DEFAULT 'font-cairo',
  name_size TEXT DEFAULT 'medium',
  bio TEXT DEFAULT '',
  bio_font TEXT DEFAULT 'font-cairo',
  avatar TEXT,
  avatar_style TEXT DEFAULT 'circle',
  avatar_size TEXT DEFAULT 'medium',
  avatar_glow BOOLEAN DEFAULT false,
  social_links JSONB DEFAULT '[]'::jsonb,
  theme JSONB NOT NULL,
  media JSONB DEFAULT '[]'::jsonb,
  music_url TEXT,
  music_autoplay BOOLEAN DEFAULT true,
  music_loop BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
