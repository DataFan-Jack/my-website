<script setup>
// 笔记 Markdown 渲染器：解析节点树，html 节点按黑金风格渲染，:::diagram 渲染为图解组件
// 深色/浅色双主题：浅色模式由祖先 .page.light-mode 驱动
import { ref, watch, nextTick } from 'vue'
import { parseMarkdown } from '../../lib/markdown.js'
import NoteDiagram from './NoteDiagram.vue'

const props = defineProps({
  markdown: { type: String, default: '' },
})

const nodes = ref([])
const rootRef = ref(null)

watch(
  () => props.markdown,
  (md) => {
    nodes.value = parseMarkdown(md || '')
  },
  { immediate: true }
)

// 渲染完成后给代码块注入复制按钮
watch(
  nodes,
  async () => {
    await nextTick()
    const box = rootRef.value
    if (!box) return
    box.querySelectorAll('.nm-html pre').forEach((pre) => {
      if (pre.querySelector('.nm-copy')) return
      const btn = document.createElement('button')
      btn.className = 'nm-copy'
      btn.textContent = '复制'
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')
        if (!code) return
        try {
          await navigator.clipboard.writeText(code.innerText)
        } catch (e) {
          /* 剪贴板不可用时静默失败 */
        }
        btn.textContent = '已复制'
        setTimeout(() => {
          btn.textContent = '复制'
        }, 1500)
      })
      pre.appendChild(btn)
    })
  },
  { immediate: true }
)
</script>

<template>
  <div ref="rootRef" class="nm-md">
    <template v-for="(n, i) in nodes" :key="i">
      <NoteDiagram v-if="n.type === 'diagram'" :kind="n.data.kind" />
      <div v-else-if="n.html" class="nm-html" v-html="n.html"></div>
    </template>
  </div>
</template>

