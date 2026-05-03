/**
 * Learning Module 06 — Testing with Vitest
 * Run:
 *   1. cp docs/learn/examples/06-counter.test.ts src/__tests__/
 *   2. npm run test:run
 *   3. rm src/__tests__/06-counter.test.ts
 *
 * This is a self-contained test file that defines a Pinia store
 * and tests it — no external imports needed beyond vitest and pinia.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia, defineStore } from 'pinia'
import { ref, computed } from 'vue'

// --- Define a simple counter store (setup syntax) ---

const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  const isPositive = computed(() => count.value > 0)

  function increment() {
    count.value++
  }

  function decrement() {
    if (count.value > 0) count.value--
  }

  function reset() {
    count.value = 0
  }

  function incrementBy(amount: number) {
    count.value += amount
  }

  return { count, doubleCount, isPositive, increment, decrement, reset, incrementBy }
})

// --- Tests ---

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should start at zero', () => {
      const store = useCounterStore()
      expect(store.count).toBe(0)
    })

    it('should have doubleCount of zero', () => {
      const store = useCounterStore()
      expect(store.doubleCount).toBe(0)
    })

    it('should not be positive', () => {
      const store = useCounterStore()
      expect(store.isPositive).toBe(false)
    })
  })

  describe('increment()', () => {
    it('should increase count by 1', () => {
      const store = useCounterStore()
      store.increment()
      expect(store.count).toBe(1)
    })

    it('should update doubleCount', () => {
      const store = useCounterStore()
      store.increment()
      store.increment()
      expect(store.doubleCount).toBe(4)
    })

    it('should become positive after increment', () => {
      const store = useCounterStore()
      store.increment()
      expect(store.isPositive).toBe(true)
    })
  })

  describe('decrement()', () => {
    it('should decrease count by 1', () => {
      const store = useCounterStore()
      store.incrementBy(5)
      store.decrement()
      expect(store.count).toBe(4)
    })

    it('should not go below zero', () => {
      const store = useCounterStore()
      store.decrement()
      expect(store.count).toBe(0)
    })
  })

  describe('reset()', () => {
    it('should reset count to zero', () => {
      const store = useCounterStore()
      store.incrementBy(42)
      store.reset()
      expect(store.count).toBe(0)
    })
  })

  describe('incrementBy()', () => {
    it('should increase count by given amount', () => {
      const store = useCounterStore()
      store.incrementBy(10)
      expect(store.count).toBe(10)
    })

    it('should work with negative numbers', () => {
      const store = useCounterStore()
      store.incrementBy(5)
      store.incrementBy(-3)
      expect(store.count).toBe(2)
    })
  })
})
