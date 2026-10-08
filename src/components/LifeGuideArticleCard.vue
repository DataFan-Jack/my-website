<script setup>
import { computed } from 'vue'
import LifeGuideCollapse from './LifeGuideCollapse.vue'
import { hoverTip } from '../lib/hoverTip.js'
const vHoverTip = hoverTip

const props = defineProps({
  index: { type: Number, default: 0 },
  data: { type: Object, required: true },
  // 仅「我的收藏」视图为 true：成本/收益/备注/来源折叠下拉
  collapsible: { type: Boolean, default: false },
})

// 标签分组：性价比 / 证据等级 / 其他
const priceTag = computed(() => (props.data.tags || []).find((t) => t.includes('性价比')))
const evidTag = computed(() => (props.data.tags || []).find((t) => t.includes('证据')))
const otherTags = computed(() =>
  (props.data.tags || []).filter((t) => !t.includes('性价比') && !t.includes('证据'))
)

// 来源折叠内容（渲染为有序列表 Markdown）
const sourcesMd = computed(() =>
  (props.data.sources || []).map((s, i) => `${i + 1}. ${s.name}${s.url ? ` <${s.url}>` : ''}`).join('\n')
)
</script>

<template>
  <article class="lg-card">
    <!-- 序号 + 标题 -->
    <header class="lg-card-head">
      <span class="lg-card-no">{{ index }}</span>
      <h2 class="lg-card-title" v-hover-tip>{{ data.title }}</h2>
    </header>

    <!-- 标签区域 -->
    <div class="lg-card-tags">
      <span v-if="priceTag" class="lg-tag">{{ priceTag }}</span>
      <span v-if="evidTag" class="lg-tag">{{ evidTag }}</span>
      <span v-for="t in otherTags" :key="t" class="lg-tag">{{ t }}</span>
    </div>

    <!-- 核心结论：浅色背景 + 左侧竖线 + 圆角 -->
    <div class="lg-summary">
      <p>{{ data.summary }}</p>
    </div>

    <!-- 我的收藏：详情（成本/收益/备注，复用原方框样式）+ 来源，均折叠下拉 -->
    <template v-if="collapsible">
      <LifeGuideCollapse v-if="data.cost || data.benefit || data.remark" title="详情">
        <div class="lg-detail">
          <div class="lg-row" v-if="data.cost"><b>成本</b><p>{{ data.cost }}</p></div>
          <div class="lg-row" v-if="data.benefit"><b>收益</b><p>{{ data.benefit }}</p></div>
          <div class="lg-row" v-if="data.remark"><b>备注</b><p>{{ data.remark }}</p></div>
        </div>
      </LifeGuideCollapse>
      <LifeGuideCollapse v-if="data.sources && data.sources.length" title="来源" :content="sourcesMd" />
    </template>
    <!-- 其他视图：成本/收益/备注直接展开 -->
    <div v-else class="lg-detail">
      <div class="lg-row">
        <b>成本</b>
        <p>{{ data.cost }}</p>
      </div>
      <div class="lg-row">
        <b>收益</b>
        <p>{{ data.benefit }}</p>
      </div>
      <div class="lg-row">
        <b>备注</b>
        <p>{{ data.remark }}</p>
      </div>
    </div>

    <!-- 其他视图：来源折叠 -->
    <LifeGuideCollapse
      v-if="!collapsible && data.sources && data.sources.length"
      title="来源"
      :content="sourcesMd"
    />
  </article>
</template>

<style scoped>
.lg-card {
  background: rgba(20, 20, 42, 0.85);
  border: 1px solid rgba(212, 168, 67, 0.15);
  border-radius: 14px;
  padding: 28px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

/* 序号 + 标题 */
.lg-card-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.lg-card-no {
  flex-shrink: 0;
  color: #d4a843;
  font-size: 20px;
  font-weight: 700;
}
.lg-card-title {
  margin: 0;
  font-size: 21px;
  line-height: 1.45;
  color: #d4a843;
}

/* 标签 */
.lg-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0;
}
.lg-tag {
  padding: 3px 10px;
  border: 1px solid rgba(212, 168, 67, 0.35);
  border-radius: 999px;
  background: rgba(212, 168, 67, 0.08);
  color: #d4a843;
  font-size: 12px;
}

/* 核心结论 */
.lg-summary {
  background: rgba(212, 168, 67, 0.08);
  border-left: 3px solid #d4a843;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 18px;
}
.lg-summary p {
  margin: 0;
  color: #e6edf3;
  font-size: 15px;
  line-height: 1.7;
}

/* 详细内容：单个方框（左竖线 + 浅色背景 + 圆角），内部分隔行 */
.lg-detail {
  border-left: 2px solid rgba(212, 168, 67, 0.5);
  background: rgba(212, 168, 67, 0.05);
  border-radius: 8px;
  padding: 4px 16px;
}
.lg-row {
  padding: 12px 0;
}
.lg-row + .lg-row {
  border-top: 1px solid rgba(212, 168, 67, 0.12);
}
.lg-row b {
  display: block;
  color: #d4a843;
  font-size: 13px;
  margin-bottom: 4px;
}
.lg-row p {
  margin: 0;
  color: #c9d1d9;
  font-size: 14px;
  line-height: 1.8;
}

/* 浅色模式 */
.page.light-mode .lg-card {
  background: #faf8f2;
  border-color: #e8e0cc;
  box-shadow: 0 20px 60px rgba(120, 100, 60, 0.15);
}
.page.light-mode .lg-card-title,
.page.light-mode .lg-card-no { color: #b8862e; }
.page.light-mode .lg-summary { background: #f5e9c8; border-left-color: #b8862e; }
.page.light-mode .lg-summary p { color: #333; }
.page.light-mode .lg-tag {
  background: rgba(184, 134, 46, 0.1);
  color: #b8862e;
  border-color: #d9c08a;
}
.page.light-mode .lg-detail { background: #faf5ea; border-left-color: #b8862e; }
.page.light-mode .lg-row + .lg-row { border-top-color: #e8dfc8; }
.page.light-mode .lg-row b { color: #b8862e; }
.page.light-mode .lg-row p { color: #444; }

/* 移动端：卡片占满宽度、收缩内边距 */
@media (max-width: 768px) {
  .lg-card { width: 100%; box-sizing: border-box; padding: 22px 18px; }
  .lg-card-title { font-size: 19px; }
  .lg-summary { padding: 12px 14px; }
}
@media (max-width: 480px) {
  .lg-card { padding: 18px 14px; }
  .lg-card-title { font-size: 18px; }
}
</style>
