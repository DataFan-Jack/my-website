<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { lifeGuide } from '../life-guide/index.js'
import { extractArticles } from '../lib/markdown.js'
import { hoverTip } from '../lib/hoverTip.js'
import LifeGuideArticleCard from './LifeGuideArticleCard.vue'

const vHoverTip = hoverTip

const FAV_KEY = 'life_guide_favs'

const mode = ref('all') // 'all' | 'article' | 'fav'
const currentId = ref(null)
const articleList = ref([]) // 打开单篇时的来源列表，用于「回车查看下一条」
const searchText = ref('')
const expanded = reactive(new Set())
const favs = ref([])
const ready = ref(false)
// 卡片列表：{ id, category, index, card }
const cards = ref([])

const allArticles = lifeGuide.articles
const categories = lifeGuide.categories
const categoryName = (key) => categories.find((c) => c.key === key)?.name || '其他'

// 章节说明占位 id（作为每个章节翻页序列的第一项）
const introId = (key) => 'intro:' + key

const favSet = computed(() => new Set(favs.value))
const cardMap = computed(() => new Map(cards.value.map((c) => [c.id, c])))
const currentCard = computed(() => (currentId.value ? cardMap.value.get(currentId.value) : null) || null)

// 当前 article 项：章节说明卡（kind:intro）或普通卡片（kind:card）
const currentEntry = computed(() => {
  if (mode.value !== 'article' || !currentId.value) return null
  if (currentId.value.startsWith('intro:')) {
    const key = currentId.value.slice(6)
    const cat = categories.find((c) => c.key === key)
    return cat ? { kind: 'intro', cat } : null
  }
  const c = cardMap.value.get(currentId.value)
  return c ? { kind: 'card', card: c } : null
})

// 预加载所有正文，每章解析出全部 :::article 卡片
async function preload() {
  const list = []
  await Promise.all(
    allArticles.map(async (a) => {
      const raw = await lifeGuide.loadContent(a)
      extractArticles(raw).forEach((d, i) => {
        list.push({ id: `${a.id}_${i + 1}`, category: a.category, index: i + 1, card: d })
      })
    })
  )
  // 按左侧目录顺序排列
  const order = new Map(categories.map((c, i) => [c.key, i]))
  list.sort((x, y) => order.get(x.category) - order.get(y.category) || x.index - y.index)
  cards.value = list
  ready.value = true
}

// 搜索：标题 / 标签 / 摘要 / 分类 / 成本收益备注
const filtered = computed(() => {
  const kw = searchText.value.trim().toLowerCase()
  if (!kw) return []
  return cards.value.filter((c) => {
    const d = c.card
    const text = [d.title, (d.tags || []).join(' '), d.summary, d.cost, d.benefit, d.remark, categoryName(c.category)]
      .join(' ')
      .toLowerCase()
    return text.includes(kw)
  })
})

// 当前展示的卡片（无搜索时）：all=全部 / fav=收藏（article 由 currentEntry 渲染）
const shownCards = computed(() => {
  if (searchText.value.trim()) return filtered.value
  if (mode.value === 'fav') return cards.value.filter((c) => favSet.value.has(c.id))
  if (mode.value === 'article') return []
  return cards.value
})

const countByCategory = (key) => cards.value.filter((c) => c.category === key).length
const cardsOfCategory = (key) => cards.value.filter((c) => c.category === key)

// 全部章节视图：按章节（分类）分组，组内保留章节内顺序，标题显示在卡片上方
const groupedCards = computed(() => categories
  .map((c, i) => ({
    key: c.key,
    no: i + 1,
    name: c.name,
    intro: c.intro,
    items: cards.value.filter((x) => x.category === c.key),
  }))
  .filter((g) => g.items.length)
)

// 构建某章节的翻页序列：章节说明卡（intro）在前，其后是该章全部条目
function buildSequence(key) {
  const list = [{ id: introId(key), kind: 'intro', key }]
  cardsOfCategory(key).forEach((c) => list.push({ id: c.id, kind: 'card', card: c }))
  return list
}

