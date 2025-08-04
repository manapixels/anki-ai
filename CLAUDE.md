# Anki AI - Developer Guide

An AI-powered Anki flashcard app that enhances memory through intelligent content generation. Users can import their existing Anki decks or create new ones, with AI providing contextual variations, difficulty adjustments, and personalized study recommendations based on performance analytics.

## 🏗️ Architecture Overview

### Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI API for content generation and recommendations
- **Styling**: Tailwind CSS with custom design system
- **State**: React Context API (`UserContext`, `AuthContext`, `StudyContext`)
- **Forms**: React Hook Form with file upload support
- **UI**: Custom components with Radix UI primitives
- **Icons**: Lucide React (use consistently)

### Project Structure

```
src/
├── api/                    # Server Actions (use 'use server')
│   ├── auth.ts            # Authentication functions
│   ├── cards.ts           # Core flashcard CRUD operations
│   ├── decks.ts           # Deck management and organization
│   ├── study-sessions.ts  # Study session tracking and analytics
│   ├── ai-generation.ts   # AI content generation and recommendations
│   ├── import.ts          # Anki deck import/export functionality
│   ├── profile.ts         # User profile and preferences
│   └── analytics.ts       # Learning analytics and progress tracking
├── app/
│   ├── _components/       # Shared UI components
│   │   ├── ui/           # Base UI components (Button, Modal, etc.)
│   │   ├── auth/         # Authentication components
│   │   ├── study/        # Study session components (flashcard viewer, etc.)
│   │   └── analytics/    # Progress visualization components
│   ├── _contexts/        # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── UserContext.tsx
│   │   └── StudyContext.tsx # Study session state management
│   ├── cards/            # Flashcard management pages
│   │   ├── create/       # Card creation wizard
│   │   ├── edit/[id]/    # Card editing interface
│   │   └── _components/  # Card-specific components
│   ├── decks/            # Deck management pages
│   │   ├── create/       # Deck creation
│   │   ├── [id]/         # Individual deck view
│   │   ├── import/       # Anki import interface
│   │   └── _components/  # Deck-specific components
│   ├── study/            # Study session interface
│   │   ├── [deckId]/     # Study specific deck
│   │   ├── review/       # Spaced repetition review
│   │   └── _components/  # Study interface components
│   ├── analytics/        # Progress and analytics dashboard
│   │   ├── progress/     # Detailed progress tracking
│   │   └── _components/  # Analytics visualization components
│   ├── profiles/         # User profile pages
│   └── auth/            # Authentication pages
├── types/                # TypeScript definitions
│   ├── definitions.ts    # Supabase-generated types
│   ├── card.ts          # Flashcard data structures
│   ├── deck.ts          # Deck and collection types
│   ├── study-session.ts # Study session and analytics types
│   ├── ai-response.ts   # AI API response types
│   └── profile.ts       # User profile types
├── utils/               # Utility functions
│   ├── supabase/       # Supabase client configurations
│   ├── ai/             # AI integration utilities
│   │   ├── openai.ts   # OpenAI client setup
│   │   ├── prompts.ts  # AI prompt templates
│   │   └── content-generation.ts # Content generation helpers
│   ├── anki/           # Anki format parsers and converters
│   │   ├── parser.ts   # .apkg file parser
│   │   └── converter.ts # Format conversion utilities
│   ├── study/          # Study algorithm utilities
│   │   ├── spaced-repetition.ts # SR algorithm implementation
│   │   └── difficulty.ts # Difficulty adjustment algorithms
│   ├── seo.ts          # SEO and Schema.org helpers
│   └── formatters.ts   # Data formatting utilities
└── constants.tsx        # App-wide constants (difficulty levels, categories, etc.)
```

## 🔧 Development Guidelines

### Code Style & Conventions

- **Line Length**: 100 characters max
- **Quotes**: Single quotes, trailing commas
- **Components**: Functional components with hooks
- **API**: Server actions with `'use server'` directive
- **Imports**: Use path aliases (`@/api/*`, `@/types/*`)
- **Styling**: Use `cn()` utility for conditional classes
- **Error Handling**: Return Error objects, not throw exceptions

### Key Development Commands

