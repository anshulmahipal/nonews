/**
 * Firestore Trigger: On Bookmark Delete
 * Updates the user's bookmarkCount when a bookmark is deleted
 */

import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

export const onBookmarkDelete = onDocumentDeleted(
    "bookmarks/{bookmarkId}",
    async (event) => {
        const bookmarkId = event.params.bookmarkId;
        const bookmark = event.data?.data();

        if (!bookmark) {
            logger.warn("No bookmark data found on delete", { bookmarkId });
            return;
        }

        const userId = bookmark.userId;

        if (!userId) {
            logger.error("No userId found in deleted bookmark", { bookmarkId });
            return;
        }

        try {
            // Decrement the user's bookmark count (but not below 0)
            const userRef = db.collection("users").doc(userId);
            const userDoc = await userRef.get();
            const currentCount = userDoc.data()?.bookmarkCount || 0;

            await userRef.update({
                bookmarkCount: Math.max(0, currentCount - 1),
                updatedAt: FieldValue.serverTimestamp(),
            });

            logger.info("User bookmark count decremented", {
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

