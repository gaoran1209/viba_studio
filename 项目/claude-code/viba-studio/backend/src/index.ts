import express from 'express';
import cors from 'cors';
import { config } from './config';
import { initDatabase } from './models';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import generationRoutes from './routes/generations';

const app = express();

// CORS 配置
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/generations', generationRoutes);

// 错误处理
app.use(errorHandler);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`CORS origin: ${config.cors.origin}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
