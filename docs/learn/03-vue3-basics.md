# Vue 3 Basics

## Why Vue 3?

Vue is a **component-based UI framework** for building web interfaces. Instead of writing one giant HTML file, you break your UI into small, reusable pieces called **components** — a button, a sidebar, a modal, an entire page.

Vue 3 introduced the **Composition API**, which lets you organize component logic by *what it does* rather than *what type of option it is*. WoPeD Next uses Vue 3.5 with `<script setup>`, the most concise and modern way to write Vue components.

If you've used React, you'll find many similarities: components, props, state, computed values. If Vue is your first framework — don't worry, the concepts are straightforward.

---

## Key Concepts

### 1. Single File Components (SFC)

A Vue Single File Component (`.vue` file) bundles template, logic, and styles in one file:

```vue
<script setup>
// JavaScript/TypeScript logic goes here
</script>

<template>
  <!-- HTML template goes here -->
</template>

<style scoped>
/* CSS scoped to this component */
</style>
```

The three sections:

| Section | Purpose |
|---------|---------|
| `<script setup>` | Component logic — reactive state, props, computed values, functions |
| `<template>` | HTML structure — what the component renders |
| `<style scoped>` | CSS styles — `scoped` means they only apply to this component |

**Why `<script setup>`?** It's a compile-time syntax sugar that eliminates boilerplate. You don't need to manually return variables or register components — everything declared at the top level is automatically available in the template.

Compare the old Options API with `<script setup>`:

```vue
<!-- ❌ Options API (we do NOT use this) -->
<script>
import { computed } from 'vue'

export default {
  props: {
    name: String,
  },
  setup(props) {
    const greeting = computed(() => `Hello, ${props.name}!`)
    return { greeting }
  },
}
</script>
```

```vue
<!-- ✅ script setup (what we use in WoPeD Next) -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: String,
})

const greeting = computed(() => `Hello, ${props.name}!`)
</script>
```

Less code, no `export default`, no manual `return`. Everything just works.

---

### 2. Reactivity

Vue's reactivity system automatically tracks dependencies and updates the DOM when data changes. There are three core primitives:

#### `ref()` — for primitive values

Use `ref()` for strings, numbers, booleans, or any single value:

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const name = ref('WoPeD')

function increment() {
  count.value++  // access via .value in script
}
</script>

<template>
  <!-- No .value needed in templates — Vue unwraps automatically -->
  <p>{{ name }} count: {{ count }}</p>
  <button @click="increment">+1</button>
</template>
```

**Important:** In `<script>`, you access/set a ref's value via `.value`. In `<template>`, Vue unwraps it automatically — just use `{{ count }}`, not `{{ count.value }}`.

#### `reactive()` — for objects

Use `reactive()` when you have a group of related values:

```vue
<script setup>
import { reactive } from 'vue'

const form = reactive({
  username: '',
  email: '',
  agreed: false,
})

function reset() {
  form.username = ''
  form.email = ''
  form.agreed = false
}
</script>

<template>
  <input v-model="form.username" placeholder="Username" />
  <input v-model="form.email" placeholder="Email" />
</template>
```

No `.value` needed — you access properties directly. But `reactive()` only works with objects, not primitives.

#### `computed()` — for derived values

Use `computed()` when a value depends on other reactive data. It caches the result and only recalculates when its dependencies change:

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { name: 'Place P1', type: 'place' },
  { name: 'Transition T1', type: 'transition' },
  { name: 'Place P2', type: 'place' },
])

const placeCount = computed(() =>
  items.value.filter((item) => item.type === 'place').length
)
</script>

<template>
  <p>{{ placeCount }} places in the net</p>
</template>
```

#### When to use which?

| Situation | Use |
|-----------|-----|
| A single value (number, string, boolean) | `ref()` |
| A group of related values (form data, config) | `reactive()` |
| A value derived from other reactive data | `computed()` |
| Not sure? | Default to `ref()` — it works for everything |

#### WoPeD Next example: `EditorGrid.vue`

Here's how the real project uses `computed()` to derive grid lines from props:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  gridSize: { type: Number, default: 20 },
  visible: { type: Boolean, default: true },
})

