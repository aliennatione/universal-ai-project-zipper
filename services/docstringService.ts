import { performAiGeneration } from './aiClient';
import { AppSettings, EditablePrompt } from '../types';
import { cleanAiCodeResponse } from './utils';

/**
 * @file Contiene la logica per richiedere l'aggiunta di docstring al codice a un provider AI.
 * @module docstringService
 */

/**
 * Aggiunge docstring a un pezzo di codice utilizzando il provider AI selezionato.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI.
 * @param {string} code - Il codice sorgente a cui aggiungere le docstring.
 * @returns {Promise<string>} Una promessa che si risolve nel codice con le docstring aggiunte.
 * @throws Un errore se la chiamata API fallisce o la chiave API è mancante.
 */
export const addDocstringsToFile = async (settings: AppSettings, promptConfig: EditablePrompt, code: string): Promise<string> => {
  if (!code.trim()) {
    return code; // Restituisce il contenuto originale se non c'è nulla da documentare.
  }
  
  const prompt = promptConfig.content.replace('CODE_PLACEHOLDER', code);
  
  try {
    const response = await performAiGeneration({
        provider: promptConfig.provider,
        settings,
        model: promptConfig.model,
        prompt
    });
    return cleanAiCodeResponse(response.text);

  } catch (error) {
    console.error(`Errore durante l'aggiunta di docstring con ${promptConfig.provider}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
    throw new Error(`Impossibile aggiungere le docstring. Motivo: ${errorMessage}`);
  }
};
