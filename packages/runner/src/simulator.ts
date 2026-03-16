import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { RunnerError } from './errors';

const execAsync = promisify(exec);

export interface Device {
    name: string;
    udid: string;
    state: string;
    iosVersion: string; // e.g. "17.2", "18.0"
}

// Module-level state for active simulator
let activeSimulator: Device | null = null;

export class SimulatorController {
    /**
     * Gets the currently cached active simulator.
     * Returns null if no simulator has been booted by this session.
     */
    getActiveSimulator(): Device | null {
        return activeSimulator;
    }

    /**
     * Sets the active simulator (for caching).
     */
    setActiveSimulator(device: Device): void {
        activeSimulator = device;
    }

    async checkXcode(): Promise<void> {
        try {
            await execAsync('xcode-select -p');
        } catch {
            throw new RunnerError(
                'XCODE_NOT_INSTALLED',
                'Xcode is not installed',
                'Install Xcode from the App Store'
            );
        }
    }

    /**
     * Extracts iOS version from runtime string.
     * e.g. "com.apple.CoreSimulator.SimRuntime.iOS-17-2" -> "17.2"
     */
    private parseIOSVersion(runtime: string): string {
        const match = runtime.match(/iOS[- ](\d+)[- ](\d+)/i);
        if (match) {
            return `${match[1]}.${match[2]}`;
        }
        return '0.0';
    }

    /**
     * Compares two iOS version strings.
     * Returns positive if a > b, negative if a < b, 0 if equal.
     */
    private compareVersions(a: string, b: string): number {
        const [aMajor, aMinor] = a.split('.').map(Number);
        const [bMajor, bMinor] = b.split('.').map(Number);
        if (aMajor !== bMajor) return aMajor - bMajor;
        return aMinor - bMinor;
    }

    /**
     * Lists all available iOS simulators with their iOS versions.
     */
    async listDevices(): Promise<Device[]> {
        await this.checkXcode();
        try {
            const { stdout } = await execAsync('xcrun simctl list devices --json');
            const data = JSON.parse(stdout);
            const devices: Device[] = [];

            for (const runtime in data.devices) {
                if (runtime.includes('iOS')) {
                    const iosVersion = this.parseIOSVersion(runtime);
                    const runtimeDevices = data.devices[runtime]
                        .filter((d: any) => d.isAvailable !== false)
                        .map((d: any) => ({
                            name: d.name,
                            udid: d.udid,
                            state: d.state,
                            iosVersion
                        }));
                    devices.push(...runtimeDevices);
                }
            }
            return devices;
        } catch (e) {
            if (e instanceof RunnerError) throw e;
            throw new RunnerError(
                'INTERNAL_ERROR',
                'Failed to list simulators',
                'Ensure Xcode is correctly installed'
            );
        }
    }

    async getBootedDevice(): Promise<Device | null> {
        const devices = await this.listDevices();
        return devices.find((d) => d.state === 'Booted') || null;
    }

    /**
     * Selects the best simulator using deterministic priority:
     * 1. Already booted device (reuse for speed)
     * 2. Latest iOS version
     * 3. Prefer iPhone over other devices
     * 4. First available
     * 
     * Returns UDID, not name.
     */
    async selectBestSimulator(): Promise<Device> {
        const devices = await this.listDevices();

        if (devices.length === 0) {
            throw new RunnerError(
                'SIM_NOT_FOUND',
                'No iOS Simulator found on this machine.',
                'Open Xcode → Settings → Platforms → iOS and download a simulator runtime.'
            );
        }

        // 1. Prefer already booted device
        const booted = devices.find((d) => d.state === 'Booted');
        if (booted) {
            return booted;
        }

        // 2. Sort by iOS version (descending) then by iPhone preference
        const sorted = devices.sort((a, b) => {
            // First by iOS version (higher is better)
            const versionDiff = this.compareVersions(b.iosVersion, a.iosVersion);
            if (versionDiff !== 0) return versionDiff;

            // Then prefer iPhone
            const aIsIphone = a.name.toLowerCase().includes('iphone') ? 1 : 0;
            const bIsIphone = b.name.toLowerCase().includes('iphone') ? 1 : 0;
            return bIsIphone - aIsIphone;
        });

        return sorted[0];
    }

