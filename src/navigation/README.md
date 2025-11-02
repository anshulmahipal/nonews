# Navigation

This directory contains navigation configuration and related components.

## Structure

```
navigation/
├── AppNavigator.tsx    # Main navigation container
├── types.ts            # Navigation type definitions
└── README.md           # This file
```

## Files

### AppNavigator.tsx
Main navigation setup using React Navigation. Currently configured with:
- **Welcome Screen** as the initial route
- Native stack navigator for iOS/Android native transitions
- Hidden headers by default for clean UI

### types.ts
TypeScript type definitions for navigation:
- `RootStackParamList` - Defines all available routes and their params
- Type-safe navigation throughout the app

## Usage

### In App.tsx
```typescript
import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';

const App = () => {
  return <AppNavigator />;
};

export default App;
```

### Navigation in Components
```typescript
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyComponent = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const handlePress = () => {
    navigation.navigate('Welcome');
  };
  
  return <Button onPress={handlePress} title="Go to Welcome" />;
};
```

### Screen Props
```typescript
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation, route }) => {
  // navigation and route are fully typed
  return <View>...</View>;
};
```

## Adding New Screens

1. **Define route in types.ts**
```typescript
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined; // Add new route
  Profile: { userId: string }; // With params
};
```

2. **Add screen to AppNavigator.tsx**
```typescript
<Stack.Screen
  name="Login"
  component={LoginScreen}
  options={{
    title: 'Sign In',
    headerShown: true,
  }}
/>
```

3. **Navigate from other screens**
```typescript
navigation.navigate('Login');
navigation.navigate('Profile', { userId: '123' });
```

## Navigation Options

### Common Options
```typescript
<Stack.Screen
  name="ScreenName"
  component={ScreenComponent}
  options={{
    title: 'Screen Title',
    headerShown: true,
    headerStyle: { backgroundColor: '#fff' },
    headerTintColor: '#000',
    headerTitleStyle: { fontWeight: 'bold' },
    animation: 'slide_from_right', // or 'fade', 'none'
  }}
/>
```

### Dynamic Options
```typescript
<Stack.Screen
  name="Profile"
  component={ProfileScreen}
  options={({ route }) => ({
    title: route.params.userName || 'Profile',
  })}
/>
```

## Navigation Methods

```typescript
// Navigate to screen
navigation.navigate('ScreenName');
navigation.navigate('ScreenName', { param: 'value' });

// Go back
navigation.goBack();

// Replace current screen
navigation.replace('ScreenName');

// Reset navigation state
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});

// Check if can go back
if (navigation.canGoBack()) {
  navigation.goBack();
}
```

## Best Practices

1. ✅ Always define types in `types.ts` for type safety
2. ✅ Use `useNavigation` hook for navigation in nested components
3. ✅ Use screen props for direct access to navigation in screen components
4. ✅ Keep navigation logic in screens, not in reusable components
5. ✅ Use `replace` instead of `navigate` for auth flows
6. ✅ Handle back button on Android with `useFocusEffect`
7. ✅ Clean up listeners in `useFocusEffect` cleanup function

## Testing Navigation

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { render } from '@testing-library/react-native';

const Stack = createNativeStackNavigator();

test('renders welcome screen', () => {
  const { getByText } = render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
  
  expect(getByText('no news')).toBeTruthy();
});
```

## Resources

- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [Type Checking with TypeScript](https://reactnavigation.org/docs/typescript)
- [Navigation Prop Reference](https://reactnavigation.org/docs/navigation-prop)
