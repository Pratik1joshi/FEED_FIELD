# 🌍 Offline Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐          ┌──────────────────┐              │
│  │   React App     │◄────────►│  localStorage    │              │
│  │  (Layout +      │          │  (Auth, Notes,   │              │
│  │  Components)    │          │   Documents)     │              │
│  └────────┬────────┘          └──────────────────┘              │
│           │                                                      │
│           ▼                                                      │
│  ┌────────────────────────────────────────┐                    │
│  │  OfflineIndicator                      │                    │
│  │  (Yellow Banner - Connection Status)   │                    │
│  └────────────────────────────────────────┘                    │
│           ▲                                                      │
│           │                                                      │
│  ┌────────▼────────────────────────────────────┐               │
│  │        useOfflineStatus() Hook              │               │
│  │  (Detects online/offline state)             │               │
│  └────────────────────────────────────────────┘               │
│                    │                                            │
│                    ▼                                            │
│  ┌────────────────────────────────────────┐                   │
│  │    🔧 Service Worker (sw.js)           │                   │
│  │  ┌──────────────────────────────────┐  │                   │
│  │  │  Fetch Handler (Request Router)  │  │                   │
│  │  └──────────────────────────────────┘  │                   │
│  │  ┌──────────────────────────────────┐  │                   │
│  │  │  Caching Strategy Selector       │  │                   │
│  │  │  • Network-First (Pages)         │  │                   │
│  │  │  • Cache-First (Images)          │  │                   │
│  │  │  • Cache-First (Documents)       │  │                   │
│  │  │  • Cache-First (Static)          │  │                   │
│  │  └──────────────────────────────────┘  │                   │
│  └────────────────────────────────────────┘                   │
│           ▲                                                     │
│           │                                                     │
│  ┌────────▼──────────────────────────────────────┐            │
│  │        📦 Cache Storage (IndexedDB)           │            │
│  │  ┌────────────────────────────────────────┐  │            │
│  │  │ Cache: image-cache (100 items, 30 days)   │            │
│  │  │ Cache: document-cache (50 items, 30 days) │            │
│  │  │ Cache: api-cache (30 items, 5 min)        │            │
│  │  │ Cache: google-fonts (20 items, 1 year)    │            │
│  │  │ Cache: static-assets (64 items, 1 day)    │            │
│  │  └────────────────────────────────────────┘  │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
         ▲                              │
         │                              ▼
      ONLINE                        OFFLINE
    (Try Network)              (Use Cache)
         │                              │
         └──────────────────┬───────────┘
                            │
                    ┌───────▼────────┐
                    │  Offline Page  │
                    │  (offline.js)  │
                    └────────────────┘
```

## Request Flow (Online vs Offline)

### ✅ Online Request Flow
```
User Action
    │
    ▼
Service Worker Intercepts Request
    │
    ├─ Is it a page/API? → Network-First Strategy
    │  │ ├─ Try fetch from network (10s timeout)
    │  │ ├─ Cache response for next time
    │  │ └─ If network fails → Use cached version
    │  │
    │  └─ Response served
    │
    ├─ Is it image/document? → Cache-First Strategy
    │  │ ├─ Check cache first
    │  │ └─ Use cached version (fast!)
    │  │
    │  └─ Response served
    │
    ▼
Browser Displays Content
```

### 📴 Offline Request Flow
```
User Action (No Internet)
    │
    ▼
Service Worker Intercepts Request
    │
    ├─ Check cache for requested URL
    │  │
    │  ├─ If cached → Serve immediately ✅
    │  │  └─ Shows content from cache
    │  │
    │  └─ If NOT cached → Return offline page
    │     └─ Shows beautiful offline fallback
    │
    ▼
Yellow Indicator Shows "You're Offline"
```

## Component Relationships

```
┌─────────────────────────────────────────┐
│  app/layout.js (Root Layout)            │
├─────────────────────────────────────────┤
│                                         │
│  ├─ <ServiceWorkerRegistry />          │
│  │  └─ Auto-registers SW               │
│  │  └─ Checks updates periodically     │
│  │                                     │
│  ├─ <OfflineIndicator />               │
│  │  └─ Shows when offline              │
│  │  └─ Uses useOfflineStatus()         │
│  │                                     │
│  ├─ <Navbar />                         │
│  │  └─ Main navigation                 │
│  │                                     │
│  ├─ {children}                         │
│  │  ├─ / (Home)                        │
│  │  ├─ /location/[slug]                │
│  │  ├─ /field-documents                │
│  │  └─ /offline (Fallback)             │
│  │                                     │
│  └─ <footer>                           │
│     └─ Site footer                     │
│                                         │
└─────────────────────────────────────────┘
```

## Caching Waterfall

```
Request comes in
    │
    ▼
┌─────────────────────────────┐
│ Service Worker Routing      │
└─────────────────────────────┘
    │
    ├─────────────────────────────────┐
    │                                 │
    ▼                                 ▼
