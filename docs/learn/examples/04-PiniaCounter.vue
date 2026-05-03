<!--
  Learning Module 04 — Pinia State Management: Counter

  To try this example:
  1. Make sure Pinia is installed and registered in main.ts:
       import { createPinia } from 'pinia'
       app.use(createPinia())
  2. Copy this file to src/components/examples/04-PiniaCounter.vue
  3. Import and use it in App.vue: <PiniaCounter />

  The Pinia store is defined INLINE (setup/composition syntax)
  so everything lives in one file — no separate store module needed.
-->
<script setup>
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

const useCounterStore = defineStore('example-counter', () => {
  const count = ref(0)
  const history = ref([])

  const doubleCount = computed(() => count.value * 2)
  const sign = computed(() => {
    if (count.value > 0) return 'positive'
    if (count.value < 0) return 'negative'
    return 'zero'
  })

  function increment() {
    count.value++
    history.value.push(`+ Incremented to ${count.value}`)
  }

  function decrement() {
    count.value--
    history.value.push(`- Decremented to ${count.value}`)
  }

  function reset() {
    count.value = 0
    history.value.push('Reset to 0')
  }

  return { count, doubleCount, sign, history, increment, decrement, reset }
})

const store = useCounterStore()
const { count, doubleCount, sign, history } = storeToRefs(store)
</script>

<template>
  <div class="counter-app">
    <h2>Pinia Counter</h2>

    <div class="display">
      <span class="count">{{ count }}</span>
      <span class="badge" :class="sign">{{ sign }}</span>
    </div>

    <p class="derived">Double: <strong>{{ doubleCount }}</strong></p>

    <div class="actions">
      <button class="btn" @click="store.decrement()">- 1</button>
      <button class="btn reset" @click="store.reset()">Reset</button>
      <button class="btn" @click="store.increment()">+ 1</button>
    </div>

    <div v-if="history.length" class="history">
      <h3>Action History</h3>
      <ul>
        <li v-for="(entry, i) in history" :key="i">{{ entry }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.counter-app {
  max-width: 360px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
  text-align: center;
}

.display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.count {
  font-size: 3rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.badge {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
.badge.positive { background: #e8f5e9; color: #2e7d32; }
.badge.negative { background: #ffebee; color: #c62828; }
.badge.zero     { background: #f5f5f5; color: #757575; }

.derived {
  color: #666;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn {
  padding: 0.5rem 1.25rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.15s;
}
.btn:hover { background: #f5f5f5; }
.btn.reset { color: #e53935; border-color: #e53935; }

.history {
  margin-top: 2rem;
  text-align: left;
}

.history h3 {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.history ul {
  list-style: none;
  padding: 0;
  max-height: 160px;
  overflow-y: auto;
}

.history li {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  color: #555;
  border-left: 2px solid #ddd;
  margin-bottom: 0.25rem;
}
</style>
