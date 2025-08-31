# Food TikTok App

A modern food delivery MVP application built with React Native and Node.js, featuring a monorepo architecture with TypeScript throughout.

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript
- **Mobile**: React Native + Expo + TypeScript  
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for images
- **Real-time**: Supabase subscriptions
- **Testing**: Jest (unit), Playwright (E2E)

## 📁 Project Structure

```
food-tiktok-app/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── mobile/            # React Native app
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── contexts/
│   │   └── services/
│   └── package.json
├── shared/            # Shared types & utilities
│   └── src/types/
├── db/               # Database initialization
├── docker-compose.yml # Local development setup
└── supabase-schema.sql # Production database schema
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI
- Docker (optional, for local development)

### 1. Clone and Install

```bash
git clone <repository-url>
cd food-tiktok-app
npm install
```

### 2. Environment Setup

#### Backend Environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials
```

#### Mobile Environment
```bash
cp mobile/.env.example mobile/.env
# Edit mobile/.env with your Supabase credentials
```

### 3. Database Setup

#### Option A: Use Supabase (Recommended)
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase-schema.sql` in your Supabase SQL editor
3. Update environment variables with your Supabase URL and keys

#### Option B: Local Development with Docker
```bash
# Start PostgreSQL and Redis
docker-compose up postgres redis
```

### 4. Start Development Servers

#### Method 1: All at Once
```bash
npm run dev
```

#### Method 2: Individual Services
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Mobile
npm run dev:mobile
```

## 🛠️ Development Commands

### Root Level
- `npm run dev` - Start all services
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run typecheck` - Type check all packages

### Backend
- `npm run dev --workspace=backend` - Development server
- `npm run build --workspace=backend` - Build for production
- `npm run test --workspace=backend` - Run unit tests

### Mobile
- `npm run dev --workspace=mobile` - Start Expo development server
- `npm run android --workspace=mobile` - Run on Android
- `npm run ios --workspace=mobile` - Run on iOS
- `npm run test:e2e --workspace=mobile` - Run E2E tests with Playwright

## 📋 Testing

### Unit Tests
```bash
# All packages
npm run test

# Backend only
npm run test --workspace=backend

# Mobile only
npm run test --workspace=mobile
```

### E2E Tests
```bash
# Mobile E2E tests
npm run test:e2e --workspace=mobile
```

## 🗄️ Database Schema

The application uses the following core tables:

- **profiles** - User profiles (extends Supabase auth.users)
- **restaurants** - Restaurant information and location
- **menu_items** - Restaurant menu items
- **orders** - Customer orders
- **order_items** - Individual items within orders

See `supabase-schema.sql` for the complete schema with sample data.

## 🔐 Authentication Flow

1. Users sign up/sign in via Supabase Auth
2. JWT tokens are automatically managed by Supabase
3. Row Level Security (RLS) policies protect user data
4. Mobile app persists session in AsyncStorage

## 🚀 Deployment

### Backend Deployment
The backend is designed to be deployed to any Node.js hosting service:
- Vercel, Netlify, Railway, Heroku, etc.
- Set environment variables for Supabase connection
- Ensure PORT environment variable is set

### Mobile Deployment
```bash
# Build for app stores using EAS Build
npx eas build --platform android
npx eas build --platform ios
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Mobile (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 🏆 Features Implemented

✅ **Foundation & Infrastructure**
- [x] Monorepo structure with workspaces
- [x] TypeScript configuration across all packages
- [x] Shared types and utilities
- [x] Environment configuration
- [x] Testing setup (Jest + Playwright)
- [x] Docker development environment

✅ **Authentication System**
- [x] Supabase Auth integration
- [x] JWT token management
- [x] Sign up/Sign in screens
- [x] Session persistence
- [x] Protected routes

✅ **Database & Backend**
- [x] PostgreSQL schema with RLS
- [x] Express.js REST API
- [x] CRUD operations for core entities
- [x] Error handling and validation
- [x] Sample data seeding

## 🚧 Next Steps (Post-Foundation)

The foundation is now complete! Ready for Sprint 2:

1. **Restaurant Discovery & Menu Display**
   - Restaurant list with location filtering
   - Restaurant detail pages with menus
   - Search and filtering functionality

2. **Shopping Cart & Order Management** 
   - Add to cart functionality
   - Order placement and tracking
   - Order history

3. **Payment Integration**
   - Paymob payment gateway integration
   - Multiple payment methods

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and test thoroughly
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React Native, Node.js, and Supabase**