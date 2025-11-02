# Configuration

This directory contains app configuration files.

## Structure

```
config/
├── firebase.config.ts   # Firebase configuration
├── app.config.ts        # App-wide configuration
└── env.ts               # Environment variables
```

## Configuration Examples

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// app.config.ts
export const APP_CONFIG = {
  name: 'noNews',
  version: '1.0.0',
  apiTimeout: 30000,
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif'],
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const;

// env.ts
export const ENV = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  apiUrl: process.env.API_URL || '',
  sentryDsn: process.env.SENTRY_DSN || '',
} as const;
```

## Best Practices

- Never commit sensitive credentials
- Use environment variables
- Separate dev and prod configs
- Type your configuration objects
- Export as const for immutability
- Document all configuration options


