import chalk from 'chalk';
import { validateEnvironment, ensureExpoCli, checkIOSPlatform } from './env';
import { ensureWorkspace } from './expo-workspace';
import { SimulatorController } from './simulator';
import { rotateToken } from './token';
import { RunnerError } from './errors';

export interface BootstrapResult {
    simulator: { udid: string; name: string };
    workspace: string;
    token: string;
}

/**
 * Executes the mandatory bootstrap sequence before server startup.
 * 
 * Sequence:
 * 1. Environment Validation (macOS, Xcode CLI)
 * 2. iOS Platform Validation (SDK must be installed)
 * 3. Expo CLI Validation (auto-install if missing)
 * 4. Native Workspace Setup (create if missing)
 * 5. iOS Simulator Setup (boot if needed)
 * 6. Token Rotation (new token every start)
 * 
 * The server MUST NOT start if this fails.
 */
export async function bootstrap(): Promise<BootstrapResult> {
    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.cyan.bold('  sim-bridge Bootstrap'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    try {
        // Step 1: Environment Validation
        console.log(chalk.blue('Step 1/6: Validating environment...'));
        await validateEnvironment();

        // Step 2: iOS Platform Validation (MUST have SDK for dev builds)
        console.log(chalk.blue('\nStep 2/6: Checking iOS platform...'));
        await checkIOSPlatform();

        // Step 3: Expo CLI Validation
        console.log(chalk.blue('\nStep 3/6: Checking Expo CLI...'));
        await ensureExpoCli();

        // Step 4: Native Workspace Setup
        console.log(chalk.blue('\nStep 4/6: Preparing native workspace...'));
        const workspace = await ensureWorkspace();

        // Step 5: iOS Simulator Setup
        console.log(chalk.blue('\nStep 5/6: Preparing iOS Simulator...'));
        const sim = new SimulatorController();
        const simulator = await sim.ensureSimulatorReady();

        // Step 6: Token Rotation
        console.log(chalk.blue('\nStep 6/6: Generating security token...'));
        const token = await rotateToken();
        console.log(chalk.green('✓ Token generated (see below)'));

        console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.green.bold('  Bootstrap Complete ✓'));
        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

        return {
            simulator: { udid: simulator.udid, name: simulator.name },
            workspace,
            token
        };
    } catch (error) {
        if (error instanceof RunnerError) {
            console.log(chalk.red('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
            console.log(chalk.red.bold('  Bootstrap Failed'));
            console.log(chalk.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
            console.log(chalk.red(`Error: ${error.message}`));
            if (error.action) {
                console.log(chalk.yellow(`Action: ${error.action}`));
            }
            console.log();
        }
        throw error;
    }
}
