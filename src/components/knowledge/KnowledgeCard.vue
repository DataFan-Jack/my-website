<script setup>
import KnowledgeTag from './KnowledgeTag.vue'

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  category: { type: String, default: '' },
  tags: { type: Array, default: () => [] },
  description: { type: String, default: '' },
  chapterCount: { type: String, default: '' },
  level: { type: String, default: '' },
  route: { type: String, default: '' },
  buttonText: { type: String, default: '查看笔记' },
})
const emit = defineEmits(['open'])

function open() {
  emit('open', props.route)
}
</script>

<template>
  <article class="k-card" @click="open">
    <div class="k-head">
      <span class="k-icon">{{ icon }}</span>
      <div class="k-title-box">
        <h3 class="k-title">{{ title }}</h3>
        <span class="k-category">{{ category }}</span>
      </div>
    </div>

    <div class="k-tags">
      <KnowledgeTag v-for="t in tags" :key="t" :text="t" />
    </div>

    <p class="k-desc">{{ description }}</p>

    <div class="k-foot">
      <span class="k-meta">
        <span class="k-chapter">{{ chapterCount }} 章节</span>
        <span class="k-level">{{ level }}</span>
      </span>
      <button class="k-btn" @click.stop="open">{{ buttonText }}</button>
    </div>
  </article>
</template>

<style scoped>
.k-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  height: 260px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.k-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-color);
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.12);
}

.k-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.k-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 26px;
  line-height: 1;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}
.k-title-box {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.k-title {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}
.k-category {
  font-size: 12px;
  color: var(--accent-color);
}

.k-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.k-desc {
  flex: 1;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.k-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.k-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.k-chapter {
  font-size: 12px;
  color: var(--text-muted);
}
.k-level {
  font-size: 12px;
  letter-spacing: 1px;
}
.k-btn {
  padding: 6px 14px;
  font-size: 13px;
  color: var(--accent-color);
  background: transparent;
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.k-btn:hover {
  background: var(--accent-color);
  color: var(--bg-primary);
}
</style>
