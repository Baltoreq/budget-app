import type { BudgetTransaction, MonthlyBudget, MonthlyCarryover, OpeningBalanceOverride, YearMonth } from "../../types/budget";

function toMinorInt(value: number): number {
  if (!Number.isInteger(value)) {
    throw new Error("Kwota musi być liczbą całkowitą w mniejszych jednostkach.");
  }

  return value;
}

export function deriveMonthFromDate(date: string): YearMonth {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    throw new Error("Nieprawidłowy format daty. Oczekiwano YYYY-MM-DD.");
  }

  return `${match[1]}-${match[2]}` as YearMonth;
}

export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  return a.localeCompare(b);
}

export function nextMonth(month: YearMonth): YearMonth {
  const [yearRaw, monthRaw] = month.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw);

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 1 || monthIndex > 12) {
    throw new Error("Nieprawidłowy miesiąc. Oczekiwano YYYY-MM.");
  }

  const nextYear = monthIndex === 12 ? year + 1 : year;
  const nextMonthIndex = monthIndex === 12 ? 1 : monthIndex + 1;

  return `${nextYear}-${String(nextMonthIndex).padStart(2, "0")}` as YearMonth;
}

export function enumerateMonthRange(start: YearMonth, end: YearMonth): YearMonth[] {
  if (compareYearMonth(start, end) > 0) {
    return [];
  }

  const months: YearMonth[] = [];
  let cursor = start;

  while (compareYearMonth(cursor, end) <= 0) {
    months.push(cursor);
    cursor = nextMonth(cursor);
  }

  return months;
}

function indexOverrides(overrides: OpeningBalanceOverride[]): Map<YearMonth, number> {
  const indexed = new Map<YearMonth, number>();

  for (const override of overrides) {
    indexed.set(override.month, toMinorInt(override.amountMinor));
  }

  return indexed;
}

function indexMonthlyTotals(transactions: BudgetTransaction[]): Map<YearMonth, { income: number; expense: number }> {
  const totals = new Map<YearMonth, { income: number; expense: number }>();

  for (const tx of transactions) {
    const current = totals.get(tx.assignedMonth) ?? { income: 0, expense: 0 };
    const amountMinor = toMinorInt(tx.amountMinor);

    if (tx.type === "income") {
      current.income += amountMinor;
    } else {
      current.expense += amountMinor;
    }

    totals.set(tx.assignedMonth, current);
  }

  return totals;
}

export function calculateMonthlyBudgets(params: {
  months: YearMonth[];
  transactions: BudgetTransaction[];
  openingBalanceOverrides: OpeningBalanceOverride[];
}): MonthlyBudget[] {
  const sortedMonths = [...params.months].sort(compareYearMonth);
  const totalsByMonth = indexMonthlyTotals(params.transactions);
  const overridesByMonth = indexOverrides(params.openingBalanceOverrides);
  const budgets: MonthlyBudget[] = [];

  for (let index = 0; index < sortedMonths.length; index += 1) {
    const month = sortedMonths[index];
    const monthlyTotals = totalsByMonth.get(month) ?? { income: 0, expense: 0 };
    const previous = budgets[index - 1];

    const openingBalanceMinor = overridesByMonth.has(month)
      ? (overridesByMonth.get(month) as number)
      : previous
        ? previous.closingBalanceMinor
        : 0;

    const monthlyResultMinor = monthlyTotals.income - monthlyTotals.expense;
    const closingBalanceMinor = openingBalanceMinor + monthlyResultMinor;

    const carryover: MonthlyCarryover | null = index < sortedMonths.length - 1
      ? {
          fromMonth: month,
          toMonth: sortedMonths[index + 1],
          amountMinor: closingBalanceMinor,
        }
      : null;

    budgets.push({
      month,
      openingBalanceMinor,
      totalIncomeMinor: monthlyTotals.income,
      totalExpenseMinor: monthlyTotals.expense,
      monthlyResultMinor,
      closingBalanceMinor,
      carryover,
    });
  }

  return budgets;
}
