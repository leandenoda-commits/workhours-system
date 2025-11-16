/*
  # Simplify RLS Policies for All Tables

  ## Changes
  1. Allow all authenticated users to:
     - SELECT (read) all records
     - INSERT (create) new records
     - UPDATE existing records
     - DELETE existing records

  ## Security
  - All operations require authentication
  - This is appropriate for a single-organization application where all authenticated users can access all data

  ## Tables Updated
  - individuals
  - affiliations
  - departments
  - work_records
*/

-- ==========================================
-- INDIVIDUALS TABLE
-- ==========================================
DROP POLICY IF EXISTS "Authenticated users can read all individuals" ON individuals;
DROP POLICY IF EXISTS "Authenticated users can insert individuals" ON individuals;
DROP POLICY IF EXISTS "Users can update own individuals" ON individuals;
DROP POLICY IF EXISTS "Users can delete own individuals" ON individuals;
DROP POLICY IF EXISTS "Users can read own individuals" ON individuals;
DROP POLICY IF EXISTS "Users can insert own individuals" ON individuals;

CREATE POLICY "Allow all for authenticated users on individuals"
  ON individuals FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- AFFILIATIONS TABLE
-- ==========================================
DROP POLICY IF EXISTS "Authenticated users can read all affiliations" ON affiliations;
DROP POLICY IF EXISTS "Authenticated users can insert affiliations" ON affiliations;
DROP POLICY IF EXISTS "Users can update own affiliations" ON affiliations;
DROP POLICY IF EXISTS "Users can delete own affiliations" ON affiliations;
DROP POLICY IF EXISTS "Users can read own affiliations" ON affiliations;
DROP POLICY IF EXISTS "Users can insert own affiliations" ON affiliations;

CREATE POLICY "Allow all for authenticated users on affiliations"
  ON affiliations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- DEPARTMENTS TABLE
-- ==========================================
DROP POLICY IF EXISTS "Authenticated users can read all departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can insert departments" ON departments;
DROP POLICY IF EXISTS "Users can update own departments" ON departments;
DROP POLICY IF EXISTS "Users can delete own departments" ON departments;
DROP POLICY IF EXISTS "Users can read own departments" ON departments;
DROP POLICY IF EXISTS "Users can insert own departments" ON departments;

CREATE POLICY "Allow all for authenticated users on departments"
  ON departments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- WORK_RECORDS TABLE
-- ==========================================
DROP POLICY IF EXISTS "Authenticated users can read all work records" ON work_records;
DROP POLICY IF EXISTS "Authenticated users can insert work records" ON work_records;
DROP POLICY IF EXISTS "Users can update own work records" ON work_records;
DROP POLICY IF EXISTS "Users can delete own work records" ON work_records;
DROP POLICY IF EXISTS "Users can read own work records" ON work_records;
DROP POLICY IF EXISTS "Users can insert own work records" ON work_records;

CREATE POLICY "Allow all for authenticated users on work_records"
  ON work_records FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
