import { performAiGeneration } from './aiClient';
import { AppSettings, EditablePrompt } from '../types';

/**
 * @file Contiene la logica per generare una wiki di documentazione utilizzando l'AI.
 * @module wikiGenerationService
 */

/**
 * Genera il contenuto di una wiki di documentazione utilizzando il provider AI selezionato.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI.
 * @param {string} projectName - Il nome del progetto, da usare come riferimento.
 * @param {string} fullProjectContent - Il contenuto testuale completo dall'input dell'utente.
 * @returns {Promise<string>} Una promessa che si risolve nella stringa contenente tutti i file della wiki.
 */
export const generateWiki = async (settings: AppSettings, promptConfig: EditablePrompt, projectName: string, fullProjectContent: string): Promise<string> => {
  const contentForWiki = `
**Nome Progetto:**
${projectName}

**Contenuto Originale del Progetto (per contesto):**
${fullProjectContent.substring(0, 10000)}
  `;
  
  try {
    const response = await performAiGeneration({
        provider: promptConfig.provider,
        settings,
        model: promptConfig.model,
        prompt: promptConfig.content.replace('PROJECT_CONTENT_PLACEHOLDER', contentForWiki)
    });
    
    return response.text.trim();

  } catch (error) {
    console.error(`Errore durante la generazione della Wiki con ${promptConfig.provider}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
    return `### ERROR.md\n\n# Errore nella generazione della Wiki\n\n**Attenzione: Impossibile generare automaticamente la wiki a causa di un errore.**\n\n**Dettagli Errore:**\n\`\`\`\n${errorMessage}\n\`\`\``;
  }
};