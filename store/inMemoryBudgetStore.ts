import {
  calculateMonthlyBudgets,
  compareYearMonth,
  deriveMonthFromDate,
  enumerateMonthRange,
} from "../domain/calculations/monthlyBudget";
import { AppError } from "../lib/appErrors";
import type {
  AccountBalance,
  BudgetDataSeed,
  BudgetTransaction,
  Category,
  NewCategoryInput,
  NewTransactionInput,
  OpeningBalanceOverride,
  TransactionFilters,
  TransactionSort,
  UpdateCategoryInput,
  UpdateTransactionInput,
  YearMonth,
} from "../types/budget";

function nowIso(): string {
  return new Date().toISOString();
}

function assertMinorAmount(amountMinor: number): void {
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new AppError("amount-minor-positive");
  }
}

function assertDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError("date-format-invalid");
  }

  const [yearPart, monthPart, dayPart] = value.split("-");
  const year = Number.parseInt(yearPart, 10);
  const month = Number.parseInt(monthPart, 10);
  const day = Number.parseInt(dayPart, 10);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    throw new AppError("date-invalid");
  }
}

function assertMonth(value: string): void {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw new AppError("month-format-invalid");
  }

  const [yearPart, monthPart] = value.split("-");
  const year = Number.parseInt(yearPart, 10);
  const month = Number.parseInt(monthPart, 10);
  const parsed = new Date(Date.UTC(year, month - 1, 1));

  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() + 1 !== month) {
    throw new AppError("month-invalid");
  }
}

function sanitizeCategoryName(name: string): string {
  return name.trim();
}

const MAX_CATEGORY_NAME_LENGTH = 50;

function assertCategoryNameLength(name: string): void {
  if (name.length > MAX_CATEGORY_NAME_LENGTH) {
    throw new AppError("category-name-too-long");
  }
}

