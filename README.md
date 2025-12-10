# Threadlines 🧵

A modern, beautiful snippet and knowledge management system built with React, TypeScript, and Firebase.

## ✨ Features

- **Beautiful UI**: Clean, modern interface with smooth animations
- **Smart Organization**: Organize snippets with folders, tags, and categories
- **Real-time Sync**: Firebase-powered real-time synchronization
- **Offline Support**: Works offline with service worker caching
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Water-splash Transitions**: Smooth page transitions with perfect timing
- **PWA Ready**: Installable as a Progressive Web App

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

## 🔧 Recent Fixes & Improvements

### ✅ Fixed Issues
- **Missing CSS file**: Created `index.css` with proper styles
- **Water-splash transition timing**: Fixed transition to happen during navigation, not after
- **TypeScript errors**: Resolved all compilation issues
- **Error boundaries**: Added proper error handling
- **Responsive design**: Improved mobile experience

### 🎨 Enhanced Features
- **Faster transitions**: Reduced animation duration for better UX (800ms → 400ms)
- **Offline indicator**: Shows network status in header
- **Service worker**: Added caching for offline functionality
- **PWA manifest**: App can be installed on devices
- **Loading animations**: Beautiful loading states with motion
- **Better error handling**: Graceful error recovery

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Firebase (Auth + Firestore)
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📱 Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Firebase Setup

The app is pre-configured with Firebase. For production use:

1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Update `firebase.ts` with your config

---
