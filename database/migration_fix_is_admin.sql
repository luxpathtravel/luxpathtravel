-- =============================================================================
-- LUXPATH TRAVEL — REPAIR MISSING ADMIN-ROLE TABLE
-- =============================================================================
-- Run this once in the Supabase SQL Editor.
--
-- The production project is missing public.user_roles, which is required by the
-- Storage RLS policies. This migration restores the table, grants the dashboard
-- Google account super-admin access, and recreates the role-check function.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role       text NOT NULL DEFAULT 'admin'
               CHECK (role IN ('admin', 'super_admin')),
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- The dashboard only permits this Google account to sign in (see login.js).
-- Insert or upgrade its role without needing to know the Auth user UUID.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'system@luxpathtravel.com'
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'super_admin')
    );
END;
$$;

COMMENT ON FUNCTION public.is_admin() IS
    'Returns true if the currently authenticated user has admin or super_admin role.';

-- Admins may only read their own role record. The security-definer function
-- above deliberately bypasses this policy while Storage evaluates its RLS rule.
DROP POLICY IF EXISTS rls_user_roles_self_select ON public.user_roles;
CREATE POLICY rls_user_roles_self_select
    ON public.user_roles FOR SELECT
    USING (user_id = auth.uid());

-- Verify the function definition is valid. It returns false in SQL Editor
-- because auth.uid() is null there; test the actual upload in dashboard.html.
SELECT public.is_admin() AS current_sql_editor_user_is_admin;
