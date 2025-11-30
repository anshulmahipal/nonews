/**
 * Example Usage of The Hindu Content Filter
 * 
 * This file demonstrates how to use the content filtering functions
 * Run this locally to test: npm run build && node lib/filtercontent/example.js
 */

import { filterTheHinduArticle, filterMultipleArticles } from "./theHindu";

/**
 * Example 1: Filter a single article
 */
async function example1_singleArticle() {
    console.log("\n=== Example 1: Single Article ===\n");

    const url = "https://www.thehindu.com/opinion/op-ed/the-malleable-code-of-conduct/article70244260.ece";

    try {
        const content = await filterTheHinduArticle(url);

        console.log("Title:", content.title);
        console.log("Category:", content.category);
        console.log("Published:", content.publishedAt);
        console.log("Image URL:", content.imageUrl?.substring(0, 60) + "...");
        console.log("Caption:", content.imageCaption?.substring(0, 80) + "...");
        console.log("Content Length:", content.content.length, "characters");
        console.log("HTML Content Length:", content.htmlContent.length, "characters");
        console.log("Related Articles:", content.relatedArticles.length);

        console.log("\nFirst 200 characters of content:");
        console.log(content.content.substring(0, 200) + "...");

        console.log("\nRelated Articles:");
        content.relatedArticles.forEach((article, i) => {
            console.log(`  ${i + 1}. ${article.title}`);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * Example 2: Filter multiple articles
 */
async function example2_multipleArticles() {
    console.log("\n=== Example 2: Multiple Articles ===\n");

    const urls = [
        "https://www.thehindu.com/opinion/op-ed/the-malleable-code-of-conduct/article70244260.ece",
        "https://www.thehindu.com/opinion/op-ed/data-dissent-and-uncertainty/article70243993.ece"
    ];

    try {
        const contents = await filterMultipleArticles(urls);

        console.log(`Successfully filtered ${contents.length} articles:\n`);

        contents.forEach((content, i) => {
            console.log(`${i + 1}. ${content.title}`);
            console.log(`   Category: ${content.category}`);
            console.log(`   Content: ${content.content.length} characters`);
            console.log(`   Related: ${content.relatedArticles.length} articles\n`);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * Example 3: Integration with RSS feed workflow
 */
async function example3_withRSSFeed() {
    console.log("\n=== Example 3: RSS + Content Filter Integration ===\n");

    // Simulating what you get from parseRSS()
    const rssArticles = [
        {
            title: "The malleable Code of Conduct",
            link: "https://www.thehindu.com/opinion/op-ed/the-malleable-code-of-conduct/article70244260.ece",
            description: "Successive governments at both the Centre...",
            pubDate: "Wed, 06 Nov 2025 01:04:00 +0530"
        }
    ];

    console.log("Step 1: Got article from RSS feed");
    console.log(`  Title: ${rssArticles[0].title}`);
    console.log(`  Description: ${rssArticles[0].description.substring(0, 50)}...`);

    console.log("\nStep 2: Fetching full article content...");

    try {
        const fullContent = await filterTheHinduArticle(rssArticles[0].link);

        console.log("\nStep 3: Full content extracted!");
        console.log(`  RSS Description: ${rssArticles[0].description.length} chars`);
        console.log(`  Full Content: ${fullContent.content.length} chars`);
        console.log(`  Has Image: ${fullContent.imageUrl ? "Yes" : "No"}`);
        console.log(`  Related Articles: ${fullContent.relatedArticles.length}`);

    } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * Example 4: Extract specific content for display
 */
async function example4_displayContent() {
    console.log("\n=== Example 4: Display Ready Content ===\n");

    const url = "https://www.thehindu.com/opinion/op-ed/the-malleable-code-of-conduct/article70244260.ece";

    try {
        const content = await filterTheHinduArticle(url);

        // Format for display/email/notification
        const displayContent = {
            headline: content.title,
            category: content.category?.toUpperCase() || "ARTICLE",
            date: content.publishedAt ? new Date(content.publishedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }) : "Unknown",
            image: content.imageUrl,
            excerpt: content.content.substring(0, 200) + "...",
            readMoreUrl: content.url,
            relatedCount: content.relatedArticles.length
        };

        console.log("Display-Ready Content:");
        console.log(JSON.stringify(displayContent, null, 2));

    } catch (error) {
        console.error("Error:", error);
    }
}

// Run examples
async function runAllExamples() {
    console.log("╔════════════════════════════════════════════╗");
    console.log("║  The Hindu Content Filter - Examples      ║");
    console.log("╚════════════════════════════════════════════╝");

    await example1_singleArticle();
    await example2_multipleArticles();
    await example3_withRSSFeed();
    await example4_displayContent();

    console.log("\n✅ All examples completed!\n");
}

// Uncomment to run when executing this file directly
// runAllExamples().catch(console.error);

export {
    example1_singleArticle,
    example2_multipleArticles,
    example3_withRSSFeed,
    example4_displayContent,
    runAllExamples
};

