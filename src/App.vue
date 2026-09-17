<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'
import DotField from './components/DotField.vue'

const cardRef = ref(null)
const flipDir = ref('') // 'left' | 'right' | 'up' | 'down'
const currentFace = ref('front') // 'front' | 'back'
const isDark = ref(true) // 深色/浅色模式
let triggerTimer = null

// === GitHub 登录 ===
const OAUTH_BASE = import.meta.env.VITE_OAUTH_BASE || 'http://localhost:3001'
const user = ref(null)
const menuOpen = ref(false)
const loginOpen = ref(false)

function goGithub() {
  window.location.href = OAUTH_BASE + '/api/oauth/github/login'
}

function loadUser() {
  const raw = localStorage.getItem('nav_user')
  if (raw) {
    try { user.value = JSON.parse(raw) } catch { localStorage.removeItem('nav_user') }
  }
}

// 处理 OAuth 回调结果（gh_user=登录成功 / gh_error=失败）
const params = new URLSearchParams(window.location.search)
const ghUser = params.get('gh_user')
const ghError = params.get('gh_error')
if (ghUser) {
  try {
    user.value = JSON.parse(decodeURIComponent(ghUser))
    localStorage.setItem('nav_user', JSON.stringify(user.value))
    history.replaceState(null, '', window.location.pathname) // 清理地址栏参数
  } catch { /* 忽略损坏数据 */ }
} else if (ghError) {
  alert(decodeURIComponent(ghError))
  history.replaceState(null, '', window.location.pathname)
}
loadUser()

function logout() {
  localStorage.removeItem('nav_user')
  user.value = null
  menuOpen.value = false
}

function onDocClick(e) {
  if (!e.target.closest('.user-box')) menuOpen.value = false
}

// === 教程视图（站内切换，不新开页面） ===
const view = ref('home') // 'home' | 'tutorials' | 'tutorial'
const dotsPaused = ref(false) // 背景点阵动/停
const tutorial = ref(null) // 全部教程数据
const currentTutorial = ref(null) // 当前打开的教程
const category = ref('全部教程') // 分类筛选
const searchText = ref('') // 搜索关键词
const activeChapter = ref(0)

function showTutorials() { setHash('#/tutorials') }
function goHome() { setHash('#/') }
function goResume() { setHash('#/resume') }
// hash 路由：视图切换写入 location.hash，让浏览器自带后退/前进键生效
// 节流：250ms 内只响应一次视图切换，防止导航栏快速连点反复触发重渲染导致卡死
let lastHashSwitch = 0
function setHash(h) {
  const now = Date.now()
  if (now - lastHashSwitch < 250) return
  lastHashSwitch = now
  if (location.hash !== h) location.hash = h
  else applyHash()
}
function applyHash() {
  const h = (location.hash || '#/').replace(/^#\//, '')
  const segs = h.split('/').filter(Boolean)
  const section = segs[0]
  if (section === 'tutorials') {
    const name = segs[1]
    if (name && tutorial.value) {
      const t = tutorial.value.tutorials.find(x => x.name === decodeURIComponent(name))
      if (t) {
        view.value = 'tutorial'
        // 第三段为章节标题（或数字索引，兼容旧地址）；缺省进第 0 章
        loadTutorialDetail(t, segs[2] !== undefined ? segs[2] : 0)
        return
      }
    }
    view.value = 'tutorials'
  } else if (section === 'resume') {
    view.value = 'resume'
  } else {
    view.value = 'home'
  }
}

// 空格键控制点阵动/停（输入框、按钮聚焦时不触发）
function onKeydown(e) {
  if (e.code !== 'Space' || e.repeat) return
  const tag = e.target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
  e.preventDefault()
  dotsPaused.value = !dotsPaused.value
}
function openTutorial(t) {
  setHash(`#/tutorials/${encodeURIComponent(t.name)}`)
}
// 懒加载：进入教程时按 file 异步加载该教程的章节详情
async function loadTutorialDetail(t, ref) {
  // 同一教程的数据已在内存：只切章节，避免重建侧边栏导致滚动归顶
  if (currentTutorial.value && currentTutorial.value.chapters &&
      currentTutorial.value.name === t.name) {
    applyChapter(currentTutorial.value, ref)
    return
  }
  currentTutorial.value = null
  try {
    const r = await fetch('/tutorials/' + t.file)
    const d = (await r.json()).tutorial
    currentTutorial.value = d
    applyChapter(d, ref)
    // 让地址栏显示章节标题（正规格式）
    if (d.chapters[activeChapter.value]) {
      const want = `#/tutorials/${encodeURIComponent(t.name)}/${encodeURIComponent(d.chapters[activeChapter.value].title)}`
      if (location.hash !== want) history.replaceState(null, '', want)
    }
  } catch (e) {
    currentTutorial.value = null
  }
}
// ref 可为数字索引或章节标题，统一落位到 activeChapter
function applyChapter(d, ref) {
  const s = String(ref)
  if (s !== '' && /^\d+$/.test(s)) {
    const n = Number(s)
    activeChapter.value = n >= d.chapters.length ? 0 : n
  } else {
    const i = d.chapters.findIndex(c => c.title === decodeURIComponent(s))
    activeChapter.value = i >= 0 ? i : 0
  }
}
function backToTutorials() { setHash('#/tutorials') }
function selectChapter(i) {
  const t = currentTutorial.value
  if (t && t.chapters[i]) {
    setHash(`#/tutorials/${encodeURIComponent(t.name)}/${encodeURIComponent(t.chapters[i].title)}`)
  }
}

// 复制实例代码到剪贴板（含降级方案）
function copyCode(code, e) {
  const btn = e.currentTarget
  const tip = btn.querySelector('.t-copy-tip')
  const icon = btn.querySelector('.t-copy-icon')
  const done = () => {
    btn.classList.add('copied')
    if (tip) tip.textContent = '已复制'
    if (icon) icon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>'
    setTimeout(() => {
      btn.classList.remove('copied')
      if (tip) tip.textContent = '复制代码'
      if (icon) icon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>'
    }, 1500)
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy(code, done))
  } else {
    fallbackCopy(code, done)
  }
}
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  ta.style.userSelect = 'text'
  ta.style.webkitUserSelect = 'text'
  document.body.appendChild(ta)
  ta.select()
  try { document.execCommand('copy') } catch (e) { /* 忽略 */ }
  document.body.removeChild(ta)
  done()
}

