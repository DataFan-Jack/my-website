<script setup>
// 黑金风格技术图解：7 种类型（linux-composition / linux-roadmap / install-methods / vm-arch / vm-flow / net-modes / env-roadmap）
defineProps({
  kind: { type: String, required: true },
})
</script>

<template>
  <!-- 1. Linux 系统组成架构图 -->
  <div v-if="kind === 'linux-composition'" class="fig">
    <div class="stack">
      <div class="layer"><b>应用程序</b><span>用户日常使用的软件</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer"><b>系统服务</b><span>后台运行的服务（sshd、nginx 等）</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer"><b>文件系统</b><span>目录与文件的管理组织</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer"><b>Shell 命令解释器</b><span>用户与系统交互的入口（Bash / Zsh）</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer"><b>Linux Kernel 内核</b><span>核心：管理硬件、进程、内存、文件、网络</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer layer-base"><b>硬件</b><span>CPU / 内存 / 磁盘 / 网卡</span></div>
    </div>
  </div>

  <!-- 2. Linux 学习路线 -->
  <div v-else-if="kind === 'linux-roadmap'" class="fig">
    <div class="flow-row">
      <span class="step">Linux 基础</span><i class="f-arrow">→</i>
      <span class="step">文件操作</span><i class="f-arrow">→</i>
      <span class="step">用户权限</span><i class="f-arrow">→</i>
      <span class="step">软件安装</span><i class="f-arrow">→</i>
      <span class="step">进程管理</span>
    </div>
    <div class="flow-row">
      <span class="step">网络</span><i class="f-arrow">→</i>
      <span class="step">Shell 脚本</span><i class="f-arrow">→</i>
      <span class="step">服务器部署</span><i class="f-arrow">→</i>
      <span class="step">性能优化</span><i class="f-arrow">→</i>
      <span class="step step-end">企业实践</span>
    </div>
    <div class="f-down">↓</div>
    <div class="f-note">按此顺序学习，逐步建立完整的 Linux 知识体系</div>
  </div>

  <!-- 3. 三种安装方式对比 -->
  <div v-else-if="kind === 'install-methods'" class="fig">
    <div class="grid3">
      <div class="card">
        <div class="card-head"><b>物理机安装</b><em>直接装进硬盘</em></div>
        <div class="card-row"><span>优点</span><p>性能最高、环境完整</p></div>
        <div class="card-row"><span>缺点</span><p>切换系统麻烦、学习成本高</p></div>
        <div class="card-row"><span>适合</span><p>企业服务器、专用 Linux 电脑</p></div>
      </div>
      <div class="card card-hot">
        <div class="card-head"><b>虚拟机安装</b><em class="hot-tag">★ 学习推荐</em></div>
        <div class="card-row"><span>优点</span><p>不影响 Windows、可建多个环境、快照恢复</p></div>
        <div class="card-row"><span>缺点</span><p>性能略低于物理机</p></div>
        <div class="card-row"><span>适合</span><p>学习、开发、实验环境</p></div>
      </div>
      <div class="card">
        <div class="card-head"><b>云服务器</b><em>购买即用</em></div>
        <div class="card-row"><span>优点</span><p>免安装、随时远程访问</p></div>
        <div class="card-row"><span>缺点</span><p>按量付费、无法本地实验快照</p></div>
        <div class="card-row"><span>适合</span><p>网站部署、后端服务、生产环境</p></div>
      </div>
    </div>
  </div>

  <!-- 4. VMware 分层架构 -->
  <div v-else-if="kind === 'vm-arch'" class="fig">
    <div class="stack">
      <div class="layer"><b>Ubuntu Linux</b><span>运行在虚拟电脑中的系统</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer"><b>虚拟电脑</b><span>虚拟 CPU / 内存 / 磁盘 / 网卡</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer layer-base"><b>VMware 虚拟化层</b><span>在 Windows 中模拟出整台电脑</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer layer-base"><b>真实电脑</b><span>Windows 11 · CPU · 内存 · 硬盘</span></div>
    </div>
  </div>

  <!-- 5. 创建虚拟机流程 -->
  <div v-else-if="kind === 'vm-flow'" class="fig">
    <div class="flow-row">
      <span class="step"><b>1</b>安装 VMware</span><i class="f-arrow">→</i>
      <span class="step"><b>2</b>新建虚拟机</span><i class="f-arrow">→</i>
      <span class="step"><b>3</b>选择 ISO 镜像</span><i class="f-arrow">→</i>
      <span class="step"><b>4</b>设置 CPU</span>
    </div>
    <div class="flow-row">
      <span class="step"><b>5</b>设置内存</span><i class="f-arrow">→</i>
      <span class="step"><b>6</b>设置硬盘</span><i class="f-arrow">→</i>
      <span class="step"><b>7</b>启动安装</span><i class="f-arrow">→</i>
      <span class="step step-end"><b>8</b>进入 Linux 桌面</span>
    </div>
  </div>

  <!-- 6. 三种网络模式 -->
  <div v-else-if="kind === 'net-modes'" class="fig">
    <div class="grid3">
      <div class="card card-hot">
        <div class="card-head"><b>NAT 模式</b><em class="hot-tag">★ 学习首选</em></div>
        <div class="topo">
          <span class="t-box">Linux 虚拟机</span><i class="f-arrow">→</i>
          <span class="t-box">VMware 虚拟网络</span><i class="f-arrow">→</i>
          <span class="t-box t-dim">互联网</span>
        </div>
        <div class="card-row"><span>特点</span><p>共享主机网络上网，配置最简单</p></div>
        <div class="card-row"><span>注意</span><p>外部访问虚拟机需额外配置</p></div>
      </div>
      <div class="card">
        <div class="card-head"><b>桥接模式</b><em>独立 IP</em></div>
        <div class="topo">
          <span class="t-box t-dim">路由器</span>
          <span class="t-branch">
            <span class="t-box">Windows</span>
            <span class="t-box">Linux 虚拟机</span>
          </span>
        </div>
        <div class="card-row"><span>特点</span><p>虚拟机拥有独立 IP，像真实服务器</p></div>
        <div class="card-row"><span>注意</span><p>网络环境变化时容易断网</p></div>
      </div>
      <div class="card">
        <div class="card-head"><b>仅主机模式</b><em>封闭测试</em></div>
        <div class="topo">
          <span class="t-box">主机</span><i class="f-arrow">↔</i>
          <span class="t-box">Linux 虚拟机</span>
        </div>
        <div class="card-row"><span>特点</span><p>只能与主机及虚拟机之间通信</p></div>
        <div class="card-row"><span>注意</span><p>不能访问互联网，适合内部测试</p></div>
      </div>
    </div>
  </div>

  <!-- 7. 环境搭建完整路线 -->
  <div v-else-if="kind === 'env-roadmap'" class="fig">
    <div class="flow-row">
      <span class="step"><b>1</b>选择发行版</span><i class="f-arrow">→</i>
      <span class="step"><b>2</b>安装虚拟机</span><i class="f-arrow">→</i>
      <span class="step"><b>3</b>配置硬件</span><i class="f-arrow">→</i>
      <span class="step"><b>4</b>设置网络</span>
    </div>
    <div class="flow-row">
      <span class="step"><b>5</b>安装 Linux</span><i class="f-arrow">→</i>
      <span class="step"><b>6</b>初始化系统</span><i class="f-arrow">→</i>
      <span class="step"><b>7</b>SSH 连接</span><i class="f-arrow">→</i>
      <span class="step step-end"><b>8</b>创建快照</span>
    </div>
    <div class="f-down">↓</div>
    <div class="f-note">完成以上 8 步 → 获得一台可长期使用的 Linux 学习环境</div>
  </div>

  <!-- 8. Docker 容器 vs 虚拟机 -->
  <div v-else-if="kind === 'docker-vs-vm'" class="fig">
    <div class="grid3">
      <div class="card card-hot">
        <div class="card-head"><b>Docker 容器</b><em class="hot-tag">★ 轻量</em></div>
        <div class="card-row"><span>隔离</span><p>进程级，共享宿主机内核</p></div>
        <div class="card-row"><span>启动</span><p>秒级</p></div>
        <div class="card-row"><span>体积</span><p>MB 级，只含应用依赖</p></div>
        <div class="card-row"><span>适用</span><p>微服务、CI/CD、弹性伸缩</p></div>
      </div>
      <div class="card">
        <div class="card-head"><b>虚拟机</b><em>完整系统</em></div>
        <div class="card-row"><span>隔离</span><p>硬件级，独立内核</p></div>
        <div class="card-row"><span>启动</span><p>分钟级</p></div>
        <div class="card-row"><span>体积</span><p>GB 级，含完整操作系统</p></div>
        <div class="card-row"><span>适用</span><p>强隔离、异构系统、安全边界</p></div>
      </div>
      <div class="card">
        <div class="card-head"><b>本质区别</b><em>共享 vs 独占</em></div>
        <div class="topo">
          <span class="t-box t-dim">宿主机内核</span>
          <span class="t-branch">
            <span class="t-box">容器 A</span>
            <span class="t-box">容器 B</span>
          </span>
        </div>
        <div class="card-row"><span>结论</span><p>容器共享内核更轻更快；虚拟机独立内核隔离更强</p></div>
      </div>
    </div>
  </div>

  <!-- 9. Hadoop 集群架构 -->
  <div v-else-if="kind === 'hadoop-arch'" class="fig">
    <div class="stack">
      <div class="layer"><b>Client 客户端</b><span>提交任务 / 读写数据</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer layer-base"><b>NameNode 元数据管理</b><span>文件目录与数据块位置</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer"><b>DataNode × N 分布式存储</b><span>Block 存储 + 多副本冗余</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer layer-base"><b>ResourceManager 资源调度</b><span>集群 CPU / 内存统一管理</span></div>
      <div class="f-arrow">▼</div>
      <div class="layer"><b>NodeManager × N 计算执行</b><span>Map / Reduce 任务运行</span></div>
    </div>
    <div class="f-note">HDFS 负责存储，YARN 负责资源，MapReduce 负责计算</div>
  </div>
