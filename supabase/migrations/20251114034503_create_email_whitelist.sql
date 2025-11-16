/*
  # Email Whitelist System

  1. New Tables
    - `allowed_emails`
      - `id` (uuid, primary key) - Unique identifier
      - `email` (text, unique) - Whitelisted email address
      - `added_by` (uuid) - User who added this email
      - `created_at` (timestamptz) - When the email was added
      - `notes` (text, optional) - Optional notes about this email

  2. Security
    - Enable RLS on `allowed_emails` table
    - Only authenticated users can view the whitelist
    - Only authenticated users can add emails to whitelist
    - Users can only delete emails they added

  3. Important Notes
    - This table controls which email addresses can sign up
    - Initial setup requires manual database insert or admin function
    - Protects the application from unauthorized signups
*/

CREATE TABLE IF NOT EXISTS allowed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  added_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view allowed emails"
  ON allowed_emails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can add allowed emails"
  ON allowed_emails FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can delete emails they added"
  ON allowed_emails FOR DELETE
  TO authenticated
  USING (auth.uid() = added_by);

-- Create an index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_allowed_emails_email ON allowed_emails(email);
