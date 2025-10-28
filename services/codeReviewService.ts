import { performAiGeneration } from './aiClient';
import { AppSettings, EditablePrompt } from '../types';

/**
 * @file Contiene la logica per richiedere una revisione del codice a un provider AI.
 * @module codeReviewService
 */

/**
 * Esegue una revisione del codice utilizzando il provider AI selezionato.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI.
 * @param {string} code - Il codice sorgente da revisionare.
 * @returns {Promise<string>} Una promessa che si risolve nella stringa markdown della revisione del codice.
 * @throws Un errore se la chiamata API fallisce o la chiave API è mancante.
 */
export const reviewCode = async (settings: AppSettings, promptConfig: EditablePrompt, code: string): Promise<string> => {
  if (!code.trim()) {
    return "Il file è vuoto. Niente da revisionare.";
  }
  
  const prompt = promptConfig.content.replace('CODE_PLACEHOLDER', code);
  
  try {
    const response = await performAiGeneration({
        provider: promptConfig.provider,
        settings,
        model: promptConfig.model,
        prompt
    });
    return response.text.trim();

  } catch (error) {
    console.error(`Errore durante la revisione del codice con ${promptConfig.provider}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
    throw new Error(`Impossibile revisionare il codice. Motivo: ${errorMessage}`);
  }
};