const categories = computed(() => {
  if (!tutorial.value) return []
  return [...new Set(tutorial.value.tutorials.map(t => t.category))]
})

const filteredTutorials = computed(() => {
  if (!tutorial.value) return []
  const kw = searchText.value.trim().toLowerCase()
  return tutorial.value.tutorials.filter(t =>
    (category.value === '全部教程' || t.category === category.value) &&
    (!kw || t.name.toLowerCase().includes(kw) || t.desc.toLowerCase().includes(kw))
  )
})

const filteredGroups = computed(() => {
  const map = {}
  for (const t of filteredTutorials.value) (map[t.category] ||= []).push(t)
  return Object.entries(map).map(([cat, items]) => ({ cat, items }))
})

// 视图/章节切换时清除残留选区，避免旧高亮映射到新内容
watch([view, activeChapter], () => {
  window.getSelection()?.removeAllRanges()
})

// 正面代码 developer.js
const frontCode = `// 码上启程
const developer = {
  name: '我们',
  skills: ['程序开发', 'AI 工具', '全栈之路'],
  dream: '用代码改变世界',
  motto: '每天进步1%，一年后强大10倍'
};

// 开始行动吧
developer.start = () => {
  console.log('种一棵树最好的时间是十年前，其次是现在');
};`

// 背面代码 about.js
const backCode = `// 关于这个网站
const website = {
  type: '个人编程学习网站',
  mode: '🌙浅色模式/☀️深色模式',
  search: '回车进行全网搜索',
  url: '你的网站地址',
  year: 2026
};

// 一起加油
website.launch = () => {
  // Linus Torvalds（Linux之父）：空谈无用，写出代码
  console.log('Talk is cheap, show me the code');
  console.log('前路浩浩荡荡，万物皆可期待');
};`

const frontDisplay = ref('')
const backDisplay = ref('')
const subtitleDisplay = ref('')
const frontBody = ref(null)
const backBody = ref(null)
let timers = []

const subtitleText = '程序员一站式学习网站'
const nav = ref(null)
const searchQuery = ref('')
const searchInput = ref(null)

function focusSearch() {
  searchInput.value?.focus()
}

onMounted(() => {
  window.addEventListener('hashchange', applyHash)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (document.activeElement === searchInput.value) {
        searchInput.value.blur()
      } else {
        e.preventDefault()
        searchInput.value?.focus()
      }
    }
  })
  document.addEventListener('click', onDocClick)
})

const siteList = [
  { name: 'vue', url: 'https://cn.vuejs.org/' },
  { name: 'github', url: 'https://github.com/' },
  { name: 'csdn', url: 'https://csdn.net/' },
  { name: 'mdn', url: 'https://developer.mozilla.org/zh-CN/' },
  { name: 'vite', url: 'https://vitejs.dev/' },
  { name: 'react', url: 'https://react.dev/' },
  { name: 'node', url: 'https://nodejs.org/' },
  { name: 'baidu', url: 'https://www.baidu.com/' },
  { name: 'google', url: 'https://www.google.com/' },
  { name: 'bilibili', url: 'https://www.bilibili.com/' },
  { name: 'douyin', url: 'https://www.douyin.com/' },
  { name: 'zhihu', url: 'https://www.zhihu.com/' },
  { name: 'juejin', url: 'https://juejin.cn/' },
  { name: 'stackoverflow', url: 'https://stackoverflow.com/' },
]

