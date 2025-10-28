import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode, useMemo } from 'react';
import { AppSettings, AIPromptConfig, Provider, Preset } from '../types';
import { listModels } from '../services/aiClient';
import { promptsConfig, presets } from '../services/prompts';
import { getTranslations, Language } from '../services/i18n';

/**
 * @file Fornisce un Context React per la gestione dello stato globale dell'applicazione.
 * Questo include le impostazioni dell'utente, la configurazione dell'AI e i dati correlati.
 * @module AppContext
 */

/**
 * @interface AppContextType
 * Definisce la forma dello stato e delle funzioni di callback fornite dal AppContext.
 */
interface AppContextType {
    appSettings: AppSettings;
    aiConfig: AIPromptConfig;
    modelsByProvider: Record<Provider, string[]>;
    isLoadingSettings: boolean;
    selectedPreset: Preset['name'] | null;
    presets: Preset[];
    t: (key: string, ...args: any[]) => string;
    handleSaveSettings: (newSettings: AppSettings) => void;
    handleSelectPreset: (preset: Preset) => void;
    handlePromptChange: (id: keyof AIPromptConfig, newContent: string) => void;
    handleTogglePrompt: (id: keyof AIPromptConfig) => void;
    handleProviderChange: (id: keyof AIPromptConfig, provider: Provider) => void;
    handleModelChange: (id: keyof AIPromptConfig, model: string) => void;
}

