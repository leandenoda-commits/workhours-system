/*
  # Remove Unused Indexes

  1. Changes
    - Remove all unused indexes that have not been used
    - This will improve database performance by reducing index maintenance overhead
    - These indexes were added for optimization but are not being utilized by queries

  2. Indexes Removed
    - idx_work_records_individual_id
    - idx_work_records_work_date
    - idx_work_records_individual_date
    - idx_affiliations_user_id
    - idx_allowed_emails_added_by
    - idx_departments_affiliation_id
    - idx_departments_user_id
    - idx_individuals_affiliation_id
    - idx_individuals_department_id
    - idx_allowed_emails_email
*/

-- Drop unused indexes on work_records table
DROP INDEX IF EXISTS idx_work_records_individual_id;
DROP INDEX IF EXISTS idx_work_records_work_date;
DROP INDEX IF EXISTS idx_work_records_individual_date;

-- Drop unused indexes on affiliations table
DROP INDEX IF EXISTS idx_affiliations_user_id;

-- Drop unused indexes on allowed_emails table
DROP INDEX IF EXISTS idx_allowed_emails_added_by;
DROP INDEX IF EXISTS idx_allowed_emails_email;

-- Drop unused indexes on departments table
DROP INDEX IF EXISTS idx_departments_affiliation_id;
DROP INDEX IF EXISTS idx_departments_user_id;

-- Drop unused indexes on individuals table
DROP INDEX IF EXISTS idx_individuals_affiliation_id;
DROP INDEX IF EXISTS idx_individuals_department_id;
