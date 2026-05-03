# Testing with Vitest

## Why Testing?

Tests catch bugs before users do. In WoPeD Next, tests verify that stores, utilities, and components behave correctly — even as the codebase grows and multiple contributors make changes. A solid test suite gives you confidence that your changes don't break existing functionality.

## Key Concepts

### 1. Test Structure

Every test file follows the same pattern: **describe** groups related tests, **it** defines a single test case, and **expect** makes assertions about the result.

```typescript
import { describe, it, expect } from 'vitest'

describe('Math utils', () => {
  it('should add two numbers', () => {
    expect(1 + 2).toBe(3)
  })

  it('should multiply two numbers', () => {
    expect(3 * 4).toBe(12)
  })
})
```

- `describe(name, fn)` — groups tests under a label (can be nested)
- `it(name, fn)` — defines a single test case (alias: `test`)
- `expect(value)` — wraps a value so you can call matchers on it

### 2. Setup and Teardown

When multiple tests share preparation steps, use lifecycle hooks to avoid repetition:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('with setup', () => {
  let items: string[]

  beforeEach(() => {
    items = ['apple', 'banana']
  })

  afterEach(() => {
    items = []
  })

  it('should have two items', () => {
    expect(items).toHaveLength(2)
  })

  it('should contain apple', () => {
    expect(items).toContain('apple')
  })
})
```

| Hook | Runs |
|------|------|
| `beforeEach` | Before **each** test in the block |
| `afterEach` | After **each** test in the block |
| `beforeAll` | Once before **all** tests in the block |
| `afterAll` | Once after **all** tests in the block |

### 3. Testing Pinia Stores

Pinia stores need an active Pinia instance. The standard pattern creates a fresh instance before each test so tests don't share state:

```typescript
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})
```

After this setup, you can call `useMyStore()` in any test and get a clean store.

### 4. Common Matchers

| Matcher | Checks |
|---------|--------|
| `toBe(value)` | Strict equality (`===`) |
| `toEqual(value)` | Deep equality (objects, arrays) |
| `toBeNull()` | Value is `null` |
| `toBeTruthy()` / `toBeFalsy()` | Truthy / falsy check |
| `toContain(item)` | Array or string contains item |
| `toHaveLength(n)` | Array or string length |
| `toThrow()` | Function throws an error |
| `toBeGreaterThan(n)` | Numeric comparison |
| `toHaveBeenCalled()` | Mock function was called |

### 5. Mocking

Mocking replaces real implementations with controllable fakes. Vitest provides three main tools:

```typescript
import { vi } from 'vitest'

// vi.fn() — create a standalone mock function
const handler = vi.fn()
handler('hello')
expect(handler).toHaveBeenCalledWith('hello')

// vi.spyOn() — wrap an existing method
const spy = vi.spyOn(console, 'log')
console.log('test')
expect(spy).toHaveBeenCalledWith('test')
spy.mockRestore()

// vi.mock() — mock an entire module
vi.mock('@/utils/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ id: 1 }),
}))
```

### 6. Running Tests

```bash
# Watch mode — re-runs on file changes (great during development)
npm run test

# Single run — execute all tests once and exit (used in CI)
npm run test:run
```

## Project Example

Here is a real test from the project (`src/__tests__/help.store.test.ts`):

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHelpStore } from '@/stores/help'

describe('Help Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have correct initial values', () => {
    const store = useHelpStore()
    expect(store.dialogOpen).toBe(false)
    expect(store.activeArticleId).toBeNull()
  })

  it('should open the dialog', () => {
    const store = useHelpStore()
    store.openDialog()
    expect(store.dialogOpen).toBe(true)
  })
})
```

**What's happening:**

1. `beforeEach` creates a fresh Pinia instance so each test starts with a clean store.
2. The first test checks that the store initializes with `dialogOpen: false` and `activeArticleId: null`.
3. The second test calls the `openDialog` action and verifies the state changed.

This pattern — create pinia, get store, call action, assert state — applies to every store test in the project.

## Exercises

### Starter: Test a Simple Function

Create a file `src/__tests__/math.test.ts`. Write and test an `add(a, b)` function:

```typescript
import { describe, it, expect } from 'vitest'

function add(a: number, b: number): number {
  return a + b
}

describe('add', () => {
  // TODO: test that add(2, 3) returns 5
  // TODO: test that add(-1, 1) returns 0
  // TODO: test that add(0, 0) returns 0
})
```

### Standard: Test a Counter Store

Assume you have a counter store with `count` state, plus `increment`, `decrement`, and `reset` actions.

Write a test file `src/__tests__/counter.store.test.ts` that:

1. Sets up a fresh Pinia in `beforeEach`
2. Tests the initial value of `count` (should be `0`)
3. Tests `increment` — count goes from `0` to `1`
4. Tests `decrement` — count goes from `0` to `-1`
5. Tests `reset` — increment twice, then reset, count should be `0`

### Challenge: Test a TodoStore with Mocked localStorage

Create tests for a `useTodoStore` that loads/saves todos from `localStorage`.

You'll need to:

1. Mock `localStorage` using `vi.spyOn` (spy on `getItem` and `setItem`)
2. Test that `loadTodos` reads from localStorage and parses JSON
3. Test that `addTodo` adds a todo and saves to localStorage
4. Test that `removeTodo` removes by ID and saves
5. Clean up mocks in `afterEach`

Hint:

```typescript
const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
getItemSpy.mockReturnValue(JSON.stringify([{ id: 1, text: 'Test' }]))
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing Pinia Stores](https://pinia.vuejs.org/cookbook/testing.html)