</template>

<style scoped>
.fig {
  margin: 18px 0 24px;
  padding: 22px 18px;
  background: #0e0e0e;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
}

/* 纵向分层堆栈 */
.stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  max-width: 520px;
  margin: 0 auto;
}
.layer {
  width: 100%;
  padding: 11px 16px;
  box-sizing: border-box;
  background: #111111;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.layer b {
  font-size: 14px;
  color: #d4af37;
  white-space: nowrap;
}
.layer span {
  font-size: 12.5px;
  color: #999999;
  text-align: right;
}
.layer-base {
  border-color: rgba(212, 175, 55, 0.55);
}
.layer-base b {
  color: #ffffff;
}

/* 横向流程 */
.flow-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
}
.flow-row + .flow-row {
  margin-top: 10px;
}
.step {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  color: #e6e6e6;
  background: #111111;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 8px;
  white-space: nowrap;
}
.step b {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 11px;
  color: #080808;
  background: #d4af37;
  border-radius: 5px;
}
.step-end {
  border-color: #d4af37;
  color: #d4af37;
}
.step-end b {
  background: #ffffff;
  color: #080808;
}

.f-arrow {
  font-style: normal;
  color: #d4af37;
  font-size: 13px;
  line-height: 1;
  flex-shrink: 0;
}
.f-down {
  text-align: center;
  color: #d4af37;
  font-size: 13px;
  margin-top: 12px;
}
.f-note {
  margin-top: 10px;
  padding: 10px 14px;
  text-align: center;
  font-size: 13px;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.08);
  border: 1px dashed rgba(212, 175, 55, 0.4);
  border-radius: 8px;
}

