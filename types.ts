/**
 * @file Contiene le definizioni dei tipi TypeScript globali utilizzati in tutta l'applicazione.
 * @module types
 */

/**
 * Rappresenta un singolo file all'interno della struttura del progetto.
 * @interface ParsedFile
 * @property {string} path - Il percorso completo del file, incluse le directory.
 * @property {string} content - Il contenuto testuale del file.
 */
export interface ParsedFile {
  path: string;
  content: string;
}

/**
 * Rappresenta una richiesta di caricamento di file da parte dell'utente.
 * Include un flag per la decompressione opzionale degli archivi ZIP.
 * @interface FileUploadRequest
 * @property {File} file - L'oggetto File nativo del browser.
 * @property {boolean} decompress - Se `true`, l'applicazione tenterà di decomprimere il file se è un archivio ZIP.
 */
export interface FileUploadRequest {
  file: File;
  decompress: boolean;
}

/**
 * Definisce i provider AI supportati.
 * @typedef {('google' | 'openrouter' | 'groq' | 'together' | 'perplexity' | 'cohere')} Provider
 */
export type Provider = 'google' | 'openrouter' | 'groq' | 'together' | 'perplexity' | 'cohere';

/**
 * Definisce le modalità di input disponibili per l'utente.
 */
export type InputMode = 'upload' | 'github' | 'text' | 'gemini';


/**
 * Rappresenta un prompt AI configurabile dall'utente.
 * Può essere abilitato/disabilitato e può avere un provider e un modello AI specifici assegnati.
 * @interface EditablePrompt
 * @property {keyof AIPromptConfig} id - Un identificatore univoco per il prompt.
 * @property {string} title - Un titolo leggibile per l'interfaccia utente.
 * @property {string} description - Una breve descrizione della funzione del prompt.
 * @property {string} content - Il testo del template del prompt vero e proprio.
 * @property {boolean} enabled - Se `true`, questo prompt verrà utilizzato durante il processo di generazione.
 * @property {Provider} provider - Il provider AI da utilizzare per questo prompt.
 * @property {string} model - Il modello AI specifico da utilizzare.
 */
export interface EditablePrompt {
    id: keyof AIPromptConfig;
    title: string;
    description: string;
    content: string;
    enabled: boolean;
    provider: Provider;
    model: string;
}

/**
 * Definisce la struttura per l'intero stato di configurazione dell'AI,
 * contenente tutti i prompt modificabili dall'utente.
 * @interface AIPromptConfig
 */
export interface AIPromptConfig {
    projectOverview: EditablePrompt;
    fileFinder: EditablePrompt;
    docExtractor: EditablePrompt;
    readmeGenerator: EditablePrompt;
    wikiGenerator: EditablePrompt;
    codeRefactorer: EditablePrompt;
    codeReviewer: EditablePrompt;
    testGenerator: EditablePrompt;
    projectNameSuggester: EditablePrompt;
    docstringGenerator: EditablePrompt;
    architect: EditablePrompt;
    translator: EditablePrompt;
    commitMessageGenerator: EditablePrompt;
}

/**
 * Rappresenta le impostazioni globali dell'applicazione, incluse le credenziali API
 * e i modelli predefiniti per ciascun provider.
 * @interface AppSettings
 */
export interface AppSettings {
    googleApiKey: string;
    openRouterApiKey: string;
    groqApiKey: string;
    togetherApiKey: string;
    perplexityApiKey: string;
    cohereApiKey: string;
    githubPat: string;
    defaultProvider: Provider;
    defaultModel: string;
    promptImprovementProvider: Provider;
    promptImprovementModel: string;
    architectProvider: Provider;
    architectModel: string;
    globalLanguage: 'it' | 'en';
}

/**
 * Definisce la struttura per una configurazione preimpostata (preset).
 * Consente agli utenti di applicare rapidamente un insieme di stati abilitato/disabilitato,
 * provider e modelli ai prompt.
 * @interface Preset
 * @property {('Speedy Draft' | 'Code Generation' | 'Documentation Pro' | 'Test & Document' | 'Wiki Generator' | 'Code Polisher' | 'Full Power' | 'Personalized')} name - Il nome del preset.
 * @property {Partial<Record<keyof AIPromptConfig, { enabled?: boolean, provider?: Provider, model?: string }>>} config - La configurazione parziale da applicare.
 */
export interface Preset {
    name: 'Speedy Draft' | 'Code Generation' | 'Documentation Pro' | 'Test & Document' | 'Wiki Generator' | 'Code Polisher' | 'Full Power' | 'Personalized';
    config: Partial<Record<keyof AIPromptConfig, { enabled?: boolean, provider?: Provider, model?: string }>>;
}

/**
 * Rappresenta un suggerimento generato dall'AI, come un nuovo file.
 * Utilizzato per la modale interattiva dei suggerimenti.
 * @interface AISuggestion
 * @property {string} id - Un ID univoco per il suggerimento (utilizzato per la chiave React).
 * @property {'file'} type - Il tipo di suggerimento.
 * @property {string} path - Il percorso del file suggerito.
 * @property {string} content - Il contenuto del file suggerito.
 * @property {boolean} accepted - Se l'utente ha contrassegnato questo suggerimento per l'accettazione.
 */
export interface AISuggestion {
  id: string;
  type: 'file';
  path: string;
  content: string;
  accepted: boolean;
}

/**
 * Rappresenta un prompt di esempio bilingue per la sezione "Inizia con un esempio".
 * @interface ExamplePrompt
 */
export interface ExamplePrompt {
    en: {
        title: string;
        content: string;
    };
    it: {
        title: string;
        content: string;
    };
}

/**
 * Rappresenta un singolo messaggio in una sessione di chat interattiva.
 * @interface ChatMessage
 * @property {('user' | 'model')} role - Il ruolo dell'autore del messaggio.
 * @property {string} content - Il contenuto testuale del messaggio.
 */
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * @interface MultipartAIRequest
 * Definisce i parametri per una richiesta di generazione multimodale (es. testo + dati).
 */
export interface MultipartAIRequest {
    provider: 'google'; // La trascrizione è attualmente specifica per Gemini
    settings: AppSettings;
    model: string;
    textPart: string;
    dataPart: {
        mimeType: string;
        data: string; // Dati codificati in base64
    };
}