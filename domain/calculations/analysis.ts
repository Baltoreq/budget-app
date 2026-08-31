import { compareYearMonth } from "./monthlyBudget";
import type { BudgetTransaction, Category, MonthlyBudget, YearMonth } from "../../types/budget";

export type AnalysisInsightTone = "positive" | "neutral" | "warning";

export type AnalysisInsightKind =
  | "expenseIncrease"
  | "incomeIncrease"
  | "topCategoryShare"
  | "healthyBalance"
  | "budgetPressure";

export interface AnalysisSummaryDelta {
  amountMinor: number | null;
  percentChange: number | null;
  favorable: boolean;
}

export interface AnalysisCategoryBreakdownItem {
  categoryId: string;
  name: string;
  color: string;
  amountMinor: number;
  sharePercent: number;
}

export interface AnalysisTrendPoint {
  month: YearMonth;
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  monthlyResultMinor: number;
}

export interface AnalysisForecast {
  spentIncomePercent: number;
  projectedExpenseMinor: number;
  projectedBalanceMinor: number;
  safeDailyBudgetMinor: number;
  daysElapsed: number;
  daysInMonth: number;
  daysRemaining: number;
  isCurrentMonth: boolean;
  isClosedMonth: boolean;
}

export interface AnalysisStatisticMostExpensiveDay {
  date: string;
  amountMinor: number;
}

export interface AnalysisStatistics {
  mostExpensiveDay: AnalysisStatisticMostExpensiveDay | null;
  noSpendDays: number;
  averageExpenseMinor: number;
  operationCount: number;
  expenseCount: number;
  incomeCount: number;
}

export interface AnalysisInsight {
  id: string;
  kind: AnalysisInsightKind;
  tone: AnalysisInsightTone;
  score: number;
  previousMonth: YearMonth | null;
  categoryName?: string;
  amountMinor?: number;
  percentValue?: number;
  sharePercent?: number;
  projectedBalanceMinor?: number;
  safeDailyBudgetMinor?: number;
}

export interface MonthAnalysis {
  selectedMonth: YearMonth;
  previousMonth: YearMonth | null;
  summary: MonthlyBudget;
  incomeDelta: AnalysisSummaryDelta;
  expenseDelta: AnalysisSummaryDelta;
  balanceDelta: AnalysisSummaryDelta;
  forecast: AnalysisForecast;
  categoryBreakdown: AnalysisCategoryBreakdownItem[];
  trends: AnalysisTrendPoint[];
  statistics: AnalysisStatistics;
  insights: AnalysisInsight[];
}

function getDaysInMonth(month: YearMonth): number {
  const [yearRaw, monthRaw] = month.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw);

  return new Date(year, monthIndex, 0).getDate();
}

function getTodayMonth(todayDate: string): YearMonth {
  return todayDate.slice(0, 7) as YearMonth;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(999, value));
}

function roundPercent(value: number): number {
  return Math.round(value);
}

function calculateDelta(currentValue: number, previousValue: number | null, favorableDirection: "up" | "down"): AnalysisSummaryDelta {
  if (previousValue === null) {
    return {
      amountMinor: null,
      percentChange: null,
      favorable: false,
    };
  }

  const amountMinor = currentValue - previousValue;
  const percentChange = previousValue === 0
    ? null
    : roundPercent((amountMinor / previousValue) * 100);

  return {
    amountMinor,
    percentChange,
    favorable: favorableDirection === "up" ? amountMinor >= 0 : amountMinor <= 0,
  };
}

