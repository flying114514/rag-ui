# AI Interview Platform - 智能AI面试官平台

基于 Spring Boot + React + RAG 技术栈的智能面试平台，支持简历分析、模拟面试、语音交互、视频面试等功能。

## 功能特性

- **智能简历分析** — 基于 RAG 技术自动解析简历，AI 评分并给出改进建议
- **简历生成** — 使用 AI 或专业模板创建高质量简历
- **模拟面试** — 支持文字面试和视频面试，AI 动态追问
- **视频面试** — 摄像头/麦克风采集、语音播报、自动录制、表情分析
- **知识库管理** — 构建个人知识库，AI 问答助手随时待命
- **面试记录** — 查看所有面试历史、评分和详细反馈

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion（动画）
- React Router（路由）

### 后端
- Spring Boot + Gradle
- RAG（检索增强生成）
- AI 大模型集成（Deepgram / Gemini）

## 快速启动

### 前端

```bash
cd frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5173

### 后端

```bash
# 使用 Gradle 启动
./gradlew :app:bootRun
```

## 项目结构

```
├── frontend/           # React 前端
│   ├── public/         # 静态资源（视频、图片）
│   ├── src/
│   │   ├── api/        # API 请求层
│   │   ├── components/ # 通用组件
│   │   ├── pages/      # 页面组件
│   │   ├── styles/     # 全局样式
│   │   └── types/      # TypeScript 类型
│   └── package.json
├── app/                # Spring Boot 主应用
├── interview/          # 面试模块
├── docker/             # Docker 配置
└── docs/               # 项目文档
```

## 演示账号

- 用户名：`demo`
- 密码：`demo1234`
- **面试评分**：多维度智能评分系统
- **知识库管理**：支持上传文档构建面试知识库

## 技术栈

### 后端
- **框架**：Spring Boot 3.x + Java 21（虚拟线程）
- **数据库**：PostgreSQL 16 + pgvector（向量数据库）
- **缓存/消息队列**：Redis 7 + Redis Stream
- **对象存储**：MinIO（兼容 S3 协议）
- **AI 能力**：Spring AI + OpenAI 兼容接口（支持 Gemini、百炼、OpenRouter）

### 前端
- **框架**：Vue 3 + TypeScript + Vite
- **UI 组件**：Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router

## 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 可用内存

### 一键部署（推荐）

1. **克隆项目**

```bash
git clone <your-repo-url>
cd clone-interview-rag-multi
```

2. **配置环境变量**

复制 `.env.example` 为 `.env` 并填写必要的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，至少需要配置以下内容：

```bash
# AI 模型配置（必填）
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
AI_MODEL=gemini-2.0-flash
AI_API_KEY=your_gemini_api_key

# 视频分析模型（可选，不配置则禁用视频分析功能）
AI_GEMINI_API_KEY=your_gemini_api_key

# 语音功能（可选，不配置则禁用语音功能）
APP_INTERVIEW_MEDIA_TRANSCRIPTION_API_KEY=your_deepgram_api_key
APP_INTERVIEW_MEDIA_TTS_API_KEY=your_deepgram_api_key
```

3. **启动服务**

```bash
docker-compose up -d
```

首次启动需要下载镜像和构建，大约需要 5-10 分钟。

4. **访问应用**

- **前端界面**：http://localhost
- **后端 API**：http://localhost:18080
- **API 文档**：http://localhost:18080/swagger-ui.html
- **MinIO 控制台**：http://localhost:9001（用户名/密码：minioadmin/minioadmin）

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app      # 后端
docker-compose logs -f frontend # 前端
docker-compose logs -f postgres # 数据库
```

### 停止服务

```bash
# 停止服务（保留数据）
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v
```

## 本地开发部署

如果需要在本地开发环境运行（不使用 Docker），请按以下步骤操作：

### 1. 安装依赖服务

确保本地已安装并启动：
- PostgreSQL 16（需安装 pgvector 扩展）
- Redis 7
- MinIO

或使用 `docker-compose.dev.yml` 只启动基础设施：

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. 配置数据库

连接到 PostgreSQL 并执行初始化脚本：

```bash
psql -U postgres -d interview_guide -f docker/postgres/init.sql
```

### 3. 启动后端

```bash
# 使用 Gradle 启动
./gradlew :app:bootRun

# 或者先构建再运行
./gradlew :app:bootJar
java -jar app/build/libs/*.jar
```

后端将在 http://localhost:8080 启动。

### 4. 启动前端

```bash
cd frontend

# 安装依赖
pnpm install

# 开发模式启动
pnpm dev
```

前端将在 http://localhost:5173 启动。

## 环境变量说明

### AI 模型配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `AI_BASE_URL` | AI 模型 API 地址 | - |
| `AI_MODEL` | 主模型名称 | `gemini-2.0-flash` |
| `AI_API_KEY` | AI API 密钥 | - |
| `AI_GEMINI_API_KEY` | Gemini API 密钥（用于视频分析） | - |
| `AI_BAILIAN_API_KEY` | 百炼 API 密钥（可选） | - |

### 视频分析配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `APP_AI_VIDEO_ANALYSIS_ENABLED` | 是否启用视频分析 | `true` |
| `APP_AI_VIDEO_ANALYSIS_BASE_URL` | 视频分析模型 API 地址 | Gemini API |
| `APP_AI_VIDEO_ANALYSIS_MODEL` | 视频分析模型名称 | `gemini-2.0-flash` |
| `APP_AI_VIDEO_ANALYSIS_API_KEY` | 视频分析 API 密钥 | 继承 `AI_GEMINI_API_KEY` |

