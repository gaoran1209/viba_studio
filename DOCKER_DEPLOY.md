# Docker 快速部署指南

## 最简单的部署方式（推荐新手）

使用 Docker 可以一键启动所有服务，无需手动安装数据库！

### 前置条件

安装 Docker Desktop：
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Windows: https://docs.docker.com/desktop/install/windows-install/

### 一键启动

```bash
docker-compose up -d
```

就这么简单！访问：
- 前端: http://localhost:3000
- 后端: http://localhost:3001

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 停止服务

```bash
docker-compose down
```

### 重启服务

```bash
docker-compose restart
```

---

## 配置说明

### 修改环境变量

编辑 `docker-compose.yml` 文件：

```yaml
backend:
  environment:
    # 修改 JWT 密钥
    JWT_SECRET: your-secret-key
    JWT_REFRESH_SECRET: your-refresh-secret-key

db:
  environment:
    # 修改数据库密码
    POSTGRES_PASSWORD: your-db-password
```

修改后重启：
```bash
docker-compose down
docker-compose up -d
```

---

## 常见问题

### 问题 1: 端口被占用

如果 3000 或 3001 端口已被占用，修改 `docker-compose.yml`：

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 改用 8080 端口

  backend:
    ports:
      - "8000:3001"  # 改用 8000 端口
```

### 问题 2: 数据库连接失败

确保数据库服务已启动：
```bash
docker-compose ps
```

查看数据库日志：
```bash
docker-compose logs db
```

### 问题 3: 前端无法连接后端

检查 `VITE_API_URL` 环境变量是否正确。

---

## 数据持久化

数据库数据存储在 Docker volume 中，即使删除容器数据也不会丢失。

### 备份数据

```bash
docker exec viba-postgres pg_dump -U viba viba_studio > backup.sql
```

### 恢复数据

```bash
docker exec -i viba-postgres psql -U viba viba_studio < backup.sql
```

---

## 生产环境部署

### 使用外部数据库（推荐）

使用 Supabase 等云数据库，修改 `docker-compose.yml`：

```yaml
services:
  backend:
    environment:
      DATABASE_URL: postgresql://user:pass@host:5432/db
```

删除 `db` 服务：
```yaml
# services:
#   db: ...
```

### 构建生产镜像

```bash
# 构建后端镜像
docker build -t viba-backend ./backend

# 构建前端镜像
docker build -t viba-frontend .
```

---

## 性能优化

### 限制资源使用

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### 使用多阶段构建

已在 Dockerfile 中实现，减小镜像体积。

---

## 下一步

1. **使用外部数据库**：迁移到 Supabase
2. **配置域名**：使用 Nginx 反向代理
3. **启用 HTTPS**：使用 Let's Encrypt
4. **监控**：添加健康检查和日志收集
