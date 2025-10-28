import { performAiChat, performAiGeneration } from './aiClient';
import { AppSettings, Provider, ChatMessage, AIPromptConfig } from '../types';

/**
 * @file Contiene la logica per lo scaffolding di un progetto tramite una conversazione con un AI architect.
 * @module scaffoldingService
 */

/**
 * Gestisce la parte conversazionale dello scaffolding del progetto.
 * @param {AppSettings} settings - Impostazioni dell'app, utilizzate per determinare il provider e il modello per la chat.
 * @param {AIPromptConfig} aiConfig - La configurazione completa dell'AI, da cui verrà estratto il system prompt.
 * @param {ChatMessage[]} messages - La cronologia della chat.
 * @returns {Promise<string>} La successiva risposta dell'AI.
 * @throws Un errore se la chiamata API fallisce o la chiave API è mancante.
 */
export const chatWithArchitect = async (
    settings: AppSettings,
    aiConfig: AIPromptConfig,
    messages: ChatMessage[],
): Promise<string> => {
    const { provider, model, content: systemInstruction } = aiConfig.architect;

    try {
        const response = await performAiChat({ provider, settings, model, messages, systemInstruction });
        return response.text.trim();
    } catch (error) {
        console.error(`Errore durante la chat con l'architetto con ${provider}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
        throw new Error(`Impossibile ottenere una risposta dall'architetto AI. Motivo: ${errorMessage}`);
    }
};

/**
 * Genera la struttura finale del progetto basata su una conversazione.
 * @param {AppSettings} settings - Le impostazioni dell'app.
 * @param {AIPromptConfig['projectOverview']} expansionPromptConfig - La configurazione per il prompt di espansione dell'idea di progetto.
 * @param {ChatMessage[]} conversation - La cronologia completa della conversazione.
 * @returns {Promise<string>} La struttura del progetto generata come una singola stringa.
 * @throws Un errore se la chiamata API fallisce o la chiave API è mancante.
 */
export const generateProjectFromConversation = async (
    settings: AppSettings,
    expansionPromptConfig: AIPromptConfig['projectOverview'],
    conversation: ChatMessage[]
): Promise<string> => {
    const { provider, model, content: promptTemplate } = expansionPromptConfig;
    const conversationText = conversation.map(m => `${m.role === 'user' ? 'Utente' : 'Architetto'}: ${m.content}`).join('\n\n');
    
    const prompt = promptTemplate.replace('PROJECT_CONTENT_PLACEHOLDER', `La seguente è una conversazione tra un utente e un architetto AI per definire un progetto. Usa questa intera conversazione come fonte definitiva di requisiti per generare un progetto completo e ben strutturato.\n\n---\n${conversationText}\n---`);

    try {
        const response = await performAiGeneration({ provider, settings, model, prompt });
        return response.text.trim();
    } catch (error) {
        console.error(`Errore durante la generazione del progetto dalla conversazione con ${provider}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
        throw new Error(`Impossibile generare il progetto dalla conversazione. Motivo: ${errorMessage}`);
    }
};