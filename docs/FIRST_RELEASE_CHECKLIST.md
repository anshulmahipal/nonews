# First Release Checklist

This document is the working checklist for shipping the first public release of NoNews.

## Release Goal

Ship a reliable v1 of `NoNews` as a morning editorial brief, not a generic news utility app.

Core promise:

- Concise editorial summaries
- Clean morning reading habit
- Personalization through bookmarks and followed authors
- Stable mobile release configuration

## Product Positioning

- [ ] Align all launch-facing copy to one message:
  `NoNews is a morning editorial brief for serious readers.`
- [ ] Remove or rewrite any copy that frames the product as a generic bookmarking app.
- [ ] Make sure onboarding explains the value in one sentence.
- [ ] Confirm the home screen prioritizes `Today's Edition`.
- [ ] Keep bookmarks, folders, and library secondary to the daily brief.

## Branding And Identity

- [ ] Confirm final app name styling: `NoNews` vs `noNews`.
- [ ] Confirm final app icon for iOS and Android.
- [ ] Confirm splash screen background and artwork are production-ready.
- [ ] Decide whether the deep link scheme stays `editorialapp` or changes to a branded scheme like `nonews`.
- [ ] Check that the bundle/package identifier is correct everywhere:
  `com.logicnib.nonews`

## App Configuration

- [x] Update iOS bundle identifier to `com.logicnib.nonews`
- [x] Update Android package name to `com.logicnib.nonews`
- [ ] Set explicit iOS build number.
- [ ] Set explicit Android version code.
- [ ] Confirm release version number for v1.
- [ ] Confirm Expo/EAS project configuration is correct for production builds.

## Auth And Integrations

- [ ] Update Google Sign-In configuration for `com.logicnib.nonews` if enabled.
- [ ] Verify Apple Sign In setup matches the new iOS bundle identifier.
- [ ] Verify Supabase auth redirect URLs and callback handling.
- [ ] Verify deep links open the correct screens in release builds.
- [ ] Verify push notification registration works in production.
- [ ] Verify push payload deep links route correctly to the intended article/home screen.

## Content And Editorial Quality

- [ ] Confirm the daily ingestor runs reliably on schedule.
- [ ] Confirm the AI processor completes without leaving large batches in `pending`.
- [ ] Review summary quality across multiple sources.
- [ ] Review stance labeling quality and decide whether it is strong enough for v1 prominence.
- [ ] Check for duplicate or low-value articles in the daily edition.
- [ ] Confirm source attribution and `Read full` links are always present.
- [ ] Confirm empty-state messaging feels intentional when the morning edition is not ready.

## Core User Flows

- [ ] Launch app and land successfully on the main experience.
- [ ] Sign in successfully.
- [ ] Sign out successfully.
- [ ] Load today's edition successfully.
- [ ] Open a full article successfully.
- [ ] Save/bookmark an article successfully.
- [ ] View saved/library content successfully.
- [ ] Follow an author successfully.
- [ ] View followed authors successfully.
- [ ] Open article deep links successfully.
- [ ] Share an article successfully.
- [ ] Trigger and use summary simplification successfully.

## QA And Reliability

- [ ] Test on at least one real iPhone.
- [ ] Test on at least one real Android device.
- [ ] Verify app startup performance is acceptable.
- [ ] Verify loading, empty, and error states across main screens.
- [ ] Verify there are no placeholder strings in production UI.
- [ ] Verify there are no broken images, icons, or routes.
- [ ] Verify all required environment variables are set for production.
- [ ] Verify no debug-only logging or development-only behavior leaks into release.

## Store Readiness

- [ ] Prepare App Store title, subtitle, keywords, and description.
- [ ] Prepare Play Store short description and full description.
- [ ] Prepare screenshots for iPhone.
- [ ] Prepare screenshots for Android.
- [ ] Prepare app icon and marketing assets.
- [ ] Confirm privacy policy URL.
- [ ] Confirm terms of service URL.
- [ ] Confirm support/contact email and website.

## Legal And Trust

- [ ] Make sure AI usage is disclosed clearly in-app and on the website.
- [ ] Make sure source publications are credited appropriately.
- [ ] Make sure privacy policy reflects auth, notifications, and saved data behavior.
- [ ] Make sure terms are accessible from app and website.

## Repo And Team Hygiene

- [ ] Rewrite `README.md` to match the current product and architecture.
- [ ] Remove outdated Firebase-era framing from top-level docs.
- [ ] Create a short release runbook for future versions.
- [ ] Track launch blockers separately from post-launch improvements.

## Suggested Execution Order

1. Finalize product positioning and brand decisions.
2. Lock app configuration, identifiers, versioning, and deep link strategy.
3. Audit auth, push notifications, and redirects.
4. Run manual QA on release builds.
5. Prepare store metadata and legal links.
6. Submit the first release.

## Launch Blockers

Use this section to track only issues that can block release.

- [ ] Blocker 1:
- [ ] Blocker 2:
- [ ] Blocker 3:

## Post-Launch Candidates

These are intentionally not first-release blockers unless proven critical.

- Topic following
- Better folder systems
- Weekly recap
- More advanced personalization
- Premium feature exploration
