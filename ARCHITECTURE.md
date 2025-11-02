# noNews Architecture Overview

## Updated Project Summary

This is a **bookmarking application** with Firebase backend and React Native frontend.

### Key Changes from Initial Setup

#### 1. **Firebase Functions - v2 API**
- Using `firebase-functions` v6.0.1 (v2 API)
- Node.js 22 runtime
- Global options set: `maxInstances: 10` for cost control
- Simplified imports using v2 syntax:
  ```typescript
  import {onRequest} from "firebase-functions/https";
  import {onCall} from "firebase-functions/v2/https";
  import {onDocumentWritten} from "firebase-functions/v2/firestore";
  ```

#### 2. **TypeScript Configuration (Functions)**
- Module system: `NodeNext` / `nodenext`
- Target: ES2017
- Simplified configuration for Node.js 22

#### 3. **Firestore Data Model**

**Collections:**

**`users/{userId}`**
- User profile data
- `bookmarkCount` field tracks number of bookmarks
- Only owner can read/write their own profile

**`bookmarks/{bookmarkId}`**
- User bookmarks
- Fields should include: `userId`, bookmark data
- Access rules:
  - Authenticated users: unlimited bookmarks
  - Guest users: maximum 5 bookmarks
  - Users can only access their own bookmarks

#### 4. **Security Rules**

**Helper Functions:**
```javascript
function isSignedIn() {
  return request.auth != null;
}

function isOwner(userId) {
  return request.auth.uid == userId;
}

function isGuest() {
  return request.auth.token.firebase.sign_in_provider == 'anonymous';
}
```

**Key Security Features:**
- Users can only read/write their own data
- Guest users limited to 5 bookmarks
- Bookmark count validated on creation

#### 5. **Removed Features**
- Articles and comments system (replaced with bookmarks)
- Complex validation functions
- Firestore indexes (currently empty - add as needed)
- Testing infrastructure (can be added back if needed)

## Architecture Decisions

### Why Guest Users?
- Allows users to try the app without signing up
- Limited to 5 bookmarks to encourage registration
- Uses Firebase Anonymous Authentication

### Why Firebase Functions v2?
- Better performance and cost control
- Improved TypeScript support
- More flexible configuration options
- `maxInstances` setting prevents cost overruns

### Why Node.js 22?
- Latest LTS with better performance
- Native ESM support
- Improved security features

## Data Flow

```
User Action (React Native)
    ↓
Firebase Client SDK
    ↓
Firestore Security Rules (validate)
    ↓
Firestore Database
    ↓
Cloud Functions (triggers - if needed)
    ↓
Side effects / notifications
```

## Recommended Next Steps

### 1. Define Bookmark Schema
Create `src/types/bookmark.types.ts`:
```typescript
export interface Bookmark {
  id: string;
  userId: string;
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Create Bookmark Service
Create `src/services/bookmark.service.ts` to handle CRUD operations

### 3. Implement Guest User Flow
- Anonymous sign-in on app launch
- Prompt to upgrade after 5 bookmarks
- Migration of bookmarks on sign-up

### 4. Add Cloud Functions (if needed)
Using v2 API syntax:
```typescript
// functions/src/bookmarks/onBookmarkCreate.ts
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

export const onBookmarkCreate = onDocumentCreated(
  "bookmarks/{bookmarkId}",
  async (event) => {
    logger.info("New bookmark created", {bookmarkId: event.params.bookmarkId});
    // Update user's bookmarkCount
  }
);
```

### 5. Add Firestore Indexes
As you build queries, add indexes to `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "bookmarks",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "userId", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ]
}
```

## Cost Optimization

With `maxInstances: 10`, you're protected against:
- Unexpected traffic spikes
- DDoS attacks
- Runaway functions

Monitor usage in Firebase Console and adjust as needed.

## Development vs Production

**Development:**
- Use Firebase Emulators
- Test guest user limits locally
- No costs incurred

**Production:**
- Monitor Firestore reads/writes
- Watch Functions invocations
- Set up billing alerts

## Security Considerations

✅ Users isolated (can only see own bookmarks)
✅ Guest users limited to 5 bookmarks
✅ Owner validation on all operations
✅ Firebase Auth handles authentication

⚠️ **TODO:**
- Add URL validation for bookmarks
- Implement rate limiting in functions
- Add malicious content detection
- Set up monitoring and alerts

## Performance Tips

1. **Pagination**: Limit bookmark queries (e.g., 20 per page)
2. **Caching**: Use React Query for client-side caching
3. **Optimistic Updates**: Update UI before Firestore confirms
4. **Lazy Loading**: Load bookmark metadata on demand

## Monitoring

Add to your functions:
```typescript
import * as logger from "firebase-functions/logger";

// Structured logging
logger.info("Bookmark created", {
  userId: event.params.userId,
  bookmarkCount: newCount
});
```

View logs: `npm run logs` in functions directory

