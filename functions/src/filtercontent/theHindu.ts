/**
 * The Hindu Content Filter
 * 
 * Extracts clean, structured content from The Hindu article pages
 * Fetches full article HTML and extracts: image, caption, body content, and metadata
 */

import * as logger from "firebase-functions/logger";

/**
 * Filtered article content structure
 */
export interface FilteredArticleContent {
    title: string;
    url: string;
    imageUrl: string | null;
    imageCaption: string | null;
    content: string;
    htmlContent: string;
    publishedAt: string | null;
    category: string | null;
    relatedArticles: Array<{
        title: string;
        url: string;
    }>;
}

/**
 * Fetches and filters content from a The Hindu article URL
 * 
 * @param articleUrl - Full URL to The Hindu article
 * @returns Filtered and structured article content
 * 
 * @example
 * const content = await filterTheHinduArticle(
 *   "https://www.thehindu.com/opinion/op-ed/the-malleable-code-of-conduct/article70244260.ece"
 * );
 */
export async function filterTheHinduArticle(articleUrl: string): Promise<FilteredArticleContent> {
    try {
        logger.info(`Fetching article: ${articleUrl}`);

        // Fetch the article HTML
        const response = await fetch(articleUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const htmlText = await response.text();

        // Extract article components
        const title = extractTitle(htmlText);
        const imageUrl = extractImageUrl(htmlText);
        const imageCaption = extractImageCaption(htmlText);
        const { content, htmlContent } = extractArticleBody(htmlText);
        const publishedAt = extractPublishDate(htmlText);
        const category = extractCategory(htmlText);
        const relatedArticles = extractRelatedArticles(htmlText);

        logger.info(`Successfully filtered article: ${title.substring(0, 50)}...`);

        return {
            title,
            url: articleUrl,
            imageUrl,
            imageCaption,
            content,
            htmlContent,
            publishedAt,
            category,
            relatedArticles
        };

    } catch (error) {
        logger.error("Error filtering The Hindu article", { url: articleUrl, error });
        throw error;
    }
}

/**
 * Extract article title from HTML
 * Looks for <title> tag or meta og:title
 */
function extractTitle(html: string): string {
    // Try meta og:title first (more accurate)
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (ogTitleMatch) {
        return cleanText(ogTitleMatch[1]);
    }

    // Fallback to <title> tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
        // Remove " | The Hindu" suffix if present
        const title = titleMatch[1].replace(/\s*\|\s*The Hindu\s*$/i, "");
        return cleanText(title);
    }

    return "Untitled Article";
}

/**
 * Extract the lead image URL from the article
 * Looks for the highest resolution image available
 */
function extractImageUrl(html: string): string | null {
    // Look for the picture element with class "lead-img" parent
    const pictureMatch = html.match(/<picture>([\s\S]*?)<\/picture>/);

    if (pictureMatch) {
        const pictureContent = pictureMatch[1];

        // Try to get the highest resolution source (1200px version)
        const highResMatch = pictureContent.match(/srcset="([^"]*LANDSCAPE_1200[^"]*)"/);
        if (highResMatch) {
            return highResMatch[1].trim();
        }

        // Fallback to any srcset
        const srcsetMatch = pictureContent.match(/srcset="([^"]+)"/);
        if (srcsetMatch) {
            return srcsetMatch[1].trim();
        }

        // Fallback to img src
        const imgMatch = pictureContent.match(/<img[^>]+src="([^"]+)"/);
        if (imgMatch && !imgMatch[1].includes("1x1_spacer")) {
            return imgMatch[1].trim();
        }
    }

    // Alternative: look for meta og:image
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (ogImageMatch) {
        return ogImageMatch[1].trim();
    }

    return null;
}

/**
 * Extract image caption
 */
function extractImageCaption(html: string): string | null {
    // Look for <p class="caption">
    const captionMatch = html.match(/<p\s+class="caption"[^>]*>([\s\S]*?)<\/p>/);

    if (captionMatch) {
        let caption = captionMatch[1];
        // Remove photo credit part (usually after | or starts with "Photo Credit:")
        caption = caption.replace(/\s*\|\s*Photo Credit:.*$/i, "");
        caption = caption.replace(/Photo Credit:.*$/i, "");
        return cleanText(caption);
    }

    return null;
}

/**
 * Extract the main article body content
 * Returns both plain text and HTML versions
 */
