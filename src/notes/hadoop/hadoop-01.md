# Hadoop 大数据平台入门

Hadoop 是 Apache 基金会开源的分布式计算框架，用于在海量数据上做**分布式存储**和**分布式计算**。它是大数据生态的基石，Spark、Hive、Kafka 等组件都围绕它构建。

> Hadoop 的核心思想：把一台机器的存储和计算能力，扩展到成千上万台机器。

## 1. 为什么要用 Hadoop

单台服务器存不下、算不动海量数据时，就需要 Hadoop：

- **数据量巨大**：单机磁盘容量有限，需要把数据分散存储在多台机器。
- **计算耗时长**：单机处理 TB 级数据耗时过长，需要多台机器并行计算。
- **可靠性要求高**：机器随时可能故障，数据必须有冗余备份。

## 2. Hadoop 核心组件

Hadoop 由三大核心组件组成，各司其职：

| 组件 | 全称 | 作用 |
| --- | --- | --- |
| HDFS | Hadoop Distributed File System | 分布式文件存储 |
| YARN | Yet Another Resource Negotiator | 集群资源调度 |
| MapReduce | MapReduce | 分布式计算模型 |

:::diagram
hadoop-arch
:::

### 2.1 HDFS 分布式存储

HDFS 把大文件切分成多个 **Block（默认 128MB）**，分散存储到不同机器，并自动复制多份副本（默认 3 份）保证可靠性。

- **NameNode**：管理文件目录和元数据（相当于"总目录"）
- **DataNode**：实际存储数据块（相当于"仓库"）

### 2.2 YARN 资源调度

YARN 统一管理集群的 CPU 和内存资源：

- **ResourceManager**：全局资源管理器
- **NodeManager**：每台机器上的资源管理者

### 2.3 MapReduce 计算模型

MapReduce 把计算拆成两步：

1. **Map（映射）**：把任务拆分成小块，分发到各节点并行处理
2. **Reduce（归约）**：汇总各节点的中间结果，得到最终结果

> 举例：统计 10 亿条日志中的错误数——Map 阶段各节点并行统计自己那部分，Reduce 阶段把所有统计结果加起来。

## 3. 集群架构

一个典型的 Hadoop 集群架构：

```
Client
  │
  ├──→ NameNode（元数据管理）
  ├──→ ResourceManager（资源调度）
  │
  └──→ DataNode × N（数据存储）
       └──→ NodeManager × N（计算执行）
```

生产环境推荐配置：NameNode 与 DataNode 分离部署，元数据高可用（HA）。

## 4. 环境搭建要点

搭建 Hadoop 集群的基础步骤：

1. 准备多台 Linux 服务器，配置免密 SSH 登录
2. 安装 JDK，配置 JAVA_HOME 环境变量
3. 下载 Hadoop 安装包并解压
4. 修改 core-site.xml、hdfs-site.xml、yarn-site.xml 等配置文件
5. 格式化 NameNode 并启动集群

```bash
# 启动 / 停止集群（在 hadoop 安装目录下）
start-dfs.sh
start-yarn.sh
stop-dfs.sh
stop-yarn.sh
```

```bash
# 验证 HDFS 基本操作
hdfs dfs -mkdir /input
hdfs dfs -put local.txt /input/
hdfs dfs -ls /
```

## 5. 生态组件

Hadoop 生态圈围绕 HDFS + YARN 发展出大量组件：

- **Hive**：用 SQL 方式操作 HDFS 数据（数据仓库）
- **Spark**：基于内存的快速计算引擎
- **ZooKeeper**：分布式协调服务
- **Flume**：日志采集
- **Sqoop / DataX**：数据导入导出

## 总结

- Hadoop 解决海量数据的存储（HDFS）与计算（MapReduce）问题，YARN 负责资源管理。
- 三大组件 + 生态工具构成完整的大数据平台。
- 学习路径：Linux 基础 → 单机部署 → 伪分布式 → 多节点集群 → 结合 Hive/Spark 做数据分析。
