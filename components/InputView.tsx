import React, { useState, useMemo, useRef } from 'react';
import { examplePrompts } from '../services/prompts';
import { fetchRepoAsZip } from '../services/githubService';
import { processChatFile, processGeminiShareLink } from '../services/projectParser';
import { UploadIcon, FileIcon, SparklesIcon, ChatIcon, ChevronDownIcon, CloseIcon } from './icons';
import { AIPromptConfig, EditablePrompt, Preset, ExamplePrompt, Provider, FileUploadRequest, InputMode } from '../types';
import { ExamplePromptModal } from './ExamplePromptModal';
import { useAppContext } from '../contexts/AppContext';
import { CollapsibleSection } from './common/CollapsibleSection';

/**
 * @file Contiene i componenti per i vari metodi di input dell'utente (upload, GitHub, testo, chat) e la configurazione dell'AI.
 * @module InputView
 */

// --- SOTTO-COMPONENTI PER L'INPUT ---

interface ExamplePromptCardProps {
    prompt: ExamplePrompt;
    onReadMore: () => void;
    onCopy: (content: string) => void;
}

const ExamplePromptCard: React.FC<ExamplePromptCardProps> = ({ prompt, onReadMore, onCopy }) => {
    const { appSettings, t } = useAppContext();
    const { title, content } = prompt[appSettings.globalLanguage];
    const shortContent = useMemo(() => content.substring(0, 150) + '...', [content]);

    return (
        <div className="bg-tertiary dark:bg-dark-tertiary p-4 rounded-lg flex flex-col h-full">
            <h4 className="font-bold text-accent dark:text-dark-accent mb-2">{title}</h4>
            <p className="text-xs flex-grow whitespace-pre-wrap text-secondary-text dark:text-dark-secondary-text">{shortContent}</p>
            <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-border-color/50 dark:border-dark-border-color/50">
                 <button onClick={onReadMore} className="text-xs text-accent dark:text-dark-accent hover:underline font-semibold">
                    {t('readMore')}
                </button>
                <button 
                    onClick={() => onCopy(content)} 
                    className="w-auto text-xs bg-secondary dark:bg-dark-secondary hover:bg-border-color dark:hover:bg-dark-border-color text-primary-text dark:text-dark-primary-text font-bold py-2 px-3 rounded-md transition-colors"
                >
                    {t('copy')}
                </button>
            </div>
        </div>
    );
};

