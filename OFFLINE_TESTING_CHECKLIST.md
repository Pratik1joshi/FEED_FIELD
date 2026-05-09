# Offline Support - Testing Checklist

## Pre-Deployment Testing

### ✓ Service Worker Registration
- [ ] Build project: `npm run build`
- [ ] Start server: `npm run dev` or `npm start`
- [ ] Open DevTools (F12)
- [ ] Go to Application > Service Workers
- [ ] Confirm "sw.js" is registered and active
- [ ] Check "Running" status is active

### ✓ Offline Indicator
- [ ] Online mode: Yellow banner should NOT appear
- [ ] Enable offline in DevTools
- [ ] Yellow "You're offline" banner appears at top
- [ ] Banner disappears when going back online
- [ ] No console errors

### ✓ Page Caching
- [ ] Navigate to home page (`/`)
- [ ] Go to a location page (`/location/kathmandu`)
- [ ] Go to field documents page (`/field-documents`)
- [ ] Enable offline mode in DevTools
- [ ] All previously visited pages still load
- [ ] Check page displays correctly offline

### ✓ Image Caching
- [ ] With offline disabled, visit location pages with images
- [ ] Images load normally
- [ ] Enable offline mode
- [ ] Images display from cache
- [ ] No broken image icons

### ✓ Document Viewing
- [ ] Click on a PDF or DOCX document while online
- [ ] Document loads and displays
- [ ] Enable offline mode
- [ ] Document still accessible (from cache)
- [ ] Can scroll/interact with cached document

### ✓ Offline Fallback
- [ ] Enable offline mode before loading new page
- [ ] Navigate to a page not in cache
- [ ] Offline fallback page displays (with 📡 icon)
- [ ] "Available Offline" list shows
- [ ] "Return to Home" button works
- [ ] Pro tips section displays

### ✓ Network Status Changes
- [ ] Start in offline mode
- [ ] Disable offline mode
- [ ] Yellow indicator disappears
- [ ] Check browser console for "Service Worker registered" messages
- [ ] No errors appear

### ✓ Cache Clearing
- [ ] Go to DevTools > Application > Storage
- [ ] Under Service Workers, click the origin
- [ ] Check multiple caches exist (image-cache, document-cache, api-cache, etc.)
- [ ] Click delete cache for "sw.js"
- [ ] Service worker unregisters
- [ ] Hard refresh (Ctrl+Shift+R) re-registers

### ✓ PWA Installation (Chrome/Edge)
- [ ] Look for install icon in address bar
- [ ] Click install button
- [ ] Confirm "Install Field Expedition Platform"
- [ ] App installs to home screen/applications
- [ ] App opens in standalone window (no address bar)
- [ ] Service worker still works in installed app

### ✓ PWA Installation (Safari/iOS)
- [ ] Open site in Safari
- [ ] Tap Share button
- [ ] Select "Add to Home Screen"
- [ ] Name: "IHRR Expeditions"
- [ ] Tap Add
- [ ] App appears on home screen
- [ ] App opens in full screen
- [ ] Service worker caching works

### ✓ PWA Installation (Android)
- [ ] Open site in Chrome
- [ ] Tap menu (⋮)
- [ ] Select "Install app" or "Add to Home Screen"
- [ ] Confirm installation
- [ ] App installs to home screen
- [ ] App opens in standalone mode

### ✓ Manifest Verification
- [ ] DevTools > Application > Manifest
- [ ] Check "name": "Field Expedition Platform"
- [ ] Check "short_name": "IHRR Expeditions"
- [ ] Check "display": "standalone"
- [ ] Check icons array populated
- [ ] Check "start_url": "/"

### ✓ Caching Performance
- [ ] Monitor Network tab in DevTools
- [ ] First load: all assets from network
- [ ] Go offline and return to page
- [ ] Check Network tab shows cached assets (size shows from ServiceWorker)
- [ ] Page loads instantly

