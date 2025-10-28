import { ParsedFile, AppSettings, EditablePrompt } from '../types';
import { performAiGeneration } from './aiClient';
import { Type } from "@google/genai";
import { safeJsonParse } from './utils';

/**
 * @file Contiene la logica per generare file di test per un dato file sorgente utilizzando l'AI.
 * @module testGenerationService
 */

/**
 * Genera un file di test per un dato file sorgente utilizzando il provider AI selezionato.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI.
 * @param {ParsedFile} sourceFile - Il file sorgente per cui generare i test.
 * @returns {Promise<ParsedFile | null>} Una promessa che si risolve nel nuovo file di test come oggetto `ParsedFile`, o null in caso di fallimento.
 * @throws Un errore se la chiamata API fallisce o la chiave API è mancante.
 */
export const generateTestsForFile = async (settings: AppSettings, promptConfig: EditablePrompt, sourceFile: ParsedFile): Promise<ParsedFile | null> => {
    if (!sourceFile.content.trim()) {
        return null; // Non generare test per file vuoti.
    }

    const prompt = promptConfig.content
        .replace('{filePath}', sourceFile.path)
        .replace('{fileContent}', sourceFile.content);

    const schema = {
        type: Type.OBJECT,
        properties: {
            path: { type: Type.STRING },
            content: { type: Type.STRING }
        },
        required: ['path', 'content']
    };

    try {
        const response = await performAiGeneration({
            provider: promptConfig.provider,
            settings,
            model: promptConfig.model,
            prompt,
            jsonMode: true,
            systemInstruction: "La tua risposta deve essere un oggetto JSON valido contenente due chiavi: `path` (il percorso del nuovo file di test) e `content` (il codice del nuovo file di test). Non aggiungere altro testo.",
            responseSchema: schema
        });

        const result = safeJsonParse(response.text);
        
        if (result && typeof result.path === 'string' && typeof result.content === 'string') {
            return {
                path: result.path,
                content: result.content
            };
        }
        
        console.error("La risposta AI per la generazione di test non era nel formato previsto:", result);
        return null;

    } catch (error) {
        console.error(`Errore durante la generazione di test con ${promptConfig.provider}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
        throw new Error(`Impossibile generare i test. Motivo: ${errorMessage}`);
    }
};
