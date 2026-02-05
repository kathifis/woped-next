<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { VISUAL } from '@/types/petri-net'

const props = defineProps({
  transition: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  isEnabled: {
    type: Boolean,
    default: false,
  },
  isTokenGameActive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click', 'dragend'])

const { width, height, strokeWidth } = VISUAL.transition

// Theme colors
const configStore = useConfigStore()

const colors = computed(() => {
  const dark = configStore.isDarkMode
  return {
    fill: dark ? '#1f2937' : '#ffffff',
    stroke: dark ? '#9ca3af' : '#374151',
    selectedStroke: '#3b82f6',
    enabledStroke: '#22c55e',
    enabledFill: dark ? '#166534' : '#dcfce7',
    labelFill: dark ? '#e5e7eb' : '#374151',
  }
})

// Determine stroke color based on state
const strokeColor = computed(() => {
  if (props.isSelected) return colors.value.selectedStroke
  if (props.isEnabled && props.isTokenGameActive) return colors.value.enabledStroke
  return colors.value.stroke
})

// Determine fill color based on state
const fillColor = computed(() => {
  if (props.isEnabled && props.isTokenGameActive) return colors.value.enabledFill
  return colors.value.fill
})

// Rectangle config
const rectConfig = computed(() => ({
  x: props.transition.position.x - width / 2,
  y: props.transition.position.y - height / 2,
  width,
  height,
  fill: fillColor.value,
  stroke: strokeColor.value,
  strokeWidth: props.isSelected ? 3 : (props.isEnabled && props.isTokenGameActive ? 2.5 : strokeWidth),
}))

// Group config for dragging
const groupConfig = computed(() => ({
  x: 0,
  y: 0,
  draggable: props.draggable,
}))

// Label config
const labelConfig = computed(() => ({
  x: props.transition.position.x,
  y: props.transition.position.y + height / 2 + 15,
  text: props.transition.name,
  fontSize: 12,
  fontFamily: 'system-ui, sans-serif',
  fill: colors.value.labelFill,
  align: 'center',
  offsetX: props.transition.name.length * 3,
}))

const handleClick = (e) => {
  emit('click', e)
}

const handleDragEnd = (e) => {
  // Calculate new center position from group position
  const newX = e.target.x() + props.transition.position.x
  const newY = e.target.y() + props.transition.position.y
  
  // Reset group position and emit with calculated center
  e.target.position({ x: 0, y: 0 })
  
  emit('dragend', {
    ...e,
    target: {
      ...e.target,
      x: () => newX,
      y: () => newY,
    },
  })
}
</script>

<template>
  <v-group
    :config="groupConfig"
    @click="handleClick"
    @dragend="handleDragEnd"
  >
    <!-- Main rectangle -->
    <v-rect :config="rectConfig" />

    <!-- Label -->
    <v-text :config="labelConfig" />
  </v-group>
</template>
