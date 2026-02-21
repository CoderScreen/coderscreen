# Sandbox Overhaul: Full Interactive Terminal, Preview, and Streaming Execution

## Context

CoderScreen's current sandbox system is built on a forked/local `@cloudflare/sandbox` workspace package (old API) with a custom Bun HTTP server inside the container. It has 11 hardcoded language runner classes, synchronous-only HTTP execution (no streaming), no terminal, no preview for frameworks (uses client-side Sandpack instead), broken timeout logic, and a bloated 2GB+ Docker image with PyTorch/numpy/scipy.

The goal is to replace this with the official `@cloudflare/sandbox` SDK (v0.7.x from npm), which provides built-in APIs for terminal PTY (WebSocket), streaming execution (SSE), file system operations, port exposure (preview URLs), and process management - eliminating the need for custom runners and the forked SDK entirely.

**Outcome**: A CoderPad/HackerRank-quality experience with a full interactive xterm.js terminal, live sandbox preview for frameworks, streaming code output, and stop/interrupt capability - all backed by Cloudflare's official container infrastructure.

---

## Phase 1: Foundation - Replace SDK + New Dockerfile

### Checklist

- [x] **1.1 Swap the sandbox dependency**
  - `apps/api/package.json` - Changed `@cloudflare/sandbox` from `workspace:^` to `^0.7.0` (npm v0.7.4)
  - `apps/api/package.json` - Updated `@cloudflare/containers` from `^0.0.13` to `^0.0.30`
  - `apps/api/package.json` - Updated `wrangler` from `^4.22.0` to `^4.67.0` (required for containers v0.0.30)
  - `pnpm-workspace.yaml` - Removed `packages/sandbox-sdk` from workspace packages

- [x] **1.2 Create the new Sandbox Durable Object**
  - Created `apps/api/src/sandbox/SandboxDO.ts` extending official `Sandbox` class
  - Set `sleepAfter = '10m'`, added `onStart`/`onError` lifecycle hooks

- [x] **1.3 Update exports**
  - `apps/api/src/index.ts` - Changed import to `SandboxDO as Sandbox` from `./sandbox/SandboxDO`

- [x] **1.4 Build slim Docker image**
  - Replaced `apps/api/src/containers/images/Dockerfile` based on `cloudflare/sandbox:0.7.4`
  - Includes: Node 20, Python 3, Go 1.23, Rust, Java, Ruby, PHP, C/C++, TypeScript (tsx)
  - Key: `WORKDIR /container-server` (not `/workspace`) + `EXPOSE 3000` for sandbox control plane
  - `RUN mkdir -p /workspace` for code files

- [x] **1.5 Update wrangler.jsonc**
  - Increased `max_instances` from 2 to 5
  - Updated image path to `./src/containers/images/Dockerfile`

- [x] **1.6 Create language command map + rewrite services**
  - Created `apps/api/src/sandbox/languageCommands.ts` (replaces 11 runner files)
  - Rewrote `apps/api/src/services/CodeRun.service.ts` using `getSandbox()` + `exec()`
  - Rewrote `apps/api/src/partykit/internal/Sandbox.service.ts` using `getSandbox()`
  - Simplified `apps/api/src/lib/sandbox.ts`
  - All `getSandbox()` calls use `{ normalizeId: true }` for uppercase room IDs
  - Deleted old `CustomSandbox.ts`, all 12 runner files, and `config/` directory

### Verify Phase 1
- [x] `pnpm dev` in `apps/api/` starts without errors
- [x] Container builds and provisions successfully
- [x] Code execution works (TypeScript verified)

---

## Phase 2: New Code Execution with Streaming + Stop

### Checklist

- [x] **2.1 Create language command map**
  - Create `apps/api/src/sandbox/languageCommands.ts`
  - Simple map: `{ extension, runCommand(filePath), compileCommand?(filePath, outputPath) }`
  - Cover all 11 languages: javascript, typescript, python, bash, c, c++, go, rust, php, ruby, java
  - Replaces all 11 runner files in `apps/api/src/containers/runners/`