function toggleExpand(key) {
  // 互斥：同时只展开一个分类；点章节行 → 进入该章节序列（章节说明卡 → 1 → 2 → …）
  if (expanded.has(key)) {
    expanded.delete(key)
    mode.value = 'all'
    currentId.value = null
    return
  }
  expanded.clear()
  expanded.add(key)
  articleList.value = buildSequence(key)
  mode.value = 'article'
  currentId.value = introId(key)
}

function showAll() {
  mode.value = 'all'
  currentId.value = null
  expanded.clear()
}

// intro 文本 → HTML：按行分块，含「（第 N 条）」的行做成分类小节（分类名突出 + 条目可点击链接）
function introHtml(text) {
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const toLinks = (s) => s.replace(/([^，。；、：\n（]+?)（第 (\d+) 条）/g, '<a class="lg-intro-link" data-jump="$2">$1（第 $2 条）</a>')
  const lines = esc(text).split('\n').map((l) => l.trim()).filter(Boolean)
  return lines.map((line) => {
    // 含「（第 N 条）」的是分类行：分类名与条目内容分开
    if (/（第 \d+ 条）/.test(line)) {
      const m = line.match(/^([^：]+)：/)
      if (m) {
        const cat = m[1].trim()
        const body = toLinks(line.slice(m[0].length))
        return `<div class="lg-intro-block"><span class="lg-intro-cat">${cat}</span><span class="lg-intro-items">${body}</span></div>`
      }
    }
    return `<p class="lg-intro-note">${toLinks(line)}</p>`
  }).join('')
}