/* 三卡片对比 */
.grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.card {
  background: #111111;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-hot {
  border-color: #d4af37;
  box-shadow: 0 0 24px rgba(212, 175, 55, 0.12);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}
.card-head b {
  font-size: 16px;
  color: #ffffff;
}
.card-head em {
  font-style: normal;
  font-size: 12px;
  color: #999999;
}
.card-head .hot-tag {
  color: #d4af37;
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 6px;
  padding: 2px 8px;
}
.card-row {
  display: flex;
  gap: 10px;
}
.card-row span {
  flex-shrink: 0;
  min-width: 36px;
  font-size: 12.5px;
  color: #d4af37;
}
.card-row p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: #cccccc;
}

/* 网络拓扑 */
.topo {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 10px;
  background: #0a0a0a;
  border: 1px dashed rgba(212, 175, 55, 0.3);
  border-radius: 8px;
}
.topo .f-arrow {
  text-align: center;
}
.t-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px 8px;
  font-size: 12px;
  color: #ffffff;
  background: #161616;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 6px;
  text-align: center;
}
.t-box.t-dim {
  color: #999999;
  border-color: rgba(212, 175, 55, 0.2);
}
.t-branch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

@media (max-width: 860px) {
  .grid3 {
    grid-template-columns: 1fr;
  }
  .layer {
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }
  .layer span {
    text-align: left;
  }
}

/* ===== 浅色模式 ===== */
.page.light-mode .fig {
  background: #f7f4ec;
  border-color: rgba(184, 134, 46, 0.3);
}
.page.light-mode .layer {
  background: #ffffff;
  border-color: rgba(184, 134, 46, 0.35);
}
.page.light-mode .layer span {
  color: #777777;
}
.page.light-mode .layer-base {
  border-color: rgba(184, 134, 46, 0.6);
}
.page.light-mode .layer-base b {
  color: #1a1a1a;
}
.page.light-mode .step {
  color: #333333;
  background: #ffffff;
  border-color: rgba(184, 134, 46, 0.35);
}
.page.light-mode .step b {
  color: #ffffff;
  background: #b8862e;
}
.page.light-mode .step-end {
  border-color: #b8862e;
  color: #b8862e;
}
.page.light-mode .step-end b {
  color: #b8862e;
  background: #ffffff;
}
.page.light-mode .f-note {
  background: rgba(184, 134, 46, 0.08);
  border-color: rgba(184, 134, 46, 0.4);
  color: #b8862e;
}
.page.light-mode .card {
  background: #ffffff;
  border-color: rgba(184, 134, 46, 0.3);
}
.page.light-mode .card-hot {
  border-color: #b8862e;
  box-shadow: 0 0 24px rgba(184, 134, 46, 0.15);
}
.page.light-mode .card-head b {
  color: #1a1a1a;
}
.page.light-mode .card-row p {
  color: #444444;
}
.page.light-mode .topo {
  background: #faf8f2;
  border-color: rgba(184, 134, 46, 0.3);
}
.page.light-mode .t-box {
  color: #1a1a1a;
  background: #ffffff;
  border-color: rgba(184, 134, 46, 0.4);
}
.page.light-mode .t-box.t-dim {
  color: #888888;
  border-color: rgba(184, 134, 46, 0.2);
}
</style>
