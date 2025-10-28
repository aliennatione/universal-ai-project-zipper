/**
 * @file Contiene la logica per interagire con l'API di GitHub, specificamente per recuperare repository.
 * @module githubService
 */

/**
 * Recupera un repository pubblico di GitHub come file ZIP.
 * @param {string} repoUrl - L'URL completo del repository pubblico di GitHub (es. "https://github.com/user/repo").
 * @returns {Promise<File>} Una promessa che si risolve in un oggetto `File` che rappresenta l'archivio ZIP scaricato.
 * @throws Un errore se l'URL non è valido o il repository non può essere recuperato.
 */
export const fetchRepoAsZip = async (repoUrl: string): Promise<File> => {
    const urlPattern = /^https?:\/\/github\.com\/([^\/]+\/[^\/]+)\/?.*$/;
    const match = repoUrl.match(urlPattern);

    if (!match || !match[1]) {
        throw new Error("URL del repository GitHub non valido. Formato atteso: https://github.com/owner/repo");
    }
    
    const repoPath = match[1];
    const repoName = repoPath.split('/')[1];
    const zipUrl = `https://api.github.com/repos/${repoPath}/zipball`;

    try {
        const response = await fetch(zipUrl);
        if (!response.ok) {
            throw new Error(`Impossibile recuperare il repository: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        return new File([blob], `${repoName}.zip`, { type: 'application/zip' });
    } catch (error) {
        console.error("Errore durante il recupero del repository GitHub:", error);
        throw new Error(`Impossibile scaricare il repository. Potrebbe essere privato o l'URL è errato. ${error instanceof Error ? error.message : ''}`);
    }
};
