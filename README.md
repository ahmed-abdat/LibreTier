# LibreTier

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8)](https://web.dev/progressive-web-apps/)

A free, open-source tier list maker. Create beautiful rankings with drag-and-drop, export as images, and share with friends. No account required - everything runs in your browser.

[Live Demo](https://libretier.vercel.app) · [Report Bug](https://github.com/ahmed-abdat/LibreTier/issues) · [Request Feature](https://github.com/ahmed-abdat/LibreTier/issues)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ahmed-abdat/LibreTier)

<!-- Add your demo GIF here -->
<!-- ![Demo](./assets/demo.gif) -->

## Why This Project?

- **Privacy-first**: Your data stays in your browser. No tracking, no accounts, no server uploads (unless you choose to share)
- **Works offline**: Install as a PWA and use without internet. All data stored locally
- **Installable**: Add to your home screen on mobile or desktop for native app-like experience
- **Fully featured**: Not a toy project - this is a production-ready tier list maker with real features
- **Open source**: MIT licensed, contributions welcome

## Features

### Core Functionality

- **Drag & drop everything** - Move items between tiers, reorder tiers themselves
- **6 default tiers** (S, A, B, C, D, F) with distinct colors
- **Unlimited custom tiers** - Add as many as you need
- **Customizable** - Change tier names and colors (9 preset colors)
- **Text-only items** - Don't have an image? Add text items instead
- **Multiple tier lists** - Create and manage as many lists as you want

### Image Handling

- **Drag & drop upload** - Drop images directly onto the editor
- **Clipboard paste** - Press Ctrl/Cmd+V to paste images from clipboard
- **Auto-compression** - Images automatically optimized (150x150px) for fast loading
- **Batch upload** - Add multiple images at once
- **Supports** PNG, JPG, GIF, WebP up to 10MB each

### Import & Export

- **PNG export** - Download your tier list as a high-quality image
- **JSON backup** - Export full backup with embedded images for offline restore
- **Shareable JSON** - Export with cloud-hosted images (via ImgBB) for easy sharing
- **Import** - Restore any exported JSON backup

### User Experience

- **Dark/Light theme** - Follows your system preference or toggle manually
- **Undo/Redo** - Made a mistake? Ctrl+Z to undo, Ctrl+Shift+Z to redo
- **Keyboard navigation** - Optional accessibility feature for keyboard-only use
- **Responsive design** - Works on desktop, tablet, and mobile
- **Floating action bar** - Mobile-optimized controls at the bottom of the screen

### Gallery Management

- **Search** - Find tier lists by title
- **Sort** - By date updated, created, or alphabetically
- **Duplicate** - Clone existing tier lists
- **Preview** - See tier colors at a glance in the gallery

### Sharing

- **URL sharing** - Generate shareable links (images uploaded to ImgBB)
- **Clone shared lists** - Import shared tier lists to your collection
- **Read-only view** - Shared links show tier list without editing

### Progressive Web App (PWA)

- **Install on any device** - Add to home screen on iOS, Android, or desktop
- **Works offline** - Full functionality without internet connection
- **Fast loading** - Service worker caches assets for instant access
- **Native-like experience** - Fullscreen, no browser UI

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ahmed-abdat/LibreTier.git
cd LibreTier

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

For shareable JSON export with cloud-hosted images:

```bash
# .env.local
IMGBB_API_KEY=your_imgbb_api_key
```

Get a free API key at [imgbb.com](https://api.imgbb.com/)

## Tech Stack

| Category    | Technology                         |
| ----------- | ---------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack) |
| Language    | TypeScript (strict mode)           |
| Styling     | Tailwind CSS + shadcn/ui           |
| State       | Zustand with persist middleware    |
| Drag & Drop | @dnd-kit                           |
| Animations  | Framer Motion                      |
| PWA         | Serwist (service worker)           |
| Testing     | Vitest + Playwright                |

## Project Structure

```
src/
├── app/                    # Next.js pages and routes
│   ├── editor/[id]/        # Tier list editor
│   ├── share/              # Shared tier list view
│   ├── tiers/              # Gallery of saved lists
│   ├── ~offline/           # PWA offline fallback
│   └── sw.ts               # Service worker
├── features/tier-list/     # Core tier list feature
│   ├── components/         # TierRow, TierItem, ShareDialog, etc.
│   ├── hooks/              # useTierListDnd, custom hooks
│   ├── store/              # Zustand store and actions
│   └── utils/              # url-share, json-export, etc.
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── pwa/                # InstallPrompt
│   └── layout/             # Header, providers
└── lib/                    # Utilities
```

## Available Commands

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build --webpack  # Production build with PWA service worker
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests (Playwright)
```

> **Note**: Use `--webpack` flag for production builds to generate the service worker. Serwist doesn't support Turbopack yet.

## Contributing

Contributions are welcome! Whether it's:

- Bug reports
- Feature requests
- Pull requests
- Documentation improvements

Feel free to open an issue or submit a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

If you find this useful, consider giving it a star.
