# vue-konva — Canvas Rendering

## Why vue-konva?

Standard HTML and CSS work well for documents and UI panels, but they struggle with complex interactive graphics — hundreds of shapes that need to be drawn, dragged, connected, and transformed in real time. A `<canvas>` element handles this efficiently, but its imperative API (calling draw commands in sequence) clashes with Vue's declarative, reactive style.

**Konva.js** is a 2D canvas library that provides a scene-graph model (stages, layers, shapes) with built-in hit detection, drag & drop, and event handling. **vue-konva** wraps Konva for Vue, letting you declare shapes in templates just like HTML elements — and they stay reactive.

WoPeD Next uses **vue-konva 3.3** (Konva 10.2) for the Petri net editor canvas. Every place, transition, arc, and label you see on the canvas is a Konva shape rendered through vue-konva components.

---

## Key Concepts

### 1. Stage, Layer, Shapes

vue-konva mirrors Konva's scene-graph hierarchy:

```
v-stage          ← the canvas container (one per editor)
  v-layer        ← a drawing layer (one or more)
    v-rect       ← shapes live inside layers
    v-circle
    v-line
    ...
```

| Component | Purpose |
|---|---|
| `<v-stage>` | The root canvas container. Requires `width` and `height` in its config. Maps to a `<div>` with a `<canvas>` inside. |
| `<v-layer>` | A drawing layer. Use multiple layers to separate concerns (e.g. grid layer, elements layer, selection layer). Each layer is its own canvas. |
| `<v-rect>` | Rectangle shape. |
| `<v-circle>` | Circle shape. |
| `<v-line>` | Polyline / polygon. Defined by a flat array of points `[x1, y1, x2, y2, ...]`. |
| `<v-arrow>` | Line with an arrowhead at the end. |
| `<v-text>` | Text label. |
| `<v-group>` | Groups multiple shapes so they move and transform together. |

**Minimal example:**

```vue
<template>
  <v-stage :config="{ width: 800, height: 600 }">
    <v-layer>
      <v-circle :config="{ x: 200, y: 200, radius: 30, fill: 'white', stroke: 'black', strokeWidth: 2 }" />
    </v-layer>
  </v-stage>
</template>
```

---

### 2. The `:config` Pattern

Every vue-konva component accepts a single `:config` prop — an object containing all Konva node properties. This is different from standard Vue components where each prop is passed individually.

```vue
<v-rect :config="{
  x: 50,
  y: 100,
  width: 40,
  height: 60,
  fill: 'black',
  stroke: '#333',
  strokeWidth: 1,
  cornerRadius: 2,
}" />
```

Common properties shared by all shapes:

| Property | Type | Description |
|---|---|---|
| `x`, `y` | `number` | Position (top-left for rects, center for circles). |
| `fill` | `string` | Fill color. |
| `stroke` | `string` | Border/line color. |
| `strokeWidth` | `number` | Border/line thickness. |
| `opacity` | `number` | 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Show or hide the shape. |
| `draggable` | `boolean` | Whether the user can drag the shape. |
| `rotation` | `number` | Rotation in degrees. |

You will typically compute config objects from your state:

```javascript
const placeConfig = computed(() => ({
  x: place.value.x,
  y: place.value.y,
  radius: 25,
  fill: 'white',
  stroke: isSelected.value ? '#1976d2' : 'black',
  strokeWidth: isSelected.value ? 3 : 2,
  draggable: true,
}))
```

---

### 3. Events

Konva shapes emit events that you handle with the standard Vue `@` syntax:

```vue
<v-circle
  :config="circleConfig"
  @click="handleClick"
  @mouseenter="handleMouseEnter"
  @mouseleave="handleMouseLeave"
/>
```

The event handler receives a Konva event object:

```javascript
function handleClick(e) {
  const node = e.target          // the Konva.Circle node
  const pos = node.position()    // { x, y }
  const stage = node.getStage()  // access the stage
}
```

**Common events:**

