# Contribuire a UPZ0.3

Prima di tutto, grazie per aver considerato di contribuire! Sono persone come te che fanno prosperare progetti open source come questo.

Questo documento fornisce le linee guida per contribuire al progetto. Sentiti libero di proporre modifiche a questo documento in una pull request.

## Codice di Condotta

Questo progetto e tutti coloro che vi partecipano sono governati dal [Codice di Condotta](CODE_OF_CONDUCT.md). Partecipando, ci si aspetta che tu rispetti questo codice. Ti preghiamo di segnalare comportamenti inaccettabili.

## Come Posso Contribuire?

### Segnalazione di Bug

- **Assicurati che il bug non sia già stato segnalato** cercando su GitHub tra le [Issues](https://github.com/your/repo/issues).
- Se non riesci a trovare un'issue aperta che affronti il problema, [aprine una nuova](https://github.com/your/repo/issues/new). Assicurati di includere un **titolo e una descrizione chiari**, quante più informazioni pertinenti possibili e un **campione di codice o un caso di test eseguibile** che dimostri il comportamento atteso che non si sta verificando.

### Suggerimento di Miglioramenti

- Apri una nuova issue per discutere la tua idea. Questo ci permette di coordinare gli sforzi e garantire che il miglioramento sia in linea con gli obiettivi del progetto.
- Usa il template "Feature Request" quando crei l'issue.

### Pull Request

1.  **Fai un fork del repository** e crea il tuo branch da `main`.
2.  **Configura il tuo ambiente di sviluppo** come descritto nel [README.md](README.md) principale.
3.  **Apporta le tue modifiche**. Assicurati che il tuo codice sia ben commentato e segua lo stile esistente.
4.  **Aggiungi/aggiorna la documentazione** per eventuali nuove funzionalità o modifiche. I commenti TSDoc sono ampiamente utilizzati e attesi per il nuovo codice.
5.  **Assicurati che il tuo codice passi il linter** (se un linter è configurato). Raccomandiamo di usare un'estensione dell'editor per Prettier per mantenere una formattazione coerente.
6.  **Apri una nuova pull request** con un titolo e una descrizione chiari delle tue modifiche. Collega eventuali issue pertinenti.

## Guide di Stile

### Messaggi di Commit Git

- Usa il tempo presente ("Add feature" non "Added feature").
- Usa il modo imperativo ("Move cursor to..." not "Moves cursor to...").
- Limita la prima riga a 72 caratteri o meno.
- Fai riferimento a issue e pull request liberamente dopo la prima riga.

### Guida di Stile TypeScript

- Tutto il codice TypeScript dovrebbe essere ben documentato usando TSDoc.
- Usa `interface` per le API pubbliche e `type` per i tipi interni o a livello di componente.
- Evita `any` quando possibile.
- Mantieni i componenti focalizzati su una singola responsabilità.
- Usa i servizi forniti per le chiamate API e la logica di business. Non inserire chiamate API direttamente nei componenti.

Grazie per il tuo contributo!