/**
 * Context per lo stato globale dell'applicazione.
 * @type {React.Context<AppContextType | undefined>}
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

const initialSettings: AppSettings = {
    googleApiKey: '', // This will be populated from process.env
    openRouterApiKey: '',
    groqApiKey: '',
    togetherApiKey: '',
    perplexityApiKey: '',
    cohereApiKey: '',
    // FIX: Add missing 'githubPat' property to align with the AppSettings interface.
    githubPat: '',
    defaultProvider: 'google',
    defaultModel: 'gemini-2.5-flash',
    promptImprovementProvider: 'google',
    promptImprovementModel: 'gemini-2.5-flash',
    architectProvider: 'google',
    architectModel: 'gemini-2.5-flash',
    globalLanguage: 'it',
};

/**
 * Il provider del context che incapsula tutta la logica di stato per le impostazioni e la configurazione dell'AI.
 * @param {object} props - Le props del componente React.
 * @param {ReactNode} props.children - I componenti figli che avranno accesso a questo context.
 * @returns {JSX.Element}
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [appSettings, setAppSettings] = useState<AppSettings>(initialSettings);
    const [configBaseSettings, setConfigBaseSettings] = useState<AppSettings | null>(null);
    
    const [modelsByProvider, setModelsByProvider] = useState<Record<Provider, string[]>>({
        google: ['gemini-2.5-flash'],
        openrouter: [],
        groq: [],
        together: [],
        perplexity: [],
        cohere: [],
    });
    
    const [aiConfig, setAiConfig] = useState<AIPromptConfig>(promptsConfig(getTranslations(initialSettings.globalLanguage)));
    const [selectedPreset, setSelectedPreset] = useState<Preset['name'] | null>(null);

    const translations = useMemo(() => getTranslations(appSettings.globalLanguage), [appSettings.globalLanguage]);

    const t = useCallback((key: string, ...args: any[]): string => {
        const keyParts = key.split('.');
        let template = translations as any;
        for (const part of keyParts) {
            if (template === undefined) return key;
            template = template[part];
        }
        if (typeof template === 'function') {
            return template(...args);
        }
        return template || key;
    }, [translations]);

    // Carica le impostazioni iniziali e il preset
    useEffect(() => {
        let settingsToLoad = { ...initialSettings };
        try {
            const savedSettingsJSON = localStorage.getItem('upz-settings');
            if (savedSettingsJSON) {
                // Parse saved settings but exclude googleApiKey
                const { googleApiKey, ...savedSettings } = JSON.parse(savedSettingsJSON);
                settingsToLoad = { ...settingsToLoad, ...savedSettings };
            }
        } catch (e) {
            console.error("Failed to parse settings from localStorage, resetting to defaults.", e);
            localStorage.removeItem('upz-settings');
        }
        
        // Always set the Google API key from the environment
        settingsToLoad.googleApiKey = process.env.API_KEY || '';
        
        const lang = settingsToLoad.globalLanguage || 'it';
        const currentTranslations = getTranslations(lang as Language);
        
        setAppSettings(settingsToLoad);
        setConfigBaseSettings(settingsToLoad);

        const initialPreset = presets.find(p => p.name === 'Code Generation')!;
        setSelectedPreset(initialPreset.name);
        
        setAiConfig(() => {
            const newConfig = promptsConfig(currentTranslations, settingsToLoad);
            for (const key in initialPreset.config) {
                const promptKey = key as keyof AIPromptConfig;
                if (newConfig[promptKey]) {
                    const presetValue = initialPreset.config[promptKey];
                    if (presetValue?.enabled !== undefined) newConfig[promptKey].enabled = presetValue.enabled;
                    if (presetValue?.provider) newConfig[promptKey].provider = presetValue.provider;
                    if (presetValue?.model) newConfig[promptKey].model = presetValue.model;
                }
            }
            return newConfig;
        });
        
        setIsLoadingSettings(false);
    }, []);

    // Aggiorna la configurazione AI quando la lingua cambia
    useEffect(() => {
        setAiConfig(promptsConfig(translations, appSettings));
        // Ricarica il preset corrente per applicare le traduzioni
        const currentPreset = presets.find(p => p.name === selectedPreset);
        if (currentPreset) {
            handleSelectPreset(currentPreset, true);
        }
    }, [appSettings.globalLanguage, translations, appSettings]);

    const handleSelectPreset = useCallback((preset: Preset, forceUpdate = false) => {
        if (preset.name === selectedPreset && !forceUpdate) return;
        
        setSelectedPreset(preset.name);
        setAiConfig(() => {
            const newConfig = promptsConfig(translations, appSettings); // Inizia dalla configurazione di base
            for (const key in preset.config) {
                const promptKey = key as keyof AIPromptConfig;
                if (newConfig[promptKey]) {
                    const presetValue = preset.config[promptKey];
                    if (presetValue?.enabled !== undefined) newConfig[promptKey].enabled = presetValue.enabled;
                    if (presetValue?.provider) newConfig[promptKey].provider = presetValue.provider;
                    if (presetValue?.model) newConfig[promptKey].model = presetValue.model;
                }
            }
            return newConfig;
        });
    }, [appSettings, translations, selectedPreset]);
    
    useEffect(() => {
        const fetchAllModels = async () => {
            const providers: Provider[] = ['google', 'openrouter', 'groq', 'together', 'perplexity', 'cohere'];
            const keys: Record<Provider, string> = {
                google: appSettings.googleApiKey,
                openrouter: appSettings.openRouterApiKey,
                groq: appSettings.groqApiKey,
                together: appSettings.togetherApiKey,
                perplexity: appSettings.perplexityApiKey,
                cohere: appSettings.cohereApiKey,
            };

            const promises = providers.map(p => keys[p] ? listModels(p, keys[p]) : Promise.resolve([]));
            const results = await Promise.all(promises);

            setModelsByProvider({
                google: results[0].length > 0 ? results[0] : ['gemini-2.5-flash'],
                openrouter: results[1],
                groq: results[2],
                together: results[3],
                perplexity: results[4],
                cohere: results[5],
            });
        };
        fetchAllModels();
    }, [appSettings]);

    const handleSaveSettings = useCallback((newSettings: AppSettings) => {
        setAiConfig(currentConfig => {
            const oldDefaults = {
                provider: configBaseSettings?.defaultProvider || 'google',
                model: configBaseSettings?.defaultModel || 'gemini-2.5-flash'
            };
            const newDefaults = { provider: newSettings.defaultProvider, model: newSettings.defaultModel };

            if (oldDefaults.provider === newDefaults.provider && oldDefaults.model === newDefaults.model) {
                return currentConfig;
            }

            const updatedConfig = { ...currentConfig };
            for (const key in updatedConfig) {
                const promptKey = key as keyof AIPromptConfig;
                const prompt = updatedConfig[promptKey];
                
                if (prompt.provider === oldDefaults.provider && prompt.model === oldDefaults.model) {
                    updatedConfig[promptKey] = { ...prompt, provider: newDefaults.provider, model: newDefaults.model };
                }
            }
            return updatedConfig;
        });

        if (configBaseSettings?.promptImprovementProvider === configBaseSettings?.defaultProvider && configBaseSettings?.promptImprovementModel === configBaseSettings?.defaultModel) {
            newSettings.promptImprovementProvider = newSettings.defaultProvider;
            newSettings.promptImprovementModel = newSettings.defaultModel;
        }
        if (configBaseSettings?.architectProvider === configBaseSettings?.defaultProvider && configBaseSettings?.architectModel === configBaseSettings?.defaultModel) {
            newSettings.architectProvider = newSettings.defaultProvider;
            newSettings.architectModel = newSettings.defaultModel;
        }

        // Keep the googleApiKey from the environment, don't save the user's input for it
        const finalSettings = { ...newSettings, googleApiKey: process.env.API_KEY || '' };
        
        setAppSettings(finalSettings);
        setConfigBaseSettings(finalSettings);
        
        // Save to localStorage without the Google API key
        const { googleApiKey, ...settingsToSave } = finalSettings;
        localStorage.setItem('upz-settings', JSON.stringify(settingsToSave));
    }, [configBaseSettings]);

    const handlePromptChange = useCallback((id: keyof AIPromptConfig, newContent: string) => {
        setSelectedPreset('Personalized');
        setAiConfig(prev => ({ ...prev, [id]: { ...prev[id], content: newContent } }));
    }, []);

    const handleTogglePrompt = useCallback((id: keyof AIPromptConfig) => {
        setSelectedPreset('Personalized');
        setAiConfig(prev => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } }));
    }, []);
    
    const handleProviderChange = useCallback((id: keyof AIPromptConfig, provider: Provider) => {
        setSelectedPreset('Personalized');
        const defaultModel = modelsByProvider[provider]?.[0] || '';
        setAiConfig(prev => ({ ...prev, [id]: { ...prev[id], provider, model: defaultModel } }));
    }, [modelsByProvider]);

    const handleModelChange = useCallback((id: keyof AIPromptConfig, model: string) => {
        setSelectedPreset('Personalized');
        setAiConfig(prev => ({ ...prev, [id]: { ...prev[id], model }}));
    }, []);

    const value = useMemo(() => ({
        appSettings,
        aiConfig,
        modelsByProvider,
        isLoadingSettings,
        selectedPreset,
        presets,
        t,
        handleSaveSettings,
        handleSelectPreset,
        handlePromptChange,
        handleTogglePrompt,
        handleProviderChange,
        handleModelChange,
    }), [
        appSettings,
        aiConfig,
        modelsByProvider,
        isLoadingSettings,
        selectedPreset,
        t,
        handleSaveSettings,
        handleSelectPreset,
        handlePromptChange,
        handleTogglePrompt,
        handleProviderChange,
        handleModelChange
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook personalizzato per accedere facilmente al AppContext.
 * @returns {AppContextType} Lo stato e le funzioni del context.
 * @throws Se utilizzato al di fuori di un AppProvider.
 */
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