const FileUploader: React.FC<{ onProcessFiles: (files: FileUploadRequest[]) => void; }> = ({ onProcessFiles }) => {
    const [selectedFiles, setSelectedFiles] = useState<FileUploadRequest[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dirInputRef = useRef<HTMLInputElement>(null);
    const { t } = useAppContext();

    const isZipFile = (file: File) => file.type === 'application/zip' || file.name.endsWith('.zip');

    const addFiles = React.useCallback((newFiles: FileList | null) => {
        if (!newFiles) return;
        const items: FileUploadRequest[] = Array.from(newFiles).map(file => ({
            file,
            decompress: isZipFile(file)
        }));
        setSelectedFiles(prev => [...prev, ...items]);
    }, []);

    const handleDrag = React.useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true); else if (e.type === "dragleave") setIsDragging(false); }, []);
    const handleDrop = React.useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); addFiles(e.dataTransfer.files); }, [addFiles]);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(e.target.files);
        e.target.value = '';
    };
    const handleRemoveFile = (indexToRemove: number) => setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    const handleDecompressToggle = (indexToToggle: number, shouldDecompress: boolean) => setSelectedFiles(prev => prev.map((item, index) => index === indexToToggle ? { ...item, decompress: shouldDecompress } : item));
    const handleSubmit = () => { if (selectedFiles.length > 0) onProcessFiles(selectedFiles); };

    if (selectedFiles.length === 0) {
        return (
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors relative ${isDragging ? 'border-accent dark:border-dark-accent bg-tertiary dark:bg-dark-tertiary' : 'border-border-color dark:border-dark-border-color bg-secondary dark:bg-dark-secondary hover:bg-tertiary dark:hover:bg-dark-tertiary'}`}>

                <div className="flex flex-col items-center justify-center text-center p-6" onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon />
                    <p className="mb-2 text-sm"><span className="font-semibold text-accent dark:text-dark-accent">{t('fileUploader.clickToUpload')}</span> {t('fileUploader.dragAndDrop')}</p>
                    <p className="text-xs text-secondary-text">{t('fileUploader.uploadHint')}</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); dirInputRef.current?.click(); }} className="mt-4 px-4 py-2 bg-tertiary dark:bg-dark-tertiary text-sm font-semibold rounded-md border border-border-color dark:border-dark-border-color hover:bg-border-color dark:hover:bg-dark-border-color transition-colors z-10">
                        {t('fileUploader.selectFolder')}
                    </button>
                </div>

                <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} multiple />
                <input ref={dirInputRef} id="directory-picker" type="file" {...{ webkitdirectory: "" }} className="hidden" onChange={handleFileChange} />
            </div>
        );
    }
    
    return (
        <div className="w-full flex flex-col items-center space-y-4 p-4 bg-secondary/80 dark:bg-dark-secondary/80 rounded-lg">
            <div className="w-full max-h-64 h-auto overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {selectedFiles.map((item, index) => (
                    <div key={`${item.file.name}-${item.file.lastModified}-${index}`} className="flex items-center justify-between bg-tertiary dark:bg-dark-tertiary p-2 rounded-md animate-fade-in">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileIcon className="h-5 w-5 text-secondary-text dark:text-dark-secondary-text flex-shrink-0" />
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate text-sm font-medium">{item.file.name}</span>
                                <span className="text-xs text-secondary-text dark:text-dark-secondary-text">{(item.file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                            {isZipFile(item.file) && selectedFiles.length > 1 && (
                                <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none hover:text-accent dark:hover:text-dark-accent">
                                    <input type="checkbox" checked={item.decompress} onChange={e => handleDecompressToggle(index, e.target.checked)} className="h-4 w-4 rounded text-accent dark:text-dark-accent focus:ring-accent bg-primary dark:bg-dark-primary border-border-color dark:border-dark-border-color" />
                                    {t('fileUploader.decompress')}
                                </label>
                            )}
                            <button onClick={() => handleRemoveFile(index)} className="text-secondary-text hover:text-danger dark:hover:text-dark-danger transition-colors" aria-label={`Rimuovi ${item.file.name}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-full flex items-center justify-between pt-4 border-t border-border-color dark:border-dark-border-color">
                <div className="flex items-center gap-2">
                     <button onClick={() => setSelectedFiles([])} className="px-3 py-2 text-sm text-secondary-text hover:text-danger dark:hover:text-dark-danger rounded-md transition-colors">{t('fileUploader.removeAll')}</button>
                     <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 text-sm text-secondary-text hover:text-primary-text hover:bg-tertiary dark:hover:bg-dark-tertiary rounded-md transition-colors">{t('fileUploader.addMore')}</button>
                </div>
                <button onClick={handleSubmit} disabled={selectedFiles.length === 0} className="inline-flex items-center justify-center px-8 py-3 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
                    {t('fileUploader.generateProject')}
                </button>
            </div>
            <input ref={fileInputRef} id="dropzone-file-hidden" type="file" className="hidden" onChange={handleFileChange} multiple />
            <input ref={dirInputRef} id="directory-picker-hidden" type="file" {...{ webkitdirectory: "" }} className="hidden" onChange={handleFileChange} />
        </div>
    );
};

