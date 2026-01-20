# WXT Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Speed Dial Firefox extension from Vite to WXT for proper HMR and better developer experience.

**Architecture:** Move from flat src/ structure to WXT's entrypoint-based structure. Keep all existing SolidJS components, but reorganize into components/, utils/, and entrypoints/newtab/. WXT will handle manifest generation, dev server with HMR, and browser launching.

**Tech Stack:** WXT 0.20.13, @wxt-dev/module-solid, SolidJS 1.7.7, @solidjs/router, webextension-polyfill

---

## Phase 1: Cleanup and Prepare Structure

### Task 1: Remove Duplicate Directories and Old Config

**Files:**
- Delete: `entrypoints/` (root level empty directory)
- Delete: `assets/` (root level empty directory)
- Delete: `vite.config.ts` (will be replaced by wxt.config.ts)
- Delete: `build_dev/` (old build output)

**Step 1: Remove directories**

```bash
rm -rf entrypoints assets build_dev vite.config.ts
```

**Step 2: Verify removal**

Run: `ls -la`
Expected: No `entrypoints/`, `assets/`, `build_dev/`, `vite.config.ts` in root

**Step 3: Commit**

```bash
git add -A && git commit -m "chore: remove old vite config and empty directories"
```

---

### Task 2: Create WXT Directory Structure

**Files:**
- Create: `src/components/` directory
- Create: `src/entrypoints/newtab/` directory (already exists partially)

**Step 1: Create directories**

```bash
mkdir -p src/components src/entrypoints/newtab
```

**Step 2: Verify structure**

Run: `ls -la src/`
Expected: `components/`, `entrypoints/`, `utils/` directories exist

---

## Phase 2: Move Components to New Structure

### Task 3: Move UI Components to components/

**Files:**
- Move: `src/App.tsx` → `src/components/App.tsx`
- Move: `src/Folder.tsx` → `src/components/Folder.tsx`
- Move: `src/FolderRedirect.tsx` → `src/components/FolderRedirect.tsx`
- Move: `src/Tile.tsx` → `src/components/Tile.tsx`
- Move: `src/BookmarkTile.tsx` → `src/components/BookmarkTile.tsx`
- Move: `src/FolderTile.tsx` → `src/components/FolderTile.tsx`
- Move: `src/Toolbar.tsx` → `src/components/Toolbar.tsx`
- Move: `src/Breadcrumb.tsx` → `src/components/Breadcrumb.tsx`
- Move: `src/Sidebar.tsx` → `src/components/Sidebar.tsx`
- Move: `src/Search.tsx` → `src/components/Search.tsx`
- Move: `src/Modal.tsx` → `src/components/Modal.tsx`
- Move: `src/ConsentModal.tsx` → `src/components/ConsentModal.tsx`
- Move: `src/ContextMenu.tsx` → `src/components/ContextMenu.tsx`
- Move: `src/CustomizeTile.tsx` → `src/components/CustomizeTile.tsx`
- Move: `src/CustomizeToolbar.tsx` → `src/components/CustomizeToolbar.tsx`
- Move: `src/HelpPage.tsx` → `src/components/HelpPage.tsx`
- Move: `src/BackgroundWrapper.tsx` → `src/components/BackgroundWrapper.tsx`
- Move: `src/BackgroundPicker.tsx` → `src/components/BackgroundPicker.tsx`
- Move: `src/Slider.tsx` → `src/components/Slider.tsx`
- Move: `src/SegmentedControl.tsx` → `src/components/SegmentedControl.tsx`
- Move: `src/Dropdown.tsx` → `src/components/Dropdown.tsx`
- Move: `src/CircleLoader.tsx` → `src/components/CircleLoader.tsx`

**Step 1: Move all component files**

```bash
cd /Users/xonika/Documents/projects/speed-dial-firefox
mv src/App.tsx src/components/
mv src/Folder.tsx src/components/
mv src/FolderRedirect.tsx src/components/
mv src/Tile.tsx src/components/
mv src/BookmarkTile.tsx src/components/
mv src/FolderTile.tsx src/components/
mv src/Toolbar.tsx src/components/
mv src/Breadcrumb.tsx src/components/
mv src/Sidebar.tsx src/components/
mv src/Search.tsx src/components/
mv src/Modal.tsx src/components/
mv src/ConsentModal.tsx src/components/
mv src/ContextMenu.tsx src/components/
mv src/CustomizeTile.tsx src/components/
mv src/CustomizeToolbar.tsx src/components/
mv src/HelpPage.tsx src/components/
mv src/BackgroundWrapper.tsx src/components/
mv src/BackgroundPicker.tsx src/components/
mv src/Slider.tsx src/components/
mv src/SegmentedControl.tsx src/components/
mv src/Dropdown.tsx src/components/
mv src/CircleLoader.tsx src/components/
```

