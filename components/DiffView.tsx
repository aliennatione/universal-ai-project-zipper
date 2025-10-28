import React, { useMemo } from 'react';
import * as Diff from 'diff';
import { html as diff2html } from 'diff2html';
import { useAppContext } from '../contexts/AppContext';

interface DiffViewProps {
    original: string;
    modified: string;
    filePath: string;
    onAccept: () => void;
    onReject: () => void;
}

export const DiffView: React.FC<DiffViewProps> = ({ original, modified, filePath, onAccept, onReject }) => {
    const { t } = useAppContext();
    
    const diffHtml = useMemo(() => {
        const diff = Diff.createTwoFilesPatch(filePath, filePath, original, modified, '', '', { context: 5 });
        return diff2html(diff, {
            drawFileList: false,
            matching: 'lines',
            outputFormat: 'side-by-side',
            renderNothingWhenEmpty: true,
        });
    }, [original, modified, filePath]);

    return (
        <div className="w-full h-full flex flex-col bg-secondary dark:bg-dark-secondary rounded-lg border border-border-color dark:border-dark-border-color">
            <div className="flex justify-between items-center p-3 bg-tertiary/50 dark:bg-dark-tertiary/50 border-b border-border-color dark:border-dark-border-color flex-shrink-0 flex-wrap gap-2">
                <span className="font-mono text-sm text-accent dark:text-dark-accent" title={filePath}>
                    {t('diffView.showingChanges', filePath)}
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={onReject} className="px-3 py-1 bg-danger/80 hover:bg-danger text-white text-xs font-semibold rounded-md transition-colors">
                        {t('diffView.reject')}
                    </button>
                    <button onClick={onAccept} className="px-3 py-1 bg-accent hover:bg-accent-hover text-accent-text dark:text-dark-accent-text text-xs font-semibold rounded-md transition-colors">
                        {t('diffView.accept')}
                    </button>
                </div>
            </div>
            <div className="diff-container overflow-auto flex-grow p-4">
                {/* The diff2html library needs some specific styling to work with our theme */}
                <style>{`
                    .d2h-file-header { display: none; }
                    .d2h-diff-table { border-collapse: separate; border-spacing: 0 1px; width: 100%; }
                    .d2h-code-line {
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                        font-size: 13px;
                        padding: 0 0.5em;
                        white-space: pre-wrap;
                        vertical-align: top;
                    }
                    .d2h-code-side-line {
                         border: 1px solid transparent;
                         border-radius: 4px;
                         padding: 2px 4px;
                         display: table-cell;
                    }
                    .d2h-code-line-prefix, .d2h-code-side-line-prefix {
                        padding-right: 0.5em;
                        user-select: none;
                        background: none !important;
                        border: none !important;
                    }
                    .d2h-info { background-color: #f1f8ff; color: #333; }
                    .d2h-del { background-color: #fee8e8; }
                    .d2h-ins { background-color: #e8fef8; }
                    .dark .d2h-info { background-color: #1f2a38; color: #e0e0e0; }
                    .dark .d2h-del { background-color: #3f1212; color: #f9d7d7; }
                    .dark .d2h-ins { background-color: #0d382f; color: #c4f9eb; }
                    .d2h-line-num1, .d2h-line-num2 {
                       color: #888;
                       background-color: transparent !important;
                       border-color: #e2e8f0 !important;
                       padding: 2px 0;
                       width: 40px;
                       min-width: 40px;
                    }
                    .dark .d2h-line-num1, .dark .d2h-line-num2 {
                        border-color: #3f3f46 !important;
                        color: #6b7280;
                    }
                `}</style>
                <div dangerouslySetInnerHTML={{ __html: diffHtml }} />
            </div>
        </div>
    );
};