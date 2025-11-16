/*
  # Add affiliation and department columns to individuals table

  1. Changes
    - Add `affiliation` column (text, nullable) - 所属
    - Add `department` column (text, nullable) - 部署
  
  2. Notes
    - Both columns are nullable to allow existing records to remain valid
    - Existing individuals will have null values for these fields by default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'individuals' AND column_name = 'affiliation'
  ) THEN
    ALTER TABLE individuals ADD COLUMN affiliation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'individuals' AND column_name = 'department'
  ) THEN
    ALTER TABLE individuals ADD COLUMN department text;
  END IF;
END $$;
