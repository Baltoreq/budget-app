import { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File } from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { Animated, Image, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar as RNStatusBar, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { budgetStore } from './store';
import { fontFamilies, radii, themeColors } from './theme';

const onboardingHero = require('./assets/onboarding-bg.png');
const logoMark = require('./assets/logo.png');
const incomeIcon = require('./assets/money-increase.png');
const expenseIcon = require('./assets/decline_chart.png');
const analyticsIcon = require('./assets/analytics_report.png');
const calendarIcon = require('./assets/calendar.png');
const backArrowIcon = require('./assets/back-arrow.png');
const addIcon = require('./assets/add.png');
const openingBalanceMetricIcon = require('./assets/opening balance.png');
const incomeMetricIcon = require('./assets/income.png');
const outcomeMetricIcon = require('./assets/outcome.png');
const balanceMetricIcon = require('./assets/balance.png');
const groceriesCategoryIcon = require('./assets/groceries.png');
const transportCategoryIcon = require('./assets/transport.png');
const rentCategoryIcon = require('./assets/rent.png');
const entertainmentCategoryIcon = require('./assets/entertainment.png');
const othersCategoryIcon = require('./assets/others.png');
const searchIcon = require('./assets/search.png');
const walletIcon = require('./assets/wallet.png');
const transferIcon = require('./assets/transfer.png');
const shoppingBagIcon = require('./assets/shopping-bag.png');
const moneyBagIcon = require('./assets/money-bag.png');

const ONBOARDING_STORAGE_KEY = '@homebudget/onboarding-shown';
const ONBOARDING_FILE_NAME = 'homebudget-onboarding-state.json';

async function readOnboardingState() {
  if (Platform.OS === 'web') {
    try {
      return await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      console.warn('Unable to read onboarding state from AsyncStorage', error);
      return null;
    }
  }

  try {
    const file = new File({
      uri: `${Directory.document.uri}${ONBOARDING_FILE_NAME}`,
      name: ONBOARDING_FILE_NAME,
      size: 0,
    });

    const exists = await file.exists;
    if (!exists) {
      return null;
    }

    const savedValue = await file.text();
    return savedValue === 'true' ? 'true' : null;
  } catch (error) {
    try {
      return await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    } catch (storageError) {
      console.warn('Unable to read onboarding state', storageError);
      return null;
    }
  }
}

async function writeOnboardingState(isShown) {
  if (Platform.OS === 'web') {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, isShown ? 'true' : 'false');
      return;
    } catch (error) {
      console.warn('Unable to persist onboarding state via AsyncStorage', error);
      return;
    }
  }

  try {
    const file = new File({
      uri: `${Directory.document.uri}${ONBOARDING_FILE_NAME}`,
      name: ONBOARDING_FILE_NAME,
      size: 0,
    });

    await file.write(isShown ? 'true' : 'false', { encoding: 'utf8' });
  } catch (error) {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, isShown ? 'true' : 'false');
    } catch (storageError) {
      console.warn('Unable to persist onboarding state', storageError);
    }
  }
}

async function clearOnboardingState() {
  if (Platform.OS === 'web') {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      console.warn('Unable to clear onboarding state from AsyncStorage', error);
    }

    return;
  }

  try {
    const file = new File({
      uri: `${Directory.document.uri}${ONBOARDING_FILE_NAME}`,
      name: ONBOARDING_FILE_NAME,
      size: 0,
    });

    await file.delete();
  } catch (error) {
    console.warn('Unable to clear onboarding state file', error);
  }

  try {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear onboarding state from AsyncStorage', error);
  }
}

const monthFormatter = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
});

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const operationDateDisplayFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  weekday: 'short',
});

const operationWeekdayFormatter = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'short',
});

const operationMonthDisplayFormatter = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
});

const calendarWeekdayLabels = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
const mainTabs = [
  { key: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { key: 'operations', label: 'Operacje', icon: '☰' },
  { key: 'analytics', label: 'Analizy', icon: '◔' },
  { key: 'more', label: 'Więcej', icon: '◼' },
];

function formatMinorCurrency(amountMinor) {
  return currencyFormatter.format(amountMinor / 100);
}

function formatSignedMinorCurrency(amountMinor) {
  const sign = amountMinor > 0 ? '+' : amountMinor < 0 ? '-' : '';
  return `${sign}${formatMinorCurrency(Math.abs(amountMinor))}`;
}

function formatMonthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-').map((value) => Number(value));
  const date = new Date(year, month - 1, 1);
  const formatted = monthFormatter.format(date);

  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
}

function formatOperationDate(dateOnly) {
  const [year, month, day] = dateOnly.split('-').map((value) => Number(value));
  return dateFormatter.format(new Date(year, month - 1, day));
}

function categoryPillBackground(color) {
  return `${color}22`;
}

function categoryShortLabel(name) {
  return name.slice(0, 1).toUpperCase();
}

function resolveTransactionTypeIcon(type) {
  return type === 'income' ? incomeMetricIcon : outcomeMetricIcon;
}

function resolveCategoryIcon(name) {
  const normalized = name.trim().toLowerCase();

  if (normalized === 'inne') {
    return othersCategoryIcon;
  }

  if (normalized.includes('jedzenie') || normalized.includes('zakupy')) {
    return groceriesCategoryIcon;
  }

  if (normalized.includes('transport')) {
    return transportCategoryIcon;
  }

  if (normalized.includes('mieszkanie') || normalized.includes('czynsz') || normalized.includes('rent')) {
    return rentCategoryIcon;
  }

  if (normalized.includes('rozrywka')) {
    return entertainmentCategoryIcon;
  }

  return null;
}

function resolveCategoryIconFromKey(iconKey) {
  if (!iconKey) {
    return null;
  }

  const normalized = iconKey.trim().toLowerCase();

  if (normalized === 'briefcase' || normalized === 'wallet') {
    return walletIcon;
  }

  if (normalized === 'laptop' || normalized === 'transfer') {
    return transferIcon;
  }

  if (normalized === 'shopping-cart' || normalized === 'shopping-bag') {
    return shoppingBagIcon;
  }

  if (normalized === 'home' || normalized === 'money-bag') {
    return moneyBagIcon;
  }

  return null;
}

function normalizeSearchValue(value) {
  return value
    .trim()
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l');
}

function buildDonutSegments(entries, totalAmountMinor) {
  const segmentCount = 56;
  const donutSize = 134;
  const segmentWidth = 8;
  const segmentHeight = 16;
  const radius = 55;
  const center = donutSize / 2;

  if (totalAmountMinor <= 0 || entries.length === 0) {
    return [];
  }

  const normalizedEntries = entries
    .filter((entry) => entry.amountMinor > 0)
    .map((entry) => ({
      categoryId: entry.categoryId,
      color: entry.color,
      share: entry.amountMinor / totalAmountMinor,
    }));

  if (normalizedEntries.length === 0) {
    return [];
  }

  let cumulativeShare = 0;
  const entriesWithRange = normalizedEntries.map((entry, index) => {
    const startShare = cumulativeShare;
    cumulativeShare += entry.share;

    return {
      ...entry,
      endShare: index === normalizedEntries.length - 1 ? 1 : cumulativeShare,
      startShare,
    };
  });

  return Array.from({ length: segmentCount }, (_, index) => {
    const segmentShare = (index + 0.5) / segmentCount;
    const entry = entriesWithRange.find((item) => segmentShare <= item.endShare) ?? entriesWithRange[entriesWithRange.length - 1];
    const angleRad = ((index / segmentCount) * Math.PI * 2) - Math.PI / 2;
    const left = center + Math.cos(angleRad) * radius - segmentWidth / 2;
    const top = center + Math.sin(angleRad) * radius - segmentHeight / 2;

    return {
      key: `${entry.categoryId}-${index}`,
      color: entry.color,
      left,
      top,
      rotationDeg: `${(index / segmentCount) * 360}deg`,
    };
  });
}

function withRoundedSharePercent(entries, totalAmountMinor) {
  if (entries.length === 0 || totalAmountMinor <= 0) {
    return entries.map((entry) => ({
      ...entry,
      sharePercent: 0,
    }));
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

  const bonusByIndex = new Map();
  for (const item of ranking) {
    if (pointsToDistribute <= 0) {
      break;
    }

    bonusByIndex.set(item.index, 1);
    pointsToDistribute -= 1;
  }

  return entries.map((entry, index) => ({
    ...entry,
    sharePercent: shares[index].flooredPercent + (bonusByIndex.get(index) ?? 0),
  }));
}

function DashboardDonutChart({ totalAmountMinor, segments }) {
  return (
    <View style={styles.dashboardDonutOuter}>
      <View style={styles.dashboardDonutTrack} />
      {segments.map((segment) => (
        <View
          key={segment.key}
          style={[
            styles.dashboardDonutSegment,
            {
              backgroundColor: segment.color,
              left: segment.left,
              top: segment.top,
              transform: [{ rotate: segment.rotationDeg }],
            },
          ]}
        />
      ))}
      <View style={styles.dashboardDonutInner}>
        <Text style={styles.dashboardDonutAmount}>{formatMinorCurrency(totalAmountMinor)}</Text>
        <Text style={styles.dashboardDonutLabel}>łącznie</Text>
      </View>
    </View>
  );
}

function AppLink({ label, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}>
      <Text style={styles.linkButtonText}>{label}</Text>
    </Pressable>
  );
}

