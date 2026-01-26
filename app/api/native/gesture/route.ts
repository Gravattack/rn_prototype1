import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, x, y, x1, y1, x2, y2 } = body;

        let command = '';

        console.log(`[Gesture API] Action: ${action}, Params:`, { x, y, x1, y1, x2, y2 });

        if (action === 'tap') {
            command = `xcrun simctl io booted tap ${Math.round(x)} ${Math.round(y)}`;
        } else if (action === 'swipe') {
            command = `xcrun simctl io booted swipe ${Math.round(x1)} ${Math.round(y1)} ${Math.round(x2)} ${Math.round(y2)}`;
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        console.log(`[Gesture API] Executing: ${command}`);
        const { stderr } = await execAsync(command);

        if (stderr && stderr.trim().length > 0) {
            console.warn('[Gesture API] Warning/Stderr:', stderr);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Gesture API Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message || String(error),
            stderr: error.stderr || null
        }, { status: 500 });
    }
}
