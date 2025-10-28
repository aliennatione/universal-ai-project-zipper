import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ParsedFile, AISuggestion } from '../types';
import { FolderIcon, FileIcon, DownloadIcon, SaveIcon, AddIcon, DeleteIcon, EditIcon, SparklesIcon, GitHubIcon } from './icons';
import { AIActionPanel } from './AIActionPanel';
import { SuggestionModal } from './SuggestionModal';
import { DiffView } from './DiffView';
import { useAppContext } from '../contexts/AppContext';

declare var JSZip: any;

// --- EDITOR COMPONENTS ---

interface FileTreeProps {
    files: ParsedFile[];
    onFileSelect: (path: string) => void;
    selectedFile: string | null;
    onAddFile: (path: string) => void;
    onDeleteFile: (path: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, onFileSelect, selectedFile, onAddFile, onDeleteFile }) => {
    const [isAddingFile, setIsAddingFile] = useState(false);
    const [newFilePath, setNewFilePath] = useState('');
    const { t } = useAppContext();

    const handleAddFileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFilePath.trim()) {
            onAddFile(newFilePath.trim());
            setNewFilePath('');
            setIsAddingFile(false);
        }
    };
    
    const fileTree = useMemo(() => {
        const root: any = {};
        [...files].sort((a,b) => a.path.localeCompare(b.path)).forEach(file => {
            const parts = file.path.split('/');
            let currentLevel = root;
            parts.forEach((part, index) => {
                if (!currentLevel[part]) currentLevel[part] = {};
                if (index === parts.length - 1) currentLevel[part].isFile = true;
                currentLevel = currentLevel[part];
            });
        });
        return root;
    }, [files]);
    
    const renderTree = (node: any, level = 0, pathPrefix = ''): React.ReactNode[] => {
        return Object.keys(node).sort((a, b) => {
            const aIsFile = !!node[a].isFile; const bIsFile = !!node[b].isFile;
            if (aIsFile && !bIsFile) return 1; if (!aIsFile && bIsFile) return -1;
            return a.localeCompare(b);
        }).map(key => {
            if (key === 'isFile') return null;
            const fullPath = pathPrefix ? `${pathPrefix}/${key}` : key;
            const isFile = node[key].isFile;
            const isSelected = isFile && fullPath === selectedFile;
            
            return (
                <div key={fullPath}>
                    <div className={`group flex items-center justify-between py-1 text-sm rounded-md px-2 transition-colors ${isFile ? 'cursor-pointer hover:bg-tertiary dark:hover:bg-dark-tertiary' : ''} ${isSelected ? 'bg-accent dark:bg-dark-accent text-accent-text dark:text-dark-accent-text font-semibold' : ''}`}
                        style={{ paddingLeft: `${level * 20}px` }}
                        onClick={isFile ? () => onFileSelect(fullPath) : undefined}
                    >
                        <div className="flex items-center truncate">
                            {isFile ? <FileIcon /> : <FolderIcon />}
                            <span className="truncate">{key}</span>
                        </div>
                        {isFile && (
                            <button onClick={(e) => { e.stopPropagation(); onDeleteFile(fullPath); }} className="p-1 rounded-md hover:bg-danger/50 dark:hover:bg-dark-danger/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DeleteIcon />
                            </button>
                        )}
                    </div>
                    {!isFile && <div className="w-full mt-1">{renderTree(node[key], level + 1, fullPath)}</div>}
                </div>
            );
        });
    };

    return (
      <div className="w-full bg-secondary dark:bg-dark-secondary p-4 rounded-lg border border-border-color dark:border-dark-border-color h-full overflow-y-auto flex flex-col">
        <div className="flex-grow overflow-y-auto">
            {isAddingFile && (
                <form onSubmit={handleAddFileSubmit} className="mb-4 flex gap-2">
                    <input type="text" value={newFilePath} onChange={(e) => setNewFilePath(e.target.value)} placeholder={t('fileTree.newFilePlaceholder')} className="flex-grow bg-primary dark:bg-dark-primary border border-border-color dark:border-dark-border-color rounded-md px-2 py-1 text-xs focus:ring-accent focus:border-accent" autoFocus />
                    <button type="submit" className="px-2 py-1 bg-accent text-accent-text text-xs font-semibold rounded-md hover:bg-accent-hover">{t('fileTree.add')}</button>
                </form>
            )}
            {renderTree(fileTree)}
        </div>
        <div className="mt-4 pt-4 border-t border-border-color dark:border-dark-border-color flex-shrink-0">
             <button onClick={() => setIsAddingFile(prev => !prev)} className="w-full flex items-center justify-center px-2 py-2 bg-tertiary dark:bg-dark-tertiary hover:bg-border-color dark:hover:bg-dark-border-color text-sm font-semibold rounded-md transition-colors">
                <AddIcon /> <span className="ml-2">{t('fileTree.addNewFile')}</span>
            </button>
        </div>
      </div>
    );
};

