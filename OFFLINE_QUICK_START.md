# Offline Support - Quick Start Guide

## ✅ What's Been Implemented

Your Field Expedition Platform now has complete offline support! Here's what was added:

### 1. **PWA Configuration** (`next.config.mjs`)
   - Integrated `@ducanh2912/next-pwa` for service worker management
   - Smart caching strategies for different content types
   - Automatic reloading when coming back online

### 2. **Visual Offline Indicator** (`OfflineIndicator.js`)
   - Shows when user is offline at the top of the page
   - Yellow banner with pulsing indicator
   - Auto-hides when connection is restored

### 3. **Offline Fallback Page** (`app/offline.js`)
   - Beautiful fallback page if offline
   - Lists available cached content
   - Helpful tips for offline usage

### 4. **Service Worker Registry** (`ServiceWorkerRegistry.js`)
   - Automatically registers the service worker
   - Checks for app updates every minute
   - Logs registration status

### 5. **Offline Detection Hooks** (`lib/useOffline.js`)
   - `useOfflineStatus()` - Check if online/offline
   - `useServiceWorkerRegistration()` - Manage SW registration
   - `useUpdateAvailable()` - Handle app updates

### 6. **PWA Manifest** (`public/manifest.json`)
   - App installation support (home screen icons)
   - App shortcuts to popular locations
   - Proper metadata for all platforms

### 7. **Enhanced HTML Head** (`app/layout.js`)
   - Apple web app meta tags
   - Mobile web app configuration
   - Theme color settings

## 🚀 Quick Testing Guide

### Test Offline Mode Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open DevTools (F12)** and go to **Application** tab

3. **Simulate offline mode:**
   - Click **Service Workers** in the left sidebar
   - Check the **Offline** checkbox

4. **Test offline functionality:**
   - Navigate between pages (should work)
   - Open documents (should use cached versions)
   - See the yellow offline indicator appear
   - Try to load new content (should fail gracefully)

### Test on Real Device

#### iOS (iPhone/iPad)
1. Open the site in Safari
2. Tap Share → Add to Home Screen
3. Name it "IHRR Expeditions" → Add
4. Disable WiFi/Mobile Data
5. Tap the app icon - should work!

#### Android
1. Open the site in Chrome
2. Tap Menu (⋮) → Install app
3. Disable WiFi/Mobile Data
4. Tap the app icon - should work!

## 📊 Caching Breakdown

| Content Type | Strategy | Cache Duration | Size Limit |
|--------------|----------|-----------------|-----------|
| **Pages** | Network-First | 30 days | 32 pages |
| **Images** | Cache-First | 30 days | 100 items |
| **Documents** (PDF/DOCX) | Cache-First | 30 days | 50 items |
| **API Responses** | Network-First | 5 minutes | 30 items |
| **Google Fonts** | Cache-First | 1 year | 20 items |
| **Static Assets** | Cache-First | 1 day | 64 items |

## 🔧 Configuration Files

All offline functionality is configured in:
- **`next.config.mjs`** - Main PWA settings and caching rules
- **`public/manifest.json`** - App metadata and installation config
- **`app/layout.js`** - Service worker registration and metadata

## 📚 Documentation

For detailed information, see: [OFFLINE_SUPPORT.md](./OFFLINE_SUPPORT.md)

This includes:
- How offline mode works
- Device installation instructions
- Caching strategies explained
- Troubleshooting guide
- Best practices
- Developer API reference

## 🎯 Next Steps

1. **Build for production:** `npm run build`
2. **Test thoroughly** on different devices and networks
3. **Deploy** to your hosting service
4. **Announce** the offline feature to users!

## ✨ Key Features Users Can Now Do

✅ Use app without internet connection  
✅ Install app on home screen (mobile & desktop)  
✅ Access previously viewed expeditions offline  
✅ View cached maps and location details  
✅ Read downloaded documents without connection  
✅ Automatic sync when connection returns  
✅ App updates available when online  

## 🐛 Troubleshooting

**Service Worker not showing?**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check DevTools > Application > Service Workers

**Offline indicator not appearing?**
- Make sure you're in a client component (has "use client")
- Check browser console for errors

**Cache not clearing?**
- Go to Settings > Storage/Site Data
- Find your app and delete cached data
- Hard refresh to re-register service worker

## 📞 Support Resources

- **PWA Guide:** https://web.dev/progressive-web-apps/
- **Next.js PWA:** https://github.com/ducanh2912/next-pwa
- **Service Workers:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

**Status:** ✅ Ready for offline use!

Build the project and test on your device. The app will cache content automatically as users browse.
