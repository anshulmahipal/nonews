# Types

This directory contains TypeScript type definitions and interfaces.

## Structure

```
types/
├── index.ts            # Main type exports
├── user.types.ts       # User-related types
├── article.types.ts    # Article-related types
├── api.types.ts        # API response types
└── [feature].types.ts  # Feature-specific types
```

## Type Definition Examples

```typescript
// user.types.ts
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  followers: number;
  following: number;
  articlesCount: number;
}

export type UserRole = 'admin' | 'moderator' | 'user';

// api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// article.types.ts
export interface Article {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  imageUrl?: string;
  publishedAt: string;
  updatedAt: string;
  likes: number;
  views: number;
}

export interface ArticleFilter {
  tags?: string[];
  authorId?: string;
  startDate?: string;
  endDate?: string;
}

// index.ts
export * from './user.types';
export * from './article.types';
export * from './api.types';
```

## Best Practices

- Use interfaces for objects
- Use types for unions and primitives
- Export all types from index.ts
- Use consistent naming (suffix with Type or Interface if needed)
- Document complex types with comments
- Use generics for reusable types
- Avoid using 'any' type


