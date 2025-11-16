/*
  # Fix Insecure RLS Policies

  1. Problem
    - All existing policies use `USING (true)` which allows any authenticated user to access all data
    - This defeats the purpose of Row Level Security

  2. Changes
    - Drop all existing insecure policies
    - Create new secure policies that check user ownership using auth.uid()
    - Add user_id column to all tables to track ownership
    - Ensure only data owners can access their own data

  3. Security
    - Users can only view, insert, update, and delete their own data
    - All policies check auth.uid() = user_id for proper access control
*/

-- Add user_id column to track ownership
ALTER TABLE affiliations 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE individuals 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE work_records 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop all existing insecure policies
DROP POLICY IF EXISTS "Authenticated users can view affiliations" ON affiliations;
DROP POLICY IF EXISTS "Authenticated users can insert affiliations" ON affiliations;
DROP POLICY IF EXISTS "Authenticated users can update affiliations" ON affiliations;
DROP POLICY IF EXISTS "Authenticated users can delete affiliations" ON affiliations;

DROP POLICY IF EXISTS "Authenticated users can view departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can insert departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can update departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can delete departments" ON departments;

DROP POLICY IF EXISTS "Authenticated users can view individuals" ON individuals;
DROP POLICY IF EXISTS "Authenticated users can insert individuals" ON individuals;
DROP POLICY IF EXISTS "Authenticated users can update individuals" ON individuals;
DROP POLICY IF EXISTS "Authenticated users can delete individuals" ON individuals;

DROP POLICY IF EXISTS "Authenticated users can view work records" ON work_records;
DROP POLICY IF EXISTS "Authenticated users can insert work records" ON work_records;
DROP POLICY IF EXISTS "Authenticated users can update work records" ON work_records;
DROP POLICY IF EXISTS "Authenticated users can delete work records" ON work_records;

-- Create secure policies for affiliations
CREATE POLICY "Users can view own affiliations"
  ON affiliations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliations"
  ON affiliations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliations"
  ON affiliations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own affiliations"
  ON affiliations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create secure policies for departments
CREATE POLICY "Users can view own departments"
  ON departments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own departments"
  ON departments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create secure policies for individuals
CREATE POLICY "Users can view own individuals"
  ON individuals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own individuals"
  ON individuals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own individuals"
  ON individuals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own individuals"
  ON individuals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create secure policies for work_records
CREATE POLICY "Users can view own work records"
  ON work_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work records"
  ON work_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work records"
  ON work_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own work records"
  ON work_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
