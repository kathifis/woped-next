<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const configStore = useConfigStore()
const { general, editor, tokenGame, analysis, language } = storeToRefs(configStore)

// Active tab
const activeTab = ref('general')

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'editor', label: 'Editor' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'analysis', label: 'Analysis' },
]

// Local copies for editing
const localGeneral = ref({ ...general.value })
const localEditor = ref({ ...editor.value })
const localTokenGame = ref({ ...tokenGame.value })
const localAnalysis = ref({ ...analysis.value })
const localLanguage = ref({ ...language.value })

// Reset local values when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      localGeneral.value = { ...general.value }
      localEditor.value = { ...editor.value }
      localTokenGame.value = { ...tokenGame.value }
      localAnalysis.value = { ...analysis.value }
      localLanguage.value = { ...language.value }
    }
  }
)

// Save all settings
const saveSettings = () => {
  configStore.updateGeneral(localGeneral.value)
  configStore.updateEditor(localEditor.value)
  configStore.updateTokenGame(localTokenGame.value)
  configStore.updateAnalysis(localAnalysis.value)
  configStore.updateLanguage(localLanguage.value)
  emit('close')
}

// Cancel and close
const cancel = () => {
  emit('close')
}

// Reset to defaults
const resetDefaults = () => {
  configStore.reset()
  localGeneral.value = { ...general.value }
  localEditor.value = { ...editor.value }
  localTokenGame.value = { ...tokenGame.value }
  localAnalysis.value = { ...analysis.value }
  localLanguage.value = { ...language.value }
}

