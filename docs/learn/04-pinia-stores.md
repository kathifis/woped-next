# Pinia Stores

## Why Pinia?

As your application grows, different components need access to the same data. A help dialog needs to know whether it is open. The Petri net editor needs to share the list of places and transitions with the toolbar, the properties panel, and the canvas. Passing this data through props from parent to child to grandchild gets messy fast — this is called **props drilling**.

**Pinia** solves this by providing **centralized stores** that any component can read from and write to. A store is a reactive object that lives outside of the component tree. When a store's state changes, every component that uses it updates automatically.

WoPeD Next uses **Pinia 3** with the **Options API** store syntax (`state` / `getters` / `actions`).

---

## Key Concepts

### 1. What is State Management?

Imagine two components that both display a user's name. Without a store, you would need to keep the name in a common ancestor and pass it down as a prop:

```
App
├── Navbar  (needs user name → prop)
└── Dashboard
    └── Profile  (needs user name → prop through Dashboard)
```

With a store, both components access the same reactive data directly:

```
App
├── Navbar       → useUserStore().name
└── Dashboard
    └── Profile  → useUserStore().name
```

**When do you need a store?**

| Situation | Use a store? |
|---|---|
| Data shared across multiple unrelated components | Yes |
| Data that must survive component unmounting | Yes |
| Data fetched from an API and used in several places | Yes |
| Temporary form input (only used in one component) | No — use local `ref()` |
| Toggle state for a single dropdown | No — use local `ref()` |

**Rule of thumb:** if only one component cares about the data, keep it local. If multiple components need it, put it in a store.

---

### 2. Defining a Store

A store is created with `defineStore()`. The first argument is a **unique ID** (used internally by Pinia and Vue DevTools). The second argument is an options object with three sections:

```typescript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),

  getters: {
    doubleCount(): number {
      return this.count * 2
    },
  },

  actions: {
    increment() {
      this.count++
    },
  },
})
```

| Section | Purpose |
|---|---|
| `state` | A **factory function** that returns the initial state object. Must be a function (not a plain object) so every test or SSR request gets its own fresh copy. |
| `getters` | **Computed values** derived from state. Cached and only recalculated when their dependencies change. |
| `actions` | **Methods** that read or modify state. Can be synchronous or asynchronous. |

> **Naming convention:** store composables are always named `use...Store` — e.g. `useHelpStore`, `usePetriNetStore`, `useConfigStore`. This follows the Vue convention for composables and makes stores easy to find.

#### Typing State with TypeScript

In WoPeD Next, store state types are defined as TypeScript interfaces in the `src/types/` folder. The state function is annotated with a return type to get full type checking:

```typescript
import { defineStore } from 'pinia'
import type { HelpState } from '@/types/help'

export const useHelpStore = defineStore('help', {
  state: (): HelpState => ({
    dialogOpen: false,
    activeArticleId: null,
    searchQuery: '',
  }),
  // ...
})
```

The `HelpState` interface might look like this:

```typescript
export interface HelpState {
  dialogOpen: boolean
  activeArticleId: string | null
  searchQuery: string
}
```

This gives you autocompletion when accessing `this.dialogOpen` inside getters and actions, and catches typos at compile time.

---

### 3. Getters

Getters are **derived values** — think of them as the store equivalent of `computed()` in a component. They receive state through `this` and return a computed result:

```typescript
getters: {
  articles(): HelpArticle[] {
    return helpArticles
  },

  activeArticle(): HelpArticle | null {
    if (!this.activeArticleId) return null
    return helpArticles.find((a) => a.id === this.activeArticleId) ?? null
  },

  filteredArticles(): HelpArticle[] {
    if (!this.searchQuery.trim()) return helpArticles
    const q = this.searchQuery.toLowerCase()
    return helpArticles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.keywords?.some((k) => k.includes(q))
    )
  },
},
```

