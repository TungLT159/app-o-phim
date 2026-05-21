# Electron Desktop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package the React movie site as an Electron desktop app with an internal API/stream server.

**Architecture:** Refactor `server.js` into a reusable server factory while keeping standalone CLI behavior. Add `electron/main.js` to start the local server, create a secure `BrowserWindow`, and load the generated React build through localhost. Use `electron-builder` for Windows, macOS, and Linux targets.

**Tech Stack:** React 18, Create React App, Node HTTP server, Electron, electron-builder, Jest.

---

## File Structure

- Modify `server.js`: export `createAppServer` and `startAppServer`; preserve direct `node server.js` behavior.
- Create `server.test.js`: verify embeddable server startup, SPA fallback, and shutdown.
- Create `electron/main.js`: Electron lifecycle and local server startup.
- Modify `package.json`: add `main`, Electron scripts, builder config, and dev dependencies.
- Modify `.gitignore`: ignore Electron package output if not already ignored.

## Tasks

### Task 1: Server Embedding

- [ ] Add failing Jest tests in `server.test.js` for `startAppServer({ port: 0, buildDir })`.
- [ ] Run `npm test -- --runInBand server.test.js --watchAll=false` and confirm it fails because exports do not exist.
- [ ] Refactor `server.js` to accept `buildDir`, `port`, and `host` options, export start helpers, and keep standalone serving.
- [ ] Re-run the targeted server test and confirm it passes.

### Task 2: Electron Main Process

- [ ] Create `electron/main.js` that starts `startAppServer({ port: 0 })`, opens a `BrowserWindow`, loads the local URL, and closes the server on app quit.
- [ ] Add secure defaults: `nodeIntegration: false`, `contextIsolation: true`, and no remote module usage.
- [ ] Add useful failure handling: if the local server fails, show an Electron error dialog and quit.

### Task 3: Packaging Configuration

- [ ] Install `electron` and `electron-builder` as dev dependencies.
- [ ] Set `main` to `electron/main.js`.
- [ ] Add scripts for `electron:dev`, `electron:pack`, and `electron:dist`.
- [ ] Add `build` config with app id, product name, included files, and Windows/macOS/Linux targets.

### Task 4: Verification and Packaging

- [ ] Run the targeted server test.
- [ ] Run `npm run build`.
- [ ] Run Electron packaging for Windows with `npm run electron:pack`.
- [ ] Report generated output paths and any platform limitations.
