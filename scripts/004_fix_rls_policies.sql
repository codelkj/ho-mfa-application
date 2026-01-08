-- Fix RLS policies that are causing 500 errors
-- Drop all problematic policies and recreate them

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create simplified, non-recursive policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow everyone to see their own profile only
-- Admins will need higher-level access through service role