| Pattern | Example |
|---|---|
| Return static data | `articles()` — exposes the full list |
| Derive from state | `activeArticle()` — looks up the article matching `activeArticleId` |
| Filter / transform | `filteredArticles()` — filters articles based on `searchQuery` |

Getters can also access other getters via `this`:

```typescript
getters: {
  completedTodos(): Todo[] {
    return this.todos.filter((t) => t.done)
  },
  completedCount(): number {
    return this.completedTodos.length
  },
},
```

> **Important:** always annotate the return type of getters. TypeScript cannot always infer it from `this` access, and explicit types prevent subtle bugs.

---

### 4. Actions

Actions are methods that **modify state**. Unlike getters, actions can contain side effects (API calls, localStorage access, timers) and can be `async`.

#### Synchronous Actions

```typescript
actions: {
  openDialog(articleId?: string) {
    this.dialogOpen = true
    this.activeArticleId = articleId ?? helpArticles[0]?.id ?? null
  },

  closeDialog() {
    this.dialogOpen = false
  },

  setSearchQuery(query: string) {
    this.searchQuery = query
  },
},
```

Actions access state and getters through `this`, just like getters do. The difference is that actions are allowed to **mutate** state (`this.dialogOpen = true`), while getters must remain pure.

#### Asynchronous Actions

Actions can be `async` for operations like API calls:

```typescript
actions: {
  async fetchArticles() {
    this.loading = true
    try {
      const response = await fetch('/api/articles')
      this.articles = await response.json()
    } catch (error) {
      this.error = 'Failed to load articles'
    } finally {
      this.loading = false
    }
  },
},
```

You can call async actions from components just like regular actions — Vue's reactivity system picks up the state changes automatically.

---

### 5. Using Stores in Components

#### Basic Usage

Import the store composable and call it inside `<script setup>`. The returned object is fully reactive:

```vue
<script setup lang="ts">
import { useHelpStore } from '@/stores/help'

const helpStore = useHelpStore()
</script>

<template>
  <button @click="helpStore.openDialog()">Help</button>

  <div v-if="helpStore.dialogOpen">
    <h2>{{ helpStore.activeArticle?.title }}</h2>

    <input
      :value="helpStore.searchQuery"
      @input="helpStore.setSearchQuery(($event.target as HTMLInputElement).value)"
      placeholder="Search…"
    />

    <ul>
      <li v-for="article in helpStore.filteredArticles" :key="article.id">
        {{ article.title }}
      </li>
    </ul>
  </div>
</template>
```

You can read state and getters directly (`helpStore.dialogOpen`, `helpStore.filteredArticles`) and call actions as methods (`helpStore.openDialog()`).

#### Destructuring with `storeToRefs()`

You might be tempted to destructure the store for shorter template expressions:

```typescript
// ⚠️ WRONG — loses reactivity!
const { dialogOpen, activeArticle } = helpStore
```

Plain destructuring breaks reactivity because it extracts the current value, not a reactive reference. Use `storeToRefs()` instead:

```typescript
import { storeToRefs } from 'pinia'
import { useHelpStore } from '@/stores/help'

const helpStore = useHelpStore()
const { dialogOpen, activeArticle, filteredArticles } = storeToRefs(helpStore)
```

Now `dialogOpen` is a `Ref<boolean>` that stays in sync with the store. In the template, Vue auto-unwraps refs, so you write `dialogOpen` instead of `dialogOpen.value`:

```vue
<template>
  <div v-if="dialogOpen">
    <h2>{{ activeArticle?.title }}</h2>
  </div>
</template>
```

> **Note:** `storeToRefs()` only works for state and getters. Actions are plain functions and can be destructured directly:
>
> ```typescript
> const { openDialog, closeDialog } = helpStore
> ```

---

### 6. Store Composition

Stores can use other stores. Simply call the other store's composable inside an action or getter:

