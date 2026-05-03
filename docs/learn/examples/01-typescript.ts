/**
 * Learning Module 01 — TypeScript Basics
 * Run: npx tsx docs/learn/examples/01-typescript.ts
 */

// --- 1. Type Annotations ---

const appName: string = 'WoPeD Next'
const version: number = 3.0
const isReady: boolean = true

function greet(name: string, excited: boolean = false): string {
  const suffix = excited ? '!' : '.'
  return `Welcome to ${name}${suffix}`
}

console.log('=== Type Annotations ===')
console.log(greet(appName))
console.log(greet(appName, true))

// --- 2. Interfaces ---

interface Position {
  x: number
  y: number
}

interface PetriNetElement {
  id: string
  name: string
  position: Position
  tokens?: number
}

const place: PetriNetElement = {
  id: 'p1',
  name: 'Start',
  position: { x: 100, y: 200 },
  tokens: 1,
}

const transition: PetriNetElement = {
  id: 't1',
  name: 'Process',
  position: { x: 250, y: 200 },
}

console.log('\n=== Interfaces ===')
console.log(`Place: ${place.name} at (${place.position.x}, ${place.position.y}) with ${place.tokens ?? 0} tokens`)
console.log(`Transition: ${transition.name} at (${transition.position.x}, ${transition.position.y})`)

// --- 3. Union Types & Literal Types ---

type ElementType = 'place' | 'transition' | 'arc'
type ToolMode = 'select' | 'place' | 'transition' | 'arc'

interface TypedElement extends PetriNetElement {
  type: ElementType
}

const elements: TypedElement[] = [
  { id: 'p1', name: 'Start', type: 'place', position: { x: 0, y: 0 }, tokens: 1 },
  { id: 't1', name: 'Work', type: 'transition', position: { x: 100, y: 0 } },
  { id: 'p2', name: 'End', type: 'place', position: { x: 200, y: 0 }, tokens: 0 },
]

function filterByType(items: TypedElement[], type: ElementType): TypedElement[] {
  return items.filter((el) => el.type === type)
}

console.log('\n=== Union Types ===')
console.log(`All elements: ${elements.map((e) => e.name).join(', ')}`)
console.log(`Places only: ${filterByType(elements, 'place').map((e) => e.name).join(', ')}`)

// --- 4. Generics ---

function first<T>(items: T[]): T | undefined {
  return items[0]
}

function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of items) {
    const group = String(item[key])
    if (!result[group]) result[group] = []
    result[group].push(item)
  }
  return result
}

console.log('\n=== Generics ===')
console.log(`First element: ${first(elements)?.name}`)
console.log(`First number: ${first([42, 7, 13])}`)

const grouped = groupBy(elements, 'type')
for (const [type, items] of Object.entries(grouped)) {
  console.log(`  ${type}: ${items.map((e) => e.name).join(', ')}`)
}

// --- 5. Type Guards ---

interface Place extends TypedElement {
  type: 'place'
  tokens: number
}

interface Transition extends TypedElement {
  type: 'transition'
}

function isPlace(el: TypedElement): el is Place {
  return el.type === 'place'
}

function describeElement(el: TypedElement): string {
  if (isPlace(el)) {
    return `Place "${el.name}" with ${el.tokens} token(s)`
  }
  return `Transition "${el.name}"`
}

console.log('\n=== Type Guards ===')
for (const el of elements) {
  console.log(`  ${describeElement(el)}`)
}

console.log('\n✓ All TypeScript examples ran successfully!')
