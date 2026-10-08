# 码上启程 · mycoden.cn

> 个人技术学习与展示网站源码，基于 Vue 3 + Vite 构建。

## 项目简介

「码上启程」是一款个人学习网站，采用**黑金主题**科技风格，涵盖首页、学习中心、教程、项目实战、编程导航、人生指南、关于我七大板块。内置文章阅读、标签分类、搜索、收藏与 GitHub OAuth 登录等功能，并适配 PC 与移动端。项目持续更新，作为个人技术成长与知识沉淀的展示。

线上访问：[https://mycoden.cn](https://mycoden.cn)

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端框架 | Vue 3（`<script setup>`）+ Vite |
| 语言 | JavaScript |
| 登录鉴权 | GitHub OAuth（Node.js 代理服务） |
| 教程数据采集 | Python（scraper，BeautifulSoup） |
| 静态部署 | GitHub Pages（GitHub Actions 自动构建） |

## 功能特性

- 黑金科技主题，深浅模式切换
- 首页：金色点阵动画、3D 翻转卡片、打字机效果
- 教程中心：100+ 门技术教程数据，分类与搜索
- 人生指南：34 章内容，卡片式阅读、收藏、目录折叠
- 项目实战 / 编程导航：常用站点与工具一键直达
- GitHub OAuth 登录：头像昵称展示、本地持久化
- 响应式布局，适配 PC 与移动端

## 软件架构

```
my-website/
├─ index.html / vite.config.js / package.json   # 入口与构建配置
├─ src/                      # 前端源码
│  ├─ main.js / App.vue / style.css
│  ├─ components/            # DotField、FishCursor、LifeGuide 系列组件
│  ├─ lib/                   # markdown 节点树、交互工具
│  └─ life-guide/            # 人生指南模块（categories + articles/ch01~34）
├─ public/                   # 静态资源（教程数据 tutorials/、图标 icons/）
├─ server/                   # GitHub OAuth 登录代理服务（端口 3001）
├─ scraper/                  # Python 教程数据采集脚本
├─ tools/                    # 内容导入、图标处理等工具脚本
└─ .github/workflows/        # GitHub Pages 自动部署
```

## 安装教程

1. 安装 [Node.js](https://nodejs.org/)（建议 v18 及以上）与 npm。
2. 克隆仓库并进入目录：

   ```bash
   git clone https://gitee.com/yu-jintian/mycoden.cn.git
   cd mycoden.cn
   ```

3. 安装依赖：

   ```bash
   npm install
   ```

4. 启动本地开发服务器：

   ```bash
   npm run dev
   ```

   浏览器访问 `http://localhost:5173` 即可预览。

5. 构建生产版本：

   ```bash
   npm run build
   ```

   构建产物输出到 `dist/`，可用 `npm run preview` 本地预览。

## 使用说明

- 开发调试：`npm run dev`（端口 5173）。
- GitHub 登录：需在 `server/config.cjs` 填入 GitHub OAuth 的 Client ID / Secret，并启动登录代理服务：

  ```bash
  cd server && node server.cjs
  ```

  代理服务默认运行在 `http://localhost:3001`。
- 教程数据更新：修改 `scraper/` 内脚本重新采集，或直接编辑 `public/tutorials/*.json`。
- 部署：推送代码到 GitHub `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages。

## 参与贡献

1. Fork 本仓库
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request

## 许可证

本项目仅供个人学习与展示使用，相关技术栈与依赖遵循其各自开源协议。
