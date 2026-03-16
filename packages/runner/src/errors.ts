export type RunnerErrorCode =
    | 'MACOS_REQUIRED'
    | 'XCODE_CLI_MISSING'
    | 'EXPO_INSTALL_FAILED'
    | 'WORKSPACE_CORRUPT'
    | 'SIMULATOR_TIMEOUT'
    | 'XCODE_NOT_INSTALLED'
    | 'SIM_NOT_FOUND'
    | 'SIM_BOOT_FAILED'
    | 'SIM_NOT_BOOTED'
    | 'EXPO_NOT_FOUND'
    | 'METRO_CONFLICT'
    | 'AUTH_FAILED'
    | 'SESSION_NOT_FOUND'
    | 'IOS_PLATFORM_MISSING'
    | 'IOS_PLATFORM_CHECK_FAILED'
    | 'INTERNAL_ERROR';

export class RunnerError extends Error {
    constructor(
        public readonly code: RunnerErrorCode,
        public readonly message: string,
        public readonly action?: string
    ) {
        super(message);
        this.name = 'RunnerError';
    }

    toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                action: this.action
            }
        };
    }
}
