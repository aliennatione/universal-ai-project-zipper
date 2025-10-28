import React, { useState, useEffect } from 'react';
import { AppSettings, Provider, AIPromptConfig, EditablePrompt, Preset } from '../types';
import { SettingsTab } from '../App';
import { useAppContext } from '../contexts/AppContext';
import { SparklesIcon, ChevronDownIcon } from './icons';

/**
 * @file Definisce la modale per la configurazione delle impostazioni dell'applicazione.
 * @module SettingsView
 */

const APIKeyInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    helpLink?: string;
    helpText?: string;
    placeholder?: string;
    isNote?: boolean;
    children?: React.ReactNode;
}> = ({ label, value, onChange, helpLink, helpText, placeholder, isNote = false, children }) => {
    const [showKey, setShowKey] = useState(false);
    const { t } = useAppContext();

    if (isNote) {
        return (
             <div className="p-3 bg-tertiary dark:bg-dark-tertiary rounded-lg">
                <p className="text-sm font-medium">{label}</p>
                <div className="text-xs text-secondary-text mt-1">
                    {children}
                </div>
            </div>
        )
    }
    
    return (
        <div>
            <label htmlFor={label} className="block text-sm font-medium mb-1">{label}</label>
            <div className="relative">
                <input
                    id={label}
                    type={showKey ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || t('settings.apiKeyPlaceholder', label)}
                    className="w-full bg-secondary dark:bg-dark-secondary border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 pr-16 text-sm focus:ring-accent focus:border-accent"
                />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute inset-y-0 right-0 px-3 flex items-center text-secondary-text hover:text-primary-text text-xs" aria-label={showKey ? t('settings.hideKey') : t('settings.showKey')}>
                    {showKey ? t('settings.hideKey') : t('settings.showKey')}
                </button>
            </div>
            {helpLink && helpText && (
                <p className="text-xs text-secondary-text mt-2">
                    <a href={helpLink} target="_blank" rel="noopener noreferrer" className="text-accent dark:text-dark-accent font-bold underline">{helpText}</a>
                </p>
            )}
        </div>
    );
};

