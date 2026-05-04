# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Dansguiden — a Swedish dance-event guide. Vue 3 + Ionic 6 SPA built with Vue CLI, packaged for iOS and Android via Capacitor 4, and deployed to Firebase Hosting as a web app. Firestore is the only backend (no custom server).

UI copy is Swedish (e.g. `Välj datum`, `Hitta din dans`). Keep new user-facing strings in Swedish; tests assert against Swedish text (`tests/unit/example.spec.ts`).

## Commands

```bash
npm run dev          # Vue CLI dev server
npm run build        # production build → dist/
npm run lint         # ESLint
npm run test:unit    # Jest, all specs under tests/unit/**
npm run test:e2e     # Cypress (interactive)

# Run a single Jest spec
npx vue-cli-service test:unit tests/unit/example.spec.ts
# or filter by test name:
npx vue-cli-service test:unit -t 'renders home view'
```

Mobile (Capacitor):

```bash
npm run ios:watch        # dev server on 0.0.0.0:3000 for live reload on device
npm run ios:open         # cap open ios   (after npm run build && cap sync)
npm run ios:open:live    # cap run ios -l --external
npm run ios:release      # build + sync + open Xcode

npm run android:watch
npm run android:open
npm run android:release
npm run android:build    # gradle bundleRelease
npm run android:upload   # gradle publishBundle
```

Path alias `@/*` → `src/*` is configured in `tsconfig.json` and used everywhere — prefer it over relative imports.

## Architecture

The app is intentionally tiny: two routes (`HomePage`, `ViewEventPage` in `src/router/index.ts`) and a handful of modal components. The interesting structure lives in `src/data/`, which is **not** a model layer — it's a set of Vue 3 Composition-API composables that each own one slice of state.

### Composables in `src/data/`

Each `useX()` returns reactive state plus a couple of mutators. `HomePage.vue` is the integrator: it calls every composable and wires their refs together. When adding a new filter or data source, follow the same pattern (composable in `src/data/`, modal in `src/components/`, wired from `HomePage`).

- `useEvents(datesRef, locationRef, venueRef, bandsRef)` — the core data feed. Builds a Firestore `query` reactively from the filter refs and subscribes via `onSnapshot`. The query has subtle precedence rules: when a venue filter is set it replaces the location filter; band filters are dropped if location or date filters are active (Firestore's `in` operator can't combine with multiple `where` ranges). Default range is today → +14 days. Returns `{ events, refresh }` where `refresh(fn)` reloads and calls `fn` after the next snapshot — used by ion-refresher.
- `useLocationSelect`, `useBandSelect`, `useVenueSelect` — each owns a `useStorage`-backed list of selections plus a Firestore-loaded "all" list (via `metadata_bands` / `metadata_places` collections, ordered by `counts.in_180_days`). They expose a `selectX(name)` toggle that adds/removes and clears to `undefined` when empty (the events query treats `undefined` as "no filter").
- `useRangeSelect` — date range state plus `selectQuickRange(weeks)`.
- `useStorage<T>(key, default)` — thin wrapper over `@capacitor/preferences` that returns a `Ref<T>` with auto-load on mount and auto-persist on watch. Use this for any persisted user preference; do not call `Preferences` directly.
- `useCalendarEvent(event, location)` — formats a `DanceEvent` into a `calendar-link` `CalendarEvent` and presents an action sheet that picks (and remembers, via `useStorage`) the calendar provider. Opens the URL through `@capacitor/browser`.

### Firestore

Initialized once in `src/data/events.ts` with the public web config. Collections used:

- `events` — `DanceEvent` documents (see type in `events.ts`); queried by `region`/`place`/`band`/`date`.
- `metadata_bands`, `metadata_places` — used by the band/venue selectors; document ID is the band/place name and `counts.in_180_days` filters out stale entries.

`DanceEvent.metadata` is optional and may carry `band.spotify.*` and `place.places_api.*` enrichment. UI components must handle its absence (see `EventListItem.vue` image fallback chain).

### Build & deploy

- `firebase.json` deploys `dist/` to the `dansguiden` Hosting site (project `dansguiden-b3a7d` from `.firebaserc`) with a SPA rewrite to `/index.html`. `predeploy` runs `npm run build`.
- `.github/workflows/deploy-firebase.yaml` deploys hosting on push to `master`.
- Capacitor `appId` is `feality.dans`, `webDir` is `dist`. Mobile releases require `npm run build && cap sync` before opening the native IDE.
- Android signing keystore is fetched from GCP Secret Manager — see `README.md` for the `gcloud secrets versions access` commands.

## Conventions

- Vue 3 Options API with `defineComponent({ setup() {...} })` — not `<script setup>`. Match this style in new components.
- ESLint extends `plugin:vue/vue3-essential`, `eslint:recommended`, `@vue/typescript/recommended`. `@typescript-eslint/no-explicit-any` is **off** intentionally (Firestore casts use `as DanceEvent`); don't reintroduce it.
- The repo has no Prettier; respect existing 2-space indent and trailing-comma style.
- `tsconfig` has `strict: true` — keep new code strictly typed.
- Tests live under `tests/unit/` (Jest) and `tests/e2e/` (Cypress). The Jest preset is `@vue/cli-plugin-unit-jest/presets/typescript-and-babel` with an explicit `transformIgnorePatterns` for the Ionic/Stencil ESM packages — if you add a new ESM dep that Jest can't parse, extend that pattern in `jest.config.js`.
