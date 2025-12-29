# illa-helper Admin Dashboard

Web-based admin dashboard for the illa-helper SaaS platform.

## Features

- User authentication with JWT
- Vocabulary management (view, search, filter, delete)
- Word detail view with pronunciation and examples
- Learning statistics with charts
- Export vocabulary to CSV/JSON

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Pinia (state management)
- Vue Router
- Tailwind CSS v4
- Chart.js + vue-chartjs
- Axios

## Getting Started

### Prerequisites

- Node.js >= 18
- Backend API running on port 3000

### Installation

```bash
cd admin
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at http://localhost:5173

### Build

```bash
npm run build
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_API_BASE_URL` - Backend API URL (default: `/api`)

## Project Structure

```
admin/
├── src/
│   ├── layouts/        # Layout components
│   ├── router/         # Vue Router configuration
│   ├── services/       # API services
│   ├── stores/         # Pinia stores
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript types
│   └── views/          # Page components
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