    /**
     * Opens the Simulator.app for more reliable boot behavior.
     */
    async openSimulatorApp(): Promise<void> {
        try {
            await execAsync('open -a Simulator');
        } catch {
            // Non-fatal, simctl boot can work without it
            console.log(chalk.gray('  (Could not open Simulator.app, proceeding with simctl)'));
        }
    }

    /**
     * Waits for a simulator to fully boot with timeout.
     */
    async waitForBoot(udid: string, timeoutMs: number = 60000): Promise<void> {
        const startTime = Date.now();
        const pollInterval = 2000; // 2 seconds

        while (Date.now() - startTime < timeoutMs) {
            try {
                await execAsync(`xcrun simctl bootstatus ${udid} -b`, {
                    timeout: 10000
                });
                // bootstatus -b blocks until booted, so if we get here, it's done
                return;
            } catch {
                // Might fail if still booting, wait and retry
                await new Promise((resolve) => setTimeout(resolve, pollInterval));
            }
        }

        throw new RunnerError(
            'SIMULATOR_TIMEOUT',
            `Simulator ${udid} did not boot within ${timeoutMs / 1000} seconds.`,
            'Try opening Simulator.app manually and ensure Xcode is up to date.'
        );
    }

    /**
     * Ensures a simulator is ready for use.
     * Uses deterministic selection by UDID.
     * Runner is the sole simulator authority.
     */
    async ensureSimulatorReady(): Promise<Device> {
        await this.checkXcode();

        // 1. Select best simulator (deterministic)
        const candidate = await this.selectBestSimulator();

        // 2. If already booted, reuse it
        if (candidate.state === 'Booted') {
            console.log(chalk.green(`✓ Simulator ready (reusing ${candidate.name} [${candidate.udid}])`));
            this.setActiveSimulator(candidate);
            return candidate;
        }

        // 3. Enforce Single Simulator Guarantee
        // Shutdown any other booted simulators to prevent resource drain and confusion
        const bootedDevices = await this.listDevices();
        for (const device of bootedDevices) {
            if (device.state === 'Booted' && device.udid !== candidate.udid) {
                console.log(chalk.gray(`  Shutting down ${device.name}...`));
                await this.shutdown(device.udid);
            }
        }

        // 4. Boot the target simulator
        console.log(chalk.blue(`🚀 Booting simulator: ${candidate.name} (iOS ${candidate.iosVersion})...`));
        await this.boot(candidate.udid);

        // 5. Open Simulator.app (UI only)
        // We do this AFTER booting so it picks up the right one
        await this.openSimulatorApp();

        // 6. Wait for boot to complete
        console.log(chalk.gray('  Waiting for boot to complete...'));
        await this.waitForBoot(candidate.udid, 120000); // 2 min timeout

        console.log(chalk.green(`✓ Simulator booted: ${candidate.name} [${candidate.udid}]`));
        this.setActiveSimulator(candidate);
        return candidate;
    }

    async boot(udid: string): Promise<void> {
        try {
            await execAsync(`xcrun simctl boot ${udid}`);
        } catch (err: any) {
            // Ignore if already booted
            if (!err.message.includes('Unable to boot device in current state')) {
                throw new RunnerError(
                    'SIM_BOOT_FAILED',
                    `Failed to boot simulator: ${err.message}`
                );
            }
        }
    }

    async install(udid: string, appPath: string): Promise<void> {
        await execAsync(`xcrun simctl install ${udid} "${appPath}"`);
    }

    async launch(udid: string, bundleId: string): Promise<void> {
        await execAsync(`xcrun simctl launch ${udid} ${bundleId}`);
    }

    async openUrl(udid: string, url: string): Promise<void> {
        await execAsync(`xcrun simctl openurl ${udid} ${url}`);
    }

    async shutdown(udid: string): Promise<void> {
        await execAsync(`xcrun simctl shutdown ${udid}`).catch(() => { });
    }
}