interface FileEditorProps {
    file: ParsedFile | null;
    onSave: (path: string, content: string) => void;
    content: string;
    setContent: (content: string) => void;
    isDirty: boolean;
    setIsDirty: (isDirty: boolean) => void;
}

const FileEditor: React.FC<FileEditorProps> = ({ file, onSave, content, setContent, isDirty, setIsDirty }) => {
    const { t } = useAppContext();

    const handleSave = () => {
        if (file) {
            onSave(file.path, content);
            setIsDirty(false);
        }
    };

    if (!file) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-secondary dark:bg-dark-secondary p-6 rounded-lg border-2 border-dashed border-border-color dark:border-dark-border-color text-secondary-text dark:text-dark-secondary-text">
                <p className="font-semibold text-lg">{t('fileEditor.selectFile')}</p>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full flex flex-col bg-secondary dark:bg-dark-secondary rounded-lg border border-border-color dark:border-dark-border-color">
            <div className="flex justify-between items-center p-3 bg-tertiary/50 dark:bg-dark-tertiary/50 border-b border-border-color dark:border-dark-border-color flex-shrink-0 flex-wrap gap-2">
                <span className="font-mono text-sm text-accent dark:text-dark-accent truncate" title={file.path}>{file.path}</span>
                 <div className="flex items-center gap-2">
                    <button onClick={handleSave} disabled={!isDirty} className="px-3 py-1 bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold rounded-md transition-colors flex items-center gap-2 disabled:bg-secondary-text dark:disabled:bg-dark-secondary-text disabled:cursor-not-allowed">
                        <SaveIcon />
                        {isDirty ? t('fileEditor.saveChanges') : t('fileEditor.saved')}
                    </button>
                 </div>
            </div>
            <textarea
                value={content}
                onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
                className="w-full h-full p-4 text-sm font-mono overflow-auto flex-grow bg-primary dark:bg-dark-primary text-primary-text dark:text-dark-primary-text rounded-b-lg focus:ring-1 focus:ring-accent dark:focus:ring-dark-accent focus:outline-none"
                aria-label={t('fileEditor.editingAria', file.path)}
            />
        </div>
    );
};

interface EditorViewProps {
    projectName: string;
    setProjectName: (name: string) => void;
    parsedFiles: ParsedFile[];
    setParsedFiles: React.Dispatch<React.SetStateAction<ParsedFile[]>>;
    selectedFilePath: string | null;
    onFileSelect: (path: string | null) => void;
    onStartOver: () => void;
    onRefactorRequest: () => Promise<void>;
    onSuggestName: () => Promise<void>;
    onFindFiles: () => Promise<void>;
    onGenerateTests: (filePath: string) => Promise<ParsedFile | null>;
    onImproveReadme: () => Promise<void>;
    onAddDocstrings: () => Promise<void>;
    onGenerateWiki: () => Promise<void>;
    onCodeReviewRequest: () => Promise<void>;
    onGitHubExportRequest: () => void;
    suggestions: AISuggestion[];
    setSuggestions: React.Dispatch<React.SetStateAction<AISuggestion[]>>;
    isSuggestionModalOpen: boolean;
    setIsSuggestionModalOpen: (isOpen: boolean) => void;
    editorContent: string;
    setEditorContent: (content: string) => void;
    isEditorDirty: boolean;
    setIsEditorDirty: (isDirty: boolean) => void;
    diffData: { path: string; original: string; modified: string; } | null;
    onAcceptDiff: (path: string, content: string) => void;
    onRejectDiff: () => void;
}

