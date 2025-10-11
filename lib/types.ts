export type TransactionType = "income" | "expense" | "savings";
export type Timeframe = "month" | "year";
export type Period = { year: number; month: number };

export type UpdateType = "value_update" | "capital_addition";

export interface InvestmentCategory {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  is_system_default: boolean;
  created_at: Date;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  category_id: string;
  currency: string;
  initial_amount: number;
  initial_exchange_rate: number;
  initial_amount_kes: number;
  current_amount: number;
  current_exchange_rate: number;
  current_value_kes: number;
  total_invested: number;
  date_invested: Date;
  last_updated: Date;
  notes: string | null;
  created_at: Date;
  category?: InvestmentCategory;
}

export interface InvestmentUpdate {
  id: string;
  investment_id: string;
  update_type: UpdateType;
  previous_amount: number;
  new_amount: number;
  previous_exchange_rate: number;
  new_exchange_rate: number;
  previous_value_kes: number;
  new_value_kes: number;
  additional_capital: number | null;
  gain_loss_currency: number;
  gain_loss_kes: number;
  percentage_change_currency: number;
  percentage_change_kes: number;
  update_date: Date;
  notes: string | null;
  created_at: Date;
}
