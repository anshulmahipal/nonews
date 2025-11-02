# Firebase Cloud Functions

This directory contains the backend Firebase Cloud Functions.

## Structure

```
functions/
├── src/
│   ├── index.ts              # Main entry point
│   ├── auth/                 # Authentication triggers
│   ├── firestore/            # Firestore triggers
│   ├── callable/             # Callable functions
│   ├── scheduled/            # Scheduled functions
│   ├── utils/                # Utility functions
│   └── types/                # Type definitions
├── package.json
└── tsconfig.json
```

## Function Examples

```typescript
// src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Export all functions
export * from './auth';
export * from './callable';
export * from './firestore';
export * from './scheduled';

// src/auth/onUserCreate.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Trigger when a new user is created
 * Initializes user profile in Firestore
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const userProfile = {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('users').doc(user.uid).set(userProfile);

    functions.logger.info(`User profile created for ${user.uid}`);
  } catch (error) {
    functions.logger.error('Error creating user profile:', error);
  }
});

// src/callable/updateUserProfile.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Joi from 'joi';

const schema = Joi.object({
  displayName: Joi.string().min(2).max(50),
  bio: Joi.string().max(500),
  photoURL: Joi.string().uri(),
});

/**
 * Callable function to update user profile
 */
export const updateUserProfile = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // Validate input
  const { error, value } = schema.validate(data);
  if (error) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      error.details[0].message
    );
  }

  try {
    await admin
      .firestore()
      .collection('users')
      .doc(context.auth.uid)
      .update({
        ...value,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    functions.logger.error('Error updating profile:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update profile'
    );
  }
});

// src/scheduled/cleanupOldData.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Scheduled function to clean up old data
 * Runs daily at midnight
 */
export const cleanupOldData = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const snapshot = await admin
        .firestore()
        .collection('temporaryData')
        .where('createdAt', '<', thirtyDaysAgo)
        .get();

      const batch = admin.firestore().batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      functions.logger.info(`Cleaned up ${snapshot.size} old documents`);
    } catch (error) {
      functions.logger.error('Error cleaning up data:', error);
    }
  });
```

## Development

### Install Dependencies
```bash
cd functions
npm install
```

### Run Locally with Emulators
```bash
firebase emulators:start
```

### Deploy Functions
```bash
firebase deploy --only functions
```

### Deploy Specific Function
```bash
firebase deploy --only functions:updateUserProfile
```

## Testing

```bash
cd functions
npm test
```

## Best Practices

- Always validate inputs
- Check authentication and authorization
- Use structured logging with `functions.logger`
- Handle errors gracefully
- Use TypeScript for type safety
- Keep functions focused (single responsibility)
- Use callable functions for client interactions
- Use background functions for async operations
- Implement retry logic for external APIs
- Monitor function performance and costs


