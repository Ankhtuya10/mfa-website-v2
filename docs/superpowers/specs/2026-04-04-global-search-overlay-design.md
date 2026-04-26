# Global Search Overlay (Navbar Trigger)

## Overview

Replace route-based Search (`/explore`) with a global, client-side search overlay opened from `StickyNavbar`. The overlay appears on top of the user's current page (no pathname change), keeps the existing search ranking logic, and uses a liquid-glass visual style consistent with the current navbar.

## Goals

- Open Search from navbar without navigating to a new page.
- Preserve existing search intelligence (synonyms, typo tolerance, scoring, grouped results, history).
- Keep current page visible under a blurred translucent backdrop.
- Provide fast, keyboard-first access (`/`, `Cmd+K`, `Ctrl+K`).
- Maintain mobile usability (full-screen overlay on mobile, centered modal on desktop).

## Non-Goals

- No server-side search backend changes.
- No SEO/shareable search URL for this phase.
- No in-overlay detail preview; selecting a result navigates directly to that item page.

## User Experience

### Open / Close Behavior

- Open search by:
  - Clicking `Search` in `StickyNavbar`
  - Pressing `/` when not focused in a text-editable field
  - Pressing `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux)
- Close search by:
  - `Esc`
  - Backdrop click
  - Selecting a result (navigate, then close)

### Layout

- Desktop/tablet: centered liquid-glass modal panel over blurred page.
- Mobile: full-screen sheet/panel to maximize typing and result visibility.
- Input autofocuses on open.

### Content in Overlay

- Top: search input.
- Below input: recent search history (up to 5).
- Live results: grouped by `articles`, `collections`, `designers`, `brands`.
- Empty result state: suggestion chips and fallback curated items.

## Visual Direction (Liquid Glass)

- Reuse navbar language: translucent gradient fill, subtle border, blur, and layered highlights.
- Backdrop treatment:
  - `backdrop-blur-*`
  - translucent veil to preserve context of underlying page
- Modal treatment:
  - rounded corners, thin semi-opaque border
  - soft depth shadow
  - restrained animation for open/close and result hover
- Keep current project typography and color palette for consistency.

## Technical Design

### Component Boundaries

1. `app/components/search/SearchOverlay.tsx`
   - Modal shell, backdrop, keyboard close handling, focus trap, and scroll lock.
   - Renders input, history, grouped results, empty states.
2. `app/components/search/useGlobalSearch.ts`
   - Query state, debounced/deferred query, result grouping, history persistence.
3. `app/components/search/searchEngine.ts` (or equivalent utility module)
   - Extracted pure functions from existing explore page:
     - normalization/tokenization
     - synonym expansion
     - Levenshtein-based tolerance
     - index building and scoring
4. `app/components/StickyNavbar.tsx`
   - Owns overlay open/close state.
   - Converts Search nav item from route link to modal trigger.

### Data and Search Logic

- Continue using current local datasets (`articles`, `collections`, `designers` from `lib/mockData`).
- Build in-memory search index once per session via memoization.
- Preserve scoring weights and grouping behavior from `app/explore/page.tsx`.
- Preserve recent history key: `anoce_explore_recent_searches`.

### Navigation Behavior

- Overlay open does not alter pathname or query params.
- Result item click uses existing app navigation to target page (`Link` target).
- Overlay closes immediately upon selection.

## Accessibility

- Modal container uses dialog semantics: `role="dialog"`, `aria-modal="true"`.
- Focus is trapped within overlay while open.
- Focus returns to trigger when overlay closes.
- Keyboard shortcuts do not fire when active element is input/textarea/contenteditable.
- Body scroll lock enabled while overlay is open.

## Performance Considerations

- Keep entirely client-side for minimal latency and no route transition cost.
- Retain `debounce` + `useDeferredValue` to smooth scoring while typing.
- Keep reusable result card rendering lightweight and virtualized behavior unnecessary at current data size.

## Migration Plan

1. Extract search engine logic from `app/explore/page.tsx` into reusable module(s).
2. Build overlay UI component and search hook using extracted logic.
3. Wire overlay into `StickyNavbar` and replace Search route link with button trigger.
4. Add keyboard shortcuts and accessibility behavior.
5. Verify behavior across pages that render `StickyNavbar`.
6. Keep `/explore` route temporarily for compatibility; cleanup can happen in a later change.

## Edge Cases

- If no history exists, show helper copy.
- If query length is under threshold, show discovery content/history instead of empty list.
- If search index is empty, show graceful fallback messaging.
- If user presses `/` in a form field, do not steal focus.

## Acceptance Criteria

1. Clicking navbar Search opens a modal overlay on the current page without route change.
2. `/` and `Cmd/Ctrl+K` open overlay (with text-field safeguards).
3. Overlay shows recent history and live grouped results using existing ranking logic.
4. Clicking a result navigates to its page and closes overlay.
5. Mobile uses full-screen search panel; desktop uses centered modal.
6. Overlay uses liquid-glass style consistent with navbar.
7. Accessibility behaviors (escape close, focus management, scroll lock, dialog semantics) are in place.
