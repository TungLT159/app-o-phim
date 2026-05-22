# GitHub Release Auto Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Electron update notifications backed by GitHub Releases.

**Architecture:** Use `electron-updater` in the main process to check GitHub Releases after the app window loads. Expose a narrow preload bridge for renderer notification state and user actions, then show a small Electron-only update banner in React.

**Tech Stack:** Electron, electron-updater, electron-builder GitHub publish config, React, Jest.

---

## Tasks

### Task 1: Package Update Configuration

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/electronPackaging.test.js`

- [ ] Add `electron-updater` dependency.
- [ ] Add `build.publish` for GitHub owner `TungLT159`, repo `app-o-phim`.
- [ ] Keep Windows NSIS/portable targets.
- [ ] Add packaging tests for GitHub publish config and updater dependency.

### Task 2: Electron Update Service + Bridge

**Files:**
- Create: `electron/updateService.js`
- Modify: `electron/main.js`
- Modify: `electron/preload.js`
- Modify: `electron/main.test.js`
- Modify: `electron/preload.test.js`

- [ ] Main process checks updates only for packaged app.
- [ ] Broadcast update states to renderer: `checking`, `available`, `not-available`, `download-progress`, `downloaded`, `error`.
- [ ] Expose `window.ophimUpdates` with `check`, `download`, `install`, `getState`, `onStateChange`.
- [ ] Do not expose generic `ipcRenderer`.

### Task 3: Renderer Update Banner

**Files:**
- Create: `src/components/update-notification/UpdateNotification.jsx`
- Create: `src/components/update-notification/update-notification.scss`
- Create: `src/components/update-notification/UpdateNotification.test.jsx`
- Modify: `src/App.js`

- [ ] Render only when `window.ophimUpdates` exists.
- [ ] Show Vietnamese notification for available/downloaded/error states.
- [ ] Provide buttons to download/install and dismiss.
- [ ] Keep web build unaffected.

### Task 4: Verification

**Commands:**
- `npm test -- --watchAll=false`
- `npm run test:electron`
- `npm run build`
