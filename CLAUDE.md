# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Viba Studio

Viba Studio is a full-stack AI image processing application with four main features: Image Derivation, Avatar Generation, Virtual Try-On, and Person Swap. The app uses Google Gemini AI models for image generation.

## Development Commands

### Frontend (root directory)
```bash
npm run dev         # Start Vite dev server (port 3000)
npm run build       # Build for production
npm run preview     # Preview production build
```

### Backend (backend/ directory)
```bash
npm run dev         # Start development server with ts-node (port 3001)
npm run build       # Compile TypeScript to dist/
npm run start       # Run production build from dist/
npm run db:migrate  # Run database migrations
```

### Docker
```bash
docker-compose up -d  # Start all services (frontend, backend, postgres)
```

## Architecture

### Frontend Structure
- **`contexts/`** - React Context providers for global state:
  - `AuthContext` - JWT authentication with token refresh
  - `ApiKeyContext` - User-provided Gemini API key management
  - `LanguageContext` - Internationalization
  - `GenerationContext` - Shared generation state

- **`views/`** - Feature-specific view components:
  - `DerivationView` - Batch image generation from input
  - `AvatarView` - Character avatar creation from reference photos
  - `TryOnView` - Virtual clothing try-on
  - `SwapView` - Person composition into scenes

- **`pages/`** - Route components:
  - `LoginPage`, `RegisterPage` - Authentication pages
  - `SettingsPage` - User settings and API key management

- **`services/`** - Frontend service layer:
  - `geminiService.ts` - Google Gemini AI integration with timeout/retry logic
  - `historyService.ts` - Generation history CRUD operations

### Backend Structure
- **`backend/src/index.ts`** - Express server entry point
- **`backend/src/routes/`** - RESTful API routes (`/api/v1/...`)
  - `auth.ts` - Authentication endpoints
  - `users.ts` - User management
  - `generations.ts` - Generation history CRUD
- **`backend/src/models/`** - Sequelize ORM models (PostgreSQL)
- **`backend/src/services/`** - Business logic (JWT, auth)
- **`backend/src/middleware/`** - Auth and error handling

### Data Flow
1. Frontend calls AI functions from `services/geminiService.ts`
2. AI operations use `withTimeoutAndRetry` wrapper for resilience
3. Status callbacks provide UI feedback during long-running operations
4. Completed generations are saved to backend via REST API
5. History is retrieved from backend for display

## AI Service Patterns

The `geminiService.ts` implements the core AI integration:

- **API Key Source**: Checks localStorage first (user-provided), falls back to `process.env.API_KEY`
- **Timeout/Retry**: `withTimeoutAndRetry` wrapper with configurable timeouts and retry counts
- **Sequential Processing**: Multiple generations run sequentially to avoid rate limiting
- **Status Callbacks**: Pass `onStatusUpdate` to provide UI feedback
- **Models**: `gemini-3-pro-image-preview` for images, `gemini-3-pro-preview` for text

### Example Usage
```typescript
import { generateDerivations } from './services/geminiService';

const { images, description } = await generateDerivations(
  baseImage,
  intensity,
  (status) => console.log(status) // 'processing_step1' | 'processing_step2' | 'retrying'
);
```

## Authentication

- JWT-based authentication with access and refresh tokens
- Tokens stored in localStorage
- `ProtectedRoute` HOC wraps authenticated pages
- Axios interceptors handle automatic token refresh

## Environment Variables

### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)
```
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=http://localhost:3000
```

## Database

- PostgreSQL with Sequelize ORM
- Models: User, Generation
- Run migrations with `npm run db:migrate` from backend directory
- Supabase recommended for free hosting

## Deployment Options

1. **Render + Vercel** - Free tier (see `DEPLOYMENT.md`)
2. **Docker** - Self-hosted with `docker-compose`
3. **Alibaba Cloud** - See `DEPLOYMENT.md`
