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
    name: '基于大数据的新闻推荐系统',
    tags: ['毕业设计', '大数据', '推荐算法'],
    tech: ['Vue3', 'Spring Boot', 'MySQL', 'Hadoop', 'Spark', 'Kafka'],
    desc: '基于用户行为数据分析，设计并实现新闻智能推荐系统。',
    features: ['用户行为采集', '用户兴趣模型构建', '内容推荐算法', '热门推荐', '推荐结果分析'],
    result: '完成前后端分离系统开发，实现个性化新闻推荐流程。',
  },
  {
    name: 'Hadoop大数据环境搭建',
    tags: ['大数据平台'],
    tech: ['Linux', 'Hadoop', 'Hive', 'Spark'],
    desc: '完成多节点大数据环境部署，实现分布式存储和计算测试。',
  },
  {
    name: '码上启程个人技术网站',
    tags: ['个人项目'],
    tech: ['Vue3', 'Vite'],
    desc: '独立开发个人技术展示网站，实现：技术导航、项目展示、在线简历、教程系统。',
  },
]
const contact = {
  email: 'yuj893165@gmail.com',
  github: 'https://github.com/yu-jintian',
  site: 'https://mycoden.cn',
}
const eduCourses = ['Hadoop', 'Spark', 'Linux', 'MySQL', '数据分析', 'Web开发']

function downloadPdf() { window.print() }
function goProjects() { location.hash = '#/tutorials' }
</script>

<template>
  <main class="rs-page">
    <!-- 顶部 Hero -->
    <section class="rs-hero">
      <h1 class="rs-name">DataFan-Jack</h1>
      <p class="rs-role">大数据开发工程师（实习）</p>
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
        一名专注于大数据开发方向的学生，具备数据采集、数据存储、数据分析以及 Web 应用开发能力。
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
      <div class="rs-edu-head">
        <b>XX职业技术学院 · 大数据技术（专科）</b>
        <span>2024.09 - 2027.06</span>
      </div>
      <p class="rs-edu-label">核心课程：</p>
      <div class="rs-tech">
        <span v-for="c in eduCourses" :key="c" class="rs-chip">{{ c }}</span>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ===== 黑金主题变量 ===== */
.rs-page {
  --gold: #d4a843;
  --gold-strong: #f0d878;
  --text: #e6e6e6;
  --muted: #9aa0a6;
  --bg: transparent;
  --card-bg: rgba(255, 255, 255, 0.03);
  --line: rgba(212, 168, 67, 0.3);
  max-width: 920px;
  margin: 0 auto;
  padding: 65px 24px 60px;
  color: var(--text);
  user-select: text;
  -webkit-user-select: text;
}
:global(.page.light-mode) .rs-page {
  --gold: #b8862e;
  --gold-strong: #8a6520;
  --text: #2b2b2b;
  --muted: #6b6b6b;
  --card-bg: #ffffff;
  --line: #e8e0cc;
}

/* ===== Hero ===== */
.rs-hero { text-align: center; padding: 20px 0 40px; }
.rs-name {
  font-size: 46px;
  font-weight: 700;
  color: var(--gold);
  margin: 0 0 12px;
  letter-spacing: 2px;
}
.rs-role { font-size: 22px; color: var(--muted); margin: 0 0 18px; }
.rs-chip {
  display: inline-block;
  padding: 5px 14px;
  margin: 4px;
  border: 1px solid var(--line);
  border-radius: 20px;
  color: var(--gold-strong);
  font-size: 14px;
  background: var(--card-bg);
}
.rs-chip-sm { font-size: 12px; padding: 3px 10px; }
.rs-contact {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 22px;
  margin: 16px 0 24px;
}
.rs-contact a { color: var(--muted); font-size: 18px; text-decoration: none; transition: color 0.2s; }
.rs-contact a:hover { color: var(--gold); }
.rs-actions { display: flex; gap: 28px; justify-content: center; flex-wrap: wrap; width: 100%; }
.rs-btn {
  padding: 15px 32px;
  border: 1px solid var(--gold);
  border-radius: 8px;
  background: linear-gradient(135deg, #d4a843, #b8862e);
  color: #0b0b12;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.rs-btn:hover { transform: translateY(-2px); box-shadow: 0 0 14px rgba(212, 168, 67, 0.5); }
.rs-btn-ghost { background: transparent; color: var(--gold); text-shadow: 0 0 14px rgba(212, 168, 67, 0.5); }

/* ===== 通用区块 ===== */
.rs-section { padding: 28px 0; border-top: 1px solid var(--line); }
.rs-title {
  font-size: 22px;
  color: var(--gold);
  margin: 0 0 18px;
  padding-left: 12px;
  border-left: 3px solid var(--gold);
}
.rs-desc { color: var(--text); font-size: 15px; line-height: 1.9; margin: 0 0 14px; }
.rs-tag {
  display: inline-block;
  padding: 4px 12px;
  margin: 3px;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--gold);
  font-size: 13px;
}

/* ===== 技能卡片 ===== */
.rs-skills {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.rs-skill {
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.rs-skill:hover {
  transform: translateY(-6px);
  border-color: var(--gold);
  box-shadow: 0 0 22px rgba(212, 168, 67, 0.45), 0 14px 34px rgba(0, 0, 0, 0.45);
}
.rs-skill-title { color: var(--gold-strong); font-size: 17px; margin: 0 0 14px; }
.rs-skill-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.rs-skill-list li {
  padding: 5px 12px;
  border: 1px solid var(--line);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text);
}

/* ===== 项目经历 ===== */
.rs-projects { display: flex; flex-direction: column; gap: 10px; }
.rs-project { padding: 6px 0; }
.rs-project-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; }
.rs-project-name { color: var(--gold-strong); font-size: 17px; margin: 0; }
.rs-project-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.rs-project-tech { margin: 12px 0 8px; }
.rs-project-desc { color: var(--muted); font-size: 14px; margin: 0 0 10px; }
.rs-list { margin: 0; padding-left: 20px; color: var(--text); font-size: 14px; line-height: 1.9; }
.rs-project-result { color: var(--gold); font-size: 14px; margin: 10px 0 0; }
.rs-divider { height: 1px; background: var(--line); margin: 22px 0; }

/* ===== 教育经历 ===== */
.rs-edu { border-top: 1px solid var(--line); }
.rs-edu-head { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.rs-edu-head b { color: var(--gold-strong); font-size: 16px; }
.rs-edu-head span { color: var(--muted); font-size: 13px; }
.rs-edu-label { color: var(--muted); font-size: 14px; margin: 0 0 8px; }

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
