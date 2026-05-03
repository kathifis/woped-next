# TypeScript Basics

## Why TypeScript?

TypeScript is a superset of JavaScript that adds **static type checking**. Every valid JavaScript program is also valid TypeScript — but TypeScript lets you annotate your code with types so that entire categories of bugs are caught at compile time rather than at runtime.

WoPeD Next enables `strict: true` in its config, which means the compiler enforces the strictest checks available. The codebase uses `.ts` files for stores, services, and type definitions, and many Vue Single-File Components use `<script setup lang="ts">`.

**What you gain:**

- Autocompletion and inline documentation in your editor
- Errors surfaced _before_ you run the code
- Self-documenting function signatures and data structures
- Safer refactoring across a growing codebase

---

## Key Concepts

### 1. Type Annotations

Annotate variables, function parameters, and return values with a colon followed by a type.

**Primitive types:**

```typescript
const name: string = 'WoPeD'
const version: number = 4
const isReady: boolean = true
let description: string | null = null
let mode: string | undefined = undefined
```

**Arrays and objects:**

```typescript
const ids: string[] = ['a1', 'b2', 'c3']
const counts: number[] = [1, 2, 3]

const position: { x: number; y: number } = { x: 100, y: 200 }
```

**Function parameter and return types:**

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`
}

function sum(a: number, b: number): number {
  return a + b
}

function log(message: string): void {
  console.log(message)
}
```

When a function returns nothing, annotate the return type as `void`.

---

### 2. Interfaces

An **interface** describes the shape of an object — which properties it has and what types they carry.

```typescript
interface User {
  id: number
  name: string
  email: string
}

const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
}
```

**Optional properties** are marked with `?`. They may be `undefined`:

```typescript
interface Config {
  debug?: boolean
  logLevel?: number
}

const cfg: Config = {} // valid — all properties are optional
```

**Real project example** — the `HelpArticle` interface used in WoPeD Next:

```typescript
interface HelpArticle {
  id: string
  title: string
  category: HelpCategory
  content: string
  keywords?: string[]
}
```

`keywords` is optional: an article may or may not carry search keywords.

---

### 3. Type Aliases

A **type alias** gives a name to any type expression. Use `type` for unions, intersections, and computed types; use `interface` for object shapes you might extend later.

```typescript
type ID = string | number

type Status = 'idle' | 'loading' | 'error'
```

**Union types** restrict a value to one of several options:

```typescript
type OperatorType = 'and-join' | 'and-split' | 'xor-join' | 'xor-split'

function describeOperator(op: OperatorType): string {
  switch (op) {
    case 'and-join':
      return 'All incoming arcs must fire'
    case 'and-split':
      return 'All outgoing arcs fire'
    case 'xor-join':
      return 'Exactly one incoming arc fires'
    case 'xor-split':
      return 'Exactly one outgoing arc fires'
  }
}
```

**`type` vs `interface` — rule of thumb:**

| Use `interface` when…         | Use `type` when…                 |
| ----------------------------- | -------------------------------- |
| Defining an object shape      | Creating a union or intersection |
| You want `extends` later      | Mapping or computing types       |
| Declaring component props     | Aliasing primitives or tuples    |

---

### 4. Generics

Generics let you write code that works with _any_ type while still preserving type safety.

**A generic function:**

```typescript
function first<T>(items: T[]): T | undefined {
  return items[0]
}

const n = first([1, 2, 3])       // n: number | undefined
const s = first(['a', 'b', 'c']) // s: string | undefined
```

**Generic utility types you'll see in the project:**

```typescript
// A record mapping string keys to unknown values
const metadata: Record<string, unknown> = {
  version: 1,
  author: 'team',
}

// Partial makes all properties optional
function updateUser(current: User, patch: Partial<User>): User {
  return { ...current, ...patch }
}
```

**When to use generics:** whenever a function, class, or type needs to work with multiple types but you still want the compiler to track which concrete type is in play.

---

### 5. Enums and Literal Types

WoPeD Next prefers **string literal unions** over TypeScript `enum`s. They are simpler, produce no runtime code, and work seamlessly with Vue's reactivity system.

```typescript
type ToolMode = 'select' | 'place' | 'transition' | 'arc'

let currentMode: ToolMode = 'select'

currentMode = 'place'      // OK
currentMode = 'delete'     // Error: '"delete"' is not assignable to type 'ToolMode'
```

If you need to iterate over all valid values, keep a companion array:

```typescript
const TOOL_MODES: ToolMode[] = ['select', 'place', 'transition', 'arc']
```

---

### 6. Type Narrowing

TypeScript tracks control flow and **narrows** types inside conditional branches.

