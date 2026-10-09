<script setup>
// 大数据开发工程师个人主页 · 黑金风格
const heroTech = ['Java', 'Hadoop', 'Spark', 'Spring Boot', 'Vue3']
const aboutDirs = ['大数据开发', '数据分析', '推荐系统']
const skills = [
  { title: '大数据开发', items: ['Hadoop', 'HDFS', 'YARN', 'Hive', 'Spark', 'Kafka', 'Linux'] },
  { title: '后端开发', items: ['Java', 'Spring Boot', 'MyBatis-Plus', 'MySQL', 'RESTful API'] },
  { title: '前端开发', items: ['Vue3', 'Vite', 'Axios', 'HTML', 'CSS'] },
]
const projects = [
  {
    name: '新能源汽车数据仓库系统',
    tags: ['大数据开发', '比赛项目'],
    tech: ['Hadoop', 'HDFS', 'Hive', 'Spark', 'DataX', 'MySQL', 'Linux'],
    desc: '面向新能源汽车业务场景，设计并实现离线数据仓库系统，对车辆销售、用户信息、交易行为等业务数据进行统一管理和分析。',
    features: [
      '负责 Hadoop 集群环境搭建与基础组件配置，完成 HDFS 分布式存储环境部署',
      '参与数据仓库分层设计，按照 ODS → DWD → DWS → ADS 架构完成业务数据加工',
      '使用 DataX 实现业务数据库与 Hive 数仓之间的数据同步',
      '编写 Hive SQL 完成销售统计、用户分析、业务指标计算等任务',
      '使用 Spark SQL 优化部分数据处理流程，提高离线计算效率',
    ],
  },
  {
    name: '基于大数据的新闻推荐系统',
    tags: ['毕业设计', '大数据', '推荐算法'],
    tech: ['Vue3', 'Spring Boot', 'MySQL', 'Hadoop', 'Spark', 'Kafka'],
    desc: '面向新闻资讯场景，设计并实现基于用户行为分析的智能新闻推荐系统，通过采集用户浏览、点赞、收藏等行为数据，构建用户兴趣模型，结合推荐算法实现个性化内容推荐。',
    features: [
      '负责系统整体架构设计，采用 Vue3 + Spring Boot 实现前后端分离开发，完成用户端与管理端功能模块开发',
      '设计用户行为采集模块，记录用户浏览、点赞、收藏等行为数据，为推荐模型提供数据支撑',
      '基于用户历史行为构建用户兴趣标签模型，通过 TF-IDF 内容分析、兴趣匹配等方式计算用户偏好',
      '实现多策略推荐算法，包括热门推荐、兴趣推荐、内容相似推荐，并通过加权融合生成最终推荐结果',
      '使用 Kafka 构建用户行为消息传输流程，结合 Hadoop/HDFS 存储用户行为数据，为后续大数据分析提供基础',
      '利用 Spark 对用户行为数据进行离线计算与分析，生成用户兴趣画像及推荐结果',
      '完成推荐效果分析模块，实现推荐数量、点击率、用户兴趣分布等数据可视化展示',
    ],
    result: '完成前后端分离系统开发，实现个性化新闻推荐流程。',
  },
  {
    name: '大数据计算平台搭建与部署',
    tags: ['大数据平台'],
    tech: ['Linux', 'Hadoop', 'HDFS', 'Hive', 'Spark', 'ZooKeeper'],
    desc: '基于 Linux 环境搭建 Hadoop 分布式计算平台，完成多节点集群部署与大数据组件配置，为数据存储、计算分析及大数据应用提供基础运行环境。',
    features: [
      '完成 Hadoop 集群环境搭建，配置 NameNode、DataNode 等核心节点，实现 HDFS 分布式文件存储',
      '完成 YARN 资源调度环境配置，实现集群计算资源统一管理',
      '部署 Hive、Spark 等大数据组件，搭建离线数据分析环境',
      '配置节点间 SSH 通信及集群参数优化，完成 MapReduce 分布式计算测试',
    ],
  },
  {
    name: '码上启程个人技术网站',
    tags: ['个人项目'],
    site: 'https://mycoden.cn/',
    tech: ['Vue3', 'Vite'],
    desc: '基于 Vue3 开发的个人技术展示与知识管理平台，实现个人简历、项目案例、学习笔记及技术导航等功能。',
    features: [
      '使用 Vue3 Composition API 进行页面组件设计，实现模块化开发',
      '基于 Vite 构建前端开发环境，优化项目构建与开发效率',
      '设计通用 Card 组件，实现项目展示、知识卡片等模块复用',
      '引入 Markdown 内容管理方式，实现技术文档动态渲染',
      '实现响应式布局与主题切换，提高网站交互体验',
    ],
  },
]
const contact = {
  email: 'yuj893165@gmail.com',
  github: 'https://github.com/yu-jintian',
  site: 'https://mycoden.cn',
}
const eduList = [
  {
    name: '西南石油大学 · 信息管理与信息系统（本科）',
    courses: ['数据库原理', '信息系统分析与设计', '管理信息系统', '软件工程', '数据分析', 'Web应用开发'],
  },
  {
    name: '大数据技术（专科）',
    courses: ['Hadoop', 'Spark', 'Linux', 'Hive', 'Kafka', 'MySQL', '数据分析', '大数据技术基础'],
  },
]

