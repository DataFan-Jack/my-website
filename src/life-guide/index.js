// 人生指南 · 数据入口
// 文章内容全部由 Markdown 管理（articles/*.md，每个文件含多个 :::article 卡片块）
// 本文件只做注册：一个分类 = 一个 md 文件
import { categories, categoryName } from './categories.js'

const mdModules = import.meta.glob('./articles/*.md', { query: '?raw', import: 'default' })

// 每个分类一个文件，文件名 = 分类 key
const articles = categories.map((c) => ({ id: c.key, category: c.key, file: `${c.key}.md` }))

export const lifeGuide = {
  categories,
  articles: articles.map((a) => ({
    ...a,
    categoryName: categoryName(a.category),
    contentLoader: mdModules[`./articles/${a.file}`],
  })),
  // 加载某章的 md 原文（纯文本）
  async loadContent(article) {
    if (!article.contentLoader) return ''
    return article.contentLoader()
  },
}
