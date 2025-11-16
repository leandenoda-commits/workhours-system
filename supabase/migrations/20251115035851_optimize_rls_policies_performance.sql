/*
  # Optimize RLS Policies for Performance

  ## Changes
  This migration optimizes Row Level Security policies by wrapping auth.uid() calls 
  in SELECT statements to prevent re-evaluation for each row.
  
  ## Affected Tables
  1. **affiliations**
     - Updates all 4 policies (SELECT, INSERT, UPDATE, DELETE)
  
  2. **departments**
     - Updates all 4 policies (SELECT, INSERT, UPDATE, DELETE)
  
  3. **allowed_emails**
     - Updates 2 policies (INSERT, DELETE)
  
  ## Performance Impact
  This optimization prevents auth.uid() from being called for every row,
  instead it's evaluated once per query, significantly improving performance
  at scale.
*/

-- Drop and recreate affiliations policies with optimized auth check
DROP POLICY IF EXISTS "Users can view own affiliations" ON public.affiliations;
DROP POLICY IF EXISTS "Users can insert own affiliations" ON public.affiliations;
DROP POLICY IF EXISTS "Users can update own affiliations" ON public.affiliations;
DROP POLICY IF EXISTS "Users can delete own affiliations" ON public.affiliations;

CREATE POLICY "Users can view own affiliations"
  ON public.affiliations
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own affiliations"
  ON public.affiliations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own affiliations"
  ON public.affiliations
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own affiliations"
  ON public.affiliations
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Drop and recreate departments policies with optimized auth check
DROP POLICY IF EXISTS "Users can view own departments" ON public.departments;
DROP POLICY IF EXISTS "Users can insert own departments" ON public.departments;
DROP POLICY IF EXISTS "Users can update own departments" ON public.departments;
DROP POLICY IF EXISTS "Users can delete own departments" ON public.departments;

CREATE POLICY "Users can view own departments"
  ON public.departments
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own departments"
  ON public.departments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own departments"
  ON public.departments
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own departments"
  ON public.departments
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Drop and recreate allowed_emails policies with optimized auth check
DROP POLICY IF EXISTS "Authenticated users can add allowed emails" ON public.allowed_emails;
DROP POLICY IF EXISTS "Users can delete emails they added" ON public.allowed_emails;

CREATE POLICY "Authenticated users can add allowed emails"
  ON public.allowed_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (added_by = (SELECT auth.uid()));

CREATE POLICY "Users can delete emails they added"
  ON public.allowed_emails
  FOR DELETE
  TO authenticated
  USING (added_by = (SELECT auth.uid()));
