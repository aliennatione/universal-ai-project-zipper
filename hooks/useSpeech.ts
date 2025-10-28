import { useState, useRef, useCallback, useEffect } from 'react';

// Interfaccia per l'API di riconoscimento vocale del browser
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface UseSpeechOptions {
    onTranscript: (text: string) => void;
    onLiveChatCycleEnd?: () => void;
    lang?: string;
}

export const useSpeech = ({ onTranscript, onLiveChatCycleEnd, lang = 'it-IT' }: UseSpeechOptions) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLiveChatActive, setIsLiveChatActive] = useState(false);
    
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Funzione per avviare l'ascolto
    const startListening = useCallback(() => {
        if (!recognitionRef.current || isListening) return;
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            console.error("Errore nell'avvio del riconoscimento vocale:", e);
            setIsListening(false);
        }
    }, [isListening]);

    // Funzione per fermare l'ascolto
    const stopListening = useCallback(() => {
        if (!recognitionRef.current || !isListening) return;
        recognitionRef.current.stop();
        setIsListening(false);
    }, [isListening]);

    // Funzione per riprodurre vocalmente il testo
    const speak = useCallback((text: string) => {
        if (isSpeaking) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (isLiveChatActive) {
                onLiveChatCycleEnd?.();
            }
        };
        speechSynthesis.speak(utterance);
    }, [lang, isSpeaking, isLiveChatActive, onLiveChatCycleEnd]);

    // Gestione della modalità chat live
    const toggleLiveChat = useCallback(() => {
        if (isLiveChatActive) {
            setIsLiveChatActive(false);
            stopListening();
            speechSynthesis.cancel();
        } else {
            setIsLiveChatActive(true);
            startListening();
        }
    }, [isLiveChatActive, startListening, stopListening]);
    
    // Effetto per l'inizializzazione e la pulizia
    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            console.error("L'API di riconoscimento vocale non è supportata da questo browser.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false; // Restituisce un singolo risultato
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Errore di riconoscimento vocale:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognition) {
                recognition.stop();
            }
            speechSynthesis.cancel();
        };
    }, [lang, onTranscript, isLiveChatActive]);
    
    return {
        isListening,
        isSpeaking,
        isLiveChatActive,
        startListening,
        stopListening,
        speak,
        toggleLiveChat,
        isSupported: !!SpeechRecognitionAPI,
    };
};
