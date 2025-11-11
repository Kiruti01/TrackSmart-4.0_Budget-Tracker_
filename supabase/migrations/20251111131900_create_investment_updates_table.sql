/*
  # Create investment_updates table

  1. New Tables
    - `investment_updates`
      - `id` (uuid, primary key)
      - `investment_id` (uuid, foreign key to investments)
      - `update_type` (text: 'value_update' or 'capital_addition')
      - `previous_amount` (numeric)
      - `new_amount` (numeric)
      - `previous_exchange_rate` (numeric)
      - `new_exchange_rate` (numeric)
      - `previous_value_kes` (numeric)
      - `new_value_kes` (numeric)
      - `additional_capital` (numeric, nullable)
      - `gain_loss_currency` (numeric)
      - `gain_loss_kes` (numeric)
      - `percentage_change_currency` (numeric)
      - `percentage_change_kes` (numeric)
      - `update_date` (date)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
*/

CREATE TABLE IF NOT EXISTS public.investment_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  update_type text NOT NULL,
  previous_amount numeric NOT NULL,
  new_amount numeric NOT NULL,
  previous_exchange_rate numeric NOT NULL,
  new_exchange_rate numeric NOT NULL,
  previous_value_kes numeric NOT NULL,
  new_value_kes numeric NOT NULL,
  additional_capital numeric,
  gain_loss_currency numeric NOT NULL,
  gain_loss_kes numeric NOT NULL,
  percentage_change_currency numeric NOT NULL,
  percentage_change_kes numeric NOT NULL,
  update_date date NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investment_updates_investment_id_idx ON public.investment_updates(investment_id);
CREATE INDEX IF NOT EXISTS investment_updates_update_date_idx ON public.investment_updates(update_date);