function withRoundedSharePercent(entries: Array<{ amountMinor: number }>, totalAmountMinor: number): number[] {
  if (entries.length === 0 || totalAmountMinor <= 0) {
    return entries.map(() => 0);
  }

  const shares = entries.map((entry, index) => {
    const exactPercent = (entry.amountMinor / totalAmountMinor) * 100;
    const flooredPercent = Math.floor(exactPercent);

    return {
      index,
      exactPercent,
      flooredPercent,
      fractionalPart: exactPercent - flooredPercent,
    };
  });

  const baseSum = shares.reduce((sum, item) => sum + item.flooredPercent, 0);
  let pointsToDistribute = Math.max(0, Math.min(100 - baseSum, entries.length));

  const ranking = [...shares].sort((a, b) => {
    if (b.fractionalPart !== a.fractionalPart) {
      return b.fractionalPart - a.fractionalPart;
    }

    if (b.exactPercent !== a.exactPercent) {
      return b.exactPercent - a.exactPercent;
    }

    return a.index - b.index;
  });

  const bonusByIndex = new Map<number, number>();
  for (const item of ranking) {
    if (pointsToDistribute <= 0) {
      break;
    }

    bonusByIndex.set(item.index, 1);
    pointsToDistribute -= 1;
  }

  return entries.map((_, index) => shares[index].flooredPercent + (bonusByIndex.get(index) ?? 0));
}

function buildCategoryBreakdown(monthTransactions: BudgetTransaction[], categoriesById: Map<string, Category>, totalExpenseMinor: number): AnalysisCategoryBreakdownItem[] {
  const totals = new Map<string, number>();

  for (const transaction of monthTransactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    totals.set(transaction.categoryId, (totals.get(transaction.categoryId) ?? 0) + transaction.amountMinor);
  }

  const sorted = [...totals.entries()]
    .map(([categoryId, amountMinor]) => {
      const category = categoriesById.get(categoryId);

      return {
        categoryId,
        amountMinor,
        name: category?.name ?? "Inne",
        color: category?.color ?? "#94A3B8",
      };
    })
    .sort((a, b) => b.amountMinor - a.amountMinor);

  const roundedShares = withRoundedSharePercent(sorted, totalExpenseMinor);

  return sorted.map((entry, index) => ({
    ...entry,
    sharePercent: roundedShares[index] ?? 0,
  }));
}

