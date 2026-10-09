<script setup>
// 知识详情页：三栏布局（左：篇章导航+本文目录 / 中：正文 / 右：文章信息）
// 数据全部来自 Markdown 驱动的统一配置（data/knowledge/index.js）
import { ref, computed, watch, nextTick } from 'vue'
import { knowledgeArticles, knowledgeTopics } from '../data/knowledge/index.js'
import NoteMarkdown from '../components/knowledge/NoteMarkdown.vue'

const props = defineProps({
  name: { type: String, default: '' },
  chapter: { type: String, default: '' },
})

const topicKey = computed(() => props.name.toLowerCase())
const articles = computed(() => knowledgeArticles.filter((a) => a.topic === topicKey.value))
const topic = computed(() =>
  knowledgeTopics.find((t) => t.title.toLowerCase() === topicKey.value)
)

const activeId = ref('')
watch(
  () => [props.name, props.chapter],
  () => {
    const list = articles.value
    if (!list.length) return
    const id = props.chapter || list[0].id
    activeId.value = list.some((a) => a.id === id) ? id : list[0].id
  },
  { immediate: true }
)

const current = computed(() => articles.value.find((a) => a.id === activeId.value) || null)
const curIndex = computed(() => articles.value.findIndex((a) => a.id === activeId.value))
const prev = computed(() => (curIndex.value > 0 ? articles.value[curIndex.value - 1] : null))
const next = computed(() =>
  curIndex.value >= 0 && curIndex.value < articles.value.length - 1
    ? articles.value[curIndex.value + 1]
    : null
)

function selectArticle(id) {
  if (id === activeId.value) return
  location.hash = `#/knowledge/${props.name}/${id}`
}

// ===== 本文目录（h2/h3 锚点）=====
const toc = ref([])
const contentRef = ref(null)
const activeToc = ref('')
const progress = ref(0)
const showTop = ref(false)
const navOpen = ref(false) // 移动端左侧导航折叠开关

async function refreshToc() {
  // 等子组件 NoteMarkdown 完成 v-html 渲染后再收集锚点（双重 nextTick 保证时序）
  await nextTick()
  await nextTick()
  const box = contentRef.value
  toc.value = box
    ? [...box.querySelectorAll('h2[id],h3[id]')].map((h) => ({
        id: h.id,
        text: h.textContent.trim(),
        level: h.tagName === 'H2' ? 2 : 3,
      }))
    : []
  activeToc.value = ''
  progress.value = 0
}
watch(activeId, refreshToc, { immediate: true })

function onScroll() {
  const box = contentRef.value
  if (!box) return
  const st = box.scrollTop
  const total = box.scrollHeight - box.clientHeight
  progress.value = total > 0 ? Math.min(100, Math.round((st / total) * 100)) : 0
  showTop.value = st > 300
  let cur = ''
  for (const t of toc.value) {
    const el = box.querySelector('#' + t.id)
    if (el && el.offsetTop - 90 <= st) cur = t.id
  }
  if (cur) activeToc.value = cur
}

function scrollToToc(id) {
  const box = contentRef.value
  const el = box?.querySelector('#' + id)
  if (el) box.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' })
}

