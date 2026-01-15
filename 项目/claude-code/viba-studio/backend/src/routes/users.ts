import { Router } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 获取当前用户信息
router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.toSafeJSON());
  } catch (error) {
    next(error);
  }
});

// 更新用户信息
router.put('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { full_name } = req.body;
    if (full_name !== undefined) {
      user.full_name = full_name;
    }

    await user.save();
    res.json(user.toSafeJSON());
  } catch (error) {
    next(error);
  }
});

// 删除账户
router.delete('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
