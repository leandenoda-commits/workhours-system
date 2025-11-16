/*
  # Add RLS Policies for individuals and work_records tables

  ## Changes
  This migration adds Row Level Security (RLS) policies for:
  
  1. **individuals table**
     - SELECT policy: Authenticated users can view all individuals
     - INSERT policy: Authenticated users can create individuals
     - UPDATE policy: Authenticated users can update individuals
     - DELETE policy: Authenticated users can delete individuals
  
  2. **work_records table**
     - SELECT policy: Authenticated users can view all work records
     - INSERT policy: Authenticated users can create work records
     - UPDATE policy: Authenticated users can update work records
     - DELETE policy: Authenticated users can delete work records
  
  ## Security
  All policies require authentication and allow full CRUD operations for authenticated users.
  This matches the existing security model for affiliations and departments tables.
*/

-- Add RLS policies for individuals table
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

-- Add RLS policies for work_records table
CREATE POLICY "Authenticated users can view work records"
  ON work_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert work records"
  ON work_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update work records"
  ON work_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete work records"
  ON work_records FOR DELETE
  TO authenticated
  USING (true);
