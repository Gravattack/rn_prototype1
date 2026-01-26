import { exec } from 'child_process';
import { promisify } from 'util';
import { RunnerError } from './errors';

const execAsync = promisify(exec);

export interface Device {
    name: string;
    udid: string;
    state: string;
}

export class SimulatorController {
    async checkXcode(): Promise<void> {
        try {
            await execAsync('xcode-select -p');
        } catch (e) {
            throw new RunnerError(
                'XCODE_NOT_INSTALLED',
                'Xcode is not installed',
                'Install Xcode from the App Store'
            );
        }
    }

    async listDevices(): Promise<Device[]> {
        await this.checkXcode();
        try {
            const { stdout } = await execAsync('xcrun simctl list devices --json');
            const data = JSON.parse(stdout);
            const devices: Device[] = [];

            for (const runtime in data.devices) {
                if (runtime.includes('iOS')) {
                    // Filter out unavailable devices
                    const runtimeDevices = data.devices[runtime].filter((d: any) => d.isAvailable !== false);
                    devices.push(...runtimeDevices);
                }
            }
            return devices;
        } catch (e) {
            if (e instanceof RunnerError) throw e;
            throw new RunnerError('INTERNAL_ERROR', 'Failed to list simulators', 'Ensure Xcode is correctly installed');
        }
    }

    async getBootedDevice(): Promise<Device | null> {
        const devices = await this.listDevices();
        return devices.find(d => d.state === 'Booted') || null;
    }

    async ensureSimulatorReady(): Promise<Device> {
        await this.checkXcode();

        // 1. Check if ANY device is already booted
        const booted = await this.getBootedDevice();
        if (booted) {
            return booted;
        }

        // 2. If none booted, pick a candidate
        const devices = await this.listDevices();
        if (devices.length === 0) {
            throw new RunnerError(
                'SIM_NOT_FOUND',
                'No iOS Simulator found',
                'Open Xcode → Settings → Platforms → iOS'
            );
        }

        // Prefer iPhone over others, pick the first one
        const candidate = devices.find(d => d.name.toLowerCase().includes('iphone')) || devices[0];

        // 3. Boot it
        await this.boot(candidate.udid);

        // 4. Wait for boot to complete fully
        // xcrun simctl bootstatus <udid> -b waits until the device is booted
        try {
            await execAsync(`xcrun simctl bootstatus ${candidate.udid} -b`);
        } catch (e) {
            console.error('Boot status check failed:', e);
            // We'll still return the candidate and let the app launch attempt handle it
        }

        return candidate;
    }

    async boot(udid: string): Promise<void> {
        await execAsync(`xcrun simctl boot ${udid}`).catch(err => {
            // Ignore if already booted
            if (!err.message.includes('Unable to boot device in current state')) {
                throw new RunnerError('SIM_BOOT_FAILED', `Failed to boot simulator: ${err.message}`);
            }
        });
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

    async reload(): Promise<void> {
        // This is tricky via simctl, usually handled via Metro/WebSocket
        // But we can trigger a shake gesture or similar if needed
    }

    async shutdown(udid: string): Promise<void> {
        await execAsync(`xcrun simctl shutdown ${udid}`).catch(() => { });
    }
}
