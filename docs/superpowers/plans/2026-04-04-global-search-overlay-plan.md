# Global Search Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/explore`-driven search navigation with a global, liquid-glass search overlay opened from the navbar on any page.

**Architecture:** Extract search logic from `app/explore/page.tsx` into reusable pure utilities and a dedicated hook, then mount a reusable `SearchOverlay` from `StickyNavbar` so search opens in-place (no pathname change). Add keyboard shortcuts, focus/accessibility behavior, and recent-history persistence while preserving current ranking behavior.

**Tech Stack:** Next.js App Router, React 19 hooks, TypeScript, Framer Motion, Tailwind CSS, Vitest + React Testing Library

---

## File Structure

- Create: `app/components/search/searchEngine.ts` - Pure search/index/ranking logic moved from explore page.
- Create: `app/components/search/useGlobalSearch.ts` - Stateful search hook (query/debounce/results/history).
- Create: `app/components/search/SearchOverlay.tsx` - Global overlay UI + keyboard/focus/scroll-lock behavior.
- Create: `app/components/search/types.ts` - Shared `SearchCategory`, `SeasonFilter`, and result item types.
- Create: `app/components/search/index.ts` - Local exports for search module.
- Modify: `app/components/StickyNavbar.tsx` - Open/close overlay, replace search nav link with trigger, add shortcuts.
- Modify: `app/components/index.ts` - Export search overlay if needed by existing import patterns.
- Optional modify: `app/explore/page.tsx` - Reuse extracted search utilities to avoid logic drift.
- Create: `app/components/search/__tests__/searchEngine.test.ts` - Ranking/synonym/fuzzy behavior tests.
- Create: `app/components/search/__tests__/useGlobalSearch.test.tsx` - Hook behavior tests.
- Create: `app/components/search/__tests__/SearchOverlay.test.tsx` - Overlay interaction and accessibility tests.
- Create: `vitest.config.ts` - Test runner config for Next/TS aliases.
- Create: `vitest.setup.ts` - RTL/JSDOM setup.
- Modify: `package.json` - Add test scripts and dev dependencies.

---

## Tasks

### Task 1: Add test infrastructure first (TDD baseline)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Write a failing smoke test to confirm test runner is not wired yet**

Create `app/components/search/__tests__/smoke.test.ts` with:

```ts
import { describe, expect, it } from 'vitest'

describe('test harness', () => {
  it('runs tests', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Run test command and verify it fails because tooling is missing**

Run: `npm run test -- app/components/search/__tests__/smoke.test.ts`
Expected: FAIL with missing script and/or missing `vitest`.

- [ ] **Step 3: Add minimal test tooling configuration**

Update `package.json` scripts and dev deps:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^3.2.4",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^26.1.0"
  }
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['app/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Run smoke test to verify harness passes**

Run: `npm run test -- app/components/search/__tests__/smoke.test.ts`
Expected: PASS with 1 passed test.

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts vitest.setup.ts app/components/search/__tests__/smoke.test.ts
git commit -m "test: add vitest harness for global search overlay work"
```

---

### Task 2: Extract and lock search engine behavior with tests

**Files:**
- Create: `app/components/search/types.ts`
- Create: `app/components/search/searchEngine.ts`
- Create: `app/components/search/__tests__/searchEngine.test.ts`
- Optional Modify: `app/explore/page.tsx`

- [ ] **Step 1: Write failing tests for ranking and term expansion**

Create `app/components/search/__tests__/searchEngine.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildSearchIndex, groupRankedResults, scoreResult } from '@/app/components/search/searchEngine'

describe('searchEngine', () => {
  it('maps winter-like terms to FW/season matches', () => {
    const index = buildSearchIndex()
    const ranked = index
      .map((item) => ({ item, score: scoreResult(item, 'winter') }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)

    expect(ranked.length).toBeGreaterThan(0)
    expect(ranked.some((item) => item.category === 'collections')).toBe(true)
  })

  it('returns grouped buckets for all categories', () => {
    const index = buildSearchIndex()
    const grouped = groupRankedResults(index)

    expect(grouped.articles).toBeDefined()
    expect(grouped.collections).toBeDefined()
    expect(grouped.designers).toBeDefined()
    expect(grouped.brands).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test and verify fail (module not found)**

Run: `npm run test -- app/components/search/__tests__/searchEngine.test.ts`
Expected: FAIL with cannot resolve `searchEngine`.

- [ ] **Step 3: Implement extracted search engine module**

Create `app/components/search/types.ts`:

```ts
export type SearchCategory = 'articles' | 'collections' | 'designers' | 'brands'
export type SeasonFilter = 'all' | 'current' | 'archive'