- [x] **2.2 Rewrite CodeRun.service.ts**
  - Modify `apps/api/src/services/CodeRun.service.ts`
  - Use `getSandbox(ctx.env.SANDBOX, getSandboxId(roomId))` from official SDK
  - `sandbox.writeFile('/workspace/main.ext', code)` then `sandbox.exec(runCommand, { timeout: 15000 })`
  - For compiled languages: compile step first, then run
  - Return same `FormattedOutput` shape for backward compat

- [x] **2.3 Add streaming execution endpoint**
  - Modify `apps/api/src/routes/room/publicRoom.routes.ts`
  - Add `POST /rooms/:roomId/public/run/stream` - Uses `sandbox.execStream()`, returns SSE Response

- [x] **2.4 Add stop endpoint**
  - Modify `apps/api/src/routes/room/publicRoom.routes.ts`
  - Add `POST /rooms/:roomId/public/stop` - Uses `sandbox.killAllProcesses()`

- [x] **2.5 Update frontend execution hook**
  - Modify `apps/web/src/query/realtime/execution.query.ts`
  - Add `stopExecution` callback that POSTs to `/stop`
  - Optionally consume SSE from `/run/stream` for real-time output appending

- [x] **2.6 Update Run/Stop button**
  - Modify `apps/web/src/components/room/editor/EditorHeader.tsx`
  - Show Stop button (with `RiStopLine` icon) while `isLoading` is true
  - Wire up to `stopExecution` from the hook

- [x] **2.7 Delete old runner code**
  - Delete entire `apps/api/src/containers/` directory
  - Includes: `CustomSandbox.ts`, `runners/` (all 12 files), `config/`

### Verify Phase 2
- [x] POST `/run` still works for all 11 languages (backward compat)
- [x] POST `/run/stream` returns SSE events with stdout/stderr chunks
- [x] POST `/stop` kills running processes
- [x] Stop button appears during execution and works (test with `while True: pass`)
- [x] Compiled languages (C, C++, Rust, Go, Java) report compile time correctly

---

## Phase 3: WebSocket Terminal (xterm.js)

### Checklist

- [x] **3.1 Backend terminal WebSocket route**
  - Modify `apps/api/src/routes/room/publicRoom.routes.ts`
  - Add `GET /rooms/:roomId/public/terminal` - WebSocket upgrade handler
  - Uses `proxyTerminal()` from official SDK with sandbox DO stub
  - SDK handles: PTY creation, binary frame proxying, reconnection buffering
  - **Key decision**: Route through Hono API, NOT PartyKit (PartyKit uses Yjs protocol)

- [x] **3.2 Add frontend dependencies**
  - `apps/web/package.json` - Add:
    - `@xterm/xterm` ^5.5.0
    - `@xterm/addon-fit` ^0.10.0
    - `@cloudflare/sandbox` ^0.7.0 (for `@cloudflare/sandbox/xterm` SandboxAddon)

- [x] **3.3 Create Terminal component**
  - Create `apps/web/src/components/room/terminal/Terminal.tsx`
  - Uses `@xterm/xterm` + `@xterm/addon-fit`
  - Uses `SandboxAddon` from `@cloudflare/sandbox/xterm` for WebSocket
  - `getWebSocketUrl` points to `/rooms/:roomId/public/terminal`
  - Auto-reconnect enabled
  - ResizeObserver for panel resize handling

- [x] **3.4 Register terminal in Dockview**
  - Modify `apps/web/src/components/room/Dockview.tsx`:
    - Add `TERMINAL: 'terminal'` to `DOCKVIEW_PANEL_IDS`
    - Add terminal component to `useDockviewComponents`
    - Add icon mapping in `getTabIcon`
  - Modify `apps/web/src/components/room/host/HostRoomView.tsx`:
    - Add terminal panel in `onReady`, positioned below code-output
  - Modify `apps/web/src/components/room/guest/GuestRoomView.tsx`:
    - Same terminal panel addition

### Verify Phase 3
- [x] WebSocket connects at `/rooms/:roomId/public/terminal`
- [x] xterm.js renders in the Terminal Dockview panel
- [x] Interactive shell works: `ls`, `pwd`, `echo`, `python3 -c "print('hi')"`
- [x] Terminal reconnects after brief disconnect
- [x] Panel resize causes terminal to refit correctly
- [x] Both host and guest see the terminal panel

