export type RunnerErrorCode =
    | 'XCODE_NOT_INSTALLED'
    | 'SIM_NOT_FOUND'
    | 'SIM_BOOT_FAILED'
    | 'SIM_NOT_BOOTED'
    | 'EXPO_NOT_FOUND'
    | 'METRO_CONFLICT'
    | 'AUTH_FAILED'
    | 'SESSION_NOT_FOUND'
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
