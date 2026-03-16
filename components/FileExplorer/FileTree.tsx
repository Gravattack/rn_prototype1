'use client';

import { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Plus, FolderPlus, Trash2 } from 'lucide-react';

interface FileTreeProps {
    files: Record<string, string>;
    activeFile: string;
    onSelect: (filename: string) => void;
    onCreateFile: (path: string, content?: string) => void;
    onDeleteFile: (path: string) => void;
    onRenameFile: (oldPath: string, newPath: string) => void;
}

interface FileNode {
    name: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    path: string;
}

function buildFileTree(files: Record<string, string>): FileNode[] {
    const root: FileNode[] = [];

    Object.keys(files).forEach(fullPath => {
        const parts = fullPath.split('/');
        let currentLevel = root;

        parts.forEach((part, index) => {
            const pathSoFar = parts.slice(0, index + 1).join('/');
            const isLast = index === parts.length - 1;
            let node = currentLevel.find(n => n.name === part);

            if (!node) {
                node = {
                    name: part,
                    type: isLast ? 'file' : 'folder',
                    path: pathSoFar,
                    children: isLast ? undefined : []
                };
                currentLevel.push(node);
            }
            if (node.children) {
                currentLevel = node.children;
            }
        });
    });

    const sortNodes = (nodes: FileNode[]) => {
        nodes.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        nodes.forEach(n => n.children && sortNodes(n.children));
    };
    sortNodes(root);

    return root;
}

function FileTreeNode({
    node,
    depth = 0,
    activeFile,
    onSelect,
    onDelete,
    onRename
}: {
    node: FileNode;
    depth?: number;
    activeFile: string;
    onSelect: (path: string) => void;
    onDelete: (path: string) => void;
    onRename: (path: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const isActive = node.path === activeFile;

    return (
        <div className="group">
            <div
                className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''
                    }`}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
                onClick={() => node.type === 'folder' ? setIsOpen(!isOpen) : onSelect(node.path)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {node.type === 'folder' ? (
                        <>
                            {isOpen ? (
                                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                            )}
                            <Folder className="h-3.5 w-3.5 text-blue-500 flex-none" />
                        </>
                    ) : (
                        <>
                            <div className="w-3.5" />
                            <File className="h-3.5 w-3.5 text-gray-500 flex-none" />
                        </>
                    )}
                    <span className={`truncate text-sm ${isActive ? 'font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                        {node.name}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(node.path); }}
                        className="rounded p-0.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </div>
            {node.type === 'folder' && isOpen && node.children && (
                <div>
                    {node.children.map((child, index) => (
                        <FileTreeNode
                            key={`${child.path}-${index}`}
                            node={child}
                            depth={depth + 1}
                            activeFile={activeFile}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            onRename={onRename}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function FileTree({
    files,
    activeFile,
    onSelect,
    onCreateFile,
    onDeleteFile,
    onRenameFile
}: FileTreeProps) {
    const fileNodes = buildFileTree(files);
    const [isCreating, setIsCreating] = useState(false);
    const [createType, setCreateType] = useState<'file' | 'folder'>('file');
    const [newName, setNewName] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            if (createType === 'folder') {
                // Create a placeholder file inside the folder
                onCreateFile(`${newName.trim()}/.gitkeep`, '');
            } else {
                onCreateFile(newName.trim());
            }
            setNewName('');
            setIsCreating(false);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-800">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Explorer
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => { setIsCreating(true); setCreateType('file'); }}
                        className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        title="New File"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => { setIsCreating(true); setCreateType('folder'); }}
                        className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        title="New Folder"
                    >
                        <FolderPlus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto py-2">
                {isCreating && (
                    <div className="px-4 py-1">
                        <form onSubmit={handleCreate}>
                            <input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={() => !newName && setIsCreating(false)}
                                className="w-full rounded border border-blue-500 bg-white px-2 py-0.5 text-sm dark:bg-gray-900"
                                placeholder={createType === 'folder' ? 'folder-name' : 'filename.jsx'}
                            />
                        </form>
                    </div>
                )}

                {fileNodes.map((node, index) => (
                    <FileTreeNode
                        key={`${node.path}-${index}`}
                        node={node}
                        activeFile={activeFile}
                        onSelect={onSelect}
                        onDelete={onDeleteFile}
                        onRename={(path) => onRenameFile(path, path)}
                    />
                ))}
            </div>
        </div>
    );
}
