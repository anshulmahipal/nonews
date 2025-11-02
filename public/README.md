# 🌐 no news - Landing Page

This directory contains the Firebase Hosting landing page for **no news**.

## 📁 Files

```
public/
├── index.html                    # Main landing page
├── styles.css                    # Responsive CSS styles
├── app.js                       # Firebase integration & form logic
├── firebase-config.example.js   # Config template
└── README.md                    # This file
```

## 🚀 Quick Start

### 1. Add Firebase Config

Edit `app.js` (lines 4-11) and replace with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

Find your config in [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps

### 2. Deploy

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or test locally first
firebase emulators:start
```

### 3. Open Your Site

Your site will be live at:
- `https://YOUR_PROJECT_ID.web.app`
- `https://YOUR_PROJECT_ID.firebaseapp.com`

## ✨ Features

- ✅ Beautiful, responsive design
- ✅ Email validation with error messages
- ✅ Firebase Firestore integration
- ✅ Loading states and success feedback
- ✅ Mobile-first, works on all devices
- ✅ SEO optimized with meta tags
- ✅ Fast loading (no frameworks)

## 🎨 Customization

### Change Colors
Edit `styles.css`:
```css
body { background-color: #FAFAFA; }
.submit-button { background-color: #1a1a1a; }
```

### Change Content
Edit `index.html`:
- App name: line 24
- Tagline: line 25
- Hero text: lines 30-36
- Features: lines 38-62

### Add Your Logo
Replace the emoji (line 23) with an `<img>` tag:
```html
<img src="logo.png" alt="no news logo" class="logo-icon">
```

## 📊 Data Structure

Waitlist entries saved to Firestore collection `waitlist`:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-10-14T10:30:00.000Z",
  "source": "website"
}
```

## 🔒 Security

Firestore rules in `/firestore.rules` allow:
- ✅ Anyone to create (submit form)
- ❌ No public read access (privacy)
- ❌ No updates or deletes

## 📈 View Signups

### Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Firestore Database**
4. View **waitlist** collection

### Export Data
See [HOSTING_DEPLOY_GUIDE.md](../HOSTING_DEPLOY_GUIDE.md#-view-waitlist-entries) for export scripts

## 🧪 Testing

### Local Testing
```bash
firebase emulators:start
# Open http://localhost:5000
```

### Test Checklist
- [ ] Form validates email
- [ ] Success message appears
- [ ] Data saves to Firestore
- [ ] Works on mobile
- [ ] Works in all browsers

## 🐛 Troubleshooting

**Form doesn't submit?**
- Check Firebase config in `app.js`
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Check browser console (F12) for errors

**Changes not showing?**
- Clear browser cache
- Try incognito/private mode
- Redeploy: `firebase deploy --only hosting`

## 📚 Documentation

For detailed instructions, see:
- [HOSTING_DEPLOY_GUIDE.md](../HOSTING_DEPLOY_GUIDE.md) - Complete deployment guide
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)

## 🎯 What's Next?

After your landing page is live:
1. Add Google Analytics
2. Set up custom domain
3. Create email notifications for signups
4. Build the actual app!

---

**Ready to deploy? Run:** `firebase deploy --only hosting`

