# Setup Functions

One-time setup functions for initializing the database and application state.

## initializeSources

Initializes all news source metadata in the `sources` collection.

### Why Run This?

The `sources` collection stores metadata about each news source (name, icon, URL, etc.). This data is referenced by articles when they're saved to Firestore. **You must run this function once before fetching any articles**.

### How to Run

#### Local Emulator

1. Start the emulators:
```bash
npm --prefix functions run serve
```

2. Call the function:
```bash
curl http://localhost:5001/<YOUR_PROJECT_ID>/<REGION>/initializeSources
```

Example:
```bash
curl http://localhost:5001/news-c5ff4/us-central1/initializeSources
```

3. You should see a response like:
```json
{
  "success": true,
  "message": "Sources initialized",
  "total": 1,
  "results": [
    {
      "id": "the-hindu",
      "name": "The Hindu",
      "status": "success"
    }
  ]
}
```

#### Production

1. Deploy the function:
```bash
firebase deploy --only functions:initializeSources
```

2. Call the function:
```bash
curl https://<REGION>-<PROJECT_ID>.cloudfunctions.net/initializeSources
```

3. **Optional**: After running once, you can delete or comment out this function to reduce deployed functions count.

### Verify Sources Were Created

Check the Firestore Emulator UI or Firebase Console:

1. Go to Firestore
2. Look for the `sources` collection
3. You should see documents like:
   - `the-hindu` - Contains The Hindu metadata

### When to Re-run

Re-run this function if you:
- Add a new news source
- Update source metadata (icon, URL, description, etc.)
- Reset your database

### Adding New Sources

Edit `initializeSources.ts` and add to the `SOURCES` array:

```typescript
const SOURCES = [
    {
        id: "the-hindu",
        config: { /* ... */ }
    },
    {
        id: "times-of-india",  // New source
        config: {
            name: "times-of-india",
            displayName: "Times of India",
            icon: "https://...",
            website: "https://timesofindia.indiatimes.com",
            rssUrl: "https://...",
            category: "news",
            language: "en",
            country: "IN",
            isActive: true
        }
    }
];
```

Then re-run the function.

## Troubleshooting

### "Source not found" error when fetching articles

**Problem**: You tried to fetch articles before initializing sources.

**Solution**: Run `initializeSources` first.

### Sources not appearing in Firestore

**Problem**: Function ran but sources aren't in the database.

**Solution**:
1. Check the function logs for errors
2. Verify Firestore security rules allow the function to write
3. Check that you're looking at the correct Firestore instance (emulator vs production)

### Need to update source metadata

**Problem**: Source icon, URL, or other metadata changed.

**Solution**: Just re-run `initializeSources` - it will update existing sources without creating duplicates.