**`typeof` checks:**

```typescript
function format(value: string | number): string {
  if (typeof value === 'number') {
    return value.toFixed(2) // value is number here
  }
  return value.toUpperCase() // value is string here
}
```

**`in` operator:**

```typescript
interface Place {
  kind: 'place'
  tokens: number
}

interface Transition {
  kind: 'transition'
  enabled: boolean
}

type Element = Place | Transition

function describe(el: Element): string {
  if ('tokens' in el) {
    return `Place with ${el.tokens} tokens` // el is Place
  }
  return `Transition (enabled: ${el.enabled})` // el is Transition
}
```

**Truthiness narrowing:**

```typescript
function printName(name: string | null | undefined): void {
  if (name) {
    console.log(name.toUpperCase()) // name is string here
  }
}
```

---

## Project Examples

### 1. Typed Pinia Store State

Pinia stores in WoPeD Next define a state interface and return it from the `state` function:

```typescript
interface HelpState {
  articles: HelpArticle[]
  selectedArticle: HelpArticle | null
  searchQuery: string
  isLoading: boolean
}

export const useHelpStore = defineStore('help', {
  state: (): HelpState => ({
    articles: [],
    selectedArticle: null,
    searchQuery: '',
    isLoading: false,
  }),

  getters: {
    filteredArticles(state): HelpArticle[] {
      const q = state.searchQuery.toLowerCase()
      return state.articles.filter((a) =>
        a.title.toLowerCase().includes(q),
      )
    },
  },

  actions: {
    selectArticle(article: HelpArticle) {
      this.selectedArticle = article
    },
  },
})
```

The explicit `(): HelpState =>` return type on `state` ensures every property is present and correctly typed.

### 2. Vue Component Props with TypeScript

With `<script setup lang="ts">`, use `defineProps` with a generic type parameter instead of the runtime options object:

```typescript
<script setup lang="ts">
interface Props {
  title: string
  description?: string
  count: number
}

const props = defineProps<Props>()
</script>
```

To add default values, use `withDefaults`:

```typescript
<script setup lang="ts">
interface Props {
  title: string
  description?: string
  count: number
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  count: 0,
})
</script>
```

### 3. A Typed Service Function

Service functions accept and return typed data:

```typescript
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatResponse {
  message: ChatMessage
  tokens: number
}

async function sendMessage(
  prompt: string,
  history: ChatMessage[],
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history }),
  })
  return response.json() as Promise<ChatResponse>
}
```

The `Promise<ChatResponse>` return type tells callers exactly what shape the resolved value will have.

---

## Exercises

### Starter

**1.** Create a `PetriNetElement` interface with the following properties:
- `id: string`
- `name: string`
- `position: { x: number, y: number }`

```typescript
// Your code here
```

**2.** Create a function `createElement(name: string, x: number, y: number): PetriNetElement` that generates a unique `id` and returns a new element.

```typescript
// Your code here
```

<details>
<summary>Hint</summary>

Use `crypto.randomUUID()` or a counter to generate the `id`.

</details>

---

### Standard

**3.** Create a type `ElementType = 'place' | 'transition' | 'arc'`.

**4.** Extend the `PetriNetElement` interface to include:
- `type: ElementType`
- `tokens?: number` (only meaningful for places)

```typescript
// Your code here
```

**5.** Write a function `filterByType(elements: PetriNetElement[], type: ElementType): PetriNetElement[]` that returns only the elements matching the given type.

```typescript
// Your code here
```

<details>
<summary>Hint</summary>

Use `Array.prototype.filter()` and compare `el.type === type`.

</details>

---

### Challenge

**6.** Create a generic `Store<T>` type with:
- `state: T`
- `getters: Record<string, (state: T) => unknown>`
- `actions: Record<string, (...args: unknown[]) => void>`

```typescript
// Your code here
```

**7.** Define a `PetriNetState` interface (with properties like `elements`, `selectedId`, `toolMode`) and create a concrete `Store<PetriNetState>` instance.

```typescript
// Your code here
```

<details>
<summary>Hint</summary>

```typescript
interface PetriNetState {
  elements: PetriNetElement[]
  selectedId: string | null
  toolMode: ToolMode
}

const store: Store<PetriNetState> = {
  state: { elements: [], selectedId: null, toolMode: 'select' },
  getters: {
    elementCount: (state) => state.elements.length,
  },
  actions: {
    reset: () => { /* ... */ },
  },
}
```

</details>

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) — the official guide covering every feature in depth
- [TypeScript Playground](https://www.typescriptlang.org/play) — experiment with TypeScript in the browser without any setup