```typescript
import { defineStore } from 'pinia'
import { useConfigStore } from './config'

export const usePetriNetStore = defineStore('petriNet', {
  actions: {
    exportNet() {
      const configStore = useConfigStore()
      const format = configStore.exportFormat
      // ... export logic using the config value
    },
  },
})
```

**Guidelines for store composition:**

- Keep stores **focused** — each store manages one domain (help system, editor state, configuration).
- Avoid circular dependencies (store A uses store B which uses store A).
- Call `useOtherStore()` inside actions/getters, not at the top level of the store definition.

Here is how the WoPeD Next stores are organized:

| Store | Domain | Key State |
|---|---|---|
| `petriNet.ts` | Petri net editor | Places, transitions, arcs, selection |
| `config.ts` | User settings | Language, theme, export format |
| `help.ts` | Help system | Dialog visibility, search, active article |
| `tokenGame.ts` | Token game simulation | Active tokens, firing history |
| `simulation.ts` | Quantitative simulation | Simulation parameters, results |
| `resources.ts` | Resource management | Resource definitions, assignments |

The `petriNet` store is the largest because it manages the core editor state. The others are intentionally small and focused.

---

## Project Examples

### The Help Store — Full Walkthrough

Here is the complete `src/stores/help.ts` from the project:

```typescript
import { defineStore } from 'pinia'
import type { HelpState, HelpArticle, GuidedTour } from '@/types/help'
import { helpArticles } from '@/help/articles'
import { guidedTours } from '@/help/tours'

export const useHelpStore = defineStore('help', {
  state: (): HelpState => ({
    dialogOpen: false,
    activeArticleId: null,
    searchQuery: '',
    activeTourId: null,
    activeTourStep: 0,
    seenTours: [],
    hasSeenWelcome: false,
  }),

  getters: {
    articles(): HelpArticle[] {
      return helpArticles
    },
    activeArticle(): HelpArticle | null {
      if (!this.activeArticleId) return null
      return helpArticles.find((a) => a.id === this.activeArticleId) ?? null
    },
    isTourActive(): boolean {
      return this.activeTourId !== null
    },
    filteredArticles(): HelpArticle[] {
      if (!this.searchQuery.trim()) return helpArticles
      const q = this.searchQuery.toLowerCase()
      return helpArticles.filter(
        (a) => a.title.toLowerCase().includes(q) || a.keywords?.some((k) => k.includes(q))
      )
    },
  },

  actions: {
    openDialog(articleId?: string) {
      this.dialogOpen = true
      this.activeArticleId = articleId ?? helpArticles[0]?.id ?? null
    },
    closeDialog() {
      this.dialogOpen = false
    },
    setActiveArticle(id: string) {
      this.activeArticleId = id
    },
    setSearchQuery(query: string) {
      this.searchQuery = query
    },
  },
})
```

**What to notice:**

1. **State** is typed via `HelpState` — the return type annotation on the factory function.
2. **Getters** derive values from state: `activeArticle` looks up an article by ID, `filteredArticles` applies the search filter.
3. **Actions** modify state in a controlled way: `openDialog` sets two properties at once, ensuring they stay consistent.
4. External data (`helpArticles`, `guidedTours`) is imported at the top level, not stored in state — only dynamic, changing values belong in state.

### The Petri Net Store — The "Big" Store

The `petriNet.ts` store is the largest in the project. It manages the entire editor state: places, transitions, arcs, selection, undo/redo history, and more. While it follows the same `state`/`getters`/`actions` pattern, it has dozens of actions and getters.

When you encounter a large store, look for these patterns:

- **State** contains arrays and maps of domain objects (`Place[]`, `Transition[]`, `Arc[]`).
- **Getters** compute derived data like "selected elements" or "elements at position".
- **Actions** handle complex multi-step mutations like "add a transition and connect it to the selected place".

You will interact with this store frequently when working on editor features.

---

## Exercises

### Starter

**1. Create a Counter Store**

Create a file `src/stores/counter.ts` with:
- State: `count` (number, starts at `0`)
- Getter: `doubleCount` (returns `count * 2`)
- Actions: `increment()` and `decrement()`

