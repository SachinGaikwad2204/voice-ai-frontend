import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognitionAPI =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function useVoiceAssistant({ lang = 'en-US', onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    setSupported(!!SpeechRecognitionAPI);
    if (!SpeechRecognitionAPI) {
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return undefined;
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        console.log('🎤 Voice input:', transcript);
        onResultRef.current?.(transcript);
        setIsListening(false);
      }
    };

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      setIsListening(false);
      setVolumeLevel(0);
    };

    recognition.onerror = (event) => {
      console.error('🎤 Voice recognition error:', event.error);
      setIsListening(false);
      setVolumeLevel(0);
      
      if (event.error === 'not-allowed') {
        console.warn('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        console.warn('No speech detected. Please try again.');
      }
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.abort(); } catch (e) { /* noop */ }
    };
  }, [lang]);

  useEffect(() => {
    if (!isListening) {
      setVolumeLevel(0);
      return undefined;
    }
    const id = setInterval(() => setVolumeLevel(0.35 + Math.random() * 0.65), 120);
    return () => clearInterval(id);
  }, [isListening]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.warn('Speech recognition not available');
      return;
    }
    
    if (isListening) {
      console.log('Already listening');
      return;
    }

    try {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          recognition.lang = lang;
          recognition.start();
          console.log('🎤 Started listening...');
        })
        .catch((err) => {
          console.error('Microphone access denied:', err);
          alert('Please allow microphone access to use voice commands.');
        });
    } catch (e) {
      console.error('Error starting voice recognition:', e);
    }
  }, [lang, isListening]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.warn('Error stopping recognition:', e);
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    
    window.speechSynthesis.cancel();
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 1.0;
    utter.pitch = 1;
    
    utter.onstart = () => {
      console.log('🔊 Speaking:', text);
      setIsSpeaking(true);
    };
    
    utter.onend = () => {
      console.log('🔊 Speaking ended');
      setIsSpeaking(false);
    };
    
    utter.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utter);
  }, [lang]);

  const cancelSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    volumeLevel,
    supported,
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
  };
}