// 点击条号 → 切到该章节并定位到第 N 张卡片
function jumpToArticle(catKey, no) {
  const list = buildSequence(catKey)
  if (!list.length) return
  expanded.clear()
  expanded.add(catKey)
  mode.value = 'article'
  articleList.value = list
  const target = list[no] // list[0]=章节说明卡, list[1..]=卡片, 第 no 条即 list[no]
  currentId.value = target && target.kind === 'card' ? target.id : (list[1] || list[0]).id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onIntroClick(e, catKey) {
  const el = e.target.closest ? e.target.closest('.lg-intro-link') : null
  if (el && catKey) jumpToArticle(catKey, Number(el.dataset.jump))
}

function openCard(c) {
  // 每次打开都重建该章节完整序列，支持上下键在「章节说明 + 全部条目」间全程切换
  articleList.value = buildSequence(c.category)
  mode.value = 'article'
  currentId.value = c.id
}

// 上下键：在来源列表中切换上一条 / 下一条
function goArticle(dir) {
  if (mode.value !== 'article' || !articleList.value.length) return
  const list = articleList.value
  const i = list.findIndex((c) => c.id === currentId.value)
  const n = list[(i + dir + list.length) % list.length]
  if (n) currentId.value = n.id
}

function onKeydown(e) {
  if (e.repeat) return // 长按只跳转一页，忽略键盘自动重复
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
  const t = e.target
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
  e.preventDefault()
  goArticle(e.key === 'ArrowUp' ? -1 : 1)
}

function showFavs() {
  mode.value = 'fav'
  currentId.value = null
}

function isCurrent(c) {
  return mode.value === 'article' && currentId.value === c.id
}

// 收藏：未收藏 → 直接收藏；已收藏 → 弹窗确认后取消
function toggleFavorite(id) {
  const i = favs.value.indexOf(id)
  if (i >= 0) favs.value.splice(i, 1)
  else favs.value.push(id)
  localStorage.setItem(FAV_KEY, JSON.stringify(favs.value))
}

const unfavTarget = ref(null)
function requestUnfav(id) {
  unfavTarget.value = id
}
function confirmUnfav() {
  if (unfavTarget.value) toggleFavorite(unfavTarget.value)
  unfavTarget.value = null
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  try {
    const raw = localStorage.getItem(FAV_KEY)
    favs.value = raw ? JSON.parse(raw) : []
  } catch {
    favs.value = []
  }
  preload().then(() => {
    // 自动清理已失效的收藏 id，保证计数与实际列表一致
    const valid = favs.value.filter((id) => cardMap.value.has(id))
    if (valid.length !== favs.value.length) {
      favs.value = valid
      localStorage.setItem(FAV_KEY, JSON.stringify(valid))
    }
    // 默认首页：进入第 1 章（不要早死）的翻页序列，停在章节说明卡，可用上下键切换
    const first = categories[0]
    if (first) {
      const list = buildSequence(first.key)
      if (list.length) {
        expanded.clear()
        expanded.add(first.key)
        mode.value = 'article'
        articleList.value = list
        currentId.value = introId(first.key)
      }
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <main class="lg-view">
    <!-- 左侧目录 -->
    <aside class="lg-sidebar">
      <nav class="lg-toc">
        <button class="lg-all" :class="{ active: mode === 'all' && !searchText }" @click="showAll">
          <span>全部章节</span>
          <span class="lg-all-count">{{ cards.length }}</span>
        </button>
        <button class="lg-all" :class="{ active: mode === 'fav' }" @click="showFavs">
          <span>我的收藏</span>
          <span class="lg-all-count">{{ favs.length }}</span>
        </button>

        <h3 class="lg-cat-title">章节分类</h3>
        <div v-for="(c, i) in categories" :key="c.key" class="lg-cat">
          <button class="lg-cat-row" @click="toggleExpand(c.key)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
              class="lg-arrow" :class="{ open: expanded.has(c.key) }">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="lg-cat-index">{{ i + 1 }}</span>
            <span class="lg-cat-name" v-hover-tip>{{ c.name }}</span>
            <span class="lg-cat-count">{{ countByCategory(c.key) }}</span>
          </button>
          <div v-show="expanded.has(c.key)" class="lg-cat-items">
            <button
              v-for="card in cardsOfCategory(c.key)"
              :key="card.id"
              class="lg-item"
              :class="{ active: isCurrent(card) }"
              @click="openCard(card)"
            >
              <span class="lg-item-no">{{ card.index }}</span>
              <span class="lg-item-title" v-hover-tip>{{ card.card.title }}</span>
            </button>
          </div>
        </div>
      </nav>
    </aside>

    <!-- 右侧内容 -->
    <div class="lg-main">
      <div class="lg-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="#d4a843" stroke-width="2"/>
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#d4a843" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchText"
          type="search"
          placeholder="搜索人生指南：标题 / 正文 / 标签..."
        />
      </div>

      <!-- 翻页视图：章节说明卡 / 单篇卡片（含章节说明 → 1 → 2 → …，上下键切换） -->
      <div v-if="currentEntry" class="lg-list">
        <div class="lg-card-wrap">
          <div v-if="currentEntry.kind === 'intro'" class="lg-intro">
            <h3 class="lg-intro-title">{{ currentEntry.cat.name }}</h3>
            <span class="lg-intro-count">共 {{ countByCategory(currentEntry.cat.key) }} 条</span>
            <p class="lg-intro-text" v-html="introHtml(currentEntry.cat.intro)" @click="onIntroClick($event, currentEntry.cat.key)"></p>
          </div>
          <template v-else>
            <LifeGuideArticleCard :data="currentEntry.card.card" :index="currentEntry.card.index" :collapsible="false" />
            <button
              class="lg-fav"
              :class="{ on: favSet.has(currentEntry.card.id) }"
              :aria-label="favSet.has(currentEntry.card.id) ? '取消收藏' : '收藏'"
              @click="favSet.has(currentEntry.card.id) ? requestUnfav(currentEntry.card.id) : toggleFavorite(currentEntry.card.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"
                  stroke="currentColor" stroke-width="2" stroke-linejoin="round"
                />
              </svg>
              <span>{{ favSet.has(currentEntry.card.id) ? '已收藏' : '收藏' }}</span>
            </button>
          </template>
          <p class="lg-next-hint">↑ 上一条　↓ 下一条</p>
        </div>
      </div>

      <!-- 其他视图：搜索 / 全部章节 / 我的收藏 -->
      <template v-else>
        <div v-if="!ready" class="lg-empty">正在加载文章…</div>
        <div v-else-if="searchText && filtered.length === 0" class="lg-empty">没有找到相关文章</div>
        <div v-else-if="shownCards.length === 0" class="lg-empty">
          {{ mode === 'fav' ? '还没有收藏的文章，点卡片右下角收藏吧' : '暂无文章' }}
        </div>

        <div v-if="mode === 'all' && !searchText" class="lg-list">
          <div v-for="g in groupedCards" :key="g.key" class="lg-group">
            <div class="lg-intro">
              <h3 class="lg-intro-title">{{ g.name }}</h3>
              <span class="lg-intro-count">共 {{ g.items.length }} 条</span>
              <p class="lg-intro-text" v-html="introHtml(g.intro)" @click="onIntroClick($event, g.key)"></p>
            </div>
            <div v-for="c in g.items" :key="c.id" class="lg-card-wrap">
              <LifeGuideArticleCard :data="c.card" :index="c.index" :collapsible="false" />
              <button
                class="lg-fav"
                :class="{ on: favSet.has(c.id) }"
                :aria-label="favSet.has(c.id) ? '取消收藏' : '收藏'"
                @click="favSet.has(c.id) ? requestUnfav(c.id) : toggleFavorite(c.id)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"
                    stroke="currentColor" stroke-width="2" stroke-linejoin="round"
                  />
                </svg>
                <span>{{ favSet.has(c.id) ? '已收藏' : '收藏' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="lg-list">
          <div v-for="c in shownCards" :key="c.id" class="lg-card-wrap">
            <LifeGuideArticleCard :data="c.card" :index="c.index" :collapsible="mode === 'fav'" />
            <button
              class="lg-fav"
              :class="{ on: favSet.has(c.id) }"
              :aria-label="favSet.has(c.id) ? '取消收藏' : '收藏'"
              @click="favSet.has(c.id) ? requestUnfav(c.id) : toggleFavorite(c.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"
                  stroke="currentColor" stroke-width="2" stroke-linejoin="round"
                />
              </svg>
              <span>{{ favSet.has(c.id) ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- 取消收藏确认弹窗 -->
    <div v-if="unfavTarget" class="lg-mask" @click.self="unfavTarget = null">
      <div class="lg-modal">
        <h3>取消收藏</h3>
        <p>确定要取消收藏这篇文章吗？</p>
        <div class="lg-modal-btns">
          <button class="lg-modal-keep" @click="unfavTarget = null">我再想想</button>
          <button class="lg-modal-unfav" @click="confirmUnfav">取消收藏</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.lg-view {
  position: relative;
  z-index: 5;
  display: flex;
  gap: 20px;
  margin-top: 56px;
  height: calc(100vh - 56px);
  padding: 24px;
  overflow: hidden;
  box-sizing: border-box;
}

/* 左侧目录 */
.lg-sidebar {
  width: 260px;
  flex-shrink: 0;
  align-self: stretch;
  background: rgba(20, 20, 42, 0.85);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.lg-toc {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 168, 67, 0.55) transparent;
}
.lg-toc::-webkit-scrollbar { width: 6px; }
.lg-toc::-webkit-scrollbar-track { background: transparent; }
.lg-toc::-webkit-scrollbar-thumb { background: rgba(212, 168, 67, 0.55); border-radius: 3px; }
.lg-toc button { outline: none; }

/* 悬停提示：fixed 定位，跟随深浅模式 */
:global(.lg-tooltip) {
  position: fixed;
  max-width: 420px;
  padding: 8px 12px;
  background: #14142a;
  border: 1px solid rgba(212, 168, 67, 0.4);
  border-radius: 8px;
  color: #e6edf3;
  font-size: 12px;
  line-height: 1.5;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}
:global(.lg-tooltip.light) {
  background: #faf8f2;
  border-color: #d9c08a;
  color: #333;
}

.lg-all {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 20px;
  background: none;
  border: none;
  border-left: 3px solid transparent;
  color: #999;
  font-size: 14px;
  text-align: left;
  transition: all 0.2s;
}
.lg-all-count {
  flex-shrink: 0;
  min-width: 22px;
  text-align: center;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(212, 168, 67, 0.12);
  color: #d4a843;
  font-size: 11px;
}
.lg-all:hover { color: #d4a843; background: rgba(212, 168, 67, 0.06); }
.lg-all.active { color: #d4a843; border-left-color: #d4a843; background: rgba(212, 168, 67, 0.1); }

.lg-cat-title {
  margin: 14px 20px 6px;
  font-size: 12px;
  color: #666;
  letter-spacing: 1px;
}

.lg-cat-row {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  padding: 7px 20px;
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  text-align: left;
  transition: all 0.2s;
}
.lg-cat-row:hover { color: #d4a843; background: rgba(212, 168, 67, 0.06); }
.lg-arrow { transition: transform 0.2s; color: #888; flex-shrink: 0; }
.lg-arrow.open { transform: rotate(180deg); }
.lg-cat-index {
  flex-shrink: 0;
  width: 18px;
  text-align: right;
  color: #d4a843;
  font-size: 12px;
}
.lg-cat-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lg-cat-count {
  flex-shrink: 0;
  min-width: 22px;
  text-align: center;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(212, 168, 67, 0.12);
  color: #d4a843;
  font-size: 11px;
}

.lg-cat-items { padding: 2px 0 4px; }
.lg-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  padding: 8px 20px 8px 36px;
  background: none;
  border: none;
  border-left: 3px solid transparent;
  color: #bbb;
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
  transition: all 0.2s;
}
.lg-item-no {
  flex-shrink: 0;
  width: 20px;
  text-align: right;
  color: #d4a843;
  font-size: 12px;
  padding-top: 1px;
}
/* 小题目只显示两行，超出省略 */
.lg-item-title {
  flex: 1;
  min-width: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.lg-item:hover { color: #d4a843; background: rgba(212, 168, 67, 0.06); }
/* 当前文章：蓝色高亮 */
.lg-item.active {
  color: #6aa7ff;
  border-left-color: #6aa7ff;
  background: rgba(106, 167, 255, 0.12);
}
.lg-item.active .lg-item-no { color: #6aa7ff; }

/* 右侧内容 */
.lg-main {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 168, 67, 0.55) transparent;
}
.lg-main::-webkit-scrollbar { width: 6px; }
.lg-main::-webkit-scrollbar-track { background: transparent; }
.lg-main::-webkit-scrollbar-thumb { background: rgba(212, 168, 67, 0.55); border-radius: 3px; }

.lg-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 168, 67, 0.4);
  border-radius: 12px;
  padding: 10px 18px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s, border-color 0.3s;
}
.lg-search:hover, .lg-search:focus-within {
  border-color: rgba(212, 168, 67, 0.8);
  box-shadow: 0 0 25px rgba(212, 168, 67, 0.25);
}
.lg-search input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #d4a843;
  font-size: 14px;
}
.lg-search input::placeholder { color: #666; }

.lg-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 10px;
}

/* 全部章节：章节分组标题 */
.lg-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片 + 收藏按钮 */
.lg-card-wrap {
  position: relative;
}
.lg-fav {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid rgba(212, 168, 67, 0.4);
  border-radius: 8px;
  background: transparent;
  color: #d4a843;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.2s;
  z-index: 2;
}
.lg-fav:hover { background: rgba(212, 168, 67, 0.12); }
.lg-fav.on { background: rgba(212, 168, 67, 0.15); border-color: #d4a843; }
.page.light-mode .lg-fav { color: #b8862e; border-color: #d9c08a; }

.lg-next-hint {
  margin: 16px 0 0;
  font-size: 12px;
  color: #888;
  text-align: center;
}

.lg-empty { padding: 60px; text-align: center; color: #666; font-size: 15px; }

.lg-intro {
  margin: 0 0 16px;
  padding: 20px 24px;
  background: rgba(20, 20, 42, 0.85);
  border: 1px solid rgba(212, 168, 67, 0.15);
  border-left: 3px solid #d4a843;
  border-radius: 14px;
}
.lg-intro-title {
  margin: 0 0 8px;
  color: #d4a843;
  font-size: 20px;
}
.lg-intro-count {
  display: inline-block;
  margin: 0 0 8px 10px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(212, 168, 67, 0.12);
  color: #d4a843;
  font-size: 12px;
  vertical-align: 2px;
}
.lg-intro-text {
  margin: 0;
  color: #e6edf3;
  font-size: 15px;
  line-height: 1.7;
}
/* 分类小节：分类名 + 条目列表（v-html 动态内容，需 :deep 穿透） */
:deep(.lg-intro-block) {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 8px 0;
  line-height: 1.8;
}
:deep(.lg-intro-cat) {
  flex-shrink: 0;
  color: #d4a843;
  font-weight: 600;
  white-space: nowrap;
}
:deep(.lg-intro-items) { flex: 1; min-width: 0; }
:deep(.lg-intro-items .lg-intro-link) { margin-right: 4px; }
/* 首段说明文字 */
:deep(.lg-intro-note) {
  margin: 0 0 10px;
  color: #e6edf3;
  font-size: 15px;
  line-height: 1.8;
}
:deep(.lg-intro-link) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}
:deep(.lg-intro-link:hover) { color: #d4a843; }
.page.light-mode .lg-intro { background: #faf8f2; border-color: #e8e0cc; border-left-color: #b8862e; }
.page.light-mode .lg-intro-title { color: #b8862e; }
.page.light-mode .lg-intro-text { color: #444; }
.page.light-mode :deep(.lg-intro-cat) { color: #b8862e; }
.page.light-mode :deep(.lg-intro-note) { color: #444; }
.page.light-mode :deep(.lg-intro-link) { color: inherit; }
.page.light-mode :deep(.lg-intro-link:hover) { color: #b8862e; }

/* 取消收藏确认弹窗 */
.lg-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.lg-modal {
  width: 320px;
  max-width: 80vw;
  background: #14142a;
  border: 1px solid rgba(212, 168, 67, 0.35);
  border-radius: 14px;
  padding: 24px 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.lg-modal h3 {
  margin: 0 0 14px;
  color: #d4a843;
  font-size: 17px;
  text-align: center;
}
.lg-modal p {
  margin: 0 0 24px;
  color: #c9d1d9;
  font-size: 14px;
  line-height: 1.7;
  text-align: center;
}
.lg-modal-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.lg-modal-btns button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}
.lg-modal-keep {
  background: transparent;
  border: 1px solid rgba(212, 168, 67, 0.4);
  color: #d4a843;
}
.lg-modal-keep:hover {
  background: rgba(212, 168, 67, 0.12);
  box-shadow: 0 0 12px rgba(212, 168, 67, 0.45);
}
.lg-modal-unfav {
  background: transparent;
  border: 1px solid rgba(212, 168, 67, 0.4);
  color: #d4a843;
}
.lg-modal-unfav:hover {
  background: rgba(212, 168, 67, 0.12);
  box-shadow: 0 0 12px rgba(212, 168, 67, 0.45);
}
.page.light-mode .lg-modal {
  background: #faf8f2;
  border-color: #d9c08a;
  box-shadow: 0 20px 60px rgba(120, 100, 60, 0.3);
}
.page.light-mode .lg-modal h3 { color: #b8862e; }
.page.light-mode .lg-modal p { color: #444; }

/* 浅色模式 */
.page.light-mode .lg-view { background: #faf8f2; }
.page.light-mode .lg-sidebar { background: rgba(255, 255, 255, 0.9); }
.page.light-mode .lg-toc::-webkit-scrollbar-thumb { background: #d4a843; }
.page.light-mode .lg-toc { scrollbar-color: #d4a843 transparent; }
.page.light-mode .lg-search { background: rgba(0, 0, 0, 0.02); border-color: rgba(0, 0, 0, 0.05); }
.page.light-mode .lg-search input { color: #b8862e; }
.page.light-mode .lg-search input::placeholder { color: #999; }
.page.light-mode .lg-main::-webkit-scrollbar-thumb { background: #d4a843; }
.page.light-mode .lg-main { scrollbar-color: #d4a843 transparent; }
.page.light-mode .lg-all, .page.light-mode .lg-cat-row { color: #888; }
.page.light-mode .lg-all:hover, .page.light-mode .lg-cat-row:hover,
.page.light-mode .lg-item:hover { color: #b8862e; }
.page.light-mode .lg-all.active { color: #b8862e; border-left-color: #b8862e; }
.page.light-mode .lg-cat-title { color: #aaa; }
.page.light-mode .lg-item { color: #666; }
.page.light-mode .lg-item-no { color: #b8862e; }
.page.light-mode .lg-item.active .lg-item-no { color: #2f6fd0; }
.page.light-mode .lg-item.active { color: #2f6fd0; border-left-color: #2f6fd0; background: rgba(47, 111, 208, 0.1); }
.page.light-mode .lg-cat-count { background: #f5f1e6; color: #b8862e; }
</style>
