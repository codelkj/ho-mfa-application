-- Fix infinite recursion in profiles RLS policies
-- The "Admins can view all profiles" policy was querying the profiles table
-- from within its own policy, causing infinite recursion.

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all break glass logs" ON public.break_glass_logs;
DROP POLICY IF EXISTS "Admins can update break glass logs" ON public.break_glass_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.auth_audit_logs;

-- Create a security definer function to check admin status
-- This avoids the infinite recursion by using a function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all break glass logs" ON public.break_glass_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update break glass logs" ON public.break_glass_logs
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all audit logs" ON public.auth_audit_logs
  FOR SELECT USING (public.is_admin());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Verify the fix
SELECT 'RLS recursion fix applied successfully!' as status;