const gridLines = computed(() => {
  const lines = []
  for (let x = 0; x < props.width; x += props.gridSize) {
    lines.push({ points: [x, 0, x, props.height] })
  }
  return lines
})
</script>
```

`gridLines` recalculates automatically whenever `width`, `height`, or `gridSize` changes — no manual tracking needed.

---

### 3. Template Syntax

Vue templates look like HTML with a few extra features.

#### Interpolation `{{ }}`

Display reactive data in the template:

```vue
<template>
  <h1>{{ title }}</h1>
  <p>{{ count * 2 }}</p>
  <p>{{ items.length > 0 ? 'Has items' : 'Empty' }}</p>
</template>
```

Any JavaScript expression works inside `{{ }}`.

#### `v-bind` (shorthand `:`) — dynamic attributes

Bind a reactive value to an HTML attribute:

```vue
<template>
  <!-- Full syntax -->
  <img v-bind:src="imageUrl" />

  <!-- Shorthand (preferred) -->
  <img :src="imageUrl" />
  <button :disabled="isLoading">Save</button>
  <div :class="{ active: isActive }">...</div>
</template>
```

#### `v-on` (shorthand `@`) — event handling

Listen for DOM events:

```vue
<template>
  <!-- Full syntax -->
  <button v-on:click="handleClick">Click</button>

  <!-- Shorthand (preferred) -->
  <button @click="handleClick">Click</button>
  <button @click="count++">+1</button>
  <input @keyup.enter="submitForm" />
</template>
```

#### `v-if` / `v-else-if` / `v-else` — conditional rendering

Conditionally add or remove elements from the DOM:

```vue
<template>
  <div v-if="status === 'loading'">Loading...</div>
  <div v-else-if="status === 'error'">Something went wrong</div>
  <div v-else>Content loaded!</div>
</template>
```

**`v-show`** is an alternative that toggles CSS `display` instead of adding/removing DOM elements. Use `v-show` for things that toggle frequently, `v-if` for things that rarely change.

```vue
<template>
  <!-- v-if: removes from DOM entirely -->
  <Modal v-if="showModal" />

  <!-- v-show: stays in DOM, toggles display: none -->
  <Tooltip v-show="isHovered" />
</template>
```

#### `v-for` — list rendering

Render a list of items. Always provide a unique `:key`:

```vue
<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: 'Learn Vue', done: true },
  { id: 2, text: 'Build WoPeD', done: false },
])
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      {{ todo.text }} — {{ todo.done ? '✓' : '○' }}
    </li>
  </ul>
</template>
```

**Why `:key`?** Vue uses it to efficiently track and reorder DOM elements. Always use a unique identifier (like `id`), not the array index.

#### WoPeD Next example: `EditorGrid.vue` template

```vue
<template>
  <div v-if="visible">
    <div v-for="(line, index) in gridLines" :key="index">{{ line }}</div>
  </div>
</template>
```

This uses `v-if` to conditionally render the grid and `v-for` to loop over the computed grid lines.

#### `v-model` — two-way binding

Bind an input's value to a ref and keep them in sync:

```vue
<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<template>
  <input v-model="searchQuery" placeholder="Search..." />
  <p>You typed: {{ searchQuery }}</p>
</template>
```

`v-model` is shorthand for `:value="searchQuery" @input="searchQuery = $event.target.value"`.

---

### 4. Props and Emits

Components communicate through **props** (parent → child) and **emits** (child → parent).

#### `defineProps()` — receiving data from parent

**Runtime declaration** (JavaScript, with validation):

```vue
<script setup>
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  items: { type: Array, default: () => [] },
})
</script>
```

**Type-based declaration** (TypeScript, compile-time checking):

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string
  count?: number
  items?: string[]
}>()
</script>
```

With defaults in TypeScript, use `withDefaults`:

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    count?: number
  }>(),
  {
    count: 0,
  }
)
</script>
```

#### `defineEmits()` — sending events to parent

Emits let a child component notify its parent that something happened:

```vue
<script setup lang="ts">
const emit = defineEmits<{
  increment: []
  update: [value: number]
  navigate: [netId: string]
}>()

