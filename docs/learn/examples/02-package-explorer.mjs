/**
 * Learning Module 02 — npm & Vite: Package Explorer
 * Run: node docs/learn/examples/02-package-explorer.mjs
 *
 * This script reads the project's package.json and displays
 * useful information about the project structure and dependencies.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '../../..')
const pkgPath = resolve(projectRoot, 'package.json')

if (!existsSync(pkgPath)) {
  console.error(`Could not find package.json at: ${pkgPath}`)
  console.error('Make sure you run this from the woped-next directory.')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

console.log('=== WoPeD Next — Package Explorer ===\n')

console.log(`Project: ${pkg.name}`)
console.log(`Version: ${pkg.version}`)
console.log(`Type:    ${pkg.type ?? 'commonjs'}`)
console.log(`Private: ${pkg.private ? 'yes (not published to npm)' : 'no'}`)

console.log('\n--- npm Scripts ---')
if (pkg.scripts) {
  const maxLen = Math.max(...Object.keys(pkg.scripts).map((k) => k.length))
  for (const [name, cmd] of Object.entries(pkg.scripts)) {
    console.log(`  npm run ${name.padEnd(maxLen)}  →  ${cmd}`)
  }
}

console.log('\n--- Dependencies (runtime) ---')
if (pkg.dependencies) {
  for (const [name, version] of Object.entries(pkg.dependencies)) {
    const prefix = version.startsWith('^') ? 'compatible with' : version.startsWith('~') ? 'patch updates of' : 'exactly'
    console.log(`  ${name.padEnd(25)} ${version.padEnd(10)} (${prefix} ${version.replace(/[\^~]/, '')})`)
  }
}

console.log('\n--- Dev Dependencies (build/test only) ---')
if (pkg.devDependencies) {
  for (const [name, version] of Object.entries(pkg.devDependencies)) {
    console.log(`  ${name.padEnd(25)} ${version}`)
  }
}

console.log('\n--- Quick Analysis ---')
const depCount = Object.keys(pkg.dependencies ?? {}).length
const devDepCount = Object.keys(pkg.devDependencies ?? {}).length
console.log(`  Runtime dependencies:     ${depCount}`)
console.log(`  Dev dependencies:         ${devDepCount}`)
console.log(`  Total packages:           ${depCount + devDepCount}`)

const hasLockFile = existsSync(resolve(projectRoot, 'package-lock.json'))
const hasNodeModules = existsSync(resolve(projectRoot, 'node_modules'))
console.log(`  package-lock.json exists: ${hasLockFile ? 'yes' : 'no — run npm install!'}`)
console.log(`  node_modules exists:      ${hasNodeModules ? 'yes' : 'no — run npm install!'}`)

console.log('\n✓ Package exploration complete!')
