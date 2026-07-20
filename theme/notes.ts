export type UsageNote = {
  icon: string;
  text: string;
};

export const usageNotes: UsageNote[] = [
  {
    icon: '✓',
    text: 'Use income green only for positive financial meaning.',
  },
  {
    icon: '×',
    text: 'Use expense red only for expenses, destructive actions, or negative balance.',
  },
  {
    icon: 'Aa',
    text: 'Prefer dark text on light surfaces for readability.',
  },
  {
    icon: '✦',
    text: 'Primary indigo is the main interactive brand color.',
  },
  {
    icon: '123',
    text: 'Use tabular numerals for money values.',
  },
  {
    icon: '</>',
    text: 'Keep the system simple for easy global CSS token generation.',
  },
];