import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'No code provided' }, { status: 400 });
        }

        // Path to the native app's App.tsx
        // Since this runs in the Next.js server, we can use absolute paths or relative to process.cwd()
        // process.cwd() is /Users/adityasingh/Documents/playground
        const nativeFilePath = join(process.cwd(), 'apps/native/App.tsx');

        await writeFile(nativeFilePath, code, 'utf-8');

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Sync API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