**Step 2: Move colorful directory**

```bash
mv src/colorful src/components/
```

**Step 3: Verify move**

Run: `ls src/components/`
Expected: All .tsx files listed, colorful/ directory present

---

### Task 4: Move settings.tsx to components/

**Files:**
- Move: `src/settings.tsx` → `src/components/settings.tsx`

**Step 1: Move file**

```bash
mv src/settings.tsx src/components/
```

**Step 2: Commit component moves**

```bash
git add -A && git commit -m "refactor: move components to src/components/"
```

---

## Phase 3: Create Newtab Entrypoint

### Task 5: Create main.tsx for Newtab Entrypoint

**Files:**
- Create: `src/entrypoints/newtab/main.tsx`

**Step 1: Create main.tsx**

Create file `src/entrypoints/newtab/main.tsx`:

```tsx
/* @refresh reload */
import { render } from 'solid-js/web';

import '../../index.css';
import App from '../../components/App';
import { hashIntegration, Router } from '@solidjs/router';
import { SettingsProvider } from '../../components/settings';
import { debounce } from '@solid-primitives/scheduled';

declare module 'solid-js' {
    namespace JSX {
        interface Directives {
            sortableHandle: boolean;
        }
    }
}

// necessary for custom save/restore scroll logic to work
history.scrollRestoration = 'manual';

window.addEventListener(
    'scroll',
    debounce(() => history.replaceState({ scroll: window.scrollY }, ''), 100),
);

render(
    () => (
        <Router source={hashIntegration()}>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </Router>
    ),
    document.getElementById('root')!,
);
```

**Step 2: Verify file created**

Run: `cat src/entrypoints/newtab/main.tsx | head -20`
Expected: Shows the import statements and setup code

---

### Task 6: Update Newtab index.html

**Files:**
- Modify: `src/entrypoints/newtab/index.html`

**Step 1: Update index.html to reference main.tsx correctly**

Replace contents of `src/entrypoints/newtab/index.html`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="shortcut icon" type="image/ico" href="/add.png" />
        <title>New tab</title>
    </head>
    <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>
        <div id="context"></div>
        <div id="modal"></div>
        <script src="./main.tsx" type="module"></script>
        <style id="custom-css"></style>
    </body>
</html>
```

**Step 2: Commit entrypoint**

```bash
git add -A && git commit -m "feat: create WXT newtab entrypoint"
```

---

## Phase 4: Update Import Paths

### Task 7: Update Import Paths in App.tsx

**Files:**
- Modify: `src/components/App.tsx`

**Step 1: Update imports**

Change imports from:
```tsx
import BackgroundWrapper from './BackgroundWrapper';
import FolderRedirect from './FolderRedirect';
import { ContextMenu } from './ContextMenu';
import { Sidebar, showSidebar } from './Sidebar';
import { SettingsContext } from './settings';
import { Folder } from './Folder';
import HelpPage from './HelpPage';
import ConsentModal from './ConsentModal';
import { isModalShowing } from './Modal';
```

To (paths stay the same since all are now in components/):
```tsx
import BackgroundWrapper from './BackgroundWrapper';
import FolderRedirect from './FolderRedirect';
import { ContextMenu } from './ContextMenu';
import { Sidebar, showSidebar } from './Sidebar';
import { SettingsContext } from './settings';
import { Folder } from './Folder';
import HelpPage from './HelpPage';
import ConsentModal from './ConsentModal';
import { isModalShowing } from './Modal';
```

Note: Imports remain the same since all components are in the same directory now.

---

### Task 8: Update Import Paths in All Components

**Files to check and update:**
- `src/components/Folder.tsx` - update utils imports to `../utils/`
- `src/components/Tile.tsx` - update utils imports to `../utils/`
- `src/components/BookmarkTile.tsx` - update utils imports to `../utils/`
- `src/components/FolderTile.tsx` - update utils imports to `../utils/`
- `src/components/Toolbar.tsx` - update utils imports to `../utils/`
- `src/components/settings.tsx` - update utils imports to `../utils/`
- `src/components/Sidebar.tsx` - update utils imports to `../utils/`
- `src/components/Search.tsx` - update utils imports to `../utils/`
- `src/components/BackgroundPicker.tsx` - update utils imports to `../utils/`
- `src/components/CustomizeTile.tsx` - update utils imports to `../utils/`

**Step 1: Update each file**

For each component, change:
- `./utils/` → `../utils/`
- `./assets/` → `../assets/`

Example for `src/components/Folder.tsx`:
```tsx
// Change from:
import { rootFolderId } from './utils/bookmark';
import { CancelablePromise, isChrome, makeSilentCancelable, move } from './utils/assorted';

