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
  const recognitionAttempts = useRef(0);
  onResultRef.current = onResult;

  useEffect(() => {
    const isSupported = !!SpeechRecognitionAPI;
    setSupported(isSupported);
    if (!isSupported) {
      console.warn('⚠️ Speech recognition not supported in this browser');
      console.warn('📌 Please use Chrome, Edge, or Safari');
    } else {
      console.log('✅ Speech recognition is supported');
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
      console.log('🎤 Result received:', event.results.length);
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        
        if (result.isFinal) {
          console.log('🎤 Final:', transcript);
          if (transcript.length > 0) {
            onResultRef.current?.(transcript);
          }
          // Stop listening after getting final result
          try {
            recognition.stop();
          } catch (e) {
            // Ignore
          }
          setIsListening(false);
          recognitionAttempts.current = 0;
        } else {
          console.log('🎤 Interim:', transcript);
        }
      }
    };

    recognition.onstart = () => {
      console.log('🎤 Listening... Speak now!');
      setIsListening(true);
      recognitionAttempts.current = 0;
    };

    recognition.onend = () => {
      console.log('🎤 Stopped listening');
      setIsListening(false);
      setVolumeLevel(0);
    };

    recognition.onsoundstart = () => {
      console.log('🎤 Sound detected!');
    };

    recognition.onsoundend = () => {
      console.log('🎤 Sound ended');
    };

    recognition.onspeechstart = () => {
      console.log('🎤 Speech started!');
    };

    recognition.onspeechend = () => {
      console.log('🎤 Speech ended');
    };

    recognition.onerror = (event) => {
      console.error('🎤 Error:', event.error);
      
      if (event.error === 'no-speech') {
        recognitionAttempts.current += 1;
        console.log(`🔇 No speech detected (attempt ${recognitionAttempts.current})`);
        
        if (recognitionAttempts.current < 3) {
          // Try restarting
          setTimeout(() => {
            if (isListening) {
              try {
                recognition.start();
                console.log('🔄 Restarted listening');
              } catch (e) {
                console.warn('Restart error:', e);
              }
            }
          }, 500);
        } else {
          console.log('❌ Too many no-speech attempts. Please click the mic again.');
          setIsListening(false);
          recognitionAttempts.current = 0;
        }
      } else if (event.error === 'not-allowed') {
        console.warn('⚠️ Microphone access denied. Please allow microphone access.');
        setIsListening(false);
      } else if (event.error === 'audio-capture') {
        console.warn('⚠️ No microphone found. Please connect a microphone.');
        setIsListening(false);
      } else if (event.error === 'network') {
        console.warn('⚠️ Network error. Please check your connection.');
        setIsListening(false);
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
      recognition.onsoundstart = null;
      recognition.onsoundend = null;
      recognition.onspeechstart = null;
      recognition.onspeechend = null;
      try { recognition.abort(); } catch (e) { /* noop */ }
    };
  }, [lang]);

  useEffect(() => {
    if (!isListening) {
      setVolumeLevel(0);
      return undefined;
    }
    const id = setInterval(() => setVolumeLevel(0.3 + Math.random() * 0.7), 100);
    return () => clearInterval(id);
  }, [isListening]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.warn('❌ Speech recognition not available');
      return;
    }
    
    if (isListening) {
      console.log('Already listening');
      return;
    }

    recognitionAttempts.current = 0;

    // Check microphone permission first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          // Stop the stream immediately, we just need permission
          stream.getTracks().forEach(track => track.stop());
          console.log('✅ Microphone access granted');
          
          // Start recognition
          try {
            recognition.lang = lang;
            recognition.start();
            console.log('🎤 Started listening... Speak now!');
          } catch (e) {
            console.error('Error starting recognition:', e);
            // If already started, try stopping and restarting
            try {
              recognition.stop();
              setTimeout(() => {
                recognition.start();
              }, 200);
            } catch (e2) {
              console.error('Could not start recognition:', e2);
            }
          }
        })
        .catch((err) => {
          console.error('❌ Microphone access denied:', err);
          alert('🎤 Microphone access is required for voice commands.\n\n' +
                'Please:\n' +
                '1. Click the camera/mic icon in your browser address bar\n' +
                '2. Select "Allow" for microphone access\n' +
                '3. Refresh the page and try again');
        });
    } else {
      // Try starting without permission check (some browsers handle it differently)
      try {
        recognition.start();
        console.log('🎤 Started listening...');
      } catch (e) {
        console.error('Error starting recognition:', e);
        alert('Please allow microphone access in your browser settings.');
      }
    }
  }, [lang, isListening]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.warn('Error stopping recognition:', e);
    }
    setIsListening(false);
    recognitionAttempts.current = 0;
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    
    window.speechSynthesis.cancel();
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.95;
    utter.pitch = 1;
    
    utter.onstart = () => {
      console.log('🔊 Speaking...');
      setIsSpeaking(true);
    };
    
    utter.onend = () => {
      console.log('🔊 Done speaking');
      setIsSpeaking(false);
    };
    
    utter.onerror = (e) => {
      console.error('Speech error:', e);
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
