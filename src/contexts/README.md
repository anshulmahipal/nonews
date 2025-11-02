# Contexts

This directory contains React Context providers for global state management.

## Structure

```
contexts/
├── AuthContext.tsx      # Authentication state
├── ThemeContext.tsx     # Theme and dark mode
└── [Feature]Context.tsx # Feature-specific state
```

## Context Template

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    // Implementation
  };

  const signOut = async () => {
    // Implementation
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Best Practices

- Create a custom hook for each context
- Throw error if used outside provider
- Keep context focused on single concern
- Memoize context value if needed
- Clean up subscriptions
- Type context properly with TypeScript


