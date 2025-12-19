# Contributing to Tier Maker

Thank you for your interest in contributing to Tier Maker! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tier-maker.git
   cd tier-maker
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ahmed-abdat/tier-maker.git
   ```
4. Create a new branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command      | Description                             |
| ------------ | --------------------------------------- |
| `pnpm dev`   | Start development server with Turbopack |
| `pnpm build` | Build for production                    |
| `pnpm start` | Start production server                 |
| `pnpm lint`  | Run ESLint                              |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── editor/[id]/        # Tier list editor
│   └── tiers/              # Gallery page
├── features/               # Feature-based modules
│   └── tier-list/          # Tier list feature
│       ├── components/     # Feature components
│       ├── store/          # Zustand store
│       └── constants.ts    # Constants and types
├── components/             # Shared components
│   ├── ui/                 # shadcn/ui components
│   ├── landing/            # Landing page components
│   ├── layout/             # Layout components
│   └── providers/          # Context providers
└── lib/
    └── utils.ts            # Utility functions
```

### Key Architectural Decisions

- **State Management**: Zustand with persist middleware for localStorage
- **Drag and Drop**: DND Kit for accessible drag-and-drop
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Next.js App Router

## Making Changes

### Before You Start

1. Check if there's an existing issue for your change
2. If not, create one to discuss the change first
3. Wait for maintainer approval on significant changes

### Development Workflow

1. Keep your branch updated:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Make your changes in small, logical commits

3. Run linting before committing:

   ```bash
   pnpm lint
   ```

4. Test your changes manually:
   - Test drag-and-drop functionality
   - Verify localStorage persistence
   - Check both light and dark themes
   - Test on mobile viewport

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                                       |
| ---------- | ------------------------------------------------- |
| `feat`     | A new feature                                     |
| `fix`      | A bug fix                                         |
| `docs`     | Documentation changes                             |
| `style`    | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring without feature changes          |
| `perf`     | Performance improvements                          |
| `test`     | Adding or updating tests                          |
| `chore`    | Maintenance tasks                                 |

### Examples

```bash
feat(editor): add undo/redo functionality
fix(dnd): resolve item duplication on rapid drag
docs(readme): update installation instructions
refactor(store): extract moveItem logic to helper
```

### Scope

Common scopes for this project:

- `editor` - Tier list editor
- `gallery` - Gallery page
- `store` - Zustand store
- `dnd` - Drag and drop
- `export` - Image export
- `ui` - UI components

## Pull Request Process

1. **Update your branch** with the latest upstream changes

2. **Create a Pull Request** with:
   - Clear title following commit conventions
   - Description of changes
   - Screenshots for UI changes
   - Link to related issue(s)

3. **PR Template**:

   ```markdown
   ## Summary

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   - [ ] Tested drag-and-drop functionality
   - [ ] Tested localStorage persistence
   - [ ] Tested light/dark themes
   - [ ] Tested mobile responsiveness

   ## Screenshots

   (If applicable)

   Closes #(issue number)
   ```

4. **Review Process**:
   - At least one maintainer approval required
   - All CI checks must pass
   - Address review feedback promptly

## Code Style

### TypeScript

- Use strict TypeScript (no `any` unless absolutely necessary)
- Define interfaces for props and state
- Export types from feature `index.ts`

```typescript
// Good
interface TierItemProps {
  item: TierItem;
  onDelete: (id: string) => void;
}

// Avoid
const Component = (props: any) => { ... }
```

### React Components

- Use functional components with hooks
- Prefer named exports
- Keep components focused and small

```typescript
// Good
export function TierItem({ item, onDelete }: TierItemProps) {
  return (...)
}

// Avoid large components - split them up
```

### Styling

- Use Tailwind CSS classes
- Use `cn()` helper for conditional classes
- Follow mobile-first responsive design

```typescript
// Good
className={cn(
  "flex items-center gap-2",
  isActive && "bg-primary"
)}

// Avoid inline styles
style={{ display: 'flex' }}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `TierRow.tsx`)
- Utilities: `kebab-case.ts` (e.g., `tier-store.ts`)
- Types: Define in component file or `types.ts`

## Testing

### Manual Testing Checklist

Before submitting a PR, manually test:

- [ ] Create a new tier list
- [ ] Add images via drag-and-drop upload
- [ ] Drag items between tiers
- [ ] Drag items to/from unassigned pool
- [ ] Edit tier names and colors
- [ ] Export tier list as PNG
- [ ] Refresh page and verify persistence
- [ ] Test on mobile viewport
- [ ] Test in both light and dark themes

### Automated Testing (Coming Soon)

We're setting up Vitest + React Testing Library. See the [testing plan](/.claude/plans/open-source-readiness.md) for details.

## Reporting Bugs

When reporting bugs, please include:

1. **Environment**:
   - Browser and version
   - Operating system
   - Device type (desktop/mobile)

2. **Steps to Reproduce**:
   - Clear, numbered steps
   - Starting state
   - Expected behavior
   - Actual behavior

3. **Screenshots/Videos** (if applicable)

4. **Console Errors** (if any)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**

1. Go to '...'
2. Click on '...'
3. Drag '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Device: [e.g., Desktop]

**Additional context**
Any other context about the problem.
```

## Suggesting Features

We welcome feature suggestions! When suggesting a feature:

1. **Check existing issues** for similar suggestions
2. **Describe the problem** the feature would solve
3. **Propose a solution** with details
4. **Consider alternatives** you've thought of

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem. Ex. I'm frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

## Questions?

If you have questions:

- Check existing issues and discussions
- Open a new discussion for general questions
- Open an issue for specific bugs or features

Thank you for contributing to Tier Maker!
