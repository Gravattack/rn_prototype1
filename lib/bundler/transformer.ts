import { transform } from '@babel/standalone';
import type { TransformResult } from './types';
import { loopProtectionPlugin } from './loop-protection';

/**
 * Transform TypeScript/JSX code to JavaScript using Babel
 */
export function transformCode(code: string, filename: string = 'App.jsx'): TransformResult {
    try {
        const imports: string[] = [];

        const result = transform(code, {
            filename,
            presets: [
                ['react', { runtime: 'automatic' }],
                ['typescript', { isTSX: true, allExtensions: true }], // Keep for general JS/JSX support
            ],
            plugins: [
                // Custom plugin to extract imports
                {
                    visitor: {
                        ImportDeclaration(path: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                            imports.push(path.node.source.value);
                        }
                    }
                },
                // Loop protection (2000ms timeout)
                loopProtectionPlugin(2000),
            ],
        });

        if (!result || !result.code) {
            return {
                code: '',
                imports: [],
                error: 'Transform produced no output',
            };
        }

        return {
            code: result.code,
            imports,
            error: null,
        };
    } catch (error) {
        return {
            code: '',
            imports: [],
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
