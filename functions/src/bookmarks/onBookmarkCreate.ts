/**
 * Firestore Trigger: On Bookmark Create
 * Updates the user's bookmarkCount when a new bookmark is created
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin (if not already initialized)
try {
    initializeApp();
} catch (e) {
    // Already initialized
}

const db = getFirestore();

export const onBookmarkCreate = onDocumentCreated(
    "bookmarks/{bookmarkId}",
    async (event) => {
        const bookmarkId = event.params.bookmarkId;
        const bookmark = event.data?.data();

        if (!bookmark) {
            logger.error("No bookmark data found", { bookmarkId });
            return;
        }

        const userId = bookmark.userId;

        if (!userId) {
            logger.error("No userId found in bookmark", { bookmarkId });
            return;
        }

        try {
            // Increment the user's bookmark count
            await db.collection("users").doc(userId).update({
                bookmarkCount: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp(),
            });

            logger.info("User bookmark count incremented", {
                userId,
                bookmarkId,
            });
        } catch (error) {
            logger.error("Error updating bookmark count", {
                userId,
                bookmarkId,
                error,
            });
        }
    }
);

