import { ParsedFile } from '../types';

/**
 * @file Contiene la logica per interagire con l'API di GitHub per creare repository ed effettuare il push di file.
 * @module githubPushService
 */

const GITHUB_API_URL = 'https://api.github.com';

interface GitHubApiOptions {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    headers: Record<string, string>;
    body?: string;
}

/**
 * Funzione di utilità per effettuare richieste all'API REST di GitHub.
 * @private
 */
const githubApiRequest = async (endpoint: string, token: string, options: Partial<GitHubApiOptions> = {}) => {
    const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Could not parse error response.' }));
        throw new Error(`GitHub API Error (${response.status} on ${options.method || 'GET'} ${endpoint}): ${errorData.message}`);
    }

    // Per le richieste 204 No Content, non tentare di analizzare il corpo
    if (response.status === 204) {
        return null;
    }
    
    return response.json();
};

/**
 * Crea un nuovo repository GitHub per l'utente autenticato.
 * @param token Il Personal Access Token di GitHub.
 * @param repoName Il nome del nuovo repository.
 * @param isPrivate Se il repository deve essere privato.
 * @returns La risposta dall'API di GitHub.
 */
export const createNewRepo = async (token: string, repoName: string, isPrivate: boolean) => {
    return githubApiRequest('/user/repos', token, {
        method: 'POST',
        body: JSON.stringify({
            name: repoName,
            private: isPrivate,
            auto_init: false, // Non inizializzare con un README, lo faremo noi
        }),
    });
};

/**
 * Ottiene il SHA dell'ultimo commit su un branch specifico.
 * Se il branch non esiste, restituisce null.
 * @private
 */
const getLatestCommitSha = async (token: string, owner: string, repo: string, branch: string): Promise<string | null> => {
    try {
        const refData = await githubApiRequest(`/repos/${owner}/${repo}/git/ref/heads/${branch}`, token);
        return refData.object.sha;
    } catch (error) {
        // Un errore 404 qui significa che il branch non esiste, il che è un caso valido.
        if (error instanceof Error && error.message.includes('404')) {
            return null;
        }
        throw error; // Rilancia altri errori
    }
};

/**
 * Crea un blob per ogni file del progetto.
 * @private
 */
const createBlobs = async (token: string, owner: string, repo: string, files: ParsedFile[]): Promise<{ path: string; sha: string; }[]> => {
    const blobPromises = files.map(async (file) => {
        const blobData = await githubApiRequest(`/repos/${owner}/${repo}/git/blobs`, token, {
            method: 'POST',
            body: JSON.stringify({
                content: file.content,
                encoding: 'utf-8',
            }),
        });
        return { path: file.path, sha: blobData.sha };
    });
    return Promise.all(blobPromises);
};

/**
 * Crea un albero Git che rappresenta la struttura del progetto.
 * @private
 */
const createTree = async (token: string, owner: string, repo: string, blobs: { path: string; sha: string; }[]): Promise<string> => {
    const tree = blobs.map(blob => ({
        path: blob.path,
        mode: '100644', // File (blob)
        type: 'blob',
        sha: blob.sha,
    }));

    const treeData = await githubApiRequest(`/repos/${owner}/${repo}/git/trees`, token, {
        method: 'POST',
        body: JSON.stringify({ tree }),
    });
    return treeData.sha;
};

/**
 * Crea un nuovo commit.
 * @private
 */
const createCommit = async (token: string, owner: string, repo: string, treeSha: string, message: string, parentSha: string | null): Promise<string> => {
    const commitData = await githubApiRequest(`/repos/${owner}/${repo}/git/commits`, token, {
        method: 'POST',
        body: JSON.stringify({
            message,
            tree: treeSha,
            parents: parentSha ? [parentSha] : [], // Un commit iniziale non ha parent
        }),
    });
    return commitData.sha;
};

/**
 * Aggiorna o crea un riferimento di branch per puntare al nuovo commit.
 * @private
 */
const updateBranchRef = async (token: string, owner: string, repo: string, branch: string, newCommitSha: string, force: boolean = false) => {
    const refEndpoint = `/repos/${owner}/${repo}/git/refs/heads/${branch}`;
    
    // Controlla se il branch esiste per decidere se creare o aggiornare
    const existingSha = await getLatestCommitSha(token, owner, repo, branch);

    if (existingSha) {
        // Il branch esiste, aggiornalo
        return githubApiRequest(refEndpoint, token, {
            method: 'PATCH',
            body: JSON.stringify({ sha: newCommitSha, force }),
        });
    } else {
        // Il branch non esiste, crealo
        return githubApiRequest(`/repos/${owner}/${repo}/git/refs`, token, {
            method: 'POST',
            body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha: newCommitSha,
            }),
        });
    }
};


/**
 * Effettua il push di un set di file su un repository GitHub. Questo simula un `git push`.
 * @param token Il Personal Access Token di GitHub.
 * @param repoFullName Il nome completo del repository (es. "owner/repo").
 * @param branch Il branch su cui effettuare il push.
 * @param files L'array di file da committare.
 * @param commitMessage Il messaggio di commit.
 */
export const pushToRepo = async (token: string, repoFullName: string, branch: string, files: ParsedFile[], commitMessage: string) => {
    const [owner, repo] = repoFullName.split('/');
    if (!owner || !repo) {
        throw new Error("Formato del nome del repository non valido. Usare 'owner/repo'.");
    }

    // 1. Ottieni l'ultimo commit (se il branch esiste)
    const parentSha = await getLatestCommitSha(token, owner, repo, branch);

    // 2. Crea i blob per ogni file
    const blobs = await createBlobs(token, owner, repo, files);

    // 3. Crea l'albero git
    const treeSha = await createTree(token, owner, repo, blobs);

    // 4. Crea il commit
    const newCommitSha = await createCommit(token, owner, repo, treeSha, commitMessage, parentSha);

    // 5. Aggiorna (o crea) il riferimento del branch
    await updateBranchRef(token, owner, repo, branch, newCommitSha);

    return `https://github.com/${owner}/${repo}/tree/${branch}`;
};
