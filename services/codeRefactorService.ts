import { performAiGeneration } from './aiClient';
import { AppSettings, EditablePrompt } from '../types';
import { cleanAiCodeResponse } from './utils';

/**
 * @file Contiene la logica per richiedere il refactoring del codice a un provider AI.
 * @module codeRefactorService
 */

/**
 * Refattorizza un pezzo di codice utilizzando il provider AI selezionato basandosi su un template di prompt fornito.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI.
 * @param {string} code - Il codice sorgente da refattorizzare.
 * @returns {Promise<string>} Una promessa che si risolve nella stringa di codice refattorizzato.
 * @throws Un errore se la chiamata API fallisce o la chiave API è mancante.
 */
export const refactorCode = async (settings: AppSettings, promptConfig: EditablePrompt, code: string): Promise<string> => {
  if (!code.trim()) {
    return code; // Restituisce il contenuto originale se non c'è nulla da refattorizzare.
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
    console.error(`Errore durante il refactoring del codice con ${promptConfig.provider}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
    throw new Error(`Impossibile refattorizzare il codice. Motivo: ${errorMessage}`);
  }
};
