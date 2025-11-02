/**
 * Bookmark Type Definitions
 */

export interface Bookmark {
    id: string;
    userId: string;
    url: string;
    title: string;
    description?: string;
    tags?: string[];
    thumbnailUrl?: string;
    favicon?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookmarkInput {
    url: string;
    title: string;
    description?: string;
    tags?: string[];
}

export interface UpdateBookmarkInput {
    title?: string;
    description?: string;
    tags?: string[];
}

export interface BookmarkFilter {
    tags?: string[];
    searchTerm?: string;
}

export interface BookmarkMetadata {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    favicon?: string;
}

