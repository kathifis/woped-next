<!--
  Learning Module 05 — Vue-Konva: Petri Net Canvas

  To try this example:
  1. Install dependencies: npm install konva vue-konva
  2. Register the plugin in main.ts:
       import VueKonva from 'vue-konva'
       app.use(VueKonva)
  3. Copy this file to src/components/examples/05-PetriNetCanvas.vue
  4. Import and use it in App.vue: <PetriNetCanvas />

  Shows a simple net: P1 -> T1 -> P2 with one token in P1.
  Drag elements to rearrange; click to select (highlights in blue).
-->
<script setup>
import { ref, computed } from 'vue'

const PLACE_R = 30
const TRANS_W = 20
const TRANS_H = 60
const TOKEN_R = 6

const stageConfig = { width: 540, height: 320 }

const p1 = ref({ x: 100, y: 160 })
const t1 = ref({ x: 270, y: 160 })
const p2 = ref({ x: 440, y: 160 })
const selected = ref(null)

function select(id) {
  selected.value = selected.value === id ? null : id
}

function strokeFor(id) {
  return selected.value === id ? '#1976d2' : '#333'
}

// Compute the distance from an element's center to its edge
// along a given direction. For rects, finds the actual edge intersection.
function edgeOffset(nx, ny, isRect) {
  if (!isRect) return PLACE_R
  const ax = Math.abs(nx) || 0.0001
  const ay = Math.abs(ny) || 0.0001
  return Math.min((TRANS_W / 2) / ax, (TRANS_H / 2) / ay)
}

function makeArcConfig(from, to, fromIsRect, toIsRect) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = dx / len
  const ny = dy / len
  const r1 = edgeOffset(nx, ny, fromIsRect)
  const r2 = edgeOffset(nx, ny, toIsRect)
  return {
    points: [from.x + nx * r1, from.y + ny * r1, to.x - nx * r2, to.y - ny * r2],
    stroke: '#555',
    strokeWidth: 2,
    fill: '#555',
    pointerLength: 10,
    pointerWidth: 7,
    listening: false,
  }
}

const arc1 = computed(() => makeArcConfig(p1.value, t1.value, false, true))
const arc2 = computed(() => makeArcConfig(t1.value, p2.value, true, false))

function onDrag(e, pos) {
  pos.value = { x: e.target.x(), y: e.target.y() }
}
</script>

<template>
  <div class="petri-canvas">
    <h2>Petri Net Canvas</h2>
    <p class="hint">Drag places and transitions to rearrange. Click to select.</p>
    <div class="stage-wrapper">
      <v-stage :config="stageConfig">
        <v-layer>
          <!-- Arcs (rendered first so they appear behind shapes) -->
          <v-arrow :config="arc1" />
          <v-arrow :config="arc2" />

          <!-- Place P1 with 1 token -->
          <v-group
            :config="{ x: p1.x, y: p1.y, draggable: true }"
            @dragmove="(e) => onDrag(e, p1)"
          >
            <v-circle
              :config="{ radius: PLACE_R, fill: '#fff', stroke: strokeFor('p1'), strokeWidth: 2 }"
              @click="() => select('p1')"
            />
            <v-circle :config="{ radius: TOKEN_R, fill: '#333', listening: false }" />
            <v-text :config="{ text: 'P1', x: -9, y: PLACE_R + 6, fontSize: 14, fill: '#666' }" />
          </v-group>

          <!-- Transition T1 -->
          <v-group
            :config="{ x: t1.x, y: t1.y, draggable: true }"
            @dragmove="(e) => onDrag(e, t1)"
          >
            <v-rect
              :config="{
                x: -TRANS_W / 2, y: -TRANS_H / 2,
                width: TRANS_W, height: TRANS_H,
                fill: '#444', stroke: strokeFor('t1'), strokeWidth: 2,
              }"
              @click="() => select('t1')"
            />
            <v-text :config="{ text: 'T1', x: -9, y: TRANS_H / 2 + 6, fontSize: 14, fill: '#666' }" />
          </v-group>

          <!-- Place P2 (empty — no tokens) -->
          <v-group
            :config="{ x: p2.x, y: p2.y, draggable: true }"
            @dragmove="(e) => onDrag(e, p2)"
          >
            <v-circle
              :config="{ radius: PLACE_R, fill: '#fff', stroke: strokeFor('p2'), strokeWidth: 2 }"
              @click="() => select('p2')"
            />
            <v-text :config="{ text: 'P2', x: -10, y: PLACE_R + 6, fontSize: 14, fill: '#666' }" />
          </v-group>
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<style scoped>
.petri-canvas {
  max-width: 560px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
}

.hint {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.75rem;
}

.stage-wrapper {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
}
</style>
