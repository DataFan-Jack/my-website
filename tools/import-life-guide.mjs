// 一次性导入脚本：从 HowToLiveBetter 仓库抓取 book/01-34.md，
// 解析条目 → 生成人生指南 :::article 卡片文件（22 个分类）
// 运行：node tools/import-life-guide.mjs
import { writeFileSync, mkdirSync } from 'node:fs'

const BASE = 'https://raw.githubusercontent.com/eternity4719/HowToLiveBetter/main/book/'

// 34 章 → 码上启程人生指南分类 key（用户 22 分类）
const CHAPTERS = [
  ['01-不要早死.md', 'dont_die_early'],
  ['02-不要慢慢死.md', 'dont_die_slowly'],
  ['03-不要浪费精力.md', 'dont_waste_energy'],
  ['04-不要浪费时间.md', 'dont_waste_time'],
  ['05-不要浪费钱.md', 'dont_waste_money'],
  ['06-反面清单.md', 'anti_list'],
  ['07-没钱的时候怎么活.md', 'how_to_live_broke'],
  ['08-别把自己搭进去.md', 'legal_personal_safety'],
  ['09-普通人容易踩的法律红线.md', 'legal_redlines'],
  ['10-恋爱和结婚划不划算.md', 'love_marriage'],
  ['11-程序员和技术人容易踩的红线.md', 'programmer_pitfalls'],
  ['12-创业与做生意.md', 'business'],
  ['13-紧急情况.md', 'emergencies'],
  ['14-账号与信息安全.md', 'account_security'],
  ['15-租房与买房.md', 'housing'],
  ['16-得了慢性病之后怎么活.md', 'medical_health'],
  ['17-家里有老人.md', 'elderly_life'],
  ['18-养孩子划不划算.md', 'marriage_childbirth'],
  ['19-在职离职和工伤.md', 'social_security_pension'],
  ['20-刚出生的孩子怎么带.md', 'marriage_childbirth'],
  ['21-出国旅行与境外安全.md', 'emigration'],
  ['22-怎么放松.md', 'diet_exercise'],
  ['23-学什么技能划算.md', 'dont_waste_time'],
  ['24-看病.md', 'medical_health'],
  ['25-人走了以后要办什么.md', 'elderly_life'],
  ['26-做一个网站或平台.md', 'business'],
  ['27-怀孕和生产.md', 'marriage_childbirth'],
  ['28-别为了外形把身体搞坏.md', 'diet_exercise'],
  ['29-遭遇重大打击之后.md', 'emergencies'],
  ['30-上学以后的孩子.md', 'marriage_childbirth'],
  ['31-十八岁之后有哪几条路.md', 'dont_waste_time'],
  ['32-出国留学.md', 'emigration'],
  ['33-残疾之后怎么活.md', 'social_security_pension'],
  ['34-家里的常备药别吃出事.md', 'medical_health'],
]

const FIELDS = ['成本', '说人话', '收益', '证据等级', '来源', '备注']
const INSURANCE_HIT = /保险|车险|医保|养老金/
const KEY = { 成本: 'cost', 说人话: 'summary', 收益: 'benefit', 来源: 'sources', 备注: 'remark' }

function parseMeta(s) {
  const o = {}
  for (const part of String(s).split(' ')) {
    const [k, v] = part.split('=')
    if (k && v !== undefined) o[k] = v
  }
  return o
}

function parseChapter(md) {
  const entries = []
  let cur = null
  for (const line of String(md).split('\n')) {
    const h = line.match(/^###\s+\d+\.\s+(.+)$/)
    if (h) {
      if (cur) entries.push(cur)
      cur = { title: h[1].trim(), meta: null, evid: '', cost: '', summary: '', benefit: '', sources: '', remark: '', last: null }
      continue
    }
    if (!cur) continue
    const meta = line.match(/^<!--\s*成本标签:\s*(.*?)\s*-->$/)
    if (meta) { cur.meta = parseMeta(meta[1]); continue }
    const f = line.match(/^-\s*([^：:]+)[：:]\s*(.*)$/)
    if (f && FIELDS.includes(f[1])) {
      if (f[1] === '证据等级') cur.evid = f[2].trim().toUpperCase().replace(/级/, '')
      else cur[KEY[f[1]]] += f[2]
      cur.last = f[1]
      continue
    }
    if (line.match(/^### |^<!--/) || /^-\s*[^：:]+[：:]/.test(line)) continue
    if (cur.last && cur.last !== '证据等级' && line.trim()) {
      cur[KEY[cur.last]] += ' ' + line.trim()
    }
  }
  if (cur) entries.push(cur)
  return entries
}

// 字段压成单行 + 锚点链接转纯文本（外部链接保留）
function clean(s) {
  return String(s || '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\[([^\]]+)\]\(#[^)]*\)/g, '$1')
    .trim()
}

function tagsFrom(e) {
  const t = []
  const m = e.meta || {}
  const price = { 大: '性价比 极高', 中: '性价比 高', 小: '性价比 一般' }[m.收益] || '性价比 一般'
  t.push(price)
  t.push(`证据 ${e.evid || 'B'}级`)
  if (m.口径 === '金钱') t.push('换钱')
  if (m.钱 === '0' || m.钱 === '少') t.push('省钱')
  if (m.毅力 === '否') t.push('顺手')
  if (/TODO|待核实|暂未核实/.test(e.remark + e.sources)) t.push('需要核实')
  return t
}

function buildArticle(e) {
  const lines = [':::article', `title:${clean(e.title)}`, `tags:${tagsFrom(e).join(', ')}`]
  if (e.summary) lines.push(`summary:${clean(e.summary)}`)
  if (e.cost) lines.push(`cost:${clean(e.cost)}`)
  if (e.benefit) lines.push(`benefit:${clean(e.benefit)}`)
  if (e.remark) lines.push(`remark:${clean(e.remark)}`)
  if (e.sources) lines.push(`sources:${clean(e.sources)}`)
  lines.push(':::', '')
  return lines.join('\n')
}

async function fetchChapter(file) {
  const res = await fetch(BASE + encodeURIComponent(file))
  if (!res.ok) throw new Error(`${file} -> HTTP ${res.status}`)
  return res.text()
}

const outDir = 'src/life-guide/articles/'
mkdirSync(outDir, { recursive: true })

const groups = new Map() // categoryKey -> [articleText]
let total = 0
for (const [file, cat] of CHAPTERS) {
  const md = await fetchChapter(file)
  const entries = parseChapter(md)
  console.log(`[${cat}] ${file}: ${entries.length} 条`)
  for (const e of entries) {
    const target = (cat === 'dont_waste_money' && INSURANCE_HIT.test(e.title)) ? 'insurance' : cat
    if (!groups.has(target)) groups.set(target, [])
    groups.get(target).push(buildArticle(e))
    total++
  }
}

console.log('\n=== 分类汇总 ===')
for (const [cat, arts] of groups) {
  console.log(`${cat}: ${arts.length} 条`)
  writeFileSync(outDir + cat + '.md', arts.join('\n'), 'utf8')
}
console.log('TOTAL:', total)
