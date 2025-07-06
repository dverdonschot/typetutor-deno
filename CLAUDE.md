# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeTutor is a web-based touch typing trainer built with Deno, Fresh framework, Preact, and Tailwind CSS. It provides different typing modes including random characters, quotes, trigraphs, and code snippets.

## Development Commands

### Core Commands
- `deno task start` - Start development server with hot reload
- `deno task build` - Build the project for production
- `deno task preview` - Preview the built project
- `deno task check` - Full type checking, linting, and formatting check
- `deno task ci-checks` - CI-specific checks (excludes certain files from formatting)

### Development Tasks
- `deno fmt` - Format code
- `deno lint` - Lint code
- `deno check **/*.ts && deno check **/*.tsx` - Type check all files

## Architecture

### Framework Stack
- **Deno** - JavaScript/TypeScript runtime
- **Fresh** - Web framework with file-based routing and islands architecture
- **Preact** - React-like UI library
- **Tailwind CSS** - Utility-first CSS framework

### Key Directories
- `routes/` - Fresh file-based routing (pages and API endpoints)
- `islands/` - Client-side interactive components (Fresh islands)
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks for state management
- `functions/` - Utility functions for content fetching and processing
- `static/content/` - Static content files (quotes, trigraphs, code samples)
- `memory-bank/` - Project documentation and planning files

### State Management Patterns
- Hook-based state management with custom hooks like `useQuoteInput`, `useTypingMetrics`
- Signal-based state for reactive updates
- Component-based architecture with shared state through props

### Content System
- Static content served from `static/content/` directory
- Content fetching through `fetchContentFromUrl` function
- Predefined and random training sets for different typing modes

### Key Components
- `Layout.tsx` - Main layout wrapper with navigation
- `QuoteTextDisplay.tsx` - Displays typing content with highlighting
- `TypingMetricsDisplay.tsx` - Shows WPM, accuracy, and other metrics
- Islands for interactive features like `QuoteTyperMode.tsx`, `TrigraphsTyperMode.tsx`

## Fresh Framework Specifics

This project uses Fresh's islands architecture where:
- Routes are server-rendered by default
- Islands (in `islands/` directory) are client-side interactive components
- API routes are in `routes/api/` directory
- Static assets are served from `static/` directory

## Content Structure

Training content is organized in `static/content/`:
- `quotes/` - Text files with typing quotes
- `trigraphs/` - Three-letter combination practice files
- `code/` - Code snippets in various programming languages