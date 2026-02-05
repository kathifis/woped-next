<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePetriNetStore } from '@/stores/petriNet'
import { fileService } from '@/services/file/fileService'
import { imageExporter } from '@/services/file/imageExporter'
import { FORMAT_NAMES, FILE_EXTENSIONS } from '@/types/file-formats'

const store = usePetriNetStore()
const { net } = storeToRefs(store)

// Menu state
const showMenu = ref(false)
const showExportSubmenu = ref(false)
const isLoading = ref(false)
const error = ref('')

// Export options
const includeLayout = ref(true)

// Close menu when clicking outside
const handleClickOutside = (e) => {
  if (!e.target.closest('.file-menu')) {
    showMenu.value = false
    showExportSubmenu.value = false
  }
}

// New file
const handleNew = () => {
  if (confirm('Create a new empty net? Unsaved changes will be lost.')) {
    store.newNet()
  }
  showMenu.value = false
}

// Open file
const handleOpen = async () => {
  showMenu.value = false
  error.value = ''
  
  const file = await fileService.openFilePicker('.pnml,.json')
  if (!file) return
  
  isLoading.value = true
  try {
    const result = await fileService.importFile(file)
    
    if (result.success && result.net) {
      store.loadNet(result.net)
      
      if (result.warnings.length > 0) {
        console.warn('Import warnings:', result.warnings)
      }
    } else {
      error.value = result.errors.map(e => e.message).join('\n')
      alert('Import failed:\n' + error.value)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    alert('Import error: ' + error.value)
  } finally {
    isLoading.value = false
  }
}

// Save as PNML
const handleSavePNML = async () => {
  showMenu.value = false
  showExportSubmenu.value = false
  
  try {
    await fileService.exportToFile(net.value, {
      format: 'pnml',
      includeLayout: includeLayout.value,
      includeMetadata: true,
      filename: `${net.value.name}.pnml`,
    })
  } catch (e) {
    alert('Export error: ' + (e instanceof Error ? e.message : 'Unknown error'))
  }
}

// Save as JSON
const handleSaveJSON = async () => {
  showMenu.value = false
  showExportSubmenu.value = false
  
  try {
    await fileService.exportToFile(net.value, {
      format: 'json',
      includeLayout: includeLayout.value,
      includeMetadata: true,
      filename: `${net.value.name}.json`,
    })
  } catch (e) {
    alert('Export error: ' + (e instanceof Error ? e.message : 'Unknown error'))
  }
}

// Export as SVG
const handleExportSVG = async () => {
  showMenu.value = false
  showExportSubmenu.value = false
  
  try {
    const svg = imageExporter.exportSVG(net.value)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    downloadBlob(blob, `${net.value.name}.svg`)
  } catch (e) {
    alert('Export error: ' + (e instanceof Error ? e.message : 'Unknown error'))
  }
}

// Export as PNG
const handleExportPNG = async () => {
  showMenu.value = false
  showExportSubmenu.value = false
  
  isLoading.value = true
  try {
    const blob = await imageExporter.exportPNG(net.value, 2)
    downloadBlob(blob, `${net.value.name}.png`)
  } catch (e) {
    alert('Export error: ' + (e instanceof Error ? e.message : 'Unknown error'))
  } finally {
    isLoading.value = false
  }
}

// Helper to download blob
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Toggle menu
const toggleMenu = () => {
  showMenu.value = !showMenu.value
  if (!showMenu.value) {
    showExportSubmenu.value = false
  }
}
</script>

<template>
  <div class="file-menu" @click.stop>
    <button 
      class="menu-trigger"
      :class="{ active: showMenu }"
      @click="toggleMenu"
    >
      <span class="icon">📁</span>
      <span class="label">File</span>
      <span class="arrow">▾</span>
    </button>

    <div v-if="showMenu" class="menu-dropdown">
      <button class="menu-item" @click="handleNew">
        <span class="item-icon">📄</span>
        <span class="item-label">New</span>
        <span class="item-shortcut">Ctrl+N</span>
      </button>

      <button class="menu-item" @click="handleOpen" :disabled="isLoading">
        <span class="item-icon">📂</span>
        <span class="item-label">Open...</span>
        <span class="item-shortcut">Ctrl+O</span>
      </button>

      <div class="menu-separator"></div>

      <button class="menu-item" @click="handleSavePNML">
        <span class="item-icon">💾</span>
        <span class="item-label">Save as PNML</span>
        <span class="item-shortcut">Ctrl+S</span>
      </button>

      <button class="menu-item" @click="handleSaveJSON">
        <span class="item-icon">💾</span>
        <span class="item-label">Save as JSON</span>
      </button>

      <div class="menu-separator"></div>

      <div 
        class="menu-item has-submenu"
        @mouseenter="showExportSubmenu = true"
        @mouseleave="showExportSubmenu = false"
      >
        <span class="item-icon">📤</span>
        <span class="item-label">Export</span>
        <span class="submenu-arrow">▸</span>

        <div v-if="showExportSubmenu" class="submenu">
          <button class="menu-item" @click="handleExportSVG">
            <span class="item-icon">🖼️</span>
            <span class="item-label">SVG Image</span>
          </button>
          <button class="menu-item" @click="handleExportPNG" :disabled="isLoading">
            <span class="item-icon">🖼️</span>
            <span class="item-label">PNG Image</span>
          </button>
        </div>
      </div>

      <div class="menu-separator"></div>

      <label class="menu-checkbox">
        <input type="checkbox" v-model="includeLayout" />
        <span>Include Layout</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.file-menu {
  position: relative;
}

.menu-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background-color: transparent;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-trigger:hover,
.menu-trigger.active {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
}

.menu-trigger .icon {
  font-size: 16px;
}

.menu-trigger .arrow {
  font-size: 10px;
  margin-left: 2px;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 220px;
  overflow: hidden;
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.1s ease;
  text-align: left;
}

.menu-item:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.has-submenu {
  position: relative;
}

.item-icon {
  width: 20px;
  text-align: center;
}

.item-label {
  flex: 1;
}

.item-shortcut {
  font-size: 11px;
  color: #9ca3af;
}

.submenu-arrow {
  font-size: 10px;
  color: #9ca3af;
}

.submenu {
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 4px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  overflow: hidden;
  padding: 4px 0;
}

.menu-separator {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
}

.menu-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.menu-checkbox input {
  cursor: pointer;
}
</style>
