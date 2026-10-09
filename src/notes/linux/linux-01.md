# Linux 基础认知

## 1. 什么是 Linux？

### 1.1 Linux 简介

Linux 是一种开源的、免费的、类 Unix（Unix-like）操作系统。

它继承了 Unix 操作系统的许多设计思想，例如：

- 多用户
- 多任务
- 层次化文件系统
- 命令行操作方式
- 权限管理机制

但 Linux 并不是 Unix 本身，而是一种受到 Unix 思想影响而开发出来的操作系统。

Linux 主要应用于：

- 服务器
- 云计算平台
- 大数据平台
- 嵌入式设备
- 超级计算机
- Android 系统

Linux 最早由芬兰计算机科学家 Linus Torvalds 于 1991 年开发。

最初，Linux 只是 Linus Torvalds 为个人学习和研究开发的一个小型操作系统内核项目。

随着越来越多开发者参与贡献，Linux 逐渐发展成为全球最重要的开源操作系统生态之一，在服务器、云计算、大数据等领域占据重要地位。

### 1.2 Linux 的特点

1. **开源**：源代码公开，任何人都可以查看代码、修改代码、发布自己的版本，企业可以根据需求定制 Linux。
2. **稳定性高**：Linux 服务器可以连续运行几个月、几年，很多银行、云服务器、大型网站都在使用。
3. **安全性强**：Linux 权限体系严格，普通用户不能修改系统文件；管理员 root 用户拥有最高权限。
4. **高性能**：资源占用低、运行效率高，特别适合服务器、数据中心、大数据计算。

## 2. Linux 发展历史

### 2.1 Unix

Linux 的思想来源是 Unix。1969 年贝尔实验室开发 Unix，特点是多用户、多任务、稳定、网络能力强。

### 2.2 GNU 计划

1983 年 Richard Stallman 提出 GNU 项目，目标：创建完全自由的软件系统。

### 2.3 Linux 诞生

1991 年 Linus 发布 Linux 内核。注意：Linux 本身只是 **Kernel（内核）**，完整系统由 Linux Kernel + GNU 工具 + 软件包管理 + 桌面环境组成，也就是 Linux 发行版。

## 3. Linux 发行版

Linux 不是一个系统，而是一系列系统。类似 Android 手机不同厂家有不同版本，Linux 由不同组织发行不同版本。

### 常见发行版

- **Ubuntu**：新手友好、软件丰富、社区大，适合学习、开发、云服务器。
- **CentOS**：稳定，以前大量用于企业服务器；现在 CentOS Linux 停止维护，替代为 Rocky Linux、AlmaLinux。
- **Debian**：稳定、安全，Ubuntu 就是基于 Debian。
- **RHEL**：Red Hat Enterprise Linux，商业服务器系统，企业大量使用。

## 4. Linux 系统组成

一个 Linux 系统可以理解为：硬件 + Linux Kernel 内核 + Shell 命令解释器 + 文件系统 + 系统服务 + 应用程序。

:::diagram
linux-composition
:::

### 4.1 Kernel（内核）

内核是 Linux 的核心，负责：

- 硬件管理：CPU、内存、磁盘、网卡
- 进程管理：控制程序运行
- 内存管理：分配 RAM 资源
- 文件系统：管理文件
- 网络通信：处理 TCP/IP

### 4.2 Shell

Shell 是用户和 Linux 之间交流的工具。例如输入 **ls**，Shell 告诉系统：显示当前目录文件。

常见 Shell：

- **Bash**：最常用，Linux 默认 Shell，用 **echo $SHELL** 可查看当前 Shell。
- **Zsh**：功能更丰富。

## 5. Linux 命令行

Linux 最大的特点是命令操作，例如：

| 命令 | 作用 |
| --- | --- |
| ls | 查看当前目录文件 |
| cd | 进入目录 |
| touch test.txt | 创建文件 |
| rm test.txt | 删除文件 |

## 6. Linux 和 Windows 区别

| 项目 | Linux | Windows |
| --- | --- | --- |
| 开源 | 是 | 否 |
| 操作方式 | 命令多 | 图形界面 |
| 服务器 | 大量使用 | 较少 |
| 稳定性 | 高 | 一般 |
| 权限 | 严格 | 相对简单 |
| 软件安装 | 包管理 | 安装程序 |

## 7. Linux 应用领域

- **服务器**：全球大量网站运行 Linux，例如 Web 服务器 Nginx、数据库 MySQL。
- **云计算**：阿里云、腾讯云、AWS 大量使用 Linux 服务器。
- **大数据**：大数据生态基本基于 Linux，例如 Hadoop、Spark、Kafka、Hive。
- **人工智能**：AI 服务器 Linux 占主流，例如 GPU 服务器、深度学习环境。

## 8. 学习 Linux 路线

推荐学习顺序：

:::diagram
linux-roadmap
:::

## 第一篇总结

- **Linux 核心概念**：Linux = 内核 Kernel + Shell + 文件系统 + 工具软件。
- **学习重点**：不是背命令，而是理解 Linux 如何管理计算机资源，并通过命令控制系统。

**后续预告：**第二篇「Linux 安装与环境搭建」——虚拟机安装 Linux、VMware 配置、Ubuntu/CentOS 选择、网络模式、IP 配置、SSH 远程连接、用户创建、root 权限、快照管理、Linux 初始化配置，这部分会开始进入真正的服务器使用。
