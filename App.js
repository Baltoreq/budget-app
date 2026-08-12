import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File } from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Animated, Image, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar as RNStatusBar, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { budgetStore } from './store';
import { buildMonthAnalysis } from './domain/calculations/analysis';
import { createLocalizationBundle, detectPreferredCurrency, detectPreferredLanguage, supportedCurrencies, translateAppErrorMessage } from './lib/i18n';
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
const checkListIcon = require('./assets/check-list.png');
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
const growthChartIcon = require('./assets/growth-chart.png');
const helpMessageIcon = require('./assets/help-message.png');
const safeIcon = require('./assets/safe.png');
const warningIcon = require('./assets/warning.png');
const mainNavDashboardIcon = require('./assets/main-nav-dashboard.png');
const mainNavOperationsIcon = require('./assets/main-nav-operations.png');
const mainNavAnalyticsIcon = require('./assets/main-nav-analitycis.png');
const mainNavMoreIcon = require('./assets/main-nav-more.png');
const categoriesMenuIcon = require('./assets/categories.png');
const openingBalanceMenuIcon = require('./assets/opening balance.png');
const currencyMenuIcon = require('./assets/currency.png');
const languageMenuIcon = require('./assets/languages.png');
const themeMenuIcon = require('./assets/style.png');
const aboutMenuIcon = require('./assets/about.png');
const deleteMenuIcon = require('./assets/delete.png');

const ONBOARDING_STORAGE_KEY = '@homebudget/onboarding-shown';
const ONBOARDING_FILE_NAME = 'homebudget-onboarding-state.json';
const LANGUAGE_STORAGE_KEY = '@homebudget/language-code';
const LANGUAGE_FILE_NAME = 'homebudget-language-state.json';
const CURRENCY_STORAGE_KEY = '@homebudget/currency-code';
const CURRENCY_FILE_NAME = 'homebudget-currency-state.json';

const LocalizationContext = createContext(null);

function useLocalization() {
  const value = useContext(LocalizationContext);

  if (!value) {
    throw new Error('LocalizationContext is missing.');
  }

  return value;
}

function isSupportedCurrencyCode(value) {
  return typeof value === 'string' && supportedCurrencies.includes(value);
}

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

async function readLanguageState() {
  if (Platform.OS === 'web') {
    try {
      return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.warn('Unable to read language state from AsyncStorage', error);
      return null;
    }
  }

  try {
    const file = new File({
      uri: `${Directory.document.uri}${LANGUAGE_FILE_NAME}`,
      name: LANGUAGE_FILE_NAME,
      size: 0,
    });

    const exists = await file.exists;
    if (!exists) {
      return null;
    }

    const savedValue = await file.text();
    return savedValue === 'pl' || savedValue === 'en' ? savedValue : null;
  } catch (error) {
    try {
      const savedValue = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      return savedValue === 'pl' || savedValue === 'en' ? savedValue : null;
    } catch (storageError) {
      console.warn('Unable to read language state', storageError);
      return null;
    }
  }
}

async function writeLanguageState(languageCode) {
  if (Platform.OS === 'web') {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      return;
    } catch (error) {
      console.warn('Unable to persist language state via AsyncStorage', error);
      return;
    }
  }

  try {
    const file = new File({
      uri: `${Directory.document.uri}${LANGUAGE_FILE_NAME}`,
      name: LANGUAGE_FILE_NAME,
      size: 0,
    });

    await file.write(languageCode, { encoding: 'utf8' });
  } catch (error) {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    } catch (storageError) {
      console.warn('Unable to persist language state', storageError);
    }
  }
}

async function clearLanguageState() {
  if (Platform.OS === 'web') {
    try {
      await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.warn('Unable to clear language state from AsyncStorage', error);
    }

    return;
  }

  try {
    const file = new File({
      uri: `${Directory.document.uri}${LANGUAGE_FILE_NAME}`,
      name: LANGUAGE_FILE_NAME,
      size: 0,
    });

    await file.delete();
  } catch (error) {
    console.warn('Unable to clear language state file', error);
  }

  try {
    await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear language state from AsyncStorage', error);
  }
}

async function readCurrencyState() {
  if (Platform.OS === 'web') {
    try {
      const savedValue = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
      return isSupportedCurrencyCode(savedValue) ? savedValue : null;
    } catch (error) {
      console.warn('Unable to read currency state from AsyncStorage', error);
      return null;
    }
  }

  try {
    const file = new File({
      uri: `${Directory.document.uri}${CURRENCY_FILE_NAME}`,
      name: CURRENCY_FILE_NAME,
      size: 0,
    });

    const exists = await file.exists;
    if (!exists) {
      return null;
    }

    const savedValue = await file.text();
    return isSupportedCurrencyCode(savedValue) ? savedValue : null;
  } catch (error) {
    try {
      const savedValue = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
      return isSupportedCurrencyCode(savedValue) ? savedValue : null;
    } catch (storageError) {
      console.warn('Unable to read currency state', storageError);
      return null;
    }
  }
}

async function writeCurrencyState(currencyCode) {
  if (Platform.OS === 'web') {
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
      return;
    } catch (error) {
      console.warn('Unable to persist currency state via AsyncStorage', error);
      return;
    }
  }

  try {
    const file = new File({
      uri: `${Directory.document.uri}${CURRENCY_FILE_NAME}`,
      name: CURRENCY_FILE_NAME,
      size: 0,
    });

    await file.write(currencyCode, { encoding: 'utf8' });
  } catch (error) {
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
    } catch (storageError) {
      console.warn('Unable to persist currency state', storageError);
    }
  }
}

