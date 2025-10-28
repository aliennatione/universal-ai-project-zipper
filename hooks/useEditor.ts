import { useState, useCallback } from 'react';
import { ParsedFile } from '../types';
import { useAppContext } from '../contexts/AppContext';

export const useEditor = () => {
    const { t } = useAppContext();
    const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
    const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [isEditorDirty, setIsEditorDirty] = useState(false);
    const [projectName, setProjectName] = useState('UPZ-Project');
    const [fullInputContent, setFullInputContent] = useState<string>('');

    const handleSaveFile = useCallback((path: string, content: string) => {
        setParsedFiles(current => current.map(f => (f.path === path ? { ...f, content } : f)));
        setIsEditorDirty(false);
    }, []);

    const handleFileSelect = useCallback((path: string | null) => {
        if (isEditorDirty && selectedFilePath && selectedFilePath !== path) {
            if (confirm(t('unsavedChanges'))) {
                const fileToSave = parsedFiles.find(f => f.path === selectedFilePath);
                if (fileToSave) {
                    handleSaveFile(fileToSave.path, editorContent);
                }
            }
        }
        setSelectedFilePath(path);
        const newFile = parsedFiles.find(f => f.path === path);
        setEditorContent(newFile?.content || '');
        setIsEditorDirty(false);
    }, [isEditorDirty, selectedFilePath, parsedFiles, editorContent, t, handleSaveFile]);

    const clearEditorState = useCallback(() => {
        setParsedFiles([]);
        setSelectedFilePath(null);
        setEditorContent('');
        setIsEditorDirty(false);
        setProjectName('UPZ-Project');
        setFullInputContent('');
    }, []);

    return {
        parsedFiles,
        setParsedFiles,
        selectedFilePath,
        setSelectedFilePath,
        editorContent,
        setEditorContent,
        isEditorDirty,
        setIsEditorDirty,
        projectName,
        setProjectName,
        fullInputContent,
        setFullInputContent,
        handleFileSelect,
        handleSaveFile,
        clearEditorState,
    };
};