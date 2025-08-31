# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Note
For UI/UX, use screenshots in directory `screens`

## Project Overview

This is a food delivery MVP application following a monorepo structure with:
- `/backend` - Node.js + Express + TypeScript
- `/mobile` - React Native + TypeScript  
- `/shared` - Shared types and utilities

**Architecture Stack:**
- Backend: Node.js, Express, TypeScript
- Mobile: React Native with TypeScript
- Database: Supabase (PostgreSQL with Row Level Security)
- Authentication: Supabase Auth
- Storage: Supabase Storage for images
- Payment: Paymob integration
- Real-time: Supabase subscriptions
- Testing: Jest (unit), Playwright (E2E)
- Push Notifications: Firebase Cloud Messaging

## Project Status

**Current State:** Project initialization phase - no code structure exists yet
**Priority:** Setting up foundational architecture and monorepo structure

## Development Commands

*Note: Commands will be added once the project structure is created*

## Key Implementation Notes

**Database Schema (Supabase):**
```sql
-- Core MVP tables
profiles (id, email, username, full_name, avatar_url, created_at)
restaurants (id, name, description, image_url, address, lat, lng, delivery_fee, min_delivery_time, rating, is_active)
menu_items (id, restaurant_id, name, description, price, image_url, category, is_available)
orders (id, user_id, restaurant_id, total, status, delivery_address, created_at)
order_items (id, order_id, menu_item_id, quantity, price)
```

**Essential API Endpoints:**
- Authentication: signup, signin, signout, profile management
- Restaurants: GET /restaurants, GET /restaurants/:id, GET /restaurants/nearby
- Menu: GET /restaurants/:id/menu
- Orders: POST /orders, GET /orders, GET /orders/:id, PATCH /orders/:id/status
- Reviews: POST /reviews, GET /restaurants/:id/reviews
- Search: Restaurant and dish search with filters

**Authentication Flow:**
- JWT tokens via Supabase Auth
- Session persistence required
- Protected routes in React Navigation
- User roles: customer only for MVP

**Payment Integration:**
- Paymob gateway for card payments
- Cash on delivery option
- Simplified wallet system
- Webhook handling for payment confirmation

**Testing Strategy:**
- Playwright for E2E testing (specifically mentioned throughout issues)
- Jest + React Native Testing Library for unit tests
- Minimum 70% code coverage target
- Test databases in Supabase for isolation

**Location Features:**
- PostGIS extension in Supabase for location queries
- Delivery radius calculations
- Location-based restaurant discovery

**Real-time Features:**
- Supabase subscriptions for order status updates
- Push notifications via FCM for order updates and promotions

## MCP Server Configuration

The project uses Context7 MCP server for accessing up-to-date documentation:
- Use `context7` for Paymob API documentation
- Use `context7` for Firebase Cloud Messaging setup
- Use `context7` for monitoring tools documentation
- Use `context7` for restaurant seed data

## Development Priorities

**Sprint 1 (Critical):**
1. Project foundation and monorepo setup
2. Authentication system implementation

**Sprint 2 (High):**
3. Restaurant discovery and menu display
4. Shopping cart and order management

**Sprint 3 (High):**
5. Paymob payment integration
6. Reviews and ratings system

**Post-MVP Features:**
- Order tracking with real-time updates
- Social features (follow system, activity feed)
- Performance optimization and caching