function handleClick() {
  emit('increment')
  emit('update', 42)
}
</script>
```

The parent listens with `@`:

```vue
<template>
  <MyComponent @increment="onIncrement" @update="onUpdate" />
</template>
```

#### One-way data flow

```
┌──────────┐   props    ┌──────────┐
│  Parent  │ ─────────► │  Child   │
│          │ ◄───────── │          │
└──────────┘   emits    └──────────┘
```

- **Props flow down**: parent passes data to child. The child should **never mutate props directly**.
- **Emits flow up**: child tells parent something happened. The parent decides what to do.

#### WoPeD Next example: `ProcessTreeNode.vue`

```vue
<script setup lang="ts">
import type { PetriNet } from '@/types/petri-net'

interface TreeNode {
  net: PetriNet
  children: TreeNode[]
}

defineProps<{
  node: TreeNode
  depth: number
  activeNetId: string
}>()

const emit = defineEmits<{
  navigate: [netId: string]
  toggle: [netId: string]
}>()
</script>
```

This component:
- Receives `node`, `depth`, and `activeNetId` as typed props from its parent
- Emits `navigate` and `toggle` events with a `netId` string back to the parent

---

### 5. Lifecycle Hooks

Lifecycle hooks let you run code at specific moments in a component's life:

```
Component created  →  mounted (in DOM)  →  updated  →  unmounted (removed)
```

The two you'll use most often:

#### `onMounted` — component is in the DOM

```vue
<script setup>
import { ref, onMounted } from 'vue'

const canvas = ref(null)

onMounted(() => {
  // DOM is now available
  console.log('Component mounted, canvas:', canvas.value)

  // Good use cases:
  // - Access DOM elements via template refs
  // - Start event listeners
  // - Fetch initial data from an API
})
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>
```

#### `onUnmounted` — component is being removed

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

let intervalId

onMounted(() => {
  intervalId = setInterval(() => {
    console.log('tick')
  }, 1000)
})

onUnmounted(() => {
  // Clean up to prevent memory leaks
  clearInterval(intervalId)
})
</script>
```

**Rule of thumb:** if you set something up in `onMounted`, clean it up in `onUnmounted`.

| Hook | When it runs | Common use cases |
|------|-------------|-----------------|
| `onMounted` | Component is inserted into the DOM | DOM access, API calls, event listeners |
| `onUnmounted` | Component is removed from the DOM | Cleanup: timers, listeners, subscriptions |
| `onUpdated` | After a reactive state change causes a re-render | Rarely needed — prefer `watch()` |

---

### 6. Watchers

Watchers let you run side effects when reactive data changes.

#### `watch()` — watch specific sources

```vue
<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')

// Watch a single ref
watch(searchQuery, (newValue, oldValue) => {
  console.log(`Search changed: "${oldValue}" → "${newValue}"`)
})
</script>
```

Watch multiple sources:

```vue
<script setup>
import { ref, watch } from 'vue'

const firstName = ref('Ada')
const lastName = ref('Lovelace')

watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  console.log(`Name changed: ${oldFirst} ${oldLast} → ${newFirst} ${newLast}`)
})
</script>
```

#### `watchEffect()` — auto-track dependencies

`watchEffect()` runs immediately and re-runs whenever any reactive dependency inside it changes:

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  // Automatically tracks `count` — re-runs whenever it changes
  document.title = `Count: ${count.value}`
})
</script>
```

#### Deep watching

For nested objects, use `{ deep: true }`:

```vue
<script setup>
import { ref, watch } from 'vue'

const config = ref({
  grid: { size: 20, visible: true },
  snap: true,
})

watch(
  config,
  (newConfig) => {
    console.log('Config changed:', newConfig)
  },
  { deep: true }
)
</script>
```

#### When to use which?

| Situation | Use |
|-----------|-----|
| React to a specific value changing | `watch()` |
| Need the old and new value | `watch()` |
| Auto-track multiple dependencies | `watchEffect()` |
| Run once on setup + when deps change | `watchEffect()` |

---

### 7. Composables

Composables are functions that encapsulate and reuse reactive logic across components. They're the Composition API's answer to mixins.

**Naming convention:** always prefix with `use` — `useCounter()`, `useMouse()`, `useLocalStorage()`.

#### Basic example

```js
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const isEven = computed(() => count.value % 2 === 0)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initialValue
  }

  return { count, isEven, increment, decrement, reset }
}
```

Use it in any component:

```vue
<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, isEven, increment, decrement, reset } = useCounter(10)
</script>

