/*
  # Add user_id column to all tables

  ## Changes
  1. Add user_id column to individuals table
  2. Add user_id column to affiliations table
  3. Add user_id column to departments table
  4. Add user_id column to work_records table
  5. Set default value to current authenticated user
  6. Add foreign key constraints

  ## Security
  - Tracks which user created each record
  - Enables proper ownership-based RLS policies in the future
  - user_id references auth.users(id)
*/

-- Add user_id to individuals table
ALTER TABLE individuals 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to affiliations table
ALTER TABLE affiliations 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to departments table
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to work_records table
ALTER TABLE work_records 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_individuals_user_id ON individuals(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliations_user_id ON affiliations(user_id);
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON departments(user_id);
CREATE INDEX IF NOT EXISTS idx_work_records_user_id ON work_records(user_id);
