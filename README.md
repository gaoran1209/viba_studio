# Viba Studio - AI 图像处理工作室

一个功能强大的 AI 图像处理应用，支持图像衍生、头像生成、虚拟试穿和人物替换。

![Viba Studio](https://img.shields.io/badge/version-2.0-blue)
![React](https://img.shields.io/badge/React-19.2.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## ✨ 主要功能

- 🎨 **图像衍生** - 批量生成创意变体
- 👤 **头像生成** - 基于 AI 的专业头像创建
- 👔 **虚拟试穿** - 实时服装试穿效果
- 🔄 **人物替换** - 将人物融入不同场景
- 📝 **历史记录** - 保存所有生成历史
- 🔐 **用户认证** - 安全的注册登录系统

## 🚀 快速开始

### 方式 1：使用 Docker（最简单）

```bash
docker-compose up -d
```

访问 http://localhost:3000

**详细说明**: [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)

### 方式 2：本地开发

#### 1. 获取免费数据库

访问 https://supabase.com 创建免费数据库项目

#### 2. 配置环境

```bash
# 复制环境变量文件
cp backend/.env.example backend/.env

# 编辑 backend/.env，填写你的数据库连接字符串
```

#### 3. 安装依赖并启动

```bash
# 安装后端依赖
cd backend && npm install && npm run dev

# 新终端，安装前端依赖
npm install && npm run dev
```

**详细说明**: [QUICK_START.md](./QUICK_START.md)

## 📁 项目结构

```
viba-studio/
├── backend/                # 后端服务（Node.js + Express）
│   ├── src/
│   │   ├── models/        # 数据库模型
│   │   ├── routes/        # API 路由
│   │   ├── services/      # 业务逻辑
│   │   └── middleware/    # 中间件
│   └── package.json
├── components/            # 前端组件
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── ...
├── contexts/             # React Context
│   ├── AuthContext.tsx   # 认证上下文
│   ├── ApiKeyContext.tsx # API Key 上下文
│   └── LanguageContext.tsx
├── pages/                # 页面组件
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── SettingsPage.tsx
│   └── ...
├── services/             # API 服务
│   ├── geminiService.ts  # Gemini AI 集成
│   └── historyService.ts # 历史记录服务
├── views/                # 功能视图
│   ├── DerivationView.tsx
│   ├── AvatarView.tsx
│   ├── TryOnView.tsx
│   └── SwapView.tsx
└── App.tsx               # 应用入口
```

## 🔧 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **路由**: React Router 6
- **HTTP**: Axios
- **UI**: Tailwind CSS
- **AI**: Google Gemini SDK

### 后端
- **框架**: Express.js + TypeScript
- **数据库**: PostgreSQL (Sequelize ORM)
- **认证**: JWT
- **存储**: 阿里云 OSS (可选)

## 📦 部署指南

### 免费部署（推荐新手）

- [Render + Vercel 部署指南](./DEPLOYMENT.md)
- 完全免费，支持 100+ 用户
- 5 分钟即可完成

### Docker 部署

```bash
docker-compose up -d
```

### 阿里云部署

参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的阿里云部署章节

## 📝 环境变量

### 后端 (`backend/.env`)

```env
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
FRONTEND_URL=http://localhost:3000
```

### 前端 (`.env.local`)

```env
VITE_API_URL=http://localhost:3001
```

## 🔐 API 端点

### 认证
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新 token

### 用户
- `GET /api/v1/users/me` - 获取当前用户
- `PUT /api/v1/users/me` - 更新用户信息

### 生成历史
- `GET /api/v1/generations` - 获取历史列表
- `POST /api/v1/generations` - 创建记录
- `PUT /api/v1/generations/:id` - 更新记录
- `DELETE /api/v1/generations/:id` - 删除记录

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 💬 常见问题

**Q: 如何获取 Gemini API Key？**

A: 访问 https://ai.google.dev 获取免费 API Key

**Q: 数据库支持哪些？**

A: PostgreSQL 12+（推荐使用 Supabase 免费版）

**Q: 可以离线使用吗？**

A: 需要联网调用 Gemini API，其他功能可本地运行

---

## 📞 获取帮助

- 查看 [快速开始](./QUICK_START.md)
- 查看 [部署指南](./DEPLOYMENT.md)
- 查看 [Docker 部署](./DOCKER_DEPLOY.md)
- 提交 [Issue](https://github.com/yourusername/viba-studio/issues)

---

**Made with ❤️ by Ryan**