```typescript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    // add count here
  }),

  getters: {
    // add doubleCount here
  },

  actions: {
    // add increment and decrement here
  },
})
```

**2. Use the Counter Store in a Component**

Create a component that displays the count, the doubled count, and two buttons:

```vue
<script setup lang="ts">
// 1. Import the store
// 2. Create the store instance
</script>

<template>
  <div>
    <p>Count: <!-- display count --></p>
    <p>Double: <!-- display doubleCount --></p>
    <button>+</button>
    <button>-</button>
  </div>
</template>
```

### Standard

**3. Create a Theme Store**

Create `src/stores/theme.ts` with:
- State: `isDark: boolean` (default `false`)
- Action: `toggle()` — flips `isDark`
- Getter: `themeClass` — returns `'dark'` when `isDark` is `true`, `'light'` otherwise

Use the store in a component that applies the theme class to a `<div>` and shows a toggle button.

**4. Add localStorage Persistence**

Extend your theme store so that `isDark` is saved to `localStorage` whenever `toggle()` is called, and loaded from `localStorage` in the state factory:

```typescript
state: () => ({
  isDark: localStorage.getItem('theme-dark') === 'true',
}),

actions: {
  toggle() {
    this.isDark = !this.isDark
    localStorage.setItem('theme-dark', String(this.isDark))
  },
},
```

Verify that the theme persists when you reload the page.

**5. Create a Todo Store**

Create `src/stores/todo.ts` with typed state:

```typescript
interface Todo {
  id: number
  text: string
  done: boolean
}
```

- State: `todos: Todo[]` (initially empty), `nextId: number` (starts at `1`)
- Actions: `addTodo(text: string)`, `removeTodo(id: number)`, `toggleTodo(id: number)`
- Getter: `completedCount` — returns the number of todos where `done` is `true`

Build a component with an input field, an "Add" button, and a list that renders each todo with a checkbox and a delete button.

### Challenge

**6. Create an Editor Store**

Create `src/stores/editor.ts` that manages a list of elements:

```typescript
interface EditorElement {
  id: string
  name: string
  x: number
  y: number
  type: 'place' | 'transition'
}
```

Implement:
- State: `elements: EditorElement[]`
- Actions: `addElement(element: EditorElement)`, `removeElement(id: string)`, `moveElement(id: string, x: number, y: number)`
- Getters: `elementCount` (total number of elements), `getElementsByType` (returns a function that filters by type)

The `getElementsByType` getter uses a pattern called a "getter that returns a function":

```typescript
getters: {
  getElementsByType(): (type: string) => EditorElement[] {
    return (type: string) => this.elements.filter((e) => e.type === type)
  },
},
```

This lets you call it in a template as `editorStore.getElementsByType('place')`.

**7. Store Interaction — Editor + History**

Create a `src/stores/history.ts` that records undo/redo steps:

```typescript
interface HistoryEntry {
  action: string
  timestamp: number
  data: unknown
}
```

- State: `entries: HistoryEntry[]`, `currentIndex: number`
- Actions: `record(entry)`, `undo()`, `redo()`
- Getter: `canUndo`, `canRedo`

Then modify your `useEditorStore` so that `addElement()` and `removeElement()` call `useHistoryStore().record(...)` to log each change. This demonstrates how stores compose — the editor store delegates history tracking to a dedicated history store.

---

## Resources

- [Pinia documentation](https://pinia.vuejs.org/)
- [Pinia — Defining a Store](https://pinia.vuejs.org/core-concepts/)
- [Pinia — State](https://pinia.vuejs.org/core-concepts/state.html)
- [Pinia — Getters](https://pinia.vuejs.org/core-concepts/getters.html)
- [Pinia — Actions](https://pinia.vuejs.org/core-concepts/actions.html)
- [Pinia with TypeScript](https://pinia.vuejs.org/core-concepts/state.html)
