# Tech Stack & Build System

## Core Technologies

### Extension Framework
- **WXT** (WebExtension Toolkit) - Modern browser extension framework
- Supports Chrome, Edge, Firefox, Safari (partial)

### Frontend
- **Vue 3** with Composition API
- **TypeScript** (strict mode)
- **Vite** for bundling
- **Tailwind CSS** for styling
- **Reka UI** + **Lucide Icons** for components
- **Vue I18n** for internationalization (5 languages)

### Backend (SaaS Platform)
- **Express.js** with TypeScript
- **Prisma** ORM with PostgreSQL
- **JWT** authentication
- **Zod** for validation

### Admin Dashboard
- **Vue 3** + **Vite** + **Pinia**
- **Vue Router** for navigation
- **Chart.js** for analytics

## API Integrations
- OpenAI-compatible APIs (ChatGPT, Claude, domestic LLMs)
- Google Gemini API
- Dictionary API (phonetics)
- Youdao TTS + Web Speech API

## Common Commands

### Extension Development
```bash
npm run dev              # Dev server (Chrome)
npm run dev:firefox      # Dev server (Firefox)
npm run build            # Production build (Chrome)
npm run build:firefox    # Production build (Firefox)
npm run zip              # Package extension (Chrome)
npm run zip:firefox      # Package extension (Firefox)
npm run zip:all          # Package for all browsers
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier formatting
npm run check            # Format + lint:fix
npm run compile          # TypeScript check (vue-tsc)
```

### Backend
```bash
cd backend
npm run dev              # Dev server with tsx watch
npm run build            # TypeScript compile
npm run db:migrate       # Prisma migrations
npm run db:studio        # Prisma Studio GUI
npm run db:seed          # Seed database
```

### Admin Dashboard
```bash
cd admin
npm run dev              # Vite dev server
npm run build            # Production build
```

## Environment Configuration
- Copy `.env.example` to `.env`
- Required: `VITE_WXT_DEFAULT_API_KEY`
- Optional: Custom API endpoint, model, temperature settings
