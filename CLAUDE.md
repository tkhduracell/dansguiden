# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Dansguiden — a Swedish dance-event guide. Vue 3 + Ionic 6 SPA built with Vue CLI, packaged for iOS and Android via Capacitor 8, and deployed to Firebase Hosting as a web app. Firestore is the only backend (no custom server).

UI copy is Swedish (e.g. `Välj datum`, `Hitta din dans`). Keep new user-facing strings in Swedish; tests assert against Swedish text (`tests/unit/example.spec.ts`).

## Commands

Requires Node >= 22 (`engines` in package.json; Capacitor 8's CLI requires it).

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
npm run ios:release      # build + cap sync ios + open Xcode

npm run android:watch
npm run android:open
npm run android:open:live
npm run android:release  # build + sync only (does not open Android Studio)
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

## Native version pins worth knowing

- **Capacitor 8.5.x** (bumped from 6.2.x via `npx cap migrate`, one major hop at a time: 6→7→8, since `cap migrate` only migrates to the next major from whatever `@capacitor/cli` version is installed). Requires **JDK 21** — this repo's local JDK may still be 17; a real Android Gradle build must be verified with JDK 21 (CI or a local toolchain switch) before release.
- **Android:** Gradle 8.13, AGP 8.13.0, targetSdk/compileSdk 36, minSdk 26, play-publisher 3.12.1. targetSdk 36 was required by Google Play's Aug 31 2026 target-API deadline.
- **iOS:** deployment target 15.0 (Capacitor 8's default), CocoaPods. Capacitor 8.5 adopted the UIScene lifecycle — `ios/App/App/SceneDelegate.swift` and `UIApplicationSceneManifest` (Info.plist) were added by the migration; `AppDelegate.swift` keeps its old methods for compatibility. Running `pod install` locally needs `LANG=en_US.UTF-8` set (CocoaPods/Ruby errors otherwise on some machines).
- `capacitor.config.ts` pins `server.androidScheme: 'http'`. Cap 6's default flipped to `https`, but flipping it would orphan all existing user data stored under `@capacitor/preferences` (still keyed to `http://localhost`). **Do not remove this pin** without a data migration plan.
- `android/app/src/main/res/values/styles.xml` no longer opts out of edge-to-edge (`windowOptOutEdgeToEdgeEnforcement` was removed along with the targetSdk 36 bump — Android 16 deleted that attribute). Capacitor's `BridgeActivity` dispatches `WindowInsets` to the WebView and Ionic's `--ion-safe-area-*` CSS vars consume them automatically; no manual inset code was added. **Verify on a real notched/gesture-nav device** — this hasn't been visually confirmed.
- `ios/App/App/PrivacyInfo.xcprivacy` declares `NSUserDefaults` reason `CA92.1` for `@capacitor/preferences`. If you add another required-reason API (file timestamps, system boot time, disk space, active keyboards), add the reason here or App Store will reject the upload.

## Conventions

- Vue 3 Options API with `defineComponent({ setup() {...} })` — not `<script setup>`. Match this style in new components.
- ESLint extends `plugin:vue/vue3-essential`, `eslint:recommended`, `@vue/typescript/recommended`. `@typescript-eslint/no-explicit-any` is **off** intentionally (Firestore casts use `as DanceEvent`); don't reintroduce it.
- The repo has no Prettier; respect existing 2-space indent and trailing-comma style.
- `tsconfig` has `strict: true` — keep new code strictly typed.
- Tests live under `tests/unit/` (Jest) and `tests/e2e/` (Cypress). The Jest preset is `@vue/cli-plugin-unit-jest/presets/typescript-and-babel` with an explicit `transformIgnorePatterns` for the Ionic/Stencil ESM packages — if you add a new ESM dep that Jest can't parse, extend that pattern in `jest.config.js`.