### ✓ Update Detection
- [ ] Make small change to website (e.g., title)
- [ ] Build: `npm run build`
- [ ] Reload page in browser
- [ ] Should see update notification or auto-reload
- [ ] Check browser console for update messages

## Mobile Device Testing

### iOS Device
- [ ] [ ] Install app via home screen
- [ ] [ ] Disable WiFi
- [ ] [ ] Disable cellular data
- [ ] [ ] Open app - should show offline indicator
- [ ] [ ] Navigate between cached pages
- [ ] [ ] Try to view images (should show from cache)
- [ ] [ ] Enable WiFi
- [ ] [ ] Offline indicator disappears
- [ ] [ ] Can load new pages

### Android Device
- [ ] [ ] Install app via Chrome
- [ ] [ ] Disable WiFi
- [ ] [ ] Disable mobile data
- [ ] [ ] Open app - should show offline indicator
- [ ] [ ] Navigate between cached pages
- [ ] [ ] Offline indicator disappears when connection restored
- [ ] [ ] App performance is good

## Performance Testing

### Load Times
- [ ] First visit to page: measure load time
- [ ] Offline page access: should be instant (<500ms)
- [ ] Network throttling (3G): should still be usable
- [ ] Check cache sizes reasonable (not exceeding 50MB)

### Storage
- [ ] Check total cache size in DevTools
- [ ] Should be under device limits:
  - [ ] iOS Safari: <50MB per app
  - [ ] Android Chrome: 50MB+ available
  - [ ] Desktop Chrome: 50MB+ available
- [ ] Verify expiration settings working:
  - [ ] Old cached items (30+ days) get removed
  - [ ] Latest content stays cached

### Battery/Network
- [ ] Use app in offline mode
- [ ] Check device battery usage reasonable
- [ ] Check no unusual network activity
- [ ] Verify app doesn't spam requests when offline

## Troubleshooting During Testing

### Service Worker Not Registering
- [ ] Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- [ ] Clear cache: DevTools > Application > Storage > Clear Site Data
- [ ] Check network tab for sw.js 404 errors
- [ ] Verify next.config.mjs has `dest: 'public'`
- [ ] Ensure build completed successfully

### Offline Indicator Not Showing
- [ ] Check file exists: `/components/OfflineIndicator.js`
- [ ] Verify import in `/app/layout.js`
- [ ] Check browser console for component errors
- [ ] Enable offline mode in DevTools and refresh

### Cache Not Persisting
- [ ] Check DevTools > Application > Service Workers
- [ ] Verify multiple caches are created
- [ ] Check cache strategy in next.config.mjs
- [ ] Ensure pages are visited before going offline

### Manifest Not Loading
- [ ] Check `/public/manifest.json` exists
- [ ] Verify in head: `<link rel="manifest" href="/manifest.json">`
- [ ] DevTools > Application > Manifest should show it
- [ ] Check manifest JSON is valid (no syntax errors)

## Sign-Off Checklist

- [ ] All service worker tests passing
- [ ] All offline indicator tests passing
- [ ] All page caching tests passing
- [ ] All image/document caching tests passing
- [ ] PWA installation working on all platforms
- [ ] Manifest properly configured
- [ ] Mobile device testing complete
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Documentation complete and accurate

## Production Deployment

Before deploying to production:

1. [ ] Run full test suite above
2. [ ] Build: `npm run build`
3. [ ] Test build output: `npm start`
4. [ ] Verify all tests pass
5. [ ] Deploy to hosting service
6. [ ] Test on deployed URL
7. [ ] Verify service worker loads from correct path
8. [ ] Test installation on deployed version
9. [ ] Monitor for errors in production
10. [ ] Announce offline feature to users

---

**Test Date:** _______________  
**Tested By:** _______________  
**Status:** ✅ Ready for Production / ⚠️ Issues Found (see notes)  
**Notes:**
```




```
