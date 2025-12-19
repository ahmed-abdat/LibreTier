# Tier Maker - Open Source Readiness Plan

> **Status**: In Progress
> **Created**: 2024-12-18
> **Last Updated**: 2024-12-18

---

## Overview

This plan tracks the work needed to prepare Tier Maker for open-source release. The codebase has a solid foundation (8.5/10 code quality) but needs testing, documentation, and cleanup before public release.

---

## Progress Summary

| Phase                           | Status      | Progress |
| ------------------------------- | ----------- | -------- |
| Phase 1: Quick Wins             | ✅ Complete | 5/5      |
| Phase 2: Testing Infrastructure | ✅ Complete | 6/6      |
| Phase 3: Code Quality           | ✅ Complete | 6/6      |
| Phase 4: Refactoring            | ✅ Complete | 5/5      |
| Phase 5: CI/CD & Automation     | ✅ Complete | 4/4      |
| Future Features                 | Backlog     | 0/8      |

---

## Phase 1: Quick Wins (1-2 days)

> **Status**: ✅ Complete
> **Priority**: Critical
> **Completed**: 2024-12-18

These are low-effort, high-impact changes that should be done first.

### Tasks

- [x] **1.1 Fix package.json metadata** ✅
  - Changed name to "tier-maker"
  - Added proper description
  - Added repository URL
  - Added keywords for discoverability

- [x] **1.2 Remove unused dependencies** ✅
  - Removed all unused dependencies (already done in prior session)

- [x] **1.3 Create CONTRIBUTING.md** ✅
  - Comprehensive guide with setup, workflow, code style, and PR process

- [x] **1.4 Create CHANGELOG.md** ✅
  - Documented v1.0.0 features using Keep a Changelog format

- [x] **1.5 Create CODE_OF_CONDUCT.md** ✅
  - Added Contributor Covenant v2.1

---

## Phase 2: Testing Infrastructure (1 week)

> **Status**: ✅ Complete
> **Priority**: Critical
> **Completed**: 2024-12-19

### Testing Library Decision

After research, **Vitest + React Testing Library** is recommended:

| Factor             | Vitest        | Jest             |
| ------------------ | ------------- | ---------------- |
| Next.js 15 Support | Native        | Requires config  |
| Performance        | 30-70% faster | Baseline         |
| TypeScript         | Built-in      | Needs ts-jest    |
| React 19           | Optimized     | Works but slower |
| Memory             | 30% lower     | Higher           |

**E2E Testing**: Playwright (for drag-and-drop flows)

### Tasks

- [x] **2.1 Install Vitest + React Testing Library** ✅
- [x] **2.2 Configure Vitest** ✅
  - Created `vitest.config.ts`
  - Created `src/test/setup.ts`
  - Added test scripts to package.json
- [x] **2.3 Write Store Tests (Priority)** ✅
  - 28 unit tests covering store actions
- [x] **2.4 Write Component Tests** ✅
  - EmptyState component tests
- [x] **2.5 Install Playwright for E2E** ✅
  - Created `playwright.config.ts`
  - Added `test:e2e` and `test:e2e:ui` scripts
- [x] **2.6 Write E2E Tests** ✅
  - 27 E2E tests across 5 spec files:
    - `navigation.spec.ts` (4 tests)
    - `tier-list.spec.ts` (4 tests)
    - `editor.spec.ts` (8 tests)
    - `gallery.spec.ts` (7 tests)
    - `persistence.spec.ts` (4 tests)

---

## Phase 3: Code Quality (3-4 days)

> **Status**: ✅ Complete
> **Priority**: High
> **Completed**: 2024-12-18

### Tasks

- [x] **3.1 Add Prettier** ✅
  - Installed prettier + prettier-plugin-tailwindcss
  - Created `.prettierrc.json` with Tailwind plugin
  - Created `.prettierignore`
  - Added `format` and `format:check` scripts

- [x] **3.2 Add Husky + lint-staged** ✅
  - Installed husky and lint-staged
  - Configured pre-commit hook to run lint-staged
  - Runs ESLint fix + Prettier on staged TS/TSX files

- [x] **3.3 Create .editorconfig** ✅
  - 2-space indent, UTF-8, LF line endings
  - Trim trailing whitespace, insert final newline

