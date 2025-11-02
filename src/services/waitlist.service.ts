import firestore from '@react-native-firebase/firestore';

export interface WaitlistEntry {
    email: string;
    name?: string;
    createdAt: string;
    source?: string;
}

/**
 * Service for managing waitlist entries in Firestore
 */
class WaitlistService {
    private readonly collectionName = 'waitlist';

    /**
     * Adds a new entry to the waitlist
     * @param email - User's email address
     * @param name - Optional user name
     * @returns Promise with the created entry ID
     */
    async addToWaitlist(
        email: string,
        name?: string
    ): Promise<{ id: string; success: boolean }> {
        try {
            // Create new waitlist entry
            // Note: Due to security rules, we can't check for duplicates without auth
            // Duplicate prevention should be handled on backend or admin side
            const entry: WaitlistEntry = {
                email: email.toLowerCase().trim(),
                name: name?.trim(),
                createdAt: new Date().toISOString(),
                source: 'mobile_app',
            };

            const docRef = await firestore()
                .collection(this.collectionName)
                .add(entry);

            console.log('Added to waitlist:', docRef.id);

            return { id: docRef.id, success: true };
        } catch (error) {
            console.error('Error adding to waitlist:', error);

            // Provide user-friendly error message
            const errorMessage =
                error instanceof Error && error.message.includes('permission-denied')
                    ? 'Unable to join waitlist at this time. Please try again later.'
                    : 'Failed to join waitlist. Please check your connection and try again.';

            throw new Error(errorMessage);
        }
    }

    /**
     * Note: The following methods require admin access due to security rules.
     * They can be implemented via Cloud Functions if needed.
     */

    /**
     * Gets the total number of waitlist entries
     * Note: This requires admin access - implement via Cloud Function
     * @returns Total count (placeholder - requires backend implementation)
     */
    async getWaitlistCount(): Promise<number> {
        console.warn('getWaitlistCount requires admin access - implement via Cloud Function');
        return 0;
    }

    /**
     * Gets waitlist position for a specific email
     * Note: This requires admin access - implement via Cloud Function
     * @param email - Email to check
     * @returns Position number (placeholder - requires backend implementation)
     */
    async getWaitlistPosition(email: string): Promise<number | null> {
        console.warn('getWaitlistPosition requires admin access - implement via Cloud Function');
        return null;
    }
}

export const waitlistService = new WaitlistService();