export type SearchResultItem = {
  id: string
  slug: string
  title: string
  subtitle: string
  image: string
  href: string
  category: SearchCategory
  meta: string
  searchText: string
  tags: string[]
  seasonLabel?: string
}
```

Create `app/components/search/searchEngine.ts` by moving and exporting logic currently in `app/explore/page.tsx`:

```ts
// export constants/functions from current explore page logic:
// TRENDING_TAGS, RECENT_HISTORY_KEY, normalizeText, levenshtein, tokenize,
// expandQueryTerms, buildSearchIndex, scoreResult, applySeasonFilter,
// rankResults, groupRankedResults
```

Implementation rule: preserve current scoring weights and synonym map exactly.

- [ ] **Step 4: (Optional but recommended) make explore page consume the shared module**

In `app/explore/page.tsx`, replace duplicated local search functions with imports from `@/app/components/search/searchEngine`.

- [ ] **Step 5: Run tests and verify pass**

Run: `npm run test -- app/components/search/__tests__/searchEngine.test.ts`
Expected: PASS with both tests green.

- [ ] **Step 6: Commit**

```bash
git add app/components/search/types.ts app/components/search/searchEngine.ts app/components/search/__tests__/searchEngine.test.ts app/explore/page.tsx
git commit -m "refactor: extract reusable search engine with tests"
```

---

### Task 3: Build and test `useGlobalSearch` hook

**Files:**
- Create: `app/components/search/useGlobalSearch.ts`
- Create: `app/components/search/__tests__/useGlobalSearch.test.tsx`

- [ ] **Step 1: Write failing hook tests for history and live results**

Create `app/components/search/__tests__/useGlobalSearch.test.tsx`:

```tsx
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useGlobalSearch } from '@/app/components/search/useGlobalSearch'

describe('useGlobalSearch', () => {
  it('stores and returns recent searches after debounce', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery('cashmere')
      vi.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(result.current.recentSearches[0]).toBe('cashmere')
    })

    vi.useRealTimers()
  })

  it('produces live results for 2+ chars', async () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery('fw')
    })

    await waitFor(() => {
      expect(result.current.showLiveResults).toBe(true)
      expect(result.current.totalResults).toBeGreaterThan(0)
    })
  })
})
```

- [ ] **Step 2: Run test and verify fail (hook missing)**

Run: `npm run test -- app/components/search/__tests__/useGlobalSearch.test.tsx`
Expected: FAIL with missing `useGlobalSearch` export.

- [ ] **Step 3: Implement hook using extracted search engine**

Create `app/components/search/useGlobalSearch.ts` with:

```ts
// useState for query, activeCategory, seasonFilter, recentSearches
// useEffect debounce (300ms) + localStorage read/write with RECENT_HISTORY_KEY
// useDeferredValue for smoother ranking
// useMemo for rankedResults, groupedResults, previewGroups, spotlightItems
// exported API includes: query/setQuery, activeCategory/setActiveCategory,
// seasonFilter/setSeasonFilter, recentSearches, ranked/grouped/preview,
// showLiveResults, noResults, totalResults, suggestedFallback
```

- [ ] **Step 4: Run hook tests and verify pass**

Run: `npm run test -- app/components/search/__tests__/useGlobalSearch.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/search/useGlobalSearch.ts app/components/search/__tests__/useGlobalSearch.test.tsx
git commit -m "feat: add reusable global search hook"
```

---

### Task 4: Build SearchOverlay UI with liquid-glass styling

**Files:**
- Create: `app/components/search/SearchOverlay.tsx`
- Create: `app/components/search/index.ts`
- Create: `app/components/search/__tests__/SearchOverlay.test.tsx`
- Modify: `app/components/index.ts`

- [ ] **Step 1: Write failing overlay tests for open/close + result navigation intent**

Create `app/components/search/__tests__/SearchOverlay.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchOverlay } from '@/app/components/search/SearchOverlay'

