import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { parseRSS, get6AMto6AMWindow, filterArticlesByDate } from "../utils/rssParser";

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

        // Parse RSS XML to extract all articles
        const allArticles = parseRSS(xmlText);

        logger.info(`Successfully parsed ${allArticles.length} articles from The Hindu`);

        // Get 6 AM to 6 AM time window (IST)
        const { startTime, endTime } = get6AMto6AMWindow("Asia/Kolkata");

        logger.info(`Time window: ${startTime.toISOString()} to ${endTime.toISOString()}`);

        // Filter articles by date range
        const filteredArticles = filterArticlesByDate(allArticles, startTime, endTime);

        logger.info(`Filtered to ${filteredArticles.length} articles in 6 AM-6 AM window`);

        // Log first few article dates for debugging
        if (allArticles.length > 0 && filteredArticles.length === 0) {
            logger.info(`Sample article dates: ${allArticles.slice(0, 3).map(a => a.publishedAt).join(", ")}`);
        }

        res.json({
            success: true,
            source: "The Hindu - Opinion",
            fetchedAt: new Date().toISOString(),
            timeWindow: {
                start: startTime.toISOString(),
                end: endTime.toISOString()
            },
            totalArticles: allArticles.length,
            filteredArticles: filteredArticles.length,
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