<style scoped>
.nm-html {
  color: #cccccc;
  font-size: 15px;
  line-height: 1.75;
  user-select: text;
  -webkit-user-select: text;
}
.nm-html :deep(h1),
.nm-html :deep(h2) {
  margin: 28px 0 12px;
  padding-bottom: 10px;
  font-size: 24px;
  line-height: 1.4;
  color: #ffffff;
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
  position: relative;
}
.nm-html :deep(h1)::before,
.nm-html :deep(h2)::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 56px;
  height: 2px;
  background: #d4af37;
}
.nm-html :deep(h3) {
  margin: 22px 0 10px;
  padding-left: 12px;
  font-size: 19px;
  color: #d4af37;
  position: relative;
}
.nm-html :deep(h3)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: #d4af37;
}
.nm-html :deep(p) {
  margin: 0 0 10px;
}
.nm-html :deep(strong) {
  color: #d4af37;
  font-weight: 600;
}
.nm-html :deep(ul),
.nm-html :deep(ol) {
  margin: 0 0 12px;
  padding-left: 24px;
}
.nm-html :deep(li) {
  margin-bottom: 6px;
}
.nm-html :deep(li::marker) {
  color: #d4af37;
}
.nm-html :deep(ol li::marker) {
  color: #d4af37;
  font-weight: 600;
}
.nm-html :deep(a) {
  color: #d4af37;
}
.nm-html :deep(hr) {
  border: none;
  border-top: 1px solid rgba(212, 175, 55, 0.25);
  margin: 16px 0;
}
.nm-html :deep(blockquote) {
  margin: 0 0 12px;
  padding: 10px 14px;
  border-left: 3px solid #d4af37;
  background: rgba(212, 175, 55, 0.06);
  border-radius: 8px;
  color: #cccccc;
}
.nm-html :deep(blockquote p) {
  margin: 0;
}
.nm-html :deep(code) {
  background: rgba(212, 175, 55, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  color: #f0d878;
  font-size: 13px;
  font-family: Consolas, Monaco, monospace;
}
.nm-html :deep(pre) {
  position: relative;
  margin: 0 0 12px;
  padding: 14px 18px;
  background: #111111;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  overflow-x: auto;
}
.nm-html :deep(.nm-copy) {
  position: absolute;
  top: 8px;
  right: 10px;
  padding: 3px 10px;
  font-size: 12px;
  line-height: 1.6;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.nm-html :deep(.nm-copy:hover) {
  background: rgba(212, 175, 55, 0.18);
}
.nm-html :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #e8e0c8;
  font-size: 13.5px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}
.nm-html :deep(table) {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  margin: 0 0 12px;
  font-size: 14px;
  background: #111111;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  overflow: hidden;
}
.nm-html :deep(th),
.nm-html :deep(td) {
  padding: 9px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(212, 175, 55, 0.08);
}
.nm-html :deep(th) {
  color: #d4af37;
  font-weight: 600;
  background: rgba(212, 175, 55, 0.1);
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
}
.nm-html :deep(tbody tr:last-child td) {
  border-bottom: none;
}
.nm-html :deep(td) {
  color: #cccccc;
}
.nm-html :deep(tbody tr:hover) {
  background: rgba(212, 175, 55, 0.04);
}
.nm-html :deep(td:first-child) {
  color: #ffffff;
  white-space: nowrap;
}

/* ===== 浅色模式 ===== */
.page.light-mode .nm-html {
  color: #444444;
}
.page.light-mode .nm-html :deep(h1),
.page.light-mode .nm-html :deep(h2) {
  color: #1a1a1a;
  border-bottom-color: rgba(184, 134, 46, 0.25);
}
.page.light-mode .nm-html :deep(h1)::before,
.page.light-mode .nm-html :deep(h2)::before {
  background: #b8862e;
}
.page.light-mode .nm-html :deep(h3) {
  color: #b8862e;
}
.page.light-mode .nm-html :deep(h3)::before {
  background: #b8862e;
}
.page.light-mode .nm-html :deep(strong) {
  color: #8a6520;
}
.page.light-mode .nm-html :deep(li::marker) {
  color: #b8862e;
}
.page.light-mode .nm-html :deep(ol li::marker) {
  color: #b8862e;
}
.page.light-mode .nm-html :deep(a) {
  color: #b8862e;
}
.page.light-mode .nm-html :deep(hr) {
  border-top-color: rgba(184, 134, 46, 0.3);
}
.page.light-mode .nm-html :deep(blockquote) {
  border-left-color: #b8862e;
  background: #f5f1e6;
  color: #444444;
}
.page.light-mode .nm-html :deep(code) {
  background: rgba(184, 134, 46, 0.12);
  color: #8a6520;
}
.page.light-mode .nm-html :deep(pre) {
  background: #faf8f2;
  border-color: rgba(184, 134, 46, 0.3);
}
.page.light-mode .nm-html :deep(.nm-copy) {
  color: #b8862e;
  background: rgba(184, 134, 46, 0.08);
  border-color: rgba(184, 134, 46, 0.35);
}
.page.light-mode .nm-html :deep(.nm-copy:hover) {
  background: rgba(184, 134, 46, 0.16);
}
.page.light-mode .nm-html :deep(pre code) {
  color: #3b4a63;
}
.page.light-mode .nm-html :deep(table) {
  background: #ffffff;
  border-color: rgba(184, 134, 46, 0.25);
}
.page.light-mode .nm-html :deep(th) {
  color: #b8862e;
  background: #f5f1e6;
  border-bottom-color: rgba(184, 134, 46, 0.25);
}
.page.light-mode .nm-html :deep(td) {
  color: #444444;
  border-bottom-color: rgba(184, 134, 46, 0.08);
}
.page.light-mode .nm-html :deep(tbody tr:hover) {
  background: rgba(184, 134, 46, 0.04);
}
.page.light-mode .nm-html :deep(td:first-child) {
  color: #1a1a1a;
}
</style>