function buildStatistics(monthTransactions: BudgetTransaction[], selectedMonth: YearMonth): AnalysisStatistics {
  const daysInMonth = getDaysInMonth(selectedMonth);
  const expenseTransactions = monthTransactions.filter((transaction) => transaction.type === "expense");
  const expenseDates = new Set(expenseTransactions.map((transaction) => transaction.operationDate));
  const expenseByDay = new Map<string, number>();

  for (const transaction of expenseTransactions) {
    expenseByDay.set(transaction.operationDate, (expenseByDay.get(transaction.operationDate) ?? 0) + transaction.amountMinor);
  }

  const mostExpensiveDayEntry = [...expenseByDay.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  const totalExpenseMinor = expenseTransactions.reduce((sum, transaction) => sum + transaction.amountMinor, 0);

  return {
    mostExpensiveDay: mostExpensiveDayEntry
      ? {
          date: mostExpensiveDayEntry[0],
          amountMinor: mostExpensiveDayEntry[1],
        }
      : null,
    noSpendDays: Math.max(0, daysInMonth - expenseDates.size),
    averageExpenseMinor: expenseTransactions.length > 0 ? Math.round(totalExpenseMinor / expenseTransactions.length) : 0,
    operationCount: monthTransactions.length,
    expenseCount: expenseTransactions.length,
    incomeCount: monthTransactions.length - expenseTransactions.length,
  };
}

function buildForecast(selectedMonth: YearMonth, monthTransactions: BudgetTransaction[], summary: MonthlyBudget, todayDate: string): AnalysisForecast {
  const daysInMonth = getDaysInMonth(selectedMonth);
  const todayMonth = getTodayMonth(todayDate);
  const isCurrentMonth = selectedMonth === todayMonth;
  const isClosedMonth = compareYearMonth(selectedMonth, todayMonth) < 0;
  const dayValue = isCurrentMonth ? Number(todayDate.slice(8, 10)) : daysInMonth;
  const daysElapsed = Math.max(0, Math.min(dayValue, daysInMonth));
  const daysRemaining = Math.max(0, daysInMonth - daysElapsed);
  const referenceDate = `${selectedMonth}-${String(daysElapsed).padStart(2, "0")}`;

  const expenseToDateMinor = monthTransactions.reduce((sum, transaction) => {
    if (transaction.type !== "expense") {
      return sum;
    }

    if (transaction.operationDate > referenceDate) {
      return sum;
    }

    return sum + transaction.amountMinor;
  }, 0);

  const projectedExpenseMinor = isCurrentMonth && daysElapsed > 0
    ? Math.round((expenseToDateMinor / daysElapsed) * daysInMonth)
    : summary.totalExpenseMinor;

  const projectedBalanceMinor = summary.totalIncomeMinor - projectedExpenseMinor;
  const safeDailyBudgetMinor = daysRemaining > 0
    ? Math.max(0, Math.floor(projectedBalanceMinor / daysRemaining))
    : 0;
  const spentIncomePercent = summary.totalIncomeMinor > 0
    ? clampPercent(roundPercent((summary.totalExpenseMinor / summary.totalIncomeMinor) * 100))
    : 0;

  return {
    spentIncomePercent,
    projectedExpenseMinor,
    projectedBalanceMinor,
    safeDailyBudgetMinor,
    daysElapsed,
    daysInMonth,
    daysRemaining,
    isCurrentMonth,
    isClosedMonth,
  };
}

function selectTopInsights(insights: AnalysisInsight[]): AnalysisInsight[] {
  const sorted = [...insights].sort((a, b) => b.score - a.score);
  const byTone = {
    warning: sorted.filter((insight) => insight.tone === "warning"),
    neutral: sorted.filter((insight) => insight.tone === "neutral"),
    positive: sorted.filter((insight) => insight.tone === "positive"),
  };

  const selected: AnalysisInsight[] = [];

  for (const tone of ["warning", "neutral", "positive"] as const) {
    const first = byTone[tone][0];
    if (first) {
      selected.push(first);
    }
  }

  for (const insight of sorted) {
    if (selected.some((item) => item.id === insight.id)) {
      continue;
    }

    if (selected.length >= 5) {
      break;
    }

    selected.push(insight);
  }

  return selected;
}

function buildInsights(params: {
  selectedMonth: YearMonth;
  summary: MonthlyBudget;
  previousSummary: MonthlyBudget | null;
  forecast: AnalysisForecast;
  categoryBreakdown: AnalysisCategoryBreakdownItem[];
}): AnalysisInsight[] {
  const { selectedMonth, summary, previousSummary, forecast, categoryBreakdown } = params;
  const insights: AnalysisInsight[] = [];

  if (previousSummary) {
    const expenseDeltaMinor = summary.totalExpenseMinor - previousSummary.totalExpenseMinor;
    const expenseDeltaPercent = previousSummary.totalExpenseMinor > 0
      ? roundPercent((expenseDeltaMinor / previousSummary.totalExpenseMinor) * 100)
      : null;

    if (expenseDeltaMinor > 20000 && (expenseDeltaPercent ?? 0) >= 4) {
      insights.push({
        id: `${selectedMonth}-expenseIncrease`,
        kind: "expenseIncrease",
        tone: "warning",
        score: 85 + (expenseDeltaPercent ?? 0),
        previousMonth: previousSummary.month,
        amountMinor: expenseDeltaMinor,
        percentValue: expenseDeltaPercent ?? undefined,
      });
    }

    const incomeDeltaMinor = summary.totalIncomeMinor - previousSummary.totalIncomeMinor;
    const incomeDeltaPercent = previousSummary.totalIncomeMinor > 0
      ? roundPercent((incomeDeltaMinor / previousSummary.totalIncomeMinor) * 100)
      : null;

    if (incomeDeltaMinor > 0) {
      insights.push({
        id: `${selectedMonth}-incomeIncrease`,
        kind: "incomeIncrease",
        tone: "positive",
        score: 54 + (incomeDeltaPercent ?? 0),
        previousMonth: previousSummary.month,
        amountMinor: incomeDeltaMinor,
        percentValue: incomeDeltaPercent ?? undefined,
      });
    }
  }

  const topCategory = categoryBreakdown[0] ?? null;
  if (topCategory && topCategory.sharePercent >= 25) {
    insights.push({
      id: `${selectedMonth}-topCategoryShare`,
      kind: "topCategoryShare",
      tone: topCategory.sharePercent >= 45 ? "warning" : "neutral",
      score: 60 + topCategory.sharePercent,
      previousMonth: null,
      categoryName: topCategory.name,
      amountMinor: topCategory.amountMinor,
      sharePercent: topCategory.sharePercent,
    });
  }

  if (summary.totalIncomeMinor > 0 && summary.monthlyResultMinor > 0) {
    const savingsRatePercent = roundPercent((summary.monthlyResultMinor / summary.totalIncomeMinor) * 100);

    if (savingsRatePercent >= 20) {
      insights.push({
        id: `${selectedMonth}-healthyBalance`,
        kind: "healthyBalance",
        tone: "positive",
        score: 72 + savingsRatePercent,
        previousMonth: null,
        amountMinor: summary.monthlyResultMinor,
        percentValue: savingsRatePercent,
      });
    }
  }

  if (forecast.daysRemaining > 0 && (forecast.projectedBalanceMinor < 0 || forecast.safeDailyBudgetMinor < 2500)) {
    insights.push({
      id: `${selectedMonth}-budgetPressure`,
      kind: "budgetPressure",
      tone: "warning",
      score: forecast.projectedBalanceMinor < 0 ? 120 : 88,
      previousMonth: null,
      projectedBalanceMinor: forecast.projectedBalanceMinor,
      safeDailyBudgetMinor: forecast.safeDailyBudgetMinor,
    });
  }

  return selectTopInsights(insights);
}

export function buildMonthAnalysis(params: {
  selectedMonth: YearMonth;
  budgets: MonthlyBudget[];
  transactions: BudgetTransaction[];
  categories: Category[];
  todayDate: string;
}): MonthAnalysis | null {
  const budgetsByMonth = new Map(params.budgets.map((budget) => [budget.month, budget]));
  const summary = budgetsByMonth.get(params.selectedMonth) ?? null;

  if (!summary) {
    return null;
  }

  const sortedMonths = params.budgets.map((budget) => budget.month).sort(compareYearMonth);
  const selectedIndex = sortedMonths.findIndex((month) => month === params.selectedMonth);
  const previousMonth = selectedIndex > 0 ? sortedMonths[selectedIndex - 1] : null;
  const previousSummary = previousMonth ? budgetsByMonth.get(previousMonth) ?? null : null;
  const monthTransactions = params.transactions.filter((transaction) => transaction.assignedMonth === params.selectedMonth);
  const categoriesById = new Map(params.categories.map((category) => [category.id, category]));
  const categoryBreakdown = buildCategoryBreakdown(monthTransactions, categoriesById, summary.totalExpenseMinor);
  const forecast = buildForecast(params.selectedMonth, monthTransactions, summary, params.todayDate);
  const statistics = buildStatistics(monthTransactions, params.selectedMonth);
  const trends = params.budgets
    .slice(Math.max(0, selectedIndex - 5), selectedIndex + 1)
    .map((budget) => ({
      month: budget.month,
      totalIncomeMinor: budget.totalIncomeMinor,
      totalExpenseMinor: budget.totalExpenseMinor,
      monthlyResultMinor: budget.monthlyResultMinor,
    }));

  return {
    selectedMonth: params.selectedMonth,
    previousMonth,
    summary,
    incomeDelta: calculateDelta(summary.totalIncomeMinor, previousSummary?.totalIncomeMinor ?? null, "up"),
    expenseDelta: calculateDelta(summary.totalExpenseMinor, previousSummary?.totalExpenseMinor ?? null, "down"),
    balanceDelta: calculateDelta(summary.monthlyResultMinor, previousSummary?.monthlyResultMinor ?? null, "up"),
    forecast,
    categoryBreakdown,
    trends,
    statistics,
    insights: buildInsights({
      selectedMonth: params.selectedMonth,
      summary,
      previousSummary,
      forecast,
      categoryBreakdown,
    }),
  };
}