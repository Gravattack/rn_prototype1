import LZString from 'lz-string';
import type { FileMap, PlaygroundState } from '../bundler/types';

const STORAGE_KEY = 'rn-playground-session';

export interface PersistedState {
    files: FileMap;
    activeFile: string;
}

/**
 * Compress files into a URL-safe string
 */
export function compressToUrl(files: FileMap): string {
    return LZString.compressToEncodedURIComponent(JSON.stringify(files));
}

/**
 * Decompress files from a URL-safe string
 */
export function decompressFromUrl(compressed: string): FileMap | null {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (!decompressed) return null;
        return JSON.parse(decompressed);
    } catch (e) {
        console.error('Failed to decompress state:', e);
        return null;
    }
}

/**
 * Save current session to localStorage
 */
export function saveSession(state: PlaygroundState): void {
    if (typeof window === 'undefined') return;

    const persisted: PersistedState = {
        files: state.files,
        activeFile: state.activeFile,
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch (e) {
        console.error('Failed to save session:', e);
    }
}

/**
 * Load session from localStorage
 */
export function loadSession(): PersistedState | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to load session:', e);
        return null;
    }
}
