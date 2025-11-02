# Components

This directory contains reusable UI components used throughout the app.

## Structure

Organize components by feature or type:

```
components/
├── common/           # Common UI components (Button, Input, Card, etc.)
├── forms/            # Form-related components
├── layout/           # Layout components (Header, Footer, Container)
└── [feature]/        # Feature-specific components
```

## Component Template

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

## Best Practices

- One component per file
- Export component as named export
- Define TypeScript interface for props
- Use StyleSheet.create for styles
- Keep components focused and reusable
- Use React.memo for expensive components


