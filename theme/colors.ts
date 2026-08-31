export type ColorToken = {
  name: string;
  hex: string;
  description: string;
};

export const themeColors = {
  primary: '#4f46e5',
  primarySoft: '#eef2ff',
  accent: '#0ea5a4',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',
  border: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  income: '#16a34a',
  incomeSoft: '#dcfce7',
  expense: '#dc2626',
  expenseSoft: '#fee2e2',
  warning: '#d97706',
  warningSoft: '#fef3c7',
  info: '#2563eb',
  infoSoft: '#dbeafe',
} as const;

export const darkThemeColors = {
  primary: '#818cf8',
  primarySoft: '#312e81',
  accent: '#2dd4bf',
  background: '#111827',
  surface: '#1f2937',
  surfaceAlt: '#374151',
  border: '#4b5563',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  income: '#4ade80',
  incomeSoft: '#14532d',
  expense: '#fb7185',
  expenseSoft: '#881337',
  warning: '#fbbf24',
  warningSoft: '#78350f',
  info: '#60a5fa',
  infoSoft: '#1e3a8a',
} as const;

export const baseColorTokens: ColorToken[] = [
  { name: 'Primary / Brand', hex: '#4F46E5', description: 'primary actions, active states' },
  { name: 'Primary Soft', hex: '#EEF2FF', description: 'subtle primary backgrounds' },
  { name: 'Accent / Secondary', hex: '#0EA5A4', description: 'charts, secondary highlights' },
  { name: 'Background', hex: '#F8FAFC', description: 'app background' },
  { name: 'Surface', hex: '#FFFFFF', description: 'cards and sheets' },
  { name: 'Surface Alt', hex: '#F1F5F9', description: 'muted panels' },
  { name: 'Border', hex: '#E2E8F0', description: 'borders and dividers' },
  { name: 'Text Primary', hex: '#0F172A', description: 'main text' },
  { name: 'Text Secondary', hex: '#475569', description: 'supporting text' },
  { name: 'Text Muted', hex: '#94A3B8', description: 'placeholders and captions' },
];

export const semanticColorTokens: ColorToken[] = [
  { name: 'Income / Success', hex: '#16A34A', description: 'positive values, income' },
  { name: 'Income Soft', hex: '#DCFCE7', description: 'positive backgrounds' },
  { name: 'Expense / Danger', hex: '#DC2626', description: 'expenses, destructive actions' },
  { name: 'Expense Soft', hex: '#FEE2E2', description: 'expense backgrounds' },
  { name: 'Warning', hex: '#D97706', description: 'warnings and alerts' },
  { name: 'Warning Soft', hex: '#FEF3C7', description: 'warning backgrounds' },
  { name: 'Info', hex: '#2563EB', description: 'informational highlights' },
  { name: 'Info Soft', hex: '#DBEAFE', description: 'informational backgrounds' },
];