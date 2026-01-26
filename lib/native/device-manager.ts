export type DeviceStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface NativeDevice {
    id: string;
    name: string;
    status: DeviceStatus;
}

class DeviceManager {
    private status: DeviceStatus = 'idle';

    async connect(deviceId: string): Promise<boolean> {
        this.status = 'connecting';
        console.log('Connecting to', deviceId);

        // Simulate connection delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate random failure (10% chance) for realism
        if (Math.random() < 0.1) {
            this.status = 'error';
            throw new Error('Failed to connect to device cloud. Please try again.');
        }

        this.status = 'connected';
        return true;
    }

    async disconnect() {
        this.status = 'idle';
    }

    getStatus() {
        return this.status;
    }
}

export const deviceManager = new DeviceManager();
