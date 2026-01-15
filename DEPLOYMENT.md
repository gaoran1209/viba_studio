# Viba Studio 部署指南（小白版）

## 📋 目录
1. [本地测试（免费）](#本地测试免费)
2. [云端部署（Render + Vercel）](#云端部署render--vercel-推荐)
3. [阿里云部署](#阿里云部署高级)

---

## 本地测试（免费）

### 步骤 1：安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 返回项目根目录，安装前端依赖
cd ..
npm install
```

### 步骤 2：配置数据库

#### 方案 A：使用 Supabase（推荐，完全免费）

1. **注册 Supabase**
   - 访问 https://supabase.com
   - 点击 "Start your project"
   - 用 GitHub 账号登录

2. **创建项目**
   - 项目名：`viba-studio`
   - 数据库密码：**记住这个密码！**
   - 区域：选择 Southeast Asia (Singapore) - 离中国近
   - 点击 "Create new project"

3. **获取连接字符串**
   - 等待 2-3 分钟项目初始化
   - 点击左侧 **Settings** → **Database**
   - 找到 **Connection string** → 选择 **URI** 格式
   - 复制连接字符串，格式如下：
     ```
     postgresql://postgres.[你的项目]:[你的密码]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```

4. **配置后端**
   - 打开 `backend/.env`
   - 替换 `DATABASE_URL`：
     ```env
     DATABASE_URL=postgresql://postgres.[你的项目]:[你的密码]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```

#### 方案 B：使用本地 PostgreSQL（需要安装数据库）

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# 创建数据库
createdb viba_studio
```

修改 `backend/.env`：
```env
DATABASE_URL=postgresql://localhost:5432/viba_studio
```

### 步骤 3：启动后端

```bash
cd backend
npm run dev
```

你会看到：
```
Database connection established successfully.
Database models synchronized.
Server is running on port 3001
```

**保持这个终端运行！**

### 步骤 4：启动前端（新终端）

```bash
# 新开一个终端
npm run dev
```

访问 http://localhost:3000

### 步骤 5：测试应用

1. **注册账户**
   - 访问 http://localhost:3000/register
   - 填写邮箱和密码（至少 8 位）

2. **设置 API Key**
   - 登录后访问 http://localhost:3000/settings
   - 输入你的 Gemini API Key

3. **测试功能**
   - 尝试生成图像
   - 刷新页面，检查是否正常

---

## 云端部署（Render + Vercel）推荐

这是最简单的免费部署方案！

### 1. 部署后端到 Render（免费）

#### 准备工作

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/viba-studio.git
   git push -u origin main
   ```

2. **注册 Render**
   - 访问 https://render.com
   - 用 GitHub 账号登录

#### 部署步骤

1. **创建 Web Service**
   - 点击 **New** → **Web Service**
   - 连接你的 GitHub 仓库
   - 配置如下：

   | 配置项 | 值 |
   |--------|-----|
   | Name | `viba-studio-api` |
   | Environment | `Node` |
   | Build Command | `cd backend && npm install` |
   | Start Command | `cd backend && npm run build && npm start` |
   | Branch | `main` |

2. **设置环境变量**
   点击 **Advanced** → **Add Environment Variable**：

   ```env
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=你的 Supabase 连接字符串
   JWT_SECRET=随机生成一个密钥
   JWT_REFRESH_SECRET=再随机生成一个密钥
   FRONTEND_URL=https://你的前端域名.vercel.app
   ```

3. **部署**
   - 点击 **Create Web Service**
   - 等待 5-10 分钟
   - 部署成功后会得到一个 URL：`https://viba-studio-api.onrender.com`

**复制这个 URL，下一步需要！**

### 2. 部署前端到 Vercel（免费）

1. **注册 Vercel**
   - 访问 https://vercel.com
   - 用 GitHub 账号登录

2. **导入项目**
   - 点击 **Add New** → **Project**
   - 选择你的 GitHub 仓库
   - 点击 **Import**

3. **配置项目**
   在 **Environment Variables** 中添加：

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | 你的 Render 后端 URL (如 `https://viba-studio-api.onrender.com`) |

4. **部署**
   - 点击 **Deploy**
   - 等待 1-2 分钟
   - 部署成功！访问：`https://viba-studio.vercel.app`

### 3. 配置 Supabase CORS（重要）

1. 访问 Supabase Dashboard
2. 点击 **Settings** → **Database**
3. 找到 **Connection pooling**
4. 在 **Transaction mode** 的连接字符串中，替换端口 `6543` 为 `5432`

### 4. 完成！

✅ 后端：`https://viba-studio-api.onrender.com`
✅ 前端：`https://viba-studio.vercel.app`

---

## 阿里云部署（高级）

如果你想用阿里云，可以参考这个简化方案：

### 方案：阿里云 ECS + Docker

这是最传统的方式，适合需要完全控制的情况。

#### 1. 购买阿里云 ECS

1. 访问 https://ecs.console.aliyun.com
2. 点击 **创建实例**
3. 选择配置（新手推荐）：
   - **实例规格**：2核4GB（按量付费，约 ¥0.5/小时）
   - **镜像**：Ubuntu 20.04
   - **网络类型**：专有网络（VPC）
   - **公网 IP**：分配
   - **安全组**：开放 80、443、3000、3001 端口

4. 购买（需要实名认证）

#### 2. 登录服务器

```bash
# 使用 SSH 客户端（Windows 用 PuTTY，Mac 用 Terminal）
ssh root@你的公网IP
```

#### 3. 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker
systemctl start docker
systemctl enable docker
```

#### 4. 创建 Docker Compose 文件

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - db
    restart: always

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=viba_studio
      - POSTGRES_USER=viba
      - POSTGRES_PASSWORD=你的密码
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres_data:
```

#### 5. 部署

```bash
# 克隆代码
git clone https://github.com/你的用户名/viba-studio.git
cd viba-studio

# 创建 .env 文件
cat > .env << EOF
DATABASE_URL=postgresql://viba:你的密码@db:5432/viba_studio
JWT_SECRET=随机密钥
JWT_REFRESH_SECRET=随机密钥
FRONTEND_URL=http://你的公网IP
EOF

# 启动服务
docker-compose up -d
```

#### 6. 配置域名（可选）

1. 购买域名（阿里云或其他）
2. 在 **域名解析** 中添加 A 记录指向你的服务器 IP
3. 安装 Nginx 和 SSL 证书（使用 Certbot）

---

## 常见问题

### Q1: 后端启动失败，提示 "Database connection failed"

**A:** 检查 `DATABASE_URL` 是否正确：
- Supabase：确保密码正确
- 本地：确保 PostgreSQL 服务已启动

### Q2: 前端无法连接后端

**A:** 检查以下项：
1. 后端是否运行（访问 http://localhost:3001/health）
2. 前端 `.env` 中的 `VITE_API_URL` 是否正确
3. CORS 配置是否正确

### Q3: 登录后刷新页面，提示未登录

**A:** 检查：
1. 浏览器控制台是否有错误
2. localStorage 中是否有 `access_token`
3. JWT_SECRET 是否配置正确

### Q4: 部署到 Render 后，数据库连接失败

**A:** 检查 Supabase 设置：
1. 确保 Supabase 项目没有暂停
2. 检查 IP 白名单（应该是 0.0.0.0/0）
3. 尝试使用连接池模式

---

## 成本估算

### 免费方案（推荐新手）

| 服务 | 价格 | 限制 |
|------|------|------|
| Supabase | 免费 | 500MB 数据库 |
| Render | 免费 | 750 小时/月 |
| Vercel | 免费 | 100GB 带宽/月 |
| **总计** | **¥0** | 适合 100 用户 |

### 付费方案（生产环境）

| 服务 | 价格 |
|------|------|
| Render | $7/月（后端）|
| Vercel | $20/月（前端）|
| Supabase Pro | $25/月 |
| **总计** | **$52/月** (约 ¥370/月) |

---

## 下一步

1. **本地测试**：确保所有功能正常
2. **云端部署**：使用 Render + Vercel 免费版
3. **购买域名**（可选）：让网站更专业
4. **监控**：设置错误监控（Sentry）

需要帮助？随时问我！