export const EditorView: React.FC<EditorViewProps> = (props) => {
    const [mobileView, setMobileView] = useState<'files' | 'editor' | 'ai'>('files');
    const { t, appSettings } = useAppContext();
    const isGitHubEnabled = !!appSettings.githubPat;
    
    const handleDownloadZip = useCallback(async () => {
        if (props.parsedFiles.length === 0) return;
        const zip = new JSZip();
        props.parsedFiles.forEach(f => zip.file(f.path, f.content));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${props.projectName}.zip`;
        a.click();
        URL.revokeObjectURL(url);
    }, [props.parsedFiles, props.projectName]);

    const handleSaveFile = (path: string, content: string) => {
        props.setParsedFiles(currentFiles => currentFiles.map(f => f.path === path ? { ...f, content } : f));
    };
      
    const handleAddFile = (path: string) => {
        if (!path || props.parsedFiles.some(f => f.path === path)) {
            alert(t('fileTree.invalidPath'));
            return;
        }
        props.setParsedFiles(current => [...current, { path, content: '' }]);
        props.onFileSelect(path);
    };
      
    const handleDeleteFile = (path: string) => {
        if (confirm(t('fileTree.deleteConfirmation', path))) {
            props.setParsedFiles(current => current.filter(f => f.path !== path));
            if (props.selectedFilePath === path) props.onFileSelect(null);
        }
    };
    
    const handleMobileFileSelect = (path: string) => {
        props.onFileSelect(path);
        setMobileView('editor');
    };
      
    const selectedFile = props.parsedFiles.find(f => f.path === props.selectedFilePath) || null;
    const isDiffVisible = props.diffData && props.diffData.path === selectedFile?.path;
    
    return (
        <div className="w-full flex flex-col flex-grow min-h-0">
            <SuggestionModal 
                isOpen={props.isSuggestionModalOpen}
                onClose={() => props.setIsSuggestionModalOpen(false)}
                suggestions={props.suggestions}
                setSuggestions={props.setSuggestions}
                onAccept={(acceptedFiles) => {
                    props.setParsedFiles(current => [...current, ...acceptedFiles]);
                    props.setIsSuggestionModalOpen(false);
                }}
            />
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4 flex-shrink-0">
                <input
                    type="text"
                    value={props.projectName}
                    onChange={(e) => props.setProjectName(e.target.value)}
                    className="text-2xl font-bold bg-transparent focus:bg-tertiary dark:focus:bg-dark-tertiary p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <div className="flex items-center gap-3">
                    <button onClick={props.onStartOver} className="px-4 py-2 text-sm text-secondary-text dark:text-dark-secondary-text hover:text-primary-text dark:hover:text-dark-primary-text hover:bg-tertiary dark:hover:bg-dark-tertiary rounded-lg transition-colors">
                        {t('startOver')}
                    </button>
                    <button onClick={props.onGitHubExportRequest} disabled={!isGitHubEnabled} title={!isGitHubEnabled ? t('githubExport.disabledTooltip') : t('githubExport.tooltip')} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary dark:bg-dark-secondary border border-border-color dark:border-dark-border-color text-primary-text dark:text-dark-primary-text font-bold rounded-lg transition-colors hover:bg-tertiary dark:hover:bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed">
                        <GitHubIcon /> {t('githubExport.button')}
                    </button>
                    <button onClick={handleDownloadZip} className="inline-flex items-center justify-center px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-transform transform hover:scale-105">
                       <DownloadIcon /> {t('downloadProject')}
                    </button>
                </div>
            </div>

            {/* Main Content Area: Switches between Desktop Grid and Mobile Tabbed View */}
            <div className="w-full flex-grow min-h-0">

                {/* --- Desktop View --- */}
                <div className="hidden md:grid md:grid-cols-12 items-start gap-6 w-full h-full">
                    {/* File Tree - Left Panel */}
                    <div className="w-full h-full md:col-span-3 min-h-0">
                        <FileTree
                            files={props.parsedFiles}
                            selectedFile={props.selectedFilePath}
                            onFileSelect={props.onFileSelect}
                            onAddFile={handleAddFile}
                            onDeleteFile={handleDeleteFile}
                        />
                    </div>

                    {/* Editor/Diff - Center Panel */}
                    <div className="w-full h-full md:col-span-6 min-h-0">
                        {isDiffVisible ? (
                            <DiffView
                                original={props.diffData.original}
                                modified={props.diffData.modified}
                                filePath={props.diffData.path}
                                onAccept={() => props.onAcceptDiff(props.diffData.path, props.diffData.modified)}
                                onReject={props.onRejectDiff}
                            />
                        ) : (
                             <FileEditor
                                file={selectedFile}
                                onSave={handleSaveFile}
                                content={props.editorContent}
                                setContent={props.setEditorContent}
                                isDirty={props.isEditorDirty}
                                setIsDirty={props.setIsEditorDirty}
                            />
                        )}
                    </div>
                    
                    {/* AI Panel - Right Panel */}
                    <div className="w-full h-full md:col-span-3 min-h-0">
                        <AIActionPanel
                            selectedFile={selectedFile}
                            onSuggestName={props.onSuggestName}
                            onFindFiles={props.onFindFiles}
                            onGenerateTests={props.onGenerateTests}
                            onImproveReadme={props.onImproveReadme}
                            onRefactor={props.onRefactorRequest}
                            onAddDocstrings={props.onAddDocstrings}
                            onGenerateWiki={props.onGenerateWiki}
                            onCodeReview={props.onCodeReviewRequest}
                        />
                    </div>
                </div>

                {/* --- Mobile Tabbed View --- */}
                <div className="md:hidden flex flex-col h-full">
                    <div className="flex-grow min-h-0">
                        {mobileView === 'files' && (
                            <FileTree 
                                files={props.parsedFiles} 
                                selectedFile={props.selectedFilePath} 
                                onFileSelect={handleMobileFileSelect}
                                onAddFile={handleAddFile}
                                onDeleteFile={handleDeleteFile}
                            />
                        )}
                        {mobileView === 'editor' && (
                            isDiffVisible ? (
                                <DiffView
                                    original={props.diffData.original}
                                    modified={props.diffData.modified}
                                    filePath={props.diffData.path}
                                    onAccept={() => props.onAcceptDiff(props.diffData.path, props.diffData.modified)}
                                    onReject={props.onRejectDiff}
                                />
                            ) : (
                                 <FileEditor 
                                    file={selectedFile}
                                    onSave={handleSaveFile}
                                    content={props.editorContent}
                                    setContent={props.setEditorContent}
                                    isDirty={props.isEditorDirty}
                                    setIsDirty={props.setIsEditorDirty}
                                />
                            )
                        )}
                        {mobileView === 'ai' && (
                             <AIActionPanel
                                selectedFile={selectedFile}
                                onSuggestName={props.onSuggestName}
                                onFindFiles={props.onFindFiles}
                                onGenerateTests={props.onGenerateTests}
                                onImproveReadme={props.onImproveReadme}
                                onRefactor={props.onRefactorRequest}
                                onAddDocstrings={props.onAddDocstrings}
                                onGenerateWiki={props.onGenerateWiki}
                                onCodeReview={props.onCodeReviewRequest}
                            />
                        )}
                    </div>
                    
                    {/* Tab Bar */}
                    <div className="flex-shrink-0 grid grid-cols-3 gap-2 p-2 bg-secondary dark:bg-dark-secondary border-t border-border-color dark:border-dark-border-color mt-2 rounded-lg">
                        <button onClick={() => setMobileView('files')} className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${mobileView === 'files' ? 'text-accent dark:text-dark-accent bg-accent/10 dark:bg-dark-accent/10' : 'text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary'}`}>
                            <FileIcon className="h-6 w-6" />
                            <span className="text-xs mt-1">{t('mobileTabs.files')}</span>
                        </button>
                         <button onClick={() => setMobileView('editor')} className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${mobileView === 'editor' ? 'text-accent dark:text-dark-accent bg-accent/10 dark:bg-dark-accent/10' : 'text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary'}`}>
                            <EditIcon className="h-6 w-6" />
                            <span className="text-xs mt-1">{t('mobileTabs.editor')}</span>
                        </button>
                        <button onClick={() => setMobileView('ai')} className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${mobileView === 'ai' ? 'text-accent dark:text-dark-accent bg-accent/10 dark:bg-dark-accent/10' : 'text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary'}`}>
                            <SparklesIcon className="h-6 w-6" />
                            <span className="text-xs mt-1">{t('mobileTabs.ai')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};