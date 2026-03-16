# 🚀 Sim-Bridge

`sim-bridge` is a **zero-configuration native orchestrator** for the React Native Playground.

## Features

- **Zero Setup**: No manual configuration required
- **Auto-Bootstrap**: Validates environment, installs Expo CLI, creates workspace, boots simulator
- **Idempotent**: Safe to restart; reuses existing simulator and Metro process
- **Token Security**: New token generated on each start
- **Screen Mirroring**: Real-time simulator screenshots

## Prerequisites

- **macOS** (required for iOS Simulator)
- **Xcode** with Command Line Tools

> Note: Expo CLI is installed automatically if missing.

## Quick Start

```bash
cd packages/runner
npm install
npm run dev
```

The runner will:
1. ✅ Validate your environment (macOS, Xcode)
2. ✅ Install Expo CLI globally (if needed)
3. ✅ Create workspace at `~/.rn-playground/native`
4. ✅ Boot an iOS Simulator (if none running)
5. ✅ Generate a security token
6. ✅ Start the server

Copy the token displayed in terminal and paste it into the web playground.

## CLI Usage

```bash
# Via npx (when published)
npx sim-bridge

# With custom port
npx sim-bridge --port 8080
```

| Option | Description | Default |
| :--- | :--- | :--- |
| `--port, -p` | Port to listen on | `3001` |

## API Endpoints

### `GET /health`
Returns structured system state. **No authentication required.**

```json
{
  "ok": true,
  "platform": "ios",
  "simulator": "booted",
  "expo": "ready",
  "workspace": "ready",
  "runnerVersion": "0.2.0"
}
```

### `POST /sync`
Syncs files from the playground editor to the native workspace.

### `POST /run`
Launches the app on the simulator. **Idempotent** - reuses existing Metro if running.

### `GET /screenshot`
Returns a PNG screenshot of the simulator.

### `WS /logs?sessionId=<id>`
WebSocket stream for real-time logs.

## Architecture

```
┌─────────────────┐         ┌──────────────────────┐
│  Web Playground │ ◄─────► │     sim-bridge       │
│  (Browser)      │  REST   │  (Local Orchestrator)│
└─────────────────┘  + WS   └──────────────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │   iOS Simulator      │
                            │   (via xcrun simctl) │
                            └──────────────────────┘
```

## Workspace Layout

```
~/.rn-playground/
├── native/          # Expo project (auto-created)
├── sessions/        # Temporary session files
└── token            # Current auth token
```

## Error Handling

All errors include actionable remediation steps:

| Error Code | Cause | Action |
| :--- | :--- | :--- |
| `MACOS_REQUIRED` | Running on non-Mac | Use a Mac |
| `XCODE_CLI_MISSING` | Xcode not installed | Run `xcode-select --install` |
| `SIM_NOT_FOUND` | No simulator available | Download iOS runtime in Xcode |
| `SIMULATOR_TIMEOUT` | Boot took too long | Open Simulator.app manually |
