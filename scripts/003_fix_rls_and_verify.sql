-- Diagnostic script to fix RLS policy issues

-- Step 1: Check if profiles table exists and has data
SELECT 'Profiles table status:' as check_point;
SELECT COUNT(*) as profile_count FROM public.profiles;
SELECT id, email, full_name, role FROM public.profiles LIMIT 10;

-- Step 2: Drop problematic RLS policies and recreate them with better logic
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Step 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create new, simpler RLS policies
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Step 6: Verify user exists in auth.users
SELECT 'Auth users count:' as check_point;
SELECT COUNT(*) FROM auth.users;

-- Step 7: Check for user ID mismatch between auth.users and profiles
SELECT 'Users in auth but not in profiles:' as check_point;
SELECT u.id, u.email FROM auth.users u 
LEFT JOIN public.profiles p ON u.id = p.id 
WHERE p.id IS NULL;

-- Step 8: Check RLS policy status
SELECT 'RLS policies:' as check_point;
SELECT schemaname, tablename, policyname, permissive 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY tablename, policyname;
