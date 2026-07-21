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
  const restartTimeoutRef = useRef(null);
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
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;
    recognition.timeout = 5000; // 5 seconds timeout

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let newFinalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (newFinalTranscript) {
        finalTranscript = newFinalTranscript;
        console.log('🎤 Voice input (final):', finalTranscript);
        onResultRef.current?.(finalTranscript);
        // Stop listening after getting final result
        recognition.stop();
        setIsListening(false);
        finalTranscript = '';
      } else if (interimTranscript) {
        console.log('🎤 Voice input (interim):', interimTranscript);
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
      
      if (event.error === 'no-speech') {
        console.log('🔇 No speech detected - please try again');
        // Restart listening after brief delay
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = setTimeout(() => {
          if (isListening) {
            try {
              recognition.stop();
              setTimeout(() => {
                if (isListening) {
                  recognition.start();
                  console.log('🔄 Restarted listening');
                }
              }, 300);
            } catch (e) {
              console.warn('Restart error:', e);
            }
          }
        }, 1000);
      } else if (event.error === 'not-allowed') {
        console.warn('⚠️ Microphone access denied');
      } else if (event.error === 'audio-capture') {
        console.warn('⚠️ No microphone found');
      }
    };

    recognitionRef.current = recognition;
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      recognition.onresult = null;
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.abort(); } catch (e) { /* noop */ }
    };
  }, [lang, isListening]);

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
      // Request microphone permission first
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          // Check if browser supports speech recognition
          if (!SpeechRecognitionAPI) {
            alert('Your browser does not support voice recognition. Please use Chrome or Edge.');
            return;
          }
          
          recognition.lang = lang;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.start();
          console.log('🎤 Started listening...');
        })
        .catch((err) => {
          console.error('Microphone access denied:', err);
          alert('Please allow microphone access to use voice commands.\n\n' +
                '1. Click the microphone icon in the address bar\n' +
                '2. Select "Allow"\n' +
                '3. Refresh the page and try again');
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
    utter.rate = 0.9;
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
