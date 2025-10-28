import React, { useState, useEffect, useRef } from 'react';
import { AIPromptConfig, ChatMessage, EditablePrompt } from '../types';
import { improvePromptWithChat } from '../services/promptImprovementService';
import { ChatIcon, SparklesIcon } from './icons';
import { useAppContext } from '../contexts/AppContext';

/**
 * @file Definisce la modale per la chat interattiva per migliorare i prompt dell'AI.
 * @module PromptChatModal
 */

/**
 * @interface PromptChatModalProps
 * Props per il componente PromptChatModal.
 */
interface PromptChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    promptToImprove: EditablePrompt | null;
    onSavePrompt: (id: keyof AIPromptConfig, content: string) => void;
}

/**
 * Una modale che ospita una sessione di chat con un assistente AI per aiutare
 * l'utente a perfezionare il testo di un prompt di configurazione.
 *
 * @param {PromptChatModalProps} props - Le props del componente.
 * @returns {JSX.Element | null}
 */
export const PromptChatModal: React.FC<PromptChatModalProps> = ({ isOpen, onClose, promptToImprove, onSavePrompt }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { appSettings, t } = useAppContext();

    useEffect(() => {
        if (isOpen && promptToImprove) {
            setMessages([
                { role: 'model', content: t('promptChatModal.greeting', promptToImprove.title) }
            ]);
        } else {
            setMessages([]);
            setUserInput('');
        }
    }, [isOpen, promptToImprove, t]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!userInput.trim() || isLoading || !promptToImprove) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const responseText = await improvePromptWithChat(appSettings, promptToImprove.content, newMessages);
            setMessages(prev => [...prev, { role: 'model', content: responseText }]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error.';
            setMessages(prev => [...prev, { role: 'model', content: t('promptChatModal.aiError', errorMessage) }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAcceptSuggestion = () => {
        if (!promptToImprove) return;
        const lastModelMessage = [...messages].reverse().find(m => m.role === 'model');
        if (lastModelMessage) {
            onSavePrompt(promptToImprove.id, lastModelMessage.content);
        }
    };

    if (!isOpen || !promptToImprove) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-primary dark:bg-dark-primary rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-color dark:border-dark-border-color flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ChatIcon className="h-6 w-6 text-accent dark:text-dark-accent" />
                        <div>
                            <h2 className="text-xl font-bold">{t('promptChatModal.title')}</h2>
                            <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{t('promptChatModal.description', promptToImprove.title)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-tertiary dark:hover:bg-dark-tertiary transition-colors" aria-label={t('promptChatModal.close')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                
                <main className="p-4 flex-grow overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="flex-shrink-0 h-8 w-8 bg-accent/20 rounded-full flex items-center justify-center"><SparklesIcon className="h-5 w-5 text-accent"/></div>}
                            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-accent dark:bg-dark-accent text-accent-text dark:text-dark-accent-text' : 'bg-secondary dark:bg-dark-secondary'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 bg-accent/20 rounded-full flex items-center justify-center"><SparklesIcon className="h-5 w-5 text-accent"/></div>
                            <div className="max-w-md p-3 rounded-lg bg-secondary dark:bg-dark-secondary">
                               <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 bg-accent rounded-full animate-bounce"></div>
                               </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-border-color dark:border-dark-border-color">
                     <button
                        onClick={handleAcceptSuggestion}
                        className="w-full mb-3 px-4 py-2 text-sm font-semibold text-accent dark:text-dark-accent bg-accent/10 dark:bg-dark-accent/10 hover:bg-accent/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                     >
                        <SparklesIcon className="h-4 w-4" /> {t('promptChatModal.useLastResponse')}
                    </button>
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={t('promptChatModal.placeholder')}
                            disabled={isLoading}
                            className="w-full bg-secondary dark:bg-dark-secondary border border-border-color dark:border-dark-border-color rounded-lg px-3 py-2 text-sm focus:ring-accent focus:border-accent"
                        />
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors disabled:opacity-50">
                            {t('promptChatModal.send')}
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};