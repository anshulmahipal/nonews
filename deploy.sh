#!/bin/bash

# Firebase Hosting Deploy Script for no news
# Quick deployment helper

set -e

echo "🚀 no news - Firebase Hosting Deployment"
echo "========================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Not logged in to Firebase"
    echo "Running: firebase login"
    firebase login
fi

echo "✅ Logged in to Firebase"
echo ""

# Show current project
CURRENT_PROJECT=$(firebase use 2>&1 | grep "Active" | awk '{print $NF}')
echo "📦 Current project: $CURRENT_PROJECT"
echo ""

# Menu
echo "What would you like to deploy?"
echo "1) Everything (rules + hosting)"
echo "2) Only Firestore rules"
echo "3) Only hosting"
echo "4) Test locally (emulators)"
echo "5) Cancel"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying Firestore rules and hosting..."
        firebase deploy --only firestore:rules,hosting
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "🌐 Your site is live at:"
        firebase hosting:sites:list
        ;;
    2)
        echo ""
        echo "📦 Deploying Firestore rules..."
        firebase deploy --only firestore:rules
        echo ""
        echo "✅ Rules deployed!"
        ;;
    3)
        echo ""
        echo "📦 Deploying hosting..."
        firebase deploy --only hosting
        echo ""
        echo "✅ Hosting deployed!"
        echo ""
        echo "🌐 Your site is live at:"
        firebase hosting:sites:list
        ;;
    4)
        echo ""
        echo "🧪 Starting Firebase Emulators..."
        echo "Press Ctrl+C to stop"
        echo ""
        firebase emulators:start
        ;;
    5)
        echo ""
        echo "👋 Cancelled"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Done!"