- [x] **3.4 Fix Accessibility Issues** ✅
  - Added role="button", tabIndex, aria-label to ImageUpload dropzone
  - Added role="status", aria-live="polite" to loading spinners
  - Added aria-label to drag handles and settings buttons in TierRow
  - Added aria-busy and aria-label to ExportButton
  - Added role="radiogroup" and aria-checked to color picker

- [x] **3.5 Add Input Validation to Store** ✅
  - Validate `updateTier` name (non-empty, max 10 chars)
  - Validate `updateList` title (non-empty, max 100 chars)
  - Validate tier colors (valid hex #RRGGBB format)
  - Validate `addCustomTier` name and color

- [x] **3.6 Add File Size Validation** ✅
  - Added MAX_FILE_SIZE = 10MB constant
  - Filter oversized files before processing
  - Show user-friendly toast error for large files

---

## Phase 4: Refactoring (1 week)

> **Status**: ✅ Complete
> **Priority**: Medium
> **Completed**: 2024-12-18

### Tasks

- [x] **4.1 Extract DND Handlers to Custom Hook** ✅
  - Created `src/features/tier-list/hooks/useTierListDnd.ts`
  - Moved all DND handlers and helper functions
  - Reduced TierListEditor.tsx from 541 to 288 lines (47% reduction)

- [x] **4.2 Move Utility Functions to lib/** ✅
  - Moved `getContrastColor` from TierRow.tsx to `lib/utils.ts`
  - Function now exported for reuse

- [x] **4.3 Create Consistent Error Handling** ✅
  - Reviewed existing error handling patterns
  - Pattern already consistent: console.error + toast.error
  - No additional changes needed

- [x] **4.4 Fix Date Serialization in Store** ✅
  - Added custom storage config to Zustand persist
  - Properly revives Date objects from ISO strings in localStorage
  - All date fields (createdAt, updatedAt) now correctly hydrated

- [x] **4.5 Restrict Remote Image Patterns** ✅
  - Removed wildcard `hostname: "**"` pattern from next.config.mjs
  - Tier items use Base64 data URLs, no remote patterns needed
  - Only local images used with next/image (logo)

---

## Phase 5: CI/CD & Automation (2-3 days)

> **Status**: ✅ Complete
> **Priority**: High
> **Completed**: 2024-12-18

### Tasks

- [x] **5.1 Create GitHub Actions CI Workflow** ✅
  - `.github/workflows/ci.yml` with lint, typecheck, test, build jobs

- [x] **5.2 Create GitHub Issue Templates** ✅
  - Bug report template
  - Feature request template
  - Question template

- [x] **5.3 Create GitHub PR Template** ✅
  - Summary section
  - Type of change checkboxes
  - Testing checklist
  - Closes # issue reference

- [x] **5.4 Add Dependabot Configuration** ✅
  - Weekly updates for npm dependencies
  - Weekly updates for GitHub Actions
  - Grouped dependencies for easier review

---

## Future Features (Backlog)

> **Status**: Validated & Prioritized
> **Full Details**: See `.claude/features/README.md`
> **Last Updated**: 2024-12-18

### Priority Order (Based on Competitor Research)

| Sprint | Feature                | Effort   | Validated        |
| ------ | ---------------------- | -------- | ---------------- |
| 1      | F1: Undo/Redo          | 3-4 days | ✅ zundo v2.3.0  |
| 1      | F2: Keyboard Nav Docs  | 1 day    | ✅ Sensor exists |
| 2      | F4: JSON Import/Export | 2-3 days | ✅ Feasible      |
| 3      | F3: Templates          | 3-5 days | ✅ Feasible      |
| -      | F5-F8                  | Backlog  | Deprioritized    |

### Sprint 1: Core UX

- [ ] **F1: Undo/Redo System** ⭐ HIGH PRIORITY
  - Library: `zundo` (Zustand undo middleware, <700 bytes)
  - Keyboard: Ctrl+Z / Ctrl+Shift+Z
  - Files: `tier-store.ts`
  - [Detailed Spec](./../features/undo-redo.md)

- [ ] **F2: Keyboard Navigation Documentation**
  - KeyboardSensor already configured!
  - Just needs help text update
  - Files: `TierListEditor.tsx` help section

### Sprint 2: Data Portability

- [ ] **F4: JSON Import/Export** ⭐ HIGH PRIORITY
  - Export: Download tier list as `.json`
  - Import: File upload with validation
  - **Prerequisite**: Fix Phase 4.4 (Date serialization)
  - Differentiator: No competitor offers this!

### Sprint 3: Quick Start

- [ ] **F3: Template System**
  - 5 starter templates: Games, Anime, Movies, Music, Food
  - Template picker on create new list
  - TierMaker has 1M+ templates - start small

### Backlog (Deprioritized)

- [ ] **F5: Image Crop/Resize** - Users can crop externally
- [ ] **F6: Color Presets** - Already have 9 presets
- [ ] **F7: Multiple Export Formats** - PNG covers 90%
- [ ] **F8: Storybook** - Developer-only, no user impact

### Future Ideas (Not Validated)

- URL Sharing (deferred - focus on JSON first)
- Real-time Collaboration (not planned - local-only architecture)
- Mobile PWA
- Tier List Gallery
- Text-only Items
- Duplicate Items

---

## Technical Debt Tracker

Issues to address during refactoring:

| Issue                             | File                   | Severity   | Status             |
| --------------------------------- | ---------------------- | ---------- | ------------------ |
| Template literal in className     | ExportButton.tsx       | Low        | Open               |
| ~~Long component (503 lines)~~    | ~~TierListEditor.tsx~~ | ~~Medium~~ | ✅ Fixed (Phase 4) |
| ~~No file size validation~~       | ~~ImageUpload.tsx~~    | ~~Medium~~ | ✅ Fixed (Phase 3) |
| ~~No input validation~~           | ~~tier-store.ts~~      | ~~Medium~~ | ✅ Fixed (Phase 3) |
| ~~getContrastColor not exported~~ | ~~TierRow.tsx~~        | ~~Low~~    | ✅ Fixed (Phase 4) |
| ~~Wildcard remote patterns~~      | ~~next.config.mjs~~    | ~~Medium~~ | ✅ Fixed (Phase 4) |
| ~~Missing ARIA labels~~           | ~~Multiple~~           | ~~Medium~~ | ✅ Fixed (Phase 3) |
| ~~Date serialization~~            | ~~tier-store.ts~~      | ~~Medium~~ | ✅ Fixed (Phase 4) |

---

## Notes

### Testing Strategy

For the tier store (~560 lines):

```
Unit Tests (75-80%):
- Store actions: createList, addItem, moveItem, etc.
- Pure functions: validation, formatting
- Custom hooks

Component Tests (15-20%):
- TierRow rendering
- TierItem interactions
- ImageUpload functionality
- EmptyState conditions

E2E Tests (5-10%):
- Complete tier list creation flow
- Drag-and-drop between tiers (Playwright)
- Export to PNG
- LocalStorage persistence
```

### DND Kit Testing Note

DND Kit doesn't use HTML5 Drag-and-Drop API, making traditional RTL drag events ineffective. Strategy:

1. **Unit tests**: Test store actions directly (bypass DND Kit)
2. **E2E tests**: Use Playwright for actual drag-and-drop interactions
3. **Keyboard tests**: Test DND Kit's keyboard sensor

---

## Completion Criteria

A phase is considered complete when:

1. All tasks in the phase are checked off
2. Code has been committed with descriptive messages
3. No regressions introduced (tests pass)
4. Documentation updated if needed

---

## Session Log

Track progress across sessions:

| Date       | Session | Work Done                                                                                 |
| ---------- | ------- | ----------------------------------------------------------------------------------------- |
| 2024-12-18 | 1       | Created plan, researched testing libraries                                                |
| 2024-12-18 | 2       | Completed Phase 1: Verified package.json, created CODE_OF_CONDUCT.md                      |
| 2024-12-18 | 3       | Completed Phase 3: Prettier, Husky, accessibility, validation                             |
| 2024-12-18 | 4       | Phase 2: Vitest setup, 28 tests. Phase 5: CI/CD complete. Fixed radix imports             |
| 2024-12-18 | 5       | Phase 4: DND hook extraction (541→288 lines), getContrastColor to utils                   |
| 2024-12-18 | 6       | Phase 4 complete: Date serialization fix, removed wildcard image patterns                 |
| 2024-12-18 | 7       | Feature research: Competitor analysis, validated F1-F4, created .claude/features/         |
| 2024-12-19 | 8       | Phase 2 complete: Playwright E2E tests (27 tests), CI workflow updated, CLAUDE.md updated |
