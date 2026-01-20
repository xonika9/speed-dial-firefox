# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Speed Dial New Tab is a Firefox extension that transforms the new tab page into a visual bookmark speed dial inspired by Opera browser. It integrates with Firefox's native bookmarks system.

## Build Commands

```bash
npm install           # Install dependencies
npm run dev           # Start Vite dev server on port 3000
npm run build         # Watch mode build to build_dev/ (unminified)
npm run build2        # Production build to build/
```

To test in Firefox:
1. Run `npm run build` or `npm run build2`
2. Open `about:debugging` in Firefox
3. Click "This Firefox" → "Load Temporary Add-on"
4. Select `build/manifest.json` or `build_dev/manifest.json`

## Architecture

### Tech Stack
- **SolidJS** for reactive UI (not React - uses different paradigms)
- **@solidjs/router** with hash-based routing
- **Vite** for bundling
- **webextension-polyfill** for cross-browser extension APIs
- **solid-sortable** for drag-and-drop reordering

### Core Structure

**Entry Point**: `src/index.tsx` renders App wrapped in Router and SettingsProvider.

**State Management**:
- `src/settings.tsx` - Global settings store using SolidJS `createStore`. Settings are persisted to `browser.storage.local` with debounced saves. Provides `SettingsContext`.
- `src/Folder.tsx` - FolderState manages bookmark children for current folder view. Uses `reconcile` for efficient updates.

**Routing** (hash-based):
- `/` → Redirects to default folder
- `/folder/:id` → Displays folder contents
- `/help` → Help page

**Component Hierarchy**:
```
App
├── BackgroundWrapper (handles custom backgrounds)
├── Routes
│   ├── Folder
│   │   ├── Breadcrumb (navigation path)
│   │   ├── Toolbar (action buttons)
│   │   └── Sortable Grid → Tile
│   │       ├── BookmarkTile (URL bookmarks)
│   │       ├── FolderTile (subfolders)
│   │       └── SeparatorTile
│   └── HelpPage
├── Sidebar (settings panel)
├── ContextMenu (right-click actions)
└── ConsentModal (data collection consent)
```

**Utilities** (`src/utils/`):
- `bookmark.ts` - Firefox bookmark tree helpers, `rootFolderId` differs between Firefox/Chrome
- `database.ts` - Dual storage backend: IndexedDB primary, falls back to `storage.local`. Three stores: `background_store`, `tile_image_store`, `favicon_store`
- `image.ts` - Thumbnail/favicon fetching from external services
- `assorted.ts` - General utilities including browser detection (`isFirefox`, `isChrome`)

**Custom Components**:
- `src/colorful/` - Color picker (SolidJS port of react-colorful)

### Key Patterns

- Bookmark nodes use `webextension-polyfill` types (`Bookmarks.BookmarkTreeNode`)
- `isFolder()`, `isBookmark()`, `isSeparator()` type guards distinguish bookmark types
- Toolbar items are configurable via drag-and-drop customization
- Uses SolidJS directives like `use:sortableHandle`

### Storage

Settings stored in `browser.storage.local` under key `settings`.
Images stored in IndexedDB (with storage.local fallback) to handle Blob data.

## Code Style

- Prettier with 4-space tabs, single quotes, 100 char width
- TypeScript strict mode
- SolidJS JSX (uses `jsxImportSource: "solid-js"`)
