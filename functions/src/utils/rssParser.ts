/**
 * RSS Parser Utilities
 * 
 * Helper functions for parsing RSS/XML feeds and extracting structured data
 */

/**
 * Article interface for parsed RSS items
 */
export interface ParsedArticle {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    publishedAt: string | null;
    category: string | null;
    guid: string;
}

/**
 * Parse RSS XML and extract article data
 * 
 * @param xmlText - Raw RSS XML content
 * @returns Array of parsed articles
 */
export function parseRSS(xmlText: string): ParsedArticle[] {
    const articles: ParsedArticle[] = [];

    // Match all <item> tags in the RSS feed
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = xmlText.matchAll(itemRegex);

    for (const item of items) {
        const itemContent = item[1];

        // Extract individual fields
        const title = extractTag(itemContent, "title");
        const link = cleanText(extractTag(itemContent, "link"));
        const description = extractTag(itemContent, "description");
        const pubDate = cleanText(extractTag(itemContent, "pubDate"));
        const guid = extractTag(itemContent, "guid");

        // Extract category if available
        const categoryMatch = itemContent.match(/<category>(.*?)<\/category>/);
        const category = categoryMatch ? categoryMatch[1] : null;

        // Parse date safely
        let publishedAt: string | null = null;
        if (pubDate) {
            try {
                const date = new Date(pubDate);
                // Check if date is valid
                if (!isNaN(date.getTime())) {
                    publishedAt = date.toISOString();
                }
            } catch (error) {
                // Invalid date, leave as null
                publishedAt = null;
            }
        }

        articles.push({
            title: cleanText(title),
            link: link.trim(),
            description: cleanText(description),
            pubDate: pubDate.trim(),
            publishedAt: publishedAt,
            category: category,
            guid: guid.trim()
        });
    }

    return articles;
}

/**
 * Extract content between XML tags
 * 
 * @param content - XML content to parse
 * @param tagName - Name of the tag to extract
 * @returns Extracted content or empty string if not found
 */
export function extractTag(content: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}(?:[^>]*)>([\\s\\S]*?)<\/${tagName}>`, "i");
    const match = content.match(regex);
    return match ? match[1] : "";
}

/**
 * Clean HTML entities, CDATA sections, and extra whitespace from text
 * 
 * @param text - Text to clean
 * @returns Cleaned text without HTML tags and entities
 */
export function cleanText(text: string): string {
    return text
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // Remove CDATA
        .replace(/<[^>]+>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .trim();
}

/**
 * Extract RSS feed metadata
 * 
 * @param xmlText - Raw RSS XML content
 * @returns Feed metadata (title, description, link, lastBuildDate)
 */
export function extractFeedMetadata(xmlText: string): {
    title: string;
    description: string;
    link: string;
    lastBuildDate: string | null;
    lastBuildDateISO: string | null;
} {
    // Extract channel-level metadata
    const channelMatch = xmlText.match(/<channel>([\s\S]*?)<\/channel>/);
    const channelContent = channelMatch ? channelMatch[1] : "";

    const lastBuildDate = extractTag(channelContent, "lastBuildDate");
    let lastBuildDateISO: string | null = null;

    if (lastBuildDate) {
        try {
            const date = new Date(lastBuildDate);
            if (!isNaN(date.getTime())) {
                lastBuildDateISO = date.toISOString();
            }
        } catch (error) {
            // Invalid date
            lastBuildDateISO = null;
        }
    }

    return {
        title: cleanText(extractTag(channelContent, "title")),
        description: cleanText(extractTag(channelContent, "description")),
        link: extractTag(channelContent, "link").trim(),
        lastBuildDate: lastBuildDate || null,
        lastBuildDateISO: lastBuildDateISO
    };
}

/**
 * Get the 24-hour time window from yesterday 6 AM to today 6 AM (IST)
 * 
 * IST is UTC+5:30, so 6 AM IST = 00:30 UTC
 * 
 * @returns Object with startTime and endTime Date objects
 * 
 * @example
 * // If current time is Nov 5, 2025 at 10:00 AM IST
 * // Returns: { startTime: Nov 4 00:30 UTC, endTime: Nov 5 00:30 UTC }
 * //          (which is Nov 4 6AM IST to Nov 5 6AM IST)
 */
export function get6AMto6AMWindow(timezone: string = "Asia/Kolkata"): {
    startTime: Date;
    endTime: Date;
} {
    const now = new Date();

    // IST is UTC+5:30, so 6 AM IST = 0:30 AM UTC (same day)
    const IST_OFFSET_HOURS = 5;
    const IST_OFFSET_MINUTES = 30;
    const IST_OFFSET_MS = (IST_OFFSET_HOURS * 60 + IST_OFFSET_MINUTES) * 60 * 1000;

    // Get current time in IST by adding offset to UTC
    const nowInIST = new Date(now.getTime() + IST_OFFSET_MS);

    // Get today's date in IST
    const istYear = nowInIST.getUTCFullYear();
    const istMonth = nowInIST.getUTCMonth();
    const istDay = nowInIST.getUTCDate();
    const istHour = nowInIST.getUTCHours();

    // Create today at 6 AM IST (which is 0:30 AM UTC)
    // Date.UTC creates a UTC date, we want 0:30 UTC for 6 AM IST
    const todayAt6AMIST_UTC = Date.UTC(istYear, istMonth, istDay, 0, 30, 0, 0);

    // Create yesterday at 6 AM IST
    const yesterdayAt6AMIST_UTC = todayAt6AMIST_UTC - 24 * 60 * 60 * 1000;

    // Determine which window based on current IST hour
    if (istHour >= 6) {
        // After 6 AM IST: window is yesterday 6 AM to today 6 AM
        return {
            startTime: new Date(yesterdayAt6AMIST_UTC),
            endTime: new Date(todayAt6AMIST_UTC)
        };
    } else {
        // Before 6 AM IST: window is day before yesterday 6 AM to yesterday 6 AM
        const dayBeforeYesterdayAt6AMIST_UTC = yesterdayAt6AMIST_UTC - 24 * 60 * 60 * 1000;
        return {
            startTime: new Date(dayBeforeYesterdayAt6AMIST_UTC),
            endTime: new Date(yesterdayAt6AMIST_UTC)
        };
    }
}

/**
 * Filter articles by date range
 * 
 * @param articles - Array of parsed articles
 * @param startTime - Start of time window
 * @param endTime - End of time window
 * @returns Filtered array of articles within the time window
 */
export function filterArticlesByDate(
    articles: ParsedArticle[],
    startTime: Date,
    endTime: Date
): ParsedArticle[] {
    return articles.filter(article => {
        if (!article.publishedAt) {
            return false; // Exclude articles without valid dates
        }

        const publishedDate = new Date(article.publishedAt);
        const publishedTime = publishedDate.getTime();
        const startTimeMs = startTime.getTime();
        const endTimeMs = endTime.getTime();

        // Include articles within the range
        return publishedTime >= startTimeMs && publishedTime <= endTimeMs;
    });
}

/**
 * Get articles from last 24 hours (simpler alternative)
 * 
 * @param articles - Array of parsed articles
 * @returns Articles from last 24 hours
 */
export function getRecentArticles(articles: ParsedArticle[]): ParsedArticle[] {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return articles.filter(article => {
        if (!article.publishedAt) {
            return false;
        }

        const publishedDate = new Date(article.publishedAt);
        return publishedDate >= twentyFourHoursAgo && publishedDate <= now;
    });
}

