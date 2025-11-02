# Utilities

This directory contains utility functions and helper modules.

## Structure

```
utils/
├── validation.ts       # Input validation helpers
├── formatting.ts       # Date, number, string formatting
├── storage.ts          # AsyncStorage helpers
├── constants.ts        # App constants
└── helpers.ts          # General helper functions
```

## Utility Examples

```typescript
// validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

// formatting.ts
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// constants.ts
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#FFFFFF',
  text: '#000000',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;
```

## Best Practices

- Keep functions pure and testable
- Export individual functions
- Add JSDoc comments
- Use TypeScript for type safety
- Group related utilities
- Avoid side effects
- Make functions reusable


