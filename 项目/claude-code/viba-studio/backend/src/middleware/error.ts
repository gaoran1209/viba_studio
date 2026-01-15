import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const message = error.message || 'Internal server error';
  const status = (error as any).status || 500;

  res.status(status).json({
    error: message,
  });
};
