// 轻量 Markdown → 节点树转换器（本地内容，仍做基础转义防 XSS）
// 支持：标题 / 列表 / 表格 / 引用 / 代码块 / 链接 / 加粗 / 斜体 / 行内代码 / 分隔线
// 自定义块（由 LifeGuideMarkdown 渲染为组件）：
//   :::article → { type:'article', data:{title,tags,summary,cost,benefit,remark,sources} }
//   :::collapse → { type:'collapse', data:{title,content} }

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// 行内格式：代码 / 链接（[text](url) 与裸 <url>）/ 加粗 / 斜体（先转义再替换，避免注入）
function inline(s) {
  s = escapeHtml(s)
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
  // [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
  )
  // 裸 URL：<https://...>（转义后 < > 已变为 &lt; &gt;）
  s = s.replace(/&lt;(https?:\/\/[^&]+?)&gt;/g, (m, url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  )
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return s
}

function isTableSep(line) {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-') && line.includes('|')
}

function parseTable(lines) {
  const rows = lines.map((l) =>
    l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
  )
  let html = '<table><thead><tr>'
  for (const h of rows[0]) html += `<th>${inline(h)}</th>`
  html += '</tr></thead><tbody>'
  for (const r of rows.slice(2)) {
    html += '<tr>'
    for (const c of r) html += `<td>${inline(c)}</td>`
    html += '</tr>'
  }
  return html + '</tbody></table>'
}

// 来源行解析："名称 <url>"，支持 ；或 ; 分隔
function parseSources(s) {
  return String(s)
    .split(/[；;]/)
    .map((item) => {
      const t = item.trim()
      if (!t) return null
      const m = t.match(/^(.*?)\s*<(https?:\/\/[^>]+)>$/)
      return m ? { name: m[1].trim(), url: m[2] } : { name: t, url: '' }
    })
    .filter(Boolean)
}

const FIELDS = new Set(['title', 'tags', 'summary', 'cost', 'benefit', 'remark', 'sources', 'content'])

// 解析自定义块（:::article / :::collapse 之间的内容行）
function parseCustomBlock(lines) {
  const data = {}
  let current = null
  for (const line of lines) {
    const m = line.match(/^\s*([a-zA-Z\u4e00-\u9fa5]+):\s*(.*)$/)
    if (m && FIELDS.has(m[1])) {
      current = m[1]
      if (m[1] === 'tags') {
        data.tags = (data.tags || []).concat(m[2].split(/[,，、]/).map((s) => s.trim()).filter(Boolean))
      } else if (m[1] === 'sources') {
        data.sources = (data.sources || []).concat(parseSources(m[2]))
      } else {
        data[m[1]] = m[2]
      }
    } else if (current === 'content' && data.content !== undefined) {
      // content 支持跨行（如术语表长文）
      if (line.trim()) data.content += '\n' + line
    } else if (current === 'sources' && data.sources) {
      // sources 支持多行，每行一个来源
      data.sources = data.sources.concat(parseSources(line))
    }
    // 其余行忽略
  }
  data.tags = data.tags || []
  data.sources = data.sources || []
  return data
}

// 主入口：markdown 字符串 -> 节点数组
export function parseMarkdown(md) {
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n')
  const nodes = []
  let htmlBuf = []
  let openList = null
  let para = []
  let i = 0

  const flushHtml = () => {
    if (htmlBuf.length) nodes.push({ type: 'html', html: htmlBuf.join('') })
    htmlBuf = []
  }
  const closePara = () => {
    if (para.length) htmlBuf.push(`<p>${inline(para.join(' '))}</p>`)
    para = []
  }
  const closeList = () => {
    if (openList) htmlBuf.push(`</${openList}>`)
    openList = null
  }
  const beginBlock = () => {
    closePara()
    closeList()
  }

  while (i < lines.length) {
    const line = lines[i]

    // 自定义块：:::article / :::collapse ... :::
    const fm = line.match(/^\s*:::\s*(\w+)\s*$/)
    if (fm) {
      beginBlock()
      flushHtml()
      const type = fm[1]
      const buf = []
      i++
      while (i < lines.length && !/^\s*:::\s*$/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++ // 跳过闭合 :::
      if (type === 'article') {
        nodes.push({ type: 'article', data: parseCustomBlock(buf) })
      } else if (type === 'collapse') {
        nodes.push({ type: 'collapse', data: parseCustomBlock(buf) })
      } else {
        // 未知块：按普通文本回退
        htmlBuf.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`)
      }
      continue
    }

    // 围栏代码块
    if (/^\s*```/.test(line)) {
      beginBlock()
      i++
      const buf = []
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++
      htmlBuf.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`)
      continue
    }

    // 表格
    if (/^\s*\|/.test(line)) {
      beginBlock()
      const tbl = []
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        tbl.push(lines[i])
        i++
      }
      if (tbl.length >= 2 && isTableSep(tbl[1])) htmlBuf.push(parseTable(tbl))
      else htmlBuf.push(`<p>${inline(tbl.join(' '))}</p>`)
      continue
    }

    // 标题
    const h = line.match(/^\s*(#{1,4})\s+(.*)$/)
    if (h) {
      beginBlock()
      htmlBuf.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`)
      i++
      continue
    }

    // 引用
    if (/^\s*>/.test(line)) {
      beginBlock()
      const bq = []
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        bq.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      htmlBuf.push(`<blockquote>${renderHtml(bq.join('\n'))}</blockquote>`)
      continue
    }

    // 无序列表
    if (/^\s*[-*+]\s+/.test(line)) {
      closePara()
      if (openList !== 'ul') {
        closeList()
        openList = 'ul'
        htmlBuf.push('<ul>')
      }
      htmlBuf.push(`<li>${inline(line.replace(/^\s*[-*+]\s+/, ''))}</li>`)
      i++
      continue
    }

    // 有序列表
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/)
    if (ol) {
      closePara()
      if (openList !== 'ol') {
        closeList()
        openList = 'ol'
        htmlBuf.push('<ol>')
      }
      htmlBuf.push(`<li>${inline(ol[1])}</li>`)
      i++
      continue
    }

    // 分隔线
    if (/^\s*---+\s*$/.test(line)) {
      beginBlock()
      htmlBuf.push('<hr>')
      i++
      continue
    }

    // 空行
    if (/^\s*$/.test(line)) {
      closePara()
      closeList()
      i++
      continue
    }

    para.push(line.trim())
    i++
  }

  closePara()
  closeList()
  flushHtml()
  return nodes
}

// 纯 HTML 渲染（供引用块递归等场景）
export function renderHtml(md) {
  return parseMarkdown(md).map((n) => (n.type === 'html' ? n.html : '')).join('')
}

// 从整篇 Markdown 中提取第一张 :::article 卡片数据（供文章列表/搜索）
export function extractArticleData(md) {
  const node = parseMarkdown(md).find((n) => n.type === 'article')
  return node ? node.data : null
}

// 提取全部 :::article 卡片数据（一章可含多张卡片）
export function extractArticles(md) {
  return parseMarkdown(md).filter((n) => n.type === 'article').map((n) => n.data)
}
