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
            // Disable semantic validation (keep syntax checking only)
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: false,
            });
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: false,
            });

            // React Native compiler options
            const compilerOptions = {
              jsx: monaco.languages.typescript.JsxEmit.React,
              allowJs: true,
              esModuleInterop: true,
              moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
              target: monaco.languages.typescript.ScriptTarget.ESNext,
              module: monaco.languages.typescript.ModuleKind.ESNext,
              skipLibCheck: true,
              allowNonTsExtensions: true,
            };
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);

            // Inject lightweight React Native type stubs
            const typeStubs = `
              declare module 'react-native' {
                export const View: any;
                export const Text: any;
                export const TouchableOpacity: any;
                export const ScrollView: any;
                export const Image: any;
                export const TextInput: any;
                export const StyleSheet: { create: <T>(styles: T) => T };
                export const Dimensions: any;
                export const Platform: any;
                export const Alert: any;
                export const FlatList: any;
                export const SafeAreaView: any;
                export const StatusBar: any;
                export const Pressable: any;
                export const Modal: any;
                export const ActivityIndicator: any;
                export const KeyboardAvoidingView: any;
              }
              declare module 'expo' {
                const expo: any;
                export default expo;
              }
              declare module 'expo-*' {
                const m: any;
                export default m;
                export = m;
              }
              declare module '@expo/*' {
                const m: any;
                export default m;
                export = m;
              }
            `;
            monaco.languages.typescript.typescriptDefaults.addExtraLib(typeStubs, 'react-native.d.ts');
            monaco.languages.typescript.javascriptDefaults.addExtraLib(typeStubs, 'react-native.d.ts');
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
