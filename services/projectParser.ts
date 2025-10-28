import { ParsedFile, AIPromptConfig, AppSettings, EditablePrompt, FileUploadRequest } from '../types';
import { performAiGeneration } from './aiClient';
import { Type } from "@google/genai";
import { safeJsonParse } from './utils';

declare var JSZip: any;

/**
 * @file Contiene la logica per analizzare l'input dell'utente (testo, file, zip) e trasformarlo in una struttura di progetto.
 * @module projectParser
 */

const fileBlockRegex = /#+\s*`?([\w./\s_-]+)`?\s*\n([\s\S]*?)(?=\n(?:#+\s*`?[\w./\s_-]+`?|---|===)|$)/g;

/**
 * Analizza un contenuto di file di testo strutturato in un elenco di file con i loro percorsi e contenuti
 * utilizzando un approccio basato su regex. Questa versione è robusta contro varie convenzioni di formattazione.
 * Cerca intestazioni markdown come `### percorso/del/file.js` seguite dal contenuto.
 * @param {string} fileContent - Il contenuto testuale completo dall'input dell'utente.
 * @returns {ParsedFile[]} Un array di oggetti ParsedFile.
 */
export const parseWithRegex = (fileContent: string): ParsedFile[] => {
  const files: ParsedFile[] = [];
  
  let match;
  while ((match = fileBlockRegex.exec(fileContent)) !== null) {
    const path = match[1].trim();
    let blockContent = match[2].trim();

    if (!path.includes('.') && !path.includes('/')) {
        continue;
    }

    const codeBlockRegex = /```(?:[a-zA-Z]+)?\n([\s\S]*?)\n```/
    const codeMatch = blockContent.match(codeBlockRegex);

    let content = '';
    if (codeMatch && codeMatch[1]) {
      content = codeMatch[1].trim();
    } else {
      content = blockContent.replace(/(?:---|===)\s*$/, '').trim();
    }

    if (path && content) {
      if (!files.some(f => f.path === path)) {
        files.push({ path, content });
      }
    }
  }

  return files;
};

/**
 * Legge un elenco di richieste di file fornite dall'utente e le serializza in un unico formato di stringa strutturato.
 * Decomprime condizionatamente gli archivi ZIP in base alla selezione dell'utente.
 * @param {FileUploadRequest[]} inputItems - L'elenco delle richieste di caricamento file dall'utente.
 * @returns {Promise<string>} Una promessa che si risolve nella stringa di contenuto combinata e formattata.
 */
export const processInputFiles = async (inputItems: FileUploadRequest[]): Promise<string> => {
    let combinedContent = '';
    for (const item of inputItems) {
        const { file, decompress } = item;
        const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
        
        if (isZip && decompress) {
            const zip = await JSZip.loadAsync(file);
            for (const path in zip.files) {
                if (zip.files[path].dir || path.split('/').some(part => part.startsWith('.'))) continue;
                try {
                    const content = await zip.files[path].async('string');
                    if (!content.trim()) continue;
                    const lang = path.split('.').pop() || '';
                    combinedContent += `### \`${path}\`\n\`\`\`${lang}\n${content}\n\`\`\`\n---\n`;
                } catch (e) {
                     console.warn(`Impossibile leggere il file ${path} dallo zip come testo, saltato.`, e);
                }
            }
        } else {
            const path = (file as any).webkitRelativePath || file.name;
            if (file.size === 0 || path.split('/').some(part => part.startsWith('.'))) continue;

            try {
                const content = await file.text();
                const lang = path.split('.').pop() || '';
                combinedContent += `### \`${path}\`\n\`\`\`${lang}\n${content}\n\`\`\`\n---\n`;
            } catch (e) {
                console.warn(`Impossibile leggere il file ${path} come testo, saltato. Potrebbe essere un file binario.`, e);
            }
        }
    }
    return combinedContent;
};

