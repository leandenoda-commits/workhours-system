/*
  # Add Indexes for Foreign Keys

  1. Changes
    - Add covering indexes for all foreign key constraints
    - This improves JOIN performance and foreign key constraint checking
    - Indexes are added only if they don't already exist

  2. Indexes Added
    - idx_affiliations_user_id on affiliations(user_id)
    - idx_allowed_emails_added_by on allowed_emails(added_by)
    - idx_departments_affiliation_id on departments(affiliation_id)
    - idx_departments_user_id on departments(user_id)
    - idx_individuals_affiliation_id on individuals(affiliation_id)
    - idx_individuals_department_id on individuals(department_id)

  3. Performance Impact
    - Faster JOIN operations on related tables
    - Improved foreign key constraint validation
    - Better query optimization for filtered queries
*/

-- Add index for affiliations.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_affiliations_user_id ON public.affiliations(user_id);

-- Add index for allowed_emails.added_by foreign key
CREATE INDEX IF NOT EXISTS idx_allowed_emails_added_by ON public.allowed_emails(added_by);

-- Add index for departments.affiliation_id foreign key
CREATE INDEX IF NOT EXISTS idx_departments_affiliation_id ON public.departments(affiliation_id);

-- Add index for departments.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON public.departments(user_id);

-- Add index for individuals.affiliation_id foreign key
CREATE INDEX IF NOT EXISTS idx_individuals_affiliation_id ON public.individuals(affiliation_id);

-- Add index for individuals.department_id foreign key
CREATE INDEX IF NOT EXISTS idx_individuals_department_id ON public.individuals(department_id);
