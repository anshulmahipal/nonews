/**
 * Firestore Utilities
 * 
 * Helper functions for saving and managing data in Firestore
 */

import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

/**
 * Save results from article saves
 */
export interface SaveResults {
    saved: number;
    skipped: number;
    errors: number;
}

/**
 * Source data structure for Firestore
 */
export interface SourceData {
    name: string;
    displayName: string;
    icon: string;
    website: string;
    rssUrl: string;
    category: string;
    language: string;
    country: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Article data structure for saving to Firestore
 */
export interface ArticleData {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    publishedAt: string | null;
    category: string | null;
    guid: string;
    [key: string]: any; // Allow additional fields
}

/**
 * Save articles to Firestore editorials collection
 * Uses article guid as document ID to prevent duplicates
 * 
 * @param articles - Array of articles to save
 * @param sourceId - Source document ID (references sources collection)
 * @param collectionName - Firestore collection name (default: "editorials")
 * @returns Save statistics (saved, skipped, errors)
 * 
 * @example
 * const results = await saveArticlesToFirestore(articles, "the-hindu");
 * console.log(`Saved: ${results.saved}, Skipped: ${results.skipped}`);
 */
export async function saveArticlesToFirestore(
    articles: ArticleData[],
    sourceId: string,
    collectionName: string = "editorials"
): Promise<SaveResults> {
    if (articles.length === 0) {
        logger.info("No articles to save");
        return { saved: 0, skipped: 0, errors: 0 };
    }

    const batch = db.batch();
    let saved = 0;
    let skipped = 0;
    let errors = 0;

    for (const article of articles) {
        try {
            // Use a hash of the guid as document ID for consistency
            // This ensures the same article always gets the same ID
            const docId = Buffer.from(article.guid)
                .toString('base64')
                .replace(/[/+=]/g, '')
                .substring(0, 50);

            const articleRef = db.collection(collectionName).doc(docId);

            // Check if article already exists
            const existingDoc = await articleRef.get();

            if (existingDoc.exists) {
                logger.info(`Article already exists: ${article.title.substring(0, 50)}`);
                skipped++;
                continue;
            }

            // Create reference to source document
            const sourceRef = db.collection('sources').doc(sourceId);

            // Prepare article data
            const articleData = {
                title: article.title,
                link: article.link,
                description: article.description,
                pubDate: article.pubDate,
                publishedAt: article.publishedAt,
                category: article.category || 'editorial',
                guid: article.guid,
                source: sourceRef, // Reference to sources collection
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            batch.set(articleRef, articleData);
            saved++;

        } catch (error) {
            logger.error(`Error preparing article for save: ${article.title}`, error);
            errors++;
        }
    }

    // Commit the batch
    try {
        if (saved > 0) {
            await batch.commit();
            logger.info(`Successfully saved ${saved} articles to Firestore collection: ${collectionName}`);
        }
    } catch (error) {
        logger.error("Error committing batch to Firestore", error);
        throw error;
    }

    return { saved, skipped, errors };
}

/**
 * Get articles from Firestore by source
 * 
 * @param source - Source identifier
 * @param limit - Maximum number of articles to return (default: 20)
 * @param collectionName - Firestore collection name (default: "editorials")
 * @returns Array of articles
 */
export async function getArticlesBySource(
    source: string,
    limit: number = 20,
    collectionName: string = "editorials"
): Promise<any[]> {
    try {
        const snapshot = await db.collection(collectionName)
            .where('source', '==', source)
            .orderBy('publishedAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        logger.error(`Error getting articles by source: ${source}`, error);
        throw error;
    }
}

/**
 * Get recent articles from Firestore
 * 
 * @param limit - Maximum number of articles to return (default: 20)
 * @param collectionName - Firestore collection name (default: "editorials")
 * @returns Array of recent articles
 */
export async function getRecentArticles(
    limit: number = 20,
    collectionName: string = "editorials"
): Promise<any[]> {
    try {
        const snapshot = await db.collection(collectionName)
            .orderBy('publishedAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        logger.error('Error getting recent articles', error);
        throw error;
    }
}

/**
 * Delete old articles from Firestore
 * 
 * @param daysOld - Delete articles older than this many days
 * @param collectionName - Firestore collection name (default: "editorials")
 * @returns Number of articles deleted
 */
export async function deleteOldArticles(
    daysOld: number = 30,
    collectionName: string = "editorials"
): Promise<number> {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const snapshot = await db.collection(collectionName)
            .where('publishedAt', '<', cutoffDate.toISOString())
            .get();

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        logger.info(`Deleted ${snapshot.size} old articles (older than ${daysOld} days)`);
        return snapshot.size;
    } catch (error) {
        logger.error('Error deleting old articles', error);
        throw error;
    }
}

/**
 * Check if article exists in Firestore by guid
 * 
 * @param guid - Article guid
 * @param collectionName - Firestore collection name (default: "editorials")
 * @returns True if article exists
 */
export async function articleExists(
    guid: string,
    collectionName: string = "editorials"
): Promise<boolean> {
    try {
        const docId = Buffer.from(guid)
            .toString('base64')
            .replace(/[/+=]/g, '')
            .substring(0, 50);

        const doc = await db.collection(collectionName).doc(docId).get();
        return doc.exists;
    } catch (error) {
        logger.error(`Error checking if article exists: ${guid}`, error);
        return false;
    }
}

/**
 * Create or update a source in Firestore
 * 
 * @param sourceId - Document ID for the source (e.g., "the-hindu")
 * @param sourceData - Source data
 * @returns Created/updated source
 * 
 * @example
 * await createOrUpdateSource("the-hindu", {
 *   name: "the-hindu",
 *   displayName: "The Hindu",
 *   icon: "https://example.com/hindu-icon.png",
 *   website: "https://www.thehindu.com",
 *   rssUrl: "https://www.thehindu.com/opinion/feeder/default.rss",
 *   category: "news",
 *   language: "en",
 *   country: "IN",
 *   isActive: true
 * });
 */
export async function createOrUpdateSource(
    sourceId: string,
    sourceData: Omit<SourceData, 'createdAt' | 'updatedAt'>
): Promise<void> {
    try {
        const sourceRef = db.collection('sources').doc(sourceId);
        const existingDoc = await sourceRef.get();

        const now = new Date().toISOString();

        if (existingDoc.exists) {
            // Update existing source
            await sourceRef.update({
                ...sourceData,
                updatedAt: now
            });
            logger.info(`Updated source: ${sourceId}`);
        } else {
            // Create new source
            await sourceRef.set({
                ...sourceData,
                createdAt: now,
                updatedAt: now
            });
            logger.info(`Created source: ${sourceId}`);
        }
    } catch (error) {
        logger.error(`Error creating/updating source: ${sourceId}`, error);
        throw error;
    }
}

/**
 * Get source by ID
 * 
 * @param sourceId - Source document ID
 * @returns Source data or null if not found
 */
export async function getSource(sourceId: string): Promise<SourceData | null> {
    try {
        const doc = await db.collection('sources').doc(sourceId).get();

        if (!doc.exists) {
            return null;
        }

        return doc.data() as SourceData;
    } catch (error) {
        logger.error(`Error getting source: ${sourceId}`, error);
        throw error;
    }
}

/**
 * Get all active sources
 * 
 * @returns Array of active sources
 */
export async function getActiveSources(): Promise<Array<SourceData & { id: string }>> {
    try {
        const snapshot = await db.collection('sources')
            .where('isActive', '==', true)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as SourceData
        }));
    } catch (error) {
        logger.error('Error getting active sources', error);
        throw error;
    }
}

