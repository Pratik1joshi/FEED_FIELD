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

## Notes

- Uploads and notes are persisted in browser `localStorage`.
- Authentication is represented by a navbar login toggle to simulate researcher access.
- Sample PDF files are included in `public/docs/` for immediate document viewer testing.
