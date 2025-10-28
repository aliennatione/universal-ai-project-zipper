import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface UserGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const renderMarkdown = (md: string): { __html: string } => {
    let html = md
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3 border-b border-border-color dark:border-dark-border-color pb-2">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');

    // Bold and Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent dark:text-dark-accent underline hover:no-underline">$1</a>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-accent dark:border-dark-accent pl-4 italic my-4">$1</blockquote>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => 
        `<pre class="bg-tertiary dark:bg-dark-tertiary p-4 rounded-lg overflow-x-auto my-4"><code class="language-${lang || ''}">${code}</code></pre>`
    );
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-tertiary dark:bg-dark-tertiary px-1.5 py-1 rounded text-sm font-mono">$1</code>');
    
    // Lists (unordered)
    html = html.replace(/^\s*\n\* (.*)/gm, '<ul>\n* $1');
    html = html.replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2');
    html = html.replace(/^\* (.*)/gm, '<li class="ml-4 mb-1">$1</li>');

    // Lists (ordered)
    html = html.replace(/^\s*\n\d\.(.*)/gm, '<ol>\n1. $1');
    html = html.replace(/^(\d\..+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2');
    html = html.replace(/^\d\.(.*)/gm, '<li class="ml-4 mb-1">$1</li>');

    // Paragraphs
    html = html.split('\n\n').map(p => {
        if (p.trim().startsWith('<') || p.trim() === '') return p;
        return `<p class="mb-4">${p.trim()}</p>`;
    }).join('');

    return { __html: html };
};

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
    const { t } = useAppContext();
    const [content, setContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const isLoading = !content && !error;

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setContent('');
            fetch('/docs/USER_GUIDE.md')
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch guide');
                    return res.text();
                })
                .then(setContent)
                .catch(() => setError(t('userGuideModal.error')));
        }
    }, [isOpen, t]);

    const renderedHtml = useMemo(() => {
        if (!content) return { __html: '' };
        return renderMarkdown(content);
    }, [content]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-primary dark:bg-dark-primary rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-color dark:border-dark-border-color flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">{t('userGuideModal.title')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-tertiary dark:hover:bg-dark-tertiary transition-colors" aria-label={t('userGuideModal.close')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                
                <main className="p-6 flex-grow overflow-y-auto prose dark:prose-invert">
                    {isLoading && <p>{t('userGuideModal.loading')}</p>}
                    {error && <p className="text-danger dark:text-dark-danger">{error}</p>}
                    {content && <div dangerouslySetInnerHTML={renderedHtml} />}
                </main>

                <footer className="p-4 border-t border-border-color dark:border-dark-border-color flex justify-end items-center gap-4 flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text font-bold rounded-lg transition-colors">
                        {t('userGuideModal.close')}
                    </button>
                </footer>
            </div>
        </div>
    );
};