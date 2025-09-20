# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development Tasks
- `npm run dev` - Start development server with Turbopack (faster than standard Next.js dev)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Development Workflow
- Use `npm run dev` for local development with hot reloading
- Run `npm run lint` before committing to ensure code quality
- Use `npm run build` to verify production build works before deployment

## Project Architecture

### Framework & Stack
- **Next.js 15** with App Router architecture
- **TypeScript** for type safety with strict configuration
- **Tailwind CSS 4** for styling with custom configuration
- **Framer Motion** for animations and transitions
- **Zustand** for state management (see `/src/store/mbti-store.ts`)
- **Radix UI** components for accessible UI primitives

### Directory Structure
```
src/
├── app/                 # Next.js App Router (layout, page, globals.css)
├── components/          # React components
│   ├── mbti-*.tsx      # Core MBTI-related components
│   └── ui/             # Reusable UI components (button.tsx)
├── data/               # Static data (mbti-data.ts with all 16 types)
├── lib/                # Utility functions
├── store/              # Zustand state management
├── styles/             # Additional styling files
├── types/              # TypeScript type definitions (mbti.ts)
└── utils/              # MBTI-specific utilities
```

### Key Components & Data Structure

#### MBTI Data (`/src/data/mbti-data.ts`)
- Contains comprehensive data for all 16 MBTI types with Chinese descriptions
- Includes cognitive functions, traits, strengths/weaknesses, and compatibility data
- Uses structured TypeScript interfaces for type safety

#### Component Architecture
- **MBTIGrid**: Main grid display of all 16 personality types
- **MBTICard**: Individual type cards with hover animations and cognitive functions
- **MBTICognitiveFunctions**: Detailed cognitive functions analysis
- **MBTITest**: Interactive personality assessment tool
- **MBTIMatches**: Compatibility analysis between types

#### State Management
- Uses Zustand for lightweight state management
- State stored in `/src/store/mbti-store.ts`
- Handles selected MBTI type and modal states

### Styling Guidelines
- Uses Tailwind CSS with custom color schemes for each MBTI group:
  - Purple: Analysts (NT)
  - Green: Diplomats (NF)
  - Blue: Sentinels (SJ)
  - Yellow: Explorers (SP)
- Dark mode support implemented throughout
- Responsive design for mobile and desktop
- Custom background images and gradients for visual appeal

### TypeScript Configuration
- Strict TypeScript enabled with Next.js plugin
- Path aliases configured: `@/*` maps to `./src/*`
- All components use TypeScript interfaces from `/src/types/mbti.ts`

### Animation & Interactions
- Framer Motion used for page transitions and card animations
- Hover effects and state transitions for enhanced UX
- Loading states with animated placeholders

## Development Notes

### Adding New MBTI Types or Features
- MBTI type data is centralized in `/src/data/mbti-data.ts`
- Type definitions are in `/src/types/mbti.ts`
- Follow existing patterns for consistency
- Ensure all new data includes proper TypeScript typing

### Cognitive Functions Implementation
- Structured into Judging (T/F) and Perceiving (N/S) categories
- Each function has detailed descriptions, training methods, and characteristics
- Uses consistent iconography and color coding

### Performance Considerations
- Uses Turbopack for faster development builds
- Next.js 15 features enabled for optimal performance
- Lazy loading and code splitting implemented where appropriate

### Code Style
- Follows Next.js and React best practices
- Uses ESLint configuration extending Next.js standards
- Component files use descriptive names (e.g., `mbti-card.tsx`)
- Consistent import organization and TypeScript usage