# Viba Studio Backend

后端 API 服务，基于 Node.js + Express + TypeScript。

## 技术栈

- **框架**: Express.js + TypeScript
- **数据库**: PostgreSQL (阿里云 RDS)
- **认证**: JWT
- **存储**: 阿里云 OSS

## 开发环境设置

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
DATABASE_URL=postgresql://username:password@host:5432/viba_studio

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# 阿里云 OSS 配置
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your-oss-access-key-id
OSS_ACCESS_KEY_SECRET=your-oss-access-key-secret
OSS_BUCKET=viba-studio

# CORS 配置
FRONTEND_URL=http://localhost:3000
```

### 3. 运行开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

## API 端点

### 认证

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新 token

### 用户

- `GET /api/v1/users/me` - 获取当前用户信息
- `PUT /api/v1/users/me` - 更新用户信息
- `DELETE /api/v1/users/me` - 删除账户

### 生成历史

- `GET /api/v1/generations` - 获取生成历史列表
- `POST /api/v1/generations` - 创建生成记录
- `GET /api/v1/generations/:id` - 获取单个记录
- `PUT /api/v1/generations/:id` - 更新生成记录
- `DELETE /api/v1/generations/:id` - 删除生成记录

## 数据库模型

### User (用户表)

- `id`: UUID (主键)
- `email`: VARCHAR(255) (唯一)
- `hashed_password`: VARCHAR(255)
- `full_name`: VARCHAR(255) (可选)
- `created_at`: TIMESTAMP

### Generation (生成历史表)

- `id`: UUID (主键)
- `user_id`: UUID (外键)
- `type`: ENUM('derivation', 'avatar', 'try_on', 'swap')
- `status`: ENUM('pending', 'processing', 'completed', 'failed')
- `input_images`: JSONB
- `output_images`: JSONB
- `parameters`: JSONB
- `error_message`: TEXT (可选)
- `created_at`: TIMESTAMP
- `completed_at`: TIMESTAMP (可选)

## 部署

### 阿里云函数计算 (FC)

1. 安装 Serverless Devs：

```bash
npm install -g @serverless-devs/s
```

2. 配置 `s.yaml` (创建项目后自动生成)

3. 部署：

```bash
s deploy
```
