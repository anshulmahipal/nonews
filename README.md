# noNews - News Bookmarking Application

> A modern bookmarking application for saving and organizing news articles, with support for guest users and authenticated accounts.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Features](#features)

## 🎯 Overview

**noNews** is a monolithic repository containing three main components:

1. **Firebase Cloud Functions** - Backend API and editorial content fetching
2. **Public Website** - Waitlist landing page and web interface
3. **React Native Mobile App** - Cross-platform iOS/Android application

### Key Features

- 📱 Cross-platform mobile app (iOS/Android)
- 🌐 Public website with waitlist functionality
- 👤 Guest user support (5 bookmark limit)
- 🔐 User authentication with account upgrade path
- 📰 Automated editorial content fetching from news sources
- ☁️ Firebase backend (Firestore, Authentication, Cloud Functions, Hosting)
- 🎨 Modern, responsive UI design

## 🏗️ Architecture

This is a **monolithic repository** with all components in a single codebase:

```
noNews/
├── functions/          # Firebase Cloud Functions (Node.js 22)
├── public/            # Public website (HTML/CSS/JS)
├── src/               # React Native mobile app
├── firebase.json      # Firebase configuration
├── firestore.rules    # Firestore security rules
└── storage.rules      # Firebase Storage security rules
```

### Component Interaction

```
┌─────────────────────┐
│  React Native App   │
│   (iOS/Android)     │
└──────────┬──────────┘
           │
           │ Firebase SDK
           ▼
┌─────────────────────┐
│   Firebase Backend  │
│  - Authentication   │
│  - Firestore DB     │
│  - Cloud Functions  │
│  - Storage          │
└──────────┬──────────┘
           │
           │ RSS/HTTP
           ▼
┌─────────────────────┐
│   News Sources      │
│  (The Hindu, etc.)  │
└─────────────────────┘
```

## 📁 Project Structure

### Root Level

```
noNews/
├── functions/              # Backend Cloud Functions
│   ├── src/               # TypeScript source code
│   │   ├── auth/          # Authentication triggers
│   │   ├── bookmarks/     # Bookmark CRUD operations
│   │   ├── fetcheditorial/# Editorial content fetchers
│   │   ├── filtercontent/ # Article content extractors
│   │   ├── setup/         # Initialization scripts
│   │   ├── utils/         # Shared utilities
│   │   └── index.ts       # Function exports
│   ├── lib/               # Compiled JavaScript (gitignored)
│   ├── package.json       # Node.js dependencies
│   └── tsconfig.json      # TypeScript config
│
├── public/                # Public website
│   ├── index.html         # Landing page
│   ├── styles.css         # Stylesheet
│   ├── app.js             # Client-side JavaScript
│   ├── firebase-config.example.js  # Firebase config template
│   └── favicon.png        # Site icon
│
├── src/                   # React Native mobile app
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   │   └── WelcomeScreen.tsx
│   ├── navigation/        # Navigation setup
│   ├── services/          # API services
│   │   └── waitlist.service.ts
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React Context providers
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   │   ├── bookmark.types.ts
│   │   ├── user.types.ts
│   │   └── waitlist.types.ts
│   ├── config/            # App configuration
│   └── assets/            # Images, fonts, icons
│       ├── fonts/
│       ├── icons/
│       └── images/
│
├── firebase.json          # Firebase project config
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules          # Storage security rules
├── package.json           # Root dependencies
├── tsconfig.json          # TypeScript config
└── deploy.sh              # Deployment script
```

## 🛠️ Technology Stack

### Backend (Firebase Functions)
- **Runtime:** Node.js 22
- **Language:** TypeScript (strict mode)
- **Framework:** Firebase Functions v2
- **Database:** Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage

### Frontend (Public Website)
- **Stack:** Vanilla JavaScript, HTML5, CSS3
- **Hosting:** Firebase Hosting
- **Integration:** Firebase SDK (Auth, Firestore)

### Mobile App
- **Framework:** React Native
- **Language:** TypeScript
- **Platforms:** iOS, Android (cross-platform)
- **State Management:** React Context + Hooks
- **Backend:** Firebase SDK

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- React Native development environment (for mobile)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd noNews

# Install root dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..

# Login to Firebase
firebase login

# Initialize Firebase (if needed)
firebase init
```

### Development

#### Backend (Cloud Functions)

```bash
cd functions

# Build TypeScript
npm run build

# Watch mode (auto-compile on changes)
npm run build:watch

# Run local emulators
npm run serve

# Deploy to Firebase
npm run deploy
```

#### Public Website

```bash
# Serve locally with Firebase Hosting emulator
firebase serve --only hosting

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### React Native Mobile App

```bash
# Install dependencies
npm install

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

## 📚 Documentation

Detailed documentation for each component:

- **[FUNCTIONS.md](./FUNCTIONS.md)** - Cloud Functions API, architecture, and development guide
- **[PUBLIC.md](./PUBLIC.md)** - Public website structure and deployment
- **[MOBILE.md](./MOBILE.md)** - React Native mobile app development guide

## ✨ Features

### Guest Users
- ✅ Anonymous authentication
- ✅ Limited to 5 bookmarks
- ✅ Upgrade path to full account
- ✅ Data preserved during upgrade

### Authenticated Users
- ✅ Email/password authentication
- ✅ Unlimited bookmarks
- ✅ Profile management
- ✅ Cloud sync across devices

### Editorial Content
- ✅ Automated RSS feed fetching
- ✅ Daily editorial updates from The Hindu
- ✅ 6 AM to 6 AM IST time window filtering
- ✅ Full article content extraction
- ✅ Firestore storage with source references

### Bookmarking
- ✅ Save articles with metadata
- ✅ Categorization and tagging
- ✅ Search and filtering
- ✅ Bookmark count tracking
- ✅ Real-time sync

## 🔒 Security

- **Firestore Rules:** User data isolation, guest bookmark limits
- **Authentication:** Firebase Auth with anonymous and email/password
- **Storage Rules:** User-specific file access
- **API Security:** Cloud Function authentication checks

## 🌍 Environment

### Firebase Configuration

```bash
# Production
firebase use production

# Development (if configured)
firebase use development
```

### Environment Variables

- Firebase config is loaded from Firebase SDK
- No environment variables needed for default setup
- Custom configs can be added to `functions/.env`

## 📦 Deployment

### Quick Deploy All

```bash
./deploy.sh
```

### Deploy Individual Components

```bash
# Deploy only Cloud Functions
firebase deploy --only functions

# Deploy only Firestore Rules
firebase deploy --only firestore:rules

# Deploy only Hosting
firebase deploy --only hosting
```

## 🧪 Testing

### Cloud Functions

```bash
cd functions
npm test  # (if tests are configured)
```

### Mobile App

```bash
npm test
```

## 📄 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact: [Add contact info]

---

**Built with ❤️ using Firebase and React Native**
