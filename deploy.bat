@echo off
chcp 65001 > nul
echo 🚀 Viba Studio 快速部署脚本
echo ============================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未安装 Node.js，请先安装: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 版本:
node --version
echo.

REM 检查数据库配置
if not exist "backend\.env" (
    echo ❌ 未找到 backend\.env 文件
    echo 请先复制 backend\.env.example 到 backend\.env 并配置数据库
    pause
    exit /b 1
)

REM 检查 DATABASE_URL 是否配置
findstr /C:"DATABASE_URL=postgresql://username:password" backend\.env >nul
if %errorlevel% equ 0 (
    echo ❌ 请先配置 backend\.env 中的 DATABASE_URL
    echo.
    echo 获取免费数据库：
    echo 1. 访问 https://supabase.com
    echo 2. 创建项目并获取连接字符串
    echo 3. 替换 backend\.env 中的 DATABASE_URL
    pause
    exit /b 1
)

echo ✅ 数据库配置已检查
echo.

REM 安装后端依赖
echo 📦 安装后端依赖...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)
cd ..
echo ✅ 后端依赖安装完成
echo.

REM 安装前端依赖
echo 📦 安装前端依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 前端依赖安装完成
echo.

REM 启动服务
echo 🎯 启动服务...
echo.
echo 后端将在窗口 1 运行，前端将在窗口 2 运行
echo.
echo 按任意键继续...
pause > nul

REM 启动后端（新窗口）
start "Viba Studio Backend" cmd /k "cd backend && npm run dev"

REM 等待 3 秒让后端启动
timeout /t 3 /nobreak > nul

REM 启动前端（新窗口）
start "Viba Studio Frontend" cmd /k "npm run dev"

echo.
echo ✅ 部署完成！
echo.
echo 📱 访问地址：
echo    前端: http://localhost:3000
echo    后端: http://localhost:3001
echo.
echo 📝 下一步：
echo    1. 访问 http://localhost:3000/register 注册账户
echo    2. 登录后访问 Settings 设置 Gemini API Key
echo    3. 开始使用！
echo.

pause
