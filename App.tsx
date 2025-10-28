import React, { useState, useCallback, useEffect } from 'react';
import { ParsedFile, AIPromptConfig, FileUploadRequest, InputMode, ChatMessage } from './types';
import { processInputFiles, expandProjectIdea, processAndParse } from './services/projectParser';
import { generateReadme } from './services/documentationService';
import { useAppContext } from './contexts/AppContext';

import { useEditor } from './hooks/useEditor';
import { useAIActions } from './hooks/useAIActions';
import { useModals } from './hooks/useModals';

import { InputView } from './components/InputView';
import { EditorView } from './components/EditorView';
import { SettingsView } from './components/SettingsView';
import { SunIcon, MoonIcon, LogoIcon, SettingsIcon, QuestionMarkIcon } from './components/icons';
import { PromptChatModal } from './components/PromptChatModal';
import { ProjectChatModal } from './components/ProjectChatModal';
import { CodeReviewModal } from './components/CodeReviewModal';
import { UserGuideModal } from './components/UserGuideModal';
import { GitHubExportModal } from './components/GitHubExportModal';

/**
 * @file Il componente radice dell'applicazione che gestisce lo stato principale e la logica di navigazione.
 * @module App
 */

type Theme = 'light' | 'dark';
type AppStep = 'input' | 'processing' | 'editor' | 'settings';
export type SettingsTab = 'general' | 'ai';


/**
 * Il componente principale e punto di ingresso dell'applicazione.
 *
 * @returns {JSX.Element} Il componente App renderizzato.
 */
