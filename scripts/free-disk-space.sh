#!/bin/bash
# Free disk space for noNews project - run when you see "No space left on device"

set -e

echo "=== Freeing disk space ==="

# 1. Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# 2. Clear Expo caches
echo "Clearing Expo caches..."
rm -rf ~/.expo/ios-simulator-app-cache 2>/dev/null || true
rm -rf ~/.expo/cache 2>/dev/null || true

# 3. Clear project caches
echo "Clearing project caches..."
rm -rf .expo 2>/dev/null || true
rm -rf apps/expo/.expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# 4. Remove iOS build artifacts (if any)
echo "Clearing iOS build artifacts..."
rm -rf apps/expo/ios 2>/dev/null || true

# 5. Clear Turbo cache
echo "Clearing Turbo cache..."
rm -rf .turbo 2>/dev/null || true

# 6. Show disk usage
echo ""
echo "=== Current disk usage ==="
df -h . | tail -1

echo ""
echo "Done. If still low on space, consider:"
echo "  - Empty Trash"
echo "  - Delete ~/Library/Developer/Xcode/DerivedData"
echo "  - Delete ~/Library/Developer/Xcode/iOS\ DeviceSupport"
echo "  - Run: du -sh ~/Library/Caches/* | sort -hr | head -20"
echo "  - Uninstall unused apps"