function toTop() {
  contentRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <main class="kd-page">
    <!-- 主题暂无文章：占位提示 -->
    <template v-if="!articles.length">
      <h1 class="kd-title">{{ topic?.title || name }}详细笔记页面</h1>
      <p class="kd-tip">该主题的详细学习笔记正在整理中，敬请期待。</p>
      <a class="kd-back kd-back-inline" href="#/knowledge">返回学习中心</a>
    </template>

    <!-- 文章详情：三栏布局 -->
    <template v-else>
      <!-- 顶部阅读进度条 -->
      <div class="kd-progress" :style="{ width: progress + '%' }"></div>

      <div class="kd-body">
        <!-- 左栏：单一导航面板（返回 + 篇章导航） -->
        <aside class="kd-side" :class="{ open: navOpen }">
          <a class="kd-back" href="#/knowledge">返回知识中心</a>
          <div class="kd-ch-group">{{ topic?.title || name }}学习笔记</div>
          <button
            v-for="a in articles"
            :key="a.id"
            class="kd-ch"
            :class="{ active: a.id === activeId }"
            @click="navOpen = false; selectArticle(a.id)"
          >
            <span class="kd-ch-label">{{ a.label }}</span>
            <span class="kd-ch-title">{{ a.title }}</span>
          </button>
        </aside>

        <!-- 移动端折叠导航开关 -->
        <button
          class="kd-nav-toggle"
          :class="{ open: navOpen }"
          @click="navOpen = !navOpen"
          aria-label="切换导航"
        >☰</button>

        <!-- 中栏：文章正文 -->
        <section ref="contentRef" class="kd-content" @scroll="onScroll">
          <div class="kd-inner">
            <NoteMarkdown :markdown="current.content" />

            <!-- 上一篇 / 下一篇 -->
            <div class="kd-pager">
              <button
                v-if="prev"
                class="kd-pager-btn prev"
                @click="selectArticle(prev.id)"
              >
                <span class="kd-pager-label">上一篇 · {{ prev.label }}</span>
                <span class="kd-pager-title">{{ prev.title }}</span>
              </button>
              <button
                v-if="next"
                class="kd-pager-btn next"
                @click="selectArticle(next.id)"
              >
                <span class="kd-pager-label">下一篇 · {{ next.label }}</span>
                <span class="kd-pager-title">{{ next.title }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- 右栏：文章信息 + 本文目录 -->
        <aside class="kd-meta">
          <div class="kd-meta-card">
            <div class="kd-meta-icon">{{ current.icon }}</div>
            <h3 class="kd-meta-name">{{ current.title }}</h3>
            <dl class="kd-meta-list">
              <div class="kd-meta-row">
                <dt>分类</dt>
                <dd>{{ current.category }}</dd>
              </div>
              <div class="kd-meta-row">
                <dt>难度</dt>
                <dd>{{ current.level }}</dd>
              </div>
              <div class="kd-meta-row">
                <dt>阅读时间</dt>
                <dd>约 {{ current.readMinutes }} 分钟</dd>
              </div>
              <div class="kd-meta-row">
                <dt>更新时间</dt>
                <dd>{{ current.updatedAt }}</dd>
              </div>
            </dl>
            <div class="kd-meta-tags">
              <span v-for="tag in current.tags" :key="tag" class="kd-meta-tag">{{ tag }}</span>
            </div>
          </div>

          <div class="kd-toc-card">
            <h3 class="kd-side-title">本文目录</h3>
            <nav class="kd-toc">
              <button
                v-for="t in toc"
                :key="t.id"
                class="kd-toc-item"
                :class="{ active: t.id === activeToc, sub: t.level === 3 }"
                @click="scrollToToc(t.id)"
              >
                {{ t.text }}
              </button>
              <p v-if="!toc.length" class="kd-side-tip">目录生成中…</p>
            </nav>
          </div>
        </aside>
      </div>

      <!-- 返回顶部 -->
      <button v-show="showTop" class="kd-top" @click="toTop" aria-label="返回顶部">↑</button>
    </template>
  </main>
</template>

<style scoped>
.kd-page {
  position: relative;
  width: 100%;
  margin-top: 64px;
  padding: 0 40px 20px;
  background: var(--bg-primary);
  height: calc(100vh - 64px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  box-sizing: border-box;
}

/* 顶部阅读进度条 */
.kd-progress {
  position: fixed;
  top: 64px;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-strong));
  z-index: 100;
  transition: width 0.15s ease;
}

/* 占位标题 */
.kd-title {
  margin: 0 0 10px;
  font-size: 30px;
  color: var(--text-primary);
}
.kd-tip {
  color: var(--text-muted);
  font-size: 14px;
}
.kd-back-inline {
  display: inline-block;
  margin-top: 18px;
  width: auto;
  padding: 10px 22px;
  background: rgba(20, 20, 42, 0.5);
  border: 1.5px solid rgba(212, 175, 55, 0.4);
  border-radius: 14px;
}

/* 返回按钮：与左侧导航面板融合（仅底部金边分隔线） */
.kd-back {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px 13px;
  color: var(--accent-color);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  text-decoration: none;
  border: none;
  border-bottom: 1px solid var(--border-color);
  border-radius: 0;
  transition: all 0.2s ease;
}
.kd-back:hover {
  color: var(--accent-strong);
  background: rgba(212, 175, 55, 0.06);
}

/* 三栏主体 */
.kd-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  gap: 28px;
}

/* ===== 左栏：篇章导航面板（返回 + 篇章导航 单一边框） ===== */
.kd-side {
  width: 240px;
  flex-shrink: 0;
  padding: 12px 12px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-sizing: border-box;
}
.kd-side::-webkit-scrollbar,
.kd-content::-webkit-scrollbar,
.kd-meta::-webkit-scrollbar,
.kd-toc::-webkit-scrollbar {
  width: 5px;
}
.kd-side::-webkit-scrollbar-thumb,
.kd-content::-webkit-scrollbar-thumb,
.kd-meta::-webkit-scrollbar-thumb,
.kd-toc::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}
.kd-side::-webkit-scrollbar-track,
.kd-content::-webkit-scrollbar-track,
.kd-meta::-webkit-scrollbar-track,
.kd-toc::-webkit-scrollbar-track {
  background: transparent;
}
.kd-side,
.kd-content,
.kd-meta,
.kd-toc {
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}
.kd-ch-group {
  margin: 8px 12px 4px;
  padding-bottom: 8px;
  font-size: 13px;
  color: var(--accent-color);
  letter-spacing: 1px;
  border-bottom: 1px solid var(--border-color);
}
.kd-ch {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 14px;
  text-align: left;
  background: none;
  border: none;
  border-left: 3px solid transparent;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}
