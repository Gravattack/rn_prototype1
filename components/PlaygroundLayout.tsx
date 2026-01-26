'use client';

import { usePlayground } from '@/lib/state/usePlayground';
import { templates } from '@/lib/templates';
import FileTree from '@/components/FileExplorer/FileTree';
import CodeEditor from '@/components/Editor/CodeEditor';
import PreviewPane from '@/components/Preview/PreviewPane';
import ConsolePanel from '@/components/Console/ConsolePanel';
import { FileCode, Play, Settings, ChevronDown, Share2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { compressToUrl } from '@/lib/persistence/storage';

import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';

export default function PlaygroundLayout() {
    const playground = usePlayground();
    const [showTemplates, setShowTemplates] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    }, []);

    const handleShare = async () => {
        const compressed = compressToUrl(playground.files);
        const url = `${window.location.origin}${window.location.pathname}?code=${compressed}`;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for insecure contexts or older browsers
                const textArea = document.createElement("textarea");
                textArea.value = url;

                // Ensure it's not visible but part of the DOM
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);

                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                }

                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                    <FileCode className="h-6 w-6 text-blue-600" />
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                        RN Playground
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* Template Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <span>Templates</span>
                            <ChevronDown className="h-4 w-4" />
                        </button>

                        {showTemplates && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowTemplates(false)}
                                />

                                {/* Dropdown */}
                                <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                    {templates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => {
                                                playground.loadTemplate(template.id);
                                                setShowTemplates(false);
                                            }}
                                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <template.icon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {template.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {template.description}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex h-8 w-px bg-gray-200 dark:bg-gray-800 mx-2" />

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        title="Copy sharable URL"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="h-4 w-4" />
                                <span>Share</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={playground.runCode}
                        disabled={playground.isRunning}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Play className="h-4 w-4" />
                        {playground.isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Main Content - Resizable panels */}
            <div className="flex-1 overflow-hidden min-h-0">
                <PanelGroup orientation="horizontal">
                    {/* File Explorer Panel */}
                    <Panel defaultSize={20} minSize={15}>
                        <div className="h-full overflow-auto border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            <FileTree
                                files={playground.files}
                                activeFile={playground.activeFile}
                                onSelect={playground.selectFile}
                                onCreateFile={playground.createFile}
                                onDeleteFile={playground.deleteFile}
                                onRenameFile={playground.renameFile}
                            />
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-transparent hover:bg-blue-500/30 transition-colors cursor-col-resize" />

                    {/* Editor + Console Panel */}
                    <Panel defaultSize={50} minSize={30}>
                        <PanelGroup orientation="vertical">
                            <Panel defaultSize={70} minSize={20}>
                                <div className="h-full overflow-hidden">
                                    <CodeEditor
                                        activeFile={playground.activeFile}
                                        openFiles={playground.openFiles}
                                        dirtyFiles={playground.dirtyFiles}
                                        value={playground.files[playground.activeFile] || ''}
                                        onChange={(value) => playground.updateFile(playground.activeFile, value || '')}
                                        onSelectFile={playground.selectFile}
                                        onCloseFile={playground.closeFile}
                                    />
                                </div>
                            </Panel>

                            <PanelResizeHandle className="h-1 bg-transparent hover:bg-blue-500/30 transition-colors cursor-row-resize" />

                            <Panel defaultSize={30} minSize={10}>
                                <div className="h-full overflow-hidden border-t border-gray-200 dark:border-gray-800">
                                    <ConsolePanel
                                        messages={playground.consoleMessages}
                                        onClear={playground.clearConsole}
                                    />
                                </div>
                            </Panel>
                        </PanelGroup>
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-transparent hover:bg-blue-500/30 transition-colors cursor-col-resize" />

                    {/* Preview Panel */}
                    <Panel defaultSize={30} minSize={20}>
                        <div className="h-full overflow-hidden border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            <PreviewPane iframeContent={playground.iframeContent} />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}