const ModelSelector: React.FC<{
    label: string;
    description: string;
    selectedProvider: Provider;
    selectedModel: string;
    onProviderChange: (provider: Provider) => void;
    onModelChange: (model: string) => void;
    modelsByProvider: Record<Provider, string[]>;
}> = ({ label, description, selectedProvider, selectedModel, onProviderChange, onModelChange, modelsByProvider }) => {
    const { t } = useAppContext();
    const availableModels = modelsByProvider[selectedProvider] || [];

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProvider = e.target.value as Provider;
        onProviderChange(newProvider);
        const newModels = modelsByProvider[newProvider] || [];
        onModelChange(newModels[0] || '');
    };

    return (
        <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-secondary-text -mt-1 mb-2">{description}</p>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-medium">{t('promptEditor.provider')}</label>
                    <select value={selectedProvider} onChange={handleProviderChange} className="w-full text-xs bg-secondary dark:bg-dark-secondary border border-border-color dark:border-dark-border-color rounded-md px-2 py-1.5 focus:ring-accent focus:border-accent">
                        <option value="google">Google</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="groq">Groq</option>
                        <option value="together">Together.ai</option>
                        <option value="perplexity">Perplexity</option>
                        <option value="cohere">Cohere</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium">{t('promptEditor.model')}</label>
                    <select value={selectedModel} onChange={(e) => onModelChange(e.target.value)} disabled={availableModels.length === 0} className="w-full text-xs bg-secondary dark:bg-dark-secondary border border-border-color dark:border-dark-border-color rounded-md px-2 py-1.5 focus:ring-accent focus:border-accent disabled:opacity-50">
                        {availableModels.length > 0 ? (availableModels.map(m => <option key={m} value={m}>{m}</option>)) : (<option value="">{t('promptEditor.noModelFound')}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

const PromptEditor: React.FC<{ 
    prompt: EditablePrompt; 
    isTranslating: boolean;
    onTranslate: (lang: 'English' | 'Italian') => void; 
    onImproveRequest: () => void;
}> = ({ prompt, isTranslating, onTranslate, onImproveRequest }) => {
    const { t, aiConfig, modelsByProvider, handlePromptChange, handleTogglePrompt, handleProviderChange, handleModelChange } = useAppContext();
    const currentPromptState = aiConfig[prompt.id];
    const availableModels = modelsByProvider[currentPromptState.provider] || [];
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="bg-tertiary dark:bg-dark-tertiary p-4 rounded-lg">
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex justify-between items-center text-left" aria-expanded={isOpen}>
                <div className="flex items-center gap-4">
                    <div onClick={(e) => { e.stopPropagation(); handleTogglePrompt(prompt.id); }} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${currentPromptState.enabled ? 'bg-accent' : 'bg-gray-400 dark:bg-gray-600'}`}>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${currentPromptState.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <label className="font-semibold">{currentPromptState.title}</label>
                </div>
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                </div>
            </button>
            
            {isOpen && (
                <div className="mt-4 pt-4 border-t border-border-color dark:border-dark-border-color space-y-3">
                    <p className="text-xs text-secondary-text">{currentPromptState.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium">{t('promptEditor.provider')}</label>
                            <select value={currentPromptState.provider} onChange={(e) => handleProviderChange(prompt.id, e.target.value as Provider)} disabled={isTranslating || !currentPromptState.enabled} className="w-full text-xs bg-primary dark:bg-dark-primary border border-border-color dark:border-dark-border-color rounded-md px-2 py-1.5 focus:ring-accent focus:border-accent disabled:opacity-50">
                                <option value="google">Google</option>
                                <option value="openrouter">OpenRouter</option>
                                <option value="groq">Groq</option>
                                <option value="together">Together.ai</option>
                                <option value="perplexity">Perplexity</option>
                                <option value="cohere">Cohere</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-xs font-medium">{t('promptEditor.model')}</label>
                            <select value={currentPromptState.model} onChange={(e) => handleModelChange(prompt.id, e.target.value)} disabled={isTranslating || !currentPromptState.enabled || availableModels.length === 0} className="w-full text-xs bg-primary dark:bg-dark-primary border border-border-color dark:border-dark-border-color rounded-md px-2 py-1.5 focus:ring-accent focus:border-accent disabled:opacity-50">
                                {availableModels.length > 0 ? (availableModels.map(m => <option key={m} value={m}>{m}</option>)) : (<option value="">{t('promptEditor.noModelFound')}</option>)}
                            </select>
                        </div>
                    </div>
                    <textarea value={currentPromptState.content} onChange={(e) => handlePromptChange(prompt.id, e.target.value)} className="w-full h-40 bg-primary dark:bg-dark-primary border border-border-color dark:border-dark-border-color rounded-lg p-3 text-sm font-mono focus:ring-accent focus:border-accent" disabled={isTranslating || !currentPromptState.enabled} />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => onTranslate('English')} disabled={isTranslating || !currentPromptState.enabled} className="text-xs px-3 py-1 bg-secondary dark:bg-dark-secondary hover:bg-border-color dark:hover:bg-dark-border-color rounded-md transition-colors disabled:opacity-50">{t('promptEditor.translateToEN')}</button>
                            <button onClick={() => onTranslate('Italian')} disabled={isTranslating || !currentPromptState.enabled} className="text-xs px-3 py-1 bg-secondary dark:bg-dark-secondary hover:bg-border-color dark:hover:bg-dark-border-color rounded-md transition-colors disabled:opacity-50">{t('promptEditor.translateToIT')}</button>
                            {isTranslating && <div className="text-xs text-accent">{t('promptEditor.translating')}</div>}
                        </div>
                        <button onClick={onImproveRequest} disabled={isTranslating || !currentPromptState.enabled} className="flex items-center gap-2 text-xs px-3 py-1.5 bg-accent/20 dark:bg-dark-accent/20 text-accent dark:text-dark-accent hover:bg-accent/30 dark:hover:bg-dark-accent/30 rounded-md transition-colors disabled:opacity-50">
                            <SparklesIcon className="h-3.5 w-3.5" />
                            {t('promptEditor.improveWithAI')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const PresetSelector: React.FC<{ presets: Preset[] }> = ({ presets }) => {
    const { t, selectedPreset, handleSelectPreset } = useAppContext();
    const clickablePresets = presets.filter(p => p.name !== 'Personalized');

    return (
        <div className="w-full">
            <div className="mb-2 flex items-center gap-2"><h3 className="text-lg font-bold">{t('presetTitle')}</h3><span className="text-xs text-secondary-text">{t('presetDescription')}</span></div>
            <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                {clickablePresets.map(p => {
                    const isSelected = p.name === selectedPreset;
                    const isFullPower = p.name === 'Full Power';
                    const baseClasses = `flex-1 min-w-[120px] text-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 border-2`;
                    let stateClasses = isSelected ? (isFullPower ? 'bg-accent dark:bg-dark-accent text-accent-text dark:text-dark-accent-text border-accent dark:border-dark-accent font-bold shadow-lg shadow-accent/30' : 'bg-accent dark:bg-dark-accent text-accent-text dark:text-dark-accent-text border-accent dark:border-dark-accent') : (isFullPower ? 'border-accent dark:border-dark-accent bg-transparent text-accent dark:text-dark-accent hover:bg-accent/10 dark:hover:bg-dark-accent/10 font-bold' : 'border-border-color dark:border-dark-border-color bg-tertiary dark:bg-dark-tertiary text-primary-text dark:text-dark-primary-text hover:border-accent/50 dark:hover:border-dark-accent/50');
                    return <button key={p.name} onClick={() => handleSelectPreset(p)} className={`${baseClasses} ${stateClasses}`}>{p.name}</button>;
                })}
                {selectedPreset === 'Personalized' && <div className="flex-1 min-w-[120px] text-center px-4 py-2 text-sm font-medium rounded-md border-2 border-dashed border-accent dark:border-dark-accent bg-accent/5 dark:bg-dark-accent/5 text-accent dark:text-dark-accent">{t('presetPersonalized')}</div>}
            </div>
        </div>
    );
};


interface SettingsViewProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: SettingsTab;
    translating: keyof AIPromptConfig | null;
    onTranslate: (promptType: keyof AIPromptConfig, lang: 'Italian' | 'English') => void;
    onImprovePromptRequest: (promptId: keyof AIPromptConfig) => void;
}


/**
 * Modale UI per la visualizzazione e la modifica delle impostazioni dell'applicazione.
 * @param {object} props - Le props del componente.
 * @returns {JSX.Element | null}
 */
export const SettingsView: React.FC<SettingsViewProps> = ({ isOpen, onClose, initialTab = 'general', translating, onTranslate, onImprovePromptRequest }) => {
    const { appSettings, handleSaveSettings, modelsByProvider, t, aiConfig, presets } = useAppContext();
    const [settings, setSettings] = useState<AppSettings>(appSettings);
    const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

    useEffect(() => {
        if (isOpen) {
            setSettings(appSettings);
            setActiveTab(initialTab);
        }
    }, [isOpen, appSettings, initialTab]);

    if (!isOpen) return null;

    const handleSave = () => {
        handleSaveSettings(settings);
        onClose();
    };
    
    const setSetting = (key: keyof AppSettings, value: any) => {
        setSettings(s => ({ ...s, [key]: value }));
    };

    const TabButton: React.FC<{ tabId: SettingsTab; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabId ? 'bg-accent text-accent-text' : 'text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-primary dark:bg-dark-primary rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-color dark:border-dark-border-color">
                    <h2 className="text-xl font-bold">{t('settings.title')}</h2>
                    <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{t('settings.description')}</p>
                </header>
                
                <div className="p-4 border-b border-border-color dark:border-dark-border-color flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <TabButton tabId="general">{t('settings.tabs.general')}</TabButton>
                        <TabButton tabId="ai">{t('settings.tabs.aiBehavior')}</TabButton>
                    </div>
                </div>

                <main className="p-6 flex-grow overflow-y-auto space-y-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="p-4 border border-dashed border-border-color dark:border-dark-border-color rounded-lg space-y-4">
                                <h3 className="font-semibold text-base">{t('settings.general')}</h3>
                                <div>
                                    <label htmlFor="global-language" className="block text-sm font-medium mb-1">{t('settings.globalLanguage')}</label>
                                    <p className="text-xs text-secondary-text mb-2">{t('settings.globalLanguageDesc')}</p>
                                    <select
                                        id="global-language"
                                        value={settings.globalLanguage}
                                        onChange={(e) => setSetting('globalLanguage', e.target.value as 'it' | 'en')}
                                        className="w-full text-sm bg-secondary dark:bg-dark-secondary border border-border-color dark:border-dark-border-color rounded-md px-2 py-2 focus:ring-accent focus:border-accent"
                                    >
                                        <option value="it">{t('settings.langIt')}</option>
                                        <option value="en">{t('settings.langEn')}</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="p-4 border border-dashed border-border-color dark:border-dark-border-color rounded-lg space-y-4">
                                <h3 className="font-semibold text-base">{t('settings.defaultModels')}</h3>
                                <ModelSelector
                                    label={t('settings.generalDefault')}
                                    description={t('settings.generalDefaultDesc')}
                                    selectedProvider={settings.defaultProvider}
                                    selectedModel={settings.defaultModel}
                                    onProviderChange={(p) => setSetting('defaultProvider', p)}
                                    onModelChange={(m) => setSetting('defaultModel', m)}
                                    modelsByProvider={modelsByProvider}
                                />
                                <ModelSelector
                                    label={t('settings.conversationalArchitect')}
                                    description={t('settings.conversationalArchitectDesc')}
                                    selectedProvider={settings.architectProvider}
                                    selectedModel={settings.architectModel}
                                    onProviderChange={(p) => setSetting('architectProvider', p)}
                                    onModelChange={(m) => setSetting('architectModel', m)}
                                    modelsByProvider={modelsByProvider}
                                />
                                <ModelSelector
                                    label={t('settings.promptImprovementChat')}
                                    description={t('settings.promptImprovementChatDesc')}
                                    selectedProvider={settings.promptImprovementProvider}
                                    selectedModel={settings.promptImprovementModel}
                                    onProviderChange={(p) => setSetting('promptImprovementProvider', p)}
                                    onModelChange={(m) => setSetting('promptImprovementModel', m)}
                                    modelsByProvider={modelsByProvider}
                                />
                            </div>

                             <div className="p-4 border border-dashed border-border-color dark:border-dark-border-color rounded-lg space-y-4">
                                <h3 className="font-semibold text-base">{t('settings.integrations')}</h3>
                                <APIKeyInput label={t('settings.githubPat')} value={settings.githubPat} onChange={(v) => setSetting('githubPat', v)}>
                                    <p dangerouslySetInnerHTML={{ __html: t('settings.githubPatHelp')}} />
                                </APIKeyInput>
                            </div>

                            <h3 className="font-semibold text-base pt-4 border-t border-border-color dark:border-dark-border-color">{t('settings.apiKeys')}</h3>
                            <APIKeyInput label={t('settings.googleApiKey')} value="" onChange={() => {}} isNote>
                                {t('settings.googleApiEnvVar')} <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noopener noreferrer" className="text-accent dark:text-dark-accent font-bold underline">{t('settings.googleApiHelp')}</a>
                            </APIKeyInput>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <APIKeyInput label={t('settings.openRouterApiKey')} value={settings.openRouterApiKey} onChange={(v) => setSetting('openRouterApiKey', v)} helpLink="https://openrouter.ai/keys" helpText={t('settings.openRouterApiHelp')}/>
                                <APIKeyInput label={t('settings.groqApiKey')} value={settings.groqApiKey} onChange={(v) => setSetting('groqApiKey', v)} helpLink="https://console.groq.com/keys" helpText={t('settings.groqApiHelp')}/>
                                <APIKeyInput label={t('settings.togetherApiKey')} value={settings.togetherApiKey} onChange={(v) => setSetting('togetherApiKey', v)} helpLink="https://api.together.xyz/settings/api-keys" helpText={t('settings.togetherApiHelp')}/>
                                <APIKeyInput label={t('settings.perplexityApiKey')} value={settings.perplexityApiKey} onChange={(v) => setSetting('perplexityApiKey', v)} helpLink="https://docs.perplexity.ai/docs/getting-started" helpText={t('settings.perplexityApiHelp')}/>
                                <APIKeyInput label={t('settings.cohereApiKey')} value={settings.cohereApiKey} onChange={(v) => setSetting('cohereApiKey', v)} helpLink="https://dashboard.cohere.com/api-keys" helpText={t('settings.cohereApiHelp')}/>
                            </div>
                            <p className="text-xs text-secondary-text mt-2 p-3 bg-tertiary dark:bg-dark-tertiary rounded-md">{t('settings.keyStorageNotice')}</p>
                        </div>
                    )}
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            <PresetSelector presets={presets} />
                            <div className="border-t border-border-color dark:border-dark-border-color my-6"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:items-start">
                                {Object.values(aiConfig).map((prompt) => (
                                     <PromptEditor key={prompt.id} prompt={prompt} onTranslate={(lang) => onTranslate(prompt.id, lang)} onImproveRequest={() => onImprovePromptRequest(prompt.id)} isTranslating={translating === prompt.id} />
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                <footer className="p-4 border-t border-border-color dark:border-dark-border-color flex justify-end items-center gap-4 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary rounded-lg transition-colors">{t('settings.cancel')}</button>
                    <button onClick={handleSave} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors">{t('settings.save')}</button>
                </footer>
            </div>
        </div>
    );
};