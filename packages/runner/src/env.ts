import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { RunnerError } from './errors';

const execAsync = promisify(exec);

/**
 * Validates that the environment is suitable for running the native orchestrator.
 * Must be macOS with Xcode CLI tools installed.
 */
export async function validateEnvironment(): Promise<void> {
    // 1. Check macOS
    if (process.platform !== 'darwin') {
        throw new RunnerError(
            'MACOS_REQUIRED',
            'sim-bridge requires macOS to run the iOS Simulator.',
            'Run this tool on a Mac with Xcode installed.'
        );
    }

    // 2. Check Xcode Command Line Tools
    try {
        await execAsync('xcode-select -p');
    } catch {
        throw new RunnerError(
            'XCODE_CLI_MISSING',
            'Xcode Command Line Tools are not installed.',
            'Run: xcode-select --install'
        );
    }

    // 3. Check simctl availability
    try {
        await execAsync('xcrun simctl list devices');
    } catch {
        throw new RunnerError(
            'XCODE_CLI_MISSING',
            'xcrun simctl is not available. Xcode may be misconfigured.',
            'Open Xcode, go to Preferences > Locations, and select Command Line Tools.'
        );
    }

    console.log(chalk.green('✓ Environment validated (macOS + Xcode CLI)'));
}

/**
 * Ensures Expo CLI is available. Installs globally if missing.
 */
export async function ensureExpoCli(): Promise<void> {
    try {
        const { stdout } = await execAsync('npx expo --version');
        console.log(chalk.green(`✓ Expo CLI available (v${stdout.trim()})`));
        return;
    } catch {
        // Expo not found, proceed to install
    }

    console.log(chalk.yellow('⚠ Expo CLI not found. Installing globally...'));
    console.log(chalk.gray('  Running: npm install -g expo'));

    try {
        await execAsync('npm install -g expo', { timeout: 120000 }); // 2 min timeout
        console.log(chalk.green('✓ Expo CLI installed successfully'));
    } catch (error: any) {
        throw new RunnerError(
            'EXPO_INSTALL_FAILED',
            `Failed to install Expo CLI: ${error.message}`,
            'Try manually running: npm install -g expo'
        );
    }

    // Verify installation
    try {
        await execAsync('npx expo --version');
    } catch {
        throw new RunnerError(
            'EXPO_INSTALL_FAILED',
            'Expo CLI was installed but is not accessible.',
            'Check your npm global bin path and restart your terminal.'
        );
    }
}

/**
 * Validates that the required iOS platform (SDK) is installed in Xcode.
 * 
 * `expo run:ios` requires native compilation which depends on having
 * the iOS Simulator SDK installed. Without it, xcodebuild fails with code 70.
 * 
 * This check runs BEFORE attempting the build to fail fast and clearly.
 */
export async function checkIOSPlatform(): Promise<void> {
    try {
        const { stdout } = await execAsync('xcodebuild -showsdks');

        // Look for iOS Simulator SDK
        const hasSimulatorSDK = stdout.includes('iphonesimulator');
        const hasIOSSDK = stdout.includes('iphoneos');

        if (!hasSimulatorSDK) {
            throw new RunnerError(
                'IOS_PLATFORM_MISSING',
                'Required iOS Simulator platform is not installed in Xcode.',
                'Open Xcode → Settings → Platforms and install the latest iOS version.'
            );
        }

        if (!hasIOSSDK) {
            console.log(chalk.yellow('⚠ iOS device SDK not found (simulator SDK present)'));
        }

        // Extract version for logging
        const versionMatch = stdout.match(/iphonesimulator(\d+\.\d+)/);
        const version = versionMatch ? versionMatch[1] : 'detected';

        console.log(chalk.green(`✓ iOS Simulator SDK installed (${version})`));
    } catch (error) {
        if (error instanceof RunnerError) throw error;

        throw new RunnerError(
            'IOS_PLATFORM_CHECK_FAILED',
            'Failed to check iOS platform availability.',
            'Ensure Xcode is correctly installed and run: sudo xcode-select -s /Applications/Xcode.app'
        );
    }
}
