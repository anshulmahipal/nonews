# Custom Hooks

This directory contains custom React hooks for reusable logic.

## Structure

```
hooks/
├── useAuth.ts          # Authentication hook
├── useFirestore.ts     # Firestore operations
├── useStorage.ts       # Firebase Storage operations
└── use[Feature].ts     # Feature-specific hooks
```

## Hook Template

```typescript
import { useState, useEffect } from 'react';

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useData = <T,>(fetchFn: () => Promise<T>): UseDataResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
```

## Best Practices

- Prefix hooks with 'use'
- Return consistent object structure
- Include loading and error states
- Clean up subscriptions in useEffect
- Use TypeScript generics for reusability
- Document hook parameters and return values