// Handle escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    cancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="dialog-overlay"
      @click.self="cancel"
      @keydown="handleKeydown"
    >
      <div class="dialog" role="dialog" aria-labelledby="settings-title">
        <!-- Header -->
        <div class="dialog-header">
          <h2 id="settings-title">Settings</h2>
          <button class="close-btn" @click="cancel" aria-label="Close">×</button>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Content -->
        <div class="dialog-content">
          <!-- General Tab -->
          <div v-show="activeTab === 'general'" class="tab-content">
            <div class="setting-group">
              <h3>Appearance</h3>
              <div class="setting-row">
                <label>Theme</label>
                <select v-model="localGeneral.theme">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>

            <div class="setting-group">
              <h3>Language</h3>
              <div class="setting-row">
                <label>Language</label>
                <select v-model="localLanguage.locale">
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

            <div class="setting-group">
              <h3>Auto-Save</h3>
              <div class="setting-row">
                <label>Enable Auto-Save</label>
                <input type="checkbox" v-model="localGeneral.autoSave" />
              </div>
              <div class="setting-row" v-if="localGeneral.autoSave">
                <label>Interval (seconds)</label>
                <input
                  type="number"
                  v-model.number="localGeneral.autoSaveInterval"
                  min="10000"
                  max="600000"
                  step="10000"
                />
                <span class="hint">{{ Math.round(localGeneral.autoSaveInterval / 1000) }}s</span>
              </div>
            </div>
          </div>

          <!-- Editor Tab -->
          <div v-show="activeTab === 'editor'" class="tab-content">
            <div class="setting-group">
              <h3>Grid</h3>
              <div class="setting-row">
                <label>Show Grid</label>
                <input type="checkbox" v-model="localEditor.showGrid" />
              </div>
              <div class="setting-row">
                <label>Snap to Grid</label>
                <input type="checkbox" v-model="localEditor.snapToGrid" />
              </div>
              <div class="setting-row">
                <label>Grid Size (px)</label>
                <input
                  type="number"
                  v-model.number="localEditor.gridSize"
                  min="10"
                  max="50"
                  step="5"
                />
              </div>
            </div>

            <div class="setting-group">
              <h3>Display</h3>
              <div class="setting-row">
                <label>Show Labels</label>
                <input type="checkbox" v-model="localEditor.showLabels" />
              </div>
              <div class="setting-row">
                <label>Show Token Numbers</label>
                <input type="checkbox" v-model="localEditor.showTokenNumbers" />
              </div>
              <div class="setting-row">
                <label>Default Zoom (%)</label>
                <input
                  type="number"
                  v-model.number="localEditor.defaultZoom"
                  min="0.25"
                  max="3"
                  step="0.25"
                />
                <span class="hint">{{ Math.round(localEditor.defaultZoom * 100) }}%</span>
              </div>
            </div>

            <div class="setting-group">
              <h3>Animation</h3>
              <div class="setting-row">
                <label>Animation Duration (ms)</label>
                <input
                  type="number"
                  v-model.number="localEditor.animationDuration"
                  min="0"
                  max="1000"
                  step="50"
                />
              </div>
            </div>
          </div>

          <!-- Simulation Tab -->
          <div v-show="activeTab === 'simulation'" class="tab-content">
            <div class="setting-group">
              <h3>Token Game</h3>
              <div class="setting-row">
                <label>Default Speed (ms)</label>
                <input
                  type="number"
                  v-model.number="localTokenGame.defaultSpeed"
                  min="100"
                  max="5000"
                  step="100"
                />
              </div>
              <div class="setting-row">
                <label>Show Animations</label>
                <input type="checkbox" v-model="localTokenGame.showAnimations" />
              </div>
              <div class="setting-row">
                <label>Highlight Enabled Transitions</label>
                <input type="checkbox" v-model="localTokenGame.highlightEnabled" />
              </div>
            </div>

            <div class="setting-group">
              <h3>Conflict Resolution</h3>
              <div class="setting-row">
                <label>Default Mode</label>
                <select v-model="localTokenGame.conflictResolution">
                  <option value="manual">Manual</option>
                  <option value="random">Random</option>
                  <option value="first">First Available</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Analysis Tab -->
          <div v-show="activeTab === 'analysis'" class="tab-content">
            <div class="setting-group">
              <h3>State Space</h3>
              <div class="setting-row">
                <label>Maximum States</label>
                <input
                  type="number"
                  v-model.number="localAnalysis.maxStates"
                  min="100"
                  max="10000"
                  step="100"
                />
              </div>
            </div>

            <div class="setting-group">
              <h3>Behavior</h3>
              <div class="setting-row">
                <label>Auto-Analyze on Change</label>
                <input type="checkbox" v-model="localAnalysis.autoAnalyze" />
              </div>
              <div class="setting-row">
                <label>Show Info Messages</label>
                <input type="checkbox" v-model="localAnalysis.showInfoMessages" />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="dialog-footer">
          <button class="btn-reset" @click="resetDefaults">Reset to Defaults</button>
          <div class="footer-actions">
            <button class="btn-cancel" @click="cancel">Cancel</button>
            <button class="btn-save" @click="saveSettings">Save</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tab {
  padding: 12px 16px;
  border: none;
  background: none;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: white;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-group h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-row label {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.setting-row input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.setting-row input[type='number'],
.setting-row select {
  width: 120px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.setting-row input[type='number']:focus,
.setting-row select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.hint {
  font-size: 12px;
  color: #6b7280;
  min-width: 50px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.btn-reset {
  padding: 8px 14px;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
}

.btn-reset:hover {
  color: #dc2626;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-save {
  padding: 8px 20px;
  border: none;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.btn-save:hover {
  background: #2563eb;
}

/* Dark mode support */
:global(.dark) .dialog {
  background: #1f2937;
}

:global(.dark) .dialog-header {
  border-color: #374151;
}

:global(.dark) .dialog-header h2 {
  color: #f9fafb;
}

:global(.dark) .close-btn {
  color: #9ca3af;
}

:global(.dark) .close-btn:hover {
  background: #374151;
  color: #f9fafb;
}

:global(.dark) .tabs {
  background: #111827;
  border-color: #374151;
}

:global(.dark) .tab {
  color: #9ca3af;
}

:global(.dark) .tab:hover {
  color: #f9fafb;
}

:global(.dark) .tab.active {
  background: #1f2937;
}

:global(.dark) .setting-group h3 {
  color: #d1d5db;
}

:global(.dark) .setting-row label {
  color: #d1d5db;
}

:global(.dark) .setting-row input[type='number'],
:global(.dark) .setting-row select {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

:global(.dark) .dialog-footer {
  background: #111827;
  border-color: #374151;
}

:global(.dark) .btn-cancel {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

:global(.dark) .btn-cancel:hover {
  background: #4b5563;
}
</style>
