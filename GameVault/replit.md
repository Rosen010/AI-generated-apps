# GameVault - Gaming Web Shop

## Overview

GameVault is a full-stack e-commerce web application for purchasing digital games. Built with React on the frontend and Express on the backend, it provides a Steam/Epic Games Store-inspired shopping experience with features like product browsing, cart management, category filtering, and checkout functionality. The application uses a PostgreSQL database with Drizzle ORM for data persistence and includes a modern, gaming-focused UI built with shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS for styling with custom design tokens

**UI Component System:**
- shadcn/ui component library (Radix UI primitives) for accessible, customizable components
- Custom design system with gaming aesthetics inspired by Steam and Epic Games Store
- Theme system supporting light/dark modes with ThemeProvider context
- Responsive design with mobile-first approach

**State Management:**
- Local cart state managed through React Context (CartProvider) with localStorage persistence
- Server state cached and synchronized via TanStack Query
- Form state handled by react-hook-form with Zod validation

**Key Design Decisions:**
- Client-side routing keeps the app feeling snappy without full page reloads
- Cart persists to localStorage so users don't lose items on refresh
- Query client configured with infinite stale time to reduce unnecessary refetching
- Component-based architecture with clear separation of concerns (pages, components, lib, hooks)

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js for the REST API
- TypeScript with ES modules for modern JavaScript features
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database

**API Design:**
- RESTful endpoints following standard HTTP conventions
- JSON request/response format
- Centralized error handling
- Request logging middleware for debugging

**Data Access Layer:**
- Storage interface pattern (IStorage) for abstraction
- DatabaseStorage implementation using Drizzle ORM
- Schema definitions shared between client and server via `@shared` imports
- Database migrations managed through Drizzle Kit

**Key Design Decisions:**
- Monorepo structure with shared schema types ensures type safety across the stack
- Storage interface allows for easy testing and potential future database migrations
- Session-based cart management (no authentication required) using session IDs
- Database seeding on startup for development/demo purposes

### Data Models

**Products Table:**
- Gaming products with pricing, images, categories, ratings, and inventory status
- Support for sale pricing with original price tracking
- Platform specification (PC, Console, etc.)
- Featured flag for hero carousel display

**Cart Items Table:**
- Session-based cart (no user authentication required)
- Links to products with quantity tracking
- Ephemeral storage tied to browser sessions

**Orders & Order Items Tables:**
- Order records with customer information and delivery details
- Order items track which products were purchased
- Status tracking for order fulfillment

**Design Rationale:**
- Session-based approach simplifies the initial implementation (no auth system needed)
- Normalized schema with proper foreign key relationships
- Decimal types for monetary values to avoid floating-point precision issues

### Build & Deployment

**Build Process:**
- Client built with Vite, outputs to `dist/public`
- Server bundled with esbuild to `dist/index.cjs`
- Selected dependencies bundled to reduce cold start times
- Custom build script coordinates both builds

**Development Environment:**
- Vite dev server with HMR for fast frontend development
- Express server with tsx for TypeScript execution
- Vite middleware integration for seamless full-stack development
- Replit-specific plugins for enhanced development experience

## External Dependencies

**Database:**
- PostgreSQL database (connection via DATABASE_URL environment variable)
- Drizzle ORM for database access and migrations
- connect-pg-simple for PostgreSQL session store (configured but not currently used)

**UI Libraries:**
- Radix UI primitives (@radix-ui/*) for accessible component foundations
- shadcn/ui configuration for consistent component styling
- Tailwind CSS for utility-first styling
- Lucide React for icons
- react-icons for brand icons (payment methods)

**Forms & Validation:**
- react-hook-form for form state management
- Zod for schema validation
- @hookform/resolvers for Zod integration

**Development Tools:**
- Replit-specific Vite plugins for development experience
- TypeScript for type checking
- ESLint/Prettier configurations (implicit from replit setup)

**Notable Absence:**
- No authentication system (session-based cart only)
- No payment processing integration (checkout form collects info but doesn't process payments)
- No email service (orders stored but not confirmed via email)
- No image upload system (uses pre-seeded image paths)