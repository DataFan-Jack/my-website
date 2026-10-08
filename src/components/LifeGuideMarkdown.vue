<script setup>
import { ref, watch } from 'vue'
import { parseMarkdown } from '../lib/markdown.js'
import LifeGuideArticleCard from './LifeGuideArticleCard.vue'
import LifeGuideCollapse from './LifeGuideCollapse.vue'

const props = defineProps({
  markdown: { type: String, default: '' },
  // 可选：给 :::article 卡片传序号（章节内第几条）
  articleIndex: { type: Number, default: 0 },
})

const nodes = ref([])
watch(
  () => props.markdown,
  (md) => {
    nodes.value = parseMarkdown(md || '')
  },
  { immediate: true }
)
</script>

<template>
  <div class="lg-md">
    <template v-for="(n, i) in nodes" :key="i">
      <LifeGuideArticleCard
        v-if="n.type === 'article'"
        :index="articleIndex"
        :data="n.data"
      />
      <LifeGuideCollapse
        v-else-if="n.type === 'collapse'"
        :title="n.data.title"
        :content="n.data.content"
      />
      <div v-else class="lg-md-html" v-html="n.html"></div>
    </template>
  </div>
</template>

<style scoped>
/* 普通 Markdown 内容（文章卡片外的补充文本） */
.lg-md-html {
  color: #c9d1d9;
  font-size: 15px;
  line-height: 1.9;
  user-select: text;
  -webkit-user-select: text;
}
.lg-md-html h1 { font-size: 20px; color: #d4a843; margin: 22px 0 12px; }
.lg-md-html h2 { font-size: 18px; color: #d4a843; margin: 20px 0 10px; }
.lg-md-html h3 { font-size: 16px; color: #d4a843; margin: 18px 0 8px; }
.lg-md-html p { margin: 0 0 14px; }
.lg-md-html strong { color: #f0d878; }
.lg-md-html ul, .lg-md-html ol { margin: 0 0 14px; padding-left: 22px; }
.lg-md-html li { margin-bottom: 6px; }
.lg-md-html blockquote {
  margin: 0 0 14px;
  padding: 10px 14px;
  border-left: 3px solid #d4a843;
  background: rgba(212, 168, 67, 0.06);
  border-radius: 6px;
  color: #c9d1d9;
}
.lg-md-html blockquote p { margin: 0; }
.lg-md-html code {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  color: #a5d6ff;
  font-size: 13px;
  font-family: Consolas, Monaco, monospace;
}
.lg-md-html pre {
  background: #0d0d1a;
  border: 1px solid rgba(212, 168, 67, 0.2);
  border-radius: 8px;
  padding: 14px 16px;
  overflow-x: auto;
  margin: 0 0 14px;
}
.lg-md-html pre code { background: transparent; padding: 0; }
.lg-md-html a { color: #7db8ff; text-decoration: underline; }
.lg-md-html a:hover { color: #a8d0ff; }
.lg-md-html hr { border: none; border-top: 1px solid rgba(212, 168, 67, 0.2); margin: 18px 0; }
.lg-md-html table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 14px;
  font-size: 14px;
}
.lg-md-html th, .lg-md-html td {
  border: 1px solid rgba(212, 168, 67, 0.2);
  padding: 8px 12px;
  text-align: left;
}
.lg-md-html th { background: rgba(212, 168, 67, 0.1); color: #d4a843; }
.lg-md-html td { color: #c9d1d9; }

/* 浅色模式 */
.page.light-mode .lg-md-html { color: #444; }
.page.light-mode .lg-md-html strong { color: #8a6520; }
.page.light-mode .lg-md-html code { background: rgba(0, 0, 0, 0.06); color: #3b4a63; }
.page.light-mode .lg-md-html pre { background: #f0ece0; border-color: #e0d5ba; }
.page.light-mode .lg-md-html th, .page.light-mode .lg-md-html td { border-color: #e0d5ba; }
.page.light-mode .lg-md-html th { background: #f5f1e6; color: #b8862e; }
.page.light-mode .lg-md-html td { color: #444; }
.page.light-mode .lg-md-html a { color: #2f6fd0; }
.page.light-mode .lg-md-html blockquote { background: #f5f1e6; }
</style>
