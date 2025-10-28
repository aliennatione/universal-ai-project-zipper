import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { chatWithArchitect, generateProjectFromConversation } from '../services/scaffoldingService';
import { transcribeAudio } from '../services/transcriptionService';
import { LogoIcon, SparklesIcon, MicrophoneIcon, StopIcon, VolumeUpIcon, VolumeOffIcon, AudioFileIcon, WaveformIcon } from './icons';
import { useAppContext } from '../contexts/AppContext';
import { useSpeech } from '../hooks/useSpeech';

/**
 * @file Definisce la modale per la chat con l'architetto AI per lo scaffolding del progetto.
 * @module ProjectChatModal
 */

/**
 * @interface ProjectChatModalProps
 * Props per il componente ProjectChatModal.
 */
interface ProjectChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (generatedText: string) => void;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

/**
 * Una modale che ospita una sessione di chat con un AI architect per definire e generare
 * la struttura di un progetto in modo conversazionale.
 *
 * @param {ProjectChatModalProps} props - Le props del componente.
 * @returns {JSX.Element | null}
 */
export const ProjectChatModal: React.FC<ProjectChatModalProps> = ({ isOpen, onClose, onComplete, messages, setMessages }) => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAiSpeakingEnabled, setIsAiSpeakingEnabled] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const { appSettings, aiConfig, t } = useAppContext();

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const responseText = await chatWithArchitect(appSettings, aiConfig, newMessages);
            setMessages(prev => [...prev, { role: 'model', content: responseText }]);
            if (isAiSpeakingEnabled) {
                speak(responseText);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error.';
            const errorMsgObj = { role: 'model' as const, content: t('projectChatModal.aiError', errorMessage) };
            setMessages(prev => [...prev, errorMsgObj]);
            if (isAiSpeakingEnabled) {
                speak(errorMsgObj.content);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const {
        isListening,
        isSpeaking,
        isLiveChatActive,
        startListening,
        speak,
        toggleLiveChat,
        isSupported,
    } = useSpeech({
        onTranscript: (transcript) => {
            handleSendMessage(transcript);
        },
        onLiveChatCycleEnd: () => {
            if (isLiveChatActive) {
                startListening();
            }
        },
        lang: appSettings.globalLanguage === 'it' ? 'it-IT' : 'en-US'
    });
    
    // Se la modale viene aperta e non ci sono messaggi, fa iniziare la conversazione all'AI.
    useEffect(() => {
        if (isOpen && messages.length === 0 && !isLoading) {
            setIsLoading(true);
            (async () => {
                try {
                    const responseText = await chatWithArchitect(appSettings, aiConfig, []);
                    setMessages([{ role: 'model', content: responseText }]);
                    if (isAiSpeakingEnabled) {
                        speak(responseText);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error.';
                    const errorMsgObj = { role: 'model' as const, content: t('projectChatModal.aiError', errorMessage) };
                    setMessages(prev => [...prev, errorMsgObj]);
                    if (isAiSpeakingEnabled) {
                        speak(errorMsgObj.content);
                    }
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [isOpen, messages.length, isLoading, appSettings, aiConfig, isAiSpeakingEnabled]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleTextSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        handleSendMessage(userInput);
    };
    
    const handleGenerateProject = async () => {
        setIsLoading(true);
        try {
            const projectContent = await generateProjectFromConversation(appSettings, aiConfig.projectOverview, messages);
            onComplete(projectContent);
        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : 'Unknown error during project generation.';
            setMessages(prev => [...prev, { role: 'model', content: t('projectChatModal.generationError', errorMessage) }]);
            setIsLoading(false);
        }
    };

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const transcribedText = await transcribeAudio(appSettings, file);
            setUserInput(prev => prev ? `${prev} ${transcribedText}` : transcribedText);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error.';
            setMessages(prev => [...prev, { role: 'model', content: t('projectChatModal.transcriptionError', errorMessage) }]);
        } finally {
            setIsLoading(false);
            if (audioInputRef.current) audioInputRef.current.value = '';
        }
    };

    if (!isOpen) return null;

    const canGenerate = !isLoading && messages[messages.length - 1]?.role === 'model' && messages[messages.length - 1].content.includes("I have enough information to generate the project. Shall I proceed?");
    const isVoiceBusy = isLoading || isListening || isSpeaking;

    let statusText = '';
    if (isLiveChatActive) {
        if (isListening) statusText = t('projectChatModal.statusListening');
        else if (isSpeaking) statusText = t('projectChatModal.statusSpeaking');
        else if (isLoading) statusText = t('projectChatModal.statusThinking');
        else statusText = t('projectChatModal.statusWaiting');
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-primary dark:bg-dark-primary rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-color dark:border-dark-border-color flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <LogoIcon className="h-6 w-6 text-accent dark:text-dark-accent" />
                        <div>
                            <h2 className="text-xl font-bold">{t('projectChatModal.title')}</h2>
                            <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{t('projectChatModal.description')}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setIsAiSpeakingEnabled(prev => !prev)} className="p-2 rounded-full hover:bg-tertiary dark:hover:bg-dark-tertiary" title={t('projectChatModal.toggleTTS')}>
                            {isAiSpeakingEnabled ? <VolumeUpIcon className="h-6 w-6 text-secondary-text"/> : <VolumeOffIcon className="h-6 w-6 text-secondary-text"/>}
                        </button>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-tertiary dark:hover:bg-dark-tertiary transition-colors" aria-label={t('projectChatModal.close')}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>
                
                <main className="p-4 flex-grow overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={`${msg.role}-${index}`} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="flex-shrink-0 h-8 w-8 bg-accent/20 rounded-full flex items-center justify-center"><SparklesIcon className="h-5 w-5 text-accent"/></div>}
                            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-accent dark:bg-dark-accent text-accent-text dark:text-dark-accent-text' : 'bg-secondary dark:bg-dark-secondary'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages.length > 0 && (
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
                     {canGenerate && (
                        <button onClick={handleGenerateProject} disabled={isLoading} className="w-full mb-3 px-4 py-2 text-sm font-semibold text-accent dark:text-dark-accent bg-accent/10 dark:bg-dark-accent/10 hover:bg-accent/20 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            <SparklesIcon className="h-4 w-4" /> {t('projectChatModal.generateProject')}
                        </button>
                     )}
                    <form onSubmit={handleTextSubmit} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={t('projectChatModal.placeholder')}
                            disabled={isVoiceBusy}
                            className="w-full bg-secondary dark:bg-dark-secondary border border-border-color dark:border-dark-border-color rounded-lg px-3 py-2 text-sm focus:ring-accent focus:border-accent disabled:opacity-50"
                        />
                        <button type="submit" disabled={isVoiceBusy || !userInput.trim()} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors disabled:opacity-50">
                            {t('projectChatModal.send')}
                        </button>
                    </form>
                    {isSupported && (
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={toggleLiveChat} title={t('projectChatModal.toggleLiveChat')} className={`p-2 rounded-full transition-colors ${isLiveChatActive ? 'bg-danger text-white' : 'bg-tertiary dark:bg-dark-tertiary hover:bg-border-color dark:hover:bg-dark-border-color'}`}>
                                    {isLiveChatActive ? <StopIcon className="w-6 h-6"/> : <MicrophoneIcon className="w-6 h-6" isActive={isListening}/>}
                                </button>
                                <button onClick={() => audioInputRef.current?.click()} disabled={isVoiceBusy} title={t('projectChatModal.uploadAudio')} className="p-2 rounded-full bg-tertiary dark:bg-dark-tertiary hover:bg-border-color dark:hover:bg-dark-border-color disabled:opacity-50">
                                    <AudioFileIcon className="w-6 h-6" />
                                </button>
                                <input ref={audioInputRef} type="file" className="hidden" accept="audio/*" onChange={handleAudioUpload}/>
                            </div>
                            <div className="text-sm text-secondary-text flex items-center gap-2">
                                {isSpeaking && <WaveformIcon className="w-5 h-5 text-accent"/>}
                                <span>{statusText}</span>
                            </div>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
};