// To:
import { rootFolderId } from '../utils/bookmark';
import { CancelablePromise, isChrome, makeSilentCancelable, move } from '../utils/assorted';
```

**Step 2: Commit import updates**

```bash
git add -A && git commit -m "fix: update import paths after component restructure"
```

---

## Phase 5: Update WXT Configuration

### Task 9: Finalize wxt.config.ts

**Files:**
- Modify: `wxt.config.ts`

**Step 1: Update wxt.config.ts with complete configuration**

```typescript
import { defineConfig } from 'wxt';

export default defineConfig({
    srcDir: 'src',
    entrypointsDir: 'entrypoints',
    modules: ['@wxt-dev/module-solid'],
    manifest: {
        name: 'Speed Dial New Tab',
        version: '1.0.3',
        description: 'Speed dial for your new tab page',
        permissions: ['bookmarks', 'storage', 'unlimitedStorage', 'tabHide'],
        host_permissions: ['<all_urls>'],
        browser_specific_settings: {
            gecko: {
                id: '{1f2a5a27-46cf-47ce-971e-4296aaa0c775}',
            },
        },
        action: {
            default_icon: 'logo.png',
            default_title: 'Speed Dial New Tab',
        },
    },
    vite: () => ({
        build: {
            target: 'esnext',
        },
    }),
});
```

**Step 2: Commit config**

```bash
git add wxt.config.ts && git commit -m "chore: finalize WXT configuration"
```

---

### Task 10: Move Public Assets

**Files:**
- Keep: `public/logo.png`
- Keep: `public/add.png`
- Delete: `public/manifest.json` (WXT generates this)

**Step 1: Remove old manifest**

```bash
rm public/manifest.json
```

**Step 2: Verify public directory**

Run: `ls public/`
Expected: `logo.png`, `add.png` (no manifest.json)

**Step 3: Commit**

```bash
git add -A && git commit -m "chore: remove old manifest.json, WXT generates it"
```

---

### Task 11: Update tsconfig.json for WXT

**Files:**
- Modify: `tsconfig.json`

**Step 1: Update tsconfig.json to extend WXT's config**

```json
{
  "extends": "./.wxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "noEmit": true,
    "isolatedModules": true
  }
}
```

**Step 2: Run WXT prepare**

```bash
npm run postinstall
```

Expected: Creates `.wxt/` directory with generated types

**Step 3: Commit**

```bash
git add -A && git commit -m "chore: update tsconfig for WXT"
```

---

## Phase 6: Delete Old Entry Point

### Task 12: Remove Old index.tsx and index.html

**Files:**
- Delete: `src/index.tsx` (replaced by entrypoints/newtab/main.tsx)
- Delete: `index.html` (replaced by entrypoints/newtab/index.html)

**Step 1: Remove old files**

```bash
rm src/index.tsx index.html
```

**Step 2: Commit**

```bash
git add -A && git commit -m "chore: remove old entry point files"
```

---

## Phase 7: Test and Verify

### Task 13: Run Dev Mode and Test HMR

**Step 1: Run WXT dev mode for Firefox**

```bash
npm run dev:firefox
```

Expected:
- Firefox opens automatically with extension loaded
- New tab page shows Speed Dial UI
- Console shows no errors

**Step 2: Test HMR**

1. Open new tab in Firefox (should show Speed Dial)
2. Edit a component (e.g., change text in `src/components/Toolbar.tsx`)
3. Save file
4. Observe: Page should update without full reload (HMR)

**Step 3: Test functionality**

- [ ] Bookmarks display correctly
- [ ] Folders can be opened
- [ ] Drag and drop works
- [ ] Settings sidebar opens
- [ ] Light/dark mode works
- [ ] Search works
- [ ] Context menu works

---

### Task 14: Build Production Version

**Step 1: Build for Firefox**

```bash
npm run build:firefox
```

Expected: Build completes successfully, output in `.output/firefox-mv3/`

**Step 2: Verify manifest**

```bash
cat .output/firefox-mv3/manifest.json
```

Expected: Contains correct permissions, name, version, newtab override

**Step 3: Final commit**

```bash
git add -A && git commit -m "feat: complete WXT migration with HMR support"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-2 | Cleanup old files and create directory structure |
| 2 | 3-4 | Move components to new location |
| 3 | 5-6 | Create newtab entrypoint |
| 4 | 7-8 | Update all import paths |
| 5 | 9-11 | Configure WXT and TypeScript |
| 6 | 12 | Remove old entry files |
| 7 | 13-14 | Test dev mode with HMR and build |

## Verification Checklist

- [ ] `npm run dev:firefox` opens Firefox with working extension
- [ ] HMR works - changes reflect without full page reload
- [ ] All bookmarks display correctly
- [ ] Drag and drop reordering works
- [ ] Settings persist after reload
- [ ] `npm run build:firefox` produces valid extension
- [ ] No TypeScript errors
- [ ] No console errors in browser
