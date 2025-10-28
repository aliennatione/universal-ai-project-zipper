import React, { useState, useEffect } from 'react';
import { ParsedFile } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { GitHubIcon, SparklesIcon } from './icons';
import { createNewRepo, pushToRepo } from '../services/githubPushService';
import { generateCommitMessage } from '../services/commitMessageService';

interface GitHubExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    parsedFiles: ParsedFile[];
}

type ExportStep = 'form' | 'loading' | 'success' | 'error';
type ActionType = 'create' | 'push';

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ isOpen, onClose, projectName, parsedFiles }) => {
    const { t, appSettings, aiConfig } = useAppContext();
    
    const [step, setStep] = useState<ExportStep>('form');
    const [actionType, setActionType] = useState<ActionType>('create');
    const [repoName, setRepoName] = useState('');
    const [fullRepoPath, setFullRepoPath] = useState('');
    const [branch, setBranch] = useState('main');
    const [commitMessage, setCommitMessage] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successUrl, setSuccessUrl] = useState('');
    const [isGeneratingCommit, setIsGeneratingCommit] = useState(false);

    const handleGenerateCommit = async () => {
        if (!aiConfig.commitMessageGenerator.enabled) return;
        setIsGeneratingCommit(true);
        try {
            const filePaths = parsedFiles.map(f => f.path);
            const message = await generateCommitMessage(appSettings, aiConfig.commitMessageGenerator, projectName, filePaths);
            setCommitMessage(message);
        } catch (error) {
            console.error("Failed to generate commit message:", error);
        } finally {
            setIsGeneratingCommit(false);
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            setRepoName(projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-'));
            setFullRepoPath('');
            setBranch('main');
            setCommitMessage(t('githubExport.commitMessagePlaceholder'));
            if (aiConfig.commitMessageGenerator.enabled) {
                handleGenerateCommit();
            }
        }
    }, [isOpen, projectName, aiConfig.commitMessageGenerator.enabled]);

    const resetForm = () => {
        setStep('form');
        setErrorMessage('');
        setSuccessUrl('');
    }

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        
        try {
            let finalRepoPath = '';
            if (actionType === 'create') {
                const createdRepo = await createNewRepo(appSettings.githubPat, repoName, isPrivate);
                finalRepoPath = createdRepo.full_name;
            } else {
                finalRepoPath = fullRepoPath;
            }

            const url = await pushToRepo(appSettings.githubPat, finalRepoPath, branch, parsedFiles, commitMessage);
            setSuccessUrl(url);
            setStep('success');

        } catch(err: any) {
            setErrorMessage(err.message || 'An unexpected error occurred.');
            setStep('error');
        }
    };
    
    if (!isOpen) return null;

    const renderContent = () => {
        switch (step) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent dark:border-dark-accent mb-4"></div>
                        <p className="font-semibold text-lg">{t('githubExport.exporting')}</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="p-8 text-center">
                        <h3 className="text-xl font-bold text-accent dark:text-dark-accent">{t('githubExport.successTitle')}</h3>
                        <p className="mt-2 text-sm">{t('githubExport.successMessage', successUrl.split('/tree/')[0])}</p>
                        <a href={successUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-6 px-6 py-2 bg-accent hover:bg-accent-hover text-accent-text font-bold rounded-lg">
                            {t('githubExport.viewOnGitHub', 'View on GitHub')}
                        </a>
                    </div>
                );
            case 'error':
                 return (
                    <div className="p-8 text-center">
                        <h3 className="text-xl font-bold text-danger dark:text-dark-danger">{t('githubExport.errorTitle')}</h3>
                        <p className="mt-2 text-sm bg-danger-bg dark:bg-dark-danger-bg p-3 rounded-md">{errorMessage}</p>
                        <button onClick={resetForm} className="mt-6 px-6 py-2 bg-accent hover:bg-accent-hover text-accent-text font-bold rounded-lg">
                            {t('tryAgain')}
                        </button>
                    </div>
                );
            case 'form':
                return (
                     <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium">{t('githubExport.actionTypeLabel')}</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="actionType" value="create" checked={actionType === 'create'} onChange={() => setActionType('create')} className="form-radio text-accent focus:ring-accent" />
                                    <span className="text-sm">{t('githubExport.actionTypeCreate')}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="actionType" value="push" checked={actionType === 'push'} onChange={() => setActionType('push')} className="form-radio text-accent focus:ring-accent" />
                                     <span className="text-sm">{t('githubExport.actionTypePush')}</span>
                                </label>
                            </div>
                        </div>

                        {actionType === 'create' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="repoName" className="block text-sm font-medium mb-1">{t('githubExport.repoNameLabel')}</label>
                                    <input type="text" id="repoName" value={repoName} onChange={e => setRepoName(e.target.value)} required className="w-full text-sm bg-tertiary dark:bg-dark-tertiary border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 focus:ring-accent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('githubExport.visibilityLabel')}</label>
                                     <select value={isPrivate ? 'private' : 'public'} onChange={e => setIsPrivate(e.target.value === 'private')} className="w-full text-sm bg-tertiary dark:bg-dark-tertiary border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 focus:ring-accent">
                                        <option value="private">{t('githubExport.visibilityPrivate')}</option>
                                        <option value="public">{t('githubExport.visibilityPublic')}</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="fullRepoPath" className="block text-sm font-medium mb-1">{t('githubExport.repoNameLabel')}</label>
                                <input type="text" id="fullRepoPath" value={fullRepoPath} onChange={e => setFullRepoPath(e.target.value)} placeholder={t('githubExport.repoNamePlaceholder')} required className="w-full text-sm bg-tertiary dark:bg-dark-tertiary border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 focus:ring-accent" />
                                <p className="text-xs text-secondary-text mt-1">{t('githubExport.repoNameHelp')}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="branch" className="block text-sm font-medium mb-1">{t('githubExport.branchLabel')}</label>
                            <input type="text" id="branch" value={branch} onChange={e => setBranch(e.target.value)} placeholder={t('githubExport.branchPlaceholder')} required className="w-full text-sm bg-tertiary dark:bg-dark-tertiary border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 focus:ring-accent" />
                        </div>
                         <div>
                            <label htmlFor="commitMessage" className="block text-sm font-medium mb-1">{t('githubExport.commitMessageLabel')}</label>
                            <div className="relative">
                                <input type="text" id="commitMessage" value={commitMessage} onChange={e => setCommitMessage(e.target.value)} placeholder={t('githubExport.commitMessagePlaceholder')} required className="w-full text-sm bg-tertiary dark:bg-dark-tertiary border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 pr-10 focus:ring-accent" />
                                {aiConfig.commitMessageGenerator.enabled && (
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateCommit}
                                        disabled={isGeneratingCommit}
                                        className="absolute inset-y-0 right-0 px-2 flex items-center text-accent dark:text-dark-accent disabled:opacity-50"
                                        title={t('githubExport.generateCommitMessage')}
                                    >
                                        {isGeneratingCommit 
                                            ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                            : <SparklesIcon className="h-4 w-4" />
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                );
        }
    }


    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-primary dark:bg-dark-primary rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-color dark:border-dark-border-color flex items-center gap-3">
                    <GitHubIcon className="h-6 w-6" />
                    <div>
                        <h2 className="text-xl font-bold">{t('githubExport.title')}</h2>
                        <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{t('githubExport.description')}</p>
                    </div>
                </header>
                
                <main className="flex-grow">
                   {renderContent()}
                </main>

                <footer className="p-4 border-t border-border-color dark:border-dark-border-color flex justify-end items-center gap-4">
                    <button onClick={handleClose} className="px-4 py-2 text-sm text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary rounded-lg transition-colors">
                        {step === 'success' ? t('githubExport.close') : t('githubExport.cancel')}
                    </button>
                    {step === 'form' && (
                        <button onClick={handleSubmit} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors">
                            {t('githubExport.export')}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};