import React from 'react';
import { AISuggestion, ParsedFile } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface SuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: AISuggestion[];
    setSuggestions: React.Dispatch<React.SetStateAction<AISuggestion[]>>;
    onAccept: (acceptedFiles: ParsedFile[]) => void;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose, suggestions, setSuggestions, onAccept }) => {
    const { t } = useAppContext();
    if (!isOpen) return null;

    const toggleAccept = (id: string) => {
        setSuggestions(current =>
            current.map(s => (s.id === id ? { ...s, accepted: !s.accepted } : s))
        );
    };

    const handleAccept = () => {
        const acceptedFiles = suggestions
            .filter(s => s.accepted)
            .map(({ path, content }) => ({ path, content }));
        onAccept(acceptedFiles);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-primary dark:bg-dark-primary rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-color dark:border-dark-border-color">
                    <h2 className="text-xl font-bold">{t('suggestionModal.title')}</h2>
                    <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{t('suggestionModal.description')}</p>
                </header>
                
                <main className="p-4 flex-grow overflow-y-auto space-y-3">
                    {suggestions.map(suggestion => (
                        <div key={suggestion.id} className="border border-border-color dark:border-dark-border-color rounded-lg">
                             <div className="flex items-center p-3 bg-secondary dark:bg-dark-secondary rounded-t-lg">
                                <input
                                    type="checkbox"
                                    checked={suggestion.accepted}
                                    onChange={() => toggleAccept(suggestion.id)}
                                    className="h-5 w-5 rounded text-accent dark:text-dark-accent focus:ring-accent bg-primary dark:bg-dark-primary border-border-color dark:border-dark-border-color"
                                />
                                <label htmlFor={`suggestion-${suggestion.id}`} className="ml-3 font-mono text-sm">{suggestion.path}</label>
                            </div>
                            <pre className="p-3 text-xs bg-tertiary/50 dark:bg-dark-tertiary/50 max-h-40 overflow-auto rounded-b-lg">
                                <code>{suggestion.content}</code>
                            </pre>
                        </div>
                    ))}
                </main>

                <footer className="p-4 border-t border-border-color dark:border-dark-border-color flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary rounded-lg transition-colors">
                        {t('suggestionModal.cancel')}
                    </button>
                    <button onClick={handleAccept} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors">
                        {t('suggestionModal.acceptSelected')}
                    </button>
                </footer>
            </div>
        </div>
    );
};