┌──────────────────┐      ┌──────────────────────┐
│   HTML Pages     │      │  Static Assets       │
│                  │      │  (JS, CSS, Fonts)    │
│ Network-First    │      │                      │
│ (10s timeout)    │      │ Cache-First          │
│                  │      │                      │
│ Try network ─────┼──────┼─ Check cache first   │
│  │ Success?      │      │  │ Found?            │
│  │ Yes ──────────┼──────┼──┼─ Use it!          │
│  │              │      │  │                    │
│  │ No, try cache │      │  │ Not found?         │
│  │ │ Found?      │      │  │ Network request    │
│  │ │ Yes ────────┼──────┼──┼─ Cache & serve     │
│  │ │            │      │  │                    │
│  │ │ No ────────┼──────┼──┼─ Offline page      │
│  └──────────────┘      └──────────────────────┘
    │
    ▼
┌──────────────────┐      ┌──────────────────────┐
│   Images         │      │  Documents (PDF,     │
│   Leaflet Tiles  │      │  DOCX, Word docs)    │
│                  │      │                      │
│ Cache-First      │      │ Cache-First          │
│ (30 days)        │      │ (30 days)            │
│                  │      │                      │
│ Check cache ─────┼──────┼─ Check cache         │
│  │ Found?        │      │  │ Found?            │
│  │ Yes ──────────┼──────┼──┼─ Serve instantly  │
│  │              │      │  │                    │
│  │ No, network  │      │  │ Not found?         │
│  │ │ Success?    │      │  │ Fetch from network │
│  │ │ Yes ────────┼──────┼──┼─ Cache it         │
│  │ │            │      │  │                    │
│  │ │ No ────────┼──────┼──┼─ Use broken icon   │
│  └──────────────┘      └──────────────────────┘
    │
    ▼
Serve to Browser
```

## Data Flow with Offline Support

```
User Opens App (First Time)
    │
    ├─ <html> loads
    ├─ manifest.json loads (PWA metadata)
    ├─ Service Worker registers (sw.js)
    ├─ React components mount
    ├─ useOfflineStatus() checks connection
    ├─ OfflineIndicator renders (hidden if online)
    ├─ Navbar displays
    └─ Page content loads/cached
        │
        ├─ Images downloaded & cached
        ├─ Documents downloaded & cached
        ├─ API responses cached
        └─ localStorage keeps user state
              │
              ▼
    User Goes Offline
        │
        ├─ useOfflineStatus() returns isOnline=false
        ├─ OfflineIndicator shows yellow banner
        ├─ Clicking links loads from cache
        ├─ Previously viewed pages work
        └─ New pages show offline fallback
              │
              ▼
    User Goes Online
        │
        ├─ useOfflineStatus() returns isOnline=true
        ├─ OfflineIndicator hides
        ├─ Fresh content fetches from network
        ├─ Cache updates with new content
        └─ App stays in sync
```

## Performance Timeline

```
First Visit (Online):
    Time 0ms   ├─ Browser requests index.html
    Time 50ms  ├─ HTML loaded, service worker registers
    Time 100ms ├─ React mounts, layout renders
    Time 150ms ├─ Images start downloading
    Time 200ms ├─ Leaflet map initializes
    Time 300ms ├─ Documents cached
    Time 2000ms└─ Full page ready (SW caching in background)

Offline Visit (Cached):
    Time 0ms   ├─ Browser requests index.html
    Time 10ms  ├─ Service Worker intercepts, checks cache
    Time 20ms  ├─ Cached HTML returned
    Time 50ms  ├─ React mounts instantly
    Time 100ms ├─ All images from cache (instant)
    Time 150ms └─ Full page ready from cache!
                    (150x faster than network!)
```

## File Relationships

```
next.config.mjs
    ├─ Configures PWA settings
    ├─ Sets up workbox caching rules
    └─ Generates service worker
        │
        ▼
    public/sw.js (Auto-generated by next-pwa)
        ├─ Intercepts all requests
        ├─ Applies caching strategies
        └─ Manages cache expiration

public/manifest.json
    ├─ App metadata
    ├─ Icons for home screen
    ├─ Installation config
    └─ App shortcuts

app/layout.js
    ├─ Imports ServiceWorkerRegistry
    ├─ Imports OfflineIndicator
    ├─ Adds PWA meta tags
    └─ Renders all child pages

components/ServiceWorkerRegistry.js
    └─ Registers sw.js on load

components/OfflineIndicator.js
    └─ Shows yellow banner when offline
        (uses useOfflineStatus hook)

lib/useOffline.js
    ├─ useOfflineStatus() - connection status
    ├─ useServiceWorkerRegistration() - SW management
    └─ useUpdateAvailable() - app updates

app/offline.js
    └─ Beautiful fallback page shown when 
       user tries to load uncached page offline
```

## Security Model

```
Service Worker Scope: /
    ├─ Only intercepts requests from same origin
    ├─ Cannot access cross-origin data
    ├─ HTTPS required in production (localhost OK)
    │
    ├─ Cache can be cleared by user
    │   └─ DevTools > Application > Clear site data
    │
    ├─ Service worker can be unregistered
    │   └─ DevTools > Application > Service Workers
    │
    └─ No sensitive data in cache
        └─ localStorage is separate and encrypted

Data Privacy:
    ├─ User auth state → localStorage (not cached)
    ├─ Notes → localStorage (not cached)
    ├─ Documents → cached (user downloaded them)
    └─ Images → cached (already public)
```

---

This architecture ensures your app works seamlessly both online and offline while maintaining security and performance.
