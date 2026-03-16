import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { RunnerError } from './errors';

const execAsync = promisify(exec);

const BASE_PATH = path.join(os.homedir(), '.rn-playground');
const WORKSPACE_PATH = path.join(BASE_PATH, 'native');

/**
 * Checks if a workspace directory is valid and usable.
 */
export async function isWorkspaceValid(workspacePath: string): Promise<boolean> {
    const requiredFiles = ['package.json', 'App.tsx'];
    const requiredDirs = ['node_modules'];

    for (const file of requiredFiles) {
        if (!(await fs.pathExists(path.join(workspacePath, file)))) {
            return false;
        }
    }

    for (const dir of requiredDirs) {
        const dirPath = path.join(workspacePath, dir);
        if (!(await fs.pathExists(dirPath))) {
            return false;
        }
        // Check node_modules has content
        if (dir === 'node_modules') {
            const contents = await fs.readdir(dirPath);
            if (contents.length < 5) {
                return false; // Likely incomplete install
            }
        }
    }

    return true;
}

/**
 * Ensures the native workspace exists and is valid.
 * Creates from scratch using create-expo-app if missing or corrupted.
 * 
 * CRITICAL: Always runs `expo prebuild` to ensure ios/ directory is valid
 * and ready for direct xcodebuild.
 */
export async function ensureWorkspace(): Promise<string> {
    await fs.ensureDir(BASE_PATH);

    let workspaceExists = await fs.pathExists(WORKSPACE_PATH);

    // 1. Validate existing workspace
    if (workspaceExists) {
        if (await isWorkspaceValid(WORKSPACE_PATH)) {
            console.log(chalk.green('✓ Native workspace valid (reusing existing)'));
        } else {
            console.log(chalk.yellow('⚠ Existing workspace is corrupted. Recreating...'));
            await fs.remove(WORKSPACE_PATH);
            workspaceExists = false;
        }
    }

    // 2. Create new workspace if needed
    if (!workspaceExists) {
        console.log(chalk.blue('📦 Creating native workspace...'));
        console.log(chalk.gray(`  Location: ${WORKSPACE_PATH}`));

        try {
            // Use create-expo-app with blank template
            await execAsync(
                `npx create-expo-app@latest "${WORKSPACE_PATH}" --template blank-typescript --yes`,
                { timeout: 300000 } // 5 min timeout for npm install
            );
        } catch (error: any) {
            throw new RunnerError(
                'WORKSPACE_CORRUPT',
                `Failed to create native workspace: ${error.message}`,
                'Check your internet connection and verify npm is working.'
            );
        }

        // Verify creation
        if (!(await isWorkspaceValid(WORKSPACE_PATH))) {
            throw new RunnerError(
                'WORKSPACE_CORRUPT',
                'Workspace was created but is incomplete.',
                'Delete ~/.rn-playground/native and restart the runner.'
            );
        }
        console.log(chalk.green('✓ Native workspace created successfully'));
    }

    // 3. Ensure native project generation (Prebuild)
    // We use `expo prebuild` to generate the ios/ directory cleanly.
    // This allows us to use `xcodebuild` directly later.
    const iosPath = path.join(WORKSPACE_PATH, 'ios');
    const podfileLockPath = path.join(iosPath, 'Podfile.lock');

    // Check if we need to prebuild (missing ios/ or missing Pods)
    if (!fs.existsSync(iosPath) || !fs.existsSync(podfileLockPath)) {
        console.log(chalk.blue('⚙️  Generating native iOS project (this may take a minute)...'));
        try {
            await execAsync('npx expo prebuild --platform ios --clean', {
                cwd: WORKSPACE_PATH,
                env: {
                    ...process.env,
                    CI: '1',
                    EXPO_NO_TELEMETRY: '1',
                    EXPO_NO_UPDATE_CHECK: '1'
                }
            });
            console.log(chalk.green('✓ Native iOS project generated'));

            // PATCH: Enforce simulator support in Xcode project
            await patchXcodeProject(iosPath);

        } catch (error: any) {
            throw new RunnerError(
                'WORKSPACE_CORRUPT',
                `Failed to generate native project: ${error.message}`,
                'Check Expo config and try again.'
            );
        }
    } else {
        console.log(chalk.green('✓ Native iOS project ready'));
    }

    return WORKSPACE_PATH;
}

/**
 * Patches the Xcode project file to ensure it supports simulators.
 * Expo prebuild sometimes defaults to iphoneos-only for some configurations.
 */
async function patchXcodeProject(iosPath: string): Promise<void> {
    try {
        const pbxProjPath = path.join(iosPath, 'native.xcodeproj/project.pbxproj');
        if (!fs.existsSync(pbxProjPath)) return;

        let content = await fs.readFile(pbxProjPath, 'utf8');

        // Check if already patched to avoid duplicates if run multiple times
        if (content.includes('SUPPORTED_PLATFORMS = "iphoneos iphonesimulator"')) {
            return;
        }

        console.log(chalk.blue('🔧 Patching Xcode project for simulator support...'));

        // Regex to find buildSettings block start
        // We inject SUPPORTED_PLATFORMS into every buildSettings block
        const buildSettingsRegex = /buildSettings\s*=\s*{/g;

        content = content.replace(buildSettingsRegex, (match) => {
            return `${match}\n\t\t\t\tSUPPORTED_PLATFORMS = "iphoneos iphonesimulator";`;
        });

        await fs.writeFile(pbxProjPath, content, 'utf8');
        console.log(chalk.green('✓ Xcode project patched'));
    } catch (error) {
        console.warn(chalk.yellow('⚠ Failed to patch Xcode project (build might fail):'), error);
    }
}

/**
 * Syncs files from a session to the native workspace.
 * Overwrites app source files only, never touches node_modules.
 */
export async function syncToWorkspace(
    sessionPath: string,
    workspacePath: string = WORKSPACE_PATH
): Promise<void> {
    const files = await fs.readdir(sessionPath);

    for (const file of files) {
        const src = path.join(sessionPath, file);
        const dest = path.join(workspacePath, file);

        // Skip files that would break the native app
        const skipFiles = [
            'package.json',
            'package-lock.json',
            'tsconfig.json',
            'babel.config.js',
            'metro.config.js',
            'app.json',
            'node_modules',
            '.expo'
        ];

        if (skipFiles.includes(file) || file.startsWith('.')) {
            continue;
        }

        const stats = await fs.stat(src);
        if (stats.isFile()) {
            await fs.copy(src, dest, { overwrite: true });
        } else if (stats.isDirectory()) {
            await fs.copy(src, dest, { overwrite: true });
        }
    }
}

export function getWorkspacePath(): string {
    return WORKSPACE_PATH;
}
