import * as SQLite from "expo-sqlite";

import type { BudgetDataSeed, BudgetTransaction, Category, OpeningBalanceOverride } from "../types/budget";
import { budgetStore } from "./index";
import { sampleBudgetData } from "./sampleBudgetData";

const databasePromise = SQLite.openDatabaseAsync("homebudget.db");

type CategoryRow = Category;
type TransactionRow = BudgetTransaction;
type OpeningBalanceOverrideRow = OpeningBalanceOverride;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await databasePromise;

  await database.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      name TEXT NOT NULL,
      color TEXT,
      icon TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(type, name COLLATE NOCASE)
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
      operation_date TEXT NOT NULL,
      assigned_month TEXT NOT NULL,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS transactions_assigned_month_idx ON transactions(assigned_month);
    CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);
    CREATE TABLE IF NOT EXISTS opening_balance_overrides (
      month TEXT PRIMARY KEY NOT NULL,
      amount_minor INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return database;
}

function mapCategory(row: {
  id: string;
  type: Category["type"];
  name: string;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}): CategoryRow {
  return { id: row.id, type: row.type, name: row.name, color: row.color, icon: row.icon, createdAt: row.created_at, updatedAt: row.updated_at };
}

function mapTransaction(row: {
  id: string;
  type: BudgetTransaction["type"];
  amount_minor: number;
  operation_date: string;
  assigned_month: BudgetTransaction["assignedMonth"];
  category_id: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}): TransactionRow {
  return { id: row.id, type: row.type, amountMinor: row.amount_minor, operationDate: row.operation_date, assignedMonth: row.assigned_month, categoryId: row.category_id, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at };
}

function mapOpeningBalanceOverride(row: { month: OpeningBalanceOverride["month"]; amount_minor: number; updated_at: string }): OpeningBalanceOverrideRow {
  return { month: row.month, amountMinor: row.amount_minor, updatedAt: row.updated_at };
}

export async function hydrateBudgetStore(): Promise<void> {
  const database = await getDatabase();
  const categoryCount = await database.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM categories");

  if (!categoryCount || categoryCount.count === 0) {
    budgetStore.replaceData(sampleBudgetData);
    await persistBudgetStore();
    return;
  }

  const [categoryRows, transactionRows, overrideRows] = await Promise.all([
    database.getAllAsync<Parameters<typeof mapCategory>[0]>("SELECT id, type, name, color, icon, created_at, updated_at FROM categories ORDER BY name"),
    database.getAllAsync<Parameters<typeof mapTransaction>[0]>("SELECT id, type, amount_minor, operation_date, assigned_month, category_id, description, created_at, updated_at FROM transactions ORDER BY operation_date"),
    database.getAllAsync<Parameters<typeof mapOpeningBalanceOverride>[0]>("SELECT month, amount_minor, updated_at FROM opening_balance_overrides ORDER BY month"),
  ]);

  budgetStore.replaceData({
    categories: categoryRows.map(mapCategory),
    transactions: transactionRows.map(mapTransaction),
    openingBalanceOverrides: overrideRows.map(mapOpeningBalanceOverride),
  });
}

export async function persistBudgetStore(): Promise<void> {
  const database = await getDatabase();
  const categories = budgetStore.getCategories();
  const transactions = budgetStore.getTransactions({}, "oldest");
  const overrides = budgetStore.getOpeningBalanceOverrides();

  await database.withTransactionAsync(async () => {
    await database.execAsync("DELETE FROM opening_balance_overrides; DELETE FROM transactions; DELETE FROM categories;");

    for (const category of categories) {
      await database.runAsync("INSERT INTO categories (id, type, name, color, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", category.id, category.type, category.name, category.color, category.icon, category.createdAt, category.updatedAt);
    }

    for (const transaction of transactions) {
      await database.runAsync("INSERT INTO transactions (id, type, amount_minor, operation_date, assigned_month, category_id, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", transaction.id, transaction.type, transaction.amountMinor, transaction.operationDate, transaction.assignedMonth, transaction.categoryId, transaction.description, transaction.createdAt, transaction.updatedAt);
    }

    for (const override of overrides) {
      await database.runAsync("INSERT INTO opening_balance_overrides (month, amount_minor, updated_at) VALUES (?, ?, ?)", override.month, override.amountMinor, override.updatedAt);
    }
  });
}