<script setup>
import { ref } from 'vue'
import LifeGuideMarkdown from './LifeGuideMarkdown.vue'

defineProps({
  title: { type: String, default: '' },
  content: { type: String, default: '' },
})
const open = ref(false)
</script>

<template>
  <section class="lg-collapse">
    <button class="lg-collapse-btn" @click="open = !open">
      <span class="lg-collapse-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          class="lg-collapse-arrow" :class="{ open }">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ title }}
      </span>
    </button>
    <div v-show="open" class="lg-collapse-body" :class="{ plain: !content }">
      <LifeGuideMarkdown v-if="content" :markdown="content" />
      <slot v-else />
    </div>
  </section>
</template>

<style scoped>
.lg-collapse {
  margin-top: 14px;
}
.lg-collapse-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(212, 168, 67, 0.06);
  border: 1px solid rgba(212, 168, 67, 0.2);
  border-radius: 8px;
  color: #d4a843;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}
.lg-collapse-btn:hover { background: rgba(212, 168, 67, 0.12); }
.lg-collapse-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.lg-collapse-arrow {
  color: #d4a843;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.lg-collapse-arrow.open { transform: rotate(180deg); }
.lg-collapse-body {
  margin-top: 10px;
  padding: 14px 16px;
  background: rgba(212, 168, 67, 0.04);
  border-left: 2px solid rgba(212, 168, 67, 0.45);
  border-radius: 6px;
}
/* 自定义内容（slot）时不套装饰背景，交由内部元素决定样式 */
.lg-collapse-body.plain {
  padding: 0;
  background: transparent;
  border-left: none;
}
.lg-collapse-body :deep(p) { margin: 0 0 10px; }
.lg-collapse-body :deep(p:last-child) { margin-bottom: 0; }
.lg-collapse-body :deep(ul), .lg-collapse-body :deep(ol) { margin: 0; padding-left: 20px; }
.lg-collapse-body :deep(li) { margin-bottom: 6px; }
.lg-collapse-body :deep(a) { color: #7db8ff; }

/* 浅色模式 */
.page.light-mode .lg-collapse-btn {
  background: #f5f1e6;
  border-color: #e0d5ba;
  color: #b8862e;
}
.page.light-mode .lg-collapse-body {
  background: #faf5ea;
  border-left-color: #b8862e;
}
</style>
