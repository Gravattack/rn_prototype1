import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform') || 'ios';

        let command = '';

        if (platform === 'ios') {
            // Capture screenshot from the booted simulator to stdout
            // Note: This requires Xcode Command Line Tools installed and a simulator running
            command = 'xcrun simctl io booted screenshot --type=png -';
        } else {
            return NextResponse.json({ error: 'Android not yet supported' }, { status: 400 });
        }

        // Increase max buffer for images
        const { stdout, stderr } = await execAsync(command, { encoding: 'buffer', maxBuffer: 10 * 1024 * 1024 });

        if (stderr && stderr.length > 0) {
            // xcrun sometimes outputs warnings to stderr even on success, 
            // but if stdout is empty, it's a real error.
            if (stdout.length === 0) {
                console.error('[Screenshot API] Error:', stderr.toString());
                return NextResponse.json({ error: 'Failed to capture screenshot. Is a simulator running?' }, { status: 500 });
            } else {
                console.warn('[Screenshot API] Warning:', stderr.toString());
            }
        }

        return new NextResponse(stdout, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });

    } catch (error) {
        console.error('Screenshot API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
