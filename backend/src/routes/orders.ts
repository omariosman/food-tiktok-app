import { Router } from 'express';
import { supabase } from '../services/supabase';
import { createError } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /api/orders - Create new order
router.post('/', async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, total } = req.body;
    const userId = (req as any).user.id;

    if (!restaurantId || !items || !deliveryAddress || !total) {
      throw createError('Missing required fields', 400);
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        restaurant_id: restaurantId,
        total,
        status: 'pending',
        delivery_address: deliveryAddress,
      })
      .select()
      .single();

    if (orderError) {
      throw createError(orderError.message, 500);
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw createError(itemsError.message, 500);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders - Get user orders
router.get('/', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants (name, image_url),
        order_items (
          *,
          menu_items (name, price)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw createError(error.message, 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants (name, image_url, address),
        order_items (
          *,
          menu_items (name, price, description)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw createError('Order not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id/status - Update order status (for restaurant/admin use)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw createError('Status is required', 400);
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      message: 'Order status updated successfully',
      order: data,
    });
  } catch (error) {
    next(error);
  }
});

export { router as orderRoutes };