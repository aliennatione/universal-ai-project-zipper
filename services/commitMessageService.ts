import { performAiGeneration } from './aiClient';
import { AppSettings, EditablePrompt } from '../types';

/**
 * @file Contiene la logica per generare messaggi di commit utilizzando l'AI.
 * @module commitMessageService
 */

/**
 * Genera un messaggio di commit basato sul nome del progetto e un elenco di percorsi di file.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI.
 * @param {string} projectName - Il nome del progetto corrente.
 * @param {string[]} filePaths - Un array dei percorsi dei file nel progetto.
 * @returns {Promise<string>} Una promessa che si risolve nel messaggio di commit generato.
 * @throws Un errore se la chiamata API fallisce.
 */
export const generateCommitMessage = async (
    settings: AppSettings,
    promptConfig: EditablePrompt,
    projectName: string,
    filePaths: string[]
): Promise<string> => {
    if (filePaths.length === 0) {
        return "Initial commit";
    }

    const prompt = promptConfig.content
        .replace('{projectName}', projectName)
        .replace('{filePaths}', filePaths.join('\n- '));

    try {
        const response = await performAiGeneration({
            provider: promptConfig.provider,
            settings,
            model: promptConfig.model,
            prompt,
        });
        // Pulisce la risposta per rimuovere eventuali virgolette esterne
        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error(`Errore durante la generazione del messaggio di commit con ${promptConfig.provider}:`, error);
        // Restituisce un messaggio di fallback in caso di errore
        return `feat: Initialize project structure for ${projectName}`;
    }
};