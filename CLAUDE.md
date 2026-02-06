# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FoodLICA (Foodlica) is a location-based restaurant random recommendation app built with SvelteKit. It helps users discover nearby restaurants by randomly selecting 6 options based on their filters (rating, distance, category) and provides route guidance via Google Maps.

## Commands

```bash
# Development
npm run dev              # Start dev server at localhost:5173

# Build & Preview
npm run build            # Production build (adapter-static for Capacitor, adapter-vercel for Vercel)
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run Prettier check + ESLint
npm run format           # Format code with Prettier
npm run check            # TypeScript type checking with svelte-check
npm run check:watch      # Watch mode type checking

# Mobile (Capacitor)
npx cap sync             # Sync build to native projects
npx cap run ios          # Run on iOS simulator
npx cap run android      # Run on Android emulator
npx cap open ios         # Open in Xcode
npx cap open android     # Open in Android Studio
```

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5 (uses Runes for state)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with Vite plugin
- **Mobile**: Capacitor 8 for iOS/Android
- **APIs**: Google Maps (Places Legacy, Directions, JavaScript API)
- **Deployment**: Vercel (auto-detects via adapter-vercel)

## Architecture

### Directory Structure
```
src/
├── lib/
│   ├── components/     # Svelte components (RestaurantCard, MapView, FilterPanel, etc.)
│   ├── services/       # Google Maps API wrappers (googleMaps.ts, places.ts, directions.ts)
│   ├── stores/         # Svelte 5 rune-based stores (.svelte.ts files)
│   └── types/          # TypeScript interfaces
├── routes/
│   ├── api/routes/     # Server endpoint for Directions API proxy
│   ├── main/           # Main page with map and filters
│   ├── recommend/      # Random recommendation results
│   └── route/          # Route guidance to selected restaurant
└── app.html
```

### Key Patterns

- **State Management**: Svelte 5 Runes in `.svelte.ts` files under `src/lib/stores/`
- **API Proxy**: `/api/routes` proxies Google Directions API to avoid CORS
- **Google Maps**: Uses Legacy Places API (deprecated but stable), standard `google.maps.Marker`
- **Adapter Selection**: Auto-switches between `adapter-static` (local/Capacitor) and `adapter-vercel` (Vercel deployment)

## Environment Setup

Copy `.env.example` to `.env` and configure:
- `PUBLIC_GOOGLE_MAPS_API_KEY` - Required for all map features

## Code Style

- Tabs for indentation, single quotes, no trailing commas
- Print width: 100 characters
- Pastel color palette: peach (#FFB4AB), mint (#B2E0D4), lavender (#E6D9F2)
- Mobile-first responsive design

## Mobile Development Notes

- Frontend uses `adapter-static` for Capacitor builds
- For real device testing, set `PUBLIC_API_URL` to your machine's local IP
- Clear `cleartext: true` in capacitor.config.ts before production
