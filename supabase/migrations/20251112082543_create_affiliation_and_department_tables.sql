/*
  # Create affiliation and department tables

  1. New Tables
    - `affiliations` (所属)
      - `id` (uuid, primary key)
      - `name` (text, unique, not null) - 所属名
      - `created_at` (timestamptz)
    
    - `departments` (部署)
      - `id` (uuid, primary key)
      - `affiliation_id` (uuid, foreign key to affiliations) - 所属ID
      - `name` (text, not null) - 部署名
      - `created_at` (timestamptz)
  
  2. Changes to individuals table
    - Add `affiliation_id` (uuid, foreign key to affiliations, nullable)
    - Add `department_id` (uuid, foreign key to departments, nullable)
  
  3. Security
    - Enable RLS on all new tables
*/

-- Create affiliations table
CREATE TABLE IF NOT EXISTS affiliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE affiliations ENABLE ROW LEVEL SECURITY;

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliation_id uuid REFERENCES affiliations(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Modify individuals table
DO $$
BEGIN
  -- Add new foreign key columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'individuals' AND column_name = 'affiliation_id'
  ) THEN
    ALTER TABLE individuals ADD COLUMN affiliation_id uuid REFERENCES affiliations(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'individuals' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE individuals ADD COLUMN department_id uuid REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
END $$;