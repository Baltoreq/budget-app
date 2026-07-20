import { Platform } from 'react-native';

export const fontFamilies = {
  sans: Platform.select({
    web: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    default: undefined,
  }),
  mono: Platform.select({
    web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    default: undefined,
  }),
} as const;