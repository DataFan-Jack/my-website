# Docker 容器入门

Docker 是一个开源的容器化平台，它把应用程序及其依赖打包进标准化的**镜像**中，通过**容器**实现一次构建、到处运行。

> Docker 的核心思想：让应用与运行环境一起交付，彻底告别"在我电脑上能跑"。

## 1. 容器与虚拟机

很多人把 Docker 和虚拟机混为一谈，其实两者的隔离层级完全不同：

| 对比项 | Docker 容器 | 虚拟机 |
| --- | --- | --- |
| 隔离层级 | 进程级（共享内核） | 硬件级（独立内核） |
| 启动速度 | 秒级 | 分钟级 |
| 资源占用 | 低（只装应用依赖） | 高（每个都装完整系统） |
| 镜像体积 | MB 级 | GB 级 |
| 适用场景 | 微服务、CI/CD | 强隔离、异构系统 |

:::diagram
docker-vs-vm
:::

## 2. Docker 核心概念

Docker 由三个核心概念组成，理解它们就掌握了 Docker 的骨架：

- **镜像（Image）**：只读的应用模板，包含代码、运行时、依赖和配置。
- **容器（Container）**：镜像的运行实例，可启动、停止、删除。
- **仓库（Registry）**：集中存放镜像的地方，最常用的是 Docker Hub。

三者关系：**镜像 → 容器**（镜像运行起来就是容器），**镜像 ↔ 仓库**（拉取 / 推送镜像）。

## 3. 常用命令

```bash
# 拉取镜像
docker pull nginx

# 查看本地镜像
docker images

# 运行容器（后台运行，映射 80 端口）
docker run -d -p 8080:80 --name my-nginx nginx

# 查看运行中的容器
docker ps

# 进入容器终端
docker exec -it my-nginx bash

# 停止 / 删除容器
docker stop my-nginx
docker rm my-nginx
```

> 提示：`-d` 表示后台运行，`-p 8080:80` 表示把宿主机的 8080 端口映射到容器的 80 端口。

## 4. 容器化部署流程

把一个应用容器化的标准流程：

1. 编写 **Dockerfile**，声明基础镜像、复制代码、安装依赖、指定启动命令
2. 使用 `docker build` 构建镜像
3. 使用 `docker run` 运行容器
4. 验证服务正常后，`docker push` 推送到仓库
5. 在服务器上 `docker pull` + `docker run` 完成部署

```dockerfile
# 示例 Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 5. 数据卷与网络

容器是无状态的，重启或删除后数据会丢失，所以需要**数据卷（Volume）**持久化数据：

```bash
# 挂载数据卷，容器内 /data 目录的数据会持久化保存
docker run -d -v my-data:/data my-image
```

容器之间通过 Docker 网络通信，默认有三种网络：

| 网络模式 | 特点 | 适用 |
| --- | --- | --- |
| bridge（默认） | 容器间可互通，可映射端口 | 单机多容器 |
| host | 直接使用宿主机网络 | 追求性能 |
| none | 无网络 | 特殊隔离场景 |

## 6. Docker Compose 编排

当应用包含多个服务（前端、后端、数据库）时，用 **docker-compose.yml** 一键编排：

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
```

```bash
# 一键启动 / 停止全部服务
docker compose up -d
docker compose down
```

## 总结

- Docker 通过镜像 + 容器实现应用与环境的标准化交付。
- 与虚拟机相比，容器更轻、更快、更适合微服务。
- 掌握 镜像/容器/仓库 三个概念和常用命令，即可完成基本容器化部署。
- 后续可深入学习：多阶段构建、Dockerfile 优化、K8s 容器编排。
