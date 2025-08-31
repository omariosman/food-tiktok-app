import { Router } from 'express';
import { supabase } from '../services/supabase';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/restaurants - Get all restaurants
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      throw createError(error.message, 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/restaurants/:id - Get restaurant by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      throw createError('Restaurant not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/restaurants/:id/menu - Get restaurant menu
router.get('/:id/menu', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', id)
      .eq('is_available', true)
      .order('category');

    if (error) {
      throw createError(error.message, 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/restaurants/nearby - Get nearby restaurants
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      throw createError('Latitude and longitude are required', 400);
    }

    // This would use PostGIS in production for proper distance calculations
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      throw createError(error.message, 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export { router as restaurantRoutes };