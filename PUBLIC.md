# Public Website Documentation

> Waitlist landing page and web interface for noNews

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Development Guide](#development-guide)
- [Firebase Integration](#firebase-integration)
- [Deployment](#deployment)
- [Customization](#customization)

## 🎯 Overview

The `public/` directory contains a static website for noNews, serving as:

- **Waitlist Landing Page** - Collect early user signups
- **Marketing Site** - Showcase app features and benefits
- **Web Interface** - Potential web-based bookmark management

### Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with responsive design
- **Vanilla JavaScript** - No frameworks, lightweight
- **Firebase Hosting** - Static site hosting
- **Firebase SDK** - Firestore and Authentication integration

## 📁 Project Structure

```
public/
├── index.html                   # Main landing page
├── styles.css                   # Stylesheet
├── app.js                       # Client-side JavaScript
├── firebase-config.example.js   # Firebase config template
├── favicon.png                  # Site icon
└── README.md                    # Documentation
```

### File Descriptions

#### `index.html`
Main HTML page containing:
- Hero section with app introduction
- Features showcase
- Waitlist signup form
- Footer with links

#### `styles.css`
Complete stylesheet with:
- Responsive design (mobile-first)
- Modern CSS Grid and Flexbox
- Custom color scheme
- Animation and transitions
- Dark mode support (optional)

#### `app.js`
Client-side JavaScript for:
- Waitlist form handling
- Firebase integration
- Form validation
- Success/error messages
- Analytics tracking

#### `firebase-config.example.js`
Template for Firebase configuration:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

## ✨ Features

### 1. Waitlist System

**Functionality:**
- Email collection form
- Name (optional) and email input
- Validation (email format, required fields)
- Duplicate prevention
- Success confirmation
- Firestore storage

**Data Structure:**
```javascript
// Stored in Firestore: waitlist/{docId}
{
  email: "user@example.com",
  name: "John Doe",
  signupDate: "2025-11-30T12:00:00.000Z",
  source: "website",
  status: "pending",
  deviceInfo: {
    userAgent: "...",
    platform: "web"
  }
}
```

### 2. Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Features:**
- Mobile-first approach
- Touch-friendly buttons (min 44x44px)
- Optimized images
- Readable typography (16px base)
- Flexible grid layouts

### 3. Performance

**Optimizations:**
- Minimal JavaScript (< 10KB)
- CSS minification ready
- Image optimization
- Lazy loading (if applicable)
- CDN delivery via Firebase Hosting

### 4. SEO

**Implemented:**
- Semantic HTML5 elements
- Meta tags (title, description)
- Open Graph tags (social sharing)
- Twitter Card tags
- Structured data (JSON-LD)
- Sitemap ready

**Example Meta Tags:**
```html
<meta name="description" content="Save and organize news articles">
<meta property="og:title" content="noNews - News Bookmarking">
<meta property="og:image" content="/path/to/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
```

## 🔨 Development Guide

### Setup

1. **Clone Repository**
```bash
git clone <repo-url>
cd noNews/public
```

2. **Configure Firebase**
```bash
# Copy example config
cp firebase-config.example.js firebase-config.js

# Edit with your Firebase project credentials
nano firebase-config.js
```

3. **Add to .gitignore**
```bash
# Ensure firebase-config.js is ignored
echo "public/firebase-config.js" >> ../.gitignore
```

### Local Development

#### Option 1: Firebase Hosting Emulator (Recommended)

```bash
# From project root
firebase serve --only hosting

# Access at: http://localhost:5000
```

#### Option 2: Simple HTTP Server

```bash
# Using Python
cd public
python3 -m http.server 8000

# Using Node.js
npx http-server public -p 8000

# Access at: http://localhost:8000
```

#### Option 3: Live Server (VS Code)

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Making Changes

#### Update Content

1. **Edit HTML** (`index.html`)
```html
<!-- Update hero heading -->
<h1>Your New Heading</h1>

<!-- Add new section -->
<section class="features">
  <h2>Features</h2>
  <div class="feature-grid">
    <!-- Feature cards -->
  </div>
</section>
```

2. **Edit Styles** (`styles.css`)
```css
/* Custom colors */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #ffffff;
  --text-color: #333333;
}

/* Responsive design */
@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;
  }
}
```

3. **Edit JavaScript** (`app.js`)
```javascript
// Custom form handler
document.getElementById('waitlist-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = e.target.email.value;
  
  // Your custom logic
});
```

#### Add New Page

```bash
# Create new HTML file
touch public/about.html

# Link from index.html
<a href="/about.html">About</a>
```

## 🔥 Firebase Integration

### Initialize Firebase

In `app.js`:

```javascript
// Import Firebase SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Import your config
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add to waitlist
async function addToWaitlist(email, name) {
  try {
    const docRef = await addDoc(collection(db, 'waitlist'), {
      email: email,
      name: name || null,
      signupDate: new Date().toISOString(),
      source: 'website',
      status: 'pending'
    });
    
    console.log('Added to waitlist:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}
```

### Firestore Security Rules

Ensure waitlist collection is writable:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /waitlist/{docId} {
      // Allow anyone to add to waitlist
      allow create: if request.resource.data.keys().hasAll(['email', 'signupDate'])
                    && request.resource.data.email is string
                    && request.resource.data.email.matches('.*@.*\\..*');
      
      // Only authenticated users can read
      allow read: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment

### Deploy to Firebase Hosting

```bash
# From project root
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

### Custom Domain Setup

1. **Add Domain in Firebase Console**
   - Go to Hosting → Add custom domain
   - Enter your domain (e.g., `nonews.app`)

2. **Update DNS Records**
   - Add A record pointing to Firebase IPs
   - Add TXT record for verification

3. **Wait for SSL Certificate**
   - Automatic SSL/TLS provisioning
   - Usually takes < 24 hours

### Deployment URL

After deployment, your site will be available at:
- Firebase subdomain: `https://<project-id>.web.app`
- Custom domain: `https://yourdomain.com` (if configured)

## 🎨 Customization

### Color Scheme

Update CSS variables:

```css
:root {
  /* Primary colors */
  --primary-color: #007bff;
  --primary-hover: #0056b3;
  
  /* Background colors */
  --bg-color: #ffffff;
  --bg-secondary: #f8f9fa;
  
  /* Text colors */
  --text-color: #333333;
  --text-muted: #6c757d;
  
  /* Accent colors */
  --success-color: #28a745;
  --error-color: #dc3545;
}
```

### Typography

```css
:root {
  /* Font families */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-heading: 'Poppins', sans-serif;
  
  /* Font sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
}
```

### Layout

```css
/* Container widths */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Grid system */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
```

## 📊 Analytics

### Add Google Analytics

```html
<!-- In index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Track Events

```javascript
// Track waitlist signups
gtag('event', 'signup', {
  'event_category': 'waitlist',
  'event_label': 'website'
});

// Track button clicks
document.querySelector('.cta-button').addEventListener('click', () => {
  gtag('event', 'click', {
    'event_category': 'engagement',
    'event_label': 'cta_button'
  });
});
```

## 🔒 Security

### Content Security Policy

Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://www.gstatic.com; 
               style-src 'self' 'unsafe-inline';">
```

### HTTPS Only

Firebase Hosting automatically redirects HTTP to HTTPS.

## 🐛 Troubleshooting

### Firebase Not Connecting

1. Check `firebase-config.js` credentials
2. Verify project is selected: `firebase use <project-id>`
3. Check browser console for errors
4. Ensure Firestore security rules allow write

### Deployment Issues

```bash
# Re-login to Firebase
firebase logout
firebase login

# Check project
firebase projects:list
firebase use <project-id>

# Deploy with debug
firebase deploy --only hosting --debug
```

### Styling Not Applying

1. Clear browser cache (Ctrl+Shift+R)
2. Check CSS file path in HTML
3. Verify no syntax errors in CSS
4. Check browser DevTools console

## 📚 Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase SDK Web Guide](https://firebase.google.com/docs/web/setup)
- [HTML Best Practices](https://developer.mozilla.org/en-US/docs/Learn/HTML)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [JavaScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Last Updated:** November 30, 2025

