# Food TikTok App

A React Native food delivery app built with Expo that features user authentication and social food content sharing.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon public key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database Schema
Execute the following SQL in your Supabase SQL editor:

```sql
-- Users table (extends Supabase auth.users)
create table users (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text unique not null,
  user_type text check (user_type in ('normal', 'restaurant', 'influencer')) default 'normal',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Meals table
create table meals (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references users(id) on delete cascade not null,
  name text not null,
  description text,
  video_url text,
  price numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table  
create table orders (
  id uuid default gen_random_uuid() primary key,
  meal_id uuid references meals(id) on delete cascade not null,
  buyer_id uuid references users(id) on delete cascade not null,
  restaurant_id uuid references users(id) on delete cascade not null,
  address text not null,
  phone text not null,
  status text check (status in ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table users enable row level security;
alter table meals enable row level security;
alter table orders enable row level security;

-- Users policies
create policy "Users can view their own profile" on users for select using (auth.uid() = id);
create policy "Users can update their own profile" on users for update using (auth.uid() = id);

-- Meals policies  
create policy "Anyone can view meals" on meals for select to authenticated using (true);
create policy "Restaurant users can insert meals" on meals for insert with check (auth.uid() = restaurant_id);
create policy "Restaurant users can update their meals" on meals for update using (auth.uid() = restaurant_id);
create policy "Restaurant users can delete their meals" on meals for delete using (auth.uid() = restaurant_id);

-- Orders policies
create policy "Users can view their orders" on orders for select using (auth.uid() = buyer_id or auth.uid() = restaurant_id);
create policy "Buyers can create orders" on orders for insert with check (auth.uid() = buyer_id);
create policy "Restaurants can update order status" on orders for update using (auth.uid() = restaurant_id);
```

### 4. Run the App
```bash
npm start
```

Then press:
- `a` to open on Android simulator
- `i` to open on iOS simulator
- `w` to open in web browser

## Features

### Authentication
- Email/password signup and login
- Persistent authentication state
- Logout functionality

### Navigation
- Stack navigation for authentication flows
- Bottom tab navigation for main app (Explore, Saved, Discover, Profile)
- Navigation guards for authenticated/unauthenticated states

### User Types
- Normal users: Browse and order food
- Restaurant users: Create and manage meals
- Influencer users: Special content creation features

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Navigation**: React Navigation v7
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence