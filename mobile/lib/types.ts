export type TransactionType = "income" | "expense" | "savings" | "investment";
export type Timeframe = "month" | "year";
export type Period = { year: number; month: number };

export type UpdateType = "value_update" | "capital_addition";

export interface InvestmentCategory {
  id: string;
  userId: string | null;
  name: string;
  icon: string;
  isSystemDefault: boolean;
  createdAt: Date;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  categoryId: string;
  currency: string;
  initialAmount: number;
  initialExchangeRate: number;
  initialAmountKes: number;
  currentAmount: number;
  currentExchangeRate: number;
  currentValueKes: number;
  totalInvested: number;
  dateInvested: Date;
  lastUpdated: Date;
  notes: string | null;
  createdAt: Date;
  category?: InvestmentCategory;
}

export interface InvestmentUpdate {
  id: string;
  investmentId: string;
  updateType: UpdateType;
  previousAmount: number;
  newAmount: number;
  previousExchangeRate: number;
  newExchangeRate: number;
  previousValueKes: number;
  newValueKes: number;
  additionalCapital: number | null;
  gainLossCurrency: number;
  gainLossKes: number;
  percentageChangeCurrency: number;
  percentageChangeKes: number;
  updateDate: Date;
  notes: string | null;
  createdAt: Date;
}

export interface Category {
  createdAt: Date;
  name: string;
  userId: string;
  icon: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  description: string;
  date: Date;
  userId: string;
  type: TransactionType;
  category: string;
  categoryIcon: string;
  originalAmount: number;
  originalCurrency: string;
}

export interface UserSettings {
  userId: string;
  currency: string;
}
