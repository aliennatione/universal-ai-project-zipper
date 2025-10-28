/**
 * @file Contiene funzioni di utilità condivise utilizzate in vari servizi.
 * @module utils
 */

/**
 * Pulisce la risposta dell'AI per estrarre solo il codice.
 * Rimuove i blocchi di codice markdown (es. ```javascript) e taglia gli spazi bianchi.
 * @param {string} rawText - La risposta testuale grezza dall'AI.
 * @returns {string} La stringa di codice pulita.
 */
export const cleanAiCodeResponse = (rawText: string): string => {
    const trimmed = rawText.trim();
    // Questo regex gestisce ```lang\n...``` e ```\n...```
    const codeBlockRegex = /^```(?:\w*\n)?([\s\S]+)```$/;
    const match = trimmed.match(codeBlockRegex);
    if (match && match[1]) {
        return match[1].trim();
    }
    return trimmed;
};

/**
 * Analizza in modo sicuro una stringa JSON dall'AI, rimuovendo i delimitatori di markdown se presenti.
 * @param {string} text - La risposta testuale grezza dall'AI.
 * @returns {any} L'oggetto JavaScript analizzato, o null se l'analisi fallisce.
 */
export const safeJsonParse = (text: string): any => {
    const rawText = text.trim();
    const jsonText = rawText.startsWith('```json') ? rawText.replace(/```json\n|```/g, '') : rawText;
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Impossibile analizzare JSON dalla risposta AI:", jsonText, e);
        return null;
    }
};
