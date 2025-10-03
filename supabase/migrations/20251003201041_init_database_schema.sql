/*
  # Initialize Database Schema

  1. New Tables
    - `UserSettings`
      - `userId` (text, primary key) - unique identifier for each user
      - `currency` (text) - user's preferred currency
    
    - `Category`
      - `createdAt` (timestamp) - when category was created
      - `name` (text) - category name
      - `userId` (text) - owner of the category
      - `icon` (text) - emoji icon for the category
      - `type` (text) - either 'income', 'expense', or 'savings'
      - Unique constraint on (name, userId, type)
    
    - `Transaction`
      - `id` (uuid, primary key) - unique transaction identifier
      - `createdAt` (timestamp) - when transaction was created
      - `updatedAt` (timestamp) - when transaction was last updated
      - `amount` (float) - transaction amount in user's currency
      - `description` (text) - transaction description
      - `date` (timestamp) - when transaction occurred
      - `userId` (text) - owner of the transaction
      - `type` (text) - either 'income', 'expense', or 'savings'
      - `category` (text) - category name
      - `categoryIcon` (text) - category icon
      - `originalAmount` (float) - original amount before currency conversion
      - `originalCurrency` (text) - original currency code
    
    - `MonthHistory`
      - `userId` (text) - user identifier
      - `day` (integer) - day of month
      - `month` (integer) - month number
      - `year` (integer) - year
      - `income` (float) - total income for the day
      - `expense` (float) - total expenses for the day
      - `savings` (float) - total savings for the day
      - Composite primary key on (userId, day, month, year)
    
    - `YearHistory`
      - `userId` (text) - user identifier
      - `month` (integer) - month number
      - `year` (integer) - year
      - `income` (float) - total income for the month
      - `expense` (float) - total expenses for the month
      - `savings` (float) - total savings for the month
      - Composite primary key on (month, year, userId)
    
    - `CumulativeSavings`
      - `userId` (text, primary key) - user identifier
      - `totalSavings` (float) - running total of all savings
      - `updatedAt` (timestamp) - when last updated

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data

  3. Important Notes
    - All monetary values stored as DOUBLE PRECISION
    - Timestamps use TIMESTAMP(3) for millisecond precision
    - Categories are unique per user and type combination
    - History tables track daily and monthly aggregates for performance
*/

-- CreateTable UserSettings
CREATE TABLE IF NOT EXISTS "UserSettings" (
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- CreateTable Category
CREATE TABLE IF NOT EXISTS "Category" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'income'
);

-- CreateTable Transaction
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'income',
    "category" TEXT NOT NULL,
    "categoryIcon" TEXT NOT NULL,
    "originalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "originalCurrency" TEXT NOT NULL DEFAULT 'USD',
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable MonthHistory
CREATE TABLE IF NOT EXISTS "MonthHistory" (
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "savings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "MonthHistory_pkey" PRIMARY KEY ("day","month","year","userId")
);

-- CreateTable YearHistory
CREATE TABLE IF NOT EXISTS "YearHistory" (
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "savings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "YearHistory_pkey" PRIMARY KEY ("month","year","userId")
);

-- CreateTable CumulativeSavings
CREATE TABLE IF NOT EXISTS "CumulativeSavings" (
  "userId" TEXT NOT NULL,
  "totalSavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CumulativeSavings_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_userId_type_key" ON "Category"("name", "userId", "type");

-- Enable Row Level Security
ALTER TABLE "UserSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MonthHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "YearHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CumulativeSavings" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for UserSettings
CREATE POLICY "Users can view own settings"
  ON "UserSettings" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own settings"
  ON "UserSettings" FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own settings"
  ON "UserSettings" FOR UPDATE
  TO authenticated
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own settings"
  ON "UserSettings" FOR DELETE
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- Create RLS Policies for Category
CREATE POLICY "Users can view own categories"
  ON "Category" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own categories"
  ON "Category" FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own categories"
  ON "Category" FOR UPDATE
  TO authenticated
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own categories"
  ON "Category" FOR DELETE
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- Create RLS Policies for Transaction
CREATE POLICY "Users can view own transactions"
  ON "Transaction" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own transactions"
  ON "Transaction" FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own transactions"
  ON "Transaction" FOR UPDATE
  TO authenticated
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own transactions"
  ON "Transaction" FOR DELETE
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- Create RLS Policies for MonthHistory
CREATE POLICY "Users can view own month history"
  ON "MonthHistory" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own month history"
  ON "MonthHistory" FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own month history"
  ON "MonthHistory" FOR UPDATE
  TO authenticated
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own month history"
  ON "MonthHistory" FOR DELETE
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- Create RLS Policies for YearHistory
CREATE POLICY "Users can view own year history"
  ON "YearHistory" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own year history"
  ON "YearHistory" FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own year history"
  ON "YearHistory" FOR UPDATE
  TO authenticated
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own year history"
  ON "YearHistory" FOR DELETE
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- Create RLS Policies for CumulativeSavings
CREATE POLICY "Users can view own cumulative savings"
  ON "CumulativeSavings" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own cumulative savings"
  ON "CumulativeSavings" FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own cumulative savings"
  ON "CumulativeSavings" FOR UPDATE
  TO authenticated
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own cumulative savings"
  ON "CumulativeSavings" FOR DELETE
  TO authenticated
  USING ("userId" = auth.uid()::text);