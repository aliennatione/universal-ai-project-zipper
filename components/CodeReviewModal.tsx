import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ReviewIcon } from './icons';

interface CodeReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    filePath: string | null;
    reviewContent: string;
}

export const CodeReviewModal: React.FC<CodeReviewModalProps> = ({ isOpen, onClose, filePath, reviewContent }) => {
    const { t } = useAppContext();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-primary dark:bg-dark-primary rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-color dark:border-dark-border-color flex items-center gap-3">
                    <ReviewIcon className="h-6 w-6 text-accent dark:text-dark-accent" />
                    <div>
                        <h2 className="text-xl font-bold">{t('codeReviewModal.title')}</h2>
                        <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{t('codeReviewModal.description', filePath || '')}</p>
                    </div>
                </header>
                
                <main className="p-6 flex-grow overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans text-primary-text dark:text-dark-primary-text bg-secondary dark:bg-dark-secondary p-4 rounded-md">
                        {reviewContent}
                    </pre>
                </main>

                <footer className="p-4 border-t border-border-color dark:border-dark-border-color flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors">
                        {t('codeReviewModal.close')}
                    </button>
                </footer>
            </div>
        </div>
    );
};