// ============================================================
// 知识库统一配置（Markdown 驱动）
// 新增一篇文章只需三步：
//   1. 在 src/notes/<topic>/ 下新建 .md 文件（标题/段落/列表/表格/代码/引用）
//   2. 在下方 import 该文件
//   3. 在 knowledgeArticles 数组中追加一条配置
// 无需修改任何 Vue 页面。
// 知识中心卡片数据由本配置自动聚合生成（knowledgeTopics）。
// ============================================================
import linux01 from '../../notes/linux/linux-01.md?raw'
import linux02 from '../../notes/linux/linux-02.md?raw'
import docker01 from '../../notes/docker/docker-01.md?raw'
import hadoop01 from '../../notes/hadoop/hadoop-01.md?raw'

// 文章配置：id 唯一，topic 关联主题分类，content 为 Markdown 原文
export const knowledgeArticles = [
  {
    id: 'linux-01',
    topic: 'linux',
    label: '第一篇',
    title: 'Linux 基础认知',
    icon: '🐧',
    category: '操作系统',
    tags: ['Linux', '服务器', 'Shell', '系统管理'],
    description:
      '从 Linux 基础命令开始，理解 Linux 系统组成、发展历史与核心概念，为后续文件、权限、网络学习打基础。',
    level: '⭐⭐⭐⭐',
    readMinutes: 18,
    updatedAt: '2026-10-09',
    content: linux01,
  },
  {
    id: 'linux-02',
    topic: 'linux',
    label: '第二篇',
    title: 'Linux 安装与环境搭建',
    icon: '🐧',
    category: '操作系统',
    tags: ['Linux', 'VMware', 'Ubuntu', 'SSH'],
    description:
      '从虚拟机安装到 SSH 远程连接，搭建一台可长期使用的 Linux 学习环境，是后续所有技术学习的地基。',
    level: '⭐⭐⭐⭐',
    readMinutes: 25,
    updatedAt: '2026-10-09',
    content: linux02,
  },
  {
    id: 'docker-01',
    topic: 'docker',
    label: '第一篇',
    title: 'Docker 容器入门',
    icon: '🐳',
    category: '后端',
    tags: ['Docker', '容器', '部署', 'DevOps'],
    description:
      '从容器概念入手，学习镜像构建、容器运行、数据卷、网络配置与 Compose 编排，掌握应用容器化部署。',
    level: '⭐⭐⭐',
    readMinutes: 15,
    updatedAt: '2026-10-09',
    content: docker01,
  },
  {
    id: 'hadoop-01',
    topic: 'hadoop',
    label: '第一篇',
    title: 'Hadoop 大数据平台入门',
    icon: '🐘',
    category: '大数据',
    tags: ['Hadoop', 'HDFS', 'MapReduce', '大数据'],
    description:
      '从分布式基础开始，学习 HDFS 分布式存储、YARN 资源调度与 MapReduce 计算模型，搭建大数据平台。',
    level: '⭐⭐⭐⭐⭐',
    readMinutes: 20,
    updatedAt: '2026-10-09',
    content: hadoop01,
  },
]

// 主题聚合元数据：知识中心卡片展示字段（保持旧接口：title/icon/category/tags/description/chapterCount/level/buttonText/route）
const TOPIC_META = {
  linux: {
    title: 'Linux',
    icon: '🐧',
    category: '操作系统',
    tags: ['Linux', '服务器', 'Shell', '系统管理'],
    description:
      '从Linux基础命令开始，系统学习Linux文件系统、权限管理、进程管理、网络配置、服务器维护。',
    level: '⭐⭐⭐⭐',
    buttonText: '进入学习',
  },
  docker: {
    title: 'Docker',
    icon: '🐳',
    category: '后端',
    tags: ['Docker', '容器', '部署', 'DevOps'],
    description:
      '从容器概念入手，学习镜像构建、容器运行、数据卷、网络配置与 Compose 编排，掌握应用容器化部署。',
    level: '⭐⭐⭐',
    buttonText: '进入学习',
  },
  hadoop: {
    title: 'Hadoop',
    icon: '🐘',
    category: '大数据',
    tags: ['Hadoop', 'HDFS', 'MapReduce', '大数据'],
    description:
      '从分布式基础开始，学习 HDFS 分布式存储、YARN 资源调度与 MapReduce 计算模型，搭建大数据平台。',
    level: '⭐⭐⭐⭐⭐',
    buttonText: '进入学习',
  },
}

// 由文章配置派生知识中心卡片（章节数量 = 实际文章数，随文章新增自动更新）
export const knowledgeTopics = Object.keys(TOPIC_META).map((topic) => ({
  ...TOPIC_META[topic],
  chapterCount: `${knowledgeArticles.filter((a) => a.topic === topic).length}+`,
  route: `/knowledge/${topic}`,
}))

// 便捷查询：按主题取文章列表
export function articlesOf(topic) {
  return knowledgeArticles.filter((a) => a.topic === topic)
}