| Event | Fires when… |
|---|---|
| `@click` | Shape is clicked (mouse down + up on same target). |
| `@dblclick` | Shape is double-clicked. |
| `@mouseenter` / `@mouseleave` | Cursor enters/leaves the shape. |
| `@dragstart` / `@dragmove` / `@dragend` | Drag lifecycle. |
| `@mousedown` / `@mouseup` | Low-level pointer events. |

To handle clicks on the empty canvas (background), listen on the `<v-stage>`:

```vue
<v-stage :config="stageConfig" @click="handleStageClick">
```

Inside the handler, check `e.target === e.target.getStage()` to distinguish background clicks from shape clicks that bubbled up.

---

### 4. Drag & Drop

Enable dragging by setting `draggable: true` in a shape's config. Then use the `@dragend` event to persist the new position back to your state:

```vue
<script setup>
import { ref } from 'vue'

const position = ref({ x: 100, y: 150 })

function onDragEnd(e) {
  position.value = {
    x: e.target.x(),
    y: e.target.y(),
  }
}
</script>

<template>
  <v-stage :config="{ width: 800, height: 600 }">
    <v-layer>
      <v-circle
        :config="{ ...position, radius: 25, fill: 'white', stroke: 'black', draggable: true }"
        @dragend="onDragEnd"
      />
    </v-layer>
  </v-stage>
</template>
```

**Snap to grid** — round coordinates to the nearest grid cell in the drag handler:

```javascript
function onDragEnd(e) {
  const gridSize = 20
  position.value = {
    x: Math.round(e.target.x() / gridSize) * gridSize,
    y: Math.round(e.target.y() / gridSize) * gridSize,
  }
}
```

After updating `position`, the `:config` binding re-renders the shape at the snapped coordinates.

---

### 5. Groups

`<v-group>` bundles multiple shapes into a single unit. Moving or transforming the group affects all children.

This is essential for Petri net elements — a place is a circle plus a label (and possibly a token count), treated as one draggable entity:

```vue
<v-group :config="{ x: place.x, y: place.y, draggable: true }" @dragend="onDragEnd">
  <v-circle :config="{ radius: 25, fill: 'white', stroke: 'black', strokeWidth: 2 }" />
  <v-text :config="{ text: place.name, y: 30, fontSize: 12, align: 'center', offsetX: 20, width: 40 }" />
  <v-text
    v-if="place.tokens > 0"
    :config="{ text: String(place.tokens), fontSize: 14, fontStyle: 'bold', align: 'center', offsetX: 5, offsetY: 7 }"
  />
</v-group>
```

When a group is dragged, child shapes keep their relative positions. The group's `x`/`y` acts as the origin for all children (children use local coordinates, not absolute canvas coordinates).

---

### 6. Reactivity

vue-konva config objects are fully reactive. When a `ref` or `computed` value changes, the canvas updates automatically — no manual redraw needed.

```javascript
const radius = ref(25)
const circleConfig = computed(() => ({
  x: 200,
  y: 200,
  radius: radius.value,
  fill: 'white',
  stroke: 'black',
}))

// Later: changing radius re-renders the circle
radius.value = 40
```

This is how the editor works: the Pinia store holds Petri net element data (positions, names, tokens). Components derive their Konva configs from store state via `computed()`. When the store changes — through user interaction, undo/redo, or file loading — the canvas updates reactively.

---

### 7. Registration

vue-konva is registered as a Vue plugin in the application entry point:

```javascript
import { createApp } from 'vue'
import VueKonva from 'vue-konva'
import App from './App.vue'

const app = createApp(App)
app.use(VueKonva)
app.mount('#app')
```

After registration, all `v-*` shape components (`v-stage`, `v-layer`, `v-rect`, etc.) are available globally — no per-component imports needed.

---

## Project Example

