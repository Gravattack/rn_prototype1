#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import { exec, ChildProcess } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import { SimulatorController } from './simulator';
import { RunnerError } from './errors';
import { bootstrap, BootstrapResult } from './bootstrap';
import { getWorkspacePath, syncToWorkspace } from './expo-workspace';
import { program } from 'commander';

const execAsync = promisify(exec);
const RUNNER_VERSION = '0.2.0';
const BASE_PATH = path.join(os.homedir(), '.rn-playground');
const SESSIONS_PATH = path.join(BASE_PATH, 'sessions');

// Unique instance ID - generated fresh on every runner start
// Used by clients to detect runner restarts and invalidate stale tokens
const RUNNER_ID = crypto.randomUUID();

// Module-level state for idempotent Metro management
let metroProcess: ChildProcess | null = null;

/**
 * Checks if Metro process is still alive and usable.
 */
function isMetroAlive(): boolean {
    if (!metroProcess) return false;
    // Check if process is still running
    return metroProcess.exitCode === null && !metroProcess.killed;
}

/**
 * Starts the Express server after bootstrap completes.
 */
async function startServer(bootstrapResult: BootstrapResult, port: number) {
    const sim = new SimulatorController();

    const app = express();
    app.use(cors({
        origin: true,
        allowedHeaders: ['Content-Type', 'X-Runner-Token']
    }));
    app.use(express.json());

    const errorHandler = (res: express.Response, error: any) => {
        if (error instanceof RunnerError) {
            return res.status(400).json(error.toJSON());
        }
        console.error(chalk.red('Unexpected error:'), error);
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: String(error)
            }
        });
    };

    // Security Middleware
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        // Enforce localhost only
        const remoteAddress = req.socket.remoteAddress;
        if (remoteAddress !== '127.0.0.1' && remoteAddress !== '::1' && remoteAddress !== '::ffff:127.0.0.1') {
            console.log(chalk.red(`Blocked non-localhost request from ${remoteAddress}`));
            return res.status(403).json({ error: 'Access restricted to localhost' });
        }

        // /health does not require authentication per spec
        if (req.path === '/health') return next();

        const receivedToken = req.headers['x-runner-token'];
        if (receivedToken !== bootstrapResult.token) {
            return res.status(401).json({ error: 'Invalid or missing runner token' });
        }
        next();
    });

    // --- API Endpoints ---

    /**
     * GET /health - Structured health endpoint per spec
     * No authentication required.
     */
    app.get('/health', async (_req: express.Request, res: express.Response) => {
        try {
            const booted = await sim.getBootedDevice();
            const workspaceValid = await fs.pathExists(path.join(getWorkspacePath(), 'package.json'));

            const ok = !!booted && workspaceValid;

            res.json({
                ok,
                runnerId: RUNNER_ID,
                platform: 'ios',
                simulator: booted ? 'booted' : 'not_booted',
                expo: 'ready', // We validated in bootstrap
                workspace: workspaceValid ? 'ready' : 'not_ready',
                runnerVersion: RUNNER_VERSION
            });
        } catch (error) {
            res.json({
                ok: false,
                platform: 'ios',
                simulator: 'error',
                expo: 'unknown',
                workspace: 'unknown',
                runnerVersion: RUNNER_VERSION,
                error: String(error)
            });
        }
    });

    /**
     * POST /sync - Sync files from playground to session and workspace
     */
    app.post('/sync', async (req: express.Request, res: express.Response) => {
        const { sessionId, files } = req.body;
        if (!sessionId || !files) {
            return res.status(400).json({ error: 'Missing sessionId or files' });
        }

        try {
            // Sanitize sessionId
            const safeId = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
            const sessionPath = path.join(SESSIONS_PATH, safeId);
            await fs.ensureDir(sessionPath);

            // Write files to session directory
            for (const [filename, content] of Object.entries(files)) {
                const filePath = path.join(sessionPath, filename);
                await fs.ensureDir(path.dirname(filePath));
                await fs.writeFile(filePath, content as string, 'utf-8');
            }

            // Sync to native workspace
            await syncToWorkspace(sessionPath);

            res.json({ success: true, path: sessionPath });
        } catch (error) {
            console.error('[Sync Error]', error);
            res.status(500).json({ error: String(error) });
        }
    });

    /**
     * GET /screenshot - Simulator screen mirroring
     */
    app.get('/screenshot', async (_req: express.Request, res: express.Response) => {
        try {
            const booted = sim.getActiveSimulator() || await sim.getBootedDevice();
            if (!booted) {
                return res.status(404).json({ error: 'No booted simulator found' });
            }

            const { stdout } = await execAsync(`xcrun simctl io ${booted.udid} screenshot -`, {
                encoding: 'buffer',
                maxBuffer: 10 * 1024 * 1024,
                timeout: 5000
            });

            res.setHeader('Content-Type', 'image/png');
            res.setHeader('X-Derived-From', booted.name);
            res.send(stdout);
        } catch (error: any) {
            console.warn('[Screenshot Warning]', error.message || error);
            res.status(503).json({
                error: 'Simulator mirror temporarily unavailable',
                details: error.message
            });
        }
    });

    /**
     * POST /stop - Cleanup a session
     */
    app.post('/stop', async (req: express.Request, res: express.Response) => {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: 'Missing sessionId' });
        }

        try {
            const safeId = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
            const sessionPath = path.join(SESSIONS_PATH, safeId);
            if (await fs.pathExists(sessionPath)) {
                await fs.remove(sessionPath);
            }
            res.json({ success: true });
        } catch (error) {
            errorHandler(res, error);
        }
    });

    /**
     * POST /run - Idempotent run endpoint
     * Reuses existing Metro process if alive, only restarts if dead.
     */
    app.post('/run', async (req: express.Request, res: express.Response) => {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: 'Missing sessionId' });
        }

        const log = (message: string, type: 'info' | 'error' | 'warn' = 'info') => {
            (app as any).broadcastLog(sessionId, {
                type,
                message,
                timestamp: new Date()
            });
        };

        try {
            const workspacePath = getWorkspacePath();

            // 1. Sync files to native workspace (already done by /sync, but ensure)
            log('Syncing files to native project...');
            const safeId = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
            const sessionPath = path.join(SESSIONS_PATH, safeId);
            if (await fs.pathExists(sessionPath)) {
                await syncToWorkspace(sessionPath);
            }
            log('Files synced.');

            // 2. Check if Metro is already running (idempotent)
            if (isMetroAlive()) {
                log('Metro is already running. Reloading app...');
                // Metro handles hot reload automatically, just return success
                res.json({
                    success: true,
                    device: bootstrapResult.simulator.name,
                    message: `App reloading on ${bootstrapResult.simulator.name}`,
                    metroReused: true
                });
                return;
            }

            // 3. Start Native Build (Direct xcodebuild)
            // We bypass `expo run:ios` to ensure deterministic simulator targeting.
            const simulatorUdid = bootstrapResult.simulator.udid;
            const iosDir = path.join(workspacePath, 'ios');

            // Dynamically find workspace and scheme
            // The project name depends on how create-expo-app initialized it
            const files = await fs.readdir(iosDir);
            const workspaceName = files.find(f => f.endsWith('.xcworkspace'));

            if (!workspaceName) {
                throw new RunnerError(
                    'WORKSPACE_CORRUPT',
                    'Could not find .xcworkspace in ios/ directory.',
                    'Run expo prebuild manually or restart the runner.'
                );
            }

            const projectName = workspaceName.replace('.xcworkspace', '');
            const workspaceFile = path.join(iosDir, workspaceName);
            const scheme = projectName; // Usually matches workspace name for simple Expo projects
            const configuration = 'Debug';
            const appPath = path.join(iosDir, `build/Build/Products/Debug-iphonesimulator/${projectName}.app`);

            log(`Building native app (${projectName}) for ${bootstrapResult.simulator.name} [${simulatorUdid}]...`);

            // Step 3a: xcodebuild
            try {
                await new Promise<void>((resolve, reject) => {
                    // We force:
                    // 1. IPHONEOS_DEPLOYMENT_TARGET=15.0 (Fix SDK mismatch)
                    // 2. SUPPORTED_PLATFORMS="iphoneos iphonesimulator" (Fix "Ineligible destination" for simulator)
                    // 3. ONLY_ACTIVE_ARCH=NO (Ensure we build for simulator arch)
                    const buildCmd = `xcodebuild -workspace "${workspaceFile}" -scheme "${scheme}" -configuration "${configuration}" -destination "platform=iOS Simulator,id=${simulatorUdid}" -derivedDataPath "${path.join(iosDir, 'build')}" IPHONEOS_DEPLOYMENT_TARGET=15.0 SUPPORTED_PLATFORMS="iphoneos iphonesimulator" ONLY_ACTIVE_ARCH=NO`;

                    const buildProcess = exec(buildCmd, { cwd: iosDir });

                    buildProcess.stdout?.on('data', (data) => {
                        const output = data.toString();
                        // Stream interesting parts of build output
                        if (output.includes('Compile') || output.includes('Linking') || output.includes('BUILD SUCCEEDED')) {
                            console.log(chalk.gray(`[xcodebuild] ${output.trim().split('\n')[0]}`));
                        }
                    });

                    buildProcess.stderr?.on('data', (data) => {
                        console.error(chalk.yellow(`[xcodebuild] ${data.toString().trim()}`));
                    });

                    buildProcess.on('exit', (code) => {
                        if (code === 0) resolve();
                        else reject(new Error(`xcodebuild failed with code ${code}`));
                    });
                });
                log('Native build successful.');
            } catch (buildError: any) {
                console.error(chalk.red('[Build Error]'), buildError);
                throw new RunnerError(
                    'INTERNAL_ERROR', // Could be specific BUILD_FAILED
                    `Native build failed: ${buildError.message}`,
                    'Check xcodebuild logs for details.'
                );
            }

            // Step 3b: Install app via simctl
            log('Installing app on simulator...');
            await sim.install(simulatorUdid, appPath);

            // Step 3c: Launch app via simctl
            log('Launching app...');

            // Read bundle ID from app.json
            const appJsonPath = path.join(workspacePath, 'app.json');
            const appJson = await fs.readJson(appJsonPath);
            const bundleId = appJson?.expo?.ios?.bundleIdentifier || 'com.anonymous.native';

            await sim.launch(simulatorUdid, bundleId);

            // Step 3d: Start Metro independently
            log('Starting Metro bundler...');
            metroProcess = exec('npx expo start', {
                cwd: workspacePath,
                env: {
                    ...process.env,
                    CI: '1',
                    EXPO_NO_TELEMETRY: '1',
                    EXPO_NO_UPDATE_CHECK: '1'
                }
            });

            metroProcess.stdout?.on('data', (data) => {
                const output = data.toString();
                console.log(chalk.gray(`[Metro] ${output.trim()}`));
            });

            metroProcess.stderr?.on('data', (data) => {
                const output = data.toString();
                if (!output.includes('WARN') && !output.includes('deprecated')) {
                    console.error(chalk.yellow(`[Metro] ${output.trim()}`));
                }
            });

            metroProcess.on('exit', (code) => {
                console.log(chalk.gray(`[Metro] Process exited with code ${code}`));
                metroProcess = null;
            });

            res.json({
                success: true,
                device: bootstrapResult.simulator.name,
                udid: simulatorUdid,
                message: `Session ${sessionId} running on ${bootstrapResult.simulator.name}`,
                metroReused: false
            });

            log(`Running on ${bootstrapResult.simulator.name} [${simulatorUdid}]...`);
        } catch (error) {
            errorHandler(res, error);
            log(`Failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
        }
    });

    // --- WebSocket for Logs ---
    const server = createServer(app);
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        const url = new URL(request.url || '', `http://${request.headers.host}`);
        if (url.pathname === '/logs') {
            const sid = url.searchParams.get('sessionId');
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request, sid);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', (ws: any, _req: any, sessionId: string | null) => {
        console.log(chalk.blue(`Browser connected to logs [session: ${sessionId || 'global'}]`));
        ws.send(JSON.stringify({
            type: 'info',
            message: `Connected to Runner Log Stream (${sessionId || 'global'})`
        }));
        ws.sessionId = sessionId;
    });

    // Helper for broadcasting
    (app as any).broadcastLog = (sessionId: string, log: any) => {
        wss.clients.forEach(client => {
            const ws = client as any;
            if (ws.readyState === 1 && (!sessionId || ws.sessionId === sessionId)) {
                ws.send(JSON.stringify(log));
            }
        });
    };

    // Start listening
    server.listen(port, '127.0.0.1', () => {
        console.log(chalk.green('\n🚀 sim-bridge is running!'));
        console.log(chalk.cyan(`📍 URL: http://127.0.0.1:${port}`));
        console.log(chalk.yellow(`🔑 Token: ${bootstrapResult.token}`));
        console.log(chalk.gray(`📱 Simulator: ${bootstrapResult.simulator.name}`));
        console.log(chalk.gray(`📁 Workspace: ${bootstrapResult.workspace}`));
        console.log(chalk.gray('-------------------------------------------'));
        console.log(chalk.white('Paste the token above into the web playground to connect.\n'));
    });
}

// --- CLI Entry Point ---
program
    .name('sim-bridge')
    .description('Zero-config native orchestrator for React Native Playground')
    .version(RUNNER_VERSION)
    .option('-p, --port <number>', 'port to listen on', '3001')
    .parse(process.argv);

const options = program.opts();
const port = parseInt(options.port, 10);

// Main entry: Bootstrap first, then start server
(async () => {
    try {
        // Bootstrap MUST complete before server starts
        const result = await bootstrap();

        // Ensure sessions directory exists
        await fs.ensureDir(SESSIONS_PATH);

        // Start the server
        await startServer(result, port);
    } catch (err) {
        if (err instanceof RunnerError) {
            // Error already logged by bootstrap
            process.exit(1);
        }
        console.error(chalk.red('Fatal error:'), err);
        process.exit(1);
    }
})();
