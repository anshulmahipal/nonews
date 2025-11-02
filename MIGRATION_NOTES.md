# Migration Notes - What Changed

## Overview
The initial setup was for a general news/articles app, but the project has been updated to be a **bookmarking application** with specific features around guest users and bookmark limits.

## Major Changes

### 1. ✅ Firebase Functions - v2 API Migration

**Before (v1):**
```typescript
import * as functions from 'firebase-functions';

export const myFunction = functions.https.onRequest((req, res) => {
  // ...
});
```

**After (v2):**
```typescript
import {onRequest} from "firebase-functions/v2/https";

export const myFunction = onRequest((req, res) => {
  // ...
});
```

**Key Benefits:**
- Better performance
- Cost control with `maxInstances`
- Improved TypeScript support
- Native ESM support

### 2. ✅ Node.js Version Update

**Before:** Node.js 18
**After:** Node.js 22

Update your local environment:
```bash
nvm install 22
nvm use 22
```

### 3. ✅ Firestore Data Model Change

**Before:** Articles + Comments system
**After:** Bookmarks system with guest user limits

**New Collections:**
- `users/{userId}` - User profiles with `bookmarkCount`
- `bookmarks/{bookmarkId}` - User bookmarks

### 4. ✅ Security Rules Simplified

**Key Changes:**
- Added `isGuest()` helper function
- Guest users limited to 5 bookmarks
- Removed article/comment rules
- Simplified validation (moved to client/functions)

### 5. ✅ TypeScript Configuration

**Updated module system:**
- Module: `NodeNext`
- Module Resolution: `nodenext`
- Better ESM support

### 6. ✅ Removed Testing Infrastructure

**Removed packages:**
- Jest
- ts-jest
- Testing library dependencies
- ESLint plugins (minimal setup now)

**Reason:** Can be added back when needed, keeping initial setup simple.

### 7. ✅ Removed Complex Validation

**Moved from:** Firestore rules doing validation
**To:** Client-side and Cloud Functions validation

This provides better error messages and more flexibility.

## New Features Implemented

### Guest User Support
- Anonymous authentication
- 5 bookmark limit for guests
- Upgrade prompt when limit reached
- Bookmark migration on sign-up

### Bookmark Management
- CRUD operations for bookmarks
- Automatic bookmark counting
- Cloud Functions triggers for count updates

## Files That Should Be Updated

### ✅ Already Created:
- `src/types/bookmark.types.ts`
- `src/types/user.types.ts`
- `src/types/index.ts`
- `functions/src/auth/onUserCreate.ts`
- `functions/src/bookmarks/onBookmarkCreate.ts`
- `functions/src/bookmarks/onBookmarkDelete.ts`

### 📝 Still Need to Create:
1. **Auth Context** (`src/contexts/AuthContext.tsx`)
   - Handle anonymous sign-in
   - Track user state
   - Handle upgrades

2. **Bookmark Service** (`src/services/bookmark.service.ts`)
   - CRUD operations
   - Firestore integration

3. **Bookmark Hooks** (`src/hooks/useBookmarks.ts`)
   - List bookmarks
   - Create/update/delete
   - Handle guest limits

4. **Screens**
   - Login/Register screens
   - Bookmark list screen
   - Add bookmark screen
   - Guest upgrade prompt

## Configuration Updates Needed

### 1. Firebase Config
Ensure anonymous authentication is enabled:
```bash
# Firebase Console > Authentication > Sign-in methods
# Enable "Anonymous" provider
```

### 2. Environment Variables
No changes needed from original setup.

### 3. Package Installation
```bash
# Root
npm install

# Functions
cd functions
npm install
```

## Testing Your Setup

### 1. Start Emulators
```bash
firebase emulators:start
```

### 2. Test Anonymous Auth
```typescript
import { signInAnonymously } from 'firebase/auth';
import { auth } from './config/firebase.config';

await signInAnonymously(auth);
```

### 3. Test Bookmark Creation
```typescript
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from './config/firebase.config';

await addDoc(collection(firestore, 'bookmarks'), {
  userId: user.uid,
  url: 'https://example.com',
  title: 'Example',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### 4. Verify Cloud Functions
Check that functions deploy correctly:
```bash
cd functions
npm run build
firebase deploy --only functions
```

## Breaking Changes

### If You Had Existing Code:

1. **Update Function Imports:**
   ```typescript
   // Old
   import * as functions from 'firebase-functions';
   
   // New
   import {onRequest} from "firebase-functions/v2/https";
   ```

2. **Update Admin Imports:**
   ```typescript
   // Old
   import * as admin from 'firebase-admin';
   admin.firestore()
   
   // New
   import {getFirestore} from "firebase-admin/firestore";
   const db = getFirestore();
   ```

3. **Update Security Rules References:**
   - No more `articles` or `comments` collections
   - Use `bookmarks` collection instead

## Cost Implications

### Good News:
✅ `maxInstances: 10` protects against cost spikes
✅ Guest users limited to 5 bookmarks (reduces storage)
✅ Simplified data model (fewer reads/writes)

### Monitor:
- Firestore document reads/writes
- Functions invocations
- Storage usage

Set up billing alerts in Firebase Console!

## Next Steps

See `ARCHITECTURE.md` for recommended implementation steps.