The `EditorGrid` component draws a background grid on the canvas using vue-konva:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  gridSize: { type: Number, default: 20 },
  offsetX: { type: Number, default: 0 },
  offsetY: { type: Number, default: 0 },
  gridColor: { type: String, default: '#e0e0e0' },
  visible: { type: Boolean, default: true },
})

const gridLines = computed(() => {
  const lines = []
  const oX = props.offsetX % props.gridSize
  const oY = props.offsetY % props.gridSize
  for (let x = oX; x < props.width; x += props.gridSize) {
    lines.push({ points: [x, 0, x, props.height], stroke: props.gridColor, strokeWidth: 0.5 })
  }
  for (let y = oY; y < props.height; y += props.gridSize) {
    lines.push({ points: [0, y, props.width, y], stroke: props.gridColor, strokeWidth: 0.5 })
  }
  return lines
})
</script>

<template>
  <v-layer :config="{ visible }">
    <v-line v-for="(line, index) in gridLines" :key="`grid-${index}`" :config="line" />
  </v-layer>
</template>
```

**How it works:**

1. The component receives the canvas dimensions and grid settings as props.
2. `gridLines` is a `computed` array — every time `width`, `height`, `offsetX`, `offsetY`, or `gridSize` changes, the line configs are recalculated.
3. Each grid line is a `<v-line>` with a `points` array defining its start and end coordinates.
4. The offset calculation (`props.offsetX % props.gridSize`) ensures the grid stays aligned when the user pans the canvas.
5. The entire layer can be toggled with the `visible` prop.

**In the editor, this grid layer sits behind the element layers:**

```vue
<v-stage :config="stageConfig">
  <editor-grid :width="stageWidth" :height="stageHeight" :grid-size="20" />
  <v-layer>
    <!-- Petri net elements rendered here -->
  </v-layer>
  <v-layer>
    <!-- Selection highlights, temporary arcs -->
  </v-layer>
</v-stage>
```

---

## Mapping Petri Net Concepts to vue-konva

| Petri Net Element | vue-konva Shape | Key Config Properties |
|---|---|---|
| Place | `<v-circle>` | `radius`, `fill: 'white'`, `stroke: 'black'` |
| Transition | `<v-rect>` | `width`, `height`, `fill: 'black'` |
| Arc | `<v-arrow>` | `points: [x1, y1, x2, y2]`, `pointerLength`, `pointerWidth` |
| Token (inside place) | `<v-circle>` (small) or `<v-text>` | `radius: 4, fill: 'black'` or token count as text |
| Label | `<v-text>` | `text`, `fontSize`, `align` |

A complete place element as a group:

```vue
<v-group :config="{ x: 200, y: 150, draggable: true }">
  <!-- The place circle -->
  <v-circle :config="{ radius: 25, fill: 'white', stroke: 'black', strokeWidth: 2 }" />
  <!-- Token dot (shown when tokens = 1) -->
  <v-circle :config="{ radius: 4, fill: 'black' }" />
  <!-- Label below -->
  <v-text :config="{ text: 'p1', y: 30, fontSize: 12, offsetX: 8 }" />
</v-group>
```

---

## Exercises

### Starter

**1.** Create a component with a `<v-stage>` (800×600) and a single `<v-layer>`. Draw a blue rectangle (100×60 at position 50, 50) and a red circle (radius 30 at position 300, 200).

```vue
<!-- Your code here -->
```

<details>
<summary>Hint</summary>

```vue
<template>
  <v-stage :config="{ width: 800, height: 600 }">
    <v-layer>
      <v-rect :config="{ x: 50, y: 50, width: 100, height: 60, fill: 'blue' }" />
      <v-circle :config="{ x: 300, y: 200, radius: 30, fill: 'red' }" />
    </v-layer>
  </v-stage>