describe('SearchOverlay', () => {
  it('renders dialog semantics when open', () => {
    render(<SearchOverlay isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<SearchOverlay isOpen onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test and verify fail (component missing)**

Run: `npm run test -- app/components/search/__tests__/SearchOverlay.test.tsx`
Expected: FAIL with missing `SearchOverlay`.

- [ ] **Step 3: Implement SearchOverlay component**

Create `app/components/search/SearchOverlay.tsx` with:

```tsx
type SearchOverlayProps = {
  isOpen: boolean
  onClose: () => void
}

// Key behavior:
// - fixed inset backdrop with blur + translucent veil
// - desktop centered liquid-glass panel, mobile full-screen panel
// - role="dialog" aria-modal="true"
// - focus search input on open
// - lock body scroll while open
// - render history + grouped results from useGlobalSearch()
// - result click calls onClose and uses <Link href={item.href}>
```

Use class style language aligned with `StickyNavbar` (glass gradients/borders/shadow/backdrop blur).

- [ ] **Step 4: Export module and wire index exports**

Create `app/components/search/index.ts`:

```ts
export { SearchOverlay } from './SearchOverlay'
export { useGlobalSearch } from './useGlobalSearch'
export * from './searchEngine'
export * from './types'
```

Update `app/components/index.ts`:

```ts
export { SearchOverlay } from './search'
```

- [ ] **Step 5: Run overlay tests and verify pass**

Run: `npm run test -- app/components/search/__tests__/SearchOverlay.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/components/search/SearchOverlay.tsx app/components/search/index.ts app/components/search/__tests__/SearchOverlay.test.tsx app/components/index.ts
git commit -m "feat: add liquid-glass global search overlay component"
```

---

### Task 5: Integrate overlay into StickyNavbar and add global shortcuts

**Files:**
- Modify: `app/components/StickyNavbar.tsx`

- [ ] **Step 1: Write failing integration tests for shortcut and trigger behavior**

Create `app/components/__tests__/StickyNavbar.search.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { StickyNavbar } from '@/app/components/StickyNavbar'

describe('StickyNavbar search integration', () => {
  it('opens overlay when Search button is clicked', async () => {
    const user = userEvent.setup()
    render(<StickyNavbar />)

    await user.click(screen.getByRole('button', { name: /search/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test and verify fail**

Run: `npm run test -- app/components/__tests__/StickyNavbar.search.test.tsx`
Expected: FAIL because current search is a `Link` and overlay not mounted.

- [ ] **Step 3: Implement navbar integration**

In `app/components/StickyNavbar.tsx`:

```tsx
// add state: const [isSearchOpen, setIsSearchOpen] = useState(false)
// replace Search nav item with button trigger
// add keydown listener for '/', meta+k, ctrl+k
// guard shortcut when event target is input/textarea/contenteditable
// render <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
```

Keep existing nav behavior for Home/Collections/Editorial unchanged.

- [ ] **Step 4: Run integration test and targeted suite**

Run: `npm run test -- app/components/__tests__/StickyNavbar.search.test.tsx app/components/search/__tests__/SearchOverlay.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/StickyNavbar.tsx app/components/__tests__/StickyNavbar.search.test.tsx
git commit -m "feat: open global search overlay from navbar and keyboard shortcuts"
```

---

### Task 6: Final verification and parity checks across pages

**Files:**
- Modify (if needed): `app/explore/page.tsx`
- Modify (if needed): `docs/superpowers/specs/2026-04-04-global-search-overlay-design.md`

- [ ] **Step 1: Run full automated checks**

Run: `npm run test`
Expected: PASS all tests.

- [ ] **Step 2: Run lint/build for integration confidence**

Run: `npm run lint`
Expected: PASS with zero lint errors.

Run: `npm run build`
Expected: successful Next.js production build.

- [ ] **Step 3: Manual QA checklist**

Run app: `npm run dev`

Validate:

```text
1) Open any page, click navbar Search -> modal opens without URL/path change.
2) Press / from non-input context -> modal opens.
3) Press Cmd/Ctrl+K -> modal opens.
4) Press Esc/backdrop click -> modal closes and focus returns.
5) Mobile viewport shows full-screen search.
6) Result click navigates to target page and closes modal.
7) Recent history persists and reappears after reload.
```

- [ ] **Step 4: Commit final polish/docs update**

```bash
git add app/explore/page.tsx docs/superpowers/specs/2026-04-04-global-search-overlay-design.md
git commit -m "chore: finalize global search overlay integration and parity checks"
```

---

## Plan Self-Review

- Spec coverage check: all acceptance criteria map to tasks (overlay open/no route change, shortcuts, grouped results/history, result navigation, mobile/desktop behavior, liquid-glass styling, accessibility).
- Placeholder scan: removed ambiguous TODO language; every code-change step includes concrete file paths and implementation intent.
- Type consistency: shared types centralized in `app/components/search/types.ts` and referenced by engine/hook/component tasks.
