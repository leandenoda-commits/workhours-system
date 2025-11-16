/*
  # Add Foreign Key Indexes for Performance

  ## Changes
  This migration adds indexes on all foreign key columns to improve query performance.
  
  ## New Indexes
  1. **affiliations table**
     - `idx_affiliations_user_id` on `user_id` column
  
  2. **allowed_emails table**
     - `idx_allowed_emails_added_by` on `added_by` column
  
  3. **departments table**
     - `idx_departments_affiliation_id` on `affiliation_id` column
     - `idx_departments_user_id` on `user_id` column
  
  4. **individuals table**
     - `idx_individuals_affiliation_id` on `affiliation_id` column
     - `idx_individuals_department_id` on `department_id` column
  
  ## Performance Impact
  These indexes will significantly improve:
  - JOIN operations between related tables
  - Foreign key constraint checks
  - Queries filtering by foreign key columns
*/

-- Add index for affiliations.user_id
CREATE INDEX IF NOT EXISTS idx_affiliations_user_id ON public.affiliations(user_id);

-- Add index for allowed_emails.added_by
CREATE INDEX IF NOT EXISTS idx_allowed_emails_added_by ON public.allowed_emails(added_by);

-- Add index for departments.affiliation_id
CREATE INDEX IF NOT EXISTS idx_departments_affiliation_id ON public.departments(affiliation_id);

-- Add index for departments.user_id
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON public.departments(user_id);

-- Add index for individuals.affiliation_id
CREATE INDEX IF NOT EXISTS idx_individuals_affiliation_id ON public.individuals(affiliation_id);

-- Add index for individuals.department_id
CREATE INDEX IF NOT EXISTS idx_individuals_department_id ON public.individuals(department_id);
