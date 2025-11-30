# Firebase Cloud Functions Documentation

> Backend API and automation for noNews bookmarking application

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Functions Reference](#functions-reference)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Testing](#testing)

## 🎯 Overview

The `functions/` directory contains all Firebase Cloud Functions that power the noNews backend. These functions handle:

- **Authentication triggers** - User profile initialization
- **Bookmark operations** - CRUD with count tracking
- **Editorial fetching** - Automated content from news sources
- **Content filtering** - Full article extraction and parsing
- **Database triggers** - Automatic updates on data changes

### Technology Stack

- **Runtime:** Node.js 22
- **Language:** TypeScript (strict mode)
- **Framework:** Firebase Functions v2 (firebase-functions v6+)
- **Database:** Firestore
- **API Version:** v2 (modern API with better performance)

## 🏗️ Architecture

### Function Types

```typescript
// HTTP Functions (onRequest, onCall)
export const theHindu = onRequest(async (req, res) => { ... });

// Database Triggers (onDocumentCreated, onDocumentDeleted)
export const onBookmarkCreate = onDocumentCreated(
  "bookmarks/{bookmarkId}",
  async (event) => { ... }
);

// Auth Triggers (beforeUserCreated, onUserCreated)
export const onUserCreate = onUserCreated(async (event) => { ... });
```

### Cost Control

All functions are configured with `maxInstances: 10` to prevent cost spikes:

```typescript
{
  maxInstances: 10,  // Prevent excessive scaling
  timeoutSeconds: 60, // Default timeout
  memory: "256MB"     // Default memory
}
```

## 📁 Project Structure

```
functions/
├── src/                          # TypeScript source code
│   ├── auth/                     # Authentication functions
│   │   └── onUserCreate.ts       # Initialize user profile on signup
│   │
│   ├── bookmarks/                # Bookmark management
│   │   ├── onBookmarkCreate.ts   # Increment user bookmark count
│   │   └── onBookmarkDelete.ts   # Decrement user bookmark count
│   │
│   ├── fetcheditorial/           # Editorial content fetchers
│   │   └── theHindu.ts           # Fetch The Hindu editorials (RSS)
│   │
│   ├── filtercontent/            # Article content extractors
│   │   ├── theHindu.ts           # Extract full article content
│   │   └── example.ts            # Usage examples
│   │
│   ├── setup/                    # Initialization scripts
│   │   ├── initializeSources.ts  # Initialize news source metadata
│   │   └── README.md             # Setup documentation
│   │
│   ├── utils/                    # Shared utilities
│   │   ├── rssParser.ts          # RSS feed parsing utilities
│   │   ├── firestoreUtils.ts     # Firestore save operations
│   │   └── README.md             # Utilities documentation
│   │
│   └── index.ts                  # Function exports
│
├── lib/                          # Compiled JavaScript (gitignored)
├── node_modules/                 # Dependencies (gitignored)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Functions documentation
```

## 🔧 Functions Reference

### Authentication Functions

#### `onUserCreate`
**Trigger:** User account creation (Auth trigger)  
**Purpose:** Initialize user profile in Firestore

```typescript
// Automatically called when user signs up
// Creates document in users/{userId} with:
{
  userId: string,
  email: string | null,
  displayName: string | null,
  isAnonymous: boolean,
  bookmarkCount: 0,
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

**File:** `src/auth/onUserCreate.ts`

---

### Bookmark Functions

#### `onBookmarkCreate`
**Trigger:** Firestore document creation in `bookmarks/{bookmarkId}`  
**Purpose:** Increment user's bookmark count

```typescript
// Automatically increments bookmarkCount when:
// - User creates a new bookmark
// Updates: users/{userId}.bookmarkCount += 1
```

**File:** `src/bookmarks/onBookmarkCreate.ts`

#### `onBookmarkDelete`
**Trigger:** Firestore document deletion in `bookmarks/{bookmarkId}`  
**Purpose:** Decrement user's bookmark count

```typescript
// Automatically decrements bookmarkCount when:
// - User deletes a bookmark
// Updates: users/{userId}.bookmarkCount -= 1
```

**File:** `src/bookmarks/onBookmarkDelete.ts`

---

### Editorial Fetching Functions

#### `theHindu`
**Type:** HTTP Request (onRequest)  
**Purpose:** Fetch and filter The Hindu editorial articles from RSS feed

**Endpoint:** `GET /theHindu`

**Process:**
1. Fetches RSS feed from `https://www.thehindu.com/opinion/feeder/default.rss`
2. Parses XML to extract articles
3. Filters articles by 6 AM to 6 AM IST time window
4. Saves filtered articles to Firestore with source reference
5. Returns statistics and article data

**Response:**
```json
{
  "success": true,
  "source": "the-hindu",
  "fetchedAt": "2025-11-30T...",
  "feedLastUpdated": "2025-11-30T...",
  "timeWindow": {
    "start": "2025-11-29T00:30:00.000Z",
    "end": "2025-11-30T00:30:00.000Z"
  },
  "totalArticles": 100,
  "filteredArticles": 15,
  "savedToDatabase": 15,
  "skipped": 0,
  "errors": 0,
  "articles": [...]
}
```

**File:** `src/fetcheditorial/theHindu.ts`

**Note:** Requires source metadata to be initialized first using `initializeSources` function.

---

### Content Filtering Functions

#### `filterTheHinduArticle`
**Type:** Utility function (not deployed as HTTP function)  
**Purpose:** Extract full article content from The Hindu article URL

**Usage:**
```typescript
import { filterTheHinduArticle } from './filtercontent/theHindu';

const content = await filterTheHinduArticle(
  'https://www.thehindu.com/opinion/op-ed/article.ece'
);
```

**Returns:**
```typescript
{
  title: string,
  url: string,
  imageUrl: string | null,
  imageCaption: string | null,
  content: string,              // Plain text
  htmlContent: string,          // HTML formatted
  publishedAt: string | null,
  category: string | null,
  relatedArticles: Array<{
    title: string,
    url: string
  }>
}
```

**Features:**
- Extracts high-resolution images (LANDSCAPE_1200)
- Removes ads, related stories, and promotional content
- Converts HTML entities to proper characters
- Zero external dependencies (uses native fetch + regex)

**File:** `src/filtercontent/theHindu.ts`

---

### Setup Functions

#### `initializeSources`
**Type:** Utility function  
**Purpose:** Initialize news source metadata in Firestore

**Usage:**
```typescript
import { initializeSources } from './setup/initializeSources';

await initializeSources();
```

**Creates:**
- `sources/the-hindu` document with metadata
- Required before using `theHindu` editorial fetching function

**File:** `src/setup/initializeSources.ts`

---

## 🔨 Development Guide

### Setup

```bash
cd functions
npm install
```

### Available Scripts

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode (auto-compile on changes)
npm run build:watch

# Run local Firebase emulators
npm run serve

# Deploy functions to Firebase
npm run deploy

# View function logs
npm run logs
```

### Local Development

```bash
# Terminal 1: Watch TypeScript compilation
npm run build:watch

# Terminal 2: Run emulators
npm run serve

# Access functions at:
# http://localhost:5001/<project-id>/<region>/<function-name>
```

### Creating a New Function

1. **Create TypeScript file:**
```typescript
// src/myfunction/myFunction.ts
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const myFunction = onRequest(async (req, res) => {
  try {
    logger.info("Function called");
    
    // Your logic here
    
    res.json({ success: true });
  } catch (error) {
    logger.error("Error", error);
    res.status(500).json({ error: "Failed" });
  }
});
```

2. **Export in index.ts:**
```typescript
// src/index.ts
export { myFunction } from "./myfunction/myFunction";
```

3. **Build and deploy:**
```bash
npm run build
firebase deploy --only functions:myFunction
```

### Function Configuration

Customize function settings:

```typescript
import { onRequest } from "firebase-functions/v2/https";

export const myFunction = onRequest(
  {
    maxInstances: 10,        // Max concurrent instances
    timeoutSeconds: 300,     // 5 minutes max
    memory: "512MB",         // Memory allocation
    region: "us-central1"    // Deployment region
  },
  async (req, res) => {
    // Function logic
  }
);
```

## 🚀 Deployment

### Deploy All Functions

```bash
cd functions
npm run build
npm run deploy
```

### Deploy Specific Function

```bash
firebase deploy --only functions:theHindu
```

### Deploy Multiple Functions

```bash
firebase deploy --only functions:theHindu,functions:onUserCreate
```

### Check Deployed Functions

```bash
firebase functions:list
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Manual Testing

```bash
# Start emulators
npm run serve

# Test HTTP function
curl http://localhost:5001/<project-id>/us-central1/theHindu

# Test with Firebase CLI
firebase functions:shell
> theHindu()
```

## 📊 Monitoring

### View Logs

```bash
# All functions
npm run logs

# Specific function
firebase functions:log --only theHindu

# Follow logs (live)
firebase functions:log --only theHindu --follow
```

### Firebase Console

Monitor function execution, errors, and performance:
- https://console.firebase.google.com
- Functions → Dashboard
- View metrics, logs, and error reports

## 🔐 Security

### Authentication Checks

Always verify user authentication:

```typescript
import { onCall, HttpsError } from "firebase-functions/v2/https";

export const secureFunction = onCall(async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Access user data
  const userId = request.auth.uid;
  
  // Your logic here
});
```

### Input Validation

Always validate inputs:

```typescript
if (!request.data.url || typeof request.data.url !== 'string') {
  throw new HttpsError('invalid-argument', 'URL is required');
}
```

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf lib/
npm run build
```

### Deployment Failures

```bash
# Check Firebase login
firebase login

# Check project
firebase projects:list
firebase use <project-id>

# Deploy with verbose logging
firebase deploy --only functions --debug
```

### Function Not Triggering

1. Check function is deployed: `firebase functions:list`
2. Check logs for errors: `firebase functions:log`
3. Verify Firestore path matches trigger path
4. Check Firebase project billing is enabled

## 📝 Best Practices

1. **Always use TypeScript** for type safety
2. **Add JSDoc comments** for all exported functions
3. **Handle errors gracefully** with try-catch blocks
4. **Use structured logging** with `firebase-functions/logger`
5. **Set maxInstances** to control costs
6. **Validate all inputs** before processing
7. **Return proper HTTP status codes**
8. **Keep functions modular** and single-purpose
9. **Use async/await** over promise chains
10. **Test locally** with emulators before deploying

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Functions v2 API Reference](https://firebase.google.com/docs/reference/functions)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

---

**Last Updated:** November 30, 2025

