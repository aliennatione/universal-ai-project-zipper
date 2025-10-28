# Guida Utente di UPZ0.3

Benvenuto in UPZ0.3, il tuo architetto software potenziato dall'AI. Questa guida ti aiuterà a sfruttare al massimo tutte le funzionalità dell'applicazione.

## Indice

1.  [Iniziare un Progetto](#1-iniziare-un-progetto)
    -   [Da una Semplice Idea (Input Testuale)](#da-una-semplice-idea-input-testuale)
    -   [Da File Locali (Upload)](#da-file-locali-upload)
    -   [Da un Repository GitHub](#da-un-repository-github)
    -   [Da una Chat Gemini (Link o File)](#da-una-chat-gemini-link-o-file)
    -   [Tramite Chat Interattiva con l'Architetto AI](#tramite-chat-interattiva-con-larchitetto-ai)
2.  [Utilizzare l'Editor del Progetto](#2-utilizzare-leditor-del-progetto)
    -   [L'Albero dei File](#lalbero-dei-file)
    -   [L'Editor di Codice](#leditor-di-codice)
    -   [Il Pannello Azioni AI](#il-pannello-azioni-ai)
3.  [Configurazione Avanzata (Impostazioni AI)](#3-configurazione-avanzata-impostazioni-ai)
    -   [Impostazioni Generali e Chiavi API](#impostazioni-generali-e-chiavi-api)
    -   [Personalizzazione del Comportamento AI](#personalizzazione-del-comportamento-ai)
4.  [Esportare il Tuo Progetto](#4-esportare-il-tuo-progetto)
    -   [Scaricare come ZIP](#scaricare-come-zip)
    -   [**Novità**: Esportare su GitHub](#novità-esportare-su-github)

---

## 1. Iniziare un Progetto

UPZ0.3 offre diversi modi per iniziare a creare il tuo software. Scegli quello più adatto alle tue esigenze.

### Da una Semplice Idea (Input Testuale)

Questo è il modo più rapido per vedere l'AI in azione.

1.  Seleziona la scheda **"Incolla Testo"**.
2.  Scrivi una breve descrizione del progetto che vuoi creare. Esempio: "Crea una semplice app React per le previsioni del tempo che utilizza un'API esterna".
3.  (Opzionale) Nelle **Impostazioni AI**, assicurati che il prompt "Espansione Idea Progetto" sia abilitato per permettere all'AI di elaborare la tua idea in una struttura di file completa.
4.  Clicca su **"Genera Progetto"**.

L'AI espanderà la tua idea, genererà i file e ti porterà direttamente all'editor.

### Da File Locali (Upload)

Hai già un progetto esistente? Caricalo per documentarlo, refattorizzarlo o aggiungere nuove funzionalità.

1.  Seleziona la scheda **"Carica File"**.
2.  Trascina i tuoi file, una cartella intera o un archivio `.zip` nell'area di upload.
3.  Se carichi un file `.zip`, puoi scegliere se decomprimerlo.
4.  Clicca su **"Genera Progetto"**.

### Da un Repository GitHub

Lavora su qualsiasi repository GitHub pubblico senza doverlo clonare manualmente.

1.  Seleziona la scheda **"Repository GitHub"**.
2.  Incolla l'URL del repository (es. `https://github.com/facebook/react`).
3.  Clicca su **"Recupera e Genera"**. L'applicazione scaricherà il repository come archivio `.zip` e lo elaborerà.

### Da una Chat Gemini (Link o File)

Trasforma una sessione di brainstorming o di pair programming con Gemini in un progetto funzionante. Hai due opzioni:

#### Opzione A: Importazione da Link di Condivisione (Consigliato)

1.  In `gemini.google.com`, apri la conversazione che desideri utilizzare.
2.  In alto a destra, clicca sull'icona **Condividi ed esporta**, poi su **Condividi**.
3.  Crea un link pubblico.
4.  Copia il link (es. `https://gemini.google.com/share/...`).
5.  In UPZ0.3, vai alla scheda **"Chat Gemini"**, incolla il link nel campo apposito e clicca su **"Importa da Link"**.

> **Nota Importante (Errore CORS)**: A causa di una misura di sicurezza standard dei browser chiamata CORS, il recupero diretto del contenuto da un link di un altro sito (come `gemini.google.com`) è spesso bloccato. Questo non dipende dal tuo account. Se l'importazione da link fallisce, **l'utilizzo dell'Opzione B (caricamento file) è l'alternativa più affidabile e funzionerà sempre.**

#### Opzione B: Importazione da File Esportato

1.  In `gemini.google.com`, apri la conversazione.
2.  Clicca su **"⋮"** (tre puntini), poi **"Condividi ed esporta"**.
3.  Esporta la chat. Puoi esportarla su Google Docs e poi scaricarla come file `.txt`, oppure usare estensioni del browser per salvarla come file `.md`.
4.  In UPZ0.3, nella scheda **"Chat Gemini"**, clicca su **"Carica da File (.txt, .md)"** e seleziona il file appena scaricato.

### Tramite Chat Interattiva con l'Architetto AI

Se la tua idea non è ancora ben definita, lascia che l'AI ti guidi.

1.  Nella sezione "Parti da un'Idea o Esempio", clicca su **"Apri Chat Architetto"**.
2.  Si aprirà una finestra di chat. L'AI ti porrà domande per definire i requisiti del tuo progetto (stack tecnologico, funzionalità, ecc.).
3.  Rispondi alle domande. Quando l'AI riterrà di avere abbastanza informazioni, ti chiederà se può procedere.
4.  A quel punto, potrai cliccare su **"Genera Progetto"** per creare la struttura basata sulla conversazione.

## 2. Utilizzare l'Editor del Progetto

Una volta generato il progetto, verrai reindirizzato alla vista Editor.

### L'Albero dei File

Sulla sinistra, vedrai l'intera struttura di cartelle e file del tuo progetto.
- **Clicca su un file** per aprirlo nell'editor.
- **Aggiungi un nuovo file** usando il pulsante in basso.
- **Elimina un file** passando il mouse sul suo nome e cliccando sull'icona del cestino.

### L'Editor di Codice

Al centro, puoi visualizzare e modificare il contenuto del file selezionato.
- L'editor supporta la sintassi per i linguaggi più comuni.
- Ogni modifica che fai viene tracciata. Clicca su **"Salva Modifiche"** per confermare.

### Il Pannello Azioni AI

Sulla destra, hai a disposizione un set di potenti strumenti AI da usare su richiesta:
- **Suggerisci Nome**: Genera un nome creativo per il tuo progetto.
- **Trova File**: Chiede all'AI di rianalizzare l'input originale per trovare file che potrebbero essere stati persi.
- **Genera Wiki**: Crea una serie di file di documentazione `.md` (come `Home.md`, `Installation.md`, ecc.) basati sul contesto del progetto.
- **Migliora README**: Se hai selezionato il file `README.md`, questa azione lo riscriverà per renderlo più chiaro e professionale.
- **Refactoring Codice**: Se hai selezionato un file di codice, l'AI lo riscriverà per migliorarne la leggibilità, le performance e la manutenibilità, senza alterarne la funzionalità.
- **Aggiungi Docstring**: Aggiunge commenti di documentazione a funzioni, classi e metodi nel file di codice selezionato.
- **Scrivi Test**: Genera un nuovo file contenente test unitari per il file di codice selezionato.
- **Revisione Codice**: L'AI analizzerà il file di codice selezionato e fornirà un feedback strutturato su potenziali bug, problemi di performance e aderenza alle best practice.

## 3. Configurazione Avanzata (Impostazioni AI)

Clicca sull'icona a forma di ingranaggio per aprire le impostazioni.

### Impostazioni Generali e Chiavi API

In questa scheda puoi:
- **Cambiare la lingua** dell'interfaccia.
- **Impostare i modelli AI predefiniti** per le varie attività.
- **Inserire le tue chiavi API** per i provider supportati (OpenRouter, Groq, ecc.). La chiave API di Google Gemini deve essere configurata tramite una variabile d'ambiente (`API_KEY`) per motivi di sicurezza.
- **Aggiungere il tuo GitHub Personal Access Token** per abilitare l'esportazione su GitHub.

Le tue chiavi sono salvate localmente nel tuo browser e non vengono mai inviate a nessun server.

### Personalizzazione del Comportamento AI

Questa scheda ti dà il controllo totale sul "cervello" dell'applicazione.
- **Preset**: Scegli un preset (es. "Speedy Draft", "Documentation Pro") per abilitare/disabilitare rapidamente gruppi di azioni AI.
- **Prompt Individuali**: Puoi abilitare o disabilitare ogni singola azione AI. Cliccando su un'azione, puoi modificarne il **prompt**, ovvero le istruzioni esatte che vengono inviate all'AI. Puoi anche assegnare un provider e un modello specifico per ogni azione.
- **Migliora con AI**: Usa la chat integrata per perfezionare i tuoi prompt personalizzati con l'aiuto dell'AI stessa.

## 4. Esportare il Tuo Progetto

Quando sei soddisfatto del risultato, hai due opzioni.

### Scaricare come ZIP

Clicca sul pulsante **"Scarica Progetto"** in alto a destra nella vista Editor. L'intero progetto verrà scaricato come un singolo file `.zip`, pronto per essere utilizzato.

### **Novità**: Esportare su GitHub

Questa potente funzionalità ti permette di inviare il tuo progetto direttamente su GitHub.

#### A. Configurazione Iniziale (da fare una sola volta)

1.  Vai nelle **Impostazioni** (icona ingranaggio) > **Impostazioni Generali**.
2.  Scorri fino alla sezione **"Integrazioni"**.
3.  Devi generare un **Personal Access Token (PAT)** su GitHub. Clicca sul link **"Crea un token"**, che ti porterà direttamente alla pagina corretta di GitHub con i permessi `repo` già selezionati.
4.  Dai un nome al token (es. "UPZ AI Export") e clicca su "Generate token".
5.  **Copia il token immediatamente** e incollalo nel campo "GitHub Personal Access Token" in UPZ.
6.  Salva le impostazioni.

#### B. Processo di Esportazione

1.  Nella vista Editor, clicca sul pulsante **"Esporta su GitHub"**.
2.  Nella finestra che si apre, scegli se vuoi:
    - **Creare un Nuovo Repo**: Specifica il nome del nuovo repository (es. `tuo-username/il-mio-nuovo-progetto`), se deve essere pubblico o privato, il nome del branch e il messaggio di commit.
    - **Push su Repo Esistente**: Inserisci il nome completo di un repository che già possiedi (es. `tuo-username/progetto-esistente`), il branch su cui effettuare il push e il messaggio di commit.
3.  Clicca su **"Esporta"**. UPZ si occuperà di inviare tutti i file al repository specificato.