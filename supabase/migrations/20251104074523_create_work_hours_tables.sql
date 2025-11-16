/*
  # Work Hours Tracking System

  1. New Tables
    - `work_records` - Daily work time records with clock in/out and break times
      - `id` (uuid, primary key)
      - `date` (date)
      - `employee_name` (text)
      - `clock_in` (time)
      - `clock_out` (time)
      - `break_start` (time, nullable)
      - `break_end` (time, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `work_records` table
    - Add policy for all users to read and manage records
*/

CREATE TABLE IF NOT EXISTS work_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  employee_name text NOT NULL,
  clock_in time NOT NULL,
  clock_out time NOT NULL,
  break_start time,
  break_end time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view work records"
  ON work_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert work records"
  ON work_records FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update work records"
  ON work_records FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete work records"
  ON work_records FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_work_records_date ON work_records(date);
CREATE INDEX IF NOT EXISTS idx_work_records_employee ON work_records(employee_name);
CREATE INDEX IF NOT EXISTS idx_work_records_date_employee ON work_records(date, employee_name);
