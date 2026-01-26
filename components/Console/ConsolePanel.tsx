'use client';

import { useState } from 'react';
import { Terminal, AlertCircle, Info, X } from 'lucide-react';
import type { ConsoleMessage } from '@/lib/bundler/types';

interface ConsolePanelProps {
    messages: ConsoleMessage[];
    onClear: () => void;
}

export default function ConsolePanel({ messages, onClear }: ConsolePanelProps) {
    const [activeTab, setActiveTab] = useState<'console' | 'errors'>('console');

    const filteredMessages =
        activeTab === 'errors'
            ? messages.filter((msg) => msg.level === 'error' || msg.level === 'warn')
            : messages;

    const getLogIcon = (level: ConsoleMessage['level']) => {
        switch (level) {
            case 'error':
            case 'warn':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            default:
                return <Terminal className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
            {/* Console Header */}
            <div className="flex h-10 items-center justify-between border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="flex">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'console'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        onClick={() => setActiveTab('console')}
                    >
                        Console ({messages.length})
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'errors'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        onClick={() => setActiveTab('errors')}
                    >
                        Errors (
                        {messages.filter((m) => m.level === 'error' || m.level === 'warn').length})
                    </button>
                </div>
                <button
                    className="mr-2 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={onClear}
                    title="Clear console"
                >
                    <X className="h-4 w-4 text-gray-500" />
                </button>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-auto p-2 font-mono text-xs">
                {filteredMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-600">
                        No messages
                    </div>
                ) : (
                    filteredMessages.map((log) => (
                        <div
                            key={log.id}
                            className="mb-1 flex items-start gap-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {getLogIcon(log.level)}
                            <span className="flex-1 text-gray-700 dark:text-gray-300">{log.message}</span>
                            <span className="text-gray-400 dark:text-gray-600">
                                {log.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