---

## Phase 4: Yjs-to-Sandbox File Synchronization

### Checklist

- [ ] **4.1 Create FileSyncService**
  - Create `apps/api/src/sandbox/FileSyncService.ts`
  - Takes a sandbox handle and Yjs Y.Doc
  - `syncAllFiles()` - Walks the `fs` Y.Map, builds file paths from the tree, writes all files to `/workspace/`
  - `startObserving()` - Observes Y.Map structure changes (add/delete) and Y.Text content changes per file
  - 500ms debounce per file to avoid writing on every keystroke
  - Reuses existing `FSEntry` type and `getFileKey()` pattern from `apps/api/src/partykit/room.do.ts`

- [ ] **4.2 Integrate into RoomServer**
  - Modify `apps/api/src/partykit/room.do.ts`
  - Import `getSandbox` from `@cloudflare/sandbox` and `FileSyncService`
  - In `onLoad()`, after `this.createNewSandbox()`:
    ```typescript
    const sandbox = getSandbox(this.env.SANDBOX, getSandboxId(this.room.id));
    this.fileSyncService = new FileSyncService(sandbox, this.document);
    this.ctx.waitUntil(this.fileSyncService.syncAllFiles());
    this.fileSyncService.startObserving();
    ```

### Verify Phase 4
- [ ] Edit code in editor -> file updates in sandbox within ~500ms
- [ ] Create new file in editor -> appears in sandbox
- [ ] Delete file in editor -> removed from sandbox
- [ ] Run code via terminal (`node /workspace/main.js`) uses latest editor content
- [ ] Multi-file projects have all files synced to `/workspace/`

---

## Phase 5: Framework Preview via Sandbox

### Checklist

- [ ] **5.1 Create PreviewService**
  - Create `apps/api/src/sandbox/PreviewService.ts`
  - Config map for React/Vue/Svelte: `{ installCommand, devCommand, port }`
  - `startPreview(sandbox, framework, hostname)`:
    - `sandbox.exec('npm install', { cwd: '/workspace' })`
    - `sandbox.startProcess('npm run dev', { cwd: '/workspace' })`
    - `process.waitForPort(port, { timeout: 60000, mode: 'http' })`
    - `sandbox.exposePort(port, { hostname })` -> returns preview URL

- [ ] **5.2 Add preview API endpoints**
  - Modify `apps/api/src/routes/room/publicRoom.routes.ts`
  - Add `POST /rooms/:roomId/public/preview/start` - Starts dev server, returns `{ previewUrl }`
  - Add `POST /rooms/:roomId/public/preview/stop` - Kills preview process

- [ ] **5.3 Create PreviewPanel component**
  - Create `apps/web/src/components/room/output/PreviewPanel.tsx`
  - "Start Preview" button calling `/preview/start`
  - iframe rendering the returned `previewUrl`
  - Loading/error states
  - Replaces `SandpackOutput.tsx`

- [ ] **5.4 Update CodeOutput routing**
  - Modify `apps/web/src/components/room/output/CodeOutput.tsx`
  - Change `shouldUseSandpackOutput(language)` branch to render `PreviewPanel` instead of `SandpackOutput`

- [ ] **5.5 Remove Sandpack**
  - Delete `apps/web/src/contexts/SandpackContext.tsx`
  - Delete `apps/web/src/components/room/output/SandpackOutput.tsx`
  - Remove `@codesandbox/sandpack-client` and `@codesandbox/sandpack-react` from `apps/web/package.json`
  - Remove `<SandpackProvider>` wrapper from `HostRoomView.tsx` and `GuestRoomView.tsx`

### Verify Phase 5
- [ ] React/Vue/Svelte language selection shows PreviewPanel
- [ ] "Start Preview" installs deps, starts dev server, shows live app in iframe
- [ ] Code edits trigger hot reload via file sync (Phase 4)
- [ ] "Stop Preview" kills the dev server

---

## Phase 6: Cleanup + Service Updates

### Checklist

- [ ] **6.1 Update SandboxService**
  - Modify `apps/api/src/partykit/internal/Sandbox.service.ts`
  - Use `getSandbox()` from official SDK instead of manual DO id resolution
  - `startSandbox()` calls `sandbox.exec('echo ready')` to warm up

