'use client';

import Editor from '@monaco-editor/react';
import { X } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  activeFile: string;
  openFiles: string[];
  dirtyFiles: string[];
  onSelectFile: (path: string) => void;
  onCloseFile: (path: string) => void;
}

export default function CodeEditor({
  value,
  onChange,
  activeFile,
  openFiles,
  dirtyFiles,
  onSelectFile,
  onCloseFile
}: CodeEditorProps) {
  const language = activeFile.endsWith('.jsx') || activeFile.endsWith('.js') ? 'javascript' : 'typescript';

  return (
    <div className="flex h-full w-full flex-col">
      {/* Tab Bar */}
      <div className="flex h-10 w-full overflow-x-auto border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 scrollbar-hide">
        {openFiles.map((file) => {
          const isActive = file === activeFile;
          const isDirty = dirtyFiles.includes(file);

          return (
            <div
              key={file}
              className={`flex h-full min-w-[120px] max-w-[200px] cursor-pointer items-center justify-between border-r border-gray-200 px-3 text-sm transition-colors dark:border-gray-800 ${isActive
                  ? 'bg-white text-blue-600 dark:bg-gray-800 dark:text-blue-400 font-medium'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              onClick={() => onSelectFile(file)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate">{file}</span>
                {isDirty && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-none" title="Unsaved changes" />
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseFile(file);
                }}
                className={`ml-2 rounded-sm p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 ${isActive ? 'visible' : 'invisible group-hover:visible'
                  }`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          theme="vs-dark"
          beforeMount={(monaco) => {
            // Disable TS validation for JS/JSX files
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: false,
            });
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
              jsx: monaco.languages.typescript.JsxEmit.React,
              allowNonTsExtensions: true,
              target: monaco.languages.typescript.ScriptTarget.ESNext,
            });
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
