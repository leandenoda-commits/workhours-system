/*
  # Add RLS Policies for individuals and work_records Tables

  ## Changes
  This migration adds comprehensive Row Level Security policies for the individuals 
  and work_records tables to ensure data security and proper access control.
  
  ## individuals Table Policies
  1. **SELECT**: Users can view their own individuals
  2. **INSERT**: Users can create individuals associated with their affiliations/departments
  3. **UPDATE**: Users can update their own individuals
  4. **DELETE**: Users can delete their own individuals
  
  ## work_records Table Policies
  1. **SELECT**: Users can view work records for their own individuals
  2. **INSERT**: Users can create work records for their own individuals
  3. **UPDATE**: Users can update work records for their own individuals
  4. **DELETE**: Users can delete work records for their own individuals
  
  ## Security Notes
  - All policies require authentication
  - Policies check ownership through the user_id chain
  - Uses optimized (SELECT auth.uid()) pattern for performance
*/

-- Add policies for individuals table
CREATE POLICY "Users can view own individuals"
  ON public.individuals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own individuals"
  ON public.individuals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own individuals"
  ON public.individuals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete own individuals"
  ON public.individuals
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliations
      WHERE affiliations.id = individuals.affiliation_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.departments
      WHERE departments.id = individuals.department_id
      AND departments.user_id = (SELECT auth.uid())
    )
  );

-- Add policies for work_records table
CREATE POLICY "Users can view own work records"
  ON public.work_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.affiliations ON affiliations.id = individuals.affiliation_id
      WHERE individuals.id = work_records.individual_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.departments ON departments.id = individuals.department_id
      WHERE individuals.id = work_records.individual_id
      AND departments.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own work records"
  ON public.work_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.affiliations ON affiliations.id = individuals.affiliation_id
      WHERE individuals.id = work_records.individual_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.departments ON departments.id = individuals.department_id
      WHERE individuals.id = work_records.individual_id
      AND departments.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own work records"
  ON public.work_records
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.affiliations ON affiliations.id = individuals.affiliation_id
      WHERE individuals.id = work_records.individual_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.departments ON departments.id = individuals.department_id
      WHERE individuals.id = work_records.individual_id
      AND departments.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.affiliations ON affiliations.id = individuals.affiliation_id
      WHERE individuals.id = work_records.individual_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.departments ON departments.id = individuals.department_id
      WHERE individuals.id = work_records.individual_id
      AND departments.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete own work records"
  ON public.work_records
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.affiliations ON affiliations.id = individuals.affiliation_id
      WHERE individuals.id = work_records.individual_id
      AND affiliations.user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.individuals
      JOIN public.departments ON departments.id = individuals.department_id
      WHERE individuals.id = work_records.individual_id
      AND departments.user_id = (SELECT auth.uid())
    )
  );
