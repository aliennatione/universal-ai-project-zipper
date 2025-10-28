import { GoogleGenAI, Type } from "@google/genai";
import { Provider, ChatMessage, AppSettings, MultipartAIRequest } from '../types';

/**
 * @file Funge da adattatore unificato per interagire con vari provider di AI.
 * Traduce le richieste interne standardizzate nel formato specifico richiesto da ogni API di terze parti.
 * @module aiClient
 */

const googleClientCache = new Map<string, GoogleGenAI>();

/**
 * Recupera o crea un'istanza singleton del client GoogleGenAI per una data chiave API.
 * @param {string} apiKey - La chiave API di Google.
 * @returns {GoogleGenAI} L'istanza del client.
 * @throws Se la chiave API non viene fornita.
 */
const getGoogleClient = (apiKey: string): GoogleGenAI => {
    if (!apiKey) throw new Error("Errore del Client Google: la chiave API non è fornita.");
    if (googleClientCache.has(apiKey)) return googleClientCache.get(apiKey)!;
    const newClient = new GoogleGenAI({ apiKey });
    googleClientCache.set(apiKey, newClient);
    return newClient;
};

const PROVIDER_CONFIG = {
    google: {
        models: ['gemini-2.5-flash']
    },
    openrouter: {
        baseURL: 'https://openrouter.ai/api/v1',
    },
    groq: {
        baseURL: 'https://api.groq.com/openai/v1',
    },
    together: {
        baseURL: 'https://api.together.xyz/v1',
    },
    perplexity: {
        baseURL: 'https://api.perplexity.ai',
    },
    cohere: {
        baseURL: 'https://api.cohere.com/v1',
    }
};

/**
 * Recupera i modelli per un provider compatibile con API OpenAI.
 * @private
 */
const fetchOpenAICompatibleModels = async (baseUrl: string, apiKey: string): Promise<string[]> => {
    try {
        const response = await fetch(`${baseUrl}/models`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) {
            console.error(`Impossibile recuperare i modelli da ${baseUrl}:`, response.statusText);
            return [];
        }
        const data = await response.json();
        const modelList = data.data || data;
        if (!Array.isArray(modelList)) return [];

        return modelList
          .map((model: any) => model.id)
          .filter(id => !id.includes('embed')) // Filtra i modelli di embedding
          .sort();
    } catch (error) {
        console.error(`Errore nel recuperare i modelli da ${baseUrl}:`, error);
        return [];
    }
};

/**
 * Recupera dinamicamente l'elenco dei modelli disponibili dal provider selezionato.
 * @param {Provider} provider - Il provider AI da cui recuperare i modelli.
 * @param {string} apiKey - La chiave API per il provider selezionato.
 * @returns {Promise<string[]>} Una promessa che si risolve in un array di ID di modello.
 */
export const listModels = async (provider: Provider, apiKey: string): Promise<string[]> => {
    if (!apiKey) return [];
    
    if (provider === 'google') {
        return PROVIDER_CONFIG.google.models;
    }

    if (provider === 'cohere') {
        return ['command-r', 'command-r-plus', 'command-light'];
    }

    const config = PROVIDER_CONFIG[provider];
    if (config?.baseURL) {
        return fetchOpenAICompatibleModels(config.baseURL, apiKey);
    }
    
    return [];
};

const getApiKeyForProvider = (settings: AppSettings, provider: Provider): string => {
    switch(provider) {
        case 'google': return settings.googleApiKey;
        case 'openrouter': return settings.openRouterApiKey;
        case 'groq': return settings.groqApiKey;
        case 'together': return settings.togetherApiKey;
        case 'perplexity': return settings.perplexityApiKey;
        case 'cohere': return settings.cohereApiKey;
        default: return '';
    }
};

/**
 * @interface AIRequest
 * Definisce i parametri per una richiesta di generazione di contenuto a turno singolo.
 */
interface AIRequest {
    provider: Provider;
    settings: AppSettings;
    model: string;
    prompt: string;
    jsonMode?: boolean;
    systemInstruction?: string;
    responseSchema?: any;
}

/**
 * @interface AIResponse
 * Definisce la forma standardizzata della risposta da una chiamata AI.
 */
interface AIResponse {
    text: string;
}

/**
 * Esegue una richiesta di chat a un provider compatibile con API OpenAI.
 * @private
 */
const executeOpenAICompatibleRequest = async (
    provider: Provider,
    config: { baseURL: string },
    apiKey: string,
    body: object
): Promise<AIResponse> => {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.href, 
            'X-Title': 'UPZ0.3'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Errore API ${provider}: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    
    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
        throw new Error(`Risposta API ${provider} non valida: ${JSON.stringify(data)}`);
    }
    return { text: data.choices[0].message.content };
};

/**
 * La funzione di generazione AI unificata. Agisce come un adattatore per comunicare con il provider AI selezionato.
 * @param {AIRequest} request - L'oggetto di richiesta consolidato contenente impostazioni, prompt e opzioni.
 * @returns {Promise<AIResponse>} Una promessa che si risolve in un oggetto di risposta standardizzato.
 * @throws Se la chiave API è mancante o si verifica un errore API.
 */