const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [appStep, setAppStep] = useState<AppStep>('input');
  
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialSettingsTab, setInitialSettingsTab] = useState<SettingsTab>('general');
  
  const [pastedText, setPastedText] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [projectChatMessages, setProjectChatMessages] = useState<ChatMessage[]>([]);
  
  const {
      appSettings,
      aiConfig,
      isLoadingSettings,
      t,
  } = useAppContext();

  const modals = useModals();
  const editor = useEditor();
  const aiActions = useAIActions({ appSettings, aiConfig, editor, modals });

  // --- GESTIONE TEMA E IMPOSTAZIONI ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (userPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const handleOpenSettings = (tab: SettingsTab = 'general') => {
      setInitialSettingsTab(tab);
      setAppStep('settings');
  };

  // --- GESTIONE DELLO STATO E NAVIGAZIONE ---
  const isProcessing = appStep === 'processing';

  const clearState = useCallback(() => {
    setError(null);
    editor.clearEditorState();
    setAppStep('input');
    setProjectChatMessages([]);
    setPastedText('');
  }, [editor]);


  // --- ELABORAZIONE PRINCIPALE ---
  const runProjectGeneration = useCallback(async (content: string, isExpanded: boolean) => {
    editor.setFullInputContent(content);

    const parseMessage = isExpanded ? t('processingMessageParse', 2, 2) : t('processingMessageParse', 2, 2);
    setProcessingMessage(parseMessage);
    const { files: parsed, documentationNotes } = await processAndParse(appSettings, content, aiConfig);
    if (parsed.length === 0) throw new Error("Could not parse any files. Check input format or AI expansion result.");
    
    let finalFiles = [...parsed];
    if (aiConfig.readmeGenerator.enabled) {
        const readmeContent = await generateReadme(appSettings, aiConfig.readmeGenerator, editor.projectName, content, documentationNotes);
        const readmeIndex = finalFiles.findIndex(f => f.path.toLowerCase() === 'readme.md');
        if (readmeIndex > -1) {
            finalFiles[readmeIndex].content = readmeContent;
        } else {
            finalFiles.unshift({ path: 'README.md', content: readmeContent });
        }
    }

    editor.setParsedFiles(finalFiles);
    editor.handleFileSelect(finalFiles[0]?.path || null);
    setAppStep('editor');
  }, [aiConfig, appSettings, editor, t]);

  const handleProcessInput = useCallback(async (input: string | FileUploadRequest[]) => {
    setError(null);
    setAppStep('processing');
    let content = '';
    const useProjectOverview = typeof input === 'string' && aiConfig.projectOverview.enabled;

    try {
        if (typeof input === 'string') {
            content = input;
            if (useProjectOverview) {
                setProcessingMessage(t('processingMessageExpand', 1, 2));
                content = await expandProjectIdea(appSettings, aiConfig.projectOverview, content);
            } else {
                setProcessingMessage(t('processingMessage1', 1, 2));
            }
        } else {
            setProcessingMessage(t('processingMessage1', 1, 2));
            content = await processInputFiles(input);
        }
        await runProjectGeneration(content, useProjectOverview);
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        setAppStep('input');
    } finally {
        setProcessingMessage(null);
    }
  }, [aiConfig.projectOverview, appSettings, runProjectGeneration, t]);
  
  const handleConversationComplete = (generatedText: string) => {
      modals.closeProjectChat();
      setPastedText(generatedText);
      setInputMode('text');
  };

  const renderContent = () => {
    if (isLoadingSettings) {
       return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent dark:border-dark-accent"></div>
        </div>
      );
    }
    if (isProcessing) {
      return (
        <div className="flex items-center justify-center flex-col text-center p-8 h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent dark:border-dark-accent"></div>
          <div role="status" aria-live="polite">
            <p className="mt-4 text-lg font-semibold">{processingMessage}</p>
          </div>
        </div>
      );
    }
    if (appStep === 'editor') {
      // FIX: Pass all required props to EditorView explicitly to fix missing properties error.
      return (
        <EditorView
          projectName={editor.projectName}
          setProjectName={editor.setProjectName}
          parsedFiles={editor.parsedFiles}
          setParsedFiles={editor.setParsedFiles}
          selectedFilePath={editor.selectedFilePath}
          onFileSelect={editor.handleFileSelect}
          editorContent={editor.editorContent}
          setEditorContent={editor.setEditorContent}
          isEditorDirty={editor.isEditorDirty}
          setIsEditorDirty={editor.setIsEditorDirty}
          onStartOver={clearState}
          onRefactorRequest={aiActions.handleRefactorRequest}
          onSuggestName={aiActions.handleSuggestName}
          onFindFiles={aiActions.handleFindFiles}
          onGenerateTests={aiActions.handleGenerateTests}
          onImproveReadme={aiActions.handleImproveReadme}
          onAddDocstrings={aiActions.handleAddDocstrings}
          onGenerateWiki={aiActions.handleGenerateWiki}
          onCodeReviewRequest={aiActions.handleCodeReviewRequest}
          onGitHubExportRequest={modals.openGitHubExport}
          suggestions={aiActions.suggestions}
          setSuggestions={aiActions.setSuggestions}
          isSuggestionModalOpen={modals.isSuggestionModalOpen}
          setIsSuggestionModalOpen={modals.setIsSuggestionModalOpen}
          diffData={aiActions.diffData}
          onAcceptDiff={aiActions.handleAcceptDiff}
          onRejectDiff={aiActions.handleRejectDiff}
        />
      );
    }
    return (
      <div className="w-full flex flex-col items-center space-y-8">
        <InputView
          onProcessInput={handleProcessInput}
          onStartScaffoldingChat={modals.openProjectChat}
          onGoToAISettings={() => handleOpenSettings('ai')}
          pastedText={pastedText}
          setPastedText={setPastedText}
          inputMode={inputMode}
          setInputMode={setInputMode}
        />
        {error && (
          <div className="w-full mt-6 p-4 bg-danger-bg border border-danger rounded-lg text-danger-text dark:bg-dark-danger-bg dark:border-dark-danger dark:text-dark-primary-text text-center">
            <p className="font-bold">{t('errorOccurred')}</p>
            <p>{error}</p>
            <button onClick={() => { setError(null); if (appStep !== 'input') clearState(); }} className="mt-4 px-4 py-2 bg-danger hover:opacity-80 text-white rounded-lg transition-opacity">
              {t('tryAgain')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      <SettingsView 
        isOpen={appStep === 'settings'} 
        onClose={() => { setAppStep('input'); setInitialSettingsTab('general'); }}
        initialTab={initialSettingsTab}
        translating={aiActions.translating}
        onTranslate={aiActions.handleTranslate}
        onImprovePromptRequest={aiActions.handleImprovePromptRequest}
      />
      
      <PromptChatModal
        isOpen={modals.isPromptChatOpen}
        onClose={modals.closePromptChat}
        promptToImprove={aiActions.promptToImprove}
        onSavePrompt={aiActions.handleSaveImprovedPrompt}
      />
      
      <ProjectChatModal
          isOpen={modals.isProjectChatOpen}
          onClose={modals.closeProjectChat}
          onComplete={handleConversationComplete}
          messages={projectChatMessages}
          setMessages={setProjectChatMessages}
      />

      <CodeReviewModal
          isOpen={modals.isCodeReviewModalOpen}
          onClose={modals.closeCodeReview}
          filePath={aiActions.fileForReviewPath}
          reviewContent={aiActions.codeReviewContent}
      />

      <UserGuideModal
        isOpen={modals.isUserGuideOpen}
        onClose={modals.closeUserGuide}
      />

      <GitHubExportModal
        isOpen={modals.isGitHubExportModalOpen}
        onClose={modals.closeGitHubExport}
        projectName={editor.projectName}
        parsedFiles={editor.parsedFiles}
      />

      <header className="w-full max-w-7xl flex justify-between items-center mb-8 flex-shrink-0">
          <div className="flex items-center gap-4">
              <LogoIcon className="h-16 w-16 sm:h-20 sm:w-20" />
              <div className="text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-text dark:text-dark-primary-text">UPZ<span className="text-accent dark:text-dark-accent">AI</span><sup className="font-light text-lg sm:text-xl -top-2">0.3</sup></h1>
                  <p className="mt-1 text-md text-secondary-text dark:text-dark-secondary-text">{t('headerSubtitle')}</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={modals.openUserGuide} className="p-2 rounded-full bg-secondary dark:bg-dark-secondary text-secondary-text dark:text-dark-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary transition-colors" aria-label={t('openUserGuide')}>
                  <QuestionMarkIcon />
              </button>
              {appStep !== 'processing' && appStep !== 'editor' && (
                  <button onClick={() => handleOpenSettings('general')} className="p-2 rounded-full bg-secondary dark:bg-dark-secondary text-secondary-text dark:text-dark-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary transition-colors" aria-label={t('openSettings')}>
                      <SettingsIcon />
                  </button>
              )}
              <button onClick={toggleTheme} className="p-2 rounded-full bg-secondary dark:bg-dark-secondary text-secondary-text dark:text-dark-secondary-text hover:bg-tertiary dark:hover:bg-dark-tertiary transition-colors" aria-label={t('toggleTheme')}>
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
          </div>
      </header>

      <main className="w-full max-w-7xl flex flex-col items-center flex-grow">
        {renderContent()}
      </main>
      
      <footer className="mt-12 text-center text-secondary-text dark:text-dark-secondary-text text-sm flex-shrink-0">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
};

export default App;