/**
 * Legge un singolo file di esportazione della chat (es. da Gemini) e restituisce il suo contenuto come stringa.
 * @param {File} file - Il file della chat caricato dall'utente.
 * @returns {Promise<string>} Una promessa che si risolve con il contenuto testuale completo del file.
 */
export const processChatFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith('text/')) {
        console.warn(`Il file ${file.name} potrebbe non essere un file di testo, si tenterà comunque di leggerlo.`);
    }
    try {
        const content = await file.text();
        return content;
    } catch (e) {
        console.error(`Impossibile leggere il file ${file.name} come testo.`, e);
        throw new Error(`Impossibile leggere il file caricato. Assicurati che sia un file di testo valido (.txt).`);
    }
};

/**
 * Recupera il contenuto testuale di una chat Gemini da un link di condivisione pubblico.
 * @param {string} url - L'URL completo del link di condivisione di Gemini.
 * @returns {Promise<string>} Una promessa che si risolve con il contenuto testuale estratto dalla pagina.
 * @throws Un errore se il recupero fallisce, con un messaggio specifico per i problemi di CORS.
 */
export const processGeminiShareLink = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Il server ha risposto con lo stato: ${response.status}`);
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Un modo semplice per ottenere il contenuto principale, robusto contro le modifiche delle classi
        const mainContent = doc.querySelector('main') || doc.body;
        return mainContent.innerText;
    } catch (e) {
        console.error("Errore durante il recupero del link di condivisione di Gemini:", e);
        // Questo è un errore comune per le richieste cross-origin
        if (e instanceof TypeError && e.message.includes('fetch')) {
             throw new Error("Impossibile recuperare il contenuto dal link. Questo è probabilmente dovuto a restrizioni di sicurezza del browser (CORS). Prova invece il metodo di caricamento del file.");
        }
        throw new Error(`Impossibile elaborare il link. Motivo: ${e instanceof Error ? e.message : 'Errore sconosciuto'}`);
    }
};

/**
 * Utilizza l'AI per espandere un'idea di progetto di alto livello in una stringa di struttura di progetto completa.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI.
 * @param {string} initialIdea - Il prompt iniziale di alto livello dell'utente.
 * @returns {Promise<string>} Una promessa che si risolve nella struttura completa del progetto come una singola stringa.
 */
export const expandProjectIdea = async (settings: AppSettings, promptConfig: EditablePrompt, initialIdea: string): Promise<string> => {
    try {
        const prompt = promptConfig.content.replace('PROJECT_CONTENT_PLACEHOLDER', initialIdea);
        const response = await performAiGeneration({
            provider: promptConfig.provider,
            settings,
            model: promptConfig.model,
            prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Errore durante l'espansione dell'idea del progetto AI:", error);
        throw error;
    }
};

/**
 * Suggerisce un nome per il progetto basato sul suo contenuto.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI.
 * @param {string} fullProjectContent - Il contenuto completo del progetto.
 * @returns {Promise<string>} Una promessa che si risolve nella stringa del nome suggerito.
 */
export const suggestProjectName = async (settings: AppSettings, promptConfig: EditablePrompt, fullProjectContent: string): Promise<string> => {
    try {
        const prompt = promptConfig.content.replace('PROJECT_CONTENT_PLACEHOLDER', fullProjectContent.substring(0, 8000));
        const response = await performAiGeneration({ 
            provider: promptConfig.provider,
            settings,
            model: promptConfig.model,
            prompt 
        });
        return response.text.trim().replace(/["']/g, ""); // Rimuove le virgolette
    } catch (error) {
        console.error("Errore durante il suggerimento del nome del progetto AI:", error);
        throw error;
    }
};

/**
 * L'orchestratore principale per l'analisi del contenuto del progetto.
 * Combina l'analisi basata su regex con l'analisi AI per trovare file ed estrarre note.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {string} fullProjectContent - Il contenuto testuale completo dall'input dell'utente.
 * @param {AIPromptConfig} aiConfig - La configurazione corrente dei prompt AI e il loro stato di abilitazione.
 * @returns {Promise<{ files: ParsedFile[], documentationNotes: string }>} Una promessa che si risolve in un oggetto contenente l'elenco dei file e le note di documentazione.
 */
export const processAndParse = async (
    settings: AppSettings,
    fullProjectContent: string,
    aiConfig: AIPromptConfig
): Promise<{ files: ParsedFile[], documentationNotes: string }> => {
    const initialFiles = parseWithRegex(fullProjectContent);
    let documentationNotes = '';
    let finalFiles = [...initialFiles];
    
    const parsedFilePaths = initialFiles.length > 0 ? JSON.stringify(initialFiles.map(f => f.path)) : "None";

    if (aiConfig.fileFinder.enabled) {
        const additionalFiles = await findAdditionalFiles(settings, aiConfig.fileFinder, fullProjectContent, parsedFilePaths);
        const existingPaths = new Set(finalFiles.map(f => f.path));
        if (Array.isArray(additionalFiles)) {
            additionalFiles.forEach((file: any) => {
                if (file && typeof file.path === 'string' && typeof file.content === 'string' && !existingPaths.has(file.path)) {
                    finalFiles.push({ path: file.path, content: file.content });
                    existingPaths.add(file.path);
                }
            });
        }
    }

    if (aiConfig.docExtractor.enabled) {
        documentationNotes = await extractDocumentationNotes(settings, aiConfig.docExtractor, fullProjectContent);
    }
    
    return { files: finalFiles, documentationNotes };
};

/**
 * Utilizza l'AI per trovare eventuali file aggiuntivi che il parser regex potrebbe aver perso.
 * @private
 */
async function findAdditionalFiles(settings: AppSettings, promptConfig: EditablePrompt, fullProjectContent: string, parsedFilePaths: string): Promise<ParsedFile[]> {
    try {
        const prompt = promptConfig.content
            .replace('ORIGINAL_CONTENT_PLACEHOLDER', fullProjectContent)
            .replace('PARSED_FILES_PLACEHOLDER', parsedFilePaths);
        
        const schema = { type: Type.OBJECT, properties: { additionalFiles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { path: { type: Type.STRING }, content: { type: Type.STRING } }, required: ['path', 'content'] }}}, required: ['additionalFiles'] };

        const response = await performAiGeneration({
            provider: promptConfig.provider,
            settings,
            model: promptConfig.model,
            prompt, jsonMode: true,
            systemInstruction: "La tua risposta deve essere un oggetto JSON valido contenente una singola chiave `additionalFiles`, che è un array di oggetti, ciascuno con una stringa `path` e `content`. Non aggiungere altro testo.",
            responseSchema: schema
        });
        
        const aiResult = safeJsonParse(response.text);
        return aiResult?.additionalFiles || [];

    } catch (error) {
        console.error("Errore durante la ricerca di file AI:", error);
        throw error;
    }
}

/**
 * Utilizza l'AI per estrarre testo "orfano" (descrizioni, obiettivi) per una migliore documentazione.
 * @private
 */
async function extractDocumentationNotes(settings: AppSettings, promptConfig: EditablePrompt, fullProjectContent: string): Promise<string> {
    try {
        const prompt = promptConfig.content.replace('ORIGINAL_CONTENT_PLACEHOLDER', fullProjectContent);
        const schema = { type: Type.OBJECT, properties: { documentationNotes: { type: Type.STRING }}, required: ['documentationNotes'] };

        const response = await performAiGeneration({
            provider: promptConfig.provider,
            settings,
            model: promptConfig.model,
            prompt, jsonMode: true,
            systemInstruction: "La tua risposta deve essere un oggetto JSON valido contenente una singola chiave `documentationNotes`, che è una stringa. Non aggiungere altro testo.",
            responseSchema: schema
        });
        
        const aiResult = safeJsonParse(response.text);
        return aiResult?.documentationNotes || '';

    } catch (error) {
        console.error("Errore durante l'estrazione della documentazione AI:", error);
        throw error;
    }
}