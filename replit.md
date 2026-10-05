# WHERE

WHERE is an iPhone-first Expo app for remembering where physical objects were put. It saves object names, locations, notes, dates, and optional photos locally on the device.

## Run & Operate

- Run the managed `artifacts/where: expo` workflow to preview the mobile app or scan its QR code with Expo Go.
- `pnpm --filter @workspace/where run typecheck` — check the mobile app's TypeScript.
- `pnpm run typecheck` — full typecheck across all packages
- The mobile app does not require the API server or a database.

## Stack

- React Native, Expo, Expo Router, and TypeScript
- AsyncStorage for on-device saved items
- Expo Image Picker for camera capture
- pnpm workspaces, Node.js 24

## Where things live

- `artifacts/where/app/` — home, capture/edit, search, and item detail screens
- `artifacts/where/contexts/ItemsContext.tsx` — local saved-item storage and CRUD
- `artifacts/where/lib/item-utils.ts` — sentence parsing, search, and date formatting
- `artifacts/where/constants/colors.ts` — app palette

## Architecture decisions

- Keep the first version local-first: no login, cloud sync, subscriptions, or backend dependency.
- Use the phone keyboard's built-in dictation for spoken TELL and FIND input; avoid an added speech service or microphone permission.

## Product

TELL saves an item and its location from a sentence. SNAP captures a photo and prompts for the item and place. FIND searches saved items and returns the most recently saved location. Users can review, edit, and delete records.

## User preferences

- Keep the design simple and modern, optimize for iPhone first, and preserve Android compatibility.

## Gotchas

- Photos are stored as local device URIs alongside AsyncStorage records.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
