# MAKEWITHUS Admin Dashboard - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Copy your Firebase config credentials
5. Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 3. Set Up Firestore Security Rules

In Firebase Console, go to Firestore Database → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Seed Demo Data (Optional)

To populate the database with sample data, you can call the `seedDemoData()` function. 

Add this temporarily to your `App.jsx`:

```javascript
import { seedDemoData } from './firebase/seedData';

// Inside App component, add a button:
<button onClick={seedDemoData}>Seed Demo Data</button>
```

Or run it once from the browser console after the app loads.

### 5. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📊 Firestore Collections Structure

### projects
- `name` (string) - Project name
- `totalCost` (number) - Total project cost
- `developerCost` (number) - Cost allocated to developers
- `paidAmount` (number) - Amount already paid
- `status` (string) - 'active', 'completed', or 'on-hold'
- `createdAt` (timestamp)

### employees
- `name` (string) - Employee name
- `role` (string) - Job role
- `salary` (number) - Monthly salary
- `createdAt` (timestamp)

### payments
- `projectId` (string) - Reference to project
- `amount` (number) - Payment amount
- `type` (string) - 'developer-payout' or 'client-payment'
- `description` (string) - Payment description
- `createdAt` (timestamp)

### activityLog
- `action` (string) - Action type
- `description` (string) - Activity description
- `timestamp` (timestamp)

### notices
- `text` (string) - Notice message
- `isActive` (boolean) - Whether notice is active
- `createdAt` (timestamp)

## 🎨 Features

✅ Real-time dashboard updates
✅ Bento grid layout with smooth animations
✅ Dark theme with muted orange accents
✅ Animated statistics with count-up effect
✅ Smooth line charts with Recharts
✅ Project finance tracking
✅ Activity log (top 5 recent)
✅ Scrolling notice marquee
✅ Fully responsive design

## 🔧 Customization

### Colors
Edit `src/index.css` CSS variables:
- `--accent-orange` - Primary accent color
- `--bg-primary` - Main background
- `--bg-card` - Card background

### Add New Data
Use Firebase hooks in `src/firebase/hooks.js` to fetch data, and add documents via Firestore console or programmatically.

## 📦 Build for Production

```bash
npm run build
```

Deploy the `dist` folder to your hosting service (Vercel, Netlify, Firebase Hosting, etc.)

## 🐛 Troubleshooting

**Issue: Firebase not connecting**
- Verify `.env` file exists with correct credentials
- Check Firebase project settings
- Ensure Firestore is enabled

**Issue: No data showing**
- Run the seed data function
- Check Firestore security rules
- Verify collections exist in Firestore console

**Issue: Charts not rendering**
- Clear browser cache
- Check console for errors
- Ensure Recharts is installed

## 📝 License

MIT License - Feel free to use for your projects!
