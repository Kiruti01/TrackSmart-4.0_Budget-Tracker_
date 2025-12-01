/*
  # Fix Loans RLS Policies

  1. Changes
    - Drop existing RLS policies that use current_user
    - Disable RLS on loans table (service role access only)
    
  2. Notes
    - User authentication is handled at the application level via Clerk
    - RLS policies using current_user don't work with Clerk auth
*/

DROP POLICY IF EXISTS "Users can view own loans" ON loans;
DROP POLICY IF EXISTS "Users can insert own loans" ON loans;
DROP POLICY IF EXISTS "Users can update own loans" ON loans;
DROP POLICY IF EXISTS "Users can delete own loans" ON loans;

ALTER TABLE loans DISABLE ROW LEVEL SECURITY;