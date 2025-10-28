import { performMultipartAiGeneration } from './aiClient';
import { AppSettings } from '../types';

/**
 * @file Contiene la logica per la trascrizione di file audio utilizzando l'AI.
 * @module transcriptionService
 */

/**
 * Converte un oggetto File in una stringa base64.
 * @param {File} file - Il file da convertire.
 * @returns {Promise<string>} Una promessa che si risolve nella stringa base64 del file.
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            resolve(result);
        };
        reader.onerror = error => reject(error);
    });
};

/**
 * Trascrive un file audio utilizzando il modello Gemini.
 * @param {AppSettings} settings - Le impostazioni globali dell'applicazione.
 * @param {File} audioFile - Il file audio da trascrivere.
 * @returns {Promise<string>} Una promessa che si risolve nel testo trascritto.
 * @throws Un errore se la chiamata API fallisce.
 */
export const transcribeAudio = async (settings: AppSettings, audioFile: File): Promise<string> => {
    try {
        const base64Audio = await fileToBase64(audioFile);

        const response = await performMultipartAiGeneration({
            provider: 'google',
            settings,
            model: 'gemini-2.5-flash', // Modello ottimale per compiti multimodali
            textPart: "Trascrivi l'audio fornito. Restituisci solo il testo trascritto.",
            dataPart: {
                mimeType: audioFile.type,
                data: base64Audio,
            },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Errore durante la trascrizione dell'audio:", error);
        const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore API sconosciuto.';
        throw new Error(`Impossibile trascrivere l'audio. Motivo: ${errorMessage}`);
    }
};