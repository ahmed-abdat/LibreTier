---
description: Explore codebase, create implementation plan, code, and test following EPCT workflow
allowed-tools: Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite, mcp__context7__*, mcp__sequential-thinking__*, mcp__shadcn__*, WebSearch, WebFetch
argument-hint: "[task-description]"
---

# Explore, Plan, Code, Test Workflow

At the end of this message, I will ask you to do something.
Please follow the "Explore, Plan, Code, Test" workflow when you start.

## Explore

First, use parallel subagents to find and read all files that may be useful for implementing the task, either as examples or as edit targets. The subagents should return relevant file paths, and any other info that may be useful.

**For Tier Maker project, check:**

- `src/app/` - Page patterns (landing, editor, gallery)
- `src/features/tier-list/` - Core feature components and store
- `src/components/` - Shared UI components
- `src/lib/` - Utility functions

**Key patterns to understand:**

- DND Kit integration in `TierListEditor.tsx`
- Zustand store patterns in `tier-store.ts`
- shadcn/ui component usage

## Plan

Next, use `mcp__sequential-thinking__sequentialthinking` to think hard and write up a detailed implementation plan.

**If you need docs**, use MCP tools:

- `mcp__context7__resolve-library-id` then `mcp__context7__get-library-docs` - Official docs (Next.js, DND Kit, Zustand, Framer Motion)
- `mcp__shadcn__*` - shadcn/ui component docs and examples

If there are things you still do not understand, pause here to ask the user before continuing.

## Code

When you have a thorough implementation plan, start writing code:

- Follow existing codebase patterns
- Use Zustand store for state management
- Use DND Kit patterns from existing implementation
- Use shadcn/ui components where applicable
- Support dark/light mode via next-themes

Run lint when done: `pnpm lint`

## Test

Test the implementation:

1. Run `pnpm dev` to start dev server
2. Use browser MCP tools to verify UI if needed
3. Test drag and drop functionality
4. Verify localStorage persistence
5. Test export functionality

If tests show problems, go back to planning and think ultrahard.

## Write up

When done, write a short report for PR description:

- What you set out to do
- Choices made with brief justification
- Commands that may be useful for future developers

## When to Use This Workflow

Use for:

- New features requiring exploration and planning
- Complex refactors affecting multiple components
- Changes to drag-and-drop behavior
- State management changes

Skip for:

- Simple bug fixes (just fix directly)
- Minor UI tweaks
- Documentation updates
