/*
  # Create Investments System

  ## Overview
  This migration creates a complete investment tracking system separate from expenses.
  Investments support multiple currencies with exchange rate tracking and historical updates.

  ## New Tables
  
  ### `investment_categories`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, nullable) - User who created custom category, null for system defaults
  - `name` (text) - Category name (e.g., "Forex", "Cryptocurrency")
  - `icon` (text) - Emoji or icon code for display
  - `is_system_default` (boolean) - Whether this is a system-provided category
  - `created_at` (timestamptz) - Creation timestamp

  ### `investments`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - User who owns this investment
  - `name` (text) - Investment name (e.g., "FX Trading Account")
  - `category_id` (uuid) - Foreign key to investment_categories
  - `currency` (text) - Currency code (KES, USD, EUR, BTC, etc.)
  - `initial_amount` (decimal) - Original investment amount in currency
  - `initial_exchange_rate` (decimal) - Exchange rate to KES at start
  - `initial_amount_kes` (decimal) - Calculated value in KES
  - `current_amount` (decimal) - Current value in original currency
  - `current_exchange_rate` (decimal) - Current exchange rate to KES
  - `current_value_kes` (decimal) - Current value in KES
  - `total_invested` (decimal) - Total capital invested (tracks additions)
  - `date_invested` (date) - Date of initial investment
  - `last_updated` (timestamptz) - Last update timestamp
  - `notes` (text, nullable) - Optional notes
  - `created_at` (timestamptz) - Creation timestamp

  ### `investment_updates`
  - `id` (uuid, primary key) - Unique identifier
  - `investment_id` (uuid) - Foreign key to investments
  - `update_type` (text) - Type: 'value_update' or 'capital_addition'
  - `previous_amount` (decimal) - Previous amount in original currency
  - `new_amount` (decimal) - New amount in original currency
  - `previous_exchange_rate` (decimal) - Previous exchange rate
  - `new_exchange_rate` (decimal) - New exchange rate
  - `previous_value_kes` (decimal) - Previous KES value
  - `new_value_kes` (decimal) - New KES value
  - `additional_capital` (decimal, nullable) - Capital added (if applicable)
  - `gain_loss_currency` (decimal) - Gain/loss in original currency
  - `gain_loss_kes` (decimal) - Gain/loss in KES
  - `percentage_change_currency` (decimal) - Percentage change in currency
  - `percentage_change_kes` (decimal) - Percentage change in KES
  - `update_date` (date) - Date of update
  - `notes` (text, nullable) - Optional notes
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all investment tables
  - Users can only view/modify their own investments
  - System default categories are visible to all users
  
  ## Important Notes
  1. Exchange rates are stored as "KES per unit" (e.g., 132.00 KES/USD)
  2. For KES investments, exchange_rate = 1.00
  3. All KES values are calculated: amount × exchange_rate
  4. Investment updates create historical records for analytics
*/

-- Create investment_categories table
CREATE TABLE IF NOT EXISTS investment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '📝',
  is_system_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES investment_categories(id) ON DELETE RESTRICT,
  currency text NOT NULL DEFAULT 'KES',
  initial_amount decimal(19,4) NOT NULL,
  initial_exchange_rate decimal(19,4) NOT NULL DEFAULT 1.00,
  initial_amount_kes decimal(19,4) NOT NULL,
  current_amount decimal(19,4) NOT NULL,
  current_exchange_rate decimal(19,4) NOT NULL DEFAULT 1.00,
  current_value_kes decimal(19,4) NOT NULL,
  total_invested decimal(19,4) NOT NULL,
  date_invested date NOT NULL,
  last_updated timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create investment_updates table
CREATE TABLE IF NOT EXISTS investment_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  update_type text NOT NULL CHECK (update_type IN ('value_update', 'capital_addition')),
  previous_amount decimal(19,4) NOT NULL,
  new_amount decimal(19,4) NOT NULL,
  previous_exchange_rate decimal(19,4) NOT NULL,
  new_exchange_rate decimal(19,4) NOT NULL,
  previous_value_kes decimal(19,4) NOT NULL,
  new_value_kes decimal(19,4) NOT NULL,
  additional_capital decimal(19,4),
  gain_loss_currency decimal(19,4) NOT NULL,
  gain_loss_kes decimal(19,4) NOT NULL,
  percentage_change_currency decimal(19,4) NOT NULL,
  percentage_change_kes decimal(19,4) NOT NULL,
  update_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_category_id ON investments(category_id);
CREATE INDEX IF NOT EXISTS idx_investments_date_invested ON investments(date_invested);
CREATE INDEX IF NOT EXISTS idx_investment_updates_investment_id ON investment_updates(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_updates_update_date ON investment_updates(update_date);
CREATE INDEX IF NOT EXISTS idx_investment_categories_user_id ON investment_categories(user_id);

-- Enable Row Level Security
ALTER TABLE investment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investment_categories
CREATE POLICY "Users can view system default categories"
  ON investment_categories FOR SELECT
  TO authenticated
  USING (is_system_default = true);

CREATE POLICY "Users can view own custom categories"
  ON investment_categories FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own categories"
  ON investment_categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
  ON investment_categories FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own categories"
  ON investment_categories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for investments
CREATE POLICY "Users can view own investments"
  ON investments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own investments"
  ON investments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own investments"
  ON investments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own investments"
  ON investments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for investment_updates
CREATE POLICY "Users can view own investment updates"
  ON investment_updates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investments
      WHERE investments.id = investment_updates.investment_id
      AND investments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create investment updates"
  ON investment_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investments
      WHERE investments.id = investment_updates.investment_id
      AND investments.user_id = auth.uid()
    )
  );

-- Insert system default investment categories
INSERT INTO investment_categories (name, icon, is_system_default, user_id) VALUES
  ('Forex', '💱', true, NULL),
  ('Cryptocurrency', '₿', true, NULL),
  ('Money Market Fund (MMF)', '🏦', true, NULL),
  ('Stocks/ETFs', '📈', true, NULL),
  ('Treasury Bills/Bonds', '🏛️', true, NULL),
  ('Business Investment', '🏢', true, NULL),
  ('Real Estate', '🏠', true, NULL),
  ('Agriculture/Farming', '🌾', true, NULL),
  ('P2P Lending', '🤝', true, NULL),
  ('Custom', '📝', true, NULL)
ON CONFLICT DO NOTHING;