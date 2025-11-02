/**
 * Firebase Cloud Functions Entry Point
 * 
 * This file exports all Firebase Cloud Functions for the noNews bookmarking app.
 * Using Firebase Functions v2 API with Node.js 22
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin SDK
initializeApp();

// Set global options for cost control
// Max 10 concurrent instances to prevent unexpected costs
setGlobalOptions({ maxInstances: 3 });

// Export all function modules
// Auth triggers


// Bookmark triggers
export * from "./bookmarks/onBookmarkCreate";
export * from "./bookmarks/onBookmarkDelete";

// Callable functions (uncomment as you create them)
// export * from "./callable/upgradeGuestAccount";
// export * from "./callable/fetchBookmarkMetadata";

// Scheduled functions (uncomment as you create them)
// export * from "./scheduled/cleanupOldBookmarks";
export * from "./fetcheditorial/theHindu";