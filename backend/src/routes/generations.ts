import { Router, Response, NextFunction } from 'express';
import { Generation, GenerationType, GenerationStatus } from '../models/Generation';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

const router = Router();

// 获取当前用户的生成历史
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, limit = '20', offset = '0' } = req.query;

    const where: any = { user_id: req.user!.id };

    if (type && Object.values(GenerationType).includes(type as GenerationType)) {
      where.type = type;
    }

    const { count, rows } = await Generation.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });

    res.json({
      total: count,
      items: rows,
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个生成记录详情
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const generation = await Generation.findOne({
      where: {
        id: req.params.id,
        user_id: req.user!.id,
      },
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    res.json(generation);
  } catch (error) {
    next(error);
  }
});

// 创建生成记录
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, input_images, parameters } = req.body;

    if (!type || !input_images || !parameters) {
      return res.status(400).json({
        error: 'Type, input_images, and parameters are required',
      });
    }

    const generation = await Generation.create({
      user_id: req.user!.id,
      type,
      input_images,
      output_images: [],
      parameters,
      status: GenerationStatus.PENDING,
    });

    res.status(201).json(generation);
  } catch (error) {
    next(error);
  }
});

// 更新生成记录状态
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const generation = await Generation.findOne({
      where: {
        id: req.params.id,
        user_id: req.user!.id,
      },
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    const { status, output_images, error_message } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (output_images) updateData.output_images = output_images;
    if (error_message !== undefined) updateData.error_message = error_message;

    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date();
    }

    await generation.update(updateData);
    res.json(generation);
  } catch (error) {
    next(error);
  }
});

// 删除生成记录
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const generation = await Generation.findOne({
      where: {
        id: req.params.id,
        user_id: req.user!.id,
      },
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    await generation.destroy();
    res.json({ message: 'Generation deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

