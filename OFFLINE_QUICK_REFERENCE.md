# Offline Support - Developer Quick Reference

## Files to Know

### Core Offline Files
| File | Purpose |
|------|---------|
| `next.config.mjs` | PWA configuration & caching rules |
| `public/manifest.json` | App metadata for installation |
| `app/offline.js` | Offline fallback page |
| `components/OfflineIndicator.js` | Yellow offline status banner |
| `components/ServiceWorkerRegistry.js` | Service worker registration |
| `lib/useOffline.js` | Offline detection hooks |

### Documentation Files
| File | Purpose |
|------|---------|
| `OFFLINE_SUPPORT.md` | Complete guide (2000+ words) |
| `OFFLINE_QUICK_START.md` | Quick reference for setup |
| `OFFLINE_TESTING_CHECKLIST.md` | Testing procedures |
| `OFFLINE_IMPLEMENTATION_SUMMARY.md` | What was implemented |

## Using Offline Hooks

### Check if Online/Offline
```javascript
import { useOfflineStatus } from '@/lib/useOffline';

export default function MyComponent() {
  const { isOnline, mounted } = useOfflineStatus();
  
  if (!mounted) return null; // Avoid hydration mismatch
  
  if (!isOnline) {
    return <p>You're offline!</p>;
  }
  
  return <p>Online</p>;
}
```

### Manage Service Worker Registration
```javascript
import { useServiceWorkerRegistration } from '@/lib/useOffline';

export default function MyComponent() {
  const { registration, error } = useServiceWorkerRegistration();
  
  if (error) {
    console.error('SW failed:', error);
  }
  
  if (registration) {
    console.log('SW registered:', registration);
  }
}
```

### Handle App Updates
```javascript
import { useUpdateAvailable } from '@/lib/useOffline';

export default function MyComponent() {
  const { updateAvailable, skipWaiting } = useUpdateAvailable();
  
  return (
    <div>
      {updateAvailable && (
        <button onClick={skipWaiting}>
          Update Available - Click to Install
        </button>
      )}
    </div>
  );
}
```

## Testing Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Start development (with hot reload)
npm run dev
```

## DevTools Testing

1. **Open DevTools:** F12 or Right-click → Inspect
2. **Go to:** Application tab
3. **Check Service Worker:**
   - Left sidebar → Service Workers
   - Should see "sw.js" with "Running" status
4. **Test Offline:**
   - Check "Offline" checkbox
   - Navigate pages (they load from cache)
   - See yellow offline indicator

## PWA Installation

### Browser Icons
- **Chrome/Edge:** Click install icon in address bar
- **Firefox:** Add to home screen option in menu
- **Safari (iOS):** Share → Add to Home Screen
- **Safari (Mac):** File → Add to Dock

### Home Screen Installation
- **iOS:** Safari → Share → Add to Home Screen
- **Android:** Chrome → Menu → Install app
- **Windows/Mac Desktop:** Install button in address bar

## Caching Strategy Cheat Sheet

```
Content Type → Strategy → Cache Name → Duration → Limit
─────────────────────────────────────────────────────────
Pages        → Network-First → pages → 30 days → 32
Images       → Cache-First → image-cache → 30 days → 100
Documents    → Cache-First → document-cache → 30 days → 50
Fonts        → Cache-First → google-fonts → 1 year → 20
API Data     → Network-First → api-cache → 5 min → 30
Static JS    → Cache-First → static-js-assets → 1 day → 64
CSS          → Cache-First → static-style-assets → 1 day → 32
```

## Common Tasks

### Add New Cache Strategy
Edit `next.config.mjs`:
```javascript
const withPWAConfig = withPWA({
  // ... existing config
  workboxOptions: {
    runtimeCaching: [
      // ... existing caches
      {
        urlPattern: /\.(?:webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'webp-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 2592000,
          },
        },
      },
    ],
  },
});
```

### Update Manifest
Edit `public/manifest.json`:
```json
{
  "name": "Field Expedition Platform",
  "short_name": "IHRR",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#ffffff",
  "icons": [
    {
      "src": "/path/to/icon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Show Offline Status
```javascript
import { useOfflineStatus } from '@/lib/useOffline';

// Component will automatically show offline indicator
// (OfflineIndicator.js in layout already does this)
```

## Browser DevTools Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open DevTools | F12 |
| Hard Refresh (clear cache) | Ctrl+Shift+R or Cmd+Shift+R |
| Open Application tab | F12 → Application |
| Service Workers | F12 → Application → Service Workers |
| Clear Site Data | F12 → Application → Storage → Clear |
| Network Tab | F12 → Network |

## Debugging Tips

### Check if Service Worker Registered
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log(regs); // Should show sw.js registration
});
```

### View Cached Files
```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(reqs => {
        console.log(name, reqs);
      });
    });
  });
});
```

### Force Service Worker Update
```javascript
// In browser console
navigator.serviceWorker.ready.then(reg => {
  reg.update();
});
```

### Clear All Caches
```javascript
// In browser console
caches.keys().then(names => {
  return Promise.all(names.map(name => caches.delete(name)));
});
```

## Troubleshooting Commands

```bash
# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Hard rebuild (Windows)
del /Q node_modules && del package-lock.json && npm install && npm run build

# Hard rebuild (Mac/Linux)
rm -rf node_modules package-lock.json && npm install && npm run build
```

## Important URLs

- **Local Dev:** http://localhost:3000
- **Service Worker:** /sw.js
- **Manifest:** /manifest.json
- **Offline Fallback:** /offline.js

## Performance Monitoring

```javascript
// Measure service worker registration time
console.time('SW Registration');
navigator.serviceWorker.register('/sw.js').then(() => {
  console.timeEnd('SW Registration');
});

// Check cache size
caches.keys().then(names => {
  let total = 0;
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(reqs => {
        console.log(`${name}: ${reqs.length} items`);
      });
    });
  });
});
```

## Quick Links

- **Workbox Docs:** https://developers.google.com/web/tools/workbox
- **next-pwa GitHub:** https://github.com/ducanh2912/next-pwa
- **MDN Service Workers:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Web.dev PWA:** https://web.dev/progressive-web-apps/

---

**Last Updated:** May 2026  
**Version:** 1.0 Complete  
**Status:** Production Ready ✅