function extractArticleBody(html: string): { content: string; htmlContent: string } {
    // Look for the article body div
    const bodyMatch = html.match(/<div[^>]*class="[^"]*articlebodycontent[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*articleblock-container[^"]*"/);

    if (bodyMatch) {
        let bodyHtml = bodyMatch[1];

        // Remove related stories inline sections
        bodyHtml = bodyHtml.replace(/<div\s+class="related-stories-inline[^"]*"[\s\S]*?<\/div>/g, "");

        // Remove also-read sections
        bodyHtml = bodyHtml.replace(/<div\s+class="also-read[^"]*"[\s\S]*?<\/div>/g, "");

        // Remove script tags
        bodyHtml = bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, "");

        // Remove style tags
        bodyHtml = bodyHtml.replace(/<style[\s\S]*?<\/style>/gi, "");

        // Store cleaned HTML version
        const htmlContent = bodyHtml.trim();

        // Extract plain text (remove all HTML tags)
        const plainText = cleanText(bodyHtml);

        return {
            content: plainText,
            htmlContent: htmlContent
        };
    }

    return {
        content: "",
        htmlContent: ""
    };
}

/**
 * Extract article publication date
 */
function extractPublishDate(html: string): string | null {
    // Look for the publish time in the article
    // Pattern: Published - November 06, 2025 01:04 am IST
    const publishMatch = html.match(/Published\s*-?\s*<span[^>]*>(.*?)<\/span>/i);

    if (publishMatch) {
        const dateString = cleanText(publishMatch[1]);

        try {
            // Try to parse the date
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        } catch (error) {
            logger.warn("Could not parse date", { dateString });
        }
    }

    // Fallback: look for meta article:published_time
    const metaPublishMatch = html.match(/<meta\s+property="article:published_time"\s+content="([^"]+)"/i);
    if (metaPublishMatch) {
        return metaPublishMatch[1];
    }

    return null;
}

/**
 * Extract article category/section
 */
function extractCategory(html: string): string | null {
    // Look for meta article:section
    const sectionMatch = html.match(/<meta\s+property="article:section"\s+content="([^"]+)"/i);
    if (sectionMatch) {
        return cleanText(sectionMatch[1]);
    }

    // Alternative: extract from URL path
    const urlMatch = html.match(/<meta\s+property="og:url"\s+content="https?:\/\/www\.thehindu\.com\/([^\/]+)\/([^\/]+)\//i);
    if (urlMatch) {
        return cleanText(urlMatch[1]);
    }

    return null;
}

/**
 * Extract related articles from the inline related stories section
 */
function extractRelatedArticles(html: string): Array<{ title: string; url: string }> {
    const relatedArticles: Array<{ title: string; url: string }> = [];

    // Look for related stories section
    const relatedMatch = html.match(/<div\s+class="related-stories-inline[^"]*"[^>]*>([\s\S]*?)<\/div>/);

    if (relatedMatch) {
        const relatedContent = relatedMatch[1];

        // Extract all links from the related section
        const linkRegex = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        const links = relatedContent.matchAll(linkRegex);

        for (const link of links) {
            const url = link[1];
            const title = cleanText(link[2]);

            // Only add if we have both URL and title
            if (url && title && title.length > 0) {
                relatedArticles.push({
                    title,
                    url: url.startsWith("http") ? url : `https://www.thehindu.com${url}`
                });
            }
        }
    }

    return relatedArticles;
}

/**
 * Clean HTML entities and extra whitespace from text
 * Similar to rssParser cleanText but more comprehensive
 */
function cleanText(text: string): string {
    return text
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // Remove CDATA
        .replace(/<br\s*\/?>/gi, "\n") // Convert <br> to newlines
        .replace(/<\/p>/gi, "\n\n") // Convert </p> to double newlines
        .replace(/<\/h[1-6]>/gi, "\n\n") // Convert heading closings to double newlines
        .replace(/<[^>]+>/g, "") // Remove all other HTML tags
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&lsquo;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&mdash;/g, "—")
        .replace(/&ndash;/g, "–")
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/\n\s+/g, "\n") // Clean up newlines
        .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
        .trim();
}

/**
 * Batch filter multiple articles
 * 
 * @param articleUrls - Array of article URLs to filter
 * @returns Array of filtered article content
 */
export async function filterMultipleArticles(articleUrls: string[]): Promise<FilteredArticleContent[]> {
    const results: FilteredArticleContent[] = [];
    const errors: Array<{ url: string; error: string }> = [];

    for (const url of articleUrls) {
        try {
            const filtered = await filterTheHinduArticle(url);
            results.push(filtered);

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            logger.error("Failed to filter article", { url, error });
            errors.push({
                url,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    logger.info(`Filtered ${results.length} articles successfully, ${errors.length} failures`);

    if (errors.length > 0) {
        logger.warn("Failed articles:", errors);
    }

    return results;
}

