// Firebase Configuration and Initialization
// Replace with your Firebase config
const firebaseConfig = {
    // TODO: Add your Firebase configuration here
    // You can find this in Firebase Console > Project Settings > Your apps
    apiKey: "AIzaSyCSmSYGd6D_kEuv32BT69o_SqcTSeZBn-s",
    authDomain: "news-c5ff4.firebaseapp.com",
    databaseURL: "https://news-c5ff4.firebaseio.com",
    projectId: "news-c5ff4",
    storageBucket: "news-c5ff4.appspot.com",
    messagingSenderId: "861201104658",
    appId: "1:861201104658:web:5beb4cc2a54f3763d1fdcb",
    measurementId: "G-PEW9H914TF"
};

// Import Firebase modules (using CDN in production)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Initialize Firebase
let app;
let db;
let analytics;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    analytics = getAnalytics(app);
    console.log('Firebase initialized successfully');
    console.log('Analytics enabled');
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

// Form Elements
const form = document.getElementById('waitlistForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const submitButton = document.getElementById('submitButton');
const emailError = document.getElementById('emailError');
const successMessage = document.getElementById('successMessage');

// Email Validation
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Show Error
function showError(message) {
    emailError.textContent = message;
    emailInput.classList.add('error');

    // Track error
    let errorType = 'unknown';
    if (message.includes('required')) errorType = 'email_required';
    else if (message.includes('valid')) errorType = 'invalid_email';
    else if (message.includes('connection')) errorType = 'network_error';
    else if (message.includes('Configuration')) errorType = 'config_error';

    trackFormError(errorType);
}

// Clear Error
function clearError() {
    emailError.textContent = '';
    emailInput.classList.remove('error');
}

// Show Success
function showSuccess() {
    form.classList.add('hidden');
    successMessage.classList.remove('hidden');
}

// Handle Form Submission
async function handleSubmit(event) {
    event.preventDefault();
    clearError();

    const email = emailInput.value.trim().toLowerCase();
    const name = nameInput.value.trim();

    // Validate Email
    if (!email) {
        showError('Email is required');
        return;
    }

    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.textContent = 'Joining...';
    submitButton.classList.add('loading');

    try {
        // Check if Firebase is initialized
        if (!db) {
            throw new Error('Firebase not initialized. Please add your Firebase configuration.');
        }

        // Add to waitlist collection
        const waitlistEntry = {
            email: email,
            createdAt: new Date().toISOString(),
            source: 'website'
        };

        // Add name if provided
        if (name) {
            waitlistEntry.name = name;
        }

        const docRef = await addDoc(collection(db, 'waitlist'), waitlistEntry);

        console.log('Added to waitlist with ID:', docRef.id);

        // Show success message
        showSuccess();

        // Track with Firebase Analytics
        if (analytics) {
            logEvent(analytics, 'sign_up', {
                method: 'waitlist',
                source: 'website',
                has_name: !!name
            });
            logEvent(analytics, 'waitlist_signup', {
                email_provided: true
            });
        }

    } catch (error) {
        console.error('Error adding to waitlist:', error);

        let errorMessage = 'Something went wrong. Please try again.';

        if (error.code === 'permission-denied') {
            errorMessage = 'Unable to submit. Please check your internet connection.';
        } else if (error.message.includes('Firebase not initialized')) {
            errorMessage = 'Configuration error. Please contact support.';
        }

        showError(errorMessage);

    } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = 'Join Waitlist';
        submitButton.classList.remove('loading');
    }
}

// Analytics Helper Functions
function trackPageView() {
    if (analytics) {
        logEvent(analytics, 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
}

function trackFormStart() {
    if (analytics) {
        logEvent(analytics, 'form_start', {
            form_name: 'waitlist',
            form_location: 'home_page'
        });
    }
}

function trackFormError(errorType) {
    if (analytics) {
        logEvent(analytics, 'form_error', {
            form_name: 'waitlist',
            error_type: errorType
        });
    }
}

// Track page view on load
trackPageView();

// Event Listeners
form.addEventListener('submit', handleSubmit);

// Track when user starts filling the form
let formStartTracked = false;
emailInput.addEventListener('focus', () => {
    if (!formStartTracked) {
        trackFormStart();
        formStartTracked = true;
    }
});

// Clear error on input
emailInput.addEventListener('input', () => {
    if (emailError.textContent) {
        clearError();
    }
});

// Optional: Add keyboard shortcut (Enter)
emailInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSubmit(event);
    }
});

// Console welcome message
console.log('%c👋 Welcome to no news!', 'font-size: 20px; font-weight: bold; color: #1a1a1a;');
console.log('%cBuilt with ❤️ for mindful readers', 'color: #666;');