```bash
npm run dev                    # Start development server
npm run build                 # Production build
npm run check                 # Lint, format, and type check
npm run supabase:start        # Start local Supabase
npm run supabase:generate-types # Generate TypeScript types
npm run test                  # Run test suite
npm run test:study            # Test study algorithms
npm run test:ai               # Test AI integration
```

### Pre-commit Hooks

- **ESLint**: Next.js config with custom rules
- **Prettier**: 100-char limit, single quotes, trailing commas
- **TypeScript**: Strict mode compilation check
- **Husky + lint-staged**: Automatic formatting on commit

## 🎨 UI Components & Patterns

### Component Variants

```typescript
// Button variants
'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'

// Toast variants
'default' | 'destructive' | 'success'

// Study session states
'new' | 'learning' | 'review' | 'relearning' | 'mastered'

// Card types
'basic' | 'cloze' | 'image_occlusion' | 'audio' | 'reverse'
```

### Responsive Design

- **Mobile-first**: Default styles for mobile (study sessions optimized for phone)
- **Breakpoints**: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- **Grid Layout**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Study Interface**: Full-screen on mobile, windowed on desktop

### Loading States

- **Skeletons**: `CardSkeleton`, `DeckListSkeleton`, `StudySessionSkeleton`
- **Spinners**: Use `<Spinner />` component consistently
- **Optimistic Updates**: For card flips, study progress, AI generation

## 🔐 Authentication & Authorization

### User Management

- **Supabase Auth**: Email/password with magic links
- **Session Handling**: Server-side via middleware
- **Protected Routes**: Use `ProtectedWrapper` component
- **Profile System**: Auto-created profiles with study preferences

### Row Level Security (RLS)

- **Cards**: Users can only edit their own flashcards
- **Decks**: Private decks only accessible to owner
- **Study Sessions**: Personal study data protection
- **Public Decks**: Community-shared decks with read access
- **Profiles**: Users can only edit their own profile

## 🗄️ Database Schema

### Key Tables

- **`profiles`**: User data (username, avatar, study preferences, timezone)
- **`decks`**: Flashcard collections (name, description, category, difficulty)
- **`cards`**: Individual flashcards (front/back text, media, card type)
- **`study_sessions`**: Study tracking (deck_id, cards_studied, performance)
- **`card_reviews`**: Spaced repetition data (next_review, interval, ease_factor)
- **`ai_generations`**: AI-generated content audit trail
- **`deck_sharing`**: Public deck sharing and permissions

### Important Database Functions

- **`generate_card_id()`**: Auto-generates unique card identifiers
- **`calculate_next_review()`**: Spaced repetition algorithm
- **`update_study_stats()`**: Real-time performance analytics
- **`generate_ai_variations()`**: Trigger AI content generation
- **Triggers**: Auto-update timestamps, study streak calculations

## 🤖 AI Integration

### OpenAI Integration

- **Content Generation**: Create contextual variations of existing cards
- **Difficulty Adjustment**: Analyze and adjust card complexity
- **Smart Recommendations**: Suggest study schedules and focus areas
- **Error Correction**: Identify and fix common mistakes

### AI Features

- **Contextual Variations**: Generate multiple examples for same concept
- **Pronunciation Guides**: Audio generation for language learning
- **Visual Associations**: Generate mnemonics and memory aids
- **Progress Insights**: Analyze study patterns and suggest improvements

## 📊 Study Algorithm

### Spaced Repetition System (SRS)

- **Algorithm**: Modified SM-2 algorithm with AI enhancements
- **Intervals**: Dynamic intervals based on performance and AI analysis
- **Difficulty Factors**: Multi-dimensional difficulty assessment
- **Retention Optimization**: AI-powered retention rate optimization

### Study Session Management

- **Session Types**: New cards, reviews, relearning, custom sessions
- **Smart Scheduling**: AI-optimized study schedules
- **Progress Tracking**: Real-time analytics and progress visualization
- **Adaptive Learning**: Difficulty adjustment based on user performance

## 📁 File Import/Export

### Anki Compatibility

- **Import**: `.apkg` file parsing and conversion
- **Export**: Generate Anki-compatible exports
- **Data Migration**: Preserve study history and statistics
- **Format Support**: Text, images, audio, HTML formatting

### Supported Formats

- **Anki Package**: `.apkg` (primary format)
- **CSV**: Simple text-based import/export
- **JSON**: API-friendly data exchange
- **Text**: Plain text flashcard lists