async function clearCurrencyState() {
  if (Platform.OS === 'web') {
    try {
      await AsyncStorage.removeItem(CURRENCY_STORAGE_KEY);
    } catch (error) {
      console.warn('Unable to clear currency state from AsyncStorage', error);
    }

    return;
  }

  try {
    const file = new File({
      uri: `${Directory.document.uri}${CURRENCY_FILE_NAME}`,
      name: CURRENCY_FILE_NAME,
      size: 0,
    });

    await file.delete();
  } catch (error) {
    console.warn('Unable to clear currency state file', error);
  }

  try {
    await AsyncStorage.removeItem(CURRENCY_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear currency state from AsyncStorage', error);
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

const calendarWeekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const mainTabs = [
  { key: 'dashboard', label: 'Dashboard', iconSource: mainNavDashboardIcon },
  { key: 'operations', label: 'Operations', iconSource: mainNavOperationsIcon },
  { key: 'analytics', label: 'Analytics', iconSource: mainNavAnalyticsIcon },
  { key: 'more', label: 'More', iconSource: mainNavMoreIcon },
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

  if (normalized === 'inne' || normalized === 'other') {
    return othersCategoryIcon;
  }

  if (normalized.includes('jedzenie') || normalized.includes('zakupy') || normalized.includes('food') || normalized.includes('groceries') || normalized.includes('shopping')) {
    return groceriesCategoryIcon;
  }

  if (normalized.includes('transport')) {
    return transportCategoryIcon;
  }

  if (normalized.includes('mieszkanie') || normalized.includes('czynsz') || normalized.includes('rent') || normalized.includes('housing') || normalized.includes('home')) {
    return rentCategoryIcon;
  }

  if (normalized.includes('rozrywka') || normalized.includes('entertainment')) {
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
    .replace(/\u0142/g, 'l');
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
  const { strings, formatters } = useLocalization();
  const { formatMinorCurrency } = formatters;

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
        <Text style={styles.dashboardDonutLabel}>{strings.common.total}</Text>
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

function formatTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

function getTodayDateOnly() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function buildSemiArcSegments(progressPercent, size) {
  const segmentCount = 24;
  const centerX = size / 2;
  const centerY = size / 2;
  const arcWidth = Math.max(8, Math.round(size * 0.062));
  const arcHeight = Math.max(16, Math.round(size * 0.145));
  const radius = (size / 2) - arcHeight + 8;
  const activeSegments = Math.round((Math.max(0, Math.min(progressPercent, 100)) / 100) * segmentCount);

  return Array.from({ length: segmentCount }, (_, index) => {
    const progress = index / (segmentCount - 1);
    const angle = Math.PI + (progress * Math.PI);
    const left = centerX + Math.cos(angle) * radius - (arcWidth / 2);
    const top = centerY + Math.sin(angle) * radius - (arcHeight / 2);

    return {
      key: `semi-${index}`,
      active: index < activeSegments,
      left,
      top,
      rotationDeg: `${((angle * 180) / Math.PI) + 90}deg`,
    };
  });
}

function AnalysisProgressArc({ progressPercent, size }) {
  const segments = useMemo(() => buildSemiArcSegments(progressPercent, size), [progressPercent, size]);

  return (
    <View style={[styles.analysisArcWrap, { width: size, height: Math.round(size * 0.58) }]}>
      {segments.map((segment) => (
        <View
          key={segment.key}
          style={[
            styles.analysisArcSegment,
            {
              backgroundColor: segment.active ? '#22C76A' : '#E4E8F0',
              width: Math.max(8, Math.round(size * 0.062)),
              height: Math.max(16, Math.round(size * 0.145)),
              left: segment.left,
              top: segment.top,
              transform: [{ rotate: segment.rotationDeg }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function AnalysisSummaryCard({ iconSource, label, value, valueColor, iconWrapStyle, deltaLabel, deltaColor, comparisonLabel }) {
  return (
    <View style={styles.analysisSummaryCard}>
      <View style={[styles.dashboardMetricIconWrap, iconWrapStyle, styles.analysisSummaryDashboardIconWrap]}>
        <Image source={iconSource} resizeMode="contain" style={styles.dashboardMetricIconImage} />
      </View>
      <Text style={[styles.dashboardMetricLabel, styles.analysisSummaryDashboardLabel]} numberOfLines={2}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.dashboardMetricValue, styles.analysisSummaryDashboardValue, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.analysisSummaryDelta, { color: deltaColor }]}>{deltaLabel}</Text>
      <Text style={styles.analysisSummaryComparison}>{comparisonLabel}</Text>
    </View>
  );
}

function AnalysisInsightRow({ iconSource, iconBackgroundColor, iconTintColor, title, summary, toneLabel, toneBackgroundStyle, toneTextStyle, cardStyle, onPress }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.analysisInsightRow, cardStyle, pressed && styles.analysisInsightRowPressed]} onPress={onPress}>
      <View style={styles.analysisInsightRowLeft}>
        <View style={[styles.analysisInsightIconWrap, { backgroundColor: iconBackgroundColor }]}> 
          <Image source={iconSource} resizeMode="contain" style={[styles.analysisInsightIconImage, iconTintColor ? { tintColor: iconTintColor } : null]} />
        </View>

        <View style={styles.analysisInsightTextWrap}>
          <Text style={styles.analysisInsightTitle}>{title}</Text>
          <Text style={styles.analysisInsightSummary}>{summary}</Text>
        </View>
      </View>

      <View style={styles.analysisInsightRowRight}>
        <View style={[styles.analysisInsightTonePill, toneBackgroundStyle]}>
          <Text style={[styles.analysisInsightToneText, toneTextStyle]}>{toneLabel}</Text>
        </View>
        <Text style={styles.analysisInsightChevron}>›</Text>
      </View>
    </Pressable>
  );
}

function AnalysisStatCard({ iconSource, iconTintColor, iconBackgroundColor, label, value, subtitle, cardStyle, onPress }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.analysisStatCard, cardStyle, pressed && styles.analysisStatCardPressed]} onPress={onPress}>
      <View style={[styles.analysisStatIconWrap, { backgroundColor: iconBackgroundColor }]}> 
        <Image source={iconSource} resizeMode="contain" style={[styles.analysisStatIconImage, iconTintColor ? { tintColor: iconTintColor } : null]} />
      </View>
      <Text numberOfLines={3} style={styles.analysisStatLabel}>{label}</Text>
      <Text numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.analysisStatValue}>{value}</Text>
      <Text style={styles.analysisStatSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function AnalysisTrendChart({ points, formatMonthLabel, incomeLabel, expenseLabel }) {
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.totalIncomeMinor, point.totalExpenseMinor]));

  return (
    <View style={styles.analysisTrendChartWrap}>
      <View style={styles.analysisTrendLegendRow}>
        <View style={styles.analysisTrendLegendItem}>
          <View style={[styles.analysisTrendLegendDot, { backgroundColor: '#22C76A' }]} />
          <Text style={styles.analysisTrendLegendText}>{incomeLabel}</Text>
        </View>

        <View style={styles.analysisTrendLegendItem}>
          <View style={[styles.analysisTrendLegendDot, { backgroundColor: '#FF4D5E' }]} />
          <Text style={styles.analysisTrendLegendText}>{expenseLabel}</Text>
        </View>
      </View>

      <View style={styles.analysisTrendBarsRow}>
        {points.map((point) => {
          const incomeHeight = Math.max(12, Math.round((point.totalIncomeMinor / maxValue) * 104));
          const expenseHeight = Math.max(12, Math.round((point.totalExpenseMinor / maxValue) * 104));
          const monthLabel = formatMonthLabel(point.month).slice(0, 3);

          return (
            <View key={point.month} style={styles.analysisTrendMonthGroup}>
              <View style={styles.analysisTrendBarPair}>
                <View style={[styles.analysisTrendBar, styles.analysisTrendBarIncome, { height: incomeHeight }]} />
                <View style={[styles.analysisTrendBar, styles.analysisTrendBarExpense, { height: expenseHeight }]} />
              </View>
              <Text style={styles.analysisTrendMonthLabel}>{monthLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AnalysisDetailModal({ detail, onClose, strings }) {
  const eyebrow = detail?.eyebrow ?? (detail?.kind === 'insight' ? strings.analytics.detail.insightLabel : strings.analytics.detail.statisticLabel);

  return (
    <Modal visible={detail !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.analysisDetailOverlay}>
        <Pressable style={styles.analysisDetailBackdrop} onPress={onClose} />

        <View style={styles.analysisDetailCard}>
          <Text style={styles.analysisDetailEyebrow}>{eyebrow}</Text>
          <Text style={styles.analysisDetailTitle}>{detail?.title}</Text>
          {detail?.summary ? <Text style={styles.analysisDetailSummary}>{detail.summary}</Text> : null}

          {detail?.detail ? (
            <View style={styles.analysisDetailSection}>
              <Text style={styles.analysisDetailSectionLabel}>{strings.analytics.detail.conclusionLabel}</Text>
              <Text style={styles.analysisDetailSectionBody}>{detail.detail}</Text>
            </View>
          ) : null}

          {detail?.recommendation ? (
            <View style={styles.analysisDetailSection}>
              <Text style={styles.analysisDetailSectionLabel}>{strings.analytics.detail.recommendationLabel}</Text>
              <Text style={styles.analysisDetailSectionBody}>{detail.recommendation}</Text>
            </View>
          ) : null}

          <Pressable accessibilityRole="button" style={styles.analysisDetailCloseButton} onPress={onClose}>
            <Text style={styles.analysisDetailCloseButtonText}>{strings.analytics.detail.closeButton}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function resolveInsightVisuals(tone, strings) {
  if (tone === 'warning') {
    return {
      iconSource: warningIcon,
      iconBackgroundColor: '#FFF1F2',
      iconTintColor: '#FF4D5E',
      toneLabel: strings.analytics.tags.warning,
      toneBackgroundStyle: {
        backgroundColor: '#FFF1F2',
      },
      toneTextStyle: { color: '#FF4D5E' },
      cardStyle: {
        backgroundColor: '#FFF8F8',
        borderColor: '#FFE1E6',
      },
    };
  }

  if (tone === 'positive') {
    return {
      iconSource: safeIcon,
      iconBackgroundColor: '#EAFBF1',
      iconTintColor: '#22C76A',
      toneLabel: strings.analytics.tags.positive,
      toneBackgroundStyle: {
        backgroundColor: '#EAFBF1',
      },
      toneTextStyle: { color: '#22C76A' },
      cardStyle: {
        backgroundColor: '#F5FCF7',
        borderColor: '#DDF5E5',
      },
    };
  }

  return {
    iconSource: helpMessageIcon,
    iconBackgroundColor: '#EEF5FF',
    iconTintColor: '#3B82F6',
    toneLabel: strings.analytics.tags.neutral,
    toneBackgroundStyle: {
      backgroundColor: '#EEF5FF',
    },
    toneTextStyle: { color: '#3B82F6' },
    cardStyle: {
      backgroundColor: '#F7FAFF',
      borderColor: '#DFEBFF',
    },
  };
}

function buildInsightPresentation(insight, strings, formatters) {
  const { formatMinorCurrency, formatMonthLabel } = formatters;

  if (insight.kind === 'expenseIncrease') {
    return {
      title: formatTemplate(strings.analytics.templates.expenseIncreaseTitle, {
        month: formatMonthLabel(insight.previousMonth),
      }),
      summary: formatTemplate(strings.analytics.templates.expenseIncreaseSummary, {
        amount: formatMinorCurrency(insight.amountMinor),
        percent: `${insight.percentValue}%`,
      }),
      recommendation: strings.analytics.templates.expenseIncreaseRecommendation,
    };
  }

  if (insight.kind === 'incomeIncrease') {
    return {
      title: formatTemplate(strings.analytics.templates.incomeIncreaseTitle, {
        month: formatMonthLabel(insight.previousMonth),
      }),
      summary: formatTemplate(strings.analytics.templates.incomeIncreaseSummary, {
        amount: formatMinorCurrency(insight.amountMinor),
        percent: `${insight.percentValue}%`,
      }),
      recommendation: strings.analytics.templates.incomeIncreaseRecommendation,
    };
  }

  if (insight.kind === 'topCategoryShare') {
    return {
      title: formatTemplate(strings.analytics.templates.topCategoryShareTitle, {
        category: insight.categoryName,
      }),
      summary: formatTemplate(strings.analytics.templates.topCategoryShareSummary, {
        percent: `${insight.sharePercent}%`,
        amount: formatMinorCurrency(insight.amountMinor),
      }),
      recommendation: strings.analytics.templates.topCategoryShareRecommendation,
    };
  }

  if (insight.kind === 'healthyBalance') {
    return {
      title: strings.analytics.templates.healthyBalanceTitle,
      summary: formatTemplate(strings.analytics.templates.healthyBalanceSummary, {
        amount: formatMinorCurrency(insight.amountMinor),
        percent: `${insight.percentValue}%`,
      }),
      recommendation: strings.analytics.templates.healthyBalanceRecommendation,
    };
  }

  return {
    title: strings.analytics.templates.budgetPressureTitle,
    summary: formatTemplate(strings.analytics.templates.budgetPressureSummary, {
      amount: formatMinorCurrency(insight.projectedBalanceMinor),
      daily: formatMinorCurrency(insight.safeDailyBudgetMinor),
    }),
    recommendation: strings.analytics.templates.budgetPressureRecommendation,
  };
}

function buildStatisticPresentation(kind, model, strings, formatters) {
  const { formatMinorCurrency, formatMonthLabel, formatOperationDate } = formatters;

  if (kind === 'mostExpensiveDay') {
    if (!model.statistics.mostExpensiveDay) {
      return {
        title: strings.analytics.stats.mostExpensiveDay,
        summary: strings.analytics.emptyStatisticValue,
        detail: strings.analytics.emptyStatisticValue,
        recommendation: strings.analytics.templates.mostExpensiveDayRecommendation,
      };
    }

    const detail = formatTemplate(strings.analytics.templates.mostExpensiveDaySummary, {
      date: formatOperationDate(model.statistics.mostExpensiveDay.date),
      amount: formatMinorCurrency(model.statistics.mostExpensiveDay.amountMinor),
    });

    return {
      title: strings.analytics.stats.mostExpensiveDay,
      summary: detail,
      detail,
      recommendation: strings.analytics.templates.mostExpensiveDayRecommendation,
    };
  }

  if (kind === 'noSpendDays') {
    const detail = formatTemplate(strings.analytics.templates.noSpendDaysSummary, {
      count: String(model.statistics.noSpendDays),
      month: formatMonthLabel(model.selectedMonth),
    });

    return {
      title: strings.analytics.stats.noSpendDays,
      summary: detail,
      detail,
      recommendation: strings.analytics.templates.noSpendDaysRecommendation,
    };
  }

  if (kind === 'averageExpense') {
    const detail = formatTemplate(strings.analytics.templates.averageExpenseSummary, {
      amount: formatMinorCurrency(model.statistics.averageExpenseMinor),
      count: String(model.statistics.expenseCount),
    });

    return {
      title: strings.analytics.stats.averageExpense,
      summary: detail,
      detail,
      recommendation: strings.analytics.templates.averageExpenseRecommendation,
    };
  }

  const detail = formatTemplate(strings.analytics.templates.operationCountSummary, {
    count: String(model.statistics.operationCount),
    incomeCount: String(model.statistics.incomeCount),
    expenseCount: String(model.statistics.expenseCount),
  });

  return {
    title: strings.analytics.stats.operationCount,
    summary: detail,
    detail,
    recommendation: strings.analytics.templates.operationCountRecommendation,
  };
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

function formatOperationCount(count) {
  return count === 1 ? '1 operacja' : `${count} operacji`;
}

const operationTypeFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
];

const operationSortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'amountAsc', label: 'Amount ascending' },
  { value: 'amountDesc', label: 'Amount descending' },
];

function resolveOperationRowIcon(transaction, category) {
  if (transaction.type === 'income') {
    return incomeMetricIcon;
  }

  return resolveCategoryIconFromKey(category?.icon) ?? resolveCategoryIcon(category?.name ?? '') ?? outcomeMetricIcon;
}

function OperationsMetric({ label, value, valueColor }) {
  return (
    <View style={styles.operationsMetricItem}>
      <Text style={styles.operationsMetricLabel}>{label}</Text>
      <Text style={[styles.operationsMetricValue, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.76}>
        {value}
      </Text>
    </View>
  );
}

function OperationTypeChip({ label, active, onPress }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.operationsTypeChip, active && styles.operationsTypeChipActive]} onPress={onPress}>
      <Text style={[styles.operationsTypeChipText, active && styles.operationsTypeChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function OperationChoiceRow({ label, active, onPress }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.operationsChoiceRow, active && styles.operationsChoiceRowActive]} onPress={onPress}>
      <Text style={[styles.operationsChoiceRowText, active && styles.operationsChoiceRowTextActive]}>{label}</Text>
      {active ? <Text style={styles.operationsChoiceRowCheck}>✓</Text> : null}
    </Pressable>
  );
}

function OperationsScreen({ onOpenAddTransaction, onOpenEditTransaction, dataVersion }) {
  const { strings, formatters } = useLocalization();
  const {
    formatMinorCurrency,
    formatSignedMinorCurrency,
    formatMonthLabel,
    formatOperationDate,
    formatOperationCount,
    normalizeSearchValue,
  } = formatters;

  const operationTypeFilterOptions = useMemo(
    () => [
      { value: 'all', label: strings.operations.typeFilters.all },
      { value: 'income', label: strings.operations.typeFilters.income },
      { value: 'expense', label: strings.operations.typeFilters.expense },
    ],
    [strings],
  );

  const operationSortOptions = useMemo(
    () => [
      { value: 'newest', label: strings.operations.sortOptions.newest },
      { value: 'oldest', label: strings.operations.sortOptions.oldest },
      { value: 'amountAsc', label: strings.operations.sortOptions.amountAsc },
      { value: 'amountDesc', label: strings.operations.sortOptions.amountDesc },
    ],
    [strings],
  );

  const operationsData = useMemo(() => {
    const budgets = budgetStore.getMonthlyBudgets();
    const transactions = budgetStore.getTransactions();
    const categoriesById = new Map(budgetStore.getCategories().map((category) => [category.id, category]));
    const budgetsByMonth = new Map(budgets.map((budget) => [budget.month, budget]));
    const availableMonths = budgets.map((budget) => budget.month);

    return {
      budgetsByMonth,
      categoriesById,
      availableMonths,
      latestMonth: availableMonths[availableMonths.length - 1] ?? null,
      transactionCountByMonth: transactions.reduce((accumulator, transaction) => {
        accumulator[transaction.assignedMonth] = (accumulator[transaction.assignedMonth] ?? 0) + 1;
        return accumulator;
      }, {}),
    };
  }, [dataVersion]);

  const [selectedMonth, setSelectedMonth] = useState(() => operationsData.latestMonth);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchInput, setSearchInput] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  useEffect(() => {
    if (!operationsData.latestMonth) {
      setSelectedMonth(null);
      return;
    }

    if (!selectedMonth || !operationsData.availableMonths.includes(selectedMonth)) {
      setSelectedMonth(operationsData.latestMonth);
    }
  }, [operationsData.availableMonths, operationsData.latestMonth, selectedMonth]);

  const selectedBudget = selectedMonth ? operationsData.budgetsByMonth.get(selectedMonth) ?? null : null;
  const monthTransactions = useMemo(() => {
    if (!selectedMonth) {
      return [];
    }

    const selectedType = typeFilter === 'all' ? undefined : typeFilter;
    const normalizedQuery = normalizeSearchValue(searchInput);
    const baseTransactions = budgetStore.getTransactions({ month: selectedMonth, type: selectedType }, sortOrder);

    return baseTransactions
      .filter((transaction) => {
        if (!normalizedQuery) {
          return true;
        }

        const category = operationsData.categoriesById.get(transaction.categoryId);
        const haystack = [
          transaction.description,
          category?.name,
          transaction.type === 'income' ? strings.operations.transactionIncome : strings.operations.transactionExpense,
          formatOperationDate(transaction.operationDate),
          formatMonthLabel(transaction.assignedMonth),
        ]
          .filter(Boolean)
          .join(' ');

        return normalizeSearchValue(haystack).includes(normalizedQuery);
      })
      .map((transaction) => ({
        transaction,
        category: operationsData.categoriesById.get(transaction.categoryId) ?? null,
      }));
  }, [formatMonthLabel, formatOperationDate, normalizeSearchValue, operationsData.categoriesById, searchInput, selectedMonth, sortOrder, strings.operations.transactionExpense, strings.operations.transactionIncome, typeFilter]);

  const monthTransactionCount = selectedMonth ? (operationsData.transactionCountByMonth[selectedMonth] ?? 0) : 0;

  if (!operationsData.latestMonth || !selectedBudget || !selectedMonth) {
    return (
      <SafeAreaView style={styles.operationsEmptyScreen}>
        <View style={styles.operationsEmptyGlowTop} />
        <View style={styles.operationsEmptyCard}>
          <Text style={styles.operationsEmptyTitle}>{strings.operations.emptyTitle}</Text>
          <Text style={styles.operationsEmptyText}>{strings.operations.emptyText}</Text>
          <Pressable accessibilityRole="button" style={styles.operationsAddButton} onPress={onOpenAddTransaction}>
            <View style={styles.operationsAddButtonRow}>
              <Image source={addIcon} resizeMode="contain" style={styles.operationsAddIcon} />
              <Text style={styles.operationsAddButtonText}>{strings.operations.addOperation}</Text>
            </View>
          </Pressable>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.operationsScreen}>
      <View style={styles.operationsGlowLeft} />
      <View style={styles.operationsGlowRight} />

      <ScrollView
        style={styles.operationsScroll}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 68,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.operationsTopRow}>
          <View style={styles.operationsMonthSelectorWrap}>
            <Pressable accessibilityRole="button" style={styles.operationsMonthSelectorButton} onPress={() => setIsMonthDropdownOpen((open) => !open)}>
              <Text style={styles.operationsMonthText}>{formatMonthLabel(selectedMonth)}</Text>
              <Text style={styles.operationsMonthChevron}>{isMonthDropdownOpen ? '▲' : '▼'}</Text>
            </Pressable>

            {isMonthDropdownOpen ? (
              <View style={styles.operationsMonthDropdown}>
                {operationsData.availableMonths.map((month) => {
                  const isActive = month === selectedMonth;

                  return (
                    <Pressable
                      key={month}
                      accessibilityRole="button"
                      style={[styles.operationsMonthOption, isActive && styles.operationsMonthOptionActive]}
                      onPress={() => {
                        setSelectedMonth(month);
                        setIsMonthDropdownOpen(false);
                      }}
                    >
                      <Text style={[styles.operationsMonthOptionText, isActive && styles.operationsMonthOptionTextActive]}>{formatMonthLabel(month)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View style={styles.operationsActionGroup}>
            <Pressable accessibilityRole="button" accessibilityLabel={strings.operations.filterButton} hitSlop={8} style={styles.operationsActionButton} onPress={() => setIsFilterModalOpen(true)}>
              <Text style={styles.operationsActionIcon}>≡</Text>
              <Text style={styles.operationsActionLabel}>{strings.operations.filterButton}</Text>
            </Pressable>

            <Pressable accessibilityRole="button" accessibilityLabel={strings.operations.sortButton} hitSlop={8} style={styles.operationsActionButton} onPress={() => setIsSortModalOpen(true)}>
              <Text style={styles.operationsActionIcon}>↕</Text>
              <Text style={styles.operationsActionLabel}>{strings.operations.sortButton}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.operationsTitle}>{strings.operations.title}</Text>

        <View style={styles.operationsSearchBox}>
          <Image source={searchIcon} resizeMode="contain" style={styles.operationsSearchIcon} />
          <TextInput
            style={styles.operationsSearchInput}
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder={strings.operations.searchPlaceholder}
            placeholderTextColor="#8c99b6"
            accessibilityLabel={strings.operations.searchLabel}
          />
        </View>

        <View style={styles.operationsTypeRow}>
          {operationTypeFilterOptions.map((option) => (
            <OperationTypeChip
              key={option.value}
              label={option.label}
              active={typeFilter === option.value}
              onPress={() => setTypeFilter(option.value)}
            />
          ))}
        </View>

        <View style={styles.operationsSummaryCard}>
          <View style={styles.operationsSummaryHeader}>
            <View style={styles.operationsSummaryMonthBlock}>
              <View style={styles.operationsSummaryIconWrap}>
                <Image source={checkListIcon} resizeMode="contain" style={styles.operationsSummaryIcon} />
              </View>
              <View style={styles.operationsSummaryMonthTextWrap}>
                <Text style={styles.operationsSummaryCount}>{formatOperationCount(monthTransactionCount)}</Text>
                <Text style={styles.operationsSummaryMonth}>{formatMonthLabel(selectedMonth)}</Text>
              </View>
            </View>

            <View style={styles.operationsSummaryMetricsRow}>
                  <OperationsMetric label={strings.operations.incomeMetric} value={formatMinorCurrency(selectedBudget.totalIncomeMinor)} valueColor={themeColors.income} />
              <View style={styles.operationsSummaryMetricDivider} />
                  <OperationsMetric label={strings.operations.expenseMetric} value={formatMinorCurrency(selectedBudget.totalExpenseMinor)} valueColor={themeColors.expense} />
              <View style={styles.operationsSummaryMetricDivider} />
              <OperationsMetric
                    label={strings.operations.balanceMetric}
                value={formatSignedMinorCurrency(selectedBudget.monthlyResultMinor)}
                valueColor={selectedBudget.monthlyResultMinor >= 0 ? themeColors.income : themeColors.expense}
              />
            </View>
          </View>
        </View>

        <View style={styles.operationsListCard}>
          {monthTransactions.length === 0 ? (
            <View style={styles.operationsEmptyListState}>
              <Text style={styles.operationsEmptyListTitle}>{strings.operations.noResultsTitle}</Text>
              <Text style={styles.operationsEmptyListText}>{strings.operations.noResultsText}</Text>
            </View>
          ) : (
            monthTransactions.map(({ transaction, category }) => {
              const isIncome = transaction.type === 'income';
              const rowIcon = resolveOperationRowIcon(transaction, category);
              const rowColor = category?.color ?? (isIncome ? themeColors.income : themeColors.expense);

              return (
                <Pressable
                  key={transaction.id}
                  accessibilityRole="button"
                  style={styles.operationsRow}
                  onPress={() => onOpenEditTransaction(transaction.id)}
                >
                  <View style={styles.operationsRowLeft}>
                    <View style={[styles.operationsRowIconWrap, { backgroundColor: isIncome ? themeColors.incomeSoft : categoryPillBackground(rowColor) }]}>
                      <Image source={rowIcon} resizeMode="contain" style={styles.operationsRowIcon} />
                    </View>

                    <View style={styles.operationsRowTextWrap}>
                      <Text style={styles.operationsRowTitle} numberOfLines={1}>
                        {transaction.description || category?.name || strings.operations.operationFallback}
                      </Text>
                      <Text style={styles.operationsRowSubtitle} numberOfLines={1}>
                        {isIncome ? strings.operations.transactionIncome : strings.operations.transactionExpense} • {formatOperationDate(transaction.operationDate)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.operationsRowAmount, { color: isIncome ? themeColors.income : themeColors.expense }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                    {formatSignedMinorCurrency(isIncome ? transaction.amountMinor : -transaction.amountMinor)}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel={strings.operations.addOperation} style={styles.operationsAddButton} onPress={onOpenAddTransaction}>
          <View style={styles.operationsAddButtonRow}>
            <Image source={addIcon} resizeMode="contain" style={styles.operationsAddIcon} />
            <Text style={styles.operationsAddButtonText}>{strings.operations.addOperation}</Text>
          </View>
        </Pressable>
      </ScrollView>

      <Modal visible={isFilterModalOpen} transparent animationType="fade" onRequestClose={() => setIsFilterModalOpen(false)}>
        <View style={styles.operationsModalOverlay}>
          <Pressable style={styles.operationsModalBackdrop} onPress={() => setIsFilterModalOpen(false)} />

          <View style={styles.operationsModalCard}>
            <Text style={styles.operationsModalTitle}>{strings.operations.filterModalTitle}</Text>
            <Text style={styles.operationsModalSubtitle}>{strings.operations.filterModalSubtitle}</Text>

            <View style={styles.operationsModalChoices}>
              {operationTypeFilterOptions.map((option) => (
                <OperationChoiceRow
                  key={option.value}
                  label={option.label}
                  active={typeFilter === option.value}
                  onPress={() => setTypeFilter(option.value)}
                />
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              style={styles.operationsModalResetButton}
              onPress={() => {
                setTypeFilter('all');
                setSearchInput('');
              }}
            >
              <Text style={styles.operationsModalResetButtonText}>{strings.operations.clearFilters}</Text>
            </Pressable>

            <Pressable accessibilityRole="button" style={styles.operationsModalCloseButton} onPress={() => setIsFilterModalOpen(false)}>
              <Text style={styles.operationsModalCloseButtonText}>{strings.common.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={isSortModalOpen} transparent animationType="fade" onRequestClose={() => setIsSortModalOpen(false)}>
        <View style={styles.operationsModalOverlay}>
          <Pressable style={styles.operationsModalBackdrop} onPress={() => setIsSortModalOpen(false)} />

          <View style={styles.operationsModalCard}>
            <Text style={styles.operationsModalTitle}>{strings.operations.sortModalTitle}</Text>
            <Text style={styles.operationsModalSubtitle}>{strings.operations.sortModalSubtitle}</Text>

            <View style={styles.operationsModalChoices}>
              {operationSortOptions.map((option) => (
                <OperationChoiceRow
                  key={option.value}
                  label={option.label}
                  active={sortOrder === option.value}
                  onPress={() => setSortOrder(option.value)}
                />
              ))}
            </View>

            <Pressable accessibilityRole="button" style={styles.operationsModalCloseButton} onPress={() => setIsSortModalOpen(false)}>
              <Text style={styles.operationsModalCloseButtonText}>{strings.common.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
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

function parseDateOnlyToLocalDate(dateOnly) {
  const [year, month, day] = dateOnly.split('-').map((value) => Number(value));
  return new Date(year, month - 1, day);
}

function toDateOnlyString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const { strings } = useLocalization();

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
            <Text style={styles.homeBrandTagline}>{strings.home.tagline}</Text>
          </View>
        </View>

        <View style={styles.homeCard}>
          <Text style={styles.homeCardTitle}>{strings.home.cardTitle}</Text>
          <Text style={styles.homeCardText}>{strings.home.cardText}</Text>
          <AppLink label={strings.home.openApp} onPress={onOpenOnboarding} />
          <AppLink label={strings.home.clearStorage} onPress={onClearStorage} />
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
  const { strings, formatters } = useLocalization();
  const { formatMinorCurrency, formatSignedMinorCurrency, formatMonthLabel, formatOperationDate } = formatters;

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
          name: category?.name ?? strings.common.other,
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
        name: strings.common.other,
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
  }, [dashboardData, selectedMonth, strings.common.other, visibleExpenseCategoryLimit]);

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
        <Text style={styles.dashboardEmptyTitle}>{strings.dashboard.noBudgetData}</Text>
        <Text style={styles.dashboardEmptyText}>{strings.dashboard.noBudgetDataText}</Text>
        <Pressable accessibilityRole="button" onPress={onBackHome} style={styles.dashboardBackButton}>
          <Text style={styles.dashboardBackButtonText}>{strings.dashboard.backButton}</Text>
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
            <Text style={styles.dashboardMainCardLabel}>{strings.dashboard.monthBalance}</Text>
          </View>
          <View style={styles.dashboardMainCardRow}>
            <Text style={styles.dashboardMainCardValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.64}>{formatSignedMinorCurrency(model.monthSummary.monthlyResultMinor)}</Text>
          </View>
        </View>

        <View style={styles.dashboardMetricsGrid}>
          <DashboardMetricCard
            iconSource={openingBalanceMetricIcon}
            iconWrapStyle={styles.dashboardMetricIconInfo}
            label={strings.dashboard.openingBalance}
            value={formatMinorCurrency(model.monthSummary.openingBalanceMinor)}
            valueColor="#1b2445"
          />
          <DashboardMetricCard
            iconSource={incomeMetricIcon}
            iconWrapStyle={styles.dashboardMetricIconIncome}
            label={strings.dashboard.totalIncome}
            value={formatMinorCurrency(model.monthSummary.totalIncomeMinor)}
            valueColor="#16A34A"
          />
          <DashboardMetricCard
            iconSource={outcomeMetricIcon}
            iconWrapStyle={styles.dashboardMetricIconExpense}
            label={strings.dashboard.totalExpense}
            value={formatMinorCurrency(model.monthSummary.totalExpenseMinor)}
            valueColor="#DC2626"
          />
          <DashboardMetricCard
            iconSource={balanceMetricIcon}
            iconWrapStyle={styles.dashboardMetricIconWarning}
            label={strings.dashboard.closingBalance}
            value={formatMinorCurrency(model.monthSummary.closingBalanceMinor)}
            valueColor="#1b2445"
          />
        </View>

        <View style={styles.dashboardSectionCard}>
          <View style={[styles.dashboardSectionHeader, styles.dashboardSectionHeaderTopAligned]}>
            <View style={styles.dashboardSectionHeaderLeft}>
              <Text style={styles.dashboardSectionTitle}>{strings.dashboard.expensesByCategory}</Text>
              <Text style={styles.dashboardSectionSubtitle}>{formatMinorCurrency(model.monthSummary.totalExpenseMinor)} {strings.dashboard.expensesTotalSuffix}</Text>
            </View>
            {hasMoreExpenseCategories ? (
              <Pressable
                accessibilityRole="button"
                style={styles.dashboardSeeAllPill}
                onPress={() => setShowAllExpenseCategories((current) => !current)}
              >
                <Text style={styles.dashboardSeeAllPillText}>{showAllExpenseCategories ? strings.dashboard.showLess : strings.dashboard.showAll}</Text>
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
                <Text style={styles.dashboardEmptyBreakdownText}>{strings.dashboard.noExpenses}</Text>
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
            <Text style={styles.dashboardSectionTitle}>{strings.dashboard.recentTransactions}</Text>
            {hasMoreTransactions ? (
              <Pressable
                accessibilityRole="button"
                style={styles.dashboardSeeAllPill}
                onPress={() => setShowAllRecentTransactions((current) => !current)}
              >
                <Text style={styles.dashboardSeeAllPillText}>{showAllRecentTransactions ? strings.dashboard.showLess : strings.dashboard.showAll}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.dashboardTransactionsList}>
            {visibleRecentTransactions.length === 0 ? (
              <Text style={styles.dashboardEmptyBreakdownText}>{strings.dashboard.noTransactions}</Text>
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
                        <Text style={styles.dashboardTransactionTitle}>{tx.description || tx.category?.name || strings.dashboard.operationFallback}</Text>
                        <Text style={styles.dashboardTransactionSubtitle}>
                          {isIncome ? strings.dashboard.transactionIncome : strings.dashboard.transactionExpense} • {formatOperationDate(tx.operationDate)}
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

        <Pressable accessibilityRole="button" accessibilityLabel={strings.dashboard.addOperation} style={styles.dashboardAddButton} onPress={onOpenAddTransaction}>
          <View style={styles.dashboardAddButtonRow}>
            <Image source={addIcon} resizeMode="contain" style={styles.dashboardAddIcon} />
            <Text style={styles.dashboardAddButtonText}>{strings.dashboard.addOperation}</Text>
          </View>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={onBackHome} style={styles.dashboardBackButtonSecondary}>
          <Text style={styles.dashboardBackButtonText}>{strings.dashboard.backToHome}</Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function AnalysisScreen({ dataVersion }) {
  const { strings, formatters } = useLocalization();
  const { formatMinorCurrency, formatSignedMinorCurrency, formatMonthLabel, formatOperationDate } = formatters;
  const { width } = useWindowDimensions();
  const isCompactScreen = width < 430;
  const isNarrowScreen = width < 390;
  const isVeryNarrowScreen = width < 360;
  const arcSize = isCompactScreen ? 176 : 164;

  const analyticsData = useMemo(() => {
    const budgets = budgetStore.getMonthlyBudgets();

    return {
      budgets,
      transactions: budgetStore.getTransactions(),
      categories: budgetStore.getCategories(),
      availableMonths: budgets.map((budget) => budget.month),
      latestMonth: budgets[budgets.length - 1]?.month ?? null,
    };
  }, [dataVersion]);

  const [selectedMonth, setSelectedMonth] = useState(() => analyticsData.latestMonth);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    if (!analyticsData.latestMonth) {
      setSelectedMonth(null);
      return;
    }

    if (!selectedMonth || !analyticsData.availableMonths.includes(selectedMonth)) {
      setSelectedMonth(analyticsData.latestMonth);
    }
  }, [analyticsData.availableMonths, analyticsData.latestMonth, selectedMonth]);

  const model = useMemo(() => {
    if (!selectedMonth) {
      return null;
    }

    return buildMonthAnalysis({
      selectedMonth,
      budgets: analyticsData.budgets,
      transactions: analyticsData.transactions,
      categories: analyticsData.categories,
      todayDate: getTodayDateOnly(),
    });
  }, [analyticsData.budgets, analyticsData.categories, analyticsData.transactions, selectedMonth]);

  const selectedMonthIndex = selectedMonth ? analyticsData.availableMonths.findIndex((month) => month === selectedMonth) : -1;
  const canGoPrevious = selectedMonthIndex > 0;
  const canGoNext = selectedMonthIndex >= 0 && selectedMonthIndex < analyticsData.availableMonths.length - 1;
  const visibleInsights = model ? (showAllInsights ? model.insights : model.insights.slice(0, 3)) : [];
  const categorySegments = useMemo(
    () => buildDonutSegments(model?.categoryBreakdown ?? [], model?.summary.totalExpenseMinor ?? 0),
    [model],
  );

  if (!model) {
    return (
      <SafeAreaView style={styles.placeholderScreen}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>{strings.analytics.noDataTitle}</Text>
          <Text style={styles.placeholderSubtitle}>{strings.analytics.noDataText}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const previousMonthLabel = model.previousMonth ? formatMonthLabel(model.previousMonth) : null;
  const handleOpenMonthPicker = () => {
    setIsMonthDropdownOpen(true);
  };
  const handleOpenCategoryDetails = () => {
    const detailLines = model.categoryBreakdown.map((entry) => `${entry.name}: ${formatMinorCurrency(entry.amountMinor)} (${entry.sharePercent}%)`);

    setSelectedDetail({
      kind: 'statistic',
      eyebrow: strings.analytics.expenseCategoriesTitle,
      title: strings.analytics.expenseCategoriesTitle,
      summary: `${formatMinorCurrency(model.summary.totalExpenseMinor)} ${strings.common.total}`,
      detail: detailLines.join('\n'),
      recommendation: model.categoryBreakdown[0]
        ? strings.analytics.templates.categoryBreakdownRecommendation
        : strings.dashboard.noExpenses,
    });
  };
  const handleOpenTrendDetails = () => {
    const detailLines = model.trends.map((point) => (
      `${formatMonthLabel(point.month)}: ${strings.analytics.summary.income} ${formatMinorCurrency(point.totalIncomeMinor)}, ${strings.analytics.summary.expense} ${formatMinorCurrency(point.totalExpenseMinor)}, ${strings.analytics.summary.balance} ${formatSignedMinorCurrency(point.monthlyResultMinor)}`
    ));

    setSelectedDetail({
      kind: 'statistic',
      eyebrow: strings.analytics.incomeExpenseTrendsTitle,
      title: strings.analytics.incomeExpenseTrendsTitle,
      summary: `${formatMonthLabel(model.trends[0]?.month ?? model.selectedMonth)} - ${formatMonthLabel(model.trends[model.trends.length - 1]?.month ?? model.selectedMonth)}`,
      detail: detailLines.join('\n'),
      recommendation: strings.analytics.templates.trendRecommendation,
    });
  };
  const handleOpenForecastInfo = () => {
    setSelectedDetail({
      kind: 'statistic',
      eyebrow: strings.analytics.forecastTitle,
      title: strings.analytics.forecastTitle,
      summary: `${strings.analytics.projectedExpenses}: ${formatMinorCurrency(model.forecast.projectedExpenseMinor)}\n${strings.analytics.projectedBalance}: ${formatSignedMinorCurrency(model.forecast.projectedBalanceMinor)}\n${strings.analytics.safePerDay}: ${formatMinorCurrency(model.forecast.safeDailyBudgetMinor)}`,
      detail: strings.analytics.templates.forecastSummary,
      recommendation: strings.analytics.templates.forecastRecommendation,
    });
  };
  const summaryCards = [
    {
      key: 'income',
      iconSource: incomeMetricIcon,
      iconWrapStyle: styles.dashboardMetricIconIncome,
      label: strings.analytics.summary.income,
      value: formatMinorCurrency(model.summary.totalIncomeMinor),
      valueColor: '#16A34A',
      delta: model.incomeDelta,
    },
    {
      key: 'expense',
      iconSource: outcomeMetricIcon,
      iconWrapStyle: styles.dashboardMetricIconExpense,
      label: strings.analytics.summary.expense,
      value: formatMinorCurrency(model.summary.totalExpenseMinor),
      valueColor: '#DC2626',
      delta: model.expenseDelta,
    },
    {
      key: 'balance',
      iconSource: balanceMetricIcon,
      iconWrapStyle: styles.dashboardMetricIconWarning,
      label: strings.analytics.summary.balance,
      value: formatSignedMinorCurrency(model.summary.monthlyResultMinor),
      valueColor: '#1b2445',
      delta: model.balanceDelta,
    },
  ];

  const statsCards = [
    {
      key: 'mostExpensiveDay',
      iconSource: calendarIcon,
      iconBackgroundColor: '#F3EDFF',
      iconTintColor: '#8B5CF6',
      label: strings.analytics.stats.mostExpensiveDay,
      value: model.statistics.mostExpensiveDay ? formatOperationDate(model.statistics.mostExpensiveDay.date) : strings.analytics.emptyStatisticShort,
      subtitle: model.statistics.mostExpensiveDay ? formatMinorCurrency(model.statistics.mostExpensiveDay.amountMinor) : strings.analytics.emptyStatisticValue,
    },
    {
      key: 'noSpendDays',
      iconSource: warningIcon,
      iconBackgroundColor: '#FFF5E8',
      iconTintColor: '#F59E0B',
      label: strings.analytics.stats.noSpendDays,
      value: String(model.statistics.noSpendDays),
      subtitle: strings.analytics.stats.days,
    },
    {
      key: 'averageExpense',
      iconSource: checkListIcon,
      iconBackgroundColor: '#EEF5FF',
      iconTintColor: '#60A5FA',
      label: strings.analytics.stats.averageExpense,
      value: formatMinorCurrency(model.statistics.averageExpenseMinor),
      subtitle: strings.analytics.stats.perOperation,
    },
    {
      key: 'operationCount',
      iconSource: growthChartIcon,
      iconBackgroundColor: '#EAFBF1',
      iconTintColor: '#22C76A',
      label: strings.analytics.stats.operationCount,
      value: String(model.statistics.operationCount),
      subtitle: strings.analytics.stats.inMonth,
    },
  ];

  return (
    <SafeAreaView style={styles.analysisScreen}>
      <View style={styles.analysisGlowLeft} />
      <View style={styles.analysisGlowRight} />

      <ScrollView contentContainerStyle={[styles.analysisScrollContent, isCompactScreen && styles.analysisScrollContentCompact]} showsVerticalScrollIndicator={false}>
        <View style={styles.analysisHeaderRow}>
          <Text style={styles.analysisScreenTitle}>{strings.analytics.title}</Text>

          <Pressable accessibilityRole="button" accessibilityLabel={strings.common.select} style={styles.analysisHeaderCalendarButton} onPress={handleOpenMonthPicker}>
            <Image source={calendarIcon} resizeMode="contain" style={styles.analysisHeaderCalendarIcon} />
          </Pressable>
        </View>

        <View style={styles.analysisMonthPickerWrap}>
          <Pressable
            accessibilityRole="button"
            disabled={!canGoPrevious}
            style={[styles.analysisMonthArrowButton, !canGoPrevious && styles.analysisMonthArrowButtonDisabled]}
            onPress={() => {
              if (!canGoPrevious) {
                return;
              }

              const previousMonth = analyticsData.availableMonths[selectedMonthIndex - 1];
              setSelectedMonth(previousMonth);
              setShowAllInsights(false);
            }}
          >
            <Image source={backArrowIcon} resizeMode="contain" style={styles.analysisMonthArrowIcon} />
          </Pressable>

          <View style={styles.analysisMonthDropdownWrap}>
            <Pressable accessibilityRole="button" style={styles.analysisMonthDropdownButton} onPress={() => setIsMonthDropdownOpen((value) => !value)}>
              <Image source={calendarIcon} resizeMode="contain" style={styles.analysisMonthDropdownIcon} />
              <Text style={styles.analysisMonthDropdownText}>{formatMonthLabel(model.selectedMonth)}</Text>
              <Text style={styles.analysisMonthDropdownChevron}>{isMonthDropdownOpen ? '▲' : '▼'}</Text>
            </Pressable>

            {isMonthDropdownOpen ? (
              <View style={styles.analysisMonthDropdownMenu}>
                {analyticsData.availableMonths.map((month) => {
                  const isActive = month === selectedMonth;

                  return (
                    <Pressable
                      key={month}
                      accessibilityRole="button"
                      style={[styles.analysisMonthDropdownOption, isActive && styles.analysisMonthDropdownOptionActive]}
                      onPress={() => {
                        setSelectedMonth(month);
                        setIsMonthDropdownOpen(false);
                        setShowAllInsights(false);
                      }}
                    >
                      <Text style={[styles.analysisMonthDropdownOptionText, isActive && styles.analysisMonthDropdownOptionTextActive]}>{formatMonthLabel(month)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canGoNext}
            style={[styles.analysisMonthArrowButton, !canGoNext && styles.analysisMonthArrowButtonDisabled]}
            onPress={() => {
              if (!canGoNext) {
                return;
              }

              const nextMonth = analyticsData.availableMonths[selectedMonthIndex + 1];
              setSelectedMonth(nextMonth);
              setShowAllInsights(false);
            }}
          >
            <Image source={backArrowIcon} resizeMode="contain" style={[styles.analysisMonthArrowIcon, styles.analysisMonthArrowIconRight]} />
          </Pressable>
        </View>

        <View style={[styles.analysisSummaryPanel, isCompactScreen && styles.analysisSummaryPanelCompact]}>
          {summaryCards.map((card, index) => {
            const hasDelta = card.delta.amountMinor !== null;
            const deltaLabel = hasDelta
              ? `${formatSignedMinorCurrency(card.delta.amountMinor)}${card.delta.percentChange !== null ? ` (${card.delta.percentChange > 0 ? '+' : ''}${card.delta.percentChange}%)` : ''}`
              : strings.analytics.noComparison;
            const deltaColor = hasDelta
              ? (card.delta.favorable ? '#22C76A' : '#FF4D5E')
              : '#22C76A';
            const comparisonLabel = previousMonthLabel ? `${strings.analytics.versusPrevious} ${previousMonthLabel}` : strings.analytics.noComparison;

            return (
              <View key={card.key} style={[styles.analysisSummaryPanelColumn, index < summaryCards.length - 1 && styles.analysisSummaryPanelColumnDivider, isCompactScreen && styles.analysisSummaryPanelColumnCompact]}>
                <AnalysisSummaryCard
                  iconSource={card.iconSource}
                  iconWrapStyle={card.iconWrapStyle}
                  label={card.label}
                  value={card.value}
                  valueColor={card.valueColor}
                  deltaLabel={deltaLabel}
                  deltaColor={deltaColor}
                  comparisonLabel={comparisonLabel}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.analysisInsightsHeader}>
          <Text style={styles.analysisSectionTitle}>{strings.analytics.insightsTitle}</Text>
          {model.insights.length > 3 ? (
            <Pressable accessibilityRole="button" onPress={() => setShowAllInsights((value) => !value)}>
              <Text style={styles.analysisHeaderAction}>{showAllInsights ? strings.common.showLess : strings.common.showAll}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.analysisInsightsList}>
          {visibleInsights.map((insight) => {
            const visuals = resolveInsightVisuals(insight.tone, strings);
            const presentation = buildInsightPresentation(insight, strings, formatters);

            return (
              <AnalysisInsightRow
                key={insight.id}
                iconSource={visuals.iconSource}
                iconBackgroundColor={visuals.iconBackgroundColor}
                iconTintColor={visuals.iconTintColor}
                title={presentation.title}
                summary={presentation.summary}
                toneLabel={visuals.toneLabel}
                toneBackgroundStyle={visuals.toneBackgroundStyle}
                toneTextStyle={visuals.toneTextStyle}
                cardStyle={visuals.cardStyle}
                onPress={() => setSelectedDetail({
                  kind: 'insight',
                  title: presentation.title,
                  summary: presentation.summary,
                  detail: presentation.summary,
                  recommendation: presentation.recommendation,
                })}
              />
            );
          })}
        </View>

        <View style={[styles.analysisForecastRow, isCompactScreen && styles.analysisForecastRowCompact]}>
          <View style={[styles.analysisPaceCard, isCompactScreen && styles.analysisPaceCardCompact]}>
            <View style={[styles.analysisPaceGaugeArea, { height: Math.round(arcSize * 0.56) }]}>
              <AnalysisProgressArc progressPercent={model.forecast.spentIncomePercent} size={arcSize} />
              <View style={[styles.analysisPaceCenterContent, { top: Math.round(arcSize * 0.18) }]}>
                <Text style={styles.analysisPacePercentValue}>{model.forecast.spentIncomePercent}%</Text>
                <Text style={styles.analysisPacePercentLabel}>{strings.analytics.paceUsedIncomeLabel}</Text>
              </View>
            </View>
            <Text style={styles.analysisPaceFootnote}>
              {model.forecast.daysRemaining > 0
                ? formatTemplate(strings.analytics.remainingDaysTemplate, { count: String(model.forecast.daysRemaining) })
                : strings.analytics.remainingDaysClosed}
            </Text>
            <View style={styles.analysisPaceProgressTrack}>
              <View style={[styles.analysisPaceProgressFill, { width: `${Math.min(model.forecast.spentIncomePercent, 100)}%` }]} />
            </View>
          </View>

          <View style={[styles.analysisForecastCard, isCompactScreen && styles.analysisForecastCardCompact]}>
            <View style={styles.analysisForecastTitleRow}>
              <Text style={styles.analysisForecastTitle}>{strings.analytics.forecastTitle}</Text>
              <Pressable accessibilityRole="button" style={styles.analysisForecastInfoWrap} onPress={handleOpenForecastInfo}>
                <Text style={styles.analysisForecastInfoIcon}>i</Text>
              </Pressable>
            </View>

            <View style={styles.analysisForecastList}>
              <View style={styles.analysisForecastItemRow}>
                <View style={styles.analysisForecastItemLeft}>
                  <View style={[styles.analysisForecastItemIconWrap, { backgroundColor: '#FFF1F2' }]}>
                    <Image source={growthChartIcon} resizeMode="contain" style={[styles.analysisForecastItemIconImage, { tintColor: '#FF4D5E' }]} />
                  </View>
                  <Text style={styles.analysisForecastItemLabel}>{strings.analytics.projectedExpenses}</Text>
                </View>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={[styles.analysisForecastItemValue, { color: '#FF4D5E' }]}>{formatMinorCurrency(model.forecast.projectedExpenseMinor)}</Text>
              </View>

              <View style={styles.analysisForecastItemRow}>
                <View style={styles.analysisForecastItemLeft}>
                  <View style={[styles.analysisForecastItemIconWrap, { backgroundColor: '#EEF5FF' }]}>
                    <Image source={walletIcon} resizeMode="contain" style={[styles.analysisForecastItemIconImage, { tintColor: '#60A5FA' }]} />
                  </View>
                  <Text style={styles.analysisForecastItemLabel}>{strings.analytics.projectedBalance}</Text>
                </View>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={[styles.analysisForecastItemValue, { color: model.forecast.projectedBalanceMinor >= 0 ? '#22C76A' : '#FF4D5E' }]}>{formatSignedMinorCurrency(model.forecast.projectedBalanceMinor)}</Text>
              </View>

              <View style={styles.analysisForecastItemRow}>
                <View style={styles.analysisForecastItemLeft}>
                  <View style={[styles.analysisForecastItemIconWrap, { backgroundColor: '#EEF4FF' }]}>
                    <Image source={safeIcon} resizeMode="contain" style={[styles.analysisForecastItemIconImage, { tintColor: '#3B82F6' }]} />
                  </View>
                  <Text style={styles.analysisForecastItemLabel}>{strings.analytics.safePerDay}</Text>
                </View>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={[styles.analysisForecastItemValue, { color: '#3B82F6' }]}>{formatMinorCurrency(model.forecast.safeDailyBudgetMinor)}</Text>
              </View>
            </View>

            <Text style={styles.analysisForecastCaption}>{model.forecast.daysRemaining > 0 ? strings.analytics.forecastSubtitle : strings.analytics.forecastClosedSubtitle}</Text>
          </View>
        </View>

        <View style={[styles.analysisChartsRow, isCompactScreen && styles.analysisChartsRowCompact]}>
          <View style={[styles.analysisChartCard, isCompactScreen && styles.analysisChartCardCompact]}>
            <Text style={styles.analysisSectionTitle}>{strings.analytics.expenseCategoriesTitle}</Text>

            <View style={styles.analysisCategoryCardBody}>
              <View style={styles.analysisCategoryDonutWrap}>
                <DashboardDonutChart totalAmountMinor={model.summary.totalExpenseMinor} segments={categorySegments} />
              </View>

              <View style={styles.analysisCategoryBreakdownList}>
                {model.categoryBreakdown.length === 0 ? (
                  <Text style={styles.analysisCategoryEmptyText}>{strings.dashboard.noExpenses}</Text>
                ) : model.categoryBreakdown.slice(0, 5).map((entry) => (
                  <View key={entry.categoryId} style={styles.analysisCategoryBreakdownRow}>
                    <View style={styles.analysisCategoryBreakdownLeft}>
                      <View style={[styles.analysisCategoryColorDot, { backgroundColor: entry.color }]} />
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.analysisCategoryBreakdownName}>{entry.name}</Text>
                    </View>
                    <View style={styles.analysisCategoryBreakdownRight}>
                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={styles.analysisCategoryBreakdownValue}>{formatMinorCurrency(entry.amountMinor)}</Text>
                      <Text style={styles.analysisCategoryBreakdownPercent}>{entry.sharePercent}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <Pressable accessibilityRole="button" style={styles.analysisChartActionButton} onPress={handleOpenCategoryDetails}>
              <Text style={styles.analysisChartAction}>{strings.common.showAll}</Text>
            </Pressable>
          </View>

          <View style={[styles.analysisChartCard, isCompactScreen && styles.analysisChartCardCompact]}>
            <Text style={styles.analysisSectionTitle}>{strings.analytics.incomeExpenseTrendsTitle}</Text>
            <AnalysisTrendChart
              points={model.trends}
              formatMonthLabel={formatMonthLabel}
              incomeLabel={strings.analytics.summary.income}
              expenseLabel={strings.analytics.summary.expense}
            />
            <Pressable accessibilityRole="button" style={styles.analysisChartActionButton} onPress={handleOpenTrendDetails}>
              <Text style={styles.analysisChartAction}>{strings.analytics.trendAction}</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.analysisStatsGrid, isCompactScreen && styles.analysisStatsGridCompact]}>
          {statsCards.map((card) => {
            const presentation = buildStatisticPresentation(card.key, model, strings, formatters);

            return (
              <AnalysisStatCard
                key={card.key}
                iconSource={card.iconSource}
                iconBackgroundColor={card.iconBackgroundColor}
                iconTintColor={card.iconTintColor}
                label={card.label}
                value={card.value}
                subtitle={card.subtitle}
                cardStyle={isCompactScreen ? styles.analysisStatCardCompactLayout : null}
                onPress={() => setSelectedDetail({
                  kind: 'statistic',
                  title: presentation.title,
                  summary: presentation.summary,
                  detail: presentation.detail,
                  recommendation: presentation.recommendation,
                })}
              />
            );
          })}
        </View>
      </ScrollView>

      <AnalysisDetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} strings={strings} />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function AddTransactionScreen({ onBack, onSave, mode = 'create', transaction = null, onDelete }) {
  const { strings, formatters, language } = useLocalization();
  const {
    formatOperationDateWithWeekday,
    formatOperationMonthFromDate,
    formatAmountInput,
    calendarWeekdayLabels,
    normalizeSearchValue,
    currencySymbol,
  } = formatters;

  const addTxScrollRef = useRef(null);
  const isEditMode = mode === 'edit';
  const [type, setType] = useState(() => transaction?.type ?? 'income');
  const [operationDate, setOperationDate] = useState(() => (transaction ? parseDateOnlyToLocalDate(transaction.operationDate) : new Date()));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewMonth, setCalendarViewMonth] = useState(() => new Date(operationDate.getFullYear(), operationDate.getMonth(), 1));
  const [amountInput, setAmountInput] = useState(() => formatAmountInput(transaction?.amountMinor ?? 0));
  const [descriptionInput, setDescriptionInput] = useState(() => transaction?.description ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => transaction?.categoryId ?? budgetStore.getCategories('income')[0]?.id ?? null);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [categoryDraftId, setCategoryDraftId] = useState(null);
  const [categorySearchInput, setCategorySearchInput] = useState('');
  const [isCategorySearchFocused, setIsCategorySearchFocused] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
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
  const categorySearchQuery = useMemo(() => normalizeSearchValue(categorySearchInput), [categorySearchInput, normalizeSearchValue]);
  const visibleCategories = useMemo(() => {
    if (!categorySearchQuery) {
      return categoriesForType;
    }

    return categoriesForType.filter((category) => normalizeSearchValue(category.name).includes(categorySearchQuery));
  }, [categoriesForType, categorySearchQuery, normalizeSearchValue]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    if (!transaction) {
      return;
    }

    setType(transaction.type);
    setOperationDate(parseDateOnlyToLocalDate(transaction.operationDate));
    setCalendarViewMonth(new Date(parseDateOnlyToLocalDate(transaction.operationDate).getFullYear(), parseDateOnlyToLocalDate(transaction.operationDate).getMonth(), 1));
    setAmountInput(formatAmountInput(transaction.amountMinor));
    setDescriptionInput(transaction.description ?? '');
    setSelectedCategoryId(transaction.categoryId);
  }, [formatAmountInput, isEditMode, transaction]);

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

  const handleSave = () => {
    if (amountMinor === null || amountMinor <= 0) {
      setSaveError(strings.validation.amountGreaterThanZero);
      return;
    }

    if (!selectedCategoryId) {
      setSaveError(strings.validation.selectCategory);
      return;
    }

    setSaveError('');

    try {
      const payload = {
        amountMinor,
        operationDate: toDateOnlyString(operationDate),
        categoryId: selectedCategoryId,
        description: descriptionInput,
      };

      if (isEditMode) {
        onSave(payload);
        return;
      }

      onSave({
        type,
        ...payload,
      });
    } catch (error) {
      setSaveError(translateAppErrorMessage(language, error));
    }
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
          <View style={styles.addTxHeaderRow}>
            <Pressable accessibilityRole="button" accessibilityLabel={strings.addTransaction.backLabel} style={styles.addTxBackButton} onPress={onBack}>
              <Image source={backArrowIcon} resizeMode="cover" style={styles.addTxBackButtonImage} />
            </Pressable>

            {isEditMode ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.addTransaction.deleteIconLabel}
                style={styles.addTxDeleteIconButton}
                onPress={() => setIsDeleteConfirmOpen(true)}
              >
                <Text style={styles.addTxDeleteIconButtonText}>{strings.common.delete}</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.addTxTitle}>{isEditMode ? strings.addTransaction.editTitle : strings.addTransaction.createTitle}</Text>

          {isEditMode ? (
            <View style={styles.addTxEditTypePillWrap}>
              <View style={[styles.addTxEditTypePill, isIncome ? styles.addTxEditTypePillIncome : styles.addTxEditTypePillExpense]}>
                <Text style={[styles.addTxEditTypePillArrow, isIncome ? styles.addTxEditTypePillArrowIncome : styles.addTxEditTypePillArrowExpense]}>
                  ↗
                </Text>
                <Text style={[styles.addTxEditTypePillText, isIncome ? styles.addTxEditTypePillTextIncome : styles.addTxEditTypePillTextExpense]}>
                  {isIncome ? strings.addTransaction.typeIncome : strings.addTransaction.typeExpense}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.addTxTypeSegment}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isIncome }}
                style={[styles.addTxTypeButton, isIncome && styles.addTxTypeButtonIncomeActive]}
                onPress={() => setType('income')}
              >
                <Image source={incomeMetricIcon} resizeMode="contain" style={styles.addTxTypeIconImage} />
                <Text style={[styles.addTxTypeText, isIncome && styles.addTxTypeTextIncome]}>{strings.addTransaction.typeIncome}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !isIncome }}
                style={[styles.addTxTypeButton, !isIncome && styles.addTxTypeButtonExpenseActive]}
                onPress={() => setType('expense')}
              >
                <Image source={outcomeMetricIcon} resizeMode="contain" style={styles.addTxTypeIconImage} />
                <Text style={[styles.addTxTypeText, !isIncome && styles.addTxTypeTextExpense]}>{strings.addTransaction.typeExpense}</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.addTxCard}>
            <Text style={styles.addTxFieldLabel}>{strings.addTransaction.amountLabel}</Text>
            <View style={styles.addTxAmountInputRow}>
              <TextInput
                style={styles.addTxAmountInput}
                value={amountInput}
                onChangeText={(text) => {
                  setAmountInput(normalizeAmountInput(text));
                  if (saveError) {
                    setSaveError('');
                  }
                }}
                keyboardType="decimal-pad"
                placeholder={strings.addTransaction.amountPlaceholder}
                placeholderTextColor={themeColors.textMuted}
                accessibilityLabel={strings.addTransaction.amountLabel}
              />
              <Text style={styles.addTxAmountCurrency}>{currencySymbol}</Text>
            </View>
            {amountHasError ? <Text style={styles.addTxErrorText}>{strings.addTransaction.amountError}</Text> : null}
          </View>

          <Pressable accessibilityRole="button" style={styles.addTxCard} onPress={openCalendar}>
            <Text style={styles.addTxFieldLabel}>{strings.addTransaction.dateLabel}</Text>
            <View style={styles.addTxInlineValueRow}>
              <Image source={calendarIcon} resizeMode="contain" style={styles.addTxInlineImageIcon} />
              <Text style={styles.addTxInlineValue}>{formatOperationDateWithWeekday(operationDate)}</Text>
            </View>
          </Pressable>

          <View style={[styles.addTxCard, styles.addTxCardDisabled]}>
            <Text style={[styles.addTxFieldLabel, styles.addTxFieldLabelDisabled]}>{strings.addTransaction.monthLabel}</Text>
            <View style={styles.addTxInlineValueRowReadOnly}>
              <Text style={[styles.addTxInlineValue, styles.addTxInlineValueDisabled]}>{formatOperationMonthFromDate(operationDate)}</Text>
            </View>
          </View>

          <Pressable accessibilityRole="button" style={styles.addTxCard} onPress={openCategoryPicker}>
            <Text style={styles.addTxFieldLabel}>{strings.addTransaction.categoryLabel}</Text>
            <View style={styles.addTxCategoryRow}>
              <View style={[styles.addTxCategoryBadge, { backgroundColor: categoryPillBackground(categoryAccentColor) }]}>
                {selectedCategoryIcon ? (
                  <Image source={selectedCategoryIcon} resizeMode="contain" style={styles.addTxCategoryBadgeImage} />
                ) : (
                  <Text style={[styles.addTxCategoryBadgeIcon, { color: categoryAccentColor }]}>{selectedCategory ? categoryShortLabel(selectedCategory.name) : '?'}</Text>
                )}
              </View>
              <Text style={styles.addTxCategoryText}>{selectedCategory?.name ?? strings.addTransaction.categoryPlaceholder}</Text>
              <Text style={styles.addTxCategoryChevron}>›</Text>
            </View>
          </Pressable>

          <View style={styles.addTxCard}>
            <Text style={styles.addTxFieldLabel}>{strings.addTransaction.descriptionLabel}</Text>
            <View style={styles.addTxDescriptionBox}>
              <TextInput
                style={styles.addTxDescriptionInput}
                placeholder={strings.addTransaction.descriptionPlaceholder}
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

          {saveError ? <Text style={styles.addTxErrorText}>{saveError}</Text> : null}

          <View style={styles.addTxInfoCard}>
            <Text style={styles.addTxInfoIcon}>◌</Text>
            <View style={styles.addTxInfoContent}>
              <Text style={styles.addTxInfoTitle}>{strings.addTransaction.infoTitle}</Text>
              <Text style={styles.addTxInfoText}>{strings.addTransaction.infoText}</Text>
            </View>
          </View>

          <Pressable accessibilityRole="button" style={styles.addTxSaveButton} onPress={handleSave}>
            <Text style={styles.addTxSaveButtonText}>{isEditMode ? strings.addTransaction.saveChanges : strings.addTransaction.saveOperation}</Text>
          </Pressable>

          {isEditMode ? (
            <Pressable accessibilityRole="button" style={styles.addTxDeleteButton} onPress={() => setIsDeleteConfirmOpen(true)}>
              <Text style={styles.addTxDeleteButtonText}>{strings.addTransaction.deleteOperation}</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isCalendarOpen} transparent animationType="fade" onRequestClose={() => setIsCalendarOpen(false)}>
        <View style={styles.calendarModalOverlay}>
          <Pressable style={styles.calendarModalBackdrop} onPress={() => setIsCalendarOpen(false)} />

          <View style={styles.calendarModalCard}>
            <View style={styles.calendarModalHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.addTransaction.calendarPrevMonth}
                style={styles.calendarNavButton}
                onPress={() => setCalendarViewMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              >
                <Text style={styles.calendarNavButtonText}>‹</Text>
              </Pressable>

              <Text style={styles.calendarModalHeaderTitle}>{calendarMonthLabel}</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.addTransaction.calendarNextMonth}
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
              <Text style={styles.calendarCloseButtonText}>{strings.addTransaction.calendarCancel}</Text>
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
              accessibilityLabel={strings.addTransaction.backLabel}
              style={styles.selectCategoryBackButton}
              onPress={() => setIsCategoryPickerOpen(false)}
            >
              <Image source={backArrowIcon} resizeMode="cover" style={styles.addTxBackButtonImage} />
            </Pressable>

            <Text style={styles.selectCategoryTitle}>{strings.addTransaction.selectCategoryTitle}</Text>

            <View style={styles.selectCategoryTypePillWrap}>
              <View style={[styles.selectCategoryTypePill, isIncome ? styles.selectCategoryTypePillIncome : styles.selectCategoryTypePillExpense]}>
                <Text style={[styles.selectCategoryTypePillArrow, isIncome ? styles.selectCategoryTypePillArrowIncome : styles.selectCategoryTypePillArrowExpense]}>
                  ↗
                </Text>
                <Text style={[styles.selectCategoryTypePillText, isIncome ? styles.selectCategoryTypePillTextIncome : styles.selectCategoryTypePillTextExpense]}>
                  {isIncome ? strings.addTransaction.typeIncome : strings.addTransaction.typeExpense}
                </Text>
              </View>
            </View>

            <Text style={styles.selectCategoryHint}>{strings.addTransaction.selectCategoryTypeHint}</Text>

            <View style={styles.selectCategorySearchBox}>
              <Image source={searchIcon} resizeMode="contain" style={styles.selectCategorySearchIcon} />
              <TextInput
                style={styles.selectCategorySearchInput}
                value={categorySearchInput}
                onChangeText={setCategorySearchInput}
                onFocus={() => setIsCategorySearchFocused(true)}
                onBlur={() => setIsCategorySearchFocused(false)}
                placeholder={strings.addTransaction.selectCategorySearchPlaceholder}
                placeholderTextColor="#8c99b6"
                accessibilityLabel={strings.addTransaction.selectCategorySearchLabel}
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
                  <Text style={styles.selectCategoryEmptyTitle}>{strings.addTransaction.selectCategoryEmptyTitle}</Text>
                  <Text style={styles.selectCategoryEmptyText}>{strings.addTransaction.selectCategoryEmptyText}</Text>
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
                  <Text style={styles.selectCategoryManageLinkText}>{strings.addTransaction.selectCategoryManageLink}</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={[styles.selectCategorySaveButton, categoryDraftId === null && styles.selectCategorySaveButtonDisabled]}
                  onPress={saveCategorySelection}
                  disabled={categoryDraftId === null}
                >
                  <Text style={styles.selectCategorySaveButtonText}>{strings.addTransaction.selectCategorySaveButton}</Text>
                </Pressable>
              </>
            ) : null}
          </View>

          <StatusBar style="dark" />
        </SafeAreaView>
      </Modal>

      <Modal visible={isDeleteConfirmOpen} transparent animationType="fade" onRequestClose={() => setIsDeleteConfirmOpen(false)}>
        <View style={styles.addTxConfirmOverlay}>
          <Pressable style={styles.addTxConfirmBackdrop} onPress={() => setIsDeleteConfirmOpen(false)} />

          <View style={styles.addTxConfirmCard}>
            <Text style={styles.addTxConfirmTitle}>{strings.addTransaction.deleteConfirmationTitle}</Text>
            <Text style={styles.addTxConfirmText}>{strings.addTransaction.deleteConfirmationText}</Text>

            <View style={styles.addTxConfirmActions}>
              <Pressable accessibilityRole="button" style={styles.addTxConfirmCancelButton} onPress={() => setIsDeleteConfirmOpen(false)}>
                <Text style={styles.addTxConfirmCancelButtonText}>{strings.addTransaction.deleteConfirmationCancel}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={styles.addTxConfirmDeleteButton}
                onPress={() => {
                  setIsDeleteConfirmOpen(false);
                  onDelete?.();
                }}
              >
                <Text style={styles.addTxConfirmDeleteButtonText}>{strings.addTransaction.deleteConfirmationConfirm}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function PlaceholderTabScreen({ title }) {
  const { strings } = useLocalization();

  return (
    <SafeAreaView style={styles.placeholderScreen}>
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderSubtitle}>{strings.more.placeholderFallback}</Text>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function MoreMenuRow({ iconSource, iconBackgroundColor, title, subtitle, value, onPress, isLast = false, destructive = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.moreRow,
        !isLast && styles.moreRowWithDivider,
        pressed && styles.moreRowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.moreRowLeft}>
        <View style={[styles.moreRowIconWrap, { backgroundColor: iconBackgroundColor }]}>
          <Image source={iconSource} resizeMode="contain" style={styles.moreRowIconImage} />
        </View>

        <View style={styles.moreRowTextWrap}>
          <Text style={[styles.moreRowTitle, destructive && styles.moreRowTitleDestructive]}>{title}</Text>
          {subtitle ? <Text style={styles.moreRowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.moreRowRight}>
        {value ? <Text style={styles.moreRowValue}>{value}</Text> : null}
        <Text style={[styles.moreRowChevron, destructive && styles.moreRowChevronDestructive]}>›</Text>
      </View>
    </Pressable>
  );
}

function MoreScreen() {
  const { strings, language, setLanguage, currencyCode, setCurrency } = useLocalization();
  const [themeMode, setThemeMode] = useState('light');
  const [activeSelector, setActiveSelector] = useState(null);
  const [placeholderEntry, setPlaceholderEntry] = useState(null);

  const handleCurrencySelection = (nextCurrencyCode) => {
    if (nextCurrencyCode === currencyCode) {
      setActiveSelector(null);
      return;
    }

    const hasFinancialData = budgetStore.getTransactions().length > 0 || budgetStore.getOpeningBalanceOverrides().length > 0;

    if (!hasFinancialData) {
      setCurrency(nextCurrencyCode);
      setActiveSelector(null);
      return;
    }

    Alert.alert(
      strings.more.currencyChangeWarningTitle,
      strings.more.currencyChangeWarningText,
      [
        {
          text: strings.common.cancel,
          style: 'cancel',
        },
        {
          text: strings.more.currencyChangeWarningConfirm,
          onPress: () => {
            setCurrency(nextCurrencyCode);
            setActiveSelector(null);
          },
        },
      ],
      { cancelable: true },
    );
  };

  const activeSelectorConfig = useMemo(() => {
    if (activeSelector === 'currency') {
      return {
        title: strings.more.modalTitles.currency,
        selectedValue: currencyCode,
        options: [
          { value: 'PLN', label: strings.currencies.PLN },
          { value: 'EUR', label: strings.currencies.EUR },
          { value: 'USD', label: strings.currencies.USD },
        ],
        onSelect: handleCurrencySelection,
      };
    }

    if (activeSelector === 'language') {
      return {
        title: strings.more.modalTitles.language,
        selectedValue: language,
        options: [
          { value: 'pl', label: strings.languages.pl },
          { value: 'en', label: strings.languages.en },
        ],
        onSelect: setLanguage,
      };
    }

    if (activeSelector === 'theme') {
      return {
        title: strings.more.modalTitles.theme,
        selectedValue: themeMode,
        options: [{ value: 'light', label: strings.themes.light }],
        onSelect: setThemeMode,
      };
    }

    return null;
  }, [activeSelector, currencyCode, handleCurrencySelection, language, setLanguage, strings, themeMode]);

  return (
    <SafeAreaView style={styles.moreScreen}>
      <View style={styles.moreGlowTop} />
      <View style={styles.moreGlowBottom} />

      <ScrollView
        style={styles.moreScroll}
        contentContainerStyle={styles.moreScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.moreHeader}>
          <Text style={styles.moreTitle}>{strings.more.title}</Text>
          <Text style={styles.moreSubtitle}>{strings.more.subtitle}</Text>
        </View>

        <View style={styles.moreSectionCard}>
          <Text style={styles.moreSectionTitle}>{strings.more.sections.budget}</Text>
          <MoreMenuRow
            iconSource={categoriesMenuIcon}
            iconBackgroundColor="#E9F9EF"
            title={strings.more.items.categories}
            subtitle={strings.more.subtitles.categories}
            onPress={() => setPlaceholderEntry('categories')}
          />
          <MoreMenuRow
            iconSource={openingBalanceMenuIcon}
            iconBackgroundColor="#E8F1FF"
            title={strings.more.items.openingBalance}
            subtitle={strings.more.subtitles.openingBalance}
            onPress={() => setPlaceholderEntry('openingBalance')}
            isLast
          />
        </View>

        <View style={styles.moreSectionCard}>
          <Text style={styles.moreSectionTitle}>{strings.more.sections.settings}</Text>
          <MoreMenuRow
            iconSource={currencyMenuIcon}
            iconBackgroundColor="#E9F9EF"
            title={strings.more.items.currency}
            value={currencyCode}
            onPress={() => setActiveSelector('currency')}
          />
          <MoreMenuRow
            iconSource={languageMenuIcon}
            iconBackgroundColor="#E8F1FF"
            title={strings.more.items.language}
            value={strings.languages[language]}
            onPress={() => setActiveSelector('language')}
          />
          <MoreMenuRow
            iconSource={themeMenuIcon}
            iconBackgroundColor="#FFF4E6"
            title={strings.more.items.theme}
            value={strings.themes[themeMode]}
            onPress={() => setActiveSelector('theme')}
            isLast
          />
        </View>

        <View style={styles.moreSectionCard}>
          <Text style={styles.moreSectionTitle}>{strings.more.sections.appData}</Text>
          <MoreMenuRow
            iconSource={deleteMenuIcon}
            iconBackgroundColor="#FEECEC"
            title={strings.more.items.deleteAll}
            subtitle={strings.more.subtitles.deleteAll}
            destructive
            onPress={() => setPlaceholderEntry('deleteAll')}
            isLast
          />
        </View>

        <View style={styles.moreSectionCard}>
          <Text style={styles.moreSectionTitle}>{strings.more.sections.about}</Text>
          <MoreMenuRow
            iconSource={aboutMenuIcon}
            iconBackgroundColor="#F3E8FF"
            title={strings.more.items.about}
            onPress={() => setPlaceholderEntry('about')}
            isLast
          />
        </View>
      </ScrollView>

      <Modal
        visible={activeSelectorConfig !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveSelector(null)}
      >
        <View style={styles.moreModalOverlay}>
          <Pressable style={styles.moreModalBackdrop} onPress={() => setActiveSelector(null)} />

          <View style={styles.moreModalCard}>
            <Text style={styles.moreModalTitle}>{activeSelectorConfig?.title}</Text>
            {activeSelectorConfig?.options.length === 1 ? <Text style={styles.moreModalSubtitle}>{strings.more.oneOptionAvailable}</Text> : null}

            <View style={styles.moreModalOptionList}>
              {activeSelectorConfig?.options.map((option) => {
                const isActive = option.value === activeSelectorConfig.selectedValue;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    style={[styles.moreModalOptionRow, isActive && styles.moreModalOptionRowActive]}
                    onPress={() => {
                      activeSelectorConfig.onSelect(option.value);
                      if (activeSelector !== 'language') {
                        setActiveSelector(null);
                      }
                    }}
                  >
                    <Text style={[styles.moreModalOptionText, isActive && styles.moreModalOptionTextActive]}>{option.label}</Text>
                    {isActive ? <Text style={styles.moreModalOptionCheck}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              style={styles.moreModalCloseButton}
              onPress={() => setActiveSelector(null)}
            >
              <Text style={styles.moreModalCloseButtonText}>{strings.common.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={placeholderEntry !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPlaceholderEntry(null)}
      >
        <View style={styles.moreModalOverlay}>
          <Pressable style={styles.moreModalBackdrop} onPress={() => setPlaceholderEntry(null)} />

          <View style={styles.moreModalCard}>
            <Text style={styles.moreModalTitle}>{placeholderEntry ? strings.placeholders[placeholderEntry] : strings.more.placeholderFallback}</Text>
            <Text style={styles.moreModalSubtitle}>{strings.more.placeholderFallback}</Text>

            <Pressable
              accessibilityRole="button"
              style={styles.moreModalCloseButton}
              onPress={() => setPlaceholderEntry(null)}
            >
              <Text style={styles.moreModalCloseButtonText}>{strings.more.placeholderConfirm}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function BottomTabBar({ activeTab, onChangeTab }) {
  const { strings } = useLocalization();
  const [barWidth, setBarWidth] = useState(0);
  const activeX = useRef(new Animated.Value(0)).current;
  const circleSize = 54;
  const tabsBarInnerHorizontalPadding = 8;
  const contentWidth = barWidth > 0 ? barWidth - (tabsBarInnerHorizontalPadding * 2) : 0;
  const mainTabsLocalized = useMemo(
    () => [
      { key: 'dashboard', label: strings.tabs.dashboard, iconSource: mainNavDashboardIcon },
      { key: 'operations', label: strings.tabs.operations, iconSource: mainNavOperationsIcon },
      { key: 'analytics', label: strings.tabs.analytics, iconSource: mainNavAnalyticsIcon },
      { key: 'more', label: strings.tabs.more, iconSource: mainNavMoreIcon },
    ],
    [strings],
  );
  const tabSlotWidth = contentWidth > 0 ? contentWidth / mainTabsLocalized.length : 0;
  const activeTabIndex = Math.max(0, mainTabsLocalized.findIndex((item) => item.key === activeTab));

  useEffect(() => {
    if (tabSlotWidth <= 0) {
      return;
    }

    const nextX = tabsBarInnerHorizontalPadding + (activeTabIndex * tabSlotWidth) + ((tabSlotWidth - circleSize) / 2);

    Animated.spring(activeX, {
      toValue: nextX,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.9,
    }).start();
  }, [activeTabIndex, activeX, tabSlotWidth]);

  const activeTabConfig = mainTabsLocalized[activeTabIndex] ?? mainTabsLocalized[0];

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
            <Image source={activeTabConfig.iconSource} style={styles.tabsActiveCircleIcon} resizeMode="contain" />
          </Animated.View>
        ) : null}

        {mainTabsLocalized.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={styles.tabsButton}
              onPress={() => onChangeTab(tab.key)}
            >
              {isActive ? <View style={styles.tabsActiveSpacer} /> : <Image source={tab.iconSource} style={styles.tabsIconImage} resizeMode="contain" />}
              {isActive ? null : <Text style={styles.tabsLabel}>{tab.label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabsScreen({ activeTab, onChangeTab, onBackHome, onOpenAddTransaction, onOpenEditTransaction, dataVersion }) {
  const { strings } = useLocalization();

  const activeScreen = (() => {
    if (activeTab === 'operations') {
      return <OperationsScreen onOpenAddTransaction={onOpenAddTransaction} onOpenEditTransaction={onOpenEditTransaction} dataVersion={dataVersion} />;
    }

    if (activeTab === 'analytics') {
      return <AnalysisScreen dataVersion={dataVersion} />;
    }

    if (activeTab === 'more') {
      return <MoreScreen />;
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
  const { strings } = useLocalization();
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
          <Text style={[styles.title, { fontSize: titleFontSize, lineHeight: titleLineHeight }]}>{`${strings.onboarding.titleLine1}\n${strings.onboarding.titleLine2}`}</Text>
          <Text style={[styles.subtitle, { fontSize: subtitleFontSize, lineHeight: subtitleLineHeight }]}>
            {`${strings.onboarding.subtitleLine1}\n${strings.onboarding.subtitleLine2}\n${strings.onboarding.subtitleLine3}`}
          </Text>
        </View>

        <View style={styles.featureRow}>
          <FeatureCard icon={incomeIcon} title={strings.onboarding.incomeTitle} titleColor="#2ca63c" description={`${strings.onboarding.incomeDescriptionLine1}\n${strings.onboarding.incomeDescriptionLine2}`} cardHeight={featureCardHeight} iconSize={featureIconSize} titleSize={featureTitleFontSize} descriptionSize={featureDescriptionFontSize} />
          <FeatureCard icon={expenseIcon} title={strings.onboarding.expenseTitle} titleColor="#ff6a1a" description={`${strings.onboarding.expenseDescriptionLine1}\n${strings.onboarding.expenseDescriptionLine2}`} cardHeight={featureCardHeight} iconSize={featureIconSize} titleSize={featureTitleFontSize} descriptionSize={featureDescriptionFontSize} />
          <FeatureCard icon={analyticsIcon} title={strings.onboarding.analyticsTitle} titleColor="#2468f2" description={`${strings.onboarding.analyticsDescriptionLine1}\n${strings.onboarding.analyticsDescriptionLine2}`} cardHeight={featureCardHeight} iconSize={featureIconSize} titleSize={featureTitleFontSize} descriptionSize={featureDescriptionFontSize} />
        </View>

        <Pressable accessibilityRole="button" onPress={onStartDashboard} style={({ pressed }) => [styles.primaryButton, { minHeight: primaryButtonHeight }, pressed && styles.primaryButtonPressed]}>
          <Text style={[styles.primaryButtonText, { fontSize: primaryButtonFontSize, lineHeight: Math.round(primaryButtonFontSize * 1.15) }]}>{strings.onboarding.startButton}</Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function StartupLoadingView() {
  return (
    <SafeAreaView style={styles.startupLoadingScreen}>
      <View style={styles.startupLoadingContent}>
        <Image source={logoMark} style={styles.startupLoadingLogo} resizeMode="contain" />
        <ActivityIndicator size="small" color={themeColors.primary} />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function AppContent() {
  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dataVersion, setDataVersion] = useState(0);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasLoadedAppState, setHasLoadedAppState] = useState(false);
  const [language, setLanguage] = useState(() => detectPreferredLanguage());
  const [currencyCode, setCurrencyCode] = useState(() => detectPreferredCurrency());

  const localization = useMemo(() => createLocalizationBundle(language, currencyCode), [currencyCode, language]);

  const handleSetLanguage = async (nextLanguage) => {
    setLanguage(nextLanguage);

    try {
      await writeLanguageState(nextLanguage);
    } catch (error) {
      console.warn('Unable to persist selected language', error);
    }
  };

  const handleSetCurrency = async (nextCurrencyCode) => {
    if (!isSupportedCurrencyCode(nextCurrencyCode)) {
      return;
    }

    setCurrencyCode(nextCurrencyCode);

    try {
      await writeCurrencyState(nextCurrencyCode);
    } catch (error) {
      console.warn('Unable to persist selected currency', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([readOnboardingState(), readLanguageState(), readCurrencyState()])
      .then(([storedOnboardingState, storedLanguage, storedCurrency]) => {
        if (!isMounted) {
          return;
        }

        const preferredLanguage = storedLanguage ?? detectPreferredLanguage();
        const preferredCurrency = storedCurrency ?? detectPreferredCurrency();
        setLanguage(preferredLanguage);
        setCurrencyCode(preferredCurrency);

        if (!storedLanguage) {
          void writeLanguageState(preferredLanguage);
        }

        if (!storedCurrency) {
          void writeCurrencyState(preferredCurrency);
        }

        if (storedOnboardingState === 'true') {
          setHasSeenOnboarding(true);
          setScreen('main');
          setHasLoadedAppState(true);
          return;
        }

        setHasSeenOnboarding(false);
        setHasLoadedAppState(true);
      })
      .catch(() => {
        if (isMounted) {
          setHasSeenOnboarding(false);
          setScreen('home');
          setHasLoadedAppState(true);
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
    await clearLanguageState();
    await clearCurrencyState();
    const resetLanguage = detectPreferredLanguage();
    const resetCurrency = detectPreferredCurrency();
    setLanguage(resetLanguage);
    setCurrencyCode(resetCurrency);
    await writeLanguageState(resetLanguage);
    await writeCurrencyState(resetCurrency);
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

  const handleCreateTransaction = (payload) => {
    budgetStore.addTransaction(payload);
    setDataVersion((current) => current + 1);
    setScreen('main');
  };

  const handleOpenEditTransaction = (transactionId) => {
    setEditingTransactionId(transactionId);
    setScreen('edit-transaction');
  };

  const handleUpdateTransaction = (payload) => {
    if (!editingTransactionId) {
      return;
    }

    budgetStore.updateTransaction(editingTransactionId, payload);
    setDataVersion((current) => current + 1);
    setScreen('main');
  };

  const handleDeleteTransaction = () => {
    if (!editingTransactionId) {
      return;
    }

    budgetStore.deleteTransaction(editingTransactionId);
    setDataVersion((current) => current + 1);
    setScreen('main');
  };

  const editingTransaction = useMemo(() => {
    if (!editingTransactionId) {
      return null;
    }

    return budgetStore.getTransactions().find((item) => item.id === editingTransactionId) ?? null;
  }, [dataVersion, editingTransactionId]);

  const content = (() => {
    if (!hasLoadedAppState && (screen === 'home' || screen === 'main')) {
      return <StartupLoadingView />;
    }

    if (screen === 'home') {
      return <HomeScreen onOpenOnboarding={handleOpenApp} onClearStorage={handleClearStorage} />;
    }

    if (screen === 'onboarding') {
      return <OnboardingScreen onStartDashboard={handleStartDashboard} />;
    }

    if (screen === 'add-transaction') {
      return <AddTransactionScreen onBack={() => setScreen('main')} onSave={handleCreateTransaction} />;
    }

    if (screen === 'edit-transaction') {
      if (!editingTransaction) {
        return (
          <MainTabsScreen
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onBackHome={() => setScreen('home')}
            onOpenAddTransaction={() => setScreen('add-transaction')}
            onOpenEditTransaction={handleOpenEditTransaction}
            dataVersion={dataVersion}
          />
        );
      }

      return (
        <AddTransactionScreen
          mode="edit"
          transaction={editingTransaction}
          onBack={() => setScreen('main')}
          onSave={handleUpdateTransaction}
          onDelete={handleDeleteTransaction}
        />
      );
    }

    return (
      <MainTabsScreen
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onBackHome={() => setScreen('home')}
        onOpenAddTransaction={() => setScreen('add-transaction')}
        onOpenEditTransaction={handleOpenEditTransaction}
        dataVersion={dataVersion}
      />
    );
  })();

  if (!content) {
    return null;
  }

  return <LocalizationContext.Provider value={{ ...localization, setLanguage: handleSetLanguage, setCurrency: handleSetCurrency }}>{content}</LocalizationContext.Provider>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  startupLoadingScreen: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  startupLoadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  startupLoadingLogo: {
    width: 80,
    height: 80,
  },
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
  tabsIconImage: {
    width: 36,
    height: 36,
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
    width: 36,
    height: 36,
  },
  tabsActiveSpacer: {
    height: 50,
    width: 50,
  },
  analysisScreen: {
    flex: 1,
    backgroundColor: '#f6f8fc',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 6 : 8,
  },
  analysisGlowLeft: {
    position: 'absolute',
    top: -80,
    left: -64,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  analysisGlowRight: {
    position: 'absolute',
    top: 80,
    right: -72,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(226, 239, 255, 0.8)',
  },
  analysisScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 104,
    gap: 14,
  },
  analysisScrollContentCompact: {
    paddingHorizontal: 14,
    gap: 12,
  },
  analysisHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  analysisScreenTitle: {
    color: '#151B31',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fontFamilies.sans,
  },
  analysisHeaderCalendarButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(225,230,238,0.95)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 3,
  },
  analysisHeaderCalendarIcon: {
    width: 20,
    height: 20,
    tintColor: '#232B46',
  },
  analysisMonthPickerWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  analysisMonthArrowButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(225,230,238,0.95)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisMonthArrowButtonDisabled: {
    opacity: 0.38,
  },
  analysisMonthArrowIcon: {
    width: 18,
    height: 18,
    tintColor: '#1A223C',
  },
  analysisMonthArrowIconRight: {
    transform: [{ rotate: '180deg' }],
  },
  analysisMonthDropdownWrap: {
    flex: 1,
    zIndex: 20,
  },
  analysisMonthDropdownButton: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(225,230,238,0.95)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  analysisMonthDropdownIcon: {
    width: 18,
    height: 18,
    tintColor: '#1A223C',
  },
  analysisMonthDropdownText: {
    color: '#20283F',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  analysisMonthDropdownChevron: {
    color: '#20283F',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  analysisMonthDropdownMenu: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(225,230,238,0.95)',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  analysisMonthDropdownOption: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  analysisMonthDropdownOptionActive: {
    backgroundColor: '#F3F7FF',
  },
  analysisMonthDropdownOptionText: {
    color: '#44506A',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  analysisMonthDropdownOptionTextActive: {
    color: '#1F63EF',
  },
  analysisSummaryPanel: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(225,230,238,0.96)',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  analysisSummaryPanelCompact: {
    paddingVertical: 6,
  },
  analysisSummaryPanelColumn: {
    flex: 1,
  },
  analysisSummaryPanelColumnCompact: {
    minWidth: 0,
  },
  analysisSummaryPanelColumnDivider: {
    borderRightWidth: 1,
    borderRightColor: '#EDF1F7',
  },
  analysisSummaryCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  analysisSummaryDashboardIconWrap: {
    marginBottom: 6,
  },
  analysisSummaryDashboardLabel: {
    marginTop: 0,
    minHeight: 28,
  },
  analysisSummaryDashboardValue: {
    marginTop: 0,
    fontSize: 16,
    lineHeight: 20,
  },
  analysisSummaryDelta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  analysisSummaryComparison: {
    color: '#6C7893',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  analysisForecastRow: {
    flexDirection: 'row',
    gap: 12,
  },
  analysisForecastRowCompact: {
    flexDirection: 'column',
    gap: 12,
  },
  analysisPaceCard: {
    flex: 0.9,
    minHeight: 210,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(225,230,238,0.96)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  analysisPaceCardCompact: {
    paddingHorizontal: 14,
    paddingTop: 14,
    minHeight: 196,
  },
  analysisArcWrap: {
    position: 'relative',
    alignSelf: 'center',
  },
  analysisArcSegment: {
    position: 'absolute',
    width: 12,
    height: 28,
    borderRadius: 999,
  },
  analysisPaceGaugeArea: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  analysisPaceCenterContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  analysisPacePercentValue: {
    color: '#151B31',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fontFamilies.sans,
  },
  analysisPacePercentLabel: {
    marginTop: 4,
    color: '#2D3650',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  analysisPaceFootnote: {
    marginTop: 8,
    color: '#2F3B57',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
  },
  analysisPaceProgressTrack: {
    marginTop: 12,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E8EDF3',
    overflow: 'hidden',
  },
  analysisPaceProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#22C76A',
  },
  analysisForecastCard: {
    flex: 1.1,
    minHeight: 250,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(225,230,238,0.96)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  analysisForecastCardCompact: {
    paddingHorizontal: 14,
    minHeight: 208,
  },
  analysisForecastTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  analysisForecastTitle: {
    flex: 1,
    color: '#1A223C',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    fontFamily: fontFamilies.sans,
  },
  analysisForecastInfoWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6DEEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisForecastInfoIcon: {
    color: '#8391AA',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  analysisForecastList: {
    marginTop: 18,
    gap: 16,
  },
  analysisForecastItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  analysisForecastItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  analysisForecastItemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisForecastItemIconImage: {
    width: '112%',
    height: '112%',
  },
  analysisForecastItemLabel: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    color: '#313C58',
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fontFamilies.sans,
  },
  analysisForecastItemValue: {
    maxWidth: '44%',
    textAlign: 'right',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: fontFamilies.sans,
  },
  analysisForecastCaption: {
    marginTop: 14,
    color: '#6E7A94',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamilies.sans,
  },
  analysisInsightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  analysisSectionTitle: {
    color: '#151B31',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    fontFamily: fontFamilies.sans,
  },
  analysisHeaderAction: {
    color: '#2E7AF0',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  analysisInsightsList: {
    gap: 10,
  },
  analysisInsightRow: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(230, 234, 242, 0.96)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 3,
  },
  analysisInsightRowPressed: {
    opacity: 0.92,
  },
  analysisInsightRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  analysisInsightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisInsightIconImage: {
    width: '110%',
    height: '110%',
  },
  analysisInsightTextWrap: {
    flex: 1,
    gap: 3,
  },
  analysisInsightTitle: {
    color: '#181F33',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    fontFamily: fontFamilies.sans,
  },
  analysisInsightSummary: {
    color: '#47546E',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamilies.sans,
  },
  analysisInsightRowRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  analysisInsightTonePill: {
    minWidth: 88,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisInsightToneText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  analysisInsightChevron: {
    color: '#1B243B',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '400',
  },
  analysisChartsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  analysisChartsRowCompact: {
    flexDirection: 'column',
    gap: 12,
  },
  analysisChartCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(225,230,238,0.96)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  analysisChartCardCompact: {
    paddingHorizontal: 14,
    minHeight: 300,
  },
  analysisCategoryCardBody: {
    marginTop: 14,
    gap: 14,
  },
  analysisCategoryDonutWrap: {
    alignItems: 'center',
    minHeight: 146,
    justifyContent: 'center',
  },
  analysisCategoryBreakdownList: {
    gap: 9,
  },
  analysisCategoryEmptyText: {
    color: '#6C7893',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamilies.sans,
  },
  analysisCategoryBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  analysisCategoryBreakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  analysisCategoryColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  analysisCategoryBreakdownName: {
    color: '#33405B',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamilies.sans,
    flex: 1,
  },
  analysisCategoryBreakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 108,
    justifyContent: 'flex-end',
  },
  analysisCategoryBreakdownValue: {
    color: '#1B233A',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  analysisCategoryBreakdownPercent: {
    color: '#6C7893',
    fontSize: 13,
    lineHeight: 17,
    fontFamily: fontFamilies.sans,
    minWidth: 28,
    textAlign: 'right',
  },
  analysisChartActionButton: {
    alignSelf: 'center',
  },
  analysisChartAction: {
    marginTop: 14,
    color: '#2E7AF0',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: fontFamilies.sans,
  },
  analysisTrendChartWrap: {
    marginTop: 12,
    flex: 1,
  },
  analysisTrendLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  analysisTrendLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  analysisTrendLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  analysisTrendLegendText: {
    color: '#3E4A66',
    fontSize: 13,
    lineHeight: 17,
    fontFamily: fontFamilies.sans,
  },
  analysisTrendBarsRow: {
    marginTop: 12,
    height: 170,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  analysisTrendMonthGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  analysisTrendBarPair: {
    height: 132,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  analysisTrendBar: {
    width: 14,
    borderRadius: 999,
  },
  analysisTrendBarIncome: {
    backgroundColor: '#22C76A',
  },
  analysisTrendBarExpense: {
    backgroundColor: '#FF4D5E',
  },
  analysisTrendMonthLabel: {
    color: '#5D6A85',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamilies.sans,
  },
  analysisStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  analysisStatsGridCompact: {
    rowGap: 12,
    columnGap: 10,
  },
  analysisStatCard: {
    width: '23.5%',
    minHeight: 124,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(225,230,238,0.96)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 3,
  },
  analysisStatCardCompactLayout: {
    width: '48.5%',
    minHeight: 148,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
  },
  analysisStatCardPressed: {
    opacity: 0.92,
  },
  analysisStatIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  analysisStatIconImage: {
    width: '110%',
    height: '110%',
  },
  analysisStatLabel: {
    color: '#43506C',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  analysisStatValue: {
    marginTop: 8,
    color: '#171E34',
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    fontFamily: fontFamilies.sans,
  },
  analysisStatSubtitle: {
    marginTop: 4,
    color: '#303B58',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamilies.sans,
  },
  analysisDetailOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.24)',
  },
  analysisDetailBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  analysisDetailCard: {
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  analysisDetailEyebrow: {
    color: '#2E7AF0',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontFamily: fontFamilies.sans,
  },
  analysisDetailTitle: {
    color: '#151B31',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    fontFamily: fontFamilies.sans,
  },
  analysisDetailSummary: {
    color: '#44506A',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamilies.sans,
  },
  analysisDetailSection: {
    gap: 6,
  },
  analysisDetailSectionLabel: {
    color: '#1C243B',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  analysisDetailSectionBody: {
    color: '#44506A',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamilies.sans,
  },
  analysisDetailCloseButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#1F63EF',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  analysisDetailCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsScreen: {
    flex: 1,
    backgroundColor: '#f4f8ff',
  },
  operationsGlowLeft: {
    position: 'absolute',
    left: -88,
    top: -104,
    width: 284,
    height: 284,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  operationsGlowRight: {
    position: 'absolute',
    right: -96,
    top: 108,
    width: 248,
    height: 248,
    borderRadius: 999,
    backgroundColor: 'rgba(219,232,255,0.72)',
  },
  operationsScroll: {
    flex: 1,
  },
  operationsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  operationsMonthSelectorWrap: {
    position: 'relative',
    flex: 1,
    paddingRight: 10,
  },
  operationsMonthSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  operationsMonthText: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#1c284f',
    fontFamily: fontFamilies.sans,
  },
  operationsMonthChevron: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    color: '#475569',
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
  },
  operationsMonthDropdown: {
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
  operationsMonthOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.7)',
  },
  operationsMonthOptionActive: {
    backgroundColor: themeColors.infoSoft,
  },
  operationsMonthOptionText: {
    fontSize: 14,
    lineHeight: 18,
    color: themeColors.textPrimary,
    fontFamily: fontFamilies.sans,
  },
  operationsMonthOptionTextActive: {
    color: themeColors.info,
    fontWeight: '700',
  },
  operationsActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  operationsActionButton: {
    width: 70,
    height: 70,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(209,220,238,0.9)',
    backgroundColor: themeColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  operationsActionIcon: {
    fontSize: 22,
    lineHeight: 24,
    marginTop: 4,
    color: '#1c284f',
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
  },
  operationsActionLabel: {
    fontSize: 12,
    lineHeight: 15,
    color: '#334155',
    fontFamily: fontFamilies.sans,
  },
  operationsTitle: {
    marginTop: 18,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#1a244a',
    fontFamily: fontFamilies.sans,
  },
  operationsSearchBox: {
    marginTop: 14,
    height: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(209,220,238,0.9)',
    backgroundColor: themeColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  operationsSearchIcon: {
    width: 24,
    height: 24,
  },
  operationsSearchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: themeColors.textPrimary,
    fontFamily: fontFamilies.sans,
  },
  operationsTypeRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 14,
  },
  operationsTypeChip: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.95)',
    backgroundColor: themeColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  operationsTypeChipActive: {
    borderColor: '#4ade80',
    backgroundColor: '#f5fff8',
  },
  operationsTypeChipText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    color: '#1f2d4f',
    fontFamily: fontFamilies.sans,
  },
  operationsTypeChipTextActive: {
    color: '#16a34a',
  },
  operationsSummaryCard: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: 'rgba(209,220,238,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  operationsSummaryHeader: {
    gap: 14,
  },
  operationsSummaryMonthBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  operationsSummaryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: themeColors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationsSummaryIcon: {
    width: 30,
    height: 30,
  },
  operationsSummaryMonthTextWrap: {
    flex: 1,
  },
  operationsSummaryCount: {
    fontSize: 20,
    lineHeight: 24,
    color: '#1b2445',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsSummaryMonth: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  operationsSummaryMetricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  operationsSummaryMetricDivider: {
    width: 1,
    marginVertical: 4,
    backgroundColor: 'rgba(226,232,240,0.9)',
  },
  operationsMetricItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  operationsMetricLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
  },
  operationsMetricValue: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
  },
  operationsListCard: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: 'rgba(209,220,238,0.9)',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  operationsRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.85)',
    paddingVertical: 14,
  },
  operationsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  operationsRowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationsRowIcon: {
    width: '170%',
    height: '170%',
  },
  operationsRowTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  operationsRowTitle: {
    fontSize: 16,
    lineHeight: 21,
    color: '#151f43',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsRowSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  operationsRowAmount: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsEmptyListState: {
    paddingVertical: 22,
    alignItems: 'center',
  },
  operationsEmptyListTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#1a244a',
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
  },
  operationsEmptyListText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
  },
  operationsAddButton: {
    marginTop: 22,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: themeColors.income,
    paddingHorizontal: 34,
    paddingVertical: 14,
  },
  operationsAddButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  operationsAddIcon: {
    width: 20,
    height: 20,
  },
  operationsAddButtonText: {
    fontSize: 18,
    lineHeight: 22,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  operationsModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.28)',
  },
  operationsModalCard: {
    backgroundColor: themeColors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
  },
  operationsModalTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: '#1b2445',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsModalSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: themeColors.textSecondary,
    fontFamily: fontFamilies.sans,
  },
  operationsModalChoices: {
    marginTop: 14,
    gap: 10,
  },
  operationsChoiceRow: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    backgroundColor: themeColors.surfaceAlt,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  operationsChoiceRowActive: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.primarySoft,
  },
  operationsChoiceRowText: {
    fontSize: 15,
    lineHeight: 19,
    color: '#1f2d4f',
    fontFamily: fontFamilies.sans,
    fontWeight: '600',
  },
  operationsChoiceRowTextActive: {
    color: themeColors.primary,
    fontWeight: '700',
  },
  operationsChoiceRowCheck: {
    fontSize: 18,
    lineHeight: 20,
    color: themeColors.primary,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsModalResetButton: {
    marginTop: 16,
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.surface,
  },
  operationsModalResetButtonText: {
    fontSize: 15,
    lineHeight: 19,
    color: themeColors.textPrimary,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsModalCloseButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
  },
  operationsModalCloseButtonText: {
    fontSize: 15,
    lineHeight: 19,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsEmptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f8ff',
    paddingHorizontal: 20,
  },
  operationsEmptyGlowTop: {
    position: 'absolute',
    top: -136,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  operationsEmptyCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(209,220,238,0.9)',
    backgroundColor: '#ffffff',
    paddingHorizontal: 22,
    paddingVertical: 26,
    gap: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  operationsEmptyTitle: {
    color: '#1b2445',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  operationsEmptyText: {
    color: themeColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamilies.sans,
  },
  moreScreen: {
    flex: 1,
    backgroundColor: '#f4f8ff',
  },
  moreGlowTop: {
    position: 'absolute',
    top: -120,
    left: -96,
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  moreGlowBottom: {
    position: 'absolute',
    right: -110,
    top: 360,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(226,236,255,0.74)',
  },
  moreScroll: {
    flex: 1,
  },
  moreScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 26,
    gap: 14,
  },
  moreHeader: {
    marginTop: 0,
    gap: 8,
  },
  moreTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#1a2652',
    fontFamily: fontFamilies.sans,
    letterSpacing: -0.6,
  },
  moreSubtitle: {
    color: '#6979a0',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamilies.sans,
    paddingRight: 14,
  },
  moreSectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(209,220,238,0.9)',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 3,
  },
  moreSectionTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#7281a3',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  moreRow: {
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreRowPressed: {
    opacity: 0.84,
  },
  moreRowWithDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.9)',
  },
  moreRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    paddingRight: 8,
  },
  moreRowIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  moreRowIconImage: {
    width: '165%',
    height: '165%',
  },
  moreRowTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  moreRowTitle: {
    color: '#1a244a',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
    letterSpacing: -0.35,
  },
  moreRowTitleDestructive: {
    color: '#EF4444',
  },
  moreRowSubtitle: {
    marginTop: 3,
    color: '#6a7798',
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fontFamilies.sans,
  },
  moreRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
  },
  moreRowValue: {
    color: '#7d86a6',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fontFamilies.sans,
  },
  moreRowChevron: {
    color: '#7b88ab',
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '400',
    fontFamily: fontFamilies.sans,
  },
  moreRowChevronDestructive: {
    color: '#EF4444',
  },
  moreModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  moreModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.28)',
  },
  moreModalCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(209,220,238,0.95)',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 12,
  },
  moreModalTitle: {
    color: '#1b2445',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  moreModalSubtitle: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamilies.sans,
  },
  moreModalOptionList: {
    gap: 10,
  },
  moreModalOptionRow: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreModalOptionRowActive: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.primarySoft,
  },
  moreModalOptionText: {
    color: '#1f2d4f',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  moreModalOptionTextActive: {
    color: themeColors.primary,
    fontWeight: '700',
  },
  moreModalOptionCheck: {
    color: themeColors.primary,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  moreModalCloseButton: {
    marginTop: 2,
    height: 52,
    borderRadius: 999,
    backgroundColor: themeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreModalCloseButtonText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
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
  addTxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addTxBackButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxDeleteIconButton: {
    minHeight: 42,
    borderRadius: radii.panel,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxDeleteIconButtonText: {
    color: themeColors.expense,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
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
  addTxEditTypePillWrap: {
    marginTop: 2,
    flexDirection: 'row',
  },
  addTxEditTypePill: {
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addTxEditTypePillIncome: {
    borderColor: '#b6eacc',
    backgroundColor: '#ecf9f2',
  },
  addTxEditTypePillExpense: {
    borderColor: '#ffd2d2',
    backgroundColor: '#fff3f3',
  },
  addTxEditTypePillArrow: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  addTxEditTypePillArrowIncome: {
    color: '#16A34A',
  },
  addTxEditTypePillArrowExpense: {
    color: '#DC2626',
    transform: [{ rotate: '90deg' }],
  },
  addTxEditTypePillText: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  addTxEditTypePillTextIncome: {
    color: '#16A34A',
  },
  addTxEditTypePillTextExpense: {
    color: '#DC2626',
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
  addTxDeleteButton: {
    marginTop: -2,
    borderRadius: radii.pill,
    minHeight: 66,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxDeleteButtonText: {
    color: '#ef4444',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  addTxConfirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  addTxConfirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  addTxConfirmCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  addTxConfirmTitle: {
    fontSize: 21,
    lineHeight: 27,
    color: '#172554',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  addTxConfirmText: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 21,
    color: '#536387',
    fontFamily: fontFamilies.sans,
  },
  addTxConfirmActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  addTxConfirmCancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.panel,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxConfirmCancelButtonText: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: fontFamilies.sans,
  },
  addTxConfirmDeleteButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.panel,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxConfirmDeleteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
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