function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${random}`;
}

function cloneCategory(category: Category): Category {
  return { ...category };
}

function cloneTransaction(transaction: BudgetTransaction): BudgetTransaction {
  return { ...transaction };
}

function cloneOpeningBalanceOverride(override: OpeningBalanceOverride): OpeningBalanceOverride {
  return { ...override };
}

export class InMemoryBudgetStore {
  private categories: Category[];

  private transactions: BudgetTransaction[];

  private openingBalanceOverrides: OpeningBalanceOverride[];

  constructor(seed: BudgetDataSeed) {
    this.categories = seed.categories.map(cloneCategory);
    this.transactions = seed.transactions.map(cloneTransaction);
    this.openingBalanceOverrides = seed.openingBalanceOverrides.map(cloneOpeningBalanceOverride);
  }

  replaceData(data: BudgetDataSeed): void {
    this.categories = data.categories.map(cloneCategory);
    this.transactions = data.transactions.map(cloneTransaction);
    this.openingBalanceOverrides = data.openingBalanceOverrides.map(cloneOpeningBalanceOverride);
  }

  getCategories(type?: Category["type"]): Category[] {
    const selected = type ? this.categories.filter((category) => category.type === type) : this.categories;
    return selected.map(cloneCategory);
  }

  addCategory(input: NewCategoryInput): Category {
    const name = sanitizeCategoryName(input.name);

    if (!name) {
      throw new AppError("category-name-required");
    }

    assertCategoryNameLength(name);

    const duplicateExists = this.categories.some(
      (category) => category.type === input.type && category.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicateExists) {
      throw new AppError("category-name-duplicate");
    }

    const category: Category = {
      id: createId("cat"),
      type: input.type,
      name,
      color: input.color ?? null,
      icon: input.icon ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    this.categories.push(category);
    return cloneCategory(category);
  }

  updateCategory(categoryId: string, input: UpdateCategoryInput): Category {
    const index = this.categories.findIndex((category) => category.id === categoryId);

    if (index < 0) {
      throw new AppError("category-not-found");
    }

    const existing = this.categories[index];
    const nextName = input.name === undefined ? existing.name : sanitizeCategoryName(input.name);

    if (!nextName) {
      throw new AppError("category-name-required");
    }

    assertCategoryNameLength(nextName);

    const duplicateExists = this.categories.some(
      (category) =>
        category.id !== categoryId &&
        category.type === existing.type &&
        category.name.toLowerCase() === nextName.toLowerCase(),
    );

    if (duplicateExists) {
      throw new AppError("category-name-duplicate");
    }

    const updated: Category = {
      ...existing,
      name: nextName,
      color: input.color === undefined ? existing.color : input.color,
      icon: input.icon === undefined ? existing.icon : input.icon,
      updatedAt: nowIso(),
    };

    this.categories[index] = updated;
    return cloneCategory(updated);
  }

  deleteCategory(categoryId: string): void {
    const usedByTransaction = this.transactions.some((tx) => tx.categoryId === categoryId);

    if (usedByTransaction) {
      throw new AppError("category-in-use");
    }

    this.categories = this.categories.filter((category) => category.id !== categoryId);
  }

  getTransactions(filters: TransactionFilters = {}, sort: TransactionSort = "newest"): BudgetTransaction[] {
    const filtered = this.transactions.filter((tx) => {
      if (filters.type && tx.type !== filters.type) {
        return false;
      }

      if (filters.categoryId && tx.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters.month && tx.assignedMonth !== filters.month) {
        return false;
      }

      if (filters.dateFrom && tx.operationDate < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && tx.operationDate > filters.dateTo) {
        return false;
      }

      if (filters.minAmountMinor !== undefined && tx.amountMinor < filters.minAmountMinor) {
        return false;
      }

      if (filters.maxAmountMinor !== undefined && tx.amountMinor > filters.maxAmountMinor) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "newest") {
        return b.operationDate.localeCompare(a.operationDate);
      }

      if (sort === "oldest") {
        return a.operationDate.localeCompare(b.operationDate);
      }

      if (sort === "amountAsc") {
        return a.amountMinor - b.amountMinor;
      }

      return b.amountMinor - a.amountMinor;
    });

    return sorted.map(cloneTransaction);
  }

  addTransaction(input: NewTransactionInput): BudgetTransaction {
    assertMinorAmount(input.amountMinor);
    assertDate(input.operationDate);

    const assignedMonth = input.assignedMonth ?? deriveMonthFromDate(input.operationDate);
    assertMonth(assignedMonth);
    const category = this.categories.find((item) => item.id === input.categoryId);

    if (!category) {
      throw new AppError("category-missing");
    }

    if (category.type !== input.type) {
      throw new AppError("transaction-type-mismatch");
    }

    const createdAt = nowIso();
    const tx: BudgetTransaction = {
      id: createId("tx"),
      type: input.type,
      amountMinor: input.amountMinor,
      operationDate: input.operationDate,
      assignedMonth,
      categoryId: input.categoryId,
      description: input.description?.trim() || null,
      createdAt,
      updatedAt: createdAt,
    };

    this.transactions.push(tx);
    return cloneTransaction(tx);
  }

  updateTransaction(transactionId: string, input: UpdateTransactionInput): BudgetTransaction {
    const index = this.transactions.findIndex((tx) => tx.id === transactionId);

    if (index < 0) {
      throw new AppError("transaction-not-found");
    }

    const existing = this.transactions[index];

    const operationDate = input.operationDate ?? existing.operationDate;
    assertDate(operationDate);

    const amountMinor = input.amountMinor ?? existing.amountMinor;
    assertMinorAmount(amountMinor);

    const assignedMonth =
      input.assignedMonth ?? (input.operationDate !== undefined ? deriveMonthFromDate(operationDate) : existing.assignedMonth);
    assertMonth(assignedMonth);
    const categoryId = input.categoryId ?? existing.categoryId;

    const category = this.categories.find((item) => item.id === categoryId);

    if (!category) {
      throw new AppError("category-missing");
    }

    if (category.type !== existing.type) {
      throw new AppError("transaction-type-mismatch");
    }

    const updated: BudgetTransaction = {
      ...existing,
      amountMinor,
      operationDate,
      assignedMonth,
      categoryId,
      description: input.description === undefined ? existing.description : input.description?.trim() || null,
      updatedAt: nowIso(),
    };

    this.transactions[index] = updated;
    return cloneTransaction(updated);
  }

  deleteTransaction(transactionId: string): void {
    this.transactions = this.transactions.filter((tx) => tx.id !== transactionId);
  }

  setOpeningBalanceOverride(month: YearMonth, amountMinor: number): void {
    if (!Number.isInteger(amountMinor)) {
      throw new AppError("opening-balance-integer");
    }

    assertMonth(month);

    const existingIndex = this.openingBalanceOverrides.findIndex((item) => item.month === month);
    const nextValue: OpeningBalanceOverride = {
      month,
      amountMinor,
      updatedAt: nowIso(),
    };

    if (existingIndex < 0) {
      this.openingBalanceOverrides.push(nextValue);
      return;
    }

    this.openingBalanceOverrides[existingIndex] = nextValue;
  }

  getOpeningBalanceOverrides(): OpeningBalanceOverride[] {
    return this.openingBalanceOverrides.map(cloneOpeningBalanceOverride);
  }

  getMonthlyBudgets(): ReturnType<typeof calculateMonthlyBudgets> {
    const monthsFromTransactions = this.transactions.map((tx) => tx.assignedMonth);
    const monthsFromOverrides = this.openingBalanceOverrides.map((item) => item.month);
    const months = [...new Set([...monthsFromTransactions, ...monthsFromOverrides])].sort(compareYearMonth);

    if (months.length === 0) {
      return [];
    }

    const coveredMonths = enumerateMonthRange(months[0], months[months.length - 1]);

    return calculateMonthlyBudgets({
      months: coveredMonths,
      transactions: this.transactions,
      openingBalanceOverrides: this.openingBalanceOverrides,
    });
  }

  getAccountBalance(month?: YearMonth): AccountBalance | null {
    const budgets = this.getMonthlyBudgets();

    if (budgets.length === 0) {
      return null;
    }

    const resolved = month
      ? budgets.find((item) => item.month === month)
      : budgets[budgets.length - 1];

    if (!resolved) {
      return null;
    }

    return {
      month: resolved.month,
      openingBalanceMinor: resolved.openingBalanceMinor,
      closingBalanceMinor: resolved.closingBalanceMinor,
      asOfDate: nowIso(),
    };
  }
}
