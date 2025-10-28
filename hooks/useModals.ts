import { useState, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';

export const useModals = () => {
    const { handlePromptChange } = useAppContext();

    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [isPromptChatOpen, setIsPromptChatOpen] = useState(false);
    const [isProjectChatOpen, setIsProjectChatOpen] = useState(false);
    const [isCodeReviewModalOpen, setIsCodeReviewModalOpen] = useState(false);
    const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
    const [isGitHubExportModalOpen, setIsGitHubExportModalOpen] = useState(false);
    
    const openSuggestion = useCallback(() => setIsSuggestionModalOpen(true), []);
    const closeSuggestion = useCallback(() => setIsSuggestionModalOpen(false), []);

    const openPromptChat = useCallback(() => setIsPromptChatOpen(true), []);
    const closePromptChat = useCallback(() => setIsPromptChatOpen(false), []);

    const openProjectChat = useCallback(() => setIsProjectChatOpen(true), []);
    const closeProjectChat = useCallback(() => setIsProjectChatOpen(false), []);
    
    const openCodeReview = useCallback(() => setIsCodeReviewModalOpen(true), []);
    const closeCodeReview = useCallback(() => setIsCodeReviewModalOpen(false), []);

    const openUserGuide = useCallback(() => setIsUserGuideOpen(true), []);
    const closeUserGuide = useCallback(() => setIsUserGuideOpen(false), []);

    const openGitHubExport = useCallback(() => setIsGitHubExportModalOpen(true), []);
    const closeGitHubExport = useCallback(() => setIsGitHubExportModalOpen(false), []);

    return {
        isSuggestionModalOpen,
        setIsSuggestionModalOpen,
        openSuggestion,
        closeSuggestion,
        
        isPromptChatOpen,
        openPromptChat,
        closePromptChat,
        
        isProjectChatOpen,
        openProjectChat,
        closeProjectChat,
        
        isCodeReviewModalOpen,
        openCodeReview,
        closeCodeReview,
        
        isUserGuideOpen,
        openUserGuide,
        closeUserGuide,
        
        isGitHubExportModalOpen,
        openGitHubExport,
        closeGitHubExport,

        // Pass-through from context for convenience
        handlePromptChange,
    };
};