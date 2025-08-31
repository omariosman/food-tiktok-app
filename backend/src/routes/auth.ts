import { Router } from 'express';
import { supabase } from '../services/supabase';
import { createError } from '../middleware/errorHandler';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, username, fullName } = req.body;

    if (!email || !password || !username) {
      throw createError('Email, password, and username are required', 400);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: data.user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw createError('Invalid credentials', 401);
    }

    res.json({
      message: 'Signed in successfully',
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/signout
router.post('/signout', async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };