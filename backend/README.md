# illa-helper Backend API

Backend API service for the illa-helper SaaS platform.

## Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Zod validation

## Setup

### Prerequisites

- Node.js >= 18
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Run database migrations:
```bash
npm run db:migrate
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Vocabulary
- `GET /api/vocabulary` - List user's vocabulary
- `POST /api/vocabulary` - Add word to collection
- `DELETE /api/vocabulary/:id` - Remove word
- `PUT /api/vocabulary/:id/tags` - Update word tags
- `POST /api/vocabulary/sync` - Sync words from extension
- `GET /api/vocabulary/export` - Export vocabulary (CSV/JSON)

### Statistics
- `GET /api/stats/overview` - User overview stats
- `GET /api/stats/daily` - Daily activity stats
- `GET /api/stats/weekly` - Weekly activity stats
- `GET /api/stats/streak` - Streak information

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | Secret for access tokens | - |
| JWT_REFRESH_SECRET | Secret for refresh tokens | - |
| JWT_EXPIRES_IN | Access token expiry | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 7d |
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| CORS_ORIGIN | Allowed CORS origin | * |
