# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Open-source documentation (CONTRIBUTING.md, CODE_OF_CONDUCT.md, CHANGELOG.md)
- Improved package.json metadata

### Changed

- Removed unused dependencies for smaller bundle size

### Fixed

- N/A

## [1.0.0] - 2024-12-18

### Added

#### Core Features

- **Tier List Editor**: Full-featured editor with drag-and-drop functionality
  - Create and manage tier lists with S, A, B, C, D, F tiers
  - Customize tier names (click to edit)
  - Customize tier colors with color picker
  - Move tiers up/down to reorder
  - Delete individual tiers

- **Drag and Drop**: Powered by DND Kit
  - Drag items between tiers
  - Drag items to/from unassigned pool
  - Reorder items within tiers
  - Touch support for mobile devices
  - Keyboard accessible

- **Image Upload**: Multiple upload methods
  - Drag and drop images onto upload zone
  - Click to browse files
  - Paste images from clipboard
  - Automatic image compression for storage efficiency
  - Support for PNG, JPG, JPEG, GIF, WebP formats

- **Export**: Save tier lists as images
  - Export to PNG format
  - Includes tier list title
  - High-quality rendering with html2canvas
  - Download with formatted filename

- **Gallery**: View and manage saved tier lists
  - Browse all saved tier lists
  - See tier summary with item counts
  - Duplicate existing tier lists
  - Delete tier lists
  - Create new tier lists

- **Persistence**: Local storage support
  - Automatic save on every change
  - Persist across browser sessions
  - No account required

#### UI/UX

- **Theming**: Dark and light mode support
  - System preference detection
  - Manual toggle in header
  - Smooth transitions

- **Responsive Design**: Works on all devices
  - Mobile-optimized touch interactions
  - Tablet-friendly layout
  - Desktop full-featured experience

- **Landing Page**: Animated hero section
  - Feature highlights
  - Quick start buttons
  - Framer Motion animations

- **Empty States**: Helpful guidance when no content
  - Clear instructions for getting started
  - Visual cues for drag-and-drop zones

### Technical

- Next.js 15 with App Router and Turbopack
- React 19 with latest features
- TypeScript in strict mode
- Zustand for state management with persist middleware
- Tailwind CSS with shadcn/ui components
- DND Kit for accessible drag-and-drop
- Framer Motion for animations

### Dependencies

- @dnd-kit/core, @dnd-kit/sortable for drag-and-drop
- html2canvas for image export
- react-dropzone for file uploads
- next-themes for theme management
- sonner for toast notifications

---

## Version History

| Version | Date       | Description            |
| ------- | ---------- | ---------------------- |
| 1.0.0   | 2024-12-18 | Initial public release |

[Unreleased]: https://github.com/ahmed-abdat/tier-maker/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ahmed-abdat/tier-maker/releases/tag/v1.0.0
