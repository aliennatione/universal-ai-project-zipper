import { performAiGeneration } from './aiClient';
import { AppSettings, EditablePrompt } from '../types';

/**
 * @file Contiene la logica per tradurre il testo utilizzando un provider AI.
 * @module translationService
 */

/**
 * Traduce il testo nella lingua di destinazione specificata utilizzando il provider AI selezionato.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI (anche se il prompt viene da un template, il modello e il provider vengono usati).
 * @param {string} text - Il testo da tradurre.
 * @param {'Italian' | 'English'} targetLanguage - La lingua in cui tradurre (o 'Italiano' o 'Inglese').
 * @returns {Promise<string>} Una promessa che si risolve nella stringa di testo tradotto.
 * @throws Un errore se la chiamata API fallisce o se la chiave API è mancante.
 */
export const translateText = async (settings: AppSettings, promptConfig: EditablePrompt, text: string, targetLanguage: 'Italian' | 'English'): Promise<string> => {
    const promptContent = promptConfig.content
        .replace('{text}', text)
        .replace('{targetLanguage}', targetLanguage);

    try {
        const response = await performAiGeneration({
            provider: promptConfig.provider,
            settings,
            model: promptConfig.model,
            prompt: promptContent
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Errore durante la traduzione del testo in ${targetLanguage} con ${promptConfig.provider}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto durante la traduzione.';
        throw new Error(`Impossibile tradurre il testo. Motivo: ${errorMessage}`);
    }
};