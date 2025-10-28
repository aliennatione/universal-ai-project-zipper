import React, { useState, useEffect } from 'react';
import { ExamplePrompt } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface ExamplePromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    prompt: ExamplePrompt | null;
    initialLang: 'it' | 'en';
}

export const ExamplePromptModal: React.FC<ExamplePromptModalProps> = ({ isOpen, onClose, prompt, initialLang }) => {
    const [lang, setLang] = useState<'en' | 'it'>(initialLang);
    const { t } = useAppContext();
    
    useEffect(() => {
        if (isOpen) {
            // Imposta la lingua dalla prop quando la modale si apre
            setLang(initialLang);
        }
    }, [isOpen, prompt, initialLang]);

    if (!isOpen || !prompt) return null;

    const { title, content } = prompt[lang];
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-primary dark:bg-dark-primary rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-color dark:border-dark-border-color flex justify-between items-center">
                    <h2 className="text-xl font-bold text-accent dark:text-dark-accent">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-tertiary dark:hover:bg-dark-tertiary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                
                <main className="p-6 flex-grow overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans text-primary-text dark:text-dark-primary-text">
                        {content}
                    </pre>
                </main>

                <footer className="p-4 border-t border-border-color dark:border-dark-border-color flex justify-between items-center gap-4">
                     <div className="flex items-center gap-1 text-sm font-semibold flex-shrink-0">
                         <button onClick={() => setLang('en')} className={`p-2 rounded transition-colors ${lang === 'en' ? 'text-accent dark:text-dark-accent bg-accent/10' : 'text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary'}`}>EN</button>
                         <span className="text-border-color dark:text-dark-border-color">/</span>
                         <button onClick={() => setLang('it')} className={`p-2 rounded transition-colors ${lang === 'it' ? 'text-accent dark:text-dark-accent bg-accent/10' : 'text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary'}`}>IT</button>
                     </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary rounded-lg transition-colors">
                            {t('examplePromptModal.close')}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(content); }} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors">
                            {t('examplePromptModal.copyPrompt')}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};