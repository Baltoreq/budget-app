import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, Pressable, SafeAreaView, ScrollView, StatusBar as RNStatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { budgetStore } from './store';
import { fontFamilies, radii, themeColors } from './theme';

const onboardingHero = require('./assets/onboarding-bg.png');
const logoMark = require('./assets/logo.png');
const incomeIcon = require('./assets/money-increase.png');
const expenseIcon = require('./assets/decline_chart.png');
const analyticsIcon = require('./assets/analytics_report.png');
const calendarIcon = require('./assets/calendar.png');
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

function HomeScreen({ onOpenOnboarding }) {
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
          <AppLink label="Otwórz onboarding" onPress={onOpenOnboarding} />
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

function DashboardScreen({ onBackHome }) {
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
          paddingBottom: 24,
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

        <Pressable accessibilityRole="button" style={styles.dashboardAddButton}>
          <View style={styles.dashboardAddButtonRow}>
            <Image source={addIcon} resizeMode="contain" style={styles.dashboardAddIcon} />
            <Text style={styles.dashboardAddButtonText}>Dodaj operację</Text>
          </View>
        </Pressable>

        <View style={styles.dashboardBottomNav}>
          <DashboardTabItem label="Dashboard" icon="⌂" active />
          <DashboardTabItem label="Operacje" icon="☰" />
          <DashboardTabItem label="Analizy" icon="◔" />
          <DashboardTabItem label="Więcej" icon="◼" />
        </View>

        <Pressable accessibilityRole="button" onPress={onBackHome} style={styles.dashboardBackButtonSecondary}>
          <Text style={styles.dashboardBackButtonText}>Powrót do ekranu startowego</Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function DashboardTabItem({ label, icon, active = false }) {
  return (
    <View style={styles.dashboardTabItem}>
      <Text style={[styles.dashboardTabIcon, { color: active ? '#16A34A' : '#94A3B8' }]}>{icon}</Text>
      <Text style={[styles.dashboardTabLabel, { color: active ? '#16A34A' : '#94A3B8' }]}>{label}</Text>
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

export default function App() {
  const [screen, setScreen] = useState('home');

  if (screen === 'home') {
    return <HomeScreen onOpenOnboarding={() => setScreen('onboarding')} />;
  }

  if (screen === 'onboarding') {
    return <OnboardingScreen onStartDashboard={() => setScreen('dashboard')} />;
  }

  return <DashboardScreen onBackHome={() => setScreen('home')} />;
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
  dashboardBottomNav: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dashboardTabItem: {
    alignItems: 'center',
  },
  dashboardTabIcon: {
    fontSize: 20,
    lineHeight: 22,
    fontFamily: fontFamilies.sans,
  },
  dashboardTabLabel: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
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
});
