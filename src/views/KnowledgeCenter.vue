<script setup>
import { ref, computed } from 'vue'
import KnowledgeCard from '../components/knowledge/KnowledgeCard.vue'
import KnowledgeCategory from '../components/knowledge/KnowledgeCategory.vue'
import { knowledgeTopics } from '../data/knowledge/index.js'

const activeCategory = ref('全部')

// 分类筛选列表由数据自动生成，新增主题无需改动页面
const categories = computed(() => [
  '全部',
  ...new Set(knowledgeTopics.map((t) => t.category)),
])

const filtered = computed(() =>
  activeCategory.value === '全部'
    ? knowledgeTopics
    : knowledgeTopics.filter((t) => t.category === activeCategory.value)
)

function selectCategory(cat) {
  activeCategory.value = cat
}

function openCard(route) {
  if (route) location.hash = '#' + route
}
</script>

<template>
  <main class="kc-page">
    <header class="kc-header">
      <h1 class="kc-title">知识中心</h1>
      <p class="kc-sub">记录技术学习过程，构建个人知识体系。</p>
    </header>

    <div class="kc-filters">
      <KnowledgeCategory
        v-for="c in categories"
        :key="c"
        :label="c"
        :active="activeCategory === c"
        @select="selectCategory"
      />
    </div>

    <div class="kc-grid">
      <KnowledgeCard
        v-for="t in filtered"
        :key="t.title"
        v-bind="t"
        @open="openCard"
      />
    </div>

    <p v-if="filtered.length === 0" class="kc-empty">暂无该分类下的知识卡片</p>
  </main>
</template>

<style scoped>
.kc-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 24px 60px;
  background: var(--bg-primary);
  min-height: calc(100vh - 64px);
}

.kc-header {
  text-align: center;
  margin-bottom: 40px;
}
.kc-title {
  margin: 0 0 10px;
  font-size: 34px;
  color: var(--text-primary);
}
.kc-sub {
  margin: 0;
  font-size: 15px;
  color: var(--text-muted);
}

.kc-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.kc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.kc-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 0;
}

@media (max-width: 1100px) {
  .kc-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 860px) {
  .kc-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .kc-grid {
    grid-template-columns: 1fr;
  }
  .kc-page {
    padding: 60px 16px 40px;
  }
}
</style>
