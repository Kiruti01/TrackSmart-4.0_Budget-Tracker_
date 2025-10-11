/*
  # Disable RLS for Investment Tables

  1. Changes
    - Disable RLS on investment_categories table
    - Disable RLS on investments table
    - Disable RLS on investment_updates table

  This allows the application to freely read/write investment data using the anon key.
*/

ALTER TABLE investment_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE investment_updates DISABLE ROW LEVEL SECURITY;
