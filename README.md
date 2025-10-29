# UPZ0.3 - Universal AI Project Zipper

<div align="center">
  <p><strong>Il tuo architetto software potenziato dall'AI.</strong></p>
  <p>Progetta, refattorizza e documenta interi progetti partendo da una semplice idea, un repository GitHub, file locali o una chat interattiva.</p>
</div>

---

**UPZ0.3** è uno strumento web versatile progettato per accelerare il tuo ciclo di sviluppo software. Sfrutta diversi provider di AI (come Google Gemini, Groq e altri) per aiutarti a creare interi progetti da zero, refattorizzare codice esistente, generare documentazione completa, scrivere test e molto altro, il tutto all'interno di un ambiente di sviluppo completo e altamente personalizzabile.

## ✨ Funzionalità Principali

- **Metodi di Input Flessibili**: Inizia un progetto da:
  - 📝 **Una Semplice Idea**: Lascia che l'AI espanda il tuo concetto in una struttura di file completa e pronta all'uso.
  - 📂 **File/Cartelle Locali**: Carica il tuo progetto esistente per refattorizzarlo, documentarlo o migliorarlo.
  - 🐙 **Un Repository GitHub**: Incolla semplicemente un URL pubblico per clonare e iniziare a lavorare.
  - 💬 **Chat Interattiva con l'Architetto**: Dialoga con un architetto AI per definire i requisiti del tuo progetto da zero.
  - 📄 **Importazione Chat Gemini**: Importa un'intera conversazione da Gemini tramite un **link di condivisione** o un file esportato `.txt`/`.md` per trasformare la tua sessione di brainstorming in codice.
- **Motore AI Potente e Personalizzabile**:
  - 🔧 **Supporto Multi-Provider**: Scegli diversi provider AI (Google, Groq, OpenRouter, ecc.) e modelli per compiti diversi. Ottimizza per velocità, costo o qualità del codice.
  - ⚙️ **Prompt Modificabili**: Perfeziona ogni prompt AI integrato per adattarlo alle tue esigenze specifiche e al tuo stile di codifica.
  - 🚀 **Azioni AI On-Demand**: Refattorizza il codice, aggiungi docstring, genera test unitari, migliora il tuo README, crea un wiki di progetto e altro ancora con un solo clic.
- **Editor di Codice Integrato**:
  - 🌳 **Navigazione ad Albero dei File**: Sfoglia e gestisci facilmente i file del tuo progetto.
  - ↔️ **Visualizzatore di Diff**: Rivedi visivamente tutte le modifiche generate dall'AI prima di accettarle.
  - 💾 **Pieno Controllo Manuale**: Aggiungi, elimina e modifica i file direttamente nell'editor.
- **Integrazione Perfetta con GitHub**:
  - 🔐 **Autenticazione Sicura**: Aggiungi il tuo Personal Access Token di GitHub nelle impostazioni.
  - ✨ **Esportazione Diretta**: Invia il tuo intero progetto a un repository GitHub **nuovo o esistente** direttamente dall'app.
- **Zero Installazione**: Funziona interamente nel tuo browser. Le tue chiavi API sono salvate localmente e non lasciano mai il tuo computer.
- **Molteplici Opzioni di Esportazione**:
    - 📦 Scarica il tuo progetto completo come file ZIP.
    - 🚀 Esporta direttamente su un repository GitHub.

## 📚 Guida Utente Completa

Per istruzioni dettagliate su tutte le funzionalità, consulta la nostra **[Guida Utente](./docs/USER_GUIDE.md)**.

## 🚀 Configurazione e Deploy

Questo progetto è stato preparato per un deploy semplificato su piattaforme come Vercel, Netlify o GitHub Pages.

### Impostare la Chiave API di Default per il Deploy

Se esegui il deploy di questo progetto per renderlo accessibile pubblicamente, è fondamentale non inserire la tua chiave API principale direttamente nel codice. L'applicazione è progettata per leggere una variabile d'ambiente come chiave API di default.

**Come configurarla su GitHub Pages (o simili):**

1.  **Vai nelle Impostazioni del tuo Repository GitHub**.
2.  Nel menu a sinistra, naviga su **Secrets and variables > Actions**.
3.  Clicca su **New repository secret**.
4.  Crea un nuovo secret con il seguente nome:
    - **Nome**: `VITE_GOOGLE_API_KEY`
5.  **Incolla la tua chiave API di Google Gemini** come valore del secret.
6.  Salva.

Al successivo deploy (ad esempio tramite GitHub Actions), questa chiave verrà inserita in modo sicuro nell'ambiente e l'applicazione la utilizzerà come fallback. Gli utenti finali potranno comunque inserire le proprie chiavi personali nell'interfaccia utente, le quali avranno sempre la precedenza.

Questo approccio garantisce che la tua chiave rimanga segreta e permette ad altri di utilizzare la tua versione deployata dell'app.

## 🛠️ Setup per lo Sviluppo Locale

Interessato a contribuire a UPZ0.3? Fantastico! Ecco come iniziare:

1.  **Forka il repository**.
2.  **Clona il tuo fork**:
    ```bash
    git clone https://github.com/TUO_USERNAME/universal-ai-project-zipper.git
    cd universal-ai-project-zipper
    ```
3.  **Avvia un server locale**:
    - Questo è un progetto che non richiede build. Hai solo bisogno di un server web locale.
    - Un modo semplice è usare l'estensione `Live Server` in VS Code.
    - In alternativa, usa il server integrato di Python:
      ```bash
      python -m http.server
      ```
4.  **Apri il browser** all'indirizzo fornito dal tuo server locale.
5.  **Configura le Impostazioni**: Clicca sull'icona a forma di ingranaggio (⚙️) nell'app per aggiungere le tue chiavi API. Per lo sviluppo locale, puoi creare un file `.env` nella root del progetto e aggiungere `VITE_GOOGLE_API_KEY=LA_TUA_CHIAVE` per caricare la chiave di Google, oppure inserirla direttamente nell'interfaccia.

## 🤝 Contribuire

I contributi sono i benvenuti! Per favore, leggi le nostre [**Linee Guida per i Contributi**](CONTRIBUTING.md) per conoscere il nostro processo di sviluppo, come proporre correzioni di bug e miglioramenti, e come creare e testare le tue modifiche.

Tutti i contributori sono tenuti a rispettare il nostro [**Codice di Condotta**](CODE_OF_CONDUCT.md).

## 📄 Licenza

Questo progetto è rilasciato sotto la Licenza MIT. Vedi il file [**LICENSE**](LICENSE) per i dettagli.
