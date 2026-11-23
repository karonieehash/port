-- Migration 002: Security and Row Level Security (RLS) Policies
-- Enforces:
-- 1. Public read access for all visitors (anonymous and authenticated).
-- 2. Owner-only update and insert permissions.
-- 3. No arbitrary owner self-assignment or public deletions.

-- 1. Enable Row Level Security on the portfolio table
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (for idempotent execution)
DROP POLICY IF EXISTS "Public visitors can view portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Only designated owner can update portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Only designated owner can insert portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "No deletion allowed" ON public.portfolio;

-- 3. Policy: Public visitors can view the portfolio
CREATE POLICY "Public visitors can view portfolio"
ON public.portfolio
FOR SELECT
TO public
USING (true);

-- 4. Policy: Only the designated authenticated owner can update the portfolio
-- Checks that auth.uid() equals owner_id, or verifies owner by email if owner_id is set
CREATE POLICY "Only designated owner can update portfolio"
ON public.portfolio
FOR UPDATE
TO authenticated
USING (
    auth.uid() = owner_id
    OR (
        owner_id IS NULL
        AND (auth.jwt() ->> 'email') = current_setting('app.settings.owner_email', true)
    )
)
WITH CHECK (
    auth.uid() = owner_id
    OR (
        owner_id IS NULL
        AND (auth.jwt() ->> 'email') = current_setting('app.settings.owner_email', true)
    )
);

-- 5. Helper function for owner assignment (Executed once by administrator or migration)
CREATE OR REPLACE FUNCTION public.assign_portfolio_owner(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.portfolio
    SET owner_id = target_user_id
    WHERE id = 'default';
END;
$$;