- [ ] **6.2 Simplify lib/sandbox.ts**
  - Modify `apps/api/src/lib/sandbox.ts`
  - Keep `getSandboxId()` (reused everywhere)
  - Simplify `ExecuteResponse` and `FormattedOutput` - remove `command`/`args` fields
  - Keep `formatExecOutput()` for backward compat with existing execution history data

- [ ] **6.3 Verify no database schema changes needed**
  - `executionHistory` JSONB column stores Yjs-serialized data
  - Output format (`success`, `stdout`, `stderr`, `exitCode`, `elapsedTime`, `compileTime`, `timestamp`) matches existing `ExecOutputSchema`

---

## Files Summary

### Create (new files)
| File | Purpose |
|------|---------|
| `apps/api/src/sandbox/SandboxDO.ts` | New Sandbox DO extending official SDK |
| `apps/api/src/sandbox/languageCommands.ts` | Language-to-command map |
| `apps/api/src/sandbox/FileSyncService.ts` | Yjs doc -> sandbox file system sync |
| `apps/api/src/sandbox/PreviewService.ts` | Framework dev server management |
| `apps/web/src/components/room/terminal/Terminal.tsx` | xterm.js terminal component |
| `apps/web/src/components/room/output/PreviewPanel.tsx` | Server-side preview iframe |

### Modify (existing files)
| File | Changes |
|------|---------|
| `apps/api/package.json` | SDK dependency: workspace -> npm |
| `apps/api/src/index.ts` | Import new SandboxDO |
| `apps/api/wrangler.jsonc` | Container config, max_instances |
| `apps/api/src/containers/images/Dockerfile` | Slim image from sandbox:0.7.0 base |
| `apps/api/src/services/CodeRun.service.ts` | Rewrite with getSandbox + exec |
| `apps/api/src/routes/room/publicRoom.routes.ts` | Add /run/stream, /stop, /terminal, /preview |
| `apps/api/src/partykit/room.do.ts` | Integrate FileSyncService |
| `apps/api/src/partykit/internal/Sandbox.service.ts` | Use official getSandbox() |
| `apps/api/src/lib/sandbox.ts` | Simplify types |
| `apps/web/package.json` | Add xterm, sandbox addon deps |
| `apps/web/src/components/room/Dockview.tsx` | Add TERMINAL panel |
| `apps/web/src/components/room/editor/EditorHeader.tsx` | Add Stop button |
| `apps/web/src/components/room/output/CodeOutput.tsx` | Route to PreviewPanel |
| `apps/web/src/components/room/host/HostRoomView.tsx` | Add terminal panel, remove SandpackProvider |
| `apps/web/src/components/room/guest/GuestRoomView.tsx` | Add terminal panel, remove SandpackProvider |
| `apps/web/src/query/realtime/execution.query.ts` | Add stopExecution |

### Delete (old code)
| File/Directory | Reason |
|----------------|--------|
| `apps/api/src/containers/CustomSandbox.ts` | Replaced by SandboxDO |
| `apps/api/src/containers/runners/` (all 12 files) | Replaced by languageCommands map |
| `apps/api/src/containers/config/` | Official SDK handles container internals |
| `apps/web/src/contexts/SandpackContext.tsx` | Replaced by server-side preview |
| `apps/web/src/components/room/output/SandpackOutput.tsx` | Replaced by PreviewPanel |

---

## Key Architectural Decisions

1. **Terminal WebSocket routing**: Dedicated endpoint through Hono API worker, NOT PartyKit. PartyKit uses Yjs binary protocol - mixing terminal PTY frames would be fragile.

2. **File sync location**: Server-side in the RoomServer Durable Object (where Yjs doc lives), not client-side. Single sync path, works even without connected clients.

3. **Preview URLs**: `sandbox.exposePort()` returns a Cloudflare-hosted preview URL. Requires wildcard DNS subdomain configuration for custom domains.

4. **One sandbox per room**: Sandbox ID = `s_${roomId}`. Created lazily, shared between interviewer and candidate, auto-sleeps after 10min inactivity.

5. **No database schema changes**: Existing execution history format is compatible.
