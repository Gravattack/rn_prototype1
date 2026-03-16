'use client';

import { usePlayground } from '@/lib/state/usePlayground';
import { templates } from '@/lib/templates';
import FileTree from '@/components/FileExplorer/FileTree';
import CodeEditor from '@/components/Editor/CodeEditor';
import PreviewPane from '@/components/Preview/PreviewPane';
import ConsolePanel from '@/components/Console/ConsolePanel';
import TopBar from '@/components/TopBar';
import { useState, useEffect } from 'react';
import { compressToUrl } from '@/lib/persistence/storage';

import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';

export default function PlaygroundPage() {
    const playground = usePlayground();
    const [showTemplates, setShowTemplates] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleShare = async () => {
        const compressed = compressToUrl(playground.files);
        const url = `${window.location.origin}/playground?code=${compressed}`;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
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
        <div className="flex h-screen w-screen flex-col overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* TopBar */}
            <TopBar
                onRun={playground.runCode}
                onShare={handleShare}
                isRunning={playground.isRunning}
                copied={copied}
                onToggleTemplates={() => setShowTemplates(!showTemplates)}
            />

            {/* Templates Dropdown */}
            {showTemplates && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowTemplates(false)}
                    />
                    <div
                        className="absolute right-4 top-16 z-20 w-64 rounded-lg border shadow-lg"
                        style={{
                            background: 'var(--surface)',
                            borderColor: 'var(--border)'
                        }}
                    >
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => {
                                    playground.loadTemplate(template.id);
                                    setShowTemplates(false);
                                }}
                                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <template.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                                        {template.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {template.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-hidden min-h-0">
                <PanelGroup orientation="horizontal">
                    {/* File Explorer */}
                    <Panel defaultSize={18} minSize={15}>
                        <div
                            className="h-full overflow-auto border-r"
                            style={{
                                background: 'var(--surface)',
                                borderColor: 'var(--border)'
                            }}
                        >
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

                    {/* Editor + Console */}
                    <Panel defaultSize={48} minSize={30}>
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
                                <div
                                    className="h-full overflow-hidden border-t"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    <ConsolePanel
                                        messages={playground.consoleMessages}
                                        onClear={playground.clearConsole}
                                    />
                                </div>
                            </Panel>
                        </PanelGroup>
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-transparent hover:bg-blue-500/30 transition-colors cursor-col-resize" />

                    {/* Preview */}
                    <Panel defaultSize={34} minSize={20}>
                        <div
                            className="h-full overflow-hidden border-l"
                            style={{
                                background: 'var(--surface)',
                                borderColor: 'var(--border)'
                            }}
                        >
                            <PreviewPane iframeContent={playground.iframeContent} />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}
