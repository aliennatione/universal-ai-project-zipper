# Guida Utente di UPZ0.3

Benvenuto in UPZ0.3, il tuo architetto software potenziato dall'AI. Questa guida ti aiuterà a sfruttare al massimo tutte le funzionalità dell'applicazione.

## Indice

1.  [Iniziare un Progetto](#1-iniziare-un-progetto)
    -   [Da una Semplice Idea (Input Testuale)](#da-una-semplice-idea-input-testuale)
    -   [Da File Locali (Upload)](#da-file-locali-upload)
    -   [Da un Repository GitHub](#da-un-repository-github)
    -   [Da una Chat Gemini (Link o File)](#da-una-chat-gemini-link-o-file)
    -   [Tramite Chat Interattiva con l'Architetto AI](#tramite-chat-interattiva-con-larchitetto-ai)
2.  [Configurazione delle Chiavi API](#2-configurazione-delle-chiavi-api)
    -   [Ottenere le Chiavi API](#ottenere-le-chiavi-api)
    -   [Inserire le Chiavi nell'Applicazione](#inserire-le-chiavi-nellapplicazione)
    -   [Nota sulla Sicurezza e Deploy](#nota-sulla-sicurezza-e-deploy)
3.  [Utilizzare l'Editor del Progetto](#3-utilizzare-leditor-del-progetto)
    -   [L'Albero dei File](#lalbero-dei-file)
    -   [L'Editor di Codice](#leditor-di-codice)
    -   [Il Pannello Azioni AI](#il-pannello-azioni-ai)
4.  [Configurazione Avanzata (Impostazioni AI)](#4-configurazione-avanzata-impostazioni-ai)
    -   [Preset di Comportamento](#preset-di-comportamento)
    -   [Personalizzazione dei Prompt](#personalizzazione-dei-prompt)
5.  [Esportare il Tuo Progetto](#5-esportare-il-tuo-progetto)
    -   [Scaricare come ZIP](#scaricare-come-zip)
    -   [Esportare su GitHub](#esportare-su-github)

---

## 1. Iniziare un Progetto

UPZ0.3 offre diversi modi per iniziare a creare il tuo software. Scegli quello più adatto alle tue esigenze.

### Da una Semplice Idea (Input Testuale)

1.  Seleziona la scheda **"Incolla Testo"**.
2.  Scrivi una breve descrizione del progetto (es. "Crea una semplice app React per le previsioni del tempo").
3.  Clicca su **"Genera Progetto"**.

### Da File Locali (Upload)

1.  Seleziona la scheda **"Carica File"**.
2.  Trascina i tuoi file, una cartella intera o un archivio `.zip`.
3.  Clicca su **"Genera Progetto"**.

### Da un Repository GitHub

1.  Seleziona la scheda **"Repository GitHub"**.
2.  Incolla l'URL del repository (es. `https://github.com/facebook/react`).
3.  Clicca su **"Recupera e Genera"**.

### Da una Chat Gemini (Link o File)

Trasforma una conversazione con Gemini in un progetto.
1.  In `gemini.google.com`, condividi la chat e copia il link pubblico o esportala come file.
2.  In UPZ0.3, vai alla scheda **"Chat Gemini"**, incolla il link o carica il file.

> **Nota su CORS**: Se l'importazione da link fallisce, utilizza il caricamento del file. È un'alternativa più affidabile.

### Tramite Chat Interattiva con l'Architetto AI

1.  Clicca su **"Apri Chat Architetto"**.
2.  Rispondi alle domande dell'AI per definire i requisiti del tuo progetto.
3.  Quando l'AI ha abbastanza informazioni, clicca su **"Genera Progetto"**.

---

## 2. Configurazione delle Chiavi API

Per utilizzare i modelli di intelligenza artificiale, è necessario fornire le proprie chiavi API. UPZ0.3 le salva in modo sicuro nel `localStorage` del tuo browser, quindi non vengono mai esposte o inviate a server esterni.

### Ottenere le Chiavi API

UPZ0.3 supporta diversi provider. Ecco dove trovare le chiavi:
-   **Google Gemini**: Vai su [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key) per generare la tua chiave.
-   **Altri Provider** (OpenRouter, Groq, Cohere, etc.): Accedi alla dashboard del rispettivo provider per creare e copiare la tua chiave API.

### Inserire le Chiavi nell'Applicazione

1.  Clicca sull'icona a forma di ingranaggio (⚙️) in alto a destra per aprire le **Impostazioni**.
2.  Nella scheda **"Generali"**, scorri fino alla sezione **"Chiavi API"**.
3.  Incolla la tua chiave API di Google nel campo **"Google API Key"**.
4.  Aggiungi le altre chiavi API che desideri utilizzare nei campi corrispondenti.
5.  Clicca su **"Salva"**. Le chiavi sono ora pronte per essere utilizzate.

### Nota sulla Sicurezza e Deploy

Se intendi clonare il repository di UPZ e fare il deploy della tua versione (ad esempio su Vercel, Netlify, o GitHub Pages), **non inserire mai le chiavi API direttamente nel codice sorgente**.

Per un deploy sicuro, utilizza i **"Secrets"** o le **"Variabili d'Ambiente"** offerti dalla tua piattaforma di hosting:

1.  **Crea una variabile d'ambiente**: Nominala `VITE_GOOGLE_API_KEY`.
2.  **Assegna il valore**: Incolla la tua chiave API di Google come valore di questa variabile.
3.  **Utilizzo nel codice**: L'applicazione è già configurata per leggere questa variabile (`import.meta.env.VITE_GOOGLE_API_KEY`) e usarla come valore predefinito. La chiave inserita nell'interfaccia utente avrà sempre la precedenza, permettendo a chiunque utilizzi la tua versione deployata di usare la propria chiave senza conoscere la tua.

Questo approccio garantisce che la tua chiave rimanga segreta e ti permette di distribuire l'applicazione in modo sicuro.

---

## 3. Utilizzare l'Editor del Progetto

Una volta generato il progetto, verrai reindirizzato alla vista Editor.

### L'Albero dei File

Sulla sinistra, vedrai l'intera struttura di cartelle e file del tuo progetto.
- **Clicca su un file** per aprirlo nell'editor.
- **Aggiungi un nuovo file** o **elimina un file** esistente.

### L'Editor di Codice

Al centro, puoi visualizzare e modificare il contenuto del file selezionato. Ricorda di **salvare le modifiche**.

### Il Pannello Azioni AI

Sulla destra, hai a disposizione un set di potenti strumenti AI:
- **Suggerisci Nome**: Genera un nome creativo per il progetto.
- **Genera Wiki**: Crea una documentazione completa in formato `.md`.
- **Migliora README**: Riscrive il `README.md` per renderlo più professionale.
- **Refactoring Codice**: Migliora la qualità del codice senza alterarne la funzionalità.
- **Aggiungi Docstring**: Inserisce commenti di documentazione nel codice.
- **Scrivi Test**: Genera test unitari per il file selezionato.
- **Revisione Codice**: Fornisce un'analisi dettagliata del codice con suggerimenti per il miglioramento.

---

## 4. Configurazione Avanzata (Impostazioni AI)

Nelle Impostazioni (⚙️), la scheda **"Comportamento AI"** ti dà il controllo totale.

### Preset di Comportamento

Scegli un preset (es. "Speedy Draft", "Documentation Pro") per attivare rapidamente configurazioni ottimizzate per diverse esigenze.

### Personalizzazione dei Prompt

Per ogni azione AI, puoi:
- **Abilitarla o disabilitarla**.
- **Modificare il prompt**: Cambia le istruzioni inviate all'AI.
- **Assegnare un provider e un modello specifico** (es. usare Gemini per la generazione del codice e un modello Groq più veloce per la traduzione).

---

## 5. Esportare il Tuo Progetto

### Scaricare come ZIP

Clicca su **"Scarica Progetto"** per ottenere un archivio `.zip` con tutti i file.

### Esportare su GitHub

Invia il tuo progetto direttamente a un repository GitHub.

1.  **Configurazione**: Nelle impostazioni, aggiungi un tuo **Personal Access Token (PAT)** di GitHub con permessi `repo`.
2.  **Esportazione**: Clicca su **"Esporta su GitHub"**, scegli se creare un nuovo repository o aggiornarne uno esistente, e conferma.
