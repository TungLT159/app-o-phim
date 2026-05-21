# Electron Desktop App Design

## Goal

Convert the current React movie website into a packaged Electron desktop app while preserving the existing web behavior, movie API access, and HLS stream proxy.

## Architecture

The React app remains the renderer and is built with Create React App. Electron starts a local HTTP server inside the main process, then opens the app at `http://127.0.0.1:<port>` so `BrowserRouter`, SPA fallback routing, `/api/phim/*`, and `/api/stream` continue to work without switching to file URLs.

## Components

- `server.js` becomes embeddable. It can still run standalone with `npm run serve`, and Electron can import it to start/stop the server programmatically.
- `electron/main.js` owns the Electron app lifecycle, creates the browser window, starts the internal server on an available local port, and shuts it down on exit.
- `package.json` defines Electron scripts and `electron-builder` packaging targets for Windows, macOS, and Linux.

## Data Flow

Renderer requests to upstream OPhim continue through existing API clients. Detail and episode stream requests use the local `/api` server when available. The internal server fetches upstream metadata, rewrites playlist URLs through `/api/stream`, and serves static React assets from `build`.

## Packaging

`electron-builder` packages the React `build`, Electron main process, server code, and required runtime files. Windows can be built and tested on this machine. macOS and Linux targets are configured, but full packaging validation for those platforms depends on running builds on those operating systems.

## Testing

Add server tests for embeddable startup, port allocation, SPA fallback, and graceful shutdown. Verification includes targeted Jest tests, React production build, and Electron Windows packaging where the local environment permits.
