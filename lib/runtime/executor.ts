import type { ConsoleMessage } from '../bundler/types';

export interface ExecutorOptions {
  code: string;
  imports: string[];
  onConsole?: (message: ConsoleMessage) => void;
  onError?: (error: string) => void;
  onReady?: () => void;
}

/**
 * Generate iframe srcDoc with user code and dynamic import map
 */
export function generateIframeContent(transformedCode: string, imports: string[] = []): string {
  // Base import map with core dependencies
  const importMap = {
    imports: {
      "react": "https://esm.sh/react@18.2.0",
      "react-dom": "https://esm.sh/react-dom@18.2.0",
      "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
      "react-native-web": "https://esm.sh/react-native-web@0.19.10?deps=react@18.2.0,react-dom@18.2.0",
      "react-native": "https://esm.sh/react-native-web@0.19.10?deps=react@18.2.0,react-dom@18.2.0",
      "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime",
    } as Record<string, string>
  };

  // Add user imports to import map
  imports.forEach(imp => {
    // specific versions can be handled here if needed, defaults to latest on esm.sh
    if (!importMap.imports[imp] && !imp.startsWith('.')) {
      importMap.imports[imp] = `https://esm.sh/${imp}`;
    }
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #ffffff; overflow: auto; }
    #root { width: 100%; height: 100%; background: #ffffff; }
    #error { display: none; padding: 20px; background: #fee; color: #c00; font-family: monospace; white-space: pre-wrap; overflow: auto; height: 100%; }
  </style>
  <!-- Dynamic Import Map -->
  <script type="importmap">
    ${JSON.stringify(importMap, null, 2)}
  </script>
</head>
<body>
  <div id="root"></div>
  <div id="error"></div>
  <script type="text/plain" id="user-code">${transformedCode.replace(/</g, '\\x3c')}</script>

  <script type="module">
    // Expose globals for debug/fallback (optional)
    import * as React from 'react';
    import * as ReactDOM from 'react-dom/client';
    import * as ReactNative from 'react-native-web';
    
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.ReactNative = ReactNative;

    // Console interception
    const originalConsole = { log: console.log, error: console.error, warn: console.warn, info: console.info };
    ['log', 'error', 'warn', 'info'].forEach(level => {
      console[level] = (...args) => {
        originalConsole[level](...args);
        window.parent.postMessage({
          type: 'console',
          level,
          message: args.map(arg => {
            if (arg instanceof Error) return arg.message + '\\n' + arg.stack;
            if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
            return String(arg);
          }).join(' '),
          timestamp: new Date().toISOString(),
        }, '*');
      };
    });

    // Error handling
    window.addEventListener('error', (event) => {
      const errorDiv = document.getElementById('error');
      const rootDiv = document.getElementById('root');
      if (errorDiv && rootDiv) {
        errorDiv.style.display = 'block';
        rootDiv.style.display = 'none';
        errorDiv.textContent = \`Error: \${event.message}\\n\\nFile: \${event.filename}\\nLine: \${event.lineno}:\${event.colno}\`;
      }
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: \`\${event.message} (\${event.filename}:\${event.lineno})\`,
        timestamp: new Date().toISOString(),
      }, '*');
    });

    // API Stubs
    const AsyncStorageStub = {
      getItem: async (key) => {
        try { return localStorage.getItem(key); } catch (e) { return null; }
      },
      setItem: async (key, value) => {
        try { localStorage.setItem(key, value); } catch (e) {}
      },
      removeItem: async (key) => {
        try { localStorage.removeItem(key); } catch (e) {}
      },
      clear: async () => {
        try { localStorage.clear(); } catch (e) {}
      },
      getAllKeys: async () => {
        try { return Object.keys(localStorage); } catch (e) { return []; }
      }
    };
    
    // Inject Stubs into Global Scope (if library depends on global)
    // Note: In ESM, modules shouldn't rely on globals, but some might.
    // For now, libraries relying on 'react-native' package will be redirected by importmap.
    
    window.parent.postMessage({ type: 'ready' }, '*');
    
    // Execute user code
    async function run() {
      try {
        // Read code safely from DOM instead of string interpolation
        const code = document.getElementById('user-code').textContent || '';
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        // Import the blob
        const module = await import(url);
        
        // Render App
        const App = module.default;
        
        if (App) {
          const rootElement = document.getElementById('root');
          const root = ReactDOM.createRoot(rootElement);
          root.render(React.createElement(App));
        }
      } catch (error) {
        console.error('Runtime Error:', error);
        const errorDiv = document.getElementById('error');
        const rootDiv = document.getElementById('root');
        if (errorDiv && rootDiv) {
          errorDiv.style.display = 'block';
          rootDiv.style.display = 'none';
          errorDiv.textContent = 'Runtime Error: ' + (error.message || error);
        }
      }
    }
    
    run();
  </script>
</body>
</html>`;
}
