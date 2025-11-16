/*
  # Fix Individuals RLS Policies

  1. Problem
    - Current RLS policies require affiliation_id OR department_id to be set
    - Users cannot create individuals without affiliation/department
  
  2. Solution
    - Allow users to create/view/update/delete individuals if:
      a) The individual belongs to user's affiliation, OR
      b) The individual belongs to user's department, OR
      c) The individual has no affiliation/department set (user owns them directly)
  
  3. Changes
    - Drop existing restrictive policies
    - Create new flexible policies that allow individuals without affiliation/department
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own individuals" ON individuals;
DROP POLICY IF EXISTS "Users can insert own individuals" ON individuals;
DROP POLICY IF EXISTS "Users can update own individuals" ON individuals;
DROP POLICY IF EXISTS "Users can delete own individuals" ON individuals;

-- Allow viewing individuals that belong to user's affiliations/departments OR have no affiliation/department
CREATE POLICY "Users can view own individuals"
  ON individuals
  FOR SELECT
  TO authenticated
  USING (
    (affiliation_id IS NULL AND department_id IS NULL) OR
    EXISTS (
      SELECT 1 FROM affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = auth.uid()
    )
  );

-- Allow inserting individuals
CREATE POLICY "Users can insert own individuals"
  ON individuals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (affiliation_id IS NULL AND department_id IS NULL) OR
    EXISTS (
      SELECT 1 FROM affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = auth.uid()
    )
  );

-- Allow updating individuals
CREATE POLICY "Users can update own individuals"
  ON individuals
  FOR UPDATE
  TO authenticated
  USING (
    (affiliation_id IS NULL AND department_id IS NULL) OR
    EXISTS (
      SELECT 1 FROM affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    (affiliation_id IS NULL AND department_id IS NULL) OR
    EXISTS (
      SELECT 1 FROM affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = auth.uid()
    )
  );

-- Allow deleting individuals
CREATE POLICY "Users can delete own individuals"
  ON individuals
  FOR DELETE
  TO authenticated
  USING (
    (affiliation_id IS NULL AND department_id IS NULL) OR
    EXISTS (
      SELECT 1 FROM affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = auth.uid()
    )
  );
