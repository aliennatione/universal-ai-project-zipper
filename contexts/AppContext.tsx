import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode, useMemo } from 'react';
import { AppSettings, AIPromptConfig, Provider, Preset } from '../types';
import { listModels } from '../services/aiClient';
import { promptsConfig, presets } from '../services/prompts';
import { getTranslations, Language } from '../services/i18n';

interface AppContextType {
    appSettings: AppSettings;
    aiConfig: AIPromptConfig;
    modelsByProvider: Record<Provider, string[]>;
    isLoadingSettings: boolean;
    selectedPreset: Preset['name'] | null;
    presets: Preset[];
    t: (key: string, ...args: any[]) => string;
    handleSaveSettings: (newSettings: AppSettings, newAiConfig?: AIPromptConfig, newPreset?: Preset['name'] | null) => void;
    handleSelectPreset: (preset: Preset) => void;
    handlePromptChange: (id: keyof AIPromptConfig, newContent: string) => void;
    handleTogglePrompt: (id: keyof AIPromptConfig) => void;
    handleProviderChange: (id: keyof AIPromptConfig, provider: Provider) => void;
    handleModelChange: (id: keyof AIPromptConfig, model: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const KNOWN_APP_SETTINGS_KEYS: (keyof AppSettings)[] = [
    'googleApiKey', 'openRouterApiKey', 'groqApiKey', 'togetherApiKey',
    'perplexityApiKey', 'cohereApiKey', 'githubPat',
    'defaultProvider', 'defaultModel',
    'promptImprovementProvider', 'promptImprovementModel',
    'architectProvider', 'architectModel',
    'globalLanguage',
];

const initialSettings: AppSettings = {
    googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    openRouterApiKey: '',
    groqApiKey: '',
    togetherApiKey: '',
    perplexityApiKey: '',
    cohereApiKey: '',
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
 * Extracts only the user-configurable fields from an aiConfig prompt entry.
 * Avoids serializing large content strings unless modified, and strips derived
 * fields (title, description, id) that are regenerated from prompts.ts on load.
 */
type PromptPersistable = {
    enabled: boolean;
    provider: Provider;
    model: string;
    content: string;
};

type AiConfigPersisted = Partial<Record<keyof AIPromptConfig, PromptPersistable>>;

function extractPersistableAiConfig(aiConfig: AIPromptConfig): AiConfigPersisted {
    const result: AiConfigPersisted = {};
    for (const key in aiConfig) {
        const promptKey = key as keyof AIPromptConfig;
        const prompt = aiConfig[promptKey];
        result[promptKey] = {
            enabled: prompt.enabled,
            provider: prompt.provider,
            model: prompt.model,
            content: prompt.content,
        };
    }
    return result;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [appSettings, setAppSettings] = useState<AppSettings>(initialSettings);
    const [configBaseSettings, setConfigBaseSettings] = useState<AppSettings | null>(null);
    
    const [modelsByProvider, setModelsByProvider] = useState<Record<Provider, string[]>>({
        google: ['gemini-2.5-flash'], openrouter: [], groq: [], together: [], perplexity: [], cohere: [],
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
        if (typeof template === 'function') return template(...args);
        return template || key;
    }, [translations]);

    const saveToLocalStorage = useCallback((settings: AppSettings, config: AIPromptConfig, presetName: Preset['name'] | null) => {
        try {
            localStorage.setItem('upz-settings', JSON.stringify({
                appSettings: settings,
                // Only persist the user-configurable fields; title/description/id are
                // regenerated from prompts.ts on every boot, avoiding stale data.
                aiConfig: extractPersistableAiConfig(config),
                selectedPreset: presetName
            }));
        } catch (e) {
            console.error("Failed to save settings to localStorage", e);
        }
    }, []);

    useEffect(() => {
        let settingsToLoad = { ...initialSettings };
        let loadedAiConfig: AiConfigPersisted | null = null;
        let loadedPreset: Preset['name'] | null = null;

        try {
            const savedSettingsJSON = localStorage.getItem('upz-settings');
            if (savedSettingsJSON) {
                const parsed = JSON.parse(savedSettingsJSON);

                // FIX: Only copy known AppSettings keys to avoid contaminating
                // settingsToLoad with aiConfig/selectedPreset from the old format
                // where `parsed` itself was the settings object.
                const rawSettings = parsed.appSettings || parsed;
                const cleanSettings: Partial<AppSettings> = {};
                for (const k of KNOWN_APP_SETTINGS_KEYS) {
                    if (rawSettings[k] !== undefined) {
                        (cleanSettings as any)[k] = rawSettings[k];
                    }
                }
                settingsToLoad = { ...settingsToLoad, ...cleanSettings };

                if (!settingsToLoad.googleApiKey) {
                    settingsToLoad.googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
                }
                if (parsed.aiConfig) {
                    loadedAiConfig = parsed.aiConfig;
                }
                if (parsed.selectedPreset !== undefined) {
                    loadedPreset = parsed.selectedPreset;
                }
            }
        } catch (e) {
            console.error("Failed to parse settings from localStorage, resetting to defaults.", e);
            localStorage.removeItem('upz-settings');
        }
        
        const lang = settingsToLoad.globalLanguage || 'it';
        const currentTranslations = getTranslations(lang as Language);
        
        setAppSettings(settingsToLoad);
        setConfigBaseSettings(settingsToLoad);

        const defaultPresetName = loadedPreset ?? 'Code Generation';
        setSelectedPreset(defaultPresetName);
        
        setAiConfig(() => {
            const defaultConfig = promptsConfig(currentTranslations, settingsToLoad);
            if (loadedAiConfig) {
                const mergedConfig = { ...defaultConfig };
                for (const key in loadedAiConfig) {
                    const promptKey = key as keyof AIPromptConfig;
                    if (mergedConfig[promptKey]) {
                        const saved = loadedAiConfig[promptKey]!;
                        mergedConfig[promptKey] = {
                            ...mergedConfig[promptKey],
                            enabled: saved.enabled ?? mergedConfig[promptKey].enabled,
                            provider: saved.provider ?? mergedConfig[promptKey].provider,
                            // FIX: Only restore model if it's a non-empty string
                            model: saved.model || mergedConfig[promptKey].model,
                            content: saved.content ?? mergedConfig[promptKey].content,
                        };
                    }
                }
                return mergedConfig;
            }

            const initialPreset = presets.find(p => p.name === defaultPresetName) || presets.find(p => p.name === 'Code Generation')!;
            for (const key in initialPreset.config) {
                const promptKey = key as keyof AIPromptConfig;
                if (defaultConfig[promptKey]) {
                    const presetValue = initialPreset.config[promptKey];
                    if (presetValue?.enabled !== undefined) defaultConfig[promptKey].enabled = presetValue.enabled;
                    if (presetValue?.provider) defaultConfig[promptKey].provider = presetValue.provider;
                    if (presetValue?.model) defaultConfig[promptKey].model = presetValue.model;
                }
            }
            return defaultConfig;
        });
        
        setIsLoadingSettings(false);
    }, []);

    const handleSelectPreset = useCallback((preset: Preset, forceUpdate = false) => {
        if (preset.name === selectedPreset && !forceUpdate) return;
        
        setSelectedPreset(preset.name);
        setAiConfig(currentConfig => {
            const newConfig = promptsConfig(translations, appSettings);
            for (const key in preset.config) {
                const promptKey = key as keyof AIPromptConfig;
                if (newConfig[promptKey]) {
                    const presetValue = preset.config[promptKey];
                    if (presetValue?.enabled !== undefined) newConfig[promptKey].enabled = presetValue.enabled;
                    if (presetValue?.provider) newConfig[promptKey].provider = presetValue.provider;
                    if (presetValue?.model) newConfig[promptKey].model = presetValue.model;
                }
            }
            saveToLocalStorage(appSettings, newConfig, preset.name);
            return newConfig;
        });
    }, [appSettings, translations, selectedPreset, saveToLocalStorage]);
    
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
                openrouter: results[1], groq: results[2], together: results[3], perplexity: results[4], cohere: results[5],
            });
        };
        fetchAllModels();
    }, [appSettings]);

    const handleSaveSettings = useCallback((
        newSettings: AppSettings,
        newAiConfig?: AIPromptConfig,
        newPreset?: Preset['name'] | null
    ) => {
        const updatedConfig = newAiConfig ? { ...newAiConfig } : { ...aiConfig };
        const updatedPreset = newPreset !== undefined ? newPreset : selectedPreset;

        const oldDefaults = { provider: configBaseSettings?.defaultProvider || 'google', model: configBaseSettings?.defaultModel || 'gemini-2.5-flash' };
        const newDefaults = { provider: newSettings.defaultProvider, model: newSettings.defaultModel };

        if (oldDefaults.provider !== newDefaults.provider || oldDefaults.model !== newDefaults.model) {
            for (const key in updatedConfig) {
                const promptKey = key as keyof AIPromptConfig;
                const prompt = updatedConfig[promptKey];
                
                if (prompt.provider === oldDefaults.provider && prompt.model === oldDefaults.model) {
                    updatedConfig[promptKey] = { ...prompt, provider: newDefaults.provider, model: newDefaults.model };
                }
            }
        }

        if (configBaseSettings?.promptImprovementProvider === configBaseSettings?.defaultProvider && configBaseSettings?.promptImprovementModel === configBaseSettings?.defaultModel) {
            newSettings.promptImprovementProvider = newSettings.defaultProvider;
            newSettings.promptImprovementModel = newSettings.defaultModel;
        }
        if (configBaseSettings?.architectProvider === configBaseSettings?.defaultProvider && configBaseSettings?.architectModel === configBaseSettings?.defaultModel) {
            newSettings.architectProvider = newSettings.defaultProvider;
            newSettings.architectModel = newSettings.defaultModel;
        }

        // FIX: Guard against empty model strings (can happen when a provider has no
        // models fetched yet and the select defaults to '').
        for (const key in updatedConfig) {
            const promptKey = key as keyof AIPromptConfig;
            if (!updatedConfig[promptKey].model) {
                updatedConfig[promptKey] = { ...updatedConfig[promptKey], model: newSettings.defaultModel };
            }
        }

        setAppSettings(newSettings);
        setConfigBaseSettings(newSettings);
        setAiConfig(updatedConfig);
        setSelectedPreset(updatedPreset);

        saveToLocalStorage(newSettings, updatedConfig, updatedPreset);
    }, [aiConfig, selectedPreset, configBaseSettings, saveToLocalStorage]);

    const handlePromptChange = useCallback((id: keyof AIPromptConfig, newContent: string) => {
        setSelectedPreset('Personalized');
        setAiConfig(prev => {
            const next = { ...prev, [id]: { ...prev[id], content: newContent } };
            saveToLocalStorage(appSettings, next, 'Personalized');
            return next;
        });
    }, [appSettings, saveToLocalStorage]);

    const handleTogglePrompt = useCallback((id: keyof AIPromptConfig) => {
        setSelectedPreset('Personalized');
        setAiConfig(prev => {
            const next = { ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } };
            saveToLocalStorage(appSettings, next, 'Personalized');
            return next;
        });
    }, [appSettings, saveToLocalStorage]);
    
    const handleProviderChange = useCallback((id: keyof AIPromptConfig, provider: Provider) => {
        setSelectedPreset('Personalized');
        const defaultModel = modelsByProvider[provider]?.[0] || '';
        setAiConfig(prev => {
            const next = { ...prev, [id]: { ...prev[id], provider, model: defaultModel } };
            saveToLocalStorage(appSettings, next, 'Personalized');
            return next;
        });
    }, [appSettings, modelsByProvider, saveToLocalStorage]);

    const handleModelChange = useCallback((id: keyof AIPromptConfig, model: string) => {
        setSelectedPreset('Personalized');
        setAiConfig(prev => {
            const next = { ...prev, [id]: { ...prev[id], model } };
            saveToLocalStorage(appSettings, next, 'Personalized');
            return next;
        });
    }, [appSettings, saveToLocalStorage]);

    const value = useMemo(() => ({
        appSettings, aiConfig, modelsByProvider, isLoadingSettings, selectedPreset, presets, t,
        handleSaveSettings, handleSelectPreset, handlePromptChange, handleTogglePrompt, handleProviderChange, handleModelChange,
    }), [
        appSettings, aiConfig, modelsByProvider, isLoadingSettings, selectedPreset, t, presets,
        handleSaveSettings, handleSelectPreset, handlePromptChange, handleTogglePrompt, handleProviderChange, handleModelChange
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
