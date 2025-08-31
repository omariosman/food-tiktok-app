import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase';
import { createError } from './errorHandler';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token required', 401);
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw createError('Invalid or expired token', 401);
    }

    (req as any).user = user;
    next();
  } catch (error) {
    next(error);
  }
};