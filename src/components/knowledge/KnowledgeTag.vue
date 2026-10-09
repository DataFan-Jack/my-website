<script setup>
defineProps({
  text: { type: String, required: true },
})
</script>

<template>
  <span class="k-tag">{{ text }}</span>
</template>

<style scoped>
.k-tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  color: var(--accent-color);
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  white-space: nowrap;
}
</style>
