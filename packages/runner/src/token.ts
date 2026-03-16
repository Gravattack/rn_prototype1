import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const BASE_PATH = path.join(os.homedir(), '.rn-playground');
const TOKEN_FILE = path.join(BASE_PATH, 'token');

/**
 * Rotates the authentication token on every runner start.
 * Per spec: Token must change on each restart for security.
 */
export async function rotateToken(): Promise<string> {
    await fs.ensureDir(BASE_PATH);
    const token = uuidv4();
    await fs.writeFile(TOKEN_FILE, token, 'utf-8');
    return token;
}

/**
 * Gets the current token from disk.
 * Used internally; clients should receive token from terminal output.
 */
export async function getToken(): Promise<string> {
    if (await fs.pathExists(TOKEN_FILE)) {
        return (await fs.readFile(TOKEN_FILE, 'utf-8')).trim();
    }
    // Should not happen if bootstrap ran, but handle gracefully
    return rotateToken();
}