</template>
```

</details>

**2.** Add a `<v-text>` label beneath the red circle that displays the word "Place". Center it horizontally under the circle.

<details>
<summary>Hint</summary>

Use `align: 'center'` and an `offsetX` equal to half the `width` you give the text node. Position its `y` below the circle's center + radius.

```vue
<v-text :config="{ x: 300, y: 240, text: 'Place', fontSize: 14, align: 'center', width: 60, offsetX: 30 }" />
```

</details>

---

### Standard

**3.** Create a `PetriPlace.vue` component that renders a place: a white circle with a black stroke, a label below, and a token count displayed inside when tokens > 0. Accept props: `x`, `y`, `name`, `tokens`.

```vue
<!-- Your code here -->
```

<details>
<summary>Hint</summary>

```vue
<script setup>
defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  name: { type: String, required: true },
  tokens: { type: Number, default: 0 },
})
</script>

<template>
  <v-group :config="{ x, y }">
    <v-circle :config="{ radius: 25, fill: 'white', stroke: 'black', strokeWidth: 2 }" />
    <v-text v-if="tokens > 0" :config="{ text: String(tokens), fontSize: 14, fontStyle: 'bold', align: 'center', width: 20, offsetX: 10, offsetY: 7 }" />
    <v-text :config="{ text: name, y: 30, fontSize: 12, align: 'center', width: 60, offsetX: 30 }" />
  </v-group>
</template>
```

</details>

**4.** Create a `PetriTransition.vue` component: a black-filled rectangle (40×60) with a white label below. Accept props: `x`, `y`, `name`.

<details>
<summary>Hint</summary>

```vue
<script setup>
defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  name: { type: String, required: true },
})
</script>

<template>
  <v-group :config="{ x, y }">
    <v-rect :config="{ width: 40, height: 60, offsetX: 20, offsetY: 30, fill: 'black' }" />
    <v-text :config="{ text: name, y: 35, fontSize: 12, align: 'center', width: 60, offsetX: 30 }" />
  </v-group>
</template>
```

</details>

**5.** Make the `PetriPlace` component draggable. Emit a `moved` event with the new `{ x, y }` position when the user finishes dragging.

<details>
<summary>Hint</summary>

Add `draggable: true` to the group config, then handle `@dragend`:

```javascript
const emit = defineEmits(['moved'])

function onDragEnd(e) {
  emit('moved', { x: e.target.x(), y: e.target.y() })
}
```

```vue
<v-group :config="{ x, y, draggable: true }" @dragend="onDragEnd">
```

</details>

---

### Challenge

**6.** Build a mini Petri net viewer: define an array of 2 places and 1 transition (with x/y positions). Render them using your components. Connect them with `<v-arrow>` elements. When a place is dragged, the connected arrows should update their endpoints to follow.

<details>
<summary>Hint</summary>

Store elements and arcs in reactive state. Compute arrow points from the current positions of connected elements:

```javascript
const arrowPoints = computed(() => {
  const source = elements.value.find(el => el.id === arc.sourceId)
  const target = elements.value.find(el => el.id === arc.targetId)
  return [source.x, source.y, target.x, target.y]
})
```

When a place emits `moved`, update its position in the array — the computed arrow points will recalculate automatically.

</details>

**7.** Add click-to-select behavior: clicking a shape highlights it (thicker stroke, blue color). Clicking the stage background deselects. Track the selected element ID in a `ref`.

<details>
<summary>Hint</summary>

```javascript
const selectedId = ref(null)

function selectElement(id) {
  selectedId.value = id
}

function deselect(e) {
  if (e.target === e.target.getStage()) {
    selectedId.value = null
  }
}
```

Pass `selectedId` to your shape components and conditionally change their stroke config:

```javascript
stroke: props.id === selectedId.value ? '#1976d2' : 'black',
strokeWidth: props.id === selectedId.value ? 3 : 2,
```

</details>

---

## Resources

- [Konva.js documentation](https://konvajs.org/docs/) — full API reference for all shapes and features
- [vue-konva GitHub](https://github.com/konvajs/vue-konva) — installation, usage guide, and examples
- [Konva demos / sandbox](https://konvajs.org/docs/sandbox/) — interactive examples for drag & drop, hit detection, transformers, and more
