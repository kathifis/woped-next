<!--
  Learning Module 03 — Vue 3 Basics: Todo App

  To try this example:
  1. Copy this file to src/components/examples/03-TodoApp.vue
  2. Import it in App.vue: import TodoApp from './components/examples/03-TodoApp.vue'
  3. Use it in the template: <TodoApp />
-->
<script setup>
import { ref, computed } from 'vue'

const newTodo = ref('')
const todos = ref([
  { id: 1, text: 'Learn Vue 3 reactivity', done: false },
  { id: 2, text: 'Build a Petri net editor', done: false },
  { id: 3, text: 'Write unit tests', done: true },
])
let nextId = 4

const remaining = computed(() => todos.value.filter(t => !t.done).length)
const completed = computed(() => todos.value.filter(t => t.done).length)

function addTodo() {
  const text = newTodo.value.trim()
  if (!text) return
  todos.value.push({ id: nextId++, text, done: false })
  newTodo.value = ''
}

function toggleTodo(todo) {
  todo.done = !todo.done
}

function removeTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}

function clearCompleted() {
  todos.value = todos.value.filter(t => !t.done)
}
</script>

<template>
  <div class="todo-app">
    <h2>Todo App</h2>

    <form class="add-form" @submit.prevent="addTodo">
      <input
        v-model="newTodo"
        placeholder="What needs to be done?"
        class="todo-input"
      />
      <button type="submit" class="btn add-btn">Add</button>
    </form>

    <ul v-if="todos.length" class="todo-list">
      <li
        v-for="todo in todos"
        :key="todo.id"
        class="todo-item"
        :class="{ done: todo.done }"
      >
        <span class="todo-text" @click="toggleTodo(todo)">
          {{ todo.done ? '\u2713' : '\u25CB' }} {{ todo.text }}
        </span>
        <button class="btn remove-btn" @click="removeTodo(todo.id)">&times;</button>
      </li>
    </ul>
    <p v-else class="empty-msg">No todos yet — add one above!</p>

    <div class="stats">
      <span>{{ remaining }} remaining &middot; {{ completed }} completed</span>
      <button
        v-if="completed > 0"
        class="btn clear-btn"
        @click="clearCompleted"
      >
        Clear completed
      </button>
    </div>
  </div>
</template>

<style scoped>
.todo-app {
  max-width: 420px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
}

.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-btn {
  background: #4caf50;
  color: white;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.todo-item.done .todo-text {
  text-decoration: line-through;
  opacity: 0.5;
}

.todo-text {
  cursor: pointer;
  user-select: none;
}

.remove-btn {
  background: transparent;
  color: #e53935;
  font-size: 1.2rem;
  padding: 0 0.5rem;
}

.stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.clear-btn {
  background: #eee;
  color: #333;
  font-size: 0.8rem;
}

.empty-msg {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}
</style>
