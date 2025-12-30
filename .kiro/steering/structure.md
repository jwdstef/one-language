# Project Structure

## Monorepo Layout

```
/                        # Browser extension (main project)
├── entrypoints/         # WXT entry points
├── src/                 # Extension source code
├── components/          # Shared UI components
├── assets/              # Static assets
├── public/              # Public files (icons)
/backend/                # Express.js API server
/admin/                  # Vue admin dashboard
```

## Extension Entry Points (`entrypoints/`)

| Entry | Purpose |
|-------|---------|
| `background.ts` | Service worker - API proxy, commands, notifications |
| `content.ts` | Content script - DOM manipulation, translation injection |
| `popup/` | Browser popup UI - quick settings, login |
| `options/` | Full settings page - all configuration options |

## Core Modules (`src/modules/`)

### API Layer (`api/`)
- `base/BaseProvider.ts` - Abstract provider base class
- `providers/` - OpenAI, Google Gemini implementations
- `factory/ApiServiceFactory.ts` - Provider factory
- `utils/` - API, text, request utilities

### Translation (`core/translation/`)
- `ParagraphTranslationService.ts` - Main translation orchestration
- `TextProcessorService.ts` - DOM text extraction and processing
- `TextReplacerService.ts` - Text replacement with position tracking
- `LanguageService.ts` - Language detection and management
- `PromptService.ts` - AI prompt generation

### Pronunciation (`pronunciation/`)
- `phonetic/` - Dictionary API phonetic providers
- `tts/` - Youdao TTS, Web Speech providers
- `services/` - PronunciationService, TTSService
- `ui/` - TooltipRenderer, EventManager

### Content Script (`content/`)
- `ContentManager.ts` - Main content script coordinator
- `services/` - Configuration, processing, lazy loading

### Infrastructure
- `core/storage/` - StorageService for settings persistence
- `core/messaging/` - Inter-component messaging
- `infrastructure/ratelimit/` - API rate limiting
- `styles/` - StyleManager, theme handling

### Features
- `wordPopup/` - Word popup tooltip system
- `floatingBall/` - Floating action button
- `contextMenu/` - Browser context menu
- `vocabulary/` - Vocabulary tracking service
- `auth/` - Authentication service

## Backend Structure (`backend/src/`)

```
src/
├── routes/          # Express route handlers
├── services/        # Business logic
├── middleware/      # Auth, error handling
├── config/          # Environment config
├── lib/             # Prisma client
└── types/           # TypeScript types
```

## Admin Structure (`admin/src/`)

```
src/
├── views/           # Page components
├── stores/          # Pinia stores
├── services/        # API client
├── router/          # Vue Router config
├── i18n/            # Translations
└── layouts/         # Layout components
```

## Key Patterns

- **Factory Pattern**: API providers, TTS providers, phonetic providers
- **Service Architecture**: Singleton services with clear responsibilities
- **Event-Driven**: Messaging system for cross-component communication
- **Modular Design**: Feature-based module organization