function formatOperationDateWithWeekday(date) {
  const formattedDate = dateFormatter.format(date);
  const rawWeekday = operationWeekdayFormatter.format(date).replace(',', '').trim();
  const weekday = rawWeekday.endsWith('.') ? rawWeekday : `${rawWeekday}.`;

  return `${formattedDate} (${weekday})`;
}

function formatOperationMonthFromDate(date) {
  const formatted = operationMonthDisplayFormatter.format(date);
  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
}

function normalizeAmountInput(rawValue) {
  const compact = rawValue.replace(/\s+/g, '');
  const digitsAndSeparators = compact.replace(/[^\d.,]/g, '');
  const normalizedDecimal = digitsAndSeparators.replace(/\./g, ',');
  const [integerPart = '', ...fractionParts] = normalizedDecimal.split(',');
  const mergedFraction = fractionParts.join('').slice(0, 2);

  if (fractionParts.length === 0) {
    return integerPart;
  }

  return `${integerPart},${mergedFraction}`;
}

function parseAmountInputToMinor(value) {
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100);
}

function isSameLocalDate(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function buildCalendarMonthCells(viewMonthDate) {
  const year = viewMonthDate.getFullYear();
  const month = viewMonthDate.getMonth();
  const firstDayWeekIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];

  for (let idx = 0; idx < 42; idx += 1) {
    const dayNumber = idx - firstDayWeekIndex + 1;

    if (dayNumber <= 0) {
      cells.push({
        key: `prev-${idx}`,
        date: new Date(year, month - 1, daysInPrevMonth + dayNumber),
        isInCurrentMonth: false,
      });
      continue;
    }

    if (dayNumber > daysInCurrentMonth) {
      cells.push({
        key: `next-${idx}`,
        date: new Date(year, month + 1, dayNumber - daysInCurrentMonth),
        isInCurrentMonth: false,
      });
      continue;
    }

    cells.push({
      key: `current-${dayNumber}`,
      date: new Date(year, month, dayNumber),
      isInCurrentMonth: true,
    });
  }

  return cells;
}

