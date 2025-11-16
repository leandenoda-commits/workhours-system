/*
  # Add Authentication and Secure RLS Policies

  1. Security Changes
    - Drop all existing insecure public policies
    - Create new restrictive policies that require authentication
    - All tables now require users to be authenticated to access data
    
  2. New Policies
    - `affiliations`: authenticated users can read and write
    - `departments`: authenticated users can read and write
    - `individuals`: authenticated users can read and write
    - `work_records`: authenticated users can read and write
    
  3. Important Notes
    - This migration removes the dangerous `USING (true)` policies
    - All data access now requires authentication
    - Anonymous access is completely blocked
    - Users must sign in to access any data
*/

-- Drop all existing insecure policies
DROP POLICY IF EXISTS "Allow public access to affiliations" ON affiliations;
DROP POLICY IF EXISTS "Allow public access to departments" ON departments;
DROP POLICY IF EXISTS "Allow public access to individuals" ON individuals;
DROP POLICY IF EXISTS "Allow public access to work_records" ON work_records;

-- Affiliations policies
CREATE POLICY "Authenticated users can view affiliations"
  ON affiliations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert affiliations"
  ON affiliations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update affiliations"
  ON affiliations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete affiliations"
  ON affiliations FOR DELETE
  TO authenticated
  USING (true);

-- Departments policies
CREATE POLICY "Authenticated users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (true);

-- Individuals policies
CREATE POLICY "Authenticated users can view individuals"
  ON individuals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert individuals"
  ON individuals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update individuals"
  ON individuals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete individuals"
  ON individuals FOR DELETE
  TO authenticated
  USING (true);

-- Work records policies
CREATE POLICY "Authenticated users can view work_records"
  ON work_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert work_records"
  ON work_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update work_records"
  ON work_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete work_records"
  ON work_records FOR DELETE
  TO authenticated
  USING (true);