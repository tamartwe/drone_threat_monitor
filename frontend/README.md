# Drone Threat Monitor — Frontend

React dashboard for triaging detected drone events. Communicates exclusively with the backend API — all filtering is server-side.

## Features

- Live table of drone events, color-coded by threat level (red / amber / green)
- Server-side filtering via `?status=` and `?threatLevel=` query params
- Mitigate / Dismiss action buttons per row — `PATCH /api/drones/:id`
- Loading spinner, error state with retry, and empty-results state
- Vite dev proxy → no CORS configuration needed during development

## Getting started

Start the backend first (port 3001), then:

```bashx
npm install
npm run dev    # Vite dev server on http://localhost:5173
```

The Vite proxy forwards all `/api/*` requests to `http://localhost:3001`, so the frontend never needs CORS headers in development.

## Scripts

| Command          | Description                          |
|------------------|--------------------------------------|
| `npm run dev`    | Start Vite dev server (hot reload)   |
| `npm run build`  | Type-check + production bundle       |
| `npm run preview`| Preview production build locally     |
| `npm run lint`   | Lint TypeScript/TSX files            |

## Project structure

```
src/
  types/index.ts          Shared types (DroneEvent, DroneFilters, etc.)
  api/drones.ts           fetch() wrapper — listDrones(), updateDroneStatus()
  components/
    FilterBar.tsx         Status + threat-level dropdowns; emits filter state up
    ThreatBadge.tsx       Color-coded pill badge for threat level
    StatusBadge.tsx       Color-coded pill badge for drone status
    DroneTable.tsx        Main table — useQuery for list, useMutation for PATCH
  App.tsx                 Owns filter state, renders FilterBar + DroneTable
  main.tsx                QueryClientProvider setup, ReactDOM mount
  index.css               All styles (no CSS framework)
  vite-env.d.ts           Vite ambient type declarations
```

## Data flow

```
FilterBar (onChange) → App state (filters) → DroneTable (queryKey: ['drones', filters])
                                                       ↓
                                           GET /api/drones?status=…&threatLevel=…
                                                       ↓
                                           Mitigate / Dismiss button
                                                       ↓
                                           PATCH /api/drones/:id
                                                       ↓
                                           invalidateQueries(['drones']) → refetch
```

## Refetch vs optimistic update

The PATCH action uses a **refetch** strategy: after a successful mutation, `invalidateQueries` fires and the table re-fetches from the server. This is intentionally simple — the server is the source of truth and the brief re-load flash is acceptable for an operator dashboard.

The alternative (optimistic update) would update the cached row immediately in `onMutate` and roll back in `onError`. It gives faster perceived UX but requires explicit rollback logic and can cause a visual flicker if the server rejects the transition (e.g. already-mitigated drone).

## Stack

| Concern        | Choice                      |
|----------------|-----------------------------|
| Framework      | React 19 + TypeScript       |
| Build tool     | Vite                        |
| Data fetching  | TanStack Query v5           |
| Styling        | Plain CSS (no framework)    |