function HomeScreen({ onOpenOnboarding, onClearStorage }) {
  return (
    <SafeAreaView style={styles.homeScreen}>
      <View style={styles.homeGlowTop} />
      <View style={styles.homeGlowBottom} />

      <View style={styles.homeContent}>
        <View style={styles.homeBrandRow}>
          <Image source={logoMark} style={styles.homeBrandIcon} resizeMode="contain" />
          <View style={styles.homeBrandTextWrap}>
            <Text style={styles.homeBrandName}>
              <Text style={styles.homeBrandNameDark}>Home</Text>
              <Text style={styles.homeBrandNameBlue}>Budget</Text>
            </Text>
            <Text style={styles.homeBrandTagline}>Ekran startowy aplikacji</Text>
          </View>
        </View>

        <View style={styles.homeCard}>
          <Text style={styles.homeCardTitle}>Wejdź do onboarding&apos;u</Text>
          <Text style={styles.homeCardText}>Otwórz ekran powitalny, aby zobaczyć układ przygotowany dokładnie pod załączony projekt.</Text>
          <AppLink label="Otwórz aplikację" onPress={onOpenOnboarding} />
          <AppLink label="Wyczyść AsyncStorage" onPress={onClearStorage} />
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function FeatureCard({ icon, title, titleColor, description, cardHeight, iconSize, titleSize, descriptionSize }) {
  return (
    <View style={[styles.featureCard, { minHeight: cardHeight }]}>
      <Image source={icon} style={[styles.featureIcon, { width: iconSize, height: iconSize }]} resizeMode="contain" />
      <Text style={[styles.featureTitle, { color: titleColor, fontSize: titleSize, lineHeight: Math.round(titleSize * 1.28) }]}>{title}</Text>
      <Text style={[styles.featureDescription, { fontSize: descriptionSize, lineHeight: Math.round(descriptionSize * 1.45) }]}>{description}</Text>
    </View>
  );
}

function DashboardMetricCard({ iconSource, label, value, valueColor, iconWrapStyle }) {
  return (
    <View style={styles.dashboardMetricCard}>
      <View style={[styles.dashboardMetricIconWrap, iconWrapStyle]}>
        <Image source={iconSource} resizeMode="contain" style={styles.dashboardMetricIconImage} />
      </View>
      <Text style={styles.dashboardMetricLabel} numberOfLines={2}>{label}</Text>
      <Text style={[styles.dashboardMetricValue, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
        {value}
      </Text>
    </View>
  );
}

function DashboardScreen({ onBackHome, onOpenAddTransaction }) {
  const dashboardData = useMemo(() => {
    const budgets = budgetStore.getMonthlyBudgets();
    const transactions = budgetStore.getTransactions();
    const overrides = budgetStore.getOpeningBalanceOverrides();
    const monthsWithData = [...new Set([
      ...transactions.map((tx) => tx.assignedMonth),
      ...overrides.map((item) => item.month),
    ])].sort((a, b) => b.localeCompare(a));

    const latestMonth = monthsWithData[0] ?? budgets[budgets.length - 1]?.month ?? null;

    if (!latestMonth) {
      return null;
    }

    const budgetsByMonth = new Map(budgets.map((item) => [item.month, item]));
    const categoriesById = new Map(budgetStore.getCategories().map((category) => [category.id, category]));
    return {
      latestMonth,
      monthsWithData,
      categoriesById,
      budgetsByMonth,
      transactions,
    };
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(() => dashboardData?.latestMonth ?? null);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [showAllExpenseCategories, setShowAllExpenseCategories] = useState(false);
  const [showAllRecentTransactions, setShowAllRecentTransactions] = useState(false);

  const visibleExpenseCategoryLimit = 3;
  const visibleRecentTransactionsLimit = 5;

  const model = useMemo(() => {
    if (!dashboardData || !selectedMonth) {
      return null;
    }

    const monthSummary = dashboardData.budgetsByMonth.get(selectedMonth);

    if (!monthSummary) {
      return null;
    }

    const monthTransactions = dashboardData.transactions
      .filter((tx) => tx.assignedMonth === selectedMonth)
      .sort((a, b) => b.operationDate.localeCompare(a.operationDate));

    const expenseTotals = new Map();

    for (const tx of monthTransactions) {
      if (tx.type !== 'expense') {
        continue;
      }

      expenseTotals.set(tx.categoryId, (expenseTotals.get(tx.categoryId) ?? 0) + tx.amountMinor);
    }

    const expenseBreakdownRawUnrounded = [...expenseTotals.entries()]
      .map(([categoryId, amountMinor]) => {
        const category = dashboardData.categoriesById.get(categoryId);

        return {
          categoryId,
          amountMinor,
          name: category?.name ?? 'Inne',
          color: category?.color ?? '#94A3B8',
        };
      })
      .sort((a, b) => b.amountMinor - a.amountMinor);

    const expenseBreakdownRaw = withRoundedSharePercent(expenseBreakdownRawUnrounded, monthSummary.totalExpenseMinor);

    const topThree = expenseBreakdownRaw.slice(0, visibleExpenseCategoryLimit);
    const remaining = expenseBreakdownRaw.slice(visibleExpenseCategoryLimit);
    const remainingAmountMinor = remaining.reduce((sum, item) => sum + item.amountMinor, 0);

    const expenseBreakdownUnrounded = topThree.map((item) => ({
      categoryId: item.categoryId,
      amountMinor: item.amountMinor,
      name: item.name,
      color: item.color,
    }));

    if (remainingAmountMinor > 0) {
      expenseBreakdownUnrounded.push({
        categoryId: 'cat-others',
        amountMinor: remainingAmountMinor,
        name: 'Inne',
        color: '#8B5CF6',
      });
    }

    const expenseBreakdown = withRoundedSharePercent(expenseBreakdownUnrounded, monthSummary.totalExpenseMinor);

    const recentTransactions = monthTransactions.map((tx) => ({
      ...tx,
      category: dashboardData.categoriesById.get(tx.categoryId),
    }));

    return {
      monthSummary,
      expenseBreakdown,
      expenseBreakdownRaw,
      expenseDonutSegments: buildDonutSegments(expenseBreakdownRaw, monthSummary.totalExpenseMinor),
      recentTransactions,
      availableMonths: dashboardData.monthsWithData,
    };
  }, [dashboardData, selectedMonth, visibleExpenseCategoryLimit]);

  const visibleExpenseBreakdown = useMemo(() => {
    if (!model) {
      return [];
    }

    return showAllExpenseCategories
      ? model.expenseBreakdownRaw
      : model.expenseBreakdown;
  }, [model, showAllExpenseCategories]);

  const visibleRecentTransactions = useMemo(() => {
    if (!model) {
      return [];
    }

    return showAllRecentTransactions
      ? model.recentTransactions
      : model.recentTransactions.slice(0, visibleRecentTransactionsLimit);
  }, [model, showAllRecentTransactions, visibleRecentTransactionsLimit]);

  const hasMoreExpenseCategories = (model?.expenseBreakdownRaw.length ?? 0) > visibleExpenseCategoryLimit;
  const hasMoreTransactions = (model?.recentTransactions.length ?? 0) > visibleRecentTransactionsLimit;

  if (!model) {
    return (
      <SafeAreaView style={styles.dashboardEmptyScreen}>
        <Text style={styles.dashboardEmptyTitle}>Brak danych budżetu</Text>
        <Text style={styles.dashboardEmptyText}>Dodaj operacje, aby zobaczyć podsumowanie dashboardu.</Text>
        <Pressable accessibilityRole="button" onPress={onBackHome} style={styles.dashboardBackButton}>
          <Text style={styles.dashboardBackButtonText}>Wróć</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.dashboardScreen}>
      <View style={styles.dashboardGlowLeft} />
      <View style={styles.dashboardGlowRight} />

      <ScrollView
        style={styles.dashboardScroll}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dashboardTopRow}>
          <View style={styles.dashboardMonthSelectorWrap}>
            <Pressable
              accessibilityRole="button"
              style={styles.dashboardMonthSelectorButton}
              onPress={() => setIsMonthDropdownOpen((open) => !open)}
            >
              <Text style={styles.dashboardMonthText}>{formatMonthLabel(model.monthSummary.month)}</Text>
              <Text style={styles.dashboardMonthChevron}>{isMonthDropdownOpen ? '▲' : '▼'}</Text>
            </Pressable>

            {isMonthDropdownOpen ? (
              <View style={styles.dashboardMonthDropdown}>
                {model.availableMonths.map((month) => {
                  const isActive = month === selectedMonth;

                  return (
                    <Pressable
                      key={month}
                      accessibilityRole="button"
                      style={[styles.dashboardMonthOption, isActive && styles.dashboardMonthOptionActive]}
                      onPress={() => {
                        setSelectedMonth(month);
                        setShowAllExpenseCategories(false);
                        setShowAllRecentTransactions(false);
                        setIsMonthDropdownOpen(false);
                      }}
                    >
                      <Text style={[styles.dashboardMonthOptionText, isActive && styles.dashboardMonthOptionTextActive]}>{formatMonthLabel(month)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <Pressable accessibilityRole="button" style={styles.dashboardCalendarButton}>
            <Image source={calendarIcon} resizeMode="contain" style={styles.dashboardCalendarIcon} />
          </Pressable>
        </View>

        <View style={styles.dashboardMainCard}>
          <View style={styles.dashboardMainCardHeaderRow}>
            <Text style={styles.dashboardMainCardLabel}>Bilans miesiąca</Text>
          </View>
          <View style={styles.dashboardMainCardRow}>
            <Text style={styles.dashboardMainCardValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.64}>{formatSignedMinorCurrency(model.monthSummary.monthlyResultMinor)}</Text>
          </View>
        </View>

        <View style={styles.dashboardMetricsGrid}>
          <DashboardMetricCard
            iconSource={openingBalanceMetricIcon}
            iconWrapStyle={styles.dashboardMetricIconInfo}
            label="Saldo początkowe"
            value={formatMinorCurrency(model.monthSummary.openingBalanceMinor)}
            valueColor="#1b2445"
          />
          <DashboardMetricCard
            iconSource={incomeMetricIcon}
            iconWrapStyle={styles.dashboardMetricIconIncome}
            label="Suma wpływów"
            value={formatMinorCurrency(model.monthSummary.totalIncomeMinor)}
            valueColor="#16A34A"
          />
          <DashboardMetricCard
            iconSource={outcomeMetricIcon}
            iconWrapStyle={styles.dashboardMetricIconExpense}
            label="Suma wydatków"
            value={formatMinorCurrency(model.monthSummary.totalExpenseMinor)}
            valueColor="#DC2626"
          />
          <DashboardMetricCard
            iconSource={balanceMetricIcon}
            iconWrapStyle={styles.dashboardMetricIconWarning}
            label="Saldo końcowe"
            value={formatMinorCurrency(model.monthSummary.closingBalanceMinor)}
            valueColor="#1b2445"
          />
        </View>

        <View style={styles.dashboardSectionCard}>
          <View style={[styles.dashboardSectionHeader, styles.dashboardSectionHeaderTopAligned]}>
            <View style={styles.dashboardSectionHeaderLeft}>
              <Text style={styles.dashboardSectionTitle}>Wydatki według kategorii</Text>
              <Text style={styles.dashboardSectionSubtitle}>{formatMinorCurrency(model.monthSummary.totalExpenseMinor)} łącznie</Text>
            </View>
            {hasMoreExpenseCategories ? (
              <Pressable
                accessibilityRole="button"
                style={styles.dashboardSeeAllPill}
                onPress={() => setShowAllExpenseCategories((current) => !current)}
              >
                <Text style={styles.dashboardSeeAllPillText}>{showAllExpenseCategories ? 'Pokaż mniej' : 'Zobacz wszystkie'}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.dashboardCategoryRow}>
            <View style={styles.dashboardDonutWrapOuter}>
              <DashboardDonutChart
                totalAmountMinor={model.monthSummary.totalExpenseMinor}
                segments={model.expenseDonutSegments}
              />
            </View>

            <View style={styles.dashboardBreakdownCol}>
              {visibleExpenseBreakdown.length === 0 ? (
                <Text style={styles.dashboardEmptyBreakdownText}>Brak wydatków w tym miesiącu.</Text>
              ) : (
                visibleExpenseBreakdown.map((entry) => {
                  const categoryIcon = resolveCategoryIcon(entry.name);

                  return (
                    <View key={entry.categoryId} style={styles.dashboardBreakdownRow}>
                      <View style={styles.dashboardBreakdownNameWrap}>
                        <View style={[styles.dashboardBreakdownAvatar, { backgroundColor: categoryPillBackground(entry.color) }]}>
                          {categoryIcon ? (
                            <Image source={categoryIcon} resizeMode="contain" style={styles.dashboardBreakdownAvatarIconImage} />
                          ) : (
                            <Text style={[styles.dashboardBreakdownAvatarText, { color: entry.color }]}>
                              {categoryShortLabel(entry.name)}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.dashboardBreakdownName} numberOfLines={2}>{entry.name}</Text>
                      </View>
                      <View style={styles.dashboardBreakdownValueWrap}>
                        <Text style={styles.dashboardBreakdownValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{formatMinorCurrency(entry.amountMinor)}</Text>
                        <Text style={styles.dashboardBreakdownPercent}>{entry.sharePercent}%</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>

        <View style={styles.dashboardSectionCard}>
          <View style={styles.dashboardSectionHeader}>
            <Text style={styles.dashboardSectionTitle}>Ostatnie operacje</Text>
            {hasMoreTransactions ? (
              <Pressable
                accessibilityRole="button"
                style={styles.dashboardSeeAllPill}
                onPress={() => setShowAllRecentTransactions((current) => !current)}
              >
                <Text style={styles.dashboardSeeAllPillText}>{showAllRecentTransactions ? 'Pokaż mniej' : 'Zobacz wszystkie'}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.dashboardTransactionsList}>
            {visibleRecentTransactions.length === 0 ? (
              <Text style={styles.dashboardEmptyBreakdownText}>Brak operacji w tym miesiącu.</Text>
            ) : (
              visibleRecentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const transactionIcon = resolveTransactionTypeIcon(tx.type);

                return (
                  <View key={tx.id} style={styles.dashboardTransactionRow}>
                    <View style={styles.dashboardTransactionLeft}>
                      <View style={[styles.dashboardTransactionIconWrap, { backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2' }]}>
                        <Image source={transactionIcon} resizeMode="contain" style={styles.dashboardTransactionIconImage} />
                      </View>

                      <View>
                        <Text style={styles.dashboardTransactionTitle}>{tx.description || tx.category?.name || 'Operacja'}</Text>
                        <Text style={styles.dashboardTransactionSubtitle}>
                          {isIncome ? 'Wpływ' : 'Wydatek'} • {formatOperationDate(tx.operationDate)}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.dashboardTransactionAmount, { color: isIncome ? '#16A34A' : '#DC2626' }]}>
                      {formatSignedMinorCurrency(isIncome ? tx.amountMinor : -tx.amountMinor)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Dodaj operację" style={styles.dashboardAddButton} onPress={onOpenAddTransaction}>
          <View style={styles.dashboardAddButtonRow}>
            <Image source={addIcon} resizeMode="contain" style={styles.dashboardAddIcon} />
            <Text style={styles.dashboardAddButtonText}>Dodaj operację</Text>
          </View>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={onBackHome} style={styles.dashboardBackButtonSecondary}>
          <Text style={styles.dashboardBackButtonText}>Powrót do ekranu startowego</Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function AddTransactionScreen({ onBack, onSave }) {
  const addTxScrollRef = useRef(null);
  const [type, setType] = useState('income');
  const [operationDate, setOperationDate] = useState(() => new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewMonth, setCalendarViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [amountInput, setAmountInput] = useState('0,00');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => budgetStore.getCategories('income')[0]?.id ?? null);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [categoryDraftId, setCategoryDraftId] = useState(null);
  const [categorySearchInput, setCategorySearchInput] = useState('');
  const [isCategorySearchFocused, setIsCategorySearchFocused] = useState(false);
  const isIncome = type === 'income';
  const calendarCells = useMemo(() => buildCalendarMonthCells(calendarViewMonth), [calendarViewMonth]);
  const calendarMonthLabel = formatOperationMonthFromDate(calendarViewMonth);
  const amountMinor = useMemo(() => parseAmountInputToMinor(amountInput), [amountInput]);
  const amountHasError = amountMinor === null || amountMinor <= 0;
  const categoriesForType = useMemo(() => budgetStore.getCategories(type), [type]);
  const selectedCategory = useMemo(
    () => categoriesForType.find((category) => category.id === selectedCategoryId) ?? null,
    [categoriesForType, selectedCategoryId],
  );
  const categorySearchQuery = useMemo(() => normalizeSearchValue(categorySearchInput), [categorySearchInput]);
  const visibleCategories = useMemo(() => {
    if (!categorySearchQuery) {
      return categoriesForType;
    }

    return categoriesForType.filter((category) => normalizeSearchValue(category.name).includes(categorySearchQuery));
  }, [categoriesForType, categorySearchQuery]);

  useEffect(() => {
    if (categoriesForType.length === 0) {
      setSelectedCategoryId(null);
      return;
    }

    const stillValid = categoriesForType.some((category) => category.id === selectedCategoryId);

    if (!stillValid) {
      setSelectedCategoryId(categoriesForType[0].id);
    }
  }, [categoriesForType, selectedCategoryId]);

  const openCalendar = () => {
    setCalendarViewMonth(new Date(operationDate.getFullYear(), operationDate.getMonth(), 1));
    setIsCalendarOpen(true);
  };

  const openCategoryPicker = () => {
    setCategorySearchInput('');
    setIsCategorySearchFocused(false);
    setCategoryDraftId(selectedCategoryId ?? categoriesForType[0]?.id ?? null);
    setIsCategoryPickerOpen(true);
  };

  const saveCategorySelection = () => {
    setSelectedCategoryId(categoryDraftId ?? null);
    setIsCategorySearchFocused(false);
    setIsCategoryPickerOpen(false);
  };

  const categoryAccentColor = selectedCategory?.color ?? (isIncome ? themeColors.income : themeColors.expense);
  const selectedCategoryIcon = selectedCategory
    ? resolveCategoryIconFromKey(selectedCategory.icon) ?? resolveCategoryIcon(selectedCategory.name)
    : null;

  return (
    <SafeAreaView style={styles.addTxScreen}>
      <View style={styles.addTxGlowTop} />

      <KeyboardAvoidingView
        style={styles.addTxKeyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={addTxScrollRef}
          style={styles.addTxScroll}
          contentContainerStyle={styles.addTxScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
        >
        <Pressable accessibilityRole="button" accessibilityLabel="Wróć do dashboardu" style={styles.addTxBackButton} onPress={onBack}>
          <Image source={backArrowIcon} resizeMode="cover" style={styles.addTxBackButtonImage} />
        </Pressable>

        <Text style={styles.addTxTitle}>Dodaj operację</Text>

        <View style={styles.addTxTypeSegment}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isIncome }}
            style={[styles.addTxTypeButton, isIncome && styles.addTxTypeButtonIncomeActive]}
            onPress={() => setType('income')}
          >
            <Image source={incomeMetricIcon} resizeMode="contain" style={styles.addTxTypeIconImage} />
            <Text style={[styles.addTxTypeText, isIncome && styles.addTxTypeTextIncome]}>Wpływ</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !isIncome }}
            style={[styles.addTxTypeButton, !isIncome && styles.addTxTypeButtonExpenseActive]}
            onPress={() => setType('expense')}
          >
            <Image source={outcomeMetricIcon} resizeMode="contain" style={styles.addTxTypeIconImage} />
            <Text style={[styles.addTxTypeText, !isIncome && styles.addTxTypeTextExpense]}>Wydatek</Text>
          </Pressable>
        </View>

        <View style={styles.addTxCard}>
          <Text style={styles.addTxFieldLabel}>Kwota</Text>
          <View style={styles.addTxAmountInputRow}>
            <TextInput
              style={styles.addTxAmountInput}
              value={amountInput}
              onChangeText={(text) => setAmountInput(normalizeAmountInput(text))}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={themeColors.textMuted}
              accessibilityLabel="Kwota operacji"
            />
            <Text style={styles.addTxAmountCurrency}>zł</Text>
          </View>
          {amountHasError ? <Text style={styles.addTxErrorText}>Kwota musi być większa od zera</Text> : null}
        </View>

        <Pressable accessibilityRole="button" style={styles.addTxCard} onPress={openCalendar}>
          <Text style={styles.addTxFieldLabel}>Data operacji</Text>
          <View style={styles.addTxInlineValueRow}>
            <Image source={calendarIcon} resizeMode="contain" style={styles.addTxInlineImageIcon} />
            <Text style={styles.addTxInlineValue}>{formatOperationDateWithWeekday(operationDate)}</Text>
          </View>
        </Pressable>

        <View style={[styles.addTxCard, styles.addTxCardDisabled]}>
          <Text style={[styles.addTxFieldLabel, styles.addTxFieldLabelDisabled]}>Miesiąc operacji</Text>
          <View style={styles.addTxInlineValueRowReadOnly}>
            <Text style={[styles.addTxInlineValue, styles.addTxInlineValueDisabled]}>{formatOperationMonthFromDate(operationDate)}</Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" style={styles.addTxCard} onPress={openCategoryPicker}>
          <Text style={styles.addTxFieldLabel}>Kategoria</Text>
          <View style={styles.addTxCategoryRow}>
            <View style={[styles.addTxCategoryBadge, { backgroundColor: categoryPillBackground(categoryAccentColor) }]}>
              {selectedCategoryIcon ? (
                <Image source={selectedCategoryIcon} resizeMode="contain" style={styles.addTxCategoryBadgeImage} />
              ) : (
                <Text style={[styles.addTxCategoryBadgeIcon, { color: categoryAccentColor }]}>{selectedCategory ? categoryShortLabel(selectedCategory.name) : '?'}</Text>
              )}
            </View>
            <Text style={styles.addTxCategoryText}>{selectedCategory?.name ?? 'Wybierz kategorię'}</Text>
            <Text style={styles.addTxCategoryChevron}>›</Text>
          </View>
        </Pressable>

        <View style={styles.addTxCard}>
          <Text style={styles.addTxFieldLabel}>Opis (opcjonalnie)</Text>
          <View style={styles.addTxDescriptionBox}>
            <TextInput
              style={styles.addTxDescriptionInput}
              placeholder="Dodaj opis..."
              placeholderTextColor={themeColors.textMuted}
              multiline
              value={descriptionInput}
              onChangeText={setDescriptionInput}
              maxLength={120}
              textAlignVertical="top"
              onFocus={() => addTxScrollRef.current?.scrollToEnd({ animated: true })}
            />
            <Text style={styles.addTxCounterText}>{descriptionInput.length}/120</Text>
          </View>
        </View>

        <View style={styles.addTxInfoCard}>
          <Text style={styles.addTxInfoIcon}>◌</Text>
          <View style={styles.addTxInfoContent}>
            <Text style={styles.addTxInfoTitle}>Informacja</Text>
            <Text style={styles.addTxInfoText}>
              Miesiąc operacji jest uzupełniany automatycznie na podstawie podanej daty i nie można go zmienić ręcznie.
            </Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" style={styles.addTxSaveButton} onPress={onSave}>
          <Text style={styles.addTxSaveButtonText}>Zapisz operację</Text>
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isCalendarOpen} transparent animationType="fade" onRequestClose={() => setIsCalendarOpen(false)}>
        <View style={styles.calendarModalOverlay}>
          <Pressable style={styles.calendarModalBackdrop} onPress={() => setIsCalendarOpen(false)} />

          <View style={styles.calendarModalCard}>
            <View style={styles.calendarModalHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Poprzedni miesiąc"
                style={styles.calendarNavButton}
                onPress={() => setCalendarViewMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              >
                <Text style={styles.calendarNavButtonText}>‹</Text>
              </Pressable>

              <Text style={styles.calendarModalHeaderTitle}>{calendarMonthLabel}</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Następny miesiąc"
                style={styles.calendarNavButton}
                onPress={() => setCalendarViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              >
                <Text style={styles.calendarNavButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.calendarWeekdaysRow}>
              {calendarWeekdayLabels.map((label) => (
                <Text key={label} style={styles.calendarWeekdayLabel}>{label}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((cell) => {
                const isSelected = isSameLocalDate(cell.date, operationDate);

                return (
                  <Pressable
                    key={cell.key}
                    accessibilityRole="button"
                    style={[
                      styles.calendarDayCell,
                      !cell.isInCurrentMonth && styles.calendarDayCellOutOfMonth,
                      isSelected && styles.calendarDayCellSelected,
                    ]}
                    onPress={() => {
                      setOperationDate(cell.date);
                      setCalendarViewMonth(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                      setIsCalendarOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.calendarDayCellText,
                        !cell.isInCurrentMonth && styles.calendarDayCellTextOutOfMonth,
                        isSelected && styles.calendarDayCellTextSelected,
                      ]}
                    >
                      {cell.date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable accessibilityRole="button" style={styles.calendarCloseButton} onPress={() => setIsCalendarOpen(false)}>
              <Text style={styles.calendarCloseButtonText}>Anuluj</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={isCategoryPickerOpen} animationType="slide" onRequestClose={() => setIsCategoryPickerOpen(false)}>
        <SafeAreaView style={styles.selectCategoryScreen}>
          <View style={styles.selectCategoryGlowTop} />

          <View style={styles.selectCategoryContainer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Wróć do formularza"
              style={styles.selectCategoryBackButton}
              onPress={() => setIsCategoryPickerOpen(false)}
            >
              <Image source={backArrowIcon} resizeMode="cover" style={styles.addTxBackButtonImage} />
            </Pressable>

            <Text style={styles.selectCategoryTitle}>Wybierz kategorię</Text>

            <View style={styles.selectCategoryTypePillWrap}>
              <View style={[styles.selectCategoryTypePill, isIncome ? styles.selectCategoryTypePillIncome : styles.selectCategoryTypePillExpense]}>
                <Text style={[styles.selectCategoryTypePillArrow, isIncome ? styles.selectCategoryTypePillArrowIncome : styles.selectCategoryTypePillArrowExpense]}>
                  ↗
                </Text>
                <Text style={[styles.selectCategoryTypePillText, isIncome ? styles.selectCategoryTypePillTextIncome : styles.selectCategoryTypePillTextExpense]}>
                  {isIncome ? 'Wpływ' : 'Wydatek'}
                </Text>
              </View>
            </View>

            <Text style={styles.selectCategoryHint}>Pokazano tylko kategorie pasujące do typu operacji.</Text>

            <View style={styles.selectCategorySearchBox}>
              <Image source={searchIcon} resizeMode="contain" style={styles.selectCategorySearchIcon} />
              <TextInput
                style={styles.selectCategorySearchInput}
                value={categorySearchInput}
                onChangeText={setCategorySearchInput}
                onFocus={() => setIsCategorySearchFocused(true)}
                onBlur={() => setIsCategorySearchFocused(false)}
                placeholder="Szukaj kategorii"
                placeholderTextColor="#8c99b6"
                accessibilityLabel="Szukaj kategorii"
              />
            </View>

            <ScrollView
              style={styles.selectCategoryList}
              contentContainerStyle={styles.selectCategoryListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            >
              {visibleCategories.length === 0 ? (
                <View style={styles.selectCategoryEmptyCard}>
                  <Text style={styles.selectCategoryEmptyTitle}>Brak wyników</Text>
                  <Text style={styles.selectCategoryEmptyText}>Zmień wpisaną frazę, aby znaleźć kategorię.</Text>
                </View>
              ) : (
                visibleCategories.map((category) => {
                  const isSelected = category.id === categoryDraftId;
                  const color = category.color ?? (isIncome ? themeColors.income : themeColors.expense);
                  const categoryIcon = resolveCategoryIconFromKey(category.icon) ?? resolveCategoryIcon(category.name);

                  return (
                    <Pressable
                      key={category.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      style={[
                        styles.selectCategoryRow,
                        isSelected && { borderColor: color, backgroundColor: `${color}0A` },
                      ]}
                      onPress={() => setCategoryDraftId(category.id)}
                    >
                      <View style={[styles.selectCategoryBadge, { backgroundColor: categoryPillBackground(color) }]}>
                        {categoryIcon ? (
                          <Image source={categoryIcon} resizeMode="contain" style={styles.selectCategoryBadgeImage} />
                        ) : (
                          <Text style={[styles.selectCategoryBadgeText, { color }]}>{categoryShortLabel(category.name)}</Text>
                        )}
                      </View>

                      <Text style={styles.selectCategoryName}>{category.name}</Text>

                      <View style={[styles.selectCategoryRadioOuter, isSelected && { borderColor: color }]}>
                        {isSelected ? (
                          <View style={[styles.selectCategoryRadioInner, { backgroundColor: color }]}>
                            <Text style={styles.selectCategoryCheckmark}>✓</Text>
                          </View>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {!isCategorySearchFocused ? (
              <>
                <Pressable accessibilityRole="button" style={styles.selectCategoryManageLink}>
                  <Text style={styles.selectCategoryManageLinkText}>Zarządzaj kategoriami</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={[styles.selectCategorySaveButton, categoryDraftId === null && styles.selectCategorySaveButtonDisabled]}
                  onPress={saveCategorySelection}
                  disabled={categoryDraftId === null}
                >
                  <Text style={styles.selectCategorySaveButtonText}>Zapisz wybór</Text>
                </Pressable>
              </>
            ) : null}
          </View>

          <StatusBar style="dark" />
        </SafeAreaView>
      </Modal>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function PlaceholderTabScreen({ title }) {
  return (
    <SafeAreaView style={styles.placeholderScreen}>
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderSubtitle}>Ta sekcja jest przygotowana jako placeholder i zostanie uzupełniona w kolejnym kroku.</Text>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function BottomTabBar({ activeTab, onChangeTab }) {
  const [barWidth, setBarWidth] = useState(0);
  const activeX = useRef(new Animated.Value(0)).current;
  const circleSize = 54;
  const tabSlotWidth = barWidth > 0 ? barWidth / mainTabs.length : 0;
  const activeTabIndex = Math.max(0, mainTabs.findIndex((item) => item.key === activeTab));

  useEffect(() => {
    if (tabSlotWidth <= 0) {
      return;
    }

    const nextX = (activeTabIndex * tabSlotWidth) + ((tabSlotWidth - circleSize) / 2);

    Animated.spring(activeX, {
      toValue: nextX,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.9,
    }).start();
  }, [activeTabIndex, activeX, tabSlotWidth]);

  const activeTabConfig = mainTabs[activeTabIndex] ?? mainTabs[0];

  return (
    <View style={styles.tabsBarOuter}>
      <View
        style={styles.tabsBarInner}
        onLayout={(event) => {
          setBarWidth(event.nativeEvent.layout.width);
        }}
      >
        {tabSlotWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.tabsActiveCircle,
              {
                width: circleSize,
                height: circleSize,
                transform: [{ translateX: activeX }],
              },
            ]}
          >
            <Text style={styles.tabsActiveCircleIcon}>{activeTabConfig.icon}</Text>
          </Animated.View>
        ) : null}

        {mainTabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={styles.tabsButton}
              onPress={() => onChangeTab(tab.key)}
            >
              {isActive ? <View style={styles.tabsActiveSpacer} /> : <Text style={styles.tabsIcon}>{tab.icon}</Text>}
              {isActive ? null : <Text style={styles.tabsLabel}>{tab.label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabsScreen({ activeTab, onChangeTab, onBackHome, onOpenAddTransaction }) {
  const activeScreen = (() => {
    if (activeTab === 'operations') {
      return <PlaceholderTabScreen title="Operacje" />;
    }

    if (activeTab === 'analytics') {
      return <PlaceholderTabScreen title="Analizy" />;
    }

    if (activeTab === 'more') {
      return <PlaceholderTabScreen title="Więcej" />;
    }

    return <DashboardScreen onBackHome={onBackHome} onOpenAddTransaction={onOpenAddTransaction} />;
  })();

  return (
    <View style={styles.tabsLayout}>
      <View style={styles.tabsContent}>{activeScreen}</View>
      <BottomTabBar activeTab={activeTab} onChangeTab={onChangeTab} />
    </View>
  );
}

function OnboardingScreen({ onStartDashboard }) {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.72, Math.min(1, height / 920));
  const heroWidth = Math.min(width - 32, 700);
  const heroHeight = Math.round(Math.min(width * 0.68, 300) * scale);
  const titleFontSize = Math.round(40 * scale);
  const titleLineHeight = Math.round(46 * scale);
  const subtitleFontSize = Math.round(19 * scale);
  const subtitleLineHeight = Math.round(26 * scale);
  const featureCardHeight = Math.round(216 * scale);
  const featureIconSize = Math.round(64 * scale);
  const featureTitleFontSize = Math.round(16 * scale);
  const featureDescriptionFontSize = Math.round(13 * scale);
  const primaryButtonHeight = Math.round(68 * scale);
  const primaryButtonFontSize = Math.round(28 * scale);

  return (
    <SafeAreaView style={styles.onboardingScreen}>
      <View style={styles.onboardingBackground}>
        <View style={styles.onboardingBlobTopLeft} />
        <View style={styles.onboardingBlobTopRight} />
        <View style={styles.onboardingBlobMid} />
        <View style={styles.onboardingBlobBottom} />
      </View>

      <View style={styles.onboardingContent}>
        <View style={styles.onboardingBrandRow}>
          <Image source={logoMark} style={styles.onboardingBrandIcon} resizeMode="contain" />
          <Text style={styles.onboardingBrandName}>
            <Text style={styles.homeBrandNameDark}>Home</Text>
            <Text style={styles.homeBrandNameBlue}>Budget</Text>
          </Text>
        </View>

        <View style={[styles.heroFrame, { width: heroWidth, height: heroHeight }]}>
          <Image source={onboardingHero} style={styles.heroImage} resizeMode="contain" />
        </View>

        <View style={styles.titleWrap}>
          <Text style={[styles.title, { fontSize: titleFontSize, lineHeight: titleLineHeight }]}>{'Zadbaj o swój\ndomowy budżet'}</Text>
          <Text style={[styles.subtitle, { fontSize: subtitleFontSize, lineHeight: subtitleLineHeight }]}>
            {'Śledź wpływy i wydatki, twórz własne\nkategorie i kontroluj każdy miesiąc\nw jednym miejscu.'}
          </Text>
        </View>

        <View style={styles.featureRow}>
          <FeatureCard icon={incomeIcon} title="Wpływy" titleColor="#2ca63c" description={['Rejestruj dochody', 'i miej je pod kontrolą.'].join('\n')} cardHeight={featureCardHeight} iconSize={featureIconSize} titleSize={featureTitleFontSize} descriptionSize={featureDescriptionFontSize} />
          <FeatureCard icon={expenseIcon} title="Wydatki" titleColor="#ff6a1a" description={['Kategoryzuj wydatki', 'i nie przekraczaj limitów.'].join('\n')} cardHeight={featureCardHeight} iconSize={featureIconSize} titleSize={featureTitleFontSize} descriptionSize={featureDescriptionFontSize} />
          <FeatureCard icon={analyticsIcon} title="Analiza" titleColor="#2468f2" description={['Sprawdzaj raporty', 'i podejmuj lepsze decyzje.'].join('\n')} cardHeight={featureCardHeight} iconSize={featureIconSize} titleSize={featureTitleFontSize} descriptionSize={featureDescriptionFontSize} />
        </View>

        <Pressable accessibilityRole="button" onPress={onStartDashboard} style={({ pressed }) => [styles.primaryButton, { minHeight: primaryButtonHeight }, pressed && styles.primaryButtonPressed]}>
          <Text style={[styles.primaryButtonText, { fontSize: primaryButtonFontSize, lineHeight: Math.round(primaryButtonFontSize * 1.15) }]}>Zacznij</Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function AppContent() {
  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    readOnboardingState()
      .then((storedValue) => {
        if (!isMounted) {
          return;
        }

        if (storedValue === 'true') {
          setHasSeenOnboarding(true);
          setScreen('main');
          return;
        }

        setHasSeenOnboarding(false);
      })
      .catch(() => {
        if (isMounted) {
          setHasSeenOnboarding(false);
          setScreen('home');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartDashboard = async () => {
    await writeOnboardingState(true);
    setHasSeenOnboarding(true);
    setActiveTab('dashboard');
    setScreen('main');
  };

  const handleClearStorage = async () => {
    await clearOnboardingState();
    setHasSeenOnboarding(false);
    setScreen('home');
  };

  const handleOpenApp = () => {
    if (hasSeenOnboarding) {
      setActiveTab('dashboard');
      setScreen('main');
      return;
    }

    setScreen('onboarding');
  };

  if (screen === 'home') {
    return <HomeScreen onOpenOnboarding={handleOpenApp} onClearStorage={handleClearStorage} />;
  }

  if (screen === 'onboarding') {
    return <OnboardingScreen onStartDashboard={handleStartDashboard} />;
  }

  if (screen === 'add-transaction') {
    return <AddTransactionScreen onBack={() => setScreen('main')} onSave={() => setScreen('main')} />;
  }

  return (
    <MainTabsScreen
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      onBackHome={() => setScreen('home')}
      onOpenAddTransaction={() => setScreen('add-transaction')}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  homeScreen: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  homeGlowTop: {
    position: 'absolute',
    top: -140,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 9999,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
  },
  homeGlowBottom: {
    position: 'absolute',
    right: -160,
    bottom: -120,
    width: 320,
    height: 320,
    borderRadius: 9999,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  homeContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 28,
  },
  homeBrandRow: {
    alignItems: 'center',
    gap: 14,
  },
  homeBrandIcon: {
    width: 72,
    height: 72,
  },
  homeBrandTextWrap: {
    alignItems: 'center',
  },
  homeBrandName: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    textAlign: 'center',
  },
  homeBrandNameDark: {
    color: '#0f1f4d',
  },
  homeBrandNameBlue: {
    color: '#2468f2',
  },
  homeBrandTagline: {
    marginTop: 4,
    color: themeColors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fontFamilies.sans,
  },
  homeCard: {
    borderRadius: radii.card,
    backgroundColor: themeColors.surface,
    padding: 24,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.09,
    shadowRadius: 28,
    elevation: 4,
  },
  homeCardTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    color: themeColors.textPrimary,
    textAlign: 'center',
  },
  homeCardText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamilies.sans,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
  linkButton: {
    alignSelf: 'center',
    minWidth: 180,
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1f63ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  linkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  dashboardEmptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.background,
    paddingHorizontal: 24,
  },
  dashboardEmptyTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: themeColors.textPrimary,
    fontFamily: fontFamilies.sans,
  },
  dashboardEmptyText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  dashboardScreen: {
    flex: 1,
    backgroundColor: '#f4f8ff',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 6 : 0,
  },
  dashboardGlowLeft: {
    position: 'absolute',
    left: -80,
    top: -96,
    width: 288,
    height: 288,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  dashboardGlowRight: {
    position: 'absolute',
    right: -80,
    top: 160,
    width: 256,
    height: 256,
    borderRadius: 999,
    backgroundColor: 'rgba(219,232,255,0.75)',
  },
  dashboardScroll: {
    flex: 1,
  },
  dashboardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  dashboardMonthSelectorWrap: {
    position: 'relative',
    flex: 1,
    paddingRight: 10,
  },
  dashboardMonthSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  dashboardMonthText: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#1c284f',
    fontFamily: fontFamilies.sans,
  },
  dashboardMonthChevron: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    color: '#475569',
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
  },
  dashboardMonthDropdown: {
    position: 'absolute',
    top: 36,
    left: 0,
    minWidth: 196,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  dashboardMonthOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.7)',
  },
  dashboardMonthOptionActive: {
    backgroundColor: themeColors.infoSoft,
  },
  dashboardMonthOptionText: {
    fontSize: 14,
    lineHeight: 18,
    color: themeColors.textPrimary,
    fontFamily: fontFamilies.sans,
  },
  dashboardMonthOptionTextActive: {
    color: themeColors.info,
    fontWeight: '700',
  },
  dashboardCalendarButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardCalendarIcon: {
    width: 24,
    height: 24,
  },
  dashboardMainCard: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dashboardMainCardLabel: {
    fontSize: 14,
    lineHeight: 18,
    color: themeColors.textSecondary,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  dashboardMainCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dashboardMainCardCaptionHeader: {
    fontSize: 11,
    lineHeight: 15,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  dashboardMainCardRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  dashboardMainCardValue: {
    flexShrink: 1,
    paddingRight: 12,
    fontSize: 40,
    lineHeight: 46,
    color: '#131f46',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  dashboardMainCardRightCol: {
    width: 170,
    alignItems: 'center',
    marginTop: 1,
  },
  dashboardMainCardPill: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: themeColors.incomeSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dashboardMainCardPillValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: themeColors.income,
    fontFamily: fontFamilies.sans,
  },
  dashboardMetricsGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  dashboardMetricCard: {
    width: '24%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dashboardMetricIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardMetricIconInfo: {
    backgroundColor: themeColors.infoSoft,
  },
  dashboardMetricIconIncome: {
    backgroundColor: themeColors.incomeSoft,
  },
  dashboardMetricIconExpense: {
    backgroundColor: themeColors.expenseSoft,
  },
  dashboardMetricIconWarning: {
    backgroundColor: themeColors.warningSoft,
  },
  dashboardMetricIconImage: {
    width: '170%',
    height: '170%',
  },
  dashboardMetricLabel: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 13,
    color: themeColors.textSecondary,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
    minHeight: 26,
    textAlign: 'center',
  },
  dashboardMetricValue: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
  },
  dashboardSectionCard: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dashboardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dashboardSectionHeaderTopAligned: {
    alignItems: 'flex-start',
  },
  dashboardSectionHeaderLeft: {
    flex: 1,
  },
  dashboardSectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: '#1a244a',
    fontFamily: fontFamilies.sans,
  },
  dashboardSectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  dashboardSeeAllPill: {
    borderRadius: 999,
    backgroundColor: themeColors.infoSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dashboardSeeAllPillText: {
    fontSize: 11,
    lineHeight: 14,
    color: themeColors.info,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  dashboardCategoryRow: {
    marginTop: 16,
    flexDirection: 'row',
  },
  dashboardDonutWrapOuter: {
    width: '36%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardDonutOuter: {
    width: 134,
    height: 134,
    borderRadius: 67,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardDonutTrack: {
    position: 'absolute',
    width: 134,
    height: 134,
    borderRadius: 67,
    borderWidth: 12,
    borderColor: '#dbe5f6',
  },
  dashboardDonutSegment: {
    position: 'absolute',
    width: 8,
    height: 16,
    borderRadius: 999,
  },
  dashboardDonutInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: themeColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardDonutAmount: {
    fontSize: 16,
    lineHeight: 20,
    color: '#132048',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: fontFamilies.sans,
  },
  dashboardDonutLabel: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 15,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  dashboardBreakdownCol: {
    width: '64%',
    paddingLeft: 8,
    gap: 10,
  },
  dashboardEmptyBreakdownText: {
    fontSize: 16,
    lineHeight: 21,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  dashboardBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dashboardBreakdownNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 6,
    minWidth: 0,
  },
  dashboardBreakdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardBreakdownAvatarText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  dashboardBreakdownAvatarIconImage: {
    width: '170%',
    height: '170%',
  },
  dashboardBreakdownName: {
    fontSize: 14,
    lineHeight: 18,
    color: '#1a244a',
    fontFamily: fontFamilies.sans,
    flexShrink: 1,
  },
  dashboardBreakdownValueWrap: {
    width: 82,
    alignItems: 'flex-end',
  },
  dashboardBreakdownValue: {
    fontSize: 12,
    lineHeight: 16,
    color: '#1a244a',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  dashboardBreakdownPercent: {
    fontSize: 11,
    lineHeight: 14,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  dashboardTransactionsList: {
    marginTop: 12,
  },
  dashboardTransactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingVertical: 12,
  },
  dashboardTransactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  dashboardTransactionIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardTransactionIconImage: {
    width: '170%',
    height: '170%',
  },
  dashboardTransactionTitle: {
    fontSize: 18,
    lineHeight: 22,
    color: '#151f43',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  dashboardTransactionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  dashboardTransactionAmount: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  dashboardAddButton: {
    marginTop: 24,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: themeColors.income,
    paddingHorizontal: 44,
    paddingVertical: 14,
  },
  dashboardAddButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dashboardAddIcon: {
    width: 20,
    height: 20,
  },
  dashboardAddButtonText: {
    fontSize: 20,
    lineHeight: 24,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  tabsLayout: {
    flex: 1,
    backgroundColor: '#f4f8ff',
  },
  tabsContent: {
    flex: 1,
  },
  tabsBarOuter: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: '#f4f8ff',
  },
  tabsBarInner: {
    height: 84,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(204,218,240,0.9)',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  tabsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 4,
  },
  tabsIcon: {
    fontSize: 20,
    lineHeight: 22,
    color: '#6e809f',
    fontFamily: fontFamilies.sans,
  },
  tabsLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6e809f',
    fontFamily: fontFamilies.sans,
  },
  tabsActiveCircle: {
    position: 'absolute',
    top: 15,
    borderRadius: 999,
    backgroundColor: themeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f2a6a',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  tabsActiveCircleIcon: {
    color: '#ffffff',
    fontSize: 21,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  tabsActiveSpacer: {
    height: 50,
    width: 50,
  },
  placeholderScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f8ff',
    paddingHorizontal: 20,
  },
  placeholderCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(209,220,238,0.9)',
    backgroundColor: '#ffffff',
    paddingHorizontal: 22,
    paddingVertical: 26,
    gap: 8,
  },
  placeholderTitle: {
    color: '#1b2445',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  placeholderSubtitle: {
    color: themeColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamilies.sans,
  },
  dashboardBackButton: {
    marginTop: 24,
    borderRadius: 999,
    backgroundColor: themeColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  dashboardBackButtonSecondary: {
    marginTop: 16,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: themeColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  dashboardBackButtonText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  onboardingScreen: {
    flex: 1,
    backgroundColor: '#f7fbff',
  },
  onboardingBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  onboardingBlobTopLeft: {
    position: 'absolute',
    top: -130,
    left: -110,
    width: 360,
    height: 360,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  onboardingBlobTopRight: {
    position: 'absolute',
    top: 150,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 9999,
    backgroundColor: 'rgba(218,232,255,0.58)',
  },
  onboardingBlobMid: {
    position: 'absolute',
    top: 220,
    left: 44,
    width: 650,
    height: 420,
    borderRadius: 220,
    backgroundColor: 'rgba(227,238,255,0.62)',
  },
  onboardingBlobBottom: {
    position: 'absolute',
    bottom: -110,
    left: '8%',
    right: '8%',
    height: 170,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.84)',
  },
  onboardingContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onboardingBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 8,
  },
  onboardingBrandIcon: {
    width: 58,
    height: 58,
  },
  onboardingBrandName: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heroFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 4,
    flexShrink: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  titleWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 0,
  },
  title: {
    color: '#0d2a63',
    fontFamily: fontFamilies.sans,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: '#667699',
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
    maxWidth: 620,
  },
  featureRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  featureIcon: {
    marginTop: 2,
    marginBottom: 8,
  },
  featureTitle: {
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
    marginBottom: 6,
  },
  featureDescription: {
    color: '#667699',
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
    minHeight: 40,
  },
  primaryButton: {
    width: '100%',
    marginTop: 4,
    borderRadius: 26,
    backgroundColor: '#1f63ef',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1f63ef',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  addTxScreen: {
    flex: 1,
    backgroundColor: '#f5f9ff',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 4 : 0,
  },
  addTxGlowTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 360,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  addTxKeyboardAvoiding: {
    flex: 1,
  },
  addTxScroll: {
    flex: 1,
  },
  addTxScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 56,
    gap: 14,
  },
  addTxBackButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxBackButtonImage: {
    width: 72,
    height: 72,
  },
  addTxTitle: {
    marginTop: 6,
    fontSize: 28,
    lineHeight: 36,
    color: '#151f43',
    fontWeight: '700',
    letterSpacing: -0.9,
    fontFamily: fontFamilies.sans,
  },
  addTxTypeSegment: {
    marginTop: 2,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: radii.card,
    backgroundColor: themeColors.surface,
    padding: 4,
  },
  addTxTypeButton: {
    width: '50%',
    borderRadius: radii.panel,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addTxTypeButtonIncomeActive: {
    backgroundColor: themeColors.incomeSoft,
  },
  addTxTypeButtonExpenseActive: {
    backgroundColor: themeColors.expenseSoft,
  },
  addTxTypeIconImage: {
    width: 54,
    height: 54,
  },
  addTxTypeText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
    fontFamily: fontFamilies.sans,
    fontWeight: '600',
  },
  addTxTypeTextIncome: {
    color: themeColors.income,
  },
  addTxTypeTextExpense: {
    color: themeColors.expense,
  },
  addTxCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  addTxCardDisabled: {
    backgroundColor: themeColors.surfaceAlt,
    borderColor: '#d9e2ef',
    shadowOpacity: 0,
    elevation: 0,
  },
  addTxFieldLabel: {
    fontSize: 14,
    lineHeight: 18,
    color: '#6a7697',
    fontFamily: fontFamilies.sans,
    fontWeight: '600',
  },
  addTxFieldLabelDisabled: {
    color: '#8b98b5',
  },
  addTxAmountValue: {
    marginTop: 2,
    fontSize: 32,
    lineHeight: 40,
    color: '#101e46',
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    letterSpacing: -0.9,
  },
  addTxAmountInputRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  addTxAmountInput: {
    flex: 1,
    fontSize: 32,
    lineHeight: 40,
    color: '#101e46',
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    letterSpacing: -0.9,
    paddingVertical: 0,
  },
  addTxAmountCurrency: {
    marginLeft: 6,
    marginBottom: 2,
    fontSize: 32,
    lineHeight: 40,
    color: '#101e46',
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  addTxErrorText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#b85a55',
    fontFamily: fontFamilies.sans,
  },
  addTxInlineValueRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addTxInlineIcon: {
    fontSize: 22,
    lineHeight: 26,
    color: '#7d86a6',
    fontFamily: fontFamilies.sans,
  },
  addTxInlineImageIcon: {
    width: 32,
    height: 32,
  },
  addTxInlineValueRowReadOnly: {
    marginTop: 8,
  },
  addTxInlineValue: {
    flexShrink: 1,
    fontSize: 20,
    lineHeight: 28,
    color: '#1e2a52',
    fontWeight: '500',
    fontFamily: fontFamilies.sans,
    letterSpacing: -0.5,
  },
  addTxInlineValueDisabled: {
    color: '#7f8dab',
  },
  addTxCategoryRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTxCategoryBadge: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: themeColors.incomeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxCategoryBadgeIcon: {
    fontSize: 20,
    lineHeight: 24,
    color: themeColors.income,
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
  },
  addTxCategoryBadgeImage: {
    width: '120%',
    height: '120%',
  },
  addTxCategoryText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#1c2b53',
    fontFamily: fontFamilies.sans,
    letterSpacing: -0.5,
  },
  addTxCategoryChevron: {
    fontSize: 30,
    lineHeight: 34,
    color: '#6f7da2',
    fontFamily: fontFamilies.sans,
  },
  addTxDescriptionBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: radii.panel,
    minHeight: 132,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  addTxDescriptionInput: {
    flex: 1,
    color: '#1b2445',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamilies.sans,
  },
  addTxCounterText: {
    alignSelf: 'flex-end',
    fontSize: 14,
    lineHeight: 18,
    color: '#7b88a9',
    fontFamily: fontFamilies.sans,
  },
  addTxInfoCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#c8ecd6',
    backgroundColor: '#ecf9f1',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addTxInfoIcon: {
    marginTop: 1,
    marginRight: 10,
    fontSize: 22,
    lineHeight: 26,
    color: themeColors.income,
    fontFamily: fontFamilies.sans,
  },
  addTxInfoContent: {
    flex: 1,
  },
  addTxInfoTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: '#165f37',
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
  },
  addTxInfoText: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: '#2f5f48',
    fontFamily: fontFamilies.sans,
  },
  addTxSaveButton: {
    marginTop: 6,
    borderRadius: radii.pill,
    minHeight: 74,
    backgroundColor: themeColors.income,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 4,
  },
  addTxSaveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
    letterSpacing: -0.4,
  },
  calendarModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  calendarModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  calendarModalCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarModalHeaderTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: themeColors.textPrimary,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  calendarNavButton: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.surfaceAlt,
  },
  calendarNavButtonText: {
    fontSize: 20,
    lineHeight: 24,
    color: themeColors.textPrimary,
    fontFamily: fontFamilies.sans,
  },
  calendarWeekdaysRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  calendarWeekdayLabel: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontWeight: '600',
  },
  calendarGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  calendarDayCellOutOfMonth: {
    opacity: 0.45,
  },
  calendarDayCellSelected: {
    backgroundColor: themeColors.info,
  },
  calendarDayCellText: {
    fontSize: 15,
    lineHeight: 20,
    color: themeColors.textPrimary,
    fontFamily: fontFamilies.sans,
    fontWeight: '600',
  },
  calendarDayCellTextOutOfMonth: {
    color: themeColors.textMuted,
  },
  calendarDayCellTextSelected: {
    color: '#ffffff',
  },
  calendarCloseButton: {
    marginTop: 8,
    alignSelf: 'center',
    borderRadius: radii.pill,
    backgroundColor: themeColors.surfaceAlt,
    borderWidth: 1,
    borderColor: themeColors.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  calendarCloseButtonText: {
    fontSize: 14,
    lineHeight: 18,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontWeight: '600',
  },
  selectCategoryScreen: {
    flex: 1,
    backgroundColor: '#f6f9ff',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 4 : 0,
  },
  selectCategoryGlowTop: {
    position: 'absolute',
    top: -120,
    left: -60,
    width: 320,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  selectCategoryContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 20,
  },
  selectCategoryBackButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCategoryTitle: {
    marginTop: 2,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.9,
    color: '#12244d',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  selectCategoryTypePillWrap: {
    marginTop: 12,
    flexDirection: 'row',
  },
  selectCategoryTypePill: {
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectCategoryTypePillIncome: {
    borderColor: '#b6eacc',
    backgroundColor: '#ecf9f2',
  },
  selectCategoryTypePillExpense: {
    borderColor: '#ffd2d2',
    backgroundColor: '#fff3f3',
  },
  selectCategoryTypePillArrow: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fontFamilies.sans,
    fontWeight: '600',
  },
  selectCategoryTypePillArrowIncome: {
    color: '#16A34A',
  },
  selectCategoryTypePillArrowExpense: {
    color: '#DC2626',
    transform: [{ rotate: '90deg' }],
  },
  selectCategoryTypePillText: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    fontFamily: fontFamilies.sans,
    fontWeight: '600',
  },
  selectCategoryTypePillTextIncome: {
    color: '#16A34A',
  },
  selectCategoryTypePillTextExpense: {
    color: '#DC2626',
  },
  selectCategoryHint: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    color: '#69799f',
    fontFamily: fontFamilies.sans,
  },
  selectCategorySearchBox: {
    marginTop: 12,
    minHeight: 56,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f5',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectCategorySearchIcon: {
    width: 18,
    height: 18,
  },
  selectCategorySearchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#162754',
    fontFamily: fontFamilies.sans,
    letterSpacing: -0.2,
    paddingVertical: 0,
  },
  selectCategoryList: {
    marginTop: 14,
    flex: 1,
  },
  selectCategoryListContent: {
    gap: 12,
    paddingBottom: 12,
  },
  selectCategoryRow: {
    minHeight: 96,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e6ebf6',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  selectCategoryBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCategoryBadgeImage: {
    width: '120%',
    height: '120%',
  },
  selectCategoryBadgeText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  selectCategoryName: {
    marginLeft: 12,
    marginRight: 10,
    flex: 1,
    fontSize: 20,
    lineHeight: 26,
    color: '#151f43',
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  selectCategoryRadioOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#a8b4d2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  selectCategoryRadioInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCategoryCheckmark: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  selectCategoryEmptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f5',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 4,
  },
  selectCategoryEmptyTitle: {
    fontSize: 19,
    lineHeight: 24,
    color: '#15224a',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  selectCategoryEmptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6a799d',
    fontFamily: fontFamilies.sans,
  },
  selectCategoryManageLink: {
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectCategoryManageLinkText: {
    color: '#687aa5',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fontFamilies.sans,
    fontWeight: '500',
  },
  selectCategorySaveButton: {
    minHeight: 72,
    borderRadius: radii.pill,
    backgroundColor: themeColors.income,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 4,
  },
  selectCategorySaveButtonDisabled: {
    backgroundColor: '#9ecbad',
    shadowOpacity: 0,
    elevation: 0,
  },
  selectCategorySaveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
});
