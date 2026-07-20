import { fontFamilies } from './fonts';

export type TypographyToken = {
  role: string;
  sample: string;
  family: string;
  weight: number;
  size: number;
  lineHeight: number;
  usage: string;
  sampleColor?: string;
  fontFamily?: string;
  numeric?: boolean;
};

export const typographyTokens: TypographyToken[] = [
  {
    role: 'Display',
    sample: 'Saldo końcowe',
    family: 'Inter / system-ui',
    weight: 700,
    size: 32,
    lineHeight: 40,
    usage: 'major totals, onboarding headlines',
    fontFamily: fontFamilies.sans,
  },
  {
    role: 'H1',
    sample: 'Suma wydatków',
    family: 'Inter / system-ui',
    weight: 700,
    size: 24,
    lineHeight: 32,
    usage: 'screen titles',
    fontFamily: fontFamilies.sans,
  },
  {
    role: 'H2',
    sample: 'Podsumowanie miesiąca',
    family: 'Inter / system-ui',
    weight: 600,
    size: 20,
    lineHeight: 28,
    usage: 'section titles',
    fontFamily: fontFamilies.sans,
  },
  {
    role: 'Title',
    sample: 'Budżet na jedzenie',
    family: 'Inter / system-ui',
    weight: 600,
    size: 18,
    lineHeight: 24,
    usage: 'card titles',
    fontFamily: fontFamilies.sans,
  },
  {
    role: 'Body',
    sample: 'Zakupy w sklepie spożywczym',
    family: 'Inter / system-ui',
    weight: 400,
    size: 16,
    lineHeight: 24,
    usage: 'default content',
    fontFamily: fontFamilies.sans,
  },
  {
    role: 'Body Small',
    sample: 'Wydano dzisiaj o 12% mniej niż wczoraj.',
    family: 'Inter / system-ui',
    weight: 400,
    size: 14,
    lineHeight: 20,
    usage: 'secondary content',
    fontFamily: fontFamilies.sans,
  },
  {
    role: 'Label',
    sample: 'KATEGORIA',
    family: 'Inter / system-ui',
    weight: 600,
    size: 14,
    lineHeight: 18,
    usage: 'buttons, tabs, form labels',
    fontFamily: fontFamilies.sans,
  },
  {
    role: 'Caption',
    sample: 'Aktualizacja: 12 maj 2024, 10:45',
    family: 'Inter / system-ui',
    weight: 400,
    size: 12,
    lineHeight: 16,
    usage: 'helper text, metadata',
    fontFamily: fontFamilies.sans,
  },
  {
    role: 'Numeric Emphasis',
    sample: '+ 4 250,00 zł',
    family: 'Inter / system-ui (tabular numerals)',
    weight: 700,
    size: 28,
    lineHeight: 32,
    usage: 'balances and money values',
    sampleColor: '#16A34A',
    fontFamily: fontFamilies.sans,
    numeric: true,
  },
  {
    role: 'Mono Optional',
    sample: 'token.primary.brand',
    family: 'ui-monospace',
    weight: 500,
    size: 13,
    lineHeight: 18,
    usage: 'token names / developer notes',
    fontFamily: fontFamilies.mono,
  },
];