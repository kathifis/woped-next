# npm & Vite

## Why npm & Vite?

Modern web projects consist of dozens (or hundreds) of third-party packages plus your own source files. **npm** (Node Package Manager) handles installing, updating, and removing those packages. **Vite** turns your source code into something the browser can run — during development it serves files instantly with hot-module replacement (HMR), and for production it bundles everything into optimized static assets.

WoPeD Next uses **npm** as its package manager and **Vite 7** as its build tool.

---

## Key Concepts

### 1. package.json

The `package.json` file is the manifest of the project. Here is the WoPeD Next version (shortened):

```json
{
  "name": "woped-next",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "dependencies": {
    "vue": "^3.5.24",
    "pinia": "^3.0.4",
    "vue-i18n": "^11.2.8"
  },
  "devDependencies": {
    "vite": "^7.2.4",
    "vitest": "^4.0.18"
  }
}
```

| Field | Purpose |
|---|---|
| `name` | Project identifier (used by npm if you ever publish). |
| `private: true` | Prevents accidental publishing to the npm registry. |
| `type: "module"` | Tells Node.js to treat `.js` files as ES modules (`import`/`export` syntax instead of `require`). |
| `scripts` | Shortcuts you run with `npm run <name>`. |
| `dependencies` | Packages needed at runtime (shipped to users). |
| `devDependencies` | Packages needed only during development and build (not shipped). |

#### Semantic Versioning

Package versions follow [semver](https://semver.org/) — `MAJOR.MINOR.PATCH`:

| Prefix | Meaning | Example (`^3.5.24`) |
|---|---|---|
| `^` (caret) | Allow minor + patch updates | `>=3.5.24 <4.0.0` |
| `~` (tilde) | Allow patch updates only | `>=3.5.24 <3.6.0` |
| none | Exact version | `3.5.24` only |

The caret (`^`) is the default and what WoPeD Next uses. It lets npm install newer compatible versions while avoiding breaking changes.

---

### 2. npm Commands

| Command | What it does |
|---|---|
| `npm install` | Installs all packages listed in `package.json`. Creates `node_modules/` and updates `package-lock.json`. |
| `npm ci` | Clean install — deletes `node_modules/`, then installs **exactly** the versions from `package-lock.json`. Use this in CI pipelines and when you want a reproducible build. |
| `npm run dev` | Runs the `dev` script → starts the Vite dev server. |
| `npm run build` | Runs the `build` script → creates an optimized production bundle in `dist/`. |
| `npm run test` | Starts Vitest in watch mode. |
| `npm run test:run` | Runs all tests once and exits. |
| `npm install <package>` | Adds a package to `dependencies`. |
| `npm install -D <package>` | Adds a package to `devDependencies`. |

---

### 3. node_modules and package-lock.json

**`node_modules/`** is the folder where npm places all installed packages. It can contain thousands of files and is often hundreds of megabytes. It must **not** be committed to Git — it is listed in `.gitignore`.

**`package-lock.json`** records the exact version of every installed package (including transitive dependencies). It **must** be committed. This guarantees that every developer and every CI run uses identical versions.

> **Rule of thumb:** commit `package-lock.json`, never commit `node_modules/`.

---

### 4. Vite

Vite is the build tool that powers the development experience and the production build.

#### Dev Server with HMR

Run `npm run dev` and Vite starts a local server (usually `http://localhost:5173`). When you edit a file, Vite pushes the change to the browser in milliseconds — no full page reload needed. This is called **Hot Module Replacement (HMR)**.

#### Production Build

`npm run build` bundles, tree-shakes, and minifies your code into the `dist/` folder, ready for deployment.

#### The Vite Config

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/woped-next/' : '/',
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
})
```

| Option | Purpose |
|---|---|
| `base` | The public base path. In production the app is served under `/woped-next/` (GitHub Pages), in development it is `/`. |
| `plugins: [vue()]` | Enables Vite to understand `.vue` single-file components. |
| `resolve.alias` | The `@` alias maps to the `src/` directory, so you can write `import Foo from '@/components/Foo.vue'` instead of fragile relative paths like `../../components/Foo.vue`. |

#### How Plugins Work

Vite plugins hook into the build pipeline. `@vitejs/plugin-vue` teaches Vite how to parse `<template>`, `<script>`, and `<style>` blocks inside `.vue` files. Other plugins can add features like automatic imports, SVG handling, or CSS framework integration (the project uses `@tailwindcss/postcss` for Tailwind CSS).

---

### 5. Project Structure

```
woped-next/
  src/
    components/    -- Vue components
    stores/        -- Pinia stores
    services/      -- Business logic
    types/         -- TypeScript type definitions
    i18n/          -- Translations
    __tests__/     -- Test files
    assets/        -- Static assets (processed by Vite)
  public/          -- Served as-is (not processed by Vite)
  docs/            -- Documentation
```

- **`src/`** — all application source code lives here. The `@` alias points to this folder.
- **`public/`** — files placed here are copied to the build output unchanged (favicons, robots.txt, etc.).
- **`docs/`** — project documentation (like this file).

---

## Exercises

### Starter

1. Run `npm install` followed by `npm run dev`. Open the URL shown in the terminal (usually `http://localhost:5173`) and verify the app loads.
2. Open `package.json` and find the exact Vue version range used in the project.
3. Open `src/main.js`, add `console.log('HMR works!')` somewhere, save the file, and check the browser console — the message should appear without a page reload.

### Standard

4. Install a new package and use it:
   ```bash
   npm install lodash-es
   ```
   Then import a function in any component (e.g. `import { capitalize } from 'lodash-es'`) and use it. Verify it works in the browser. Afterwards, remove it again with `npm uninstall lodash-es`.
5. Add a custom npm script to `package.json`:
   ```json
   "hello": "echo \"Hello WoPeD\""
   ```
   Run it with `npm run hello` and check the output.
6. Create a new file `src/utils/greet.js` that exports a function. Import it in a component using the `@` alias (`import { greet } from '@/utils/greet'`) and confirm it works.

### Challenge

7. Open `vite.config.js` and add a second alias so that `@components` resolves to `src/components/`:
   ```javascript
   alias: {
     '@': fileURLToPath(new URL('./src', import.meta.url)),
     '@components': fileURLToPath(new URL('./src/components', import.meta.url))
   }
   ```
   Use the new alias in an import and verify it works.
8. Write a short explanation (3–5 sentences) of the difference between `npm install` and `npm ci`. When would you use each one?

---

## Resources

- [npm documentation](https://docs.npmjs.com/)
- [Vite guide](https://vite.dev/guide/)
- [Semantic Versioning](https://semver.org/)