.kd-ch-label {
  font-size: 12px;
  color: var(--text-muted);
}
.kd-ch-title {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.kd-ch:hover {
  background: rgba(212, 175, 55, 0.08);
}
.kd-ch.active {
  background: rgba(212, 175, 55, 0.1);
  border-left-color: var(--accent-color);
}
.kd-ch.active .kd-ch-label {
  color: var(--accent-color);
}
.kd-ch.active .kd-ch-title {
  color: var(--text-primary);
}

/* 本文目录（右栏卡片内） */
.kd-toc-card {
  padding: 14px 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
}
.kd-side-title {
  margin: 0 10px 8px;
  padding-bottom: 8px;
  font-size: 13px;
  color: var(--accent-color);
  letter-spacing: 1px;
  border-bottom: 1px solid var(--border-color);
}
.kd-toc {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 4px;
}
.kd-toc-item {
  padding: 7px 14px 7px 20px;
  text-align: left;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
  background: none;
  border: none;
  border-left: 2px solid transparent;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}
.kd-toc-item.sub {
  padding-left: 32px;
  font-size: 12.5px;
}
.kd-toc-item:hover {
  color: var(--text-secondary);
  background: rgba(212, 175, 55, 0.06);
}
.kd-toc-item.active {
  color: var(--accent-color);
  border-left-color: var(--accent-color);
  background: rgba(212, 175, 55, 0.08);
}
.kd-side-tip {
  margin: 8px 6px 0;
  font-size: 12px;
  color: var(--text-muted);
}

/* ===== 中栏：正文 ===== */
.kd-content {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  overflow-y: auto;
  user-select: text;
  -webkit-user-select: text;
}
.kd-inner {
  max-width: 850px;
  margin: 0 auto;
}

/* 上一篇 / 下一篇 */
.kd-pager {
  display: flex;
  gap: 14px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
.kd-pager-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  text-align: left;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.kd-pager-btn:hover {
  border-color: var(--accent-color);
  background: rgba(212, 175, 55, 0.08);
}
.kd-pager-btn.next {
  align-items: flex-end;
  text-align: right;
}
.kd-pager-label {
  font-size: 12px;
  color: var(--text-muted);
}
.kd-pager-title {
  font-size: 14px;
  color: var(--text-primary);
}

/* ===== 右栏：文章信息 + 本文目录 ===== */
.kd-meta {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 84px;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 2px;
}
.kd-meta-card {
  padding: 22px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  text-align: center;
}
.kd-meta-icon {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 10px;
}
.kd-meta-name {
  margin: 0 0 14px;
  font-size: 17px;
  color: var(--text-primary);
}
.kd-meta-list {
  margin: 0 0 14px;
  text-align: left;
}
.kd-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 7px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.08);
}
.kd-meta-row:last-child {
  border-bottom: none;
}
.kd-meta-row dt {
  color: var(--text-muted);
}
.kd-meta-row dd {
  margin: 0;
  color: var(--text-secondary);
  text-align: right;
}
.kd-meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}
.kd-meta-tag {
  padding: 3px 10px;
  font-size: 12px;
  color: var(--accent-color);
  border: 1px solid var(--border-color);
  border-radius: 999px;
}

/* 返回顶部按钮 */
.kd-top {
  position: fixed;
  right: 26px;
  bottom: 30px;
  width: 44px;
  height: 44px;
  font-size: 18px;
  color: var(--accent-color);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  transition: all 0.2s ease;
  z-index: 90;
}
.kd-top:hover {
  background: rgba(212, 175, 55, 0.12);
}

/* 移动端折叠导航开关（仅小屏显示） */
.kd-nav-toggle {
  display: none;
  position: fixed;
  left: 16px;
  top: 84px;
  z-index: 96;
  width: 38px;
  height: 38px;
  font-size: 16px;
  line-height: 1;
  color: var(--accent-color);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}
.kd-nav-toggle.open {
  color: var(--bg-primary);
  background: var(--accent-color);
}

/* ===== 响应式 ===== */
@media (max-width: 1100px) {
  .kd-meta {
    display: none;
  }
}
@media (max-width: 860px) {
  .kd-page {
    height: auto;
    overflow: visible;
    padding: 84px 16px 40px;
  }
  .kd-progress {
    display: none;
  }
  .kd-body {
    flex-direction: column;
    overflow: visible;
    align-items: stretch;
    gap: 16px;
  }
  /* 左侧导航：折叠为抽屉，☰ 按钮展开 */
  .kd-side {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    width: 260px;
    height: auto;
    transform: translateX(-105%);
    transition: transform 0.25s ease;
    z-index: 95;
    overflow: hidden auto;
    border-radius: 0 14px 14px 0;
  }
  .kd-side.open {
    transform: translateX(0);
  }
  .kd-nav-toggle {
    display: block;
  }
  .kd-content {
    width: 100%;
    overflow: visible;
  }
  .kd-pager {
    flex-direction: column;
  }
  .kd-top {
    right: 16px;
    bottom: 20px;
  }
}
</style>
