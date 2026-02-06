<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { usePetriNetStore } from '@/stores/petriNet'

const { t } = useI18n()
const store = usePetriNetStore()
const { breadcrumbItems, canGoBack, isInSubProcess } = storeToRefs(store)

const handleNavigate = (netId) => {
  store.navigateTo(netId)
}

const handleGoBack = () => {
  store.goBack()
}
</script>

<template>
  <div v-if="isInSubProcess" class="breadcrumb-nav">
    <button 
      class="back-btn"
      :disabled="!canGoBack"
      :title="$t('subprocess.goBack')"
      @click="handleGoBack"
    >
      ←
    </button>
    
    <div class="breadcrumb-path">
      <span class="breadcrumb-icon">📍</span>
      <template v-for="(item, index) in breadcrumbItems" :key="item.id">
        <button 
          class="breadcrumb-item"
          :class="{ active: index === breadcrumbItems.length - 1 }"
          @click="handleNavigate(item.id)"
        >
          {{ item.name }}
        </button>
        <span v-if="index < breadcrumbItems.length - 1" class="separator">›</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-bg-secondary, #f3f4f6);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  font-size: 13px;
}

:global(.dark) .breadcrumb-nav {
  background: var(--color-bg-secondary, #1f2937);
  border-color: var(--color-border, #374151);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 4px;
  background: var(--color-bg, #ffffff);
  color: var(--color-text, #374151);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
}

:global(.dark) .back-btn {
  background: var(--color-bg, #111827);
  border-color: var(--color-border, #4b5563);
  color: var(--color-text, #e5e7eb);
}

.back-btn:hover:not(:disabled) {
  background: var(--color-primary, #3b82f6);
  border-color: var(--color-primary, #3b82f6);
  color: white;
}

.back-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.breadcrumb-path {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.breadcrumb-icon {
  margin-right: 4px;
}

.breadcrumb-item {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-primary, #3b82f6);
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}

.breadcrumb-item:hover {
  background: var(--color-bg-hover, #e5e7eb);
}

:global(.dark) .breadcrumb-item:hover {
  background: var(--color-bg-hover, #374151);
}

.breadcrumb-item.active {
  color: var(--color-text, #111827);
  font-weight: 600;
  cursor: default;
}

:global(.dark) .breadcrumb-item.active {
  color: var(--color-text, #f3f4f6);
}

.breadcrumb-item.active:hover {
  background: transparent;
}

.separator {
  color: var(--color-text-muted, #9ca3af);
  font-size: 14px;
}
</style>
