# 🔧 Get Your Firebase Configuration

Your waitlist form needs Firebase configuration to work. Follow these steps:

## Step 1: Get Firebase Config from Console

### Option A: Firebase Console (Web Interface)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **noNews** project
3. Click the **⚙️ Settings** icon (gear icon) → **Project settings**
4. Scroll down to **"Your apps"** section
5. Look for a web app (</> icon)
   - **If you see a web app:** Click it to view the config
   - **If no web app exists:** Click **"Add app"** → Choose **Web** (</>) → Register app

6. You'll see a `firebaseConfig` object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### Option B: Using Firebase CLI

```bash
# List your Firebase projects
firebase projects:list

# Get project info
firebase apps:list WEB
```

## Step 2: Add Config to Your Website

Open `public/app.js` and replace lines 3-12:

**Replace this:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**With your actual config:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyAbc123...",  // Your actual key
    authDomain: "nonews-123.firebaseapp.com",
    projectId: "nonews-123",
    storageBucket: "nonews-123.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123..."
};
```

## Step 3: Deploy Updated Website

```bash
firebase deploy --only hosting
```

## Step 4: Test

1. Open your website
2. Enter an email in the waitlist form
3. Click "Join Waitlist"
4. You should see a success message! 🎉

## Troubleshooting

### Issue: "Firebase not initialized"
**Fix:** Make sure you copied the ENTIRE config object

### Issue: "Permission denied"
**Fix:** Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

### Issue: Still not working
**Check:**
1. Open browser console (F12)
2. Look for errors
3. Make sure you replaced ALL placeholder values
4. Clear browser cache (Cmd+Shift+R)

---

## Quick Check

After adding config, the form should:
- ✅ Show "Joining..." when submitting
- ✅ Display success message
- ✅ Save to Firestore `waitlist` collection
- ✅ Reset the form

Test it by entering: `test@example.com`
Then check Firebase Console → Firestore Database → `waitlist` collection

