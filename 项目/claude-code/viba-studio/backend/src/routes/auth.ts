import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// 注册
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const result = await AuthService.register({ email, password, full_name });
    res.status(201).json(result);
  } catch (error) {
    if ((error as Error).message === 'Email already registered') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(error);
  }
});

// 登录
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await AuthService.login({ email, password });
    res.json(result);
  } catch (error) {
    if ((error as Error).message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    next(error);
  }
});

// 刷新 token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const result = await AuthService.refreshToken(refresh_token);
    res.json(result);
  } catch (error) {
    if ((error as Error).message === 'Invalid refresh token') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    next(error);
  }
});

// 登出（可选，前端直接删除 token 即可）
router.post('/logout', authMiddleware, (req: AuthRequest, res) => {
  // 在实际应用中，可能需要将 token 加入黑名单
  res.json({ message: 'Successfully logged out' });
});

export default router;
