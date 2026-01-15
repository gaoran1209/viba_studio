#!/bin/bash

echo "🚀 Viba Studio 快速部署脚本"
echo "============================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js，请先安装: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 检查数据库配置
if [ ! -f "backend/.env" ]; then
    echo "❌ 未找到 backend/.env 文件"
    echo "请先复制 backend/.env.example 到 backend/.env 并配置数据库"
    exit 1
fi

# 检查 DATABASE_URL 是否配置
if grep -q "DATABASE_URL=postgresql://username:password" backend/.env; then
    echo "❌ 请先配置 backend/.env 中的 DATABASE_URL"
    echo ""
    echo "获取免费数据库："
    echo "1. 访问 https://supabase.com"
    echo "2. 创建项目并获取连接字符串"
    echo "3. 替换 backend/.env 中的 DATABASE_URL"
    exit 1
fi

echo "✅ 数据库配置已检查"
echo ""

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi
cd ..
echo "✅ 后端依赖安装完成"
echo ""

# 安装前端依赖
echo "📦 安装前端依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi
echo "✅ 前端依赖安装完成"
echo ""

# 启动服务
echo "🎯 启动服务..."
echo ""
echo "后端将在终端 1 运行，前端将在终端 2 运行"
echo ""
echo "按任意键继续..."
read -n 1

# 启动后端
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/backend && npm run dev"'

# 等待 3 秒让后端启动
sleep 3

# 启动前端
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm run dev"'

echo ""
echo "✅ 部署完成！"
echo ""
echo "📱 访问地址："
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:3001"
echo ""
echo "📝 下一步："
echo "   1. 访问 http://localhost:3000/register 注册账户"
echo "   2. 登录后访问 Settings 设置 Gemini API Key"
echo "   3. 开始使用！"
echo ""
