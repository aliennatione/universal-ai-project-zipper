import { AIPromptConfig } from '../types';

export type Language = 'it' | 'en';

export const translations = {
  it: {
    // App.tsx
    headerSubtitle: 'Universal AI Project Zipper',
    openSettings: 'Apri impostazioni',
    toggleTheme: 'Cambia tema',
    openUserGuide: 'Apri guida utente',
    errorOccurred: 'Si è verificato un errore:',
    tryAgain: 'Riprova',
    unsavedChanges: "Hai delle modifiche non salvate. Vuoi salvarle prima di cambiare file?",
    processingMessage1: (step: number, total: number) => `${step}/${total}: Elaborazione...`,
    processingMessageExpand: (step: number, total: number) => `${step}/${total}: Espansione idea...`,
    processingMessageParse: (step: number, total: number) => `${step}/${total}: Analisi progetto...`,
    loaderMessage: 'Caricamento configurazione AI...',
    footerText: `© ${new Date().getFullYear()} UPZ0.3. Open-source e guidato dalla comunità.`,
    noNewFilesFound: "L'AI non ha trovato nuovi file.",
    noReadmeFound: "Nessun README.md trovato da migliorare.",
    
    // InputView.tsx & sub-components
    startWithTitle: "Parti da un'Idea o Esempio",
    startWithDescription: "Usa la chat o i prompt per generare la base del tuo progetto.",
    advancedSettingsPrompt: "Vuoi un controllo ancora più granulare?",
    goToAISettings: "Personalizza Comportamento AI",

    newConversationTitle: "Nuova Conversazione",
    newConversationDescription: "Crea da zero la struttura di un progetto parlando con un architetto AI.",
    openArchitectChat: "Apri Chat Architetto",
    
    examplePromptsTitle: "Prompt di Partenza",
    examplePromptsDescription: "Usa questi prompt d'esempio per generare un progetto completo da un'idea.",
    readMore: "Leggi di più",
    copy: "Copia",
        
    presetTitle: "Preset di Configurazione AI",
    presetDescription: "(Selezionane uno)",
    presetPersonalized: "Personalizzato",
    
    uploadFiles: "Carica File",
    githubRepo: "Repository GitHub",
    pastedText: "Incolla Testo",
    geminiChat: "Chat Gemini",
    
    fileUploader: {
        clickToUpload: "Clicca per caricare i file",
        dragAndDrop: "o trascinali",
        uploadHint: "Carica file, un'intera cartella o un archivio ZIP",
        selectFolder: "O seleziona una cartella",
        decompress: "Decomprimi",
        removeAll: "Cancella tutto",
        addMore: "Aggiungi altro",
        generateProject: "Genera Progetto",
    },
    githubUploader: {
        placeholder: "https://github.com/tuo-username/tuo-repo",
        fetchAndGenerate: "Recupera e Genera",
        loading: "Recupero...",
        error: "Impossibile recuperare il repository."
    },
    geminiUploader: {
        title: "Importa da Chat Gemini",
        description: "Incolla un link di condivisione di una chat Gemini o carica un file di testo (.txt, .md) esportato per usare la conversazione come fonte per il progetto.",
        linkPlaceholder: "Incolla qui il link di condivisione di Gemini...",
        linkButton: "Importa da Link",
        or: "OPPURE",
        uploadButton: "Carica da File (.txt, .md)",
        loading: "Elaborazione...",
        errorFile: "Impossibile leggere il file della chat.",
        errorLink: "Impossibile recuperare il contenuto dal link. Questo è probabilmente dovuto a restrizioni di sicurezza del browser (CORS). Prova invece il metodo di caricamento del file."
    },
    pastedTextUploader: {
        placeholder: "Incolla qui la struttura del tuo progetto o generane una usando la funzione 'Inizia con una Conversazione' qui sopra.",
        generateProject: "Genera Progetto",
        clearText: "Pulisci testo"
    },
    
    promptEditor: {
        provider: "Provider",
        model: "Modello",
        noModelFound: "Nessun modello trovato",
        translateToEN: "EN",
        translateToIT: "IT",
        translating: "Traduzione in corso...",
        improveWithAI: "Migliora con AI",
        translationFailed: "Traduzione fallita."
    },
    
    // EditorView.tsx & sub-components
    startOver: "Inizia di nuovo",
    downloadProject: "Scarica Progetto",
    
    fileTree: {
        addNewFile: "Aggiungi Nuovo File",
        add: "Aggiungi",
        deleteConfirmation: (path: string) => `Sei sicuro di voler eliminare ${path}?`,
        newFilePlaceholder: "percorso/al/nuovo-file.js",
        invalidPath: "Percorso file non valido o duplicato."
    },
    fileEditor: {
        selectFile: "Seleziona un file per visualizzarlo o modificarlo",
        saveChanges: "Salva Modifiche",
        saved: "Salvato",
        editingAria: (path: string) => `Modifica del contenuto di ${path}`
    },
    mobileTabs: {
        files: "File",
        editor: "Editor",
        ai: "AI"
    },
    
    // AIActionPanel.tsx
    aiAssistant: "Assistente AI",
    suggestName: "Suggerisci Nome",
    findFiles: "Trova File",
    improveReadme: "Migliora README",
    refactorCode: "Refactoring Codice",
    addDocstrings: "Aggiungi Docstring",
    writeTests: "Scrivi Test",
    generateWiki: "Genera Wiki",
    codeReview: "Revisione Codice",
    aiActionFailed: (msg: string) => `Azione AI fallita: ${msg}`,
    loading: {
        name: "Suggerisco...",
        files: "Cerco File...",
        readme: "Miglioro...",
        refactor: "Refactoring...",
        tests: "Genero...",
        docstrings: "Documento...",
        wiki: "Genero Wiki...",
        review: "Revisiono...",
        commit: "Genero..."
    },
    tooltips: {
        base: "Clicca per: ",
        disabled: "Questa azione è disabilitata nelle tue impostazioni AI.",
        suggestName: "Suggerire un nome di progetto creativo basato sul suo contenuto.",
        findFiles: "Cercare nel contenuto iniziale eventuali file che il parser iniziale potrebbe aver perso.",
        generateWiki: "Generare un set di file di documentazione in stile wiki basati sul contenuto del progetto.",
        improveReadme: "Riscrivere e migliorare il file README.md selezionato.",
        improveReadme_disabled: "Seleziona un file README.md per abilitare questa azione.",
        refactorCode: "Riscrivere il file di codice selezionato per migliorare leggibilità e performance.",
        refactorCode_disabled: "Seleziona un file di codice (es. JS, PY, TS) per abilitare questa azione.",
        addDocstrings: "Aggiungere commenti di documentazione (docstring) al file di codice selezionato.",
        addDocstrings_disabled: "Seleziona un file di codice (es. JS, PY, TS) per abilitare questa azione.",
        writeTests: "Generare un nuovo file di test per il file di codice selezionato.",
        writeTests_disabled: "Seleziona un file di codice (es. JS, PY, TS) per abilitare questa azione.",
        codeReview: "Eseguire una revisione del codice basata su AI per il file selezionato.",
        codeReview_disabled: "Seleziona un file di codice (es. JS, PY, TS) per abilitare questa azione.",
    },

    // SuggestionModal.tsx
    suggestionModal: {
        title: "Suggerimenti File AI",
        description: "L'AI ha trovato questi file aggiuntivi. Rivedi e accetta quelli che vuoi aggiungere.",
        cancel: "Annulla",
        acceptSelected: "Accetta Selezionati"
    },
    
    // DiffView.tsx
    diffView: {
        showingChanges: (path: string) => `Mostra le modifiche per: ${path}`,
        reject: "Rifiuta",
        accept: "Accetta Modifiche"
    },
    
    // ExamplePromptModal.tsx
    examplePromptModal: {
        close: "Chiudi",
        copyPrompt: "Copia Prompt"
    },
    
    // CodeReviewModal.tsx
    codeReviewModal: {
        title: "Risultati Revisione Codice AI",
        description: (filePath: string) => `Analisi AI per il file: ${filePath}`,
        close: "Chiudi",
    },

    // UserGuideModal.tsx
    userGuideModal: {
        title: "Guida Utente",
        loading: "Caricamento guida...",
        error: "Impossibile caricare la guida.",
        close: "Chiudi",
    },
    
    // ProjectChatModal.tsx
    projectChatModal: {
        title: "Chat con l'Architetto del Progetto",
        description: "Definisci i requisiti del tuo progetto con l'AI.",
        close: "Chiudi chat",
        placeholder: "Scrivi il tuo messaggio...",
        send: "Invia",
        generateProject: "Genera Progetto",
        aiError: (msg: string) => `Spiacente, ho riscontrato un errore: ${msg}`,
        generationError: (msg: string) => `Spiacente, ho riscontrato un errore durante la generazione del progetto: ${msg}`,
        toggleTTS: "Attiva/disattiva voce AI",
        toggleLiveChat: "Attiva/disattiva chat vocale live",
        uploadAudio: "Carica file audio per la trascrizione",
        transcriptionError: (msg: string) => `Errore di trascrizione: ${msg}`,
        statusListening: "In ascolto...",
        statusSpeaking: "L'AI sta parlando...",
        statusThinking: "L'AI sta pensando...",
        statusWaiting: "In attesa",
    },
    
    // PromptChatModal.tsx
    promptChatModal: {
        title: "Migliora Prompt",
        description: (promptTitle: string) => `Chatta con un'AI per perfezionare: ${promptTitle}`,
        greeting: (promptTitle: string) => `Ciao! Sono qui per aiutarti a migliorare il prompt "**${promptTitle}**". Come possiamo renderlo migliore?`,
        close: "Chiudi chat",
        placeholder: "Scrivi il tuo messaggio...",
        send: "Invia",
        useLastResponse: "Usa l'ultima risposta dell'AI come nuovo prompt",
        aiError: (msg: string) => `Spiacente, ho riscontrato un errore: ${msg}`,
    },

    // GitHubExportModal.tsx
    githubExport: {
        title: "Esporta su GitHub",
        description: "Effettua il push del tuo progetto su un repository GitHub nuovo o esistente.",
        repoNameLabel: "Nome Repository GitHub",
        repoNamePlaceholder: "owner/nome-repo",
        repoNameHelp: "Es. 'tuo-username/nuovo-progetto'.",
        branchLabel: "Nome Branch",
        branchPlaceholder: "main",
        commitMessageLabel: "Messaggio di Commit",
        commitMessagePlaceholder: "Commit iniziale del progetto",
        generateCommitMessage: "Genera con AI",
        actionTypeLabel: "Tipo di Azione",
        actionTypePush: "Push su Repo Esistente",
        actionTypeCreate: "Crea Nuovo Repo",
        visibilityLabel: "Visibilità",
        visibilityPrivate: "Privato",
        visibilityPublic: "Pubblico",
        cancel: "Annulla",
        export: "Esporta",
        exporting: "Esportazione...",
        successTitle: "Esportazione Riuscita!",
        successMessage: (repo: string) => `Il progetto è stato inviato con successo a ${repo}.`,
        errorTitle: "Esportazione Fallita",
        close: "Chiudi",
        button: "Esporta su GitHub",
        tooltip: "Effettua il push del progetto su un repository GitHub.",
        disabledTooltip: "Aggiungi un Personal Access Token di GitHub nelle Impostazioni per abilitare questa funzione."
    },
    
    // SettingsView.tsx
    settings: {
        title: "Impostazioni",
        description: "Configura i provider AI, i modelli predefiniti e le chiavi API.",
        tabs: {
            general: "Impostazioni Generali",
            aiBehavior: "Comportamento AI"
        },
        general: "Generali",
        globalLanguage: "Lingua Globale",
        globalLanguageDesc: "Imposta la lingua predefinita per l'interfaccia utente e i contenuti.",
        langIt: "Italiano",
        langEn: "English",
        
        defaultModels: "Modelli AI Predefiniti",
        
        generalDefault: "Predefinito Generale",
        generalDefaultDesc: "Il predefinito per tutte le azioni AI a meno che non sia sovrascritto di seguito o in un preset. La modifica di questo potrebbe aggiornare altre impostazioni.",
        
        conversationalArchitect: "Architetto Conversazionale",
        conversationalArchitectDesc: "Il modello utilizzato per la funzione 'Inizia con una Conversazione'.",

        promptImprovementChat: "Chat di Miglioramento Prompt",
        promptImprovementChatDesc: "Il modello utilizzato per la chat 'Migliora con AI' per i prompt.",

        integrations: "Integrazioni",
        githubPat: "GitHub Personal Access Token",
        githubPatHelp: `Necessario per esportare i repository. <a href="https://github.com/settings/tokens/new?scopes=repo&description=UPZ.AI%20Export" target="_blank" rel="noopener noreferrer" class="text-accent dark:text-dark-accent font-bold underline">Crea un token</a> con i permessi 'repo'.`,


        apiKeys: "Chiavi API",
        googleApiKey: "Google Gemini API Key",
        googleApiHelp: "Ottieni qui la tua chiave API di Google.",
        googleApiEnvVar: "La chiave API di Google viene configurata tramite una variabile d'ambiente (`API_KEY`) per una maggiore sicurezza.",
        
        openRouterApiKey: "OpenRouter API Key",
        openRouterApiHelp: "Ottieni qui la tua chiave di OpenRouter.",

        groqApiKey: "Groq API Key",
        groqApiHelp: "Ottieni qui la tua chiave di Groq.",
        
        togetherApiKey: "Together.ai API Key",
        togetherApiHelp: "Ottieni qui la tua chiave di Together.ai.",

        perplexityApiKey: "Perplexity API Key",
        perplexityApiHelp: "Ottieni qui la tua chiave di Perplexity.",
        
        cohereApiKey: "Cohere API Key",
        cohereApiHelp: "Ottieni qui la tua chiave di Cohere.",

        apiKeyPlaceholder: (label: string) => `Inserisci la tua ${label}`,
        showKey: "Mostra",
        hideKey: "Nascondi",
        keyStorageNotice: "Le tue chiavi API sono memorizzate in modo sicuro nel localStorage del tuo browser e non vengono mai inviate ai nostri server.",

        cancel: "Annulla",
        save: "Salva Impostazioni",
    },

    // AI Prompts (titles and descriptions)
    aiPrompts: {
        projectOverview_title: 'Espansione Idea Progetto',
        projectOverview_description: 'Per l\'input di testo, utilizza l\'AI per espandere una breve idea in una struttura di progetto completa prima dell\'analisi.',
        fileFinder_title: 'Ricerca File',
        fileFinder_description: 'Guida l\'AI a trovare file mancanti dall\'input.',
        docExtractor_title: 'Estrattore Documentazione',
        docExtractor_description: 'Guida l\'AI a estrarre note di documentazione dall\'input.',
        readmeGenerator_title: 'Generazione README',
        readmeGenerator_description: 'Istruisce l\'AI su come strutturare e scrivere il file `README.md`.',
        wikiGenerator_title: 'Generazione Repo Wiki',
        wikiGenerator_description: 'Genera una wiki di documentazione completa dal contenuto di input.',
        codeRefactorer_title: 'Refactoring Codice',
        codeRefactorer_description: 'Istruisce l\'AI su come refattorizzare e migliorare il codice di un file.',
        codeReviewer_title: 'Revisione Codice',
        codeReviewer_description: 'Istruisce l\'AI su come eseguire una revisione del codice per un file.',
        testGenerator_title: 'Generazione Test',
        testGenerator_description: 'Istruisce l\'AI su come generare un file di test per un dato file sorgente.',
        projectNameSuggester_title: 'Suggerimento Nome Progetto',
        projectNameSuggester_description: 'Guida l\'AI a suggerire un nome di progetto creativo.',
        docstringGenerator_title: 'Generazione Docstring',
        docstringGenerator_description: 'Guida l\'AI ad aggiungere docstring a funzioni/classi in un file.',
        architect_title: 'Chat Architetto AI',
        architect_description: 'Il prompt di sistema che guida la conversazione nella chat per lo scaffolding del progetto.',
        translator_title: 'Traduttore',
        translator_description: 'Il prompt usato per tradurre i prompt personalizzati. Usa {text} e {targetLanguage}.',
        commitMessageGenerator_title: 'Generatore Messaggio di Commit',
        commitMessageGenerator_description: 'Guida l\'AI a generare messaggi di commit per l\'esportazione su GitHub.',
    },
  },
  en: {
    // App.tsx
    headerSubtitle: 'Universal AI Project Zipper',
    openSettings: 'Open settings',
    toggleTheme: 'Toggle theme',
    openUserGuide: 'Open user guide',
    errorOccurred: 'An error occurred:',
    tryAgain: 'Try Again',
    unsavedChanges: "You have unsaved changes. Do you want to save them before switching files?",
    processingMessage1: (step: number, total: number) => `${step}/${total}: Processing...`,
    processingMessageExpand: (step: number, total: number) => `${step}/${total}: Expanding idea...`,
    processingMessageParse: (step: number, total: number) => `${step}/${total}: Parsing project...`,
    loaderMessage: 'Loading AI configuration...',
    footerText: `© ${new Date().getFullYear()} UPZ0.3. Open-source and community-driven.`,
    noNewFilesFound: "The AI did not find any new files.",
    noReadmeFound: "No README.md found to improve.",
    
    // InputView.tsx & sub-components
    startWithTitle: "Start from an Idea or Example",
    startWithDescription: "Use the chat or prompts to generate your project's foundation.",
    advancedSettingsPrompt: "Want even more granular control?",
    goToAISettings: "Customize AI Behavior",

    newConversationTitle: "New Conversation",
    newConversationDescription: "Create a project structure from scratch by talking to an AI architect.",
    openArchitectChat: "Open Architect Chat",

    examplePromptsTitle: "Starting Prompts",
    examplePromptsDescription: "Don't have a project? Use these example prompts to generate one.",
    readMore: "Read More",
    copy: "Copy",
    
    presetTitle: "AI Configuration Presets",
    presetDescription: "(Select one)",
    presetPersonalized: "Personalized",

    uploadFiles: "Upload Files",
    githubRepo: "GitHub Repository",
    pastedText: "Paste Text",
    geminiChat: "Gemini Chat",

    fileUploader: {
        clickToUpload: "Click to upload files",
        dragAndDrop: "or drag and drop",
        uploadHint: "Upload files, an entire folder, or a ZIP archive",
        selectFolder: "Or select a folder",
        decompress: "Decompress",
        removeAll: "Remove all",
        addMore: "Add more",
        generateProject: "Generate Project",
    },
    githubUploader: {
        placeholder: "https://github.com/your-username/your-repo",
        fetchAndGenerate: "Fetch & Generate",
        loading: "Fetching...",
        error: "Failed to fetch repository."
    },
    geminiUploader: {
        title: "Import from Gemini Chat",
        description: "Paste a Gemini share link or upload an exported text file (.txt, .md) to use the conversation as your project source.",
        linkPlaceholder: "Paste Gemini share link here...",
        linkButton: "Import from Link",
        or: "OR",
        uploadButton: "Upload from File (.txt, .md)",
        loading: "Processing...",
        errorFile: "Failed to read chat file.",
        errorLink: "Could not fetch content from the link. This is likely due to browser security restrictions (CORS). Please try the file upload method instead."
    },
    pastedTextUploader: {
        placeholder: "Paste your project structure here, or generate one using the 'Start with a Conversation' feature above.",
        generateProject: "Generate Project",
        clearText: "Clear text"
    },

    promptEditor: {
        provider: "Provider",
        model: "Model",
        noModelFound: "No models found",
        translateToEN: "EN",
        translateToIT: "IT",
        translating: "Translating...",
        improveWithAI: "Improve with AI",
        translationFailed: "Translation failed."
    },
    
    // EditorView.tsx & sub-components
    startOver: "Start Over",
    downloadProject: "Download Project",

    fileTree: {
        addNewFile: "Add New File",
        add: "Add",
        deleteConfirmation: (path: string) => `Are you sure you want to delete ${path}?`,
        newFilePlaceholder: "path/to/new-file.js",
        invalidPath: "Invalid or duplicate file path."
    },
    fileEditor: {
        selectFile: "Select a file to view or edit",
        saveChanges: "Save Changes",
        saved: "Saved",
        editingAria: (path: string) => `Editing content of ${path}`
    },
    mobileTabs: {
        files: "Files",
        editor: "Editor",
        ai: "AI"
    },
    
    // AIActionPanel.tsx
    aiAssistant: "AI Assistant",
    suggestName: "Suggest Name",
    findFiles: "Find Files",
    improveReadme: "Improve README",
    refactorCode: "Refactor Code",
    addDocstrings: "Add Docstrings",
    writeTests: "Write Tests",
    generateWiki: "Generate Wiki",
    codeReview: "Code Review",
    aiActionFailed: (msg: string) => `AI action failed: ${msg}`,
    loading: {
        name: "Suggesting...",
        files: "Finding Files...",
        readme: "Improving...",
        refactor: "Refactoring...",
        tests: "Generating...",
        docstrings: "Documenting...",
        wiki: "Generating Wiki...",
        review: "Reviewing...",
        commit: "Generating..."
    },
    tooltips: {
        base: "Click to: ",
        disabled: "This action is disabled in your AI Settings.",
        suggestName: "Suggest a creative project name based on its content.",
        findFiles: "Search the initial content for any files the initial parser might have missed.",
        generateWiki: "Generate a set of wiki-style documentation files based on the project content.",
        improveReadme: "Rewrite and improve the selected README.md file.",
        improveReadme_disabled: "Select a README.md file to enable this action.",
        refactorCode: "Rewrite the selected code file to improve readability and performance.",
        refactorCode_disabled: "Select a code file (e.g., JS, PY, TS) to enable this action.",
        addDocstrings: "Add documentation comments (docstrings) to the selected code file.",
        addDocstrings_disabled: "Select a code file (e.g., JS, PY, TS) to enable this action.",
        writeTests: "Generate a new test file for the selected code file.",
        writeTests_disabled: "Select a code file (e.g., JS, PY, TS) to enable this action.",
        codeReview: "Perform an AI-powered code review on the selected file.",
        codeReview_disabled: "Select a code file (e.g., JS, PY, TS) to enable this action.",
    },

    // SuggestionModal.tsx
    suggestionModal: {
        title: "AI File Suggestions",
        description: "The AI found these additional files. Review and accept the ones you want to add.",
        cancel: "Cancel",
        acceptSelected: "Accept Selected"
    },
    
    // DiffView.tsx
    diffView: {
        showingChanges: (path: string) => `Showing changes for: ${path}`,
        reject: "Reject",
        accept: "Accept Changes"
    },
    
    // ExamplePromptModal.tsx
    examplePromptModal: {
        close: "Close",
        copyPrompt: "Copy Prompt"
    },
    
    // CodeReviewModal.tsx
    codeReviewModal: {
        title: "AI Code Review Results",
        description: (filePath: string) => `AI analysis for file: ${filePath}`,
        close: "Close",
    },

    // UserGuideModal.tsx
    userGuideModal: {
        title: "User Guide",
        loading: "Loading guide...",
        error: "Could not load the guide.",
        close: "Close",
    },
    
    // ProjectChatModal.tsx
    projectChatModal: {
        title: "Project Architect Chat",
        description: "Define your project requirements with the AI.",
        close: "Close chat",
        placeholder: "Write your message...",
        send: "Send",
        generateProject: "Generate Project",
        aiError: (msg: string) => `Sorry, I've encountered an error: ${msg}`,
        generationError: (msg: string) => `Sorry, I've encountered an error during project generation: ${msg}`,
        toggleTTS: "Toggle AI voice on/off",
        toggleLiveChat: "Toggle live voice chat on/off",
        uploadAudio: "Upload audio file for transcription",
        transcriptionError: (msg: string) => `Transcription error: ${msg}`,
        statusListening: "Listening...",
        statusSpeaking: "AI is speaking...",
        statusThinking: "AI is thinking...",
        statusWaiting: "Waiting",
    },
    
    // PromptChatModal.tsx
    promptChatModal: {
        title: "Improve Prompt",
        description: (promptTitle: string) => `Chat with an AI to refine: ${promptTitle}`,
        greeting: (promptTitle: string) => `Hi! I'm here to help you improve the "**${promptTitle}**" prompt. How can we make it better?`,
        close: "Close chat",
        placeholder: "Write your message...",
        send: "Send",
        useLastResponse: "Use AI's last response as the new prompt",
        aiError: (msg: string) => `Sorry, I've encountered an error: ${msg}`,
    },

    // GitHubExportModal.tsx
    githubExport: {
        title: "Export to GitHub",
        description: "Push your project to a new or existing GitHub repository.",
        repoNameLabel: "GitHub Repository Name",
        repoNamePlaceholder: "owner/repo-name",
        repoNameHelp: "E.g., 'your-username/new-project'.",
        branchLabel: "Branch Name",
        branchPlaceholder: "main",
        commitMessageLabel: "Commit Message",
        commitMessagePlaceholder: "Initial project commit",
        generateCommitMessage: "Generate with AI",
        actionTypeLabel: "Action Type",
        actionTypePush: "Push to Existing Repo",
        actionTypeCreate: "Create New Repo",
        visibilityLabel: "Visibility",
        visibilityPrivate: "Private",
        visibilityPublic: "Public",
        cancel: "Cancel",
        export: "Export",
        exporting: "Exporting...",
        successTitle: "Export Successful!",
        successMessage: (repo: string) => `Project successfully pushed to ${repo}.`,
        errorTitle: "Export Failed",
        close: "Close",
        button: "Export to GitHub",
        tooltip: "Push your project to a GitHub repository.",
        disabledTooltip: "Add a GitHub Personal Access Token in Settings to enable this feature."
    },
    
    // SettingsView.tsx
    settings: {
        title: "Settings",
        description: "Configure AI providers, default models, and API keys.",
        tabs: {
            general: "General Settings",
            aiBehavior: "AI Behavior"
        },
        general: "General",
        globalLanguage: "Global Language",
        globalLanguageDesc: "Set the default language for the UI and content.",
        langIt: "Italiano",
        langEn: "English",
        
        defaultModels: "Default AI Models",
        
        generalDefault: "General Default",
        generalDefaultDesc: "The default for all AI actions unless overridden below or in a preset. Changing this may update other settings.",
        
        conversationalArchitect: "Conversational Architect",
        conversationalArchitectDesc: "The model used for the 'Start with a Conversation' feature.",

        promptImprovementChat: "Prompt Improvement Chat",
        promptImprovementChatDesc: "The model used for the 'Improve with AI' chat for prompts.",

        integrations: "Integrations",
        githubPat: "GitHub Personal Access Token",
        githubPatHelp: `Required to export repositories. <a href="https://github.com/settings/tokens/new?scopes=repo&description=UPZ.AI%20Export" target="_blank" rel="noopener noreferrer" class="text-accent dark:text-dark-accent font-bold underline">Create a token</a> with 'repo' permissions.`,

        apiKeys: "API Keys",
        googleApiKey: "Google Gemini API Key",
        googleApiHelp: "Get your Google API key here.",
        googleApiEnvVar: "The Google API key is configured via an environment variable (`API_KEY`) for better security.",
        
        openRouterApiKey: "OpenRouter API Key",
        openRouterApiHelp: "Get your OpenRouter key here.",

        groqApiKey: "Groq API Key",
        groqApiHelp: "Get your Groq key here.",
        
        togetherApiKey: "Together.ai API Key",
        togetherApiHelp: "Get your Together.ai key here.",

        perplexityApiKey: "Perplexity API Key",
        perplexityApiHelp: "Get your Perplexity key here.",
        
        cohereApiKey: "Cohere API Key",
        cohereApiHelp: "Get your Cohere key here.",

        apiKeyPlaceholder: (label: string) => `Enter your ${label}`,
        showKey: "Show",
        hideKey: "Hide",
        keyStorageNotice: "Your API keys are securely stored in your browser's localStorage and are never sent to our servers.",

        cancel: "Cancel",
        save: "Save Settings",
    },

    // AI Prompts (titles and descriptions)
    aiPrompts: {
        projectOverview_title: 'Project Idea Expansion',
        projectOverview_description: 'For text input, use AI to expand a brief idea into a full project structure before parsing.',
        fileFinder_title: 'File Finder',
        fileFinder_description: 'Guides the AI to find missed files from the input.',
        docExtractor_title: 'Documentation Extractor',
        docExtractor_description: 'Guides the AI to extract documentation notes from the input.',
        readmeGenerator_title: 'README Generation',
        readmeGenerator_description: 'Instructs the AI on how to structure and write the `README.md` file.',
        wikiGenerator_title: 'Wiki Repo Generation',
        wikiGenerator_description: 'Generates a full documentation wiki from the input content.',
        codeRefactorer_title: 'Code Refactoring',
        codeRefactorer_description: 'Instructs the AI on how to refactor and improve a file\'s code.',
        codeReviewer_title: 'Code Review',
        codeReviewer_description: 'Instructs the AI on how to perform a code review for a file.',
        testGenerator_title: 'Test Generation',
        testGenerator_description: 'Instructs the AI on how to generate a test file for a given source file.',
        projectNameSuggester_title: 'Project Name Suggester',
        projectNameSuggester_description: 'Guides the AI to suggest a creative project name.',
        docstringGenerator_title: 'Docstring Generation',
        docstringGenerator_description: 'Guides the AI to add docstrings to functions/classes in a file.',
        architect_title: 'AI Architect Chat',
        architect_description: 'The system prompt that guides the conversation in the project scaffolding chat.',
        translator_title: 'Translator',
        translator_description: 'The prompt used to translate custom prompts. Use {text} and {targetLanguage}.',
        commitMessageGenerator_title: 'Commit Message Generator',
        commitMessageGenerator_description: 'Guides the AI to generate commit messages for the GitHub export.',
    },
  },
};

export const getTranslations = (lang: Language): typeof translations['it'] => {
    return translations[lang] || translations.it;
};