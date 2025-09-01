# Food TikTok App - Database Setup

This directory contains the database schema and setup scripts for the Saved Dishes functionality using Supabase.

## Quick Setup

### 1. Supabase Dashboard Setup

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to the SQL Editor
3. Execute the migration files in order:
   - `migrations/001_initial_schema.sql`
   - `migrations/002_saved_dishes_triggers.sql`
   - `migrations/003_sample_data.sql`

### 2. Environment Variables

Make sure your `.env` file contains:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

### Tables

#### `profiles`
- User profiles linked to Supabase Auth
- Fields: id, email, full_name, username, avatar_url

#### `restaurants`
- Restaurant information
- Fields: id, name, description, rating, delivery_rating, delivery_time_min, delivery_fee

#### `menu_items`
- Dishes/menu items for restaurants
- Fields: id, restaurant_id, name, price, image_url, times_saved, restaurant_name, delivery_time, delivery_fee

#### `saved_dishes`
- User's saved dishes (many-to-many relationship)
- Fields: id, user_id, restaurant_id, dish_id, saved_at
- Unique constraint: (user_id, dish_id)

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access their own saved dishes
- Public read access to restaurants and menu items
- Users can manage their own profiles

### Triggers

- **Auto-increment saved count**: When a dish is saved, `times_saved` increments
- **Auto-decrement saved count**: When a dish is unsaved, `times_saved` decrements  
- **Restaurant data sync**: Updates menu items when restaurant info changes
- **Updated timestamps**: Automatically manages `updated_at` fields

## API Usage

### Import the service
```javascript
import { 
  getSavedDishes,
  saveDish,
  removeSavedDish,
  searchSavedDishes,
  isDishSaved 
} from '../services/savedDishesService'
```

### Get user's saved dishes
```javascript
const { data: savedDishes, error } = await getSavedDishes()
```

### Save a dish
```javascript
const { data, error } = await saveDish(dishId)
```

### Remove a saved dish
```javascript
const { data, error } = await removeSavedDish(dishId)
```

### Search saved dishes
```javascript
const { data: results, error } = await searchSavedDishes('pizza')
```

### Check if dish is saved
```javascript
const { isSaved, error } = await isDishSaved(dishId)
```

## Sample Data

The setup includes sample data for:
- 8 restaurants (Bella Italia, Burger House, Green Garden, etc.)
- 16 menu items with realistic pricing and images
- Pre-populated `times_saved` counters

## Manual Setup Alternative

If the automated script doesn't work, you can:

1. Copy the SQL content from each migration file
2. Paste into Supabase SQL Editor
3. Execute each migration in order
4. Verify tables are created with: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

## Troubleshooting

### Common Issues

1. **RLS Policies**: Make sure RLS is enabled and policies are created
2. **Authentication**: Ensure user is logged in when accessing saved dishes
3. **Foreign Keys**: Verify restaurant_id and dish_id exist before saving
4. **Unique Constraint**: Handle duplicate saves gracefully

### Testing

Test the setup by:
1. Creating a user account
2. Browsing available dishes
3. Saving/unsaving dishes  
4. Searching saved dishes
5. Checking saved counts update correctly

## Schema Evolution

To add new features:
1. Create new migration file with incremented number
2. Add appropriate RLS policies
3. Update service functions
4. Test thoroughly before deploying