export const performAiGeneration = async (request: AIRequest): Promise<AIResponse> => {
    const { provider, settings, model, prompt, jsonMode = false, systemInstruction, responseSchema } = request;
    const apiKey = getApiKeyForProvider(settings, provider);

    if (!apiKey) throw new Error(`La chiave API per il provider ${provider} non è impostata.`);

    if (provider === 'google') {
        const client = getGoogleClient(apiKey);
        const config: any = {};
        if (jsonMode) {
            config.responseMimeType = "application/json";
            if (responseSchema) {
                config.responseSchema = responseSchema;
            } else {
                throw new Error("Il provider Google richiede uno 'responseSchema' valido quando 'jsonMode' è abilitato.");
            }
        }
        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        }

        const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: Object.keys(config).length > 0 ? config : undefined,
        });
        return { text: response.text };
    }
    
    if (provider === 'cohere') {
        const body: any = { model, message: prompt, preamble: systemInstruction };
        const response = await fetch(`${PROVIDER_CONFIG.cohere.baseURL}/chat`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Errore API Cohere: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        return { text: data.text };
    }

    const config = PROVIDER_CONFIG[provider];
    if (config) {
        const messages = [];
        if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
        messages.push({ role: 'user', content: prompt });
        
        const body: any = { model, messages };
        if (jsonMode && provider !== 'perplexity') body.response_format = { type: 'json_object' };
        
        return executeOpenAICompatibleRequest(provider, config, apiKey, body);
    }

    throw new Error(`Provider non supportato: ${provider}`);
};


/**
 * Esegue una richiesta di generazione AI multimodale, combinando testo e dati (es. audio).
 * @param {MultipartAIRequest} request - L'oggetto di richiesta multimodale.
 * @returns {Promise<AIResponse>} Una promessa che si risolve nella risposta dell'AI.
 */
export const performMultipartAiGeneration = async (request: MultipartAIRequest): Promise<AIResponse> => {
    const { provider, settings, model, textPart, dataPart } = request;
    if (provider !== 'google') {
        throw new Error('Le richieste multimodali sono attualmente supportate solo per il provider Google.');
    }
    const apiKey = getApiKeyForProvider(settings, provider);
    if (!apiKey) throw new Error(`La chiave API per il provider ${provider} non è impostata.`);

    const client = getGoogleClient(apiKey);

    const imagePart = {
        inlineData: {
            mimeType: dataPart.mimeType,
            data: dataPart.data,
        },
    };

    const response = await client.models.generateContent({
        model,
        contents: { parts: [{ text: textPart }, imagePart] },
    });

    return { text: response.text };
};


/**
 * @interface AIChatRequest
 * Definisce i parametri per una richiesta di chat multi-turno.
 */
interface AIChatRequest {
    provider: Provider;
    settings: AppSettings;
    model: string;
    messages: ChatMessage[];
    systemInstruction?: string;
}

type OpenAIChatMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

/**
 * La funzione di chat AI unificata per conversazioni multi-turno.
 * @param {AIChatRequest} request - L'oggetto di richiesta di chat consolidato.
 * @returns {Promise<AIResponse>} Una promessa che si risolve in un oggetto di risposta standardizzato.
 * @throws Se la chiave API è mancante o si verifica un errore API.
 */
export const performAiChat = async (request: AIChatRequest): Promise<AIResponse> => {
    const { provider, settings, model, messages, systemInstruction } = request;
    const apiKey = getApiKeyForProvider(settings, provider);

    if (!apiKey) throw new Error(`La chiave API per il provider ${provider} non è impostata.`);

    if (provider === 'google') {
        const client = getGoogleClient(apiKey);

        if (messages.length === 0) {
            const response = await client.models.generateContent({
                model,
                contents: "Ciao, architetto.",
                config: systemInstruction ? { systemInstruction } : undefined,
            });
            return { text: response.text };
        }
        
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
        const lastMessage = messages[messages.length - 1].content;
        
        const chat = client.chats.create({ 
            model, 
            history,
            config: systemInstruction ? { systemInstruction } : undefined,
        });

        const response = await chat.sendMessage({ message: lastMessage });
        return { text: response.text };
    }
    
    if (provider === 'cohere') {
        const chat_history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'USER' : 'CHATBOT',
            message: msg.content
        }));
        const message = messages.length > 0 ? messages[messages.length - 1].content : "Ciao";
        const body: any = { model, message, chat_history: chat_history.length > 0 ? chat_history : undefined, preamble: systemInstruction };
        const response = await fetch(`${PROVIDER_CONFIG.cohere.baseURL}/chat`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Errore API Cohere: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        return { text: data.text };
    }

    const config = PROVIDER_CONFIG[provider];
    if (config) {
        const apiMessages: OpenAIChatMessage[] = [];
        if (systemInstruction) apiMessages.push({ role: 'system', content: systemInstruction });
        messages.forEach(msg => {
            apiMessages.push({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.content });
        });
        const body: any = { model, messages: apiMessages };
        return executeOpenAICompatibleRequest(provider, config, apiKey, body);
    }
    
    throw new Error(`Provider non supportato per la chat: ${provider}`);
};