function handleSearch() {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return
  const site = siteList.find(s => s.name === q)
  if (site) {
    window.open(site.url, '_blank')
  } else {
    window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(q)}`, '_blank')
  }
}

function typeCode(fullText, displayRef, speed = 50, bodyRef = null) {
  let i = 0
  function type() {
    if (i <= fullText.length) {
      displayRef.value = fullText.slice(0, i)
      i++
      nextTick(() => {
        if (bodyRef && bodyRef.value) {
          bodyRef.value.scrollTop = bodyRef.value.scrollHeight
        }
      })
      timers.push(setTimeout(type, speed))
    } else {
      timers.push(setTimeout(() => {
        i = 0
        displayRef.value = ''
        type()
      }, 5000))
    }
  }
  type()
}

function onTriggerEnter(e) {
  if (currentFace.value === 'front') {
    const rect = cardRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const midX = rect.width / 2
    const midY = rect.height / 2
    const dx = Math.abs(x - midX)
    const dy = Math.abs(y - midY)
    if (dx > dy) {
      flipDir.value = x < midX ? 'right' : 'left'
    } else {
      flipDir.value = y < midY ? 'down' : 'up'
    }
    currentFace.value = 'back'
  }
}

function onTriggerLeave() {
  if (currentFace.value === 'back') {
    flipDir.value = ''
    currentFace.value = 'front'
  }
}

watch(frontDisplay, (val) => {
  if (val.includes('\n')) {
    setTimeout(() => {
      if (frontBody.value) {
        const el = frontBody.value
        if (el.scrollHeight > el.clientHeight) {
          const lineHeight = 14 * 1.8
          el.scrollTop = el.scrollHeight - el.clientHeight + lineHeight
        } else {
          el.scrollTop = 0
        }
      }
    }, 10)
  }
})

watch(backDisplay, (val) => {
  if (val.includes('\n')) {
    setTimeout(() => {
      if (backBody.value) {
        const el = backBody.value
        if (el.scrollHeight > el.clientHeight) {
          const lineHeight = 14 * 1.8
          el.scrollTop = el.scrollHeight - el.clientHeight + lineHeight
        } else {
          el.scrollTop = 0
        }
      }
    }, 10)
  }
})

onMounted(() => {
  typeCode(frontCode, frontDisplay, 50, frontBody)
  typeCode(backCode, backDisplay, 50, backBody)
  typeCode(subtitleText, subtitleDisplay, 130)
  window.addEventListener('scroll', () => {
    if (nav.value) {
      nav.value.classList.toggle('scrolled', window.scrollY > 20)
    }
  })
  window.addEventListener('keydown', onKeydown)
  // 加载教程数据（本地学习 demo）
  fetch('/tutorial-data.json')
    .then(r => r.json())
    .then(d => { tutorial.value = d; applyHash() })
    .catch(() => {})
})

onBeforeUnmount(() => {
  timers.forEach(t => clearTimeout(t))
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('hashchange', applyHash)
})
</script>

<template>
  <div class="page" :class="{ 'light-mode': !isDark }">
    <div class="dot-wrapper" v-if="view === 'home'">
      <DotField
        :dot-radius="1.5"
        :dot-spacing="16"
        :cursor-radius="650"
        :cursor-force="0.5"
        :bulge-strength="67"
        :glow-radius="110"
        :glow-color="isDark ? '#0a0a0a' : '#faf7f0'"
        :gradient-from="isDark ? '#d4a843' : '#B8892E'"
        :gradient-to="isDark ? '#f0d878' : '#D4A843'"
        :paused="dotsPaused"
      />
    </div>

    <nav ref="nav" class="nav">
      <div class="nav-left">
        <div class="logo">
          <img class="logo-icon" src="/logo_icon.png" alt="码上启程" />
          <span class="logo-text">码上启程</span>
        </div>
        <div class="menu">
          <a href="#" :class="{ active: view === 'home' }" @click.prevent="goHome">首页</a>
          <a href="#" @click.prevent>学习中心</a>
          <a href="#" @click.prevent>项目实战</a>
          <a href="#" @click.prevent>编程导航</a>
          <a href="#" :class="{ active: view === 'tutorials' || view === 'tutorial' }" @click.prevent="showTutorials">教程</a>
          <a href="#" :class="{ active: view === 'resume' }" @click.prevent="goResume">关于我</a>
        </div>
      </div>
      <div class="nav-right">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#d4a843" stroke-width="2"/>
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#d4a843" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            ref="searchInput"
            v-model="searchQuery"
            @keydown.enter="handleSearch"
            type="text"
            placeholder="搜索你想要的内容..."
          />
        </div>
        <button
          class="theme-toggle dots-toggle"
          @click="dotsPaused = !dotsPaused"
        >
          <svg v-if="dotsPaused" width="22" height="22" viewBox="0 0 24 24" fill="none" class="theme-icon">
            <path d="M8 5v14l11-7z" fill="currentColor"/>
          </svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" class="theme-icon">
            <line x1="8" y1="5" x2="8" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="16" y1="5" x2="16" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span class="btn-tip">{{ dotsPaused ? '开始点动' : '暂停点动' }}</span>
        </button>
        <button class="theme-toggle" @click="isDark = !isDark">
          <svg v-if="isDark" width="22" height="22" viewBox="0 0 24 24" fill="none" class="theme-icon">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="1.5" x2="12" y2="4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="19.5" x2="12" y2="22.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="1.5" y1="12" x2="4.5" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="19.5" y1="12" x2="22.5" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" class="theme-icon">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="btn-tip">{{ isDark ? '切换浅色模式' : '切换深色模式' }}</span>
        </button>
        <div v-if="user" class="user-box">
          <div class="user-info" @click="menuOpen = !menuOpen">
            <img :src="user.avatar" class="user-avatar" alt="" />
            <span class="user-name">{{ user.name }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div v-if="menuOpen" class="user-menu">
            <button @click="logout">退出登录</button>
          </div>
        </div>
        <button v-else class="btn-login" @click="loginOpen = true">登录</button>
      </div>
    </nav>

    <main v-if="view === 'home'" class="hero">
      <div class="hero-left">
        <h1 class="title">
          <img class="title-icon" src="/logo_icon.png" alt="" />
          码上启程
        </h1>
        <h2 class="subtitle">
          {{ subtitleDisplay }}<span class="cursor">|</span>
        </h2>
        <p class="desc">码上出发，即刻启程</p>
        <a href="#" class="cta-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="margin-left: -12px; margin-top: 3px;">
            <path d="M8 6 L3 12 L8 18 M16 6 L21 12 L16 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          开始学习
        </a>
      </div>

      <div class="hero-right">
        <div class="flip-scene">
          <div class="flip-trigger"
            @mouseenter="onTriggerEnter"
            @mouseleave="onTriggerLeave">
            <div ref="cardRef" class="flip-card"
              :class="{
                'flip-right': flipDir === 'right',
                'flip-left': flipDir === 'left',
                'flip-up': flipDir === 'up',
                'flip-down': flipDir === 'down'
              }">
              <!-- 正面 -->
              <div class="code-face">
                <div class="code-titlebar">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                  <span class="code-filename">正面</span>
                </div>
                <div ref="frontBody" class="code-body">
                  <pre>{{ frontDisplay }}<span class="type-cursor">▌</span></pre>
                </div>
              </div>

              <!-- 背面 -->
              <div class="code-face code-back"
                :class="{ 'back-x': flipDir === 'up' || flipDir === 'down' }">
                <div class="code-titlebar">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                  <span class="code-filename">背面</span>
                </div>
                <div ref="backBody" class="code-body">
                  <pre>{{ backDisplay }}<span class="type-cursor">▌</span></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 全部教程列表（本地学习 demo） -->
    <main v-else-if="view === 'tutorials'" class="tutorials-view">
      <aside class="t-sidebar">
        <h3>全部教程</h3>
        <nav class="t-toc">
          <button :class="{ active: category === '全部教程' }" @click="category = '全部教程'">全部教程</button>
          <button v-for="c in categories" :key="c" :class="{ active: category === c }" @click="category = c">{{ c }}</button>
        </nav>
      </aside>
      <div class="t-main">
        <div class="t-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#d4a843" stroke-width="2"/>
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#d4a843" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input v-model="searchText" type="search" placeholder="搜索教程名称或简介..." />
        </div>
        <template v-for="(g, gi) in filteredGroups" :key="gi">
          <h3 class="t-group-title">{{ g.cat }}</h3>
          <div class="t-cards">
            <button v-for="t in g.items" :key="t.name" class="t-card" @click="openTutorial(t)">
              <b>{{ t.name }}</b>
              <span>{{ t.desc }}</span>
            </button>
          </div>
        </template>
        <div v-if="filteredGroups.length === 0" class="t-empty">没有找到相关教程</div>
      </div>
    </main>

    <!-- 单个教程（章节 + 内容） -->
    <main v-else-if="view === 'tutorial'" class="tutorial-view">
      <aside class="t-sidebar">
        <button class="t-back" @click="backToTutorials">返回全部教程</button>
        <h3>{{ currentTutorial?.name }}</h3>
        <nav class="t-toc">
          <button
            v-for="(ch, i) in currentTutorial?.chapters || []"
            :key="i"
            :class="{ active: i === activeChapter }"
            @click="selectChapter(i)">{{ ch.title }}</button>
        </nav>
      </aside>
      <div class="t-content">
        <template v-if="currentTutorial">
          <h2>{{ currentTutorial.chapters[activeChapter].title }}</h2>
          <p v-for="(p, i) in currentTutorial.chapters[activeChapter].body.split('\n')" :key="i">{{ p }}</p>
          <div v-for="(code, k) in currentTutorial.chapters[activeChapter].examples" :key="k" class="t-example">
            <div class="t-example-title">
              <span>实例 {{ k + 1 }}</span>
              <button class="t-copy" @click="copyCode(code, $event)" aria-label="复制代码">
                <svg class="t-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span class="t-copy-tip">复制代码</span>
              </button>
            </div>
            <pre>{{ code }}</pre>
          </div>
        </template>
        <div v-else class="t-empty">正在加载教程数据…</div>
      </div>
    </main>

    <!-- 关于我 / 简历 -->
    <main v-else-if="view === 'resume'" class="resume-view">
      <div class="resume-card">
        <header class="r-header">
          <h1>个人简历</h1>
          <p class="r-target">求职意向：大数据技术助理（实习）</p>
          <div class="r-contact">
            <span>男 · 19岁 · 大专</span>
            <span>✉ 17745052115@163.com</span>
          </div>
        </header>

        <section class="r-section">
          <h2>教育经历</h2>
          <div class="r-item">
            <div class="r-item-head">
              <b>大数据技术（专科）</b>
              <span>2024.09 - 2027.06</span>
            </div>
            <p class="r-note">主修：Hadoop、数据采集、Linux、MySQL、网页设计、Excel 高级应用、人工智能应用</p>
          </div>
        </section>

        <section class="r-section">
          <h2>专业技能</h2>
          <ul class="r-list">
            <li>熟悉 Hadoop、Hive、Spark 环境部署与基础操作</li>
            <li>掌握 MySQL 表结构设计、数据存储配置</li>
            <li>了解 Flume、Kafka 数据传输链路基础搭建</li>
            <li>熟练使用 Excel 数据整理/统计、Office 办公套件</li>
          </ul>
        </section>

        <section class="r-section">
          <h2>项目经历</h2>
          <div class="r-item">
            <div class="r-item-head">
              <b>大数据基础环境部署项目 · 核心成员</b>
              <span>2025.01 - 2025.09</span>
            </div>
            <ul class="r-list">
              <li>参与 Hadoop、Hive、MySQL 环境部署，搭建数据存储与分析基础框架</li>
              <li>编写《大数据环境部署操作手册》，梳理关键步骤与常见问题方案</li>
              <li>配合完成 10+ 次环境测试，保障实验顺利开展，获专业课教师好评</li>
            </ul>
          </div>
          <div class="r-item">
            <div class="r-item-head">
              <b>新能源汽车数仓构建项目 · 核心成员</b>
              <span>2025.09 - 2026.01</span>
            </div>
            <ul class="r-list">
              <li>参与数仓需求分析，梳理 12 类车辆运行指标采集维度</li>
              <li>搭建 Flume、Kafka 采集链路，实现日志实时传输，单日处理 5000+ 条</li>
              <li>参与 MySQL 存储模块表结构设计，完成 3 张核心业务表字段定义</li>
            </ul>
          </div>
          <div class="r-item">
            <div class="r-item-head">
              <b>连锁超市数据可视化与高价值客户运营项目</b>
              <span>2025.05 - 2025.06</span>
            </div>
            <ul class="r-list">
              <li>用 FineBI 完成销售数据清洗，搭建可视化看板（饼图/折线图）</li>
              <li>运用 RFM 模型将客户分为 4 类，输出高价值客户运营建议</li>
              <li>方案被实训老师作为优秀案例展示，看板逻辑被同学复用</li>
            </ul>
          </div>
        </section>

        <section class="r-section">
          <h2>荣誉与在校经历</h2>
          <ul class="r-list">
            <li>普通话二级甲等 · 驾驶证</li>
            <li>大创俱乐部成员，参与"城院夜市"策划落地，对接 30+ 摊主，活动吸引 300+ 师生参与</li>
          </ul>
        </section>

        <section class="r-section">
          <h2>自我评价</h2>
          <p class="r-note">大数据技术专业，具备 Hadoop/Hive、数仓构建与 FineBI 可视化实践经验，擅长数据采集、清洗与分析，逻辑清晰、执行力强，能快速上手数据相关任务。</p>
        </section>
      </div>
    </main>

    <!-- 登录弹窗 -->
    <Transition name="modal">
      <div v-if="loginOpen" class="modal-mask" @click.self="loginOpen = false">
        <div class="login-modal">
          <button class="modal-close" @click="loginOpen = false" aria-label="关闭">✕</button>
          <div class="modal-left">
            <div class="modal-logo">
              <img class="modal-logo-icon" src="/logo_icon.png" alt="" />
              <span>码上启程</span>
            </div>
            <ul class="modal-features">
              <li>常用站点 · 一键直达</li>
              <li>AI 工具 · 实战进阶</li>
              <li>黑金风格 · 沉浸护眼</li>
            </ul>
          </div>
          <div class="modal-right">
            <h3 class="modal-title">登录</h3>
            <p class="modal-desc">登录后保存你的导航配置与偏好</p>
            <button class="oauth-btn github" @click="goGithub">GitHub 登录</button>
            <button class="oauth-btn gitee" disabled title="即将上线">Gitee 登录</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #0a0a0a;
  overflow: hidden;
  color: #fff;
  font-family: system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  transition: background 0.4s;
  user-select: none;
  -webkit-user-select: none;
}

/* 浅色模式 */
.page.light-mode {
  background: #F7F4EC;
  color: #1a1a1a;
}

.page.light-mode .nav {
  background: transparent;
}

.page.light-mode .nav.scrolled {
  background: rgba(247,244,236,0.8);
}

.page.light-mode .menu a { color: #888; }
.page.light-mode .menu a:hover,
.page.light-mode .menu a.active { color: #b8862e; }

.page.light-mode .search-box {
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
  color: #999;
}
.page.light-mode .search-box input { color: #b8862e; }

.page.light-mode .btn-login {
  border-color: #b8862e;
  color: #b8862e;
}
.page.light-mode .btn-login:hover {
  background: #b8862e;
  color: #fff;
}

.page.light-mode .user-info { color: #b8862e; }
.page.light-mode .user-info:hover { background: rgba(184,134,46,0.1); }
.page.light-mode .user-menu {
  background: #fff;
  border-color: #e8e0cc;
  box-shadow: 0 12px 32px rgba(120, 100, 60, 0.15);
}
.page.light-mode .user-menu button:hover {
  color: #b8862e;
  background: rgba(184,134,46,0.08);
}

.page.light-mode .title { color: #b8862e; }
.page.light-mode .subtitle { color: #1a1a1a; }
.page.light-mode .desc { color: #888; }

.page.light-mode .cta-btn {
  background: linear-gradient(135deg, #c9a038, #a67c26);
  color: #fff;
}

.page.light-mode .code-face {
  background: #faf8f2;
  border: 1px solid #e8e0cc;
  box-shadow: 0 20px 60px rgba(120, 100, 60, 0.15);
}

.page.light-mode .code-back { background: #faf8f2; }

.page.light-mode .code-titlebar {
  background: #f5f1e6;
  border-bottom: 1px solid #e8e0cc;
}

.page.light-mode .code-back .code-titlebar { background: #f5f1e6; }

.page.light-mode .code-filename { color: #999; }

.page.light-mode .code-body pre { color: #2d2d2d; }

.theme-toggle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1.5px solid rgba(212,168,67,0.4);
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
}
.theme-toggle:hover {
  border-color: #d4a843;
  background: rgba(212,168,67,0.1);
  box-shadow: 0 0 15px rgba(212,168,67,0.3);
}
.theme-toggle .theme-icon {
  color: rgba(212,168,67,0.7);
  transition: all 0.2s;
}
.theme-toggle:hover .theme-icon {
  color: #d4a843;
  filter: drop-shadow(0 0 5px rgba(212,168,67,0.6));
}

/* 悬停 1 秒后出现的提示框（同登录按钮：金边圆角方框） */
.btn-tip {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: rgba(20, 20, 42, 0.95);
  border: 1.5px solid #d4a843;
  border-radius: 10px;
  color: #d4a843;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 30;
}
.theme-toggle:hover .btn-tip {
  opacity: 1;
  transition-delay: 1s;
}
.page.light-mode .btn-tip {
  background: #faf8f2;
  border-color: #b8862e;
  color: #b8862e;
}

.dot-wrapper { position: absolute; inset: 0; z-index: 0; }

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 40px;
  background: transparent;
  transition: box-shadow 0.3s, background 0.3s;
}

.nav.scrolled {
  background: rgba(10,10,10,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.nav-left { display: flex; align-items: center; gap: 32px; }

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d4a843;
  font-size: 22px;
  font-weight: 700;
}

.logo-icon { width: 30px; height: 30px; }
.menu { display: flex; gap: 24px; }

.menu a {
  color: #999;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s;
  position: relative;
  padding: 4px 0;
}

.menu a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #d4a843;
  transition: width 0.3s;
}

.menu a:hover, .menu a.active { color: #d4a843; }
.menu a:hover::after, .menu a.active::after { width: 100%; }

.nav-right { display: flex; align-items: center; gap: 16px; }

.search-box {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(212,168,67,0.4);
  border-radius: 12px;
  padding: 8px 18px;
  color: #666;
  font-size: 14px;
  width: 240px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: box-shadow 0.3s;
}

.search-box:hover, .search-box:focus-within {
  border-color: rgba(212,168,67,0.8);
  box-shadow: 0 0 25px rgba(212,168,67,0.25);
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #d4a843;
  font-size: 14px;
  width: 100%;
}

.search-box input::placeholder {
  color: #666;
}

.btn-login {
  border: 1.5px solid #d4a843;
  color: #d4a843;
  padding: 7px 22px;
  border-radius: 10px;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-login:hover { background: #d4a843; color: #000; }

/* GitHub 登录用户区 */
.user-box { position: relative; }

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 10px;
  cursor: pointer;
  color: #d4a843;
  transition: background 0.2s;
}

.user-info:hover { background: rgba(212,168,67,0.12); }

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid #d4a843;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  min-width: 120px;
  padding: 4px;
  background: #14142a;
  border: 1px solid rgba(212,168,67,0.3);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.5);
}

.user-menu button {
  width: 100%;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: none;
  color: #999;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.user-menu button:hover {
  color: #d4a843;
  background: rgba(212,168,67,0.1);
}

/* 登录弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-modal {
  position: relative;
  width: 800px;
  max-width: 92vw;
  height: 450px;
  max-height: 88vh;
  border-radius: 16px;
  background: #1a1a2e; /* 深色模式下：深底浅字 */
  color: #e6edf3;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  display: flex;
  overflow: hidden;
}

.page.light-mode .login-modal {
  background: #F7F4EC; /* 与页面浅色背景一致：浅底深字 */
  color: #1a1a1a;
  box-shadow: 0 24px 80px rgba(120, 100, 60, 0.35);
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  z-index: 1;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-close:hover { background: rgba(255, 255, 255, 0.1); }
.page.light-mode .modal-close:hover { background: rgba(0, 0, 0, 0.08); }

.modal-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
  padding: 48px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.page.light-mode .modal-left { border-right-color: rgba(0, 0, 0, 0.08); }

.modal-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: #d4a843;
}

.page.light-mode .modal-logo { color: #a67c26; }

.modal-logo-icon { width: 40px; height: 40px; }

.modal-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #aab;
}

.page.light-mode .modal-features li { color: #444; }

.modal-features li::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d4a843;
}

.page.light-mode .modal-features li::before { background: #a67c26; }

.modal-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  gap: 16px;
  padding: 48px;
}

.modal-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: #d4a843;
}

.page.light-mode .modal-title { color: #a67c26; }

.modal-desc {
  margin: -4px 0 8px;
  font-size: 14px;
  text-align: center;
  color: #8a8aa0;
}

.page.light-mode .modal-desc { color: #888; }

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px;
  border-radius: 10px;
  border: 1.5px solid transparent;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.oauth-btn.github {
  background: #F7F4EC;
  border-color: #d4a843;
  color: #1a1a1a;
}

.page.light-mode .oauth-btn.github { background: #1a1a2e; border-color: #b8862e; color: #e6edf3; }
.page.light-mode .oauth-btn.gitee { background: #1a1a2e; border-color: #b8862e; color: #e6edf3; }

.oauth-btn.github:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(36, 41, 46, 0.3);
}

.oauth-btn.gitee {
  background: #F7F4EC;
  border-color: #d4a843;
  color: #1a1a1a;
  cursor: not-allowed;
}

/* 弹窗过渡 */
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s; }
.modal-enter-active .login-modal, .modal-leave-active .login-modal { transition: transform 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .login-modal, .modal-leave-to .login-modal { transform: scale(0.94) translateY(10px); }

/* 教程列表视图（全部教程） */
.tutorials-view {
  position: relative;
  z-index: 5;
  display: flex;
  gap: 20px;
  margin-top: 56px;
  padding: 24px;
  min-height: calc(100vh - 80px);
  align-items: flex-start;
}

.t-main { flex: 1; min-width: 0; }

.t-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 168, 67, 0.4);
  border-radius: 12px;
  padding: 10px 18px;
  margin-bottom: 24px;
  transition: box-shadow 0.3s, border-color 0.3s;
}

.t-search:hover, .t-search:focus-within {
  border-color: rgba(212, 168, 67, 0.8);
  box-shadow: 0 0 25px rgba(212, 168, 67, 0.25);
}

.t-search input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #d4a843;
  font-size: 14px;
}

.t-search input::placeholder { color: #666; }

.t-group-title {
  margin: 26px 0 14px;
  font-size: 17px;
  color: #d4a843;
  display: flex;
  align-items: center;
  gap: 10px;
}

.t-group-title::before {
  content: '';
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: #d4a843;
}

.t-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
}

.t-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px;
  background: rgba(20, 20, 42, 0.85);
  border: 1px solid rgba(212, 168, 67, 0.15);
  border-radius: 12px;
  color: #e6edf3;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  content-visibility: auto;
  contain-intrinsic-size: 120px;
}

.t-card:hover {
  transform: translateY(-2px);
  border-color: rgba(212, 168, 67, 0.7);
  box-shadow: 0 8px 24px rgba(212, 168, 67, 0.15);
}

.t-card b { font-size: 15px; color: #d4a843; font-weight: 600; }
.t-card span { font-size: 13px; color: #999; line-height: 1.6; }

.t-back {
  width: 100%;
  padding: 14px 22px;
  background: transparent;
  border: 1.5px solid rgba(212, 168, 67, 0.4);
  border-radius: 10px;
  color: #d4a843;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.t-back:hover { background: rgba(212, 168, 67, 0.12); }

.page.light-mode .t-search { background: rgba(0, 0, 0, 0.02); border-color: rgba(0, 0, 0, 0.05); }
.page.light-mode .t-search input { color: #b8862e; }
.page.light-mode .t-search input::placeholder { color: #999; }
.page.light-mode .t-card { background: #fff; border-color: #e8e0cc; color: #1a1a1a; }
.page.light-mode .t-card:hover { border-color: #b8862e; box-shadow: 0 8px 24px rgba(120, 100, 60, 0.15); }
.page.light-mode .t-card b { color: #b8862e; }
.page.light-mode .t-card span { color: #888; }

/* 教程视图（站内切换） */
.tutorial-view {
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

.t-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: rgba(20, 20, 42, 0.85);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.t-sidebar .t-back { flex-shrink: 0; margin: 0; width: 100%; border: 1.5px solid rgba(212, 168, 67, 0.4); border-radius: 14px; background: rgba(20, 20, 42, 0.5); }
.t-sidebar .t-back:hover { background: rgba(212, 168, 67, 0.12); }

.t-sidebar h3 {
  margin: 0;
  padding: 16px 20px;
  font-size: 16px;
  color: #d4a843;
  border-bottom: 1px solid rgba(212, 168, 67, 0.2);
}

.t-toc { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 0; scrollbar-width: thin; scrollbar-color: rgba(212, 168, 67, 0.55) transparent; }
.t-toc::-webkit-scrollbar { width: 6px; }
.t-toc::-webkit-scrollbar-track { background: transparent; }
.t-toc::-webkit-scrollbar-thumb { background: rgba(212, 168, 67, 0.55); border-radius: 3px; }
.t-toc::-webkit-scrollbar-thumb:hover { background: rgba(212, 168, 67, 0.5); }

.t-toc button {
  display: block;
  width: 100%;
  padding: 10px 20px;
  background: none;
  border: none;
  border-left: 3px solid transparent;
  color: #999;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.t-toc button:hover { color: #d4a843; background: rgba(212, 168, 67, 0.06); }
.t-toc button.active { color: #d4a843; border-left-color: #d4a843; background: rgba(212, 168, 67, 0.1); }

.t-content {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 168, 67, 0.55) transparent;
  background: #16162a;
  border-radius: 14px;
  padding: 32px 40px;
  user-select: text;
  -webkit-user-select: text;
}
.t-content::-webkit-scrollbar { width: 6px; }
.t-content::-webkit-scrollbar-track { background: transparent; }
.t-content::-webkit-scrollbar-thumb { background: rgba(212, 168, 67, 0.55); border-radius: 3px; }
.t-content::-webkit-scrollbar-thumb:hover { background: rgba(212, 168, 67, 0.5); }

.t-content h2 { margin: 0 0 20px; font-size: 24px; color: #d4a843; }
.t-content p { margin: 0 0 14px; font-size: 15px; line-height: 1.9; color: #c9d1d9; }

.t-example { margin: 18px 0; border: 1px solid rgba(212, 168, 67, 0.25); border-radius: 10px; overflow: hidden; }
.t-example-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 8px 8px 16px; background: #1c1c34; color: #d4a843; font-size: 13px; border-bottom: 1px solid rgba(212, 168, 67, 0.15); }
.t-copy { position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; background: rgba(20, 20, 42, 0.8); border: 1px solid rgba(212, 168, 67, 0.65); border-radius: 8px; color: rgba(212, 168, 67, 0.65); cursor: pointer; transition: all 0.2s; }
.t-copy-icon { display: block; width: 14px; height: 14px; }
.t-copy:hover { border-color: #ffd97a; background: rgba(212, 168, 67, 0.08); box-shadow: 0 0 6px rgba(212, 168, 67, 0.2); }
.t-copy:hover .t-copy-icon { color: #ffe1a0; filter: drop-shadow(0 0 2px rgba(212, 168, 67, 0.4)); }
.t-copy.copied { border-color: #ffd97a; background: rgba(212, 168, 67, 0.15); }
.t-copy-tip { position: absolute; top: calc(100% + 8px); right: 0; padding: 5px 10px; background: rgba(20, 20, 42, 0.95); border: 1.5px solid #d4a843; border-radius: 8px; color: #d4a843; font-size: 12px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.2s ease; z-index: 20; }
.t-copy:hover .t-copy-tip { opacity: 1; transition-delay: 0.5s; }
.t-copy.copied .t-copy-tip { opacity: 1; transition-delay: 0s; }
.t-example pre { margin: 0; padding: 16px; font-family: Consolas, Monaco, monospace; font-size: 13px; line-height: 1.7; color: #a5d6ff; white-space: pre-wrap; word-break: break-all; overflow-x: auto; }

.t-empty { padding: 60px; text-align: center; color: #666; font-size: 15px; }

.page.light-mode .t-sidebar { background: rgba(255, 255, 255, 0.9); }
.page.light-mode .t-sidebar .t-back { background: #f5f1e6; border-color: rgba(184, 134, 46, 0.5); color: #b8862e; }
.page.light-mode .t-sidebar .t-back:hover { background: #eee7d2; }
.page.light-mode .t-toc::-webkit-scrollbar-thumb { background: #d4a843; }
.page.light-mode .t-toc { scrollbar-color: #d4a843 transparent; }
.page.light-mode .t-content::-webkit-scrollbar-thumb { background: #d4a843; }
.page.light-mode .t-content { scrollbar-color: #d4a843 transparent; }
.page.light-mode .t-content { background: #faf8f2; }
.page.light-mode .t-content p { color: #444; }
.page.light-mode .t-example-title { background: #f5f1e6; }
.page.light-mode .t-copy { color: rgba(184, 134, 46, 0.65); border-color: rgba(184, 134, 46, 0.65); background: rgba(255, 255, 255, 0.9); }
.page.light-mode .t-copy:hover, .page.light-mode .t-copy.copied { border-color: #b8862e; background: rgba(184, 134, 46, 0.06); box-shadow: 0 0 6px rgba(184, 134, 46, 0.18); }
.page.light-mode .t-copy:hover .t-copy-icon { color: #b8862e; filter: drop-shadow(0 0 2px rgba(184, 134, 46, 0.35)); }
.page.light-mode .t-copy-tip { background: #fff; border-color: #b8862e; color: #b8862e; }
.page.light-mode .t-example pre { color: #3b4a63; }
.page.light-mode .t-toc button { color: #888; }
.page.light-mode .t-toc button:hover,
.page.light-mode .t-toc button.active { color: #b8862e; }

.hero {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 80px;
  min-height: calc(100vh - 80px);
  gap: 80px;
  margin-top: 80px;
}

.hero-left { flex: 1; max-width: 600px; margin-left: 60px; }

.title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 64px;
  font-weight: 800;
  color: #d4a843;
  margin: 0 0 20px;
  letter-spacing: 2px;
}

.title-icon { width: 60px; height: 60px; flex-shrink: 0; margin-top: 2px; margin-left: 1px; }

.subtitle {
  font-size: 42px;
  font-weight: 400;
  color: #fff;
  margin: 0 0 16px;
}

.cursor { animation: blink-color 1s infinite; }

@keyframes blink-color {
  0%, 50% { color: #d4a843; }
  51%, 100% { color: #ffffff; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.desc { font-size: 20px; color: #888; margin: 0 0 36px; }

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #d4a843, #b8862e);
  color: #000;
  padding: 14px 36px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-left: 0;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212,168,67,0.3);
}

/* 3D 翻转卡片 */
.hero-right {
  flex: 1;
  display: flex;
  justify-content: center;
}

.flip-scene {
  width: 560px;
  height: 460px;
  perspective: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-trigger {
  width: 560px;
  height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-card {
  position: relative;
  width: 520px;
  max-width: 100%;
  height: 380px;
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  will-change: transform;
  transform: translateZ(0);
}

.flip-card.flip-right {
  transform: rotateY(180deg);
}

.flip-card.flip-left {
  transform: rotateY(-180deg);
}

.flip-card.flip-up {
  transform: rotateX(-180deg);
}

.flip-card.flip-down {
  transform: rotateX(180deg);
}

.code-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: #16162a;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
}

.code-back {
  transform: rotateY(180deg);
  background: #16162a;
}

.code-back.back-x {
  transform: rotateX(180deg);
}

.code-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #12121f;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.code-back .code-titlebar {
  background: #12121f;
}

.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot.red { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green { background: #28c840; }

.code-filename { margin-left: 12px; color: #666; font-size: 13px; }

.code-body {
  padding: 16px 24px 24px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.8;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.code-body::-webkit-scrollbar {
  width: 6px;
}

.code-body::-webkit-scrollbar-track {
  background: transparent;
}

.code-body::-webkit-scrollbar-thumb {
  background: rgba(212,168,67,0.2);
  border-radius: 3px;
}

.code-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: #e6edf3;
  font-weight: 400;
}

.type-cursor { color: #d4a843; animation: blink 0.8s infinite; }

/* === 关于我 / 简历 === */
.resume-view {
  max-width: 860px;
  margin: 0 auto;
  padding: 110px 24px 60px;
  user-select: text;
  -webkit-user-select: text;
}
.resume-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(212,168,67,0.35);
  border-radius: 16px;
  padding: 40px 44px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.r-header { margin-bottom: 28px; }
.r-header h1 {
  font-size: 34px;
  font-weight: 700;
  color: #d4a843;
  margin: 0 0 6px;
}
.r-target { margin: 0 0 12px; color: #ccc; font-size: 16px; }
.r-contact { display: flex; flex-wrap: wrap; gap: 18px; color: #999; font-size: 14px; }
.r-section { margin-top: 26px; }
.r-section h2 {
  font-size: 18px;
  color: #d4a843;
  margin: 0 0 14px;
  padding-left: 12px;
  border-left: 3px solid #d4a843;
}
.r-item { margin-bottom: 16px; }
.r-item-head {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 15px;
}
.r-item-head b { color: #f0d878; }
.r-item-head span { color: #888; font-size: 13px; }
.r-list { margin: 6px 0 0; padding-left: 20px; color: #ccc; font-size: 14px; line-height: 1.8; }
.r-note { margin: 4px 0 0; color: #bbb; font-size: 14px; line-height: 1.8; }

/* 浅色模式 */
.page.light-mode .resume-card {
  background: #faf8f2;
  border-color: #e8e0cc;
  box-shadow: 0 20px 60px rgba(120,100,60,0.15);
}
.page.light-mode .r-header h1 { color: #b8862e; }
.page.light-mode .r-target, .page.light-mode .r-list, .page.light-mode .r-note { color: #333; }
.page.light-mode .r-contact { color: #888; }
.page.light-mode .r-section h2 { color: #b8862e; border-left-color: #b8862e; }
.page.light-mode .r-item-head b { color: #8a6520; }
.page.light-mode .r-item-head span { color: #999; }

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    padding: 40px 20px;
    text-align: center;
  }
  .title { font-size: 36px; justify-content: center; }
  .subtitle { font-size: 24px; }
  .menu, .search-box { display: none; }
  .hero-left { max-width: 100%; }
  .resume-view { padding: 90px 14px 40px; }
  .resume-card { padding: 24px 18px; }
}
</style>
