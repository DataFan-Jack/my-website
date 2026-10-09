<script setup>
defineProps({
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])
</script>

<template>
  <button class="k-cat" :class="{ active }" @click="emit('select', label)">
    {{ label }}
  </button>
</template>

<style scoped>
.k-cat {
  padding: 7px 18px;
  font-size: 14px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.k-cat:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
}
.k-cat.active {
  color: var(--bg-primary);
  background: var(--accent-color);
  border-color: var(--accent-color);
  font-weight: 600;
}
</style>
