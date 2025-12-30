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

### 环境文件说明

| 文件 | 用途 | Git 状态 |
|------|------|----------|
| `.env` | 本地配置（包含真实 API Key） | 忽略 |
| `.env.example` | 配置模板 | 提交 |
| `.env.development` | 开发环境默认值 | 提交 |
| `.env.production` | 生产环境默认值 | 提交 |

### 扩展环境变量

```env
# AI API 配置 (翻译服务)
VITE_WXT_DEFAULT_API_ENDPOINT="https://api.siliconflow.cn/v1/chat/completions"
VITE_WXT_DEFAULT_API_KEY="your-api-key-here"
VITE_WXT_DEFAULT_MODEL="Qwen/Qwen3-Next-80B-A3B-Instruct"
VITE_WXT_DEFAULT_TEMPERATURE="0.2"

# 后端 API 地址
VITE_BACKEND_API_ENDPOINT="http://localhost:3011"  # 开发
VITE_BACKEND_API_ENDPOINT="https://admin.1zhizu.com"  # 生产
```

### 本地开发

1. 复制 `.env.example` 到 `.env`
2. 填入真实的 API Key
3. 运行 `npm run dev`（自动加载 `.env.development`）

### 生产构建

运行 `npm run build` 会自动加载 `.env.production`
