<!--
  08-TailwindCard.vue — Tailwind CSS utility classes example

  How to run:
    1. Copy this file to src/components/examples/08-TailwindCard.vue
    2. In src/App.vue, import and render it:
       <script setup>
       import TailwindCard from './components/examples/08-TailwindCard.vue'
       </script>
       <template><TailwindCard /></template>
    3. Open http://localhost:5173

  Tailwind is already configured in the WoPeD Next app.
  No <style> block needed — everything is utility classes.
-->

<script setup lang="ts">
import { ref } from 'vue'

const darkMode = ref(false)
const email = ref('')
const subscribed = ref(false)

function toggleDark() {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark', darkMode.value)
}

function onSubscribe() {
  if (!email.value) return
  subscribed.value = true
  setTimeout(() => {
    subscribed.value = false
    email.value = ''
  }, 2500)
}

const cheatSheet = [
  { cls: 'p-6', desc: 'Padding 1.5rem on all sides' },
  { cls: 'rounded-xl', desc: 'Border-radius 0.75rem' },
  { cls: 'shadow-lg', desc: 'Large box-shadow' },
  { cls: 'hover:scale-105', desc: 'Scale up 5% on hover' },
  { cls: 'transition-transform', desc: 'Animate transform changes' },
  { cls: 'dark:bg-gray-800', desc: 'Dark-mode background' },
  { cls: 'md:grid-cols-3', desc: '3 columns on medium+ screens' },
  { cls: 'focus:ring-2', desc: '2px focus ring on inputs' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 font-sans transition-colors duration-300">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Tailwind CSS Cards
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Responsive card grid with dark mode support
        </p>
      </div>
      <button
        class="px-4 py-2 rounded-lg font-medium text-sm border-2 transition-colors"
        :class="darkMode
          ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900'
          : 'border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white'"
        @click="toggleDark"
      >
        {{ darkMode ? '☀️ Light Mode' : '🌙 Dark Mode' }}
      </button>
    </div>

    <!-- Card Grid -->
    <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1: Basic -->
      <div
        class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg
               hover:shadow-xl transition-shadow duration-200"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Basic Card
        </h2>
        <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          A simple card with padding, rounded corners, and a shadow.
          Hover to see the shadow deepen. This pattern is the foundation
          of most Tailwind card layouts.
        </p>
        <div class="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <span class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">p-6</span>
          <span class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">rounded-xl</span>
          <span class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">shadow-lg</span>
        </div>
      </div>

      <!-- Card 2: Badge + Hover Effect -->
      <div
        class="p-6 bg-gradient-to-br from-indigo-500 to-purple-600
               rounded-xl shadow-lg text-white
               hover:scale-105 transition-transform duration-200 cursor-pointer"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Featured</h2>
          <span
            class="bg-white/20 backdrop-blur text-xs font-medium
                   px-2.5 py-1 rounded-full"
          >
            NEW
          </span>
        </div>
        <p class="text-indigo-100 text-sm leading-relaxed">
          Gradient background, translucent badge, and a scale-up
          hover effect. Tailwind makes these patterns composable
          without writing any custom CSS.
        </p>
        <div class="mt-4 flex items-center gap-2 text-xs text-indigo-200">
          <span class="bg-white/10 px-2 py-0.5 rounded">from-indigo-500</span>
          <span class="bg-white/10 px-2 py-0.5 rounded">hover:scale-105</span>
        </div>
      </div>

      <!-- Card 3: Form -->
      <div
        class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg
               flex flex-col justify-between"
      >
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Subscribe
          </h2>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Enter your email to get updates. This card shows form styling
            with focus rings and responsive button states.
          </p>
        </div>
        <form @submit.prevent="onSubscribe" class="space-y-3">
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300
                   dark:border-gray-600 dark:bg-gray-700 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-indigo-400
                   placeholder:text-gray-400"
          />
          <button
            type="submit"
            class="w-full py-2 text-sm font-medium rounded-lg transition-colors
                   bg-indigo-600 text-white hover:bg-indigo-700
                   disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!email"
          >
            {{ subscribed ? '✓ Subscribed!' : 'Subscribe' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Cheat Sheet -->
    <div class="max-w-4xl mx-auto mt-10">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Tailwind Cheat Sheet
      </h2>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow p-4
               grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm"
      >
        <div
          v-for="item in cheatSheet"
          :key="item.cls"
          class="flex items-center gap-2 py-1"
        >
          <code
            class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600
                   dark:text-indigo-300 px-2 py-0.5 rounded text-xs font-mono
                   whitespace-nowrap"
          >
            {{ item.cls }}
          </code>
          <span class="text-gray-600 dark:text-gray-400">{{ item.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
