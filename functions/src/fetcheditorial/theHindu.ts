import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { parseRSS, get6AMto6AMWindow, filterArticlesByDate, extractFeedMetadata } from "../utils/rssParser";
import { saveArticlesToFirestore } from "../utils/firestoreUtils";

/**
 * Source ID for The Hindu
 * Note: Source metadata must be initialized first by calling initializeSources function
 * @see functions/src/setup/initializeSources.ts
 */
const SOURCE_ID = "the-hindu";

/**
 * Fetches and parses The Hindu editorial RSS feed
 * Returns articles published between yesterday 6 AM and today 6 AM (IST)
 * 
 * @example
 * GET /theHindu
 * Response: {
 *   success: true,
 *   source: "The Hindu - Opinion",
 *   fetchedAt: "2025-10-17T...",
 *   timeWindow: { start: "2025-10-16T06:00:00.000Z", end: "2025-10-17T06:00:00.000Z" },
 *   totalArticles: 100,
 *   filteredArticles: 15,
 *   articles: [...]
 * }
 */
const theHindu = onRequest(async (req, res) => {
    try {
        logger.info("Fetching The Hindu editorial RSS feed");

        const response = await fetch("https://www.thehindu.com/opinion/feeder/default.rss");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlText = await response.text();

        // Extract feed metadata (including lastBuildDate)
        const feedMetadata = extractFeedMetadata(xmlText);
        logger.info(`Feed metadata:`, {
            title: feedMetadata.title,
            lastBuildDate: feedMetadata.lastBuildDate,
            lastBuildDateISO: feedMetadata.lastBuildDateISO
        });

        // Parse RSS XML to extract all articles
        const allArticles = parseRSS(xmlText);

        logger.info(`Successfully parsed ${allArticles.length} articles from The Hindu`);
        logger.info(`Feed last updated: ${feedMetadata.lastBuildDateISO}`);

        // Get 6 AM to 6 AM time window (IST)
        const { startTime, endTime } = get6AMto6AMWindow("Asia/Kolkata");

        logger.info(`Time window: ${startTime.toISOString()} to ${endTime.toISOString()}`);

        // Log sample article dates for debugging
        if (allArticles.length > 0) {
            const sampleDates = allArticles.slice(0, 5).map(a => ({
                title: a.title.substring(0, 50),
                pubDate: a.pubDate,
                publishedAt: a.publishedAt
            }));
            logger.info(`Sample articles:`, JSON.stringify(sampleDates));
        }

        // Filter articles by date range
        const filteredArticles = filterArticlesByDate(allArticles, startTime, endTime);

        logger.info(`Filtered to ${filteredArticles.length} articles in 6 AM-6 AM window`);

        // Save filtered articles to Firestore with source reference
        // Note: Source must be initialized first using initializeSources function
        const saveStats = await saveArticlesToFirestore(filteredArticles, SOURCE_ID);

        logger.info(`Save stats: ${saveStats.saved} saved, ${saveStats.skipped} skipped, ${saveStats.errors} errors`);

        res.json({
            success: true,
            source: SOURCE_ID,
            fetchedAt: new Date().toISOString(),
            feedLastUpdated: feedMetadata.lastBuildDateISO,
            timeWindow: {
                start: startTime.toISOString(),
                end: endTime.toISOString()
            },
            totalArticles: allArticles.length,
            filteredArticles: filteredArticles.length,
            savedToDatabase: saveStats.saved,
            skipped: saveStats.skipped,
            errors: saveStats.errors,
            articles: filteredArticles
        });
    } catch (error) {
        logger.error("Error fetching The Hindu RSS feed", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch editorial feed",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

export { theHindu };