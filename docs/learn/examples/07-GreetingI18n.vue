<!--
  07-GreetingI18n.vue — vue-i18n internationalization example

  How to run:
    1. Copy this file to src/components/examples/07-GreetingI18n.vue
    2. In src/App.vue, import and render it:
       <script setup>
       import GreetingI18n from './components/examples/07-GreetingI18n.vue'
       </script>
       <template><GreetingI18n /></template>
    3. Open http://localhost:5173

  This component uses useI18n() with LOCAL messages so it's fully
  self-contained — no global i18n key registration needed.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({
  messages: {
    en: {
      greeting: 'Hello!',
      welcome: 'Welcome to the i18n example.',
      description: 'This component demonstrates how vue-i18n handles translations, locale switching, and dynamic interpolation.',
      currentLocale: 'Current locale',
      formTitle: 'Contact Form',
      nameLabel: 'Name',
      namePlaceholder: 'Enter your name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      submit: 'Submit',
      messagesCount: 'You have {count} message | You have {count} messages',
      addMessage: 'Add message',
      resetMessages: 'Reset',
      submitted: 'Form submitted!',
    },
    de: {
      greeting: 'Hallo!',
      welcome: 'Willkommen beim i18n-Beispiel.',
      description: 'Diese Komponente zeigt, wie vue-i18n Übersetzungen, Sprachwechsel und dynamische Interpolation handhabt.',
      currentLocale: 'Aktuelle Sprache',
      formTitle: 'Kontaktformular',
      nameLabel: 'Name',
      namePlaceholder: 'Geben Sie Ihren Namen ein',
      emailLabel: 'E-Mail',
      emailPlaceholder: 'du@beispiel.de',
      submit: 'Absenden',
      messagesCount: 'Du hast {count} Nachricht | Du hast {count} Nachrichten',
      addMessage: 'Nachricht hinzufügen',
      resetMessages: 'Zurücksetzen',
      submitted: 'Formular abgesendet!',
    },
  },
})

const name = ref('')
const email = ref('')
const messageCount = ref(1)
const showSubmitted = ref(false)

function toggleLocale() {
  locale.value = locale.value === 'en' ? 'de' : 'en'
}

function onSubmit() {
  showSubmitted.value = true
  setTimeout(() => (showSubmitted.value = false), 2000)
}
</script>

<template>
  <div class="i18n-demo">
    <header class="demo-header">
      <h1>{{ t('greeting') }}</h1>
      <button class="locale-toggle" @click="toggleLocale">
        {{ locale === 'en' ? '🇩🇪 DE' : '🇬🇧 EN' }}
      </button>
    </header>

    <p class="welcome">{{ t('welcome') }}</p>
    <p class="description">{{ t('description') }}</p>

    <div class="locale-badge">
      {{ t('currentLocale') }}: <code>{{ locale }}</code>
    </div>

    <!-- Contact form with translated labels -->
    <section class="form-card">
      <h2>{{ t('formTitle') }}</h2>
      <form @submit.prevent="onSubmit">
        <label>
          {{ t('nameLabel') }}
          <input v-model="name" type="text" :placeholder="t('namePlaceholder')" />
        </label>
        <label>
          {{ t('emailLabel') }}
          <input v-model="email" type="email" :placeholder="t('emailPlaceholder')" />
        </label>
        <button type="submit">{{ t('submit') }}</button>
      </form>
      <p v-if="showSubmitted" class="submitted-msg">✓ {{ t('submitted') }}</p>
    </section>

    <!-- Pluralization / interpolation demo -->
    <section class="counter-card">
      <p class="count-text">{{ t('messagesCount', { count: messageCount }, messageCount) }}</p>
      <div class="counter-controls">
        <button @click="messageCount++">+ {{ t('addMessage') }}</button>
        <button @click="messageCount = 0">{{ t('resetMessages') }}</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.i18n-demo { max-width: 480px; margin: 2rem auto; font-family: Inter, system-ui, sans-serif; color: #1a1a2e; }
.demo-header { display: flex; justify-content: space-between; align-items: center; }
.demo-header h1 { font-size: 1.75rem; margin: 0; }
.locale-toggle {
  padding: 0.4rem 1rem; border: 2px solid #4361ee; border-radius: 6px;
  background: white; color: #4361ee; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.locale-toggle:hover { background: #4361ee; color: white; }
.welcome { font-size: 1.1rem; color: #4361ee; margin: 0.5rem 0 0.25rem; }
.description { color: #555; font-size: 0.9rem; margin: 0 0 1rem; }
.locale-badge { display: inline-block; background: #eef1ff; padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.locale-badge code { font-weight: 700; color: #4361ee; }
.form-card, .counter-card { background: #f8f9ff; border: 1px solid #dde; border-radius: 10px; padding: 1.25rem; margin-bottom: 1rem; }
.form-card h2 { margin: 0 0 0.75rem; font-size: 1.15rem; }
.form-card label { display: block; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.6rem; }
.form-card input { display: block; width: 100%; margin-top: 0.2rem; padding: 0.45rem 0.6rem; border: 1px solid #ccc; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
.form-card button { margin-top: 0.5rem; padding: 0.5rem 1.5rem; background: #4361ee; color: white; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
.form-card button:hover { background: #3a56d4; }
.submitted-msg { color: #16a34a; font-weight: 600; margin: 0.5rem 0 0; }
.count-text { font-size: 1.1rem; font-weight: 500; margin: 0 0 0.75rem; }
.counter-controls { display: flex; gap: 0.5rem; }
.counter-controls button { padding: 0.4rem 1rem; border: 1px solid #4361ee; border-radius: 6px; background: white; color: #4361ee; font-size: 0.85rem; cursor: pointer; }
.counter-controls button:hover { background: #4361ee; color: white; }
</style>