function downloadPdf() { window.print() }
function goProjects() { location.hash = '#/tutorials' }
</script>

<template>
  <main class="rs-page">
    <!-- 顶部 Hero -->
    <section class="rs-hero">
      <h1 class="rs-name">DataFan-Jack</h1>
      <p class="rs-role">大数据开发工程师</p>
      <div class="rs-tech">
        <span v-for="t in heroTech" :key="t" class="rs-chip">{{ t }}</span>
      </div>
      <div class="rs-contact">
        <a :href="'mailto:' + contact.email">{{ contact.email }}</a>
        <a :href="contact.github" target="_blank" rel="noopener">GitHub</a>
        <a :href="contact.site" target="_blank" rel="noopener">个人网站</a>
      </div>
      <div class="rs-actions">
        <button class="rs-btn" @click="downloadPdf">下载简历</button>
        <button class="rs-btn rs-btn-ghost" @click="goProjects">查看项目</button>
      </div>
    </section>

    <!-- 关于我 -->
    <section class="rs-section">
      <h2 class="rs-title">关于我</h2>
      <p class="rs-desc">
        具备信息系统分析与大数据技术开发背景，专注于大数据开发方向，掌握数据采集、数据存储、数据分析及 Web 应用开发能力。
      </p>
      <div class="rs-dirs">
        <span v-for="d in aboutDirs" :key="d" class="rs-tag">{{ d }}</span>
      </div>
    </section>

    <!-- 技能卡片 -->
    <section class="rs-section">
      <h2 class="rs-title">技能</h2>
      <div class="rs-skills">
        <div v-for="s in skills" :key="s.title" class="rs-skill">
          <h3 class="rs-skill-title">{{ s.title }}</h3>
          <ul class="rs-skill-list">
            <li v-for="it in s.items" :key="it">{{ it }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 项目经历 -->
    <section class="rs-section">
      <h2 class="rs-title">项目经历</h2>
      <div class="rs-projects">
        <article v-for="(p, i) in projects" :key="p.name" class="rs-project">
          <div class="rs-project-head">
            <h3 class="rs-project-name">{{ p.name }}</h3>
            <div class="rs-project-tags">
              <span v-for="t in p.tags" :key="t" class="rs-tag">{{ t }}</span>
              <a v-if="p.site" class="rs-project-site" :href="p.site" target="_blank" rel="noopener">mycoden.cn</a>
            </div>
          </div>
          <div class="rs-project-tech">
            <span v-for="t in p.tech" :key="t" class="rs-chip rs-chip-sm">{{ t }}</span>
          </div>
          <p class="rs-project-desc">{{ p.desc }}</p>
          <ul v-if="p.features" class="rs-list">
            <li v-for="f in p.features" :key="f">{{ f }}</li>
          </ul>
          <p v-if="p.result" class="rs-project-result">{{ p.result }}</p>
          <div v-if="i < projects.length - 1" class="rs-divider"></div>
        </article>
      </div>
    </section>

    <!-- 教育经历 -->
    <section class="rs-section rs-edu">
      <h2 class="rs-title">教育经历</h2>
      <div v-for="e in eduList" :key="e.name" class="rs-edu-item">
        <div class="rs-edu-head">
          <b>{{ e.name }}</b>
        </div>
        <p class="rs-edu-label">核心课程：</p>
        <div class="rs-tech">
          <span v-for="c in e.courses" :key="c" class="rs-chip">{{ c }}</span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ===== 黑金主题变量（统一使用全局变量系统） ===== */
.rs-page {
  max-width: 920px;
  margin: 0 auto;
  padding: 65px 24px 60px;
  color: var(--text-primary);
  user-select: text;
  -webkit-user-select: text;
}

/* ===== Hero ===== */
.rs-hero { text-align: center; padding: 20px 0 40px; }
.rs-name {
  font-size: 46px;
  font-weight: 700;
  color: var(--accent-color);
  margin: 0 0 12px;
  letter-spacing: 2px;
}
.rs-role { font-size: 22px; color: var(--text-secondary); margin: 0 0 18px; }
.rs-chip {
  display: inline-block;
  padding: 5px 14px;
  margin: 4px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--accent-strong);
  font-size: 14px;
  background: var(--bg-card);
}
.rs-chip-sm { font-size: 12px; padding: 3px 10px; }
.rs-contact {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 22px;
  margin: 16px 0 24px;
}
.rs-contact a { color: var(--text-secondary); font-size: 18px; text-decoration: none; transition: color 0.2s; }
.rs-contact a:hover { color: var(--accent-color); }
.rs-actions { display: flex; gap: 28px; justify-content: center; flex-wrap: wrap; width: 100%; }
.rs-btn {
  padding: 15px 32px;
  border: 1px solid var(--accent-color);
  border-radius: 8px;
  background: linear-gradient(135deg, #d4a843, #b8862e);
  color: #0b0b12;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.rs-btn:hover { transform: translateY(-2px); box-shadow: 0 0 14px rgba(212, 168, 67, 0.5); }
.rs-btn-ghost { background: transparent; color: var(--accent-color); text-shadow: 0 0 14px rgba(212, 168, 67, 0.5); }

/* ===== 通用区块 ===== */
.rs-section { padding: 28px 0; border-top: 1px solid var(--border-color); }
.rs-title {
  font-size: 22px;
  color: var(--accent-color);
  margin: 0 0 18px;
  padding-left: 12px;
  border-left: 3px solid var(--accent-color);
}
.rs-desc { color: var(--text-primary); font-size: 15px; line-height: 1.9; margin: 0 0 14px; }
.rs-tag {
  display: inline-block;
  padding: 4px 12px;
  margin: 3px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--accent-color);
  font-size: 13px;
}
.rs-project-site {
  color: var(--accent-strong);
  font-size: 13px;
  text-decoration: none;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.5);
  padding: 4px 2px;
  margin: 3px;
}
.rs-project-site:hover { color: var(--accent-color); }

