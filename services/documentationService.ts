import { performAiGeneration } from './aiClient';
import { AppSettings, EditablePrompt } from '../types';

/**
 * @file Contiene la logica per generare documentazione, come file README.md, utilizzando l'AI.
 * @module documentationService
 */

/**
 * Genera il contenuto di un file README.md utilizzando il provider AI selezionato.
 * Sintetizza il nome del progetto, il contenuto originale e le note estratte in un documento completo.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {EditablePrompt} promptConfig - La configurazione per questo specifico task AI.
 * @param {string} projectName - Il nome del progetto, da usare come titolo principale.
 * @param {string} fullProjectContent - Il contenuto testuale completo dall'input dell'utente.
 * @param {string} documentationNotes - Note aggiuntive dal parser AI da includere.
 * @returns {Promise<string>} Una promessa che si risolve nella stringa markdown del README.md generato.
 */
export const generateReadme = async (settings: AppSettings, promptConfig: EditablePrompt, projectName: string, fullProjectContent: string, documentationNotes: string): Promise<string> => {
  const contentForReadme = [
    `**Nome Progetto:**\n${projectName}`,
    `**Contenuto Originale del Progetto:**\n${fullProjectContent.substring(0, 8000)}`,
    `---\n**Note di Documentazione Aggiuntive (Dare priorità a questo):**\n${documentationNotes || "N/A"}`
  ].join('\n\n');
  
  try {
    const response = await performAiGeneration({
        provider: promptConfig.provider,
        settings,
        model: promptConfig.model,
        prompt: `${promptConfig.content}\n\nEcco le informazioni da analizzare:\n---\n${contentForReadme}`
    });
    
    return response.text.trim();

  } catch (error) {
    console.error(`Errore durante la generazione del README con ${promptConfig.provider}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
    return `# ${projectName}\n\n**Attenzione: Impossibile generare automaticamente README.md a causa di un errore.**\n\n**Dettagli Errore:**\n\`\`\`\n${errorMessage}\n\`\`\``;
  }
};