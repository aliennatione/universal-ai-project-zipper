import React, { useState } from 'react';
import { ParsedFile } from '../types';
import { LightBulbIcon, SparklesIcon, TestTubeIcon, FileIcon, DocstringIcon, ReviewIcon } from './icons';
import { useAppContext } from '../contexts/AppContext';

interface AIActionPanelProps {
    selectedFile: ParsedFile | null;
    onSuggestName: () => Promise<void>;
    onFindFiles: () => Promise<void>;
    onGenerateTests: (filePath: string) => Promise<ParsedFile | null>;
    onImproveReadme: () => Promise<void>;
    onRefactor: () => Promise<void>;
    onAddDocstrings: () => Promise<void>;
    onGenerateWiki: () => Promise<void>;
    onCodeReview: () => Promise<void>;
}

type LoadingState = 'name' | 'files' | 'tests' | 'readme' | 'refactor' | 'docstrings' | 'wiki' | 'review' | null;

export const AIActionPanel: React.FC<AIActionPanelProps> = ({
    selectedFile,
    onSuggestName,
    onFindFiles,
    onGenerateTests,
    onImproveReadme,
    onRefactor,
    onAddDocstrings,
    onGenerateWiki,
    onCodeReview
}) => {
    const [loading, setLoading] = useState<LoadingState>(null);
    const { t, aiConfig } = useAppContext();

    const loadingMessages: Record<NonNullable<LoadingState>, string> = {
        name: t('loading.name'),
        files: t('loading.files'),
        readme: t('loading.readme'),
        refactor: t('loading.refactor'),
        tests: t('loading.tests'),
        docstrings: t('loading.docstrings'),
        wiki: t('loading.wiki'),
        review: t('loading.review'),
    };
    
    const handleAction = async (action: LoadingState, task: () => Promise<any>) => {
        setLoading(action);
        try {
            await task();
        } catch (e) {
            alert(t('aiActionFailed', e instanceof Error ? e.message : 'Unknown error'));
        } finally {
            setLoading(null);
        }
    };
    
    const isReadmeSelected = selectedFile?.path.toLowerCase() === 'readme.md';
    const isCodeFile = selectedFile && !isReadmeSelected && selectedFile?.path.match(/\.(js|ts|jsx|tsx|py|html|css|json)$/);

    const ActionButton: React.FC<{
        action: NonNullable<LoadingState>;
        icon: React.ReactNode;
        label: string;
        tooltip: string;
        onClick: () => void;
        disabled?: boolean;
    }> = ({ action, icon, label, tooltip, onClick, disabled = false }) => {
        const isLoading = loading === action;
        const buttonClasses = `
            flex flex-col items-center justify-center p-2 aspect-square
            bg-tertiary dark:bg-dark-tertiary rounded-lg transition-colors
            hover:bg-border-color dark:hover:bg-dark-border-color
            disabled:opacity-50 disabled:cursor-not-allowed text-center
            ${isLoading ? 'bg-accent/10 dark:bg-dark-accent/10 animate-pulse' : ''}
        `;
        
        return (
            <button
                onClick={onClick}
                disabled={loading !== null || disabled}
                className={buttonClasses}
                title={disabled ? tooltip : t('tooltips.base') + tooltip}
            >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent dark:border-dark-accent mb-1.5"></div>
                        <span className="text-xs font-semibold">{loadingMessages[action]}</span>
                    </>
                ) : (
                    <>
                        {icon}
                        <span className="text-xs font-semibold mt-1.5">{label}</span>
                    </>
                )}
            </button>
        );
    };

    return (
        <div className="w-full h-full bg-secondary dark:bg-dark-secondary p-4 rounded-lg border border-border-color dark:border-dark-border-color flex flex-col">
            <h3 className="font-bold text-lg text-center mb-4 flex-shrink-0">{t('aiAssistant')}</h3>
            <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                    <ActionButton
                        action="name"
                        icon={<LightBulbIcon className="h-5 w-5 text-accent dark:text-dark-accent" />}
                        label={t('suggestName')}
                        tooltip={t('tooltips.suggestName')}
                        onClick={() => handleAction('name', onSuggestName)}
                    />
                    <ActionButton
                        action="files"
                        icon={<FileIcon className="h-5 w-5 text-accent dark:text-dark-accent" />}
                        label={t('findFiles')}
                        tooltip={t('tooltips.findFiles')}
                        onClick={() => handleAction('files', onFindFiles)}
                    />
                     <ActionButton
                        action="wiki"
                        icon={<SparklesIcon className="h-5 w-5 text-accent dark:text-dark-accent" />}
                        label={t('generateWiki')}
                        tooltip={!aiConfig.wikiGenerator.enabled ? t('tooltips.disabled') : t('tooltips.generateWiki')}
                        onClick={() => handleAction('wiki', onGenerateWiki)}
                        disabled={!aiConfig.wikiGenerator.enabled}
                    />
                    <ActionButton
                        action="readme"
                        icon={<SparklesIcon className="h-5 w-5 text-accent dark:text-dark-accent" />}
                        label={t('improveReadme')}
                        tooltip={!isReadmeSelected ? t('tooltips.improveReadme_disabled') : t('tooltips.improveReadme')}
                        onClick={() => handleAction('readme', onImproveReadme)}
                        disabled={!isReadmeSelected}
                    />
                    <ActionButton
                        action="refactor"
                        icon={<SparklesIcon className="h-5 w-5 text-accent dark:text-dark-accent" />}
                        label={t('refactorCode')}
                        tooltip={!isCodeFile ? t('tooltips.refactorCode_disabled') : t('tooltips.refactorCode')}
                        onClick={() => handleAction('refactor', onRefactor)}
                        disabled={!isCodeFile}
                    />
                     <ActionButton
                        action="docstrings"
                        icon={<DocstringIcon className="h-5 w-5 text-accent dark:text-dark-accent" />}
                        label={t('addDocstrings')}
                        tooltip={!isCodeFile ? t('tooltips.addDocstrings_disabled') : t('tooltips.addDocstrings')}
                        onClick={() => handleAction('docstrings', onAddDocstrings)}
                        disabled={!isCodeFile}
                    />
                    <ActionButton
                        action="tests"
                        icon={<TestTubeIcon className="h-5 w-5 text-accent dark:text-dark-accent" />}
                        label={t('writeTests')}
                        tooltip={!isCodeFile ? t('tooltips.writeTests_disabled') : t('tooltips.writeTests')}
                        onClick={() => handleAction('tests', () => onGenerateTests(selectedFile!.path))}
                        disabled={!isCodeFile}
                    />
                    <ActionButton
                        action="review"
                        icon={<ReviewIcon className="h-5 w-5 text-accent dark:text-dark-accent" />}
                        label={t('codeReview')}
                        tooltip={!isCodeFile ? t('tooltips.codeReview_disabled') : t('tooltips.codeReview')}
                        onClick={() => handleAction('review', onCodeReview)}
                        disabled={!isCodeFile}
                    />
                </div>
            </div>
        </div>
    );
};