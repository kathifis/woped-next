# Tailwind CSS

## Why Tailwind?

Tailwind CSS is a utility-first framework — instead of writing custom CSS classes, you apply small, single-purpose classes directly in your HTML. This keeps styles co-located with markup, eliminates naming debates, and makes it fast to build and iterate on UI. WoPeD Next uses Tailwind v4 with PostCSS for all styling.

## Key Concepts

### 1. Utility Classes

Each class does one thing. You compose them to build complete designs:

```html
<div class="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
  <span class="text-lg font-semibold text-gray-800">Hello</span>
  <button class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click me
  </button>
</div>
```

Common categories:

| Category | Examples |
|----------|----------|
| Layout | `flex`, `grid`, `block`, `hidden` |
| Spacing | `p-4`, `px-2`, `m-auto`, `gap-3` |
| Sizing | `w-full`, `h-10`, `max-w-md`, `min-h-screen` |
| Typography | `text-lg`, `font-bold`, `text-center`, `leading-tight` |
| Colors | `bg-blue-500`, `text-gray-700`, `border-red-300` |
| Borders | `rounded`, `rounded-lg`, `border`, `border-2` |
| Effects | `shadow`, `shadow-lg`, `opacity-50` |
| Interactivity | `hover:bg-blue-600`, `focus:ring-2`, `cursor-pointer` |

### 2. Responsive Design

Tailwind uses mobile-first breakpoint prefixes. Unprefixed classes apply to all screen sizes; prefixed classes apply at that breakpoint and above:

```html
<!-- Stack vertically on mobile, horizontal row on medium screens and up -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="w-full md:w-1/3">Sidebar</div>
  <div class="w-full md:w-2/3">Content</div>
</div>
```

| Prefix | Min width | Typical device |
|--------|-----------|----------------|
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

### 3. Dark Mode

Tailwind's `dark:` prefix applies styles when dark mode is active. WoPeD Next uses CSS variables for theming, so dark mode often switches variable values rather than individual classes:

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <p class="text-gray-600 dark:text-gray-400">
    This adapts to the active theme.
  </p>
</div>
```

In the project, you'll often see CSS variables used alongside Tailwind:

```html
<div class="bg-[var(--color-bg)] text-[var(--color-text)]">
  Themed content
</div>
```

### 4. Common Patterns

**Centering content:**

```html
<div class="flex items-center justify-center h-screen">
  <p>Centered</p>
</div>
```

**Spacing children evenly:**

```html
<div class="flex gap-4">
  <button>One</button>
  <button>Two</button>
  <button>Three</button>
</div>
```

**Truncating text:**

```html
<p class="truncate w-48">This very long text will be cut off with an ellipsis</p>
```

**Visually hidden but accessible:**

```html
<span class="sr-only">Screen reader only text</span>
```

### 5. Custom CSS Variables

WoPeD Next defines theme colors as CSS variables so that switching between light and dark mode only requires changing variable values. You'll find these in the project's CSS:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #3b82f6;
  --color-border: #e5e7eb;
}

.dark {
  --color-bg: #1a1a2e;
  --color-text: #e5e7eb;
  --color-primary: #60a5fa;
  --color-border: #374151;
}
```

Use them in Tailwind with the arbitrary value syntax:

```html
<div class="bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]">
  Themed component
</div>
```

### 6. Tailwind v4 Changes

Tailwind v4 introduces a CSS-first configuration model. Key differences from v3:

- **No `tailwind.config.js`** — configuration lives in CSS using the `@theme` directive
- **Automatic content detection** — no need to specify `content` paths
- **CSS-native `@theme`** — define design tokens directly in CSS:

```css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --font-display: 'Inter', sans-serif;
}
```

- **`@import "tailwindcss"`** replaces the old `@tailwind` directives
- Built-in support for CSS cascade layers

## Project Example

A typical WoPeD Next component using Tailwind:

```vue
<template>
  <div class="flex flex-col h-full bg-[var(--color-bg)]">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]">
      <h1 class="text-lg font-semibold text-[var(--color-text)]">
        {{ $t('menu.file') }}
      </h1>
      <button class="px-3 py-1 rounded bg-[var(--color-primary)] text-white hover:opacity-90">
        {{ $t('common.save') }}
      </button>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-auto p-4">
      <slot />
    </main>
  </div>
</template>
```

Notice the pattern:

- Layout uses `flex`, `flex-col`, `h-full`
- Spacing uses `px-4`, `py-2`, `p-4`
- Colors reference CSS variables for theme support
- Interactive states use `hover:` prefix

## Exercises

### Starter: Card Component

Create a card component with:

- Padding (`p-6`)
- Rounded corners (`rounded-lg`)
- A shadow (`shadow-md`)
- Centered text (`text-center`)
- A title in large bold text and a description in smaller gray text

```vue
<template>
  <!-- Build your card here -->
  <div class="...">
    <h2 class="...">Card Title</h2>
    <p class="...">Card description goes here.</p>
  </div>
</template>
```

### Standard: Responsive Toolbar with Dark Mode

Build a toolbar component that:

1. Displays horizontally (`flex-row`) on desktop (`md:` and above)
2. Displays vertically (`flex-col`) on mobile
3. Has 4-5 tool buttons with icons or labels
4. Supports dark mode — light background by default, dark background with `dark:` classes
5. Buttons have hover effects

### Challenge: Properties Panel

Create a properties panel (like the right sidebar in a design tool) with:

1. A panel header with a title and close button
2. At least 4 form fields, each with a label and input (text, number, select, checkbox)
3. Labels and inputs aligned in a consistent grid layout
4. Proper spacing between form groups
5. Full dark mode support using CSS variables
6. Responsive: full-width on mobile, fixed-width sidebar on desktop

Aim for something like:

```
┌─────────────────────┐
│ Properties        ✕ │
├─────────────────────┤
│ Name   [________]   │
│ Width  [___120__]   │
│ Height [____80__]   │
│ Color  [▼ Blue  ]   │
│ ☑ Visible           │
└─────────────────────┘
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS Playground](https://play.tailwindcss.com/)
