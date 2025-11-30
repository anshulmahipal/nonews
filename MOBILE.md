# React Native Mobile App Documentation

> Cross-platform iOS and Android application for noNews bookmarking

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Development Guide](#development-guide)
- [Firebase Integration](#firebase-integration)
- [State Management](#state-management)
- [Navigation](#navigation)
- [Styling](#styling)
- [Testing](#testing)
- [Deployment](#deployment)

## 🎯 Overview

The `src/` directory contains the React Native mobile application for noNews. This is a cross-platform app that runs on both iOS and Android devices.

### Technology Stack

- **Framework:** React Native
- **Language:** TypeScript (strict mode)
- **Platforms:** iOS, Android
- **State Management:** React Context + Hooks
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Navigation:** React Navigation v6+
- **Styling:** React Native StyleSheet

### Key Features

- 📱 Cross-platform (iOS/Android)
- 👤 Guest mode (5 bookmark limit)
- 🔐 User authentication
- 📰 Browse and bookmark articles
- 🔍 Search and filter bookmarks
- ☁️ Cloud sync via Firestore
- 🎨 Modern, responsive UI

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Button.tsx          # Custom button component
│   ├── Card.tsx            # Article card component
│   ├── Input.tsx           # Form input component
│   ├── LoadingSpinner.tsx  # Loading indicator
│   └── README.md
│
├── screens/                # Screen components
│   ├── WelcomeScreen.tsx   # Initial landing screen
│   ├── HomeScreen.tsx      # Main bookmarks list
│   ├── ArticleScreen.tsx   # Article detail view
│   ├── ProfileScreen.tsx   # User profile
│   └── README.md
│
├── navigation/             # Navigation setup
│   ├── AppNavigator.tsx    # Main navigation container
│   ├── AuthNavigator.tsx   # Auth flow navigation
│   ├── types.ts            # Navigation type definitions
│   └── README.md
│
├── services/               # API and backend services
│   ├── firebase.ts         # Firebase initialization
│   ├── auth.service.ts     # Authentication service
│   ├── bookmark.service.ts # Bookmark CRUD operations
│   ├── waitlist.service.ts # Waitlist functionality
│   └── README.md
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useBookmarks.ts     # Bookmarks management hook
│   ├── useArticles.ts      # Articles fetching hook
│   └── README.md
│
├── contexts/               # React Context providers
│   ├── AuthContext.tsx     # Authentication context
│   ├── BookmarkContext.tsx # Bookmarks state context
│   └── README.md
│
├── utils/                  # Utility functions
│   ├── validators.ts       # Form validation
│   ├── formatters.ts       # Date/text formatting
│   ├── constants.ts        # App constants
│   └── README.md
│
├── types/                  # TypeScript type definitions
│   ├── bookmark.types.ts   # Bookmark interfaces
│   ├── user.types.ts       # User interfaces
│   ├── waitlist.types.ts   # Waitlist interfaces
│   ├── index.ts            # Type exports
│   └── README.md
│
├── config/                 # App configuration
│   ├── firebase.config.ts  # Firebase configuration
│   ├── theme.ts            # App theme (colors, fonts)
│   └── README.md
│
└── assets/                 # Static assets
    ├── fonts/              # Custom fonts
    ├── icons/              # App icons
    │   └── app_icon.png
    └── images/             # Images and graphics
```

## ✨ Features

### 1. Guest User Mode

**Functionality:**
- Anonymous authentication via Firebase
- Limited to 5 bookmarks
- Upgrade prompt when limit reached
- Data preserved during upgrade

**Implementation:**
```typescript
// services/auth.service.ts
export const signInAsGuest = async (): Promise<User> => {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
};

// Check bookmark limit
export const canAddBookmark = async (userId: string): Promise<boolean> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const user = userDoc.data();
  
  if (user.isAnonymous && user.bookmarkCount >= 5) {
    return false;
  }
  
  return true;
};
```

### 2. User Authentication

**Methods Supported:**
- Email/Password
- Anonymous (Guest)
- Account upgrade (Guest → Registered)

**Auth Flow:**
```
┌─────────────────┐
│  WelcomeScreen  │
└────────┬────────┘
         │
    ┌────┴─────┐
    │   User   │
    │  Choice  │
    └────┬─────┘
         │
    ┌────┴───────────────┐
    │                    │
┌───▼─────┐      ┌──────▼────┐
│  Guest  │      │   Sign    │
│  Mode   │      │  In/Up    │
└───┬─────┘      └──────┬────┘
    │                   │
    └───────┬───────────┘
            │
       ┌────▼────┐
       │  Home   │
       │ Screen  │
       └─────────┘
```

**Account Upgrade:**
```typescript
// services/auth.service.ts
export const upgradeGuestAccount = async (
  email: string,
  password: string
): Promise<void> => {
  const credential = EmailAuthProvider.credential(email, password);
  await linkWithCredential(auth.currentUser!, credential);
  
  // Update Firestore user document
  await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
    isAnonymous: false,
    email: email,
    updatedAt: new Date().toISOString()
  });
};
```

### 3. Bookmark Management

**Operations:**
- Create bookmark
- Read bookmarks (with pagination)
- Update bookmark (title, notes, tags)
- Delete bookmark
- Search bookmarks
- Filter by category/tag

**Data Structure:**
```typescript
// types/bookmark.types.ts
export interface Bookmark {
  id: string;
  userId: string;
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Service Implementation:**
```typescript
// services/bookmark.service.ts
export const createBookmark = async (
  userId: string,
  bookmarkData: Partial<Bookmark>
): Promise<string> => {
  // Check limit for guest users
  const canAdd = await canAddBookmark(userId);
  if (!canAdd) {
    throw new Error('Bookmark limit reached. Please upgrade your account.');
  }

  const docRef = await addDoc(collection(db, 'bookmarks'), {
    userId,
    ...bookmarkData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return docRef.id;
};
```

### 4. Real-time Sync

**Firestore Listeners:**
```typescript
// hooks/useBookmarks.ts
export const useBookmarks = (userId: string) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bookmark[];
      
      setBookmarks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { bookmarks, loading };
};
```

## 🔨 Development Guide

### Prerequisites

- Node.js 18+
- npm or yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Setup

```bash
# Install dependencies
npm install

# iOS specific
cd ios && pod install && cd ..

# Android specific
# Open android/ folder in Android Studio and sync Gradle
```

### Firebase Configuration

1. **Download Firebase config files:**
   - iOS: `GoogleService-Info.plist`
   - Android: `google-services.json`

2. **Place config files:**
   - iOS: `ios/noNews/GoogleService-Info.plist`
   - Android: `android/app/google-services.json`

3. **Initialize Firebase in app:**
```typescript
// src/config/firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Running the App

```bash
# Run on iOS
npx react-native run-ios

# Run on specific iOS device
npx react-native run-ios --device "iPhone 15 Pro"

# Run on Android
npx react-native run-android

# Run on specific Android device
npx react-native run-android --deviceId=<device-id>

# Start Metro bundler separately
npx react-native start
```

### Development Workflow

```bash
# Terminal 1: Metro Bundler
npx react-native start

# Terminal 2: Run iOS
npx react-native run-ios

# Terminal 3: View logs
npx react-native log-ios
# or
npx react-native log-android
```

## 🎨 Styling

### Theme Configuration

```typescript
// config/theme.ts
export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    
    background: '#FFFFFF',
    backgroundSecondary: '#F2F2F7',
    
    text: '#000000',
    textSecondary: '#8E8E93',
    
    border: '#C6C6C8',
    separator: '#E5E5EA'
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  
  typography: {
    h1: { fontSize: 34, fontWeight: 'bold' },
    h2: { fontSize: 28, fontWeight: 'bold' },
    h3: { fontSize: 22, fontWeight: 'bold' },
    body: { fontSize: 17, fontWeight: 'normal' },
    caption: { fontSize: 13, fontWeight: 'normal' }
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999
  }
};
```

### Component Styling

```typescript
// components/Button.tsx
import { StyleSheet } from 'react-native';
import { theme } from '../config/theme';

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center'
  },
  
  buttonText: {
    color: '#FFFFFF',
    ...theme.typography.body,
    fontWeight: '600'
  }
});
```

### Responsive Design

```typescript
// utils/responsive.ts
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 768;
export const isLargeDevice = width >= 768;

export const wp = (percentage: number) => (width * percentage) / 100;
export const hp = (percentage: number) => (height * percentage) / 100;

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
```

## 🧪 Testing

### Unit Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### E2E Tests (Detox)

```bash
# Build app for testing
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug
```

## 📦 Building

### iOS

```bash
# Development build
npx react-native run-ios --configuration Debug

# Release build
cd ios
xcodebuild -workspace noNews.xcworkspace \
  -scheme noNews \
  -configuration Release \
  -archivePath ./build/noNews.xcarchive \
  archive
```

### Android

```bash
# Development build
npx react-native run-android --variant=debug

# Release build
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

## 🚀 Deployment

### iOS App Store

1. Increment version in `ios/noNews/Info.plist`
2. Archive in Xcode
3. Upload to App Store Connect
4. Submit for review

### Google Play Store

1. Increment version in `android/app/build.gradle`
2. Generate signed APK/AAB
3. Upload to Google Play Console
4. Submit for review

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Firebase React Native](https://rnfirebase.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Last Updated:** November 30, 2025

