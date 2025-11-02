/**
 * User Type Definitions
 */

export interface User {
    id: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    isAnonymous: boolean;
    bookmarkCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile extends User {
    bio?: string;
    settings?: UserSettings;
}

export interface UserSettings {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    defaultView?: 'grid' | 'list';
}

export type AuthProvider = 'email' | 'google' | 'apple' | 'anonymous';

export const GUEST_BOOKMARK_LIMIT = 5;

