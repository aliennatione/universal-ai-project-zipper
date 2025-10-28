import { performAiChat } from './aiClient';
import { AppSettings, ChatMessage } from '../types';

/**
 * @file Contiene la logica per la chat interattiva per migliorare i prompt di configurazione dell'utente.
 * @module promptImprovementService
 */

/**
 * Interagisce con un'AI in modo simile a una chat per perfezionare un dato prompt.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione, che includono il modello specifico per questo task.
 * @param {string} originalPrompt - Il prompt iniziale che l'utente vuole migliorare.
 * @param {ChatMessage[]} messages - La cronologia completa della conversazione con l'utente.
 * @returns {Promise<string>} Una promessa che si risolve nella successiva risposta dell'AI nella conversazione.
 * @throws Un errore se la chiamata API fallisce o se la chiave API è mancante.
 */
export const improvePromptWithChat = async (
    settings: AppSettings,
    originalPrompt: string,
    messages: ChatMessage[]
): Promise<string> => {
    const provider = settings.promptImprovementProvider;
    const model = settings.promptImprovementModel;
    
    const systemInstruction = `Sei un utile assistente AI specializzato in prompt engineering. Un utente vuole migliorare uno dei suoi prompt. Il tuo obiettivo è guidarlo per renderlo più chiaro, specifico ed efficace per l'AI di destinazione.

Il prompt originale dell'utente è:
---
${originalPrompt}
---

Interagisci con l'utente in modo colloquiale. Quando sei sicuro di avere una buona versione finale, presentala chiaramente. Se l'utente chiede la versione finale, fornisci solo il testo del prompt finale e nient'altro.`;

    try {
        const response = await performAiChat({
            provider,
            settings,
            model,
            messages,
            systemInstruction,
        });
        
        return response.text.trim();

    } catch (error) {
        console.error(`Errore durante il miglioramento del prompt con ${provider}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
        throw new Error(`Impossibile ottenere una risposta dall'assistente AI. Motivo: ${errorMessage}`);
    }
};