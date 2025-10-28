import { useState, useCallback } from 'react';
import { AppSettings, AIPromptConfig, AISuggestion, EditablePrompt, ParsedFile } from '../types';

import { suggestProjectName, processAndParse, parseWithRegex } from '../services/projectParser';
import { generateWiki } from '../services/wikiGenerationService';
import { translateText } from '../services/translationService';
import { addDocstringsToFile } from '../services/docstringService';
import { generateTestsForFile } from '../services/testGenerationService';
import { refactorCode } from '../services/codeRefactorService';
import { reviewCode } from '../services/codeReviewService';
import { generateReadme } from '../services/documentationService';
import { useEditor } from './useEditor';
import { useModals } from './useModals';

interface DiffData {
    path: string;
    original: string;
    modified: string;
}

interface UseAIActionsProps {
    appSettings: AppSettings;
    aiConfig: AIPromptConfig;
    editor: ReturnType<typeof useEditor>;
    modals: ReturnType<typeof useModals>;
}

export const useAIActions = ({ appSettings, aiConfig, editor, modals }: UseAIActionsProps) => {
    const {
        projectName,
        setProjectName,
        fullInputContent,
        parsedFiles,
        setParsedFiles,
        selectedFilePath,
        editorContent,
        setEditorContent,
        handleFileSelect,
        handleSaveFile,
    } = editor;

    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [diffData, setDiffData] = useState<DiffData | null>(null);
    const [translating, setTranslating] = useState<keyof AIPromptConfig | null>(null);
    const [promptToImprove, setPromptToImprove] = useState<EditablePrompt | null>(null);
    const [codeReviewContent, setCodeReviewContent] = useState('');
    const [fileForReviewPath, setFileForReviewPath] = useState<string | null>(null);

    const handleSuggestName = async () => {
        const newName = await suggestProjectName(appSettings, aiConfig.projectNameSuggester, fullInputContent);
        setProjectName(newName);
    };

    const handleFindFiles = async () => {
        const { files: additionalFiles } = await processAndParse(appSettings, fullInputContent, { ...aiConfig, docExtractor: { ...aiConfig.docExtractor, enabled: false }, fileFinder: { ...aiConfig.fileFinder, enabled: true } });
        const newSuggestions = additionalFiles
            .filter(file => !parsedFiles.some(pf => pf.path === file.path))
            .map((file, index) => ({ ...file, id: `${file.path}-${index}`, type: 'file', accepted: true } as AISuggestion));
        
        if (newSuggestions.length > 0) {
            setSuggestions(newSuggestions);
            modals.openSuggestion();
        } else {
            alert('No new files found.');
        }
    };

    const handleGenerateWiki = async () => {
        const wikiContent = await generateWiki(appSettings, aiConfig.wikiGenerator, projectName, fullInputContent);
        const newWikiFiles = parseWithRegex(wikiContent);
        const newSuggestions = newWikiFiles
            .filter(file => !parsedFiles.some(pf => pf.path === file.path))
            .map((file, index) => ({ ...file, id: `wiki-${file.path}-${index}`, type: 'file', accepted: true } as AISuggestion));
        
        if (newSuggestions.length > 0) {
            setSuggestions(newSuggestions);
            modals.openSuggestion();
        } else {
            alert('No new wiki files found.');
        }
    };

    const handleGenerateTests = async (filePath: string): Promise<ParsedFile | null> => {
        const sourceFile = parsedFiles.find(f => f.path === filePath);
        if (!sourceFile) return null;
        const testFile = await generateTestsForFile(appSettings, aiConfig.testGenerator, sourceFile);
        if (testFile) {
            setParsedFiles(prev => [...prev, testFile]);
            handleFileSelect(testFile.path);
        }
        return testFile;
    };

    const handleImproveReadme = async () => {
        const readmeFile = parsedFiles.find(f => f.path.toLowerCase() === 'readme.md');
        if (!readmeFile) {
            alert('No README.md found.');
            return;
        }
        const originalContent = readmeFile.content;
        const { documentationNotes } = await processAndParse(appSettings, fullInputContent, { ...aiConfig, readmeGenerator: { ...aiConfig.readmeGenerator, enabled: false } });
        const newContent = await generateReadme(appSettings, aiConfig.readmeGenerator, projectName, fullInputContent, documentationNotes);
        setDiffData({ path: readmeFile.path, original: originalContent, modified: newContent });

        if (selectedFilePath?.toLowerCase() !== 'readme.md') {
            handleFileSelect(readmeFile.path);
        }
    };
    
    const handleRefactorRequest = async () => {
        if (!selectedFilePath) return;
        const originalContent = editorContent;
        const newContent = await refactorCode(appSettings, aiConfig.codeRefactorer, originalContent);
        setDiffData({ path: selectedFilePath, original: originalContent, modified: newContent });
    };

    const handleAddDocstrings = async () => {
        if (!selectedFilePath) return;
        const originalContent = editorContent;
        const newContent = await addDocstringsToFile(appSettings, aiConfig.docstringGenerator, originalContent);
        setDiffData({ path: selectedFilePath, original: originalContent, modified: newContent });
    };

    const handleCodeReviewRequest = async () => {
        if (!selectedFilePath) return;
        const newContent = await reviewCode(appSettings, aiConfig.codeReviewer, editorContent);
        setCodeReviewContent(newContent);
        setFileForReviewPath(selectedFilePath);
        modals.openCodeReview();
    };
    
    const handleTranslate = async (promptType: keyof AIPromptConfig, targetLanguage: 'Italian' | 'English') => {
        setTranslating(promptType);
        try {
            const promptToTranslate = aiConfig[promptType].content;
            const translated = await translateText(appSettings, aiConfig.translator, promptToTranslate, targetLanguage);
            modals.handlePromptChange(promptType, translated);
        } catch (e) {
            alert('Translation failed.');
        } finally {
            setTranslating(null);
        }
    };
    
    const handleImprovePromptRequest = (promptId: keyof AIPromptConfig) => {
        setPromptToImprove(aiConfig[promptId]);
        modals.openPromptChat();
    };

    const handleSaveImprovedPrompt = (id: keyof AIPromptConfig, newContent: string) => {
        modals.handlePromptChange(id, newContent);
        modals.closePromptChat();
        setPromptToImprove(null);
    };

    const handleAcceptDiff = (path: string, content: string) => {
        handleSaveFile(path, content);
        if (selectedFilePath === path) {
            setEditorContent(content);
        }
        setDiffData(null);
    };
    
    const handleRejectDiff = () => setDiffData(null);

    return {
        suggestions,
        setSuggestions,
        diffData,
        translating,
        promptToImprove,
        codeReviewContent,
        fileForReviewPath,
        handleSuggestName,
        handleFindFiles,
        handleGenerateWiki,
        handleGenerateTests,
        handleImproveReadme,
        handleRefactorRequest,
        handleAddDocstrings,
        handleCodeReviewRequest,
        handleTranslate,
        handleImprovePromptRequest,
        handleSaveImprovedPrompt,
        handleAcceptDiff,
        handleRejectDiff,
    };
};