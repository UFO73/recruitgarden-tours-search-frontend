# Tours Search Frontend

## Setup

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm test`
- `npm run typecheck`
- `npm run format`
- `npm run format:check`

## Stack

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- SCSS Modules
- ESLint
- Prettier
- Vitest
- React Testing Library

## Architecture

The project is split by responsibility:

- `app` contains app providers, routing, and layout.
- `pages` contains route-level screens.
- `features` contains user flows, for example tour search.
- `entities` contains domain models, mappers, and entity queries.
- `shared` contains reusable UI, API wrappers, styles, and small utilities.
- `services` contains business logic that should not live inside React components.

React components render UI and keep view state. Services handle search flow, polling,
retry, cancellation, caching, and data aggregation.

## Cache Policy

Search results are cached inside `SearchToursService`.

- Prices cache key: `countryId`.
- Prices TTL: 5 minutes, because tour prices can change often.
- Hotels cache key: `countryId`.
- Hotels TTL: 30 minutes, because hotel data changes less often.
- Max size: 20 country entries for each cache.
- Expired records are removed on read.
- When max size is reached, the oldest record is removed first.
- Cache can be invalidated by country with `invalidateCountry(countryId)`.
- All cached data can be cleared with `clearCache()`.
- Cache is in-memory only, so it resets after page reload or after the service instance is destroyed.

## Mock API Note

`api.js` is kept unchanged as required by the task.

There is one important mock API limitation: `getPrice(priceId)` generates a new price
with the requested id. It does not return the exact same offer that was shown in the
search results. Because of this, the tour details page can show a different amount or
dates than the search card.

If exact price consistency is required, this should be fixed in a separate API-fix
commit by storing generated search prices in the mock API and returning them from
`getPrice(priceId)`.

## Accessibility

The `Combobox` has a basic accessibility check covered by unit tests.

Checked behavior:

- input uses `role="combobox"`;
- dropdown uses `role="listbox"`;
- items use `role="option"`;
- `aria-expanded` changes when the dropdown opens or closes;
- `aria-controls` links the input with the listbox;
- `aria-activedescendant` follows keyboard highlight;
- keyboard supports `ArrowDown`, `ArrowUp`, `Enter`, and `Escape`
