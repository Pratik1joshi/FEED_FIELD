# Field Expedition Platform

Next.js (JavaScript) application for map-driven field research across Nepal, combining:

- Interactive route exploration on Leaflet + OpenStreetMap (free)
- Location-specific document viewing (PDF + DOCX)
- Tabbed learning workflow (Prospectus, Route Briefing, Documents, Notes)
- Notes anchored to document page numbers
- Auth-gated upload simulation for tagged location documents

## Core Features

- Homepage route map with custom location markers:
	Kathmandu -> Chitwan -> Pokhara -> Marpha -> Jomsom -> Kagbeni -> Ghami -> Tsarang -> Lo Manthang
- Clickable route segments with floating insight panel:
	route title, elevation transition, climate transition, and key observations
- Location cards below map with image, elevation, temperature range, and summary
- Dynamic location pages at `/location/[slug]`:
	left sidebar tabs + central document viewer + notes panel
- Document viewer:
	- PDF rendered with `react-pdf` in vertical page stack
	- DOCX converted to HTML with `mammoth`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Authentication & File Storage (Supabase)

This app uses **Supabase** for real authentication and cloud file storage:

- **Admin Login**: Click the footer "Admin Login" button to sign in with your Supabase account
- **File Uploads**: PDFs and DOCX files are uploaded to Supabase Storage, not stored in browser memory
- **Persistent Storage**: All uploaded files are backed up on Supabase, not lost on browser refresh
- **User Sessions**: Authentication state persists across page reloads via Supabase

### Setup Supabase

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions on:
1. Creating a Supabase project
2. Getting your API keys
3. Creating test users
4. Setting up file storage

## Notes

- Field notes are persisted in browser `localStorage` (can be moved to Supabase with Row Level Security)
- Uploaded itinerary PDFs replace the previous itinerary for that location, so the frontend shows only the latest version
- Sample PDF files are included in `public/docs/` for immediate document viewer testing
- Service Worker registration is disabled in development to prevent InvalidStateError

## 🚀 Offline Support

This app is fully configured as a Progressive Web App (PWA) and works completely offline!

### Key Offline Features

- ✅ **Works Completely Offline** - Access cached content without internet
- ✅ **Home Screen Installation** - Install as app on iOS, Android, Windows, or Mac
- ✅ **Automatic Caching** - Documents, images, and pages cached as you browse
- ✅ **Smart Sync** - Automatically fetches updates when back online
- ✅ **Offline Indicator** - Yellow banner shows connection status
- ✅ **30-Day Cache** - Documents and images remain available for 30 days

### Quick Start - Testing Offline

```bash
# Build for production
npm run build

# Start production server
npm start

# In browser DevTools (F12):
# 1. Go to Application tab
# 2. Click Service Workers (left sidebar)
# 3. Check "Offline" checkbox
# 4. Navigate pages - they load from cache!
```

### Installation

**iPhone/iPad:**
1. Open in Safari
2. Tap Share → Add to Home Screen
3. Tap Add

**Android:**
1. Open in Chrome
2. Tap Menu (⋮) → Install app
3. Confirm

**Desktop (Chrome/Edge):**
1. Click install icon in address bar
2. Confirm installation

### Documentation

For complete offline setup and testing guide, see:
- [OFFLINE_IMPLEMENTATION_SUMMARY.md](./OFFLINE_IMPLEMENTATION_SUMMARY.md) - Overview
- [OFFLINE_SUPPORT.md](./OFFLINE_SUPPORT.md) - Complete guide (2000+ words)
- [OFFLINE_QUICK_START.md](./OFFLINE_QUICK_START.md) - Quick reference
- [OFFLINE_TESTING_CHECKLIST.md](./OFFLINE_TESTING_CHECKLIST.md) - Testing procedures