<template>
  <p>Count: {{ count }} ({{ isEven ? 'even' : 'odd' }})</p>
  <button @click="decrement">-</button>
  <button @click="increment">+</button>
  <button @click="reset">Reset</button>
</template>
```

#### Why composables?

- **Reusability**: use the same logic in multiple components without copy-paste
- **Testability**: test the logic independently from the component
- **Organization**: group related logic together instead of scattering it across options

---

## App Entry Point

Before writing components, it helps to understand how the app starts. Here's the WoPeD Next entry point:

```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'
import { i18n } from './i18n'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())   // State management (Module 04)
app.use(i18n)            // Internationalization (Module 07)
app.use(VueKonva)        // Canvas rendering (Module 05)
app.mount('#app')
```

`createApp(App)` creates the Vue application with `App.vue` as the root component. Plugins are registered with `app.use()` before mounting. The app is then mounted to the `<div id="app">` element in `index.html`.

---

## Exercises

### Starter

#### Exercise 1: Hello Component

Create a `HelloWorld.vue` component that takes a `name` prop and displays a greeting.

```vue
<script setup>
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <!-- Display: Hello, {name}! -->
</template>
```

<details>
<summary>Solution</summary>

```vue
<script setup>
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <h1>Hello, {{ name }}!</h1>
</template>
```

</details>

#### Exercise 2: Click Counter

Extend `HelloWorld.vue` with a button that counts clicks using `ref()`.

Requirements:
- Add a `ref` called `count` starting at `0`
- Add a button that increments `count` on click
- Display the current count

<details>
<summary>Solution</summary>

```vue
<script setup>
import { ref } from 'vue'

defineProps({
  name: { type: String, required: true },
})

const count = ref(0)
</script>

<template>
  <h1>Hello, {{ name }}!</h1>
  <button @click="count++">Clicked {{ count }} times</button>
</template>
```

</details>

#### Exercise 3: Even or Odd

Add a `computed()` that shows whether the count is even or odd.

Requirements:
- Add a `computed` called `parity` that returns `'even'` or `'odd'`
- Display it below the button

<details>
<summary>Solution</summary>

```vue
<script setup>
import { ref, computed } from 'vue'

defineProps({
  name: { type: String, required: true },
})

const count = ref(0)
const parity = computed(() => (count.value % 2 === 0 ? 'even' : 'odd'))
</script>

<template>
  <h1>Hello, {{ name }}!</h1>
  <button @click="count++">Clicked {{ count }} times</button>
  <p>Count is {{ parity }}</p>
</template>
```

</details>

---

### Standard

#### Exercise 4: Todo List

Create a `TodoList.vue` component with:
- An input field bound with `v-model`
- An "Add" button that adds the input text to a list
- A list rendered with `v-for`
- A "Remove" button on each item

<details>
<summary>Hints</summary>

- Use `ref([])` for the todo list
- Use `ref('')` for the input text
- Generate unique IDs with `Date.now()`
- Use `Array.filter()` to remove items

</details>

<details>
<summary>Solution</summary>

```vue
<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const todos = ref([])

function addTodo() {
  const text = newTodo.value.trim()
  if (!text) return
  todos.value.push({ id: Date.now(), text })
  newTodo.value = ''
}

function removeTodo(id) {
  todos.value = todos.value.filter((todo) => todo.id !== id)
}
</script>

<template>
  <div>
    <input v-model="newTodo" @keyup.enter="addTodo" placeholder="What needs to be done?" />
    <button @click="addTodo">Add</button>

    <ul>
      <li v-for="todo in todos" :key="todo.id">
        {{ todo.text }}
        <button @click="removeTodo(todo.id)">Remove</button>
      </li>
    </ul>

    <p v-if="todos.length === 0">No todos yet.</p>
  </div>
</template>
```

</details>

#### Exercise 5: Counter with Emits

Create two components:

1. `Counter.vue` — displays a count and has +/- buttons that **emit** events (not mutate props)
2. `CounterParent.vue` — holds the state and listens to the emits

`Counter.vue` should:
- Accept a `count` prop
- Emit `increment` and `decrement` events
- Not modify the count itself

<details>
<summary>Solution</summary>

**Counter.vue:**

```vue
<script setup>
defineProps({
  count: { type: Number, required: true },
})

const emit = defineEmits(['increment', 'decrement'])
</script>

<template>
  <div>
    <button @click="emit('decrement')">-</button>
    <span>{{ count }}</span>
    <button @click="emit('increment')">+</button>
  </div>
</template>
```

**CounterParent.vue:**

```vue
<script setup>
import { ref } from 'vue'
import Counter from './Counter.vue'

const count = ref(0)
</script>

<template>
  <Counter
    :count="count"
    @increment="count++"
    @decrement="count--"
  />
</template>
```

</details>

#### Exercise 6: Watch the Counter

Extend Exercise 5: use `watch()` to log a message to the console whenever the counter value changes. Include both the old and new value.

<details>
<summary>Solution</summary>

Add this to `CounterParent.vue`:

```vue
<script setup>
import { ref, watch } from 'vue'
import Counter from './Counter.vue'

const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(`Counter changed: ${oldVal} → ${newVal}`)
})
</script>
```

</details>

---

### Challenge

#### Exercise 7: `useLocalStorage` Composable

Create a composable `useLocalStorage(key, defaultValue)` that:
- Returns a `ref` initialized from `localStorage` (or `defaultValue` if the key doesn't exist)
- Automatically writes to `localStorage` whenever the ref changes
- Handles JSON serialization/deserialization

```js
// Usage:
const name = useLocalStorage('user-name', 'Anonymous')
name.value = 'Alice'  // automatically saved to localStorage
```

<details>
<summary>Hints</summary>

- Use `ref()` for the reactive value
- Use `watch()` to sync changes to `localStorage`
- Use `JSON.parse()` / `JSON.stringify()` for serialization
- Wrap `JSON.parse()` in try/catch in case the stored value is corrupted

</details>

<details>
<summary>Solution</summary>

```js
// composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)

  let initial = defaultValue
  if (stored !== null) {
    try {
      initial = JSON.parse(stored)
    } catch {
      initial = defaultValue
    }
  }

  const data = ref(initial)

  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return data
}
```

</details>

#### Exercise 8: Search Filter Component

Build a `SearchFilter.vue` component that:
- Accepts an `items` prop (array of strings)
- Shows a search input
- Displays only items matching the search query (case-insensitive)
- Shows the count of matching vs. total items

<details>
<summary>Hints</summary>

- Use `ref('')` for the search query
- Use `computed()` to filter the items
- Use `String.toLowerCase()` and `String.includes()` for case-insensitive matching

</details>

<details>
<summary>Solution</summary>

```vue
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
})

const query = ref('')

const filteredItems = computed(() => {
  const q = query.value.toLowerCase()
  if (!q) return props.items
  return props.items.filter((item) => item.toLowerCase().includes(q))
})
</script>

<template>
  <div>
    <input v-model="query" placeholder="Search..." />
    <p>{{ filteredItems.length }} / {{ items.length }} items</p>

    <ul>
      <li v-for="(item, index) in filteredItems" :key="index">
        {{ item }}
      </li>
    </ul>

    <p v-if="filteredItems.length === 0">No matching items.</p>
  </div>
</template>
```

</details>

---

## Resources

- [Vue 3 Documentation](https://vuejs.org/guide/introduction.html) — official guide, covers everything
- [Vue 3 Interactive Tutorial](https://vuejs.org/tutorial/) — learn by doing in the browser
- [Vue SFC Playground](https://play.vuejs.org/) — experiment with components online
- [Composition API FAQ](https://vuejs.org/guide/extras/composition-api-faq.html) — why Composition API over Options API
- [Vue 3 Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html) — how the reactivity system works under the hood