### 语音功能配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `APP_INTERVIEW_MEDIA_TRANSCRIPTION_ENABLED` | 是否启用语音识别 | `true` |
| `APP_INTERVIEW_MEDIA_TRANSCRIPTION_API_KEY` | Deepgram API 密钥 | - |
| `APP_INTERVIEW_MEDIA_TTS_ENABLED` | 是否启用语音合成 | `true` |
| `APP_INTERVIEW_MEDIA_TTS_API_KEY` | Deepgram TTS API 密钥 | - |

### 数据库配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `POSTGRES_HOST` | PostgreSQL 主机地址 | `localhost` |
| `POSTGRES_PORT` | PostgreSQL 端口 | `5432` |
| `POSTGRES_USER` | 数据库用户名 | `postgres` |
| `POSTGRES_PASSWORD` | 数据库密码 | `password` |
| `POSTGRES_DB` | 数据库名称 | `interview_guide` |

### Redis 配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `REDIS_HOST` | Redis 主机地址 | `localhost` |
| `REDIS_PORT` | Redis 端口 | `6379` |

### 对象存储配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `APP_STORAGE_ENDPOINT` | MinIO/S3 端点 | `http://localhost:9000` |
| `APP_STORAGE_ACCESS_KEY` | 访问密钥 | `minioadmin` |
| `APP_STORAGE_SECRET_KEY` | 密钥 | `minioadmin` |
| `APP_STORAGE_BUCKET` | 存储桶名称 | `interview-guide` |

### 跨域配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `CORS_ALLOWED_ORIGINS` | 允许的跨域来源（逗号分隔） | `http://localhost:5173,...` |

## 生产环境部署建议

### 1. 安全配置

- 修改所有默认密码（数据库、Redis、MinIO）
- 使用强密码并妥善保管
- 配置防火墙规则，只开放必要端口
- 启用 HTTPS（建议使用 Nginx 反向代理 + Let's Encrypt）

### 2. 性能优化

- 根据实际负载调整数据库连接池大小（`DB_POOL_MAX_SIZE`）
- 配置 Redis 持久化策略
- 使用 CDN 加速静态资源
- 考虑使用云厂商的对象存储（如 AWS S3、阿里云 OSS）替代 MinIO

### 3. 监控与日志

- 配置日志收集（如 ELK Stack）
- 设置应用监控（如 Prometheus + Grafana）
- 配置告警规则

### 4. 备份策略

- 定期备份 PostgreSQL 数据库
- 备份 MinIO 存储桶数据
- 备份 Redis 数据（如需持久化）

### 5. 扩展性

- 使用 Kubernetes 进行容器编排
- 配置负载均衡
- 考虑使用托管数据库服务

## 常见问题

### 1. 启动失败，提示端口被占用

检查端口占用情况：

```bash
# Windows
netstat -ano | findstr "8080"
netstat -ano | findstr "5432"

# Linux/Mac
lsof -i :8080
lsof -i :5432
```

修改 `docker-compose.yml` 中的端口映射，或停止占用端口的服务。

### 2. AI 模型调用失败

- 检查 API 密钥是否正确
- 确认 API 地址是否可访问
- 查看后端日志获取详细错误信息

### 3. 数据库连接失败

- 确认 PostgreSQL 服务已启动
- 检查数据库连接配置是否正确
- 查看数据库日志：`docker-compose logs postgres`

### 4. 前端无法访问后端 API

- 检查 CORS 配置是否包含前端地址
- 确认后端服务已正常启动
- 检查网络连接和防火墙设置

### 5. 视频/语音功能不可用

- 确认已配置相应的 API 密钥
- 检查浏览器是否支持 WebRTC
- 确保使用 HTTPS（某些浏览器要求）

## 项目结构

```
clone-interview-rag-multi/
├── app/                      # 后端应用
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/        # Java 源代码
│   │   │   └── resources/   # 配置文件
│   │   └── test/            # 测试代码
│   ├── Dockerfile           # 后端 Docker 镜像
│   └── build.gradle         # Gradle 构建配置
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # Vue 组件
│   │   ├── views/           # 页面视图
│   │   ├── router/          # 路由配置
│   │   └── stores/          # 状态管理
│   ├── Dockerfile           # 前端 Docker 镜像
│   ├── nginx.conf           # Nginx 配置
│   └── package.json         # npm 依赖
├── docker/                   # Docker 相关配置
│   └── postgres/
│       └── init.sql         # 数据库初始化脚本
├── docker-compose.yml        # Docker Compose 配置
├── docker-compose.dev.yml    # 开发环境配置
├── .env.example             # 环境变量模板
└── README.md                # 项目文档
```

## 开发指南

### 后端开发

- 代码位置：`app/src/main/java/interview/guide/`
- 配置文件：`app/src/main/resources/application.yml`
- API 文档：访问 `/swagger-ui.html` 查看接口文档

### 前端开发

- 代码位置：`frontend/src/`
- 开发服务器：`pnpm dev`
- 构建生产版本：`pnpm build`

### 数据库迁移

项目使用 JPA 自动管理数据库 schema（`ddl-auto: update`）。生产环境建议：
1. 首次部署使用 `create` 创建表结构
2. 后续部署改为 `validate` 或 `none`，手动管理数据库变更

## 许可证

本项目采用 [LICENSE](LICENSE) 许可证。

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
