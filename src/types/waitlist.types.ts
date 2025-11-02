/**
 * Waitlist entry stored in Firestore
 */
export interface WaitlistEntry {
    email: string;
    name?: string;
    createdAt: string;
    source?: 'mobile_app' | 'web' | 'other';
}

/**
 * Form data for waitlist submission
 */
export interface WaitlistFormData {
    email: string;
    name?: string;
}

