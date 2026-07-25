export type TransactionType = "income" | "expense";

type MonthString =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12";

export type YearMonth = `${number}-${MonthString}`;

export interface CategoryBase {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeCategory extends CategoryBase {
  type: "income";
}

export interface ExpenseCategory extends CategoryBase {
  type: "expense";
}

export type Category = IncomeCategory | ExpenseCategory;

export interface TransactionBase {
  id: string;
  amountMinor: number;
  operationDate: string;
  assignedMonth: YearMonth;
  categoryId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeTransaction extends TransactionBase {
  type: "income";
}

export interface ExpenseTransaction extends TransactionBase {
  type: "expense";
}

export type BudgetTransaction = IncomeTransaction | ExpenseTransaction;

export interface OpeningBalanceOverride {
  month: YearMonth;
  amountMinor: number;
  updatedAt: string;
}

export interface MonthlyCarryover {
  fromMonth: YearMonth;
  toMonth: YearMonth;
  amountMinor: number;
}

export interface MonthlyBudget {
  month: YearMonth;
  openingBalanceMinor: number;
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  monthlyResultMinor: number;
  closingBalanceMinor: number;
  carryover: MonthlyCarryover | null;
}

export interface AccountBalance {
  month: YearMonth;
  openingBalanceMinor: number;
  closingBalanceMinor: number;
  asOfDate: string;
}

export interface BudgetDataSeed {
  categories: Category[];
  transactions: BudgetTransaction[];
  openingBalanceOverrides: OpeningBalanceOverride[];
}

export interface NewTransactionInput {
  type: TransactionType;
  amountMinor: number;
  operationDate: string;
  assignedMonth?: YearMonth;
  categoryId: string;
  description?: string | null;
}

export interface UpdateTransactionInput {
  amountMinor?: number;
  operationDate?: string;
  assignedMonth?: YearMonth;
  categoryId?: string;
  description?: string | null;
}

export type TransactionSort =
  | "newest"
  | "oldest"
  | "amountAsc"
  | "amountDesc";

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  month?: YearMonth;
  dateFrom?: string;
  dateTo?: string;
  minAmountMinor?: number;
  maxAmountMinor?: number;
}

export interface NewCategoryInput {
  name: string;
  type: TransactionType;
  color?: string | null;
  icon?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string | null;
  icon?: string | null;
}