const GitHubUploader: React.FC<{ onProcessFiles: (files: FileUploadRequest[]) => void; }> = ({ onProcessFiles }) => {
    const [repoUrl, setRepoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useAppContext();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;
        setIsLoading(true);
        setError('');
        try {
            const zipFile = await fetchRepoAsZip(repoUrl);
            onProcessFiles([{ file: zipFile, decompress: true }]);
        } catch (err: any) {
            setError(err.message || t('githubUploader.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
            <input
                className="w-full bg-secondary dark:bg-dark-secondary border-2 border-border-color dark:border-dark-border-color rounded-lg p-4 focus:ring-accent dark:focus:ring-dark-accent focus:border-accent dark:focus:border-dark-accent transition-colors placeholder-secondary-text"
                placeholder={t('githubUploader.placeholder')}
                value={repoUrl} 
                onChange={(e) => setRepoUrl(e.target.value)} 
                disabled={isLoading}
            />
            {error && <p className="text-sm text-danger dark:text-dark-danger">{error}</p>}
            <button type="submit" disabled={!repoUrl || isLoading} className="inline-flex items-center justify-center px-8 py-3 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t('githubUploader.fetchAndGenerate')}
            </button>
        </form>
    );
};

const GeminiUploader: React.FC<{ onProcessInput: (content: string) => void; }> = ({ onProcessInput }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useAppContext();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError('');
        try {
            const content = await processChatFile(file);
            onProcessInput(content);
        } catch (err: any) {
            setError(err.message || t('geminiUploader.errorFile'));
            setIsLoading(false);
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shareUrl.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            const content = await processGeminiShareLink(shareUrl);
            onProcessInput(content);
        } catch(err: any) {
            setError(err.message || t('geminiUploader.errorLink'));
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full flex flex-col items-center space-y-6 text-center py-4">
            <h3 className="text-xl font-bold">{t('geminiUploader.title')}</h3>
            <p className="text-sm text-secondary-text max-w-lg">{t('geminiUploader.description')}</p>
            
            {error && <p className="w-full p-2 text-sm bg-danger-bg text-danger dark:bg-dark-danger-bg dark:text-dark-danger rounded-md">{error}</p>}

            {/* Link Uploader */}
            <form onSubmit={handleLinkSubmit} className="w-full flex flex-col sm:flex-row items-center gap-3">
                 <input
                    className="flex-grow w-full bg-tertiary dark:bg-dark-tertiary border border-border-color dark:border-dark-border-color rounded-lg p-3 text-sm focus:ring-accent dark:focus:ring-dark-accent focus:border-accent dark:focus:border-dark-accent transition-colors placeholder-secondary-text"
                    placeholder={t('geminiUploader.linkPlaceholder')}
                    value={shareUrl} 
                    onChange={(e) => setShareUrl(e.target.value)} 
                    disabled={isLoading}
                />
                <button type="submit" disabled={!shareUrl || isLoading} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-accent/90 hover:bg-accent text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? t('geminiUploader.loading') : t('geminiUploader.linkButton')}
                </button>
            </form>

            <div className="relative flex items-center w-full my-2">
                <div className="flex-grow border-t border-border-color dark:border-dark-border-color"></div>
                <span className="flex-shrink mx-4 text-xs text-secondary-text uppercase">{t('geminiUploader.or')}</span>
                <div className="flex-grow border-t border-border-color dark:border-dark-border-color"></div>
            </div>

            {/* File Uploader */}
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-tertiary dark:bg-dark-tertiary border border-border-color dark:border-dark-border-color hover:bg-border-color dark:hover:bg-dark-border-color text-primary-text dark:text-dark-primary-text font-bold rounded-lg transition-colors disabled:opacity-50"
            >
                <UploadIcon className="w-6 h-6 text-current" />
                <span>{t('geminiUploader.uploadButton')}</span>
            </button>
            <input 
                ref={fileInputRef} 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
                accept=".txt,.md"
            />
        </div>
    );
};


const PastedTextInput: React.FC<{ 
    onTextSubmit: (content: string) => void; 
    text: string;
    setText: (value: string) => void;
}> = ({ onTextSubmit, text, setText }) => {
    const { t } = useAppContext();
    return (
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) onTextSubmit(text.trim()); }} className="w-full flex flex-col items-center space-y-4">
            <div className="relative w-full">
                <textarea
                    className="w-full h-64 bg-secondary dark:bg-dark-secondary border-2 border-border-color dark:border-dark-border-color rounded-lg p-4 pr-10 focus:ring-accent dark:focus:ring-dark-accent focus:border-accent dark:focus:border-dark-accent transition-colors placeholder-secondary-text"
                    placeholder={t('pastedTextUploader.placeholder')} 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                />
                {text && (
                    <button 
                        type="button" 
                        onClick={() => setText('')}
                        className="absolute top-3 right-3 p-1 rounded-full text-secondary-text hover:text-primary-text hover:bg-tertiary dark:hover:bg-dark-tertiary transition-colors"
                        aria-label={t('pastedTextUploader.clearText')}
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            <button type="submit" disabled={!text.trim()} className="inline-flex items-center justify-center px-8 py-3 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
                {t('pastedTextUploader.generateProject')}
            </button>
        </form>
    );
};


// --- COMPONENTE PRINCIPALE INPUTVIEW ---

interface InputViewProps {
    onProcessInput: (input: string | FileUploadRequest[]) => void;
    onStartScaffoldingChat: () => void;
    onGoToAISettings: () => void;
    pastedText: string;
    setPastedText: (text: string) => void;
    inputMode: InputMode;
    setInputMode: (mode: InputMode) => void;
}

export const InputView: React.FC<InputViewProps> = (props) => {
    const { onProcessInput, onStartScaffoldingChat, onGoToAISettings, pastedText, setPastedText, inputMode, setInputMode } = props;
    const { t, appSettings } = useAppContext();
    const [modalPrompt, setModalPrompt] = useState<ExamplePrompt | null>(null);

    return (
        <>
            <ExamplePromptModal isOpen={!!modalPrompt} onClose={() => setModalPrompt(null)} prompt={modalPrompt} initialLang={appSettings.globalLanguage} />
            
            <CollapsibleSection
                startOpen={true}
                title={<><h2 className="text-2xl font-bold">{t('startWithTitle')}</h2><p className="text-secondary-text text-sm font-normal mt-1">{t('startWithDescription')}</p></>}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <div className="bg-tertiary dark:bg-dark-tertiary p-6 rounded-lg flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold">{t('newConversationTitle')}</h3>
                            <p className="text-secondary-text text-sm font-normal mt-1 mb-6">{t('newConversationDescription')}</p>
                        </div>
                        <div className="flex w-full justify-center">
                             <button onClick={onStartScaffoldingChat} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent/90 hover:bg-accent text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChatIcon className="h-5 w-5" /> {t('openArchitectChat')}
                             </button>
                        </div>
                    </div>

                    <CollapsibleSection title={<><h3 className="text-xl font-bold">{t('examplePromptsTitle')}</h3><p className="text-secondary-text text-sm font-normal mt-1">{t('examplePromptsDescription')}</p></>}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {examplePrompts.map((p, i) => <ExamplePromptCard key={i} prompt={p} onReadMore={() => setModalPrompt(p)} onCopy={(content) => { setPastedText(content); setInputMode('text'); }} />)}
                        </div>
                    </CollapsibleSection>
                </div>
            </CollapsibleSection>
            
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-6 p-6 bg-secondary/50 dark:bg-dark-secondary/50 border border-border-color dark:border-dark-border-color rounded-lg mt-8">
                <div className="flex justify-center">
                    <div className="inline-flex rounded-md shadow-sm bg-tertiary dark:bg-dark-tertiary p-1">
                        <button onClick={() => setInputMode('upload')} className={`px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${inputMode === 'upload' ? 'bg-accent text-accent-text' : 'hover:bg-tertiary'}`}>{t('uploadFiles')}</button>
                        <button onClick={() => setInputMode('github')} className={`px-4 py-2 text-sm font-medium transition-colors ${inputMode === 'github' ? 'bg-accent text-accent-text' : 'hover:bg-tertiary'}`}>{t('githubRepo')}</button>
                        <button onClick={() => setInputMode('gemini')} className={`px-4 py-2 text-sm font-medium transition-colors ${inputMode === 'gemini' ? 'bg-accent text-accent-text' : 'hover:bg-tertiary'}`}>{t('geminiChat')}</button>
                        <button onClick={() => setInputMode('text')} className={`px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${inputMode === 'text' ? 'bg-accent text-accent-text' : 'hover:bg-tertiary'}`}>{t('pastedText')}</button>
                    </div>
                </div>
                {inputMode === 'upload' && <FileUploader onProcessFiles={(f) => onProcessInput(f)} />}
                {inputMode === 'github' && <GitHubUploader onProcessFiles={(f) => onProcessInput(f)} />}
                {inputMode === 'gemini' && <GeminiUploader onProcessInput={(c) => onProcessInput(c)} />}
                {inputMode === 'text' && <PastedTextInput onTextSubmit={(t) => onProcessInput(t)} text={pastedText} setText={setPastedText} />}
            </div>

            <div className="w-full text-center mt-4">
                <p className="text-sm text-secondary-text">{t('advancedSettingsPrompt')}</p>
                <button
                    onClick={onGoToAISettings}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent dark:text-dark-accent hover:bg-accent/10 dark:hover:bg-dark-accent/10 rounded-lg transition-colors"
                >
                    <SparklesIcon className="h-4 w-4" />
                    {t('goToAISettings')}
                </button>
            </div>
        </>
    );
};