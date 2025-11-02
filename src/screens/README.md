# Screens

This directory contains screen components (full-page views) for the app.

## Available Screens

### WelcomeScreen
A beautiful welcome/waitlist page for collecting user emails before launch.

**Features:**
- Hero section with app branding
- Feature highlights
- Email waitlist form with validation
- Firebase Firestore integration
- Keyboard-aware layout

**Usage:**
```typescript
import { WelcomeScreen } from './screens/WelcomeScreen';

// Add to navigation
<Stack.Screen name="Welcome" component={WelcomeScreen} />
```

**See:** [WELCOME_SCREEN_GUIDE.md](../../WELCOME_SCREEN_GUIDE.md) for detailed documentation.

---

## Structure

```
screens/
├── WelcomeScreen.tsx     # Welcome/waitlist page
├── Auth/
│   ├── LoginScreen.tsx
│   └── RegisterScreen.tsx
├── Home/
│   └── HomeScreen.tsx
├── Profile/
│   └── ProfileScreen.tsx
└── [Feature]/
    └── [Feature]Screen.tsx
```

## Screen Template

```typescript
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'ScreenName'>;

export const ScreenNameScreen: React.FC<Props> = ({ navigation, route }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Screen Title</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

## Best Practices

- Use SafeAreaView for iOS notch support
- Keep business logic in hooks or services
- Use navigation props for type-safe navigation
- Handle loading and error states
- Use KeyboardAvoidingView for forms


