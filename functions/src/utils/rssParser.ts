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
        const link = extractTag(itemContent, "link");
        const description = extractTag(itemContent, "description");
        const pubDate = extractTag(itemContent, "pubDate");
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
 * @returns Feed metadata (title, description, link)
 */
export function extractFeedMetadata(xmlText: string): {
    title: string;
    description: string;
    link: string;
} {
    // Extract channel-level metadata
    const channelMatch = xmlText.match(/<channel>([\s\S]*?)<\/channel>/);
    const channelContent = channelMatch ? channelMatch[1] : "";

    return {
        title: cleanText(extractTag(channelContent, "title")),
        description: cleanText(extractTag(channelContent, "description")),
        link: extractTag(channelContent, "link").trim()
    };
}

/**
 * Get the 24-hour time window from yesterday 6 AM to today 6 AM (IST)
 * 
 * @returns Object with startTime and endTime Date objects
 * 
 * @example
 * // If current time is Oct 17, 2025 at 10:00 AM IST
 * // Returns: { startTime: Oct 16 06:00 AM IST, endTime: Oct 17 06:00 AM IST }
 * 
 * // If current time is Oct 17, 2025 at 2:00 AM IST
 * // Returns: { startTime: Oct 15 06:00 AM IST, endTime: Oct 16 06:00 AM IST }
 */
export function get6AMto6AMWindow(timezone: string = "Asia/Kolkata"): {
    startTime: Date;
    endTime: Date;
} {
    const now = new Date();

    // Get current hour in IST (0-23)
    const istFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false
    });
    const currentHourIST = parseInt(istFormatter.format(now));

    // Get current date in IST
    const istDateFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    const istDateParts = istDateFormatter.format(now).split("/");
    const month = parseInt(istDateParts[0]) - 1; // 0-indexed
    const day = parseInt(istDateParts[1]);
    const year = parseInt(istDateParts[2]);

    // Create today at 6 AM in IST (UTC)
    // IST is UTC+5:30, so 6 AM IST = 0:30 AM UTC
    const todayAt6AMIST = new Date(Date.UTC(year, month, day, 0, 30, 0, 0));

    // Create yesterday at 6 AM in IST (UTC)
    const yesterdayAt6AMIST = new Date(todayAt6AMIST);
    yesterdayAt6AMIST.setDate(yesterdayAt6AMIST.getDate() - 1);

    // If current time is after 6 AM IST, window is yesterday 6 AM to today 6 AM
    // If current time is before 6 AM IST, window is day before yesterday 6 AM to yesterday 6 AM
    if (currentHourIST >= 6) {
        return {
            startTime: yesterdayAt6AMIST,
            endTime: todayAt6AMIST
        };
    } else {
        const dayBeforeYesterdayAt6AMIST = new Date(yesterdayAt6AMIST);
        dayBeforeYesterdayAt6AMIST.setDate(dayBeforeYesterdayAt6AMIST.getDate() - 1);

        return {
            startTime: dayBeforeYesterdayAt6AMIST,
            endTime: yesterdayAt6AMIST
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
        return publishedDate >= startTime && publishedDate <= endTime;
    });
}

