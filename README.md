# noNews

A monolithic bookmarking app with Firebase backend and React Native frontend.

**Key Features:**
- 🌐 **Waitlist Landing Page** - Firebase Hosting website ready to deploy
- User authentication (with guest mode support)
- Bookmark management (guest users limited to 5 bookmarks)
- Firebase Functions v2 API
- Node.js 22

## 🚀 Quick Start - Deploy Waitlist Page

Got a waitlist page ready to go live! See **[HOSTING_SETUP_COMPLETE.md](HOSTING_SETUP_COMPLETE.md)** for instructions.

**Quick deploy:**
```bash
# 1. Add your Firebase config to public/app.js
# 2. Run:
./deploy.sh
# or
firebase deploy --only hosting
```

## Project Structure

```
/
├── public/                # 🌐 Firebase Hosting (Landing Page)
│   ├── index.html        # Waitlist landing page
│   ├── styles.css        # Responsive styles
│   ├── app.js            # Firebase integration
│   └── README.md         # Hosting quick reference
├── functions/             # Firebase Cloud Functions (Backend)
│   ├── src/              # Function source code
│   └── package.json      # Backend dependencies
├── src/                  # React Native app (Frontend)
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components (WelcomeScreen.tsx)
│   ├── services/         # API and Firebase services (waitlist.service.ts)
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React Context providers
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── assets/           # Images, fonts, icons
│   └── config/           # Configuration files
├── firebase.json         # Firebase configuration
├── firestore.rules       # Firestore security rules (with waitlist rules)
├── storage.rules         # Storage security rules
├── deploy.sh             # 🚀 Easy deploy script
└── package.json          # Frontend dependencies
```

## Prerequisites

- Node.js v22 (required for Firebase Functions)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

## Setup

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd functions
npm install
cd ..
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, Storage, and Functions
3. Download configuration files
4. Update `src/config/firebase.config.ts` with your Firebase credentials

### 3. Environment Variables

Create `.env.development` and `.env.production` files in the root directory:

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Development

### Deploy Waitlist Landing Page

```bash
# Easy way (interactive menu)
./deploy.sh

# Or manually
firebase deploy --only hosting

# Test locally first
firebase emulators:start
# Then open http://localhost:5000
```

**📚 See [HOSTING_SETUP_COMPLETE.md](HOSTING_SETUP_COMPLETE.md) for complete deployment guide**

### Run React Native App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

### Run Firebase Emulators

```bash
firebase emulators:start
```

### Deploy Firebase Functions

```bash
cd functions
npm run deploy
```

## Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd functions
npm test
```

## Code Style

This project follows ESLint and Prettier configurations. Run:

```bash
npm run lint
npm run format
```

## Documentation

- **[HOSTING_SETUP_COMPLETE.md](HOSTING_SETUP_COMPLETE.md)** - Deploy your waitlist landing page
- **[CUSTOM_DOMAIN_SETUP.md](CUSTOM_DOMAIN_SETUP.md)** - Set up your custom domain (nonews.com)
- **[HOSTING_DEPLOY_GUIDE.md](HOSTING_DEPLOY_GUIDE.md)** - Complete hosting guide (400+ lines)
- **[public/README.md](public/README.md)** - Landing page quick reference
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[SETUP.md](SETUP.md)** - Detailed setup instructions

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT

