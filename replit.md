# Caregiver-Client Scheduling Application

## Overview

This is a React-based web application for managing caregiver-client scheduling. The application allows users to input caregiver and client availability, automatically generates optimal schedule matches, and provides visual calendar views of the scheduling options. The system is built with a full-stack architecture using React on the frontend and Express.js on the backend, with PostgreSQL database integration via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: TailwindCSS with custom CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: React Router for client-side navigation
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database interactions
- **Database**: PostgreSQL (configured via Neon Database serverless)
- **Build Tool**: esbuild for production bundling

### Project Structure
```
/client          - Frontend React application
/server          - Backend Express.js API
/shared          - Shared TypeScript types and schemas
/migrations      - Database migration files
```

## Key Components

### Frontend Components
1. **CaregiverForm**: Form for adding caregiver information including weekly availability schedules
2. **ClientForm**: Form for adding client information and care requirements
3. **CalendarView**: Visual calendar interface showing schedule matches
4. **ScheduleOptions**: Display of generated scheduling options with efficiency scores
5. **SpreadsheetUpload**: CSV import functionality for bulk data entry

### Backend Components
1. **Storage Interface**: Abstracted data layer with in-memory and database implementations
2. **Route Handler**: Express.js routes for API endpoints (currently minimal)
3. **Schema Definitions**: Drizzle ORM schema for users table (extensible for caregivers/clients)

### Shared Components
1. **Type Definitions**: TypeScript interfaces for scheduling entities (Caregiver, Client, Match, etc.)
2. **Validation Schemas**: Zod schemas for data validation
3. **Schedule Matcher**: Algorithm for finding optimal caregiver-client matches

## Data Flow

### Data Input Flow
1. Users can add caregivers and clients through forms or CSV upload
2. Each entity includes contact information and weekly availability schedules
3. Exclusions can be specified (caregivers who can't work with specific clients)
4. Data is stored in browser state (currently in-memory storage)

### Scheduling Algorithm Flow
1. System processes all caregiver and client availability slots
2. Finds overlapping time slots between caregivers and clients
3. Calculates compatibility scores based on:
   - Geographic distance (placeholder implementation)
   - Schedule overlap duration
   - Exclusion rules
4. Generates multiple scheduling options ranked by efficiency
5. Each option includes total matches, efficiency percentage, and detailed breakdowns

### Display Flow
1. Generated schedule options are displayed in cards with summary metrics
2. Calendar view shows visual representation of matches by day and time
3. Users can switch between different scheduling options
4. Each match shows caregiver-client pairing with time slots and compatibility scores

## External Dependencies

### Frontend Dependencies
- **@radix-ui/***: Comprehensive UI component library for accessible interfaces
- **@tanstack/react-query**: Server state management and caching
- **react-router-dom**: Client-side routing
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Backend Dependencies
- **express**: Web application framework
- **drizzle-orm**: Type-safe SQL query builder
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-zod**: Integration between Drizzle and Zod for validation

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **typescript**: Type safety and development tooling
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- Frontend served by Vite dev server with HMR (Hot Module Replacement)
- Backend runs with tsx for TypeScript execution
- Integrated development setup with proxy configuration
- Replit-specific plugins for development environment integration

### Production Build Process
1. Frontend built with Vite to static assets in `dist/public`
2. Backend bundled with esbuild to `dist/index.js`
3. Single Node.js process serves both API and static files
4. Database migrations applied via `drizzle-kit push`

### Database Strategy
- PostgreSQL database with Drizzle ORM migrations
- Environment-based configuration via `DATABASE_URL`
- Schema versioning through migration files
- Current schema supports basic user management (extensible for scheduling entities)

### Current Limitations
- Frontend currently uses in-memory storage for demo purposes
- Database integration exists but scheduling entities not yet fully integrated
- Geographic distance calculation is placeholder (would integrate with mapping services)
- Authentication and user management not implemented
- No real-time updates or collaboration features

The application is designed to be easily extensible, with clear separation between data storage, business logic, and presentation layers. The scheduling algorithm can be enhanced with more sophisticated matching criteria, and the database schema can be extended to support the full scheduling domain model.