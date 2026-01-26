export interface TransformResult {
    code: string;
    imports: string[];
    error: string | null;
}

export interface ConsoleMessage {
    id: string;
    level: 'log' | 'error' | 'warn' | 'info';
    message: string;
    timestamp: Date;
}

export interface FileMap {
    [path: string]: string;
}

export interface PlaygroundState {
    files: FileMap;
    activeFile: string;
    openFiles: string[];
    dirtyFiles: string[];
    consoleMessages: ConsoleMessage[];
    isRunning: boolean;
    error: string | null;
}
