# Architettura dell'Applicazione

Questo documento fornisce una panoramica di alto livello dell'architettura dell'applicazione UPZ0.3. È destinato agli sviluppatori che desiderano contribuire al progetto.

## Principi Fondamentali

- **Zero Build-Step**: L'applicazione è progettata per funzionare direttamente nel browser senza una fase di transpiling o bundling. Utilizza ES Modules nativi tramite un `importmap` in `index.html`.
- **UI Basata su Componenti**: L'interfaccia utente è costruita con React.
- **Logica Orientata ai Servizi**: La logica di business, le chiamate API e le trasformazioni complesse dei dati sono incapsulate in uno strato di `services`, mantenendo i componenti snelli.
- **Gestione dello Stato tramite Hooks e Context**: Lo stato globale (impostazioni, configurazione AI) è gestito tramite React Context. Lo stato della UI e la logica complessa dei componenti sono estratti in hooks personalizzati per promuovere la modularità e la leggibilità.

## Struttura delle Directory

```
/
├── components/         # Componenti React per l'interfaccia utente
├── contexts/           # Provider di React Context per lo stato globale
├── hooks/              # Hooks React personalizzati per la gestione dello stato e della logica
├── services/           # Logica di business e client API di terze parti
├── docs/               # Documentazione del progetto
├── .github/            # File specifici di GitHub (template per issue/PR)
├── index.html          # Il punto di ingresso HTML principale
├── index.tsx           # Il punto di ingresso principale dell'applicazione React
├── types.ts            # Definizioni globali dei tipi TypeScript
└── ...                 # Altri file
```

## Flusso Dati e Architettura dello Stato

L'architettura dello stato è stata refattorizzata per essere più modulare e manutenibile, allontanandosi da un singolo componente `App.tsx` monolitico.

### `App.tsx` - L'Orchestratore

Il componente `App.tsx` ora funge principalmente da **orchestratore**. Il suo ruolo è:
1.  Inizializzare gli hooks personalizzati che gestiscono le diverse parti dello stato.
2.  Gestire la logica di navigazione di primo livello (es. passare da `input` a `editor`).
3.  Comporre i componenti della UI, passando loro lo stato e le funzioni necessarie dagli hooks.

### Hooks Personalizzati (`hooks/`)

La logica di stato complessa è stata estratta in hooks riutilizzabili:

-   **`useEditor.ts`**: Gestisce **tutto ciò che riguarda lo stato dell'editor di progetto**.
    -   `parsedFiles`, `selectedFilePath`, `editorContent`, `isEditorDirty`, `projectName`.
    -   Contiene le funzioni per manipolare questo stato, come `handleFileSelect`, `handleSaveFile`, `setParsedFiles`, ecc.

-   **`useAIActions.ts`**: Centralizza **tutta la logica per le azioni AI on-demand**.
    -   Gestisce stati come `diffData` (per la visualizzazione delle differenze), `suggestions` (per i file suggeriti), `codeReviewContent`.
    -   Espone le funzioni che attivano le azioni AI, come `handleRefactorRequest`, `handleGenerateTests`, `handleSuggestName`, ecc. Queste funzioni chiamano i servizi appropriati e aggiornano lo stato.

-   **`useModals.ts`**: Semplifica la gestione di **tutte le finestre modali**.
    -   Contiene uno stato booleano per ogni modale (es. `isUserGuideOpen`, `isGitHubExportModalOpen`).
    -   Fornisce semplici funzioni per aprire e chiudere ciascuna modale (`openUserGuide`, `closeUserGuide`).

### `contexts/AppContext.tsx`

- **Scopo**: Fornisce un contenitore di stato globale per le **impostazioni persistenti** e la **configurazione AI**.
- **Responsabilità**:
  - Caricamento/salvataggio di `AppSettings` e `AIPromptConfig` da `localStorage`.
  - Gestione della lingua e fornitura della funzione di traduzione (`t`).
  - Recupero e caching dei modelli disponibili per ogni provider (`modelsByProvider`).

### `services/aiClient.ts`

- **Scopo**: Il servizio più critico. Agisce come un **adattatore** unificato per tutti i provider AI esterni.
- **Responsabilità**:
  - `performAiGeneration` e `performAiChat` sono le uniche funzioni che comunicano con le API esterne.
  - Traduce una richiesta interna standardizzata nel formato specifico richiesto dall'API di destinazione.
  - Centralizza la logica di recupero delle chiavi API.
- **Vantaggio**: Questo design rende banale aggiungere nuovi provider AI, poiché le modifiche sono isolate in questo singolo file.

## Esempi di Deployment

Questa sezione fornisce esempi di file di configurazione da copiare e incollare nel tuo progetto per distribuire l'applicazione su varie piattaforme. Poiché si tratta di un'applicazione statica senza fase di build, le configurazioni sono molto semplici.

### Netlify (`netlify.toml`)

```toml
[build]
  command = ""
  publish = "/"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vercel (`vercel.json`)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Docker (`Dockerfile` e `.dockerignore`)

#### `Dockerfile`
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `.dockerignore`
```
.git
.gitignore
.github/
docs/
netlify.toml
vercel.json
README.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md
LICENSE
Dockerfile
docker-compose.yml
```