# Learning Examples

Runnable examples for each learning module. Each file is self-contained and can be executed directly.

## How to Run

| Example | Command |
|---------|---------|
| 01 TypeScript | `npx tsx docs/learn/examples/01-typescript.ts` |
| 02 npm & Vite | `node docs/learn/examples/02-package-explorer.mjs` |
| 03-08 Vue Components | Copy to `src/components/` and import in `App.vue` (see below) |
| 06 Test | Copy to `src/__tests__/`, then `npm run test:run` (see below) |

## Running the Test Example

Vitest only picks up test files inside `src/`. To run the test example:

1. Copy the file: `cp docs/learn/examples/06-counter.test.ts src/__tests__/`
2. Run: `npm run test:run`
3. Remove it when done: `rm src/__tests__/06-counter.test.ts`

## Running Vue Component Examples

Vue SFC files (`.vue`) need to run inside the app. To try any of them:

1. Copy the file to `src/components/examples/`
2. Open `src/App.vue`
3. Temporarily import and render it:

```vue
<script setup>
import TodoApp from './components/examples/03-TodoApp.vue'
</script>

<template>
  <TodoApp />
</template>
```

4. Open `http://localhost:5173` to see the result
5. Undo your changes when done

## Examples

| # | File | Module | What it demonstrates |
|---|------|--------|---------------------|
| 01 | `01-typescript.ts` | TypeScript | Types, interfaces, generics, type guards |
| 02 | `02-package-explorer.mjs` | npm & Vite | Reading package.json, understanding dependencies |
| 03 | `03-TodoApp.vue` | Vue 3 | ref, computed, v-for, v-model, emits, components |
| 04 | `04-PiniaCounter.vue` | Pinia | Inline store, state, getters, actions, storeToRefs |
| 05 | `05-PetriNetCanvas.vue` | vue-konva | Stage, layers, shapes, drag & drop, events |
| 06 | `06-counter.test.ts` | Testing | describe, it, expect, beforeEach, Pinia store testing |
| 07 | `07-GreetingI18n.vue` | i18n | Translation keys, locale switching, useI18n |
| 08 | `08-TailwindCard.vue` | Tailwind CSS | Utility classes, responsive, dark mode |
