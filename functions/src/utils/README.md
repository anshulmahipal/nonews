# Firebase Functions Utilities

Reusable utility functions for Firebase Cloud Functions.

## Files

### `rssParser.ts`

RSS/XML parsing utilities for fetching and parsing news feeds.

**Exports:**

- `parseRSS(xmlText: string): ParsedArticle[]` - Parse RSS XML and extract articles
- `extractTag(content: string, tagName: string): string` - Extract content between XML tags
- `cleanText(text: string): string` - Clean HTML entities and tags from text
- `extractFeedMetadata(xmlText: string)` - Extract RSS channel metadata (title, description, link)
- `get6AMto6AMWindow(timezone?: string)` - Get 24-hour time window from yesterday 6 AM to today 6 AM
- `filterArticlesByDate(articles, startTime, endTime)` - Filter articles within a date range

**Interfaces:**

- `ParsedArticle` - Article structure with title, link, description, dates, category, guid

**Usage Examples:**

```typescript
import { parseRSS, get6AMto6AMWindow, filterArticlesByDate, ParsedArticle } from "./utils/rssParser";

// Basic RSS parsing
const response = await fetch("https://example.com/feed.rss");
const xmlText = await response.text();
const articles: ParsedArticle[] = parseRSS(xmlText);

// Filter articles by 6 AM to 6 AM window
const allArticles = parseRSS(xmlText);
const { startTime, endTime } = get6AMto6AMWindow("Asia/Kolkata");
const filteredArticles = filterArticlesByDate(allArticles, startTime, endTime);
```

## Adding New Utilities

When adding new utility files:

1. Create the file in this directory
2. Export functions with proper TypeScript types
3. Add JSDoc comments for documentation
4. Update this README with usage examples
5. Write unit tests if applicable

## Best Practices

- Keep utilities **pure functions** when possible
- Add proper **error handling**
- Use **TypeScript** for type safety
- Document all **public APIs**
- Make functions **reusable** across different functions

