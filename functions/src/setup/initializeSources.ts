/**
 * Initialize Sources
 * 
 * One-time setup script to create source documents in Firestore
 * Run this manually or as a Cloud Function to set up all news sources
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { createOrUpdateSource } from "../utils/firestoreUtils";

/**
 * Source definitions
 */
const SOURCES = [
    {
        id: "the-hindu",
        config: {
            name: "the-hindu",
            displayName: "The Hindu",
            icon: "https://www.thehindu.com/theme/images/th-online/thehindu-logo.svg",
            website: "https://www.thehindu.com",
            rssUrl: "https://www.thehindu.com/opinion/feeder/default.rss",
            category: "news",
            language: "en",
            country: "IN",
            description: "The Hindu is an Indian English-language daily newspaper. It is one of the Indian newspapers of record.",
            isActive: true
        }
    },
    // Add more sources here as you create them
    // {
    //     id: "times-of-india",
    //     config: {
    //         name: "times-of-india",
    //         displayName: "Times of India",
    //         icon: "https://timesofindia.indiatimes.com/photo.cms",
    //         website: "https://timesofindia.indiatimes.com",
    //         rssUrl: "https://timesofindia.indiatimes.com/rss.cms",
    //         category: "news",
    //         language: "en",
    //         country: "IN",
    //         isActive: true
    //     }
    // }
];

/**
 * HTTP function to initialize all sources
 * Call this once to set up sources in Firestore
 * 
 * @example
 * curl http://localhost:5001/news-c5ff4/us-central1/initializeSources
 */
export const initializeSources = onRequest(async (req, res) => {
    try {
        logger.info("Initializing sources...");

        const results = [];

        for (const source of SOURCES) {
            try {
                await createOrUpdateSource(source.id, source.config);
                results.push({
                    id: source.id,
                    name: source.config.displayName,
                    status: "success"
                });
                logger.info(`Initialized source: ${source.id}`);
            } catch (error) {
                results.push({
                    id: source.id,
                    name: source.config.displayName,
                    status: "error",
                    error: error instanceof Error ? error.message : "Unknown error"
                });
                logger.error(`Error initializing source: ${source.id}`, error);
            }
        }

        res.json({
            success: true,
            message: "Sources initialized",
            total: SOURCES.length,
            results: results
        });

    } catch (error) {
        logger.error("Error initializing sources", error);
        res.status(500).json({
            success: false,
            error: "Failed to initialize sources",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