/* ===== 技能卡片 ===== */
.rs-skills {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.rs-skill {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.rs-skill:hover {
  transform: translateY(-6px);
  border-color: var(--accent-color);
  box-shadow: 0 0 22px rgba(212, 168, 67, 0.45), 0 14px 34px rgba(0, 0, 0, 0.45);
}
.rs-skill-title { color: var(--accent-strong); font-size: 17px; margin: 0 0 14px; }
.rs-skill-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.rs-skill-list li {
  padding: 5px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
}

/* ===== 项目经历 ===== */
.rs-projects { display: flex; flex-direction: column; gap: 10px; }
.rs-project { padding: 6px 0; }
.rs-project-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; }
.rs-project-name { color: var(--accent-strong); font-size: 17px; margin: 0; }
.rs-project-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.rs-project-tech { margin: 12px 0 8px; }
.rs-project-desc { color: var(--text-secondary); font-size: 14px; margin: 0 0 10px; }
.rs-list { margin: 0; padding-left: 20px; color: var(--text-primary); font-size: 14px; line-height: 1.9; }
.rs-project-result { color: var(--accent-color); font-size: 14px; margin: 10px 0 0; }
.rs-divider { height: 1px; background: var(--border-color); margin: 22px 0; }

/* ===== 教育经历 ===== */
.rs-edu { border-top: 1px solid var(--border-color); }
.rs-edu-item { margin-bottom: 18px; }
.rs-edu-item:last-child { margin-bottom: 0; }
.rs-edu-head { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.rs-edu-head b { color: var(--accent-strong); font-size: 16px; }
.rs-edu-head span { color: var(--text-secondary); font-size: 13px; }
.rs-edu-label { color: var(--text-secondary); font-size: 14px; margin: 0 0 8px; }

/* ===== 移动端 ≤768px ===== */
@media (max-width: 768px) {
  .rs-page { padding: 96px 16px 40px; }
  .rs-name { font-size: 34px; }
  .rs-role { font-size: 15px; }
  .rs-skills { grid-template-columns: 1fr; }
  .rs-projects { flex-direction: column; }
  .rs-btn { width: 100%; max-width: 280px; }
}

/* ===== 打印（下载 PDF 简历） ===== */
@media print {
  .rs-page { padding: 0; color: #000; }
  .rs-name, .rs-title, .rs-skill-title, .rs-project-name, .rs-project-result { color: #000; }
  .rs-chip, .rs-skill-list li, .rs-tag { border-color: #999; color: #333; }
  .rs-actions { display: none; }
  .rs-skill { background: #fff; box-shadow: none; }
}
</style>
