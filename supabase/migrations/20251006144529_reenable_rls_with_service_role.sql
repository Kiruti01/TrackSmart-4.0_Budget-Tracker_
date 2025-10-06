/*
  # Re-enable RLS for Security

  This migration re-enables Row Level Security on all tables.
  The application will use Supabase's service role connection to bypass RLS,
  while still maintaining the security policies for direct database access.
  
  Security Model:
  - RLS is enabled to protect against unauthorized direct database access
  - Application uses service role (which bypasses RLS) through Prisma
  - User authorization is handled by Clerk in Next.js server actions
  
  Tables affected:
  - UserSettings
  - Category
  - Transaction
  - MonthHistory
  - YearHistory
  - CumulativeSavings
*/

ALTER TABLE "UserSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MonthHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "YearHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CumulativeSavings" ENABLE ROW LEVEL SECURITY;