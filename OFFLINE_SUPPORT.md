# Offline Support Guide

This Field Expedition Platform is now fully configured for offline functionality using Progressive Web App (PWA) technology.

## Features

### ✅ What Works Offline

1. **Cached Pages**
   - All previously visited pages remain accessible
   - Route maps and location details
   - Expedition information and descriptions

2. **Cached Media**
   - Downloaded images and photos
   - Previously viewed PDFs and documents
   - All static assets (CSS, JavaScript, fonts)

3. **Local Storage**
   - User authentication state
   - Notes by location
   - Uploaded documents
   - All user-generated content

4. **Automatic Updates**
   - Service Worker automatically caches new pages as you browse
   - Document and image caching for quick loading
   - API responses cached for offline access

### 📱 Installing the App

#### On Mobile (iOS)
1. Open the website in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name it "IHRR Expeditions" and tap Add

#### On Mobile (Android)
1. Open the website in Chrome
2. Tap the menu button (three dots)
3. Select "Install app" or "Add to Home Screen"
4. Confirm the installation

#### On Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or go to Menu > "Install Field Expedition Platform"

## How Offline Mode Works

### Caching Strategy

The app uses intelligent caching strategies for different content types:

```
Static Assets (JS, CSS, Fonts)
└─ Cache-First: Uses cached version immediately, updates in background

Images & Documents
└─ Cache-First: Fast loading from cache with 30-day expiration

API Requests
└─ Network-First: Tries to fetch fresh data, falls back to cache with 5-min expiration

HTML Pages
└─ Network-First: Attempts to load from network, uses cached version if offline
```

### Offline Indicator

A yellow banner appears at the top of the page when you're offline:
- Shows your connection status
- Indicates that cached content is available
- Disappears automatically when connection is restored

## Technical Details

### Service Worker Configuration

The app uses Workbox (via next-pwa) for sophisticated service worker management:

- **Cache Names:**
  - `google-fonts` - Google Fonts (30-year expiration)
  - `image-cache` - Images (30-day expiration)
  - `document-cache` - PDFs and documents (30-day expiration)
  - `api-cache` - API responses (5-minute expiration)

- **Network Timeout:** 10 seconds for API requests before falling back to cache

### Manifest File

The `manifest.json` includes:
- App metadata (name, description)
- App icons for home screen
- Shortcuts to popular locations (Kathmandu, Pokhara, Upper Mustang)
- Display mode (standalone - looks like native app)

### Using Offline Hooks

Developers can check offline status using the provided hooks:

```javascript
import { useOfflineStatus } from "@/lib/useOffline";

export default function MyComponent() {
  const { isOnline, mounted } = useOfflineStatus();

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div>
      Status: {isOnline ? "Online" : "Offline"}
    </div>
  );
}
```

## Testing Offline Mode

### In Browser DevTools

1. **Chrome/Edge:**
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Service Workers" on the left
   - Check "Offline" checkbox

2. **Firefox:**
   - Open DevTools (F12)
   - Go to Storage tab
   - Click "Service Workers"
   - Check "Simulate offline mode"

### Real Offline Testing

1. Disconnect your internet connection
2. Try navigating to different pages
3. Try opening documents
4. Check that the offline indicator appears

### Network Throttling

In DevTools > Network tab:
- Throttle to "Offline" to simulate disconnection
- Check "Disable cache" is unchecked for realistic offline behavior

## FAQ

**Q: Will new documents automatically cache?**
A: Yes! Documents viewed while online are cached for up to 30 days.

**Q: How much storage does caching use?**
A: Chrome/Android: typically 50MB+ available. iOS Safari: 50MB limit for all installed apps.

**Q: What happens when I go back online?**
A: The app automatically fetches fresh content. An update notification may appear if a new version is available.

**Q: Can I clear the cache?**
A: Yes - go to Settings > Storage/Site Data and find the app's cached data.

**Q: Will this work on my phone?**
A: Yes! It works on:
- iOS 15.1+ (via Home Screen app)
- Android 4.4+ (Chrome, Firefox, Edge browsers)
- Desktop browsers (Chrome, Edge, Firefox, Safari)

**Q: Can I use this offline in the field without installation?**
A: Yes! The first visit loads pages into cache. On slower connections, wait for pages to fully load before going offline.

## Troubleshooting

### Service Worker Not Registering
- Check DevTools > Application > Service Workers
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear site data and reload

### Offline Mode Not Working
- Make sure service worker is registered (see above)
- Check that you're using HTTPS (or localhost)
- Try hard refresh and revisit pages

### App Installation Not Available
- Update your browser to the latest version
- Check that manifest.json is loaded (DevTools > Application > Manifest)
- Try a different browser

### Cached Content Not Updating
- Hard refresh the page (Ctrl+Shift+R)
- Clear cache in browser settings
- The app will eventually update cached content automatically

## Best Practices

1. **Load Pages Before Going Offline**
   - Open all documents and images you'll need while online
   - Navigate to locations you want to reference offline

2. **Keep Storage Available**
   - Ensure your device has at least 100MB free space
   - Periodically clear old browser cache

3. **Update the App**
   - Reload the page occasionally to get the latest version
   - An update banner will appear when new versions are available

4. **Use Shortcut Links**
   - Add home screen shortcuts for frequently accessed locations
   - Quick access to Kathmandu, Pokhara, and Upper Mustang

## For Developers

### Build Process

```bash
# Install dependencies
npm install

# Build for production (PWA config is automatically applied)
npm run build

# Start production server
npm start
```

### Adding New Caching Strategies

Edit `next.config.mjs` and add to `workboxOptions.runtimeCaching`:

```javascript
{
  urlPattern: /\.(?:extension)$/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'custom-cache',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 2592000, // 30 days
    },
  },
}
```

### Service Worker Lifecycle

- **Install:** Cache essential assets
- **Activate:** Clean up old cache versions
- **Fetch:** Intercept requests and apply caching strategies
- **Message:** Receive skip-waiting messages for updates

## Performance Metrics

With offline support enabled:
- ⚡ Cached pages load instantly
- 📉 Reduced bandwidth usage
- 🚀 App works on slow connections (3G+)
- 🔋 Better battery life on mobile devices

## Resources

- [MDN Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [next-pwa Documentation](https://github.com/ducanh2912/next-pwa)
