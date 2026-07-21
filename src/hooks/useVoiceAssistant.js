import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognitionAPI =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * Real browser-based voice assistant: speech-to-text via the Web Speech
 * Recognition API, and text-to-speech via SpeechSynthesis. No mocked timers.
 */
export function useVoiceAssistant({ lang = 'en-US', onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0); // 0-1, drives the reactive orb
  const [supported] = useState(!!SpeechRecognitionAPI);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // Set up recognition instance once; keep lang in sync via ref updates on start
  useEffect(() => {
    if (!SpeechRecognitionAPI) return undefined;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResultRef.current?.(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.abort(); } catch (e) { /* noop */ }
    };
  }, []);

  // Fake-but-lively volume meter while listening, purely visual (no raw mic
  // amplitude access without extra permissions/complexity)
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
    if (!recognition) return;
    try {
      recognition.lang = lang;
      recognition.start();
      setIsListening(true);
    } catch (e) {
      // start() throws if already started; ignore
    }
  }, [lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 1.02;
    utter.pitch = 1;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
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
