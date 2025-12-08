/*
  # Create Loans Tracking Table

  1. New Tables
    - `loans`
      - `id` (uuid, primary key)
      - `user_id` (text, references user)
      - `person_name` (text, name of person who borrowed money)
      - `amount` (real, amount lent)
      - `description` (text, optional notes)
      - `date_lent` (timestamptz, when money was lent)
      - `is_paid_back` (boolean, whether loan has been repaid)
      - `date_paid_back` (timestamptz, when money was repaid)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, record update time)

  2. Security
    - Enable RLS on `loans` table
    - Add policy for authenticated users to manage their own loans
*/

CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  person_name text NOT NULL,
  amount real NOT NULL,
  description text DEFAULT '',
  date_lent timestamptz NOT NULL DEFAULT now(),
  is_paid_back boolean DEFAULT false,
  date_paid_back timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loans"
  ON loans
  FOR SELECT
  TO authenticated
  USING (user_id = current_user);

CREATE POLICY "Users can insert own loans"
  ON loans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update own loans"
  ON loans
  FOR UPDATE
  TO authenticated
  USING (user_id = current_user)
  WITH CHECK (user_id = current_user);

CREATE POLICY "Users can delete own loans"
  ON loans
  FOR DELETE
  TO authenticated
  USING (user_id = current_user);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_is_paid_back ON loans(is_paid_back);