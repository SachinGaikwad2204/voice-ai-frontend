import { useState, useRef, useCallback, useEffect } from 'react';

export function useVoiceAssistant({ lang = 'en-US', onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [supported, setSupported] = useState(true);
  const onResultRef = useRef(onResult);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const isListeningRef = useRef(false);
  
  onResultRef.current = onResult;

  // Check if speech recognition is supported
  useEffect(() => {
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setSupported(hasSpeechRecognition);
    
    if (!hasSpeechRecognition) {
      console.warn('⚠️ Speech recognition not supported in this browser');
      console.log('💡 Use Chrome, Edge, or Safari for voice input');
    } else {
      console.log('✅ Speech recognition available');
    }
  }, []);

  // Initialize recognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;       // Updated to true to prevent abrupt closing on short pauses
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('🎤 Recognition started');
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognition.onend = () => {
      console.log('🎤 Recognition ended');
      
      // Clean up stream if manually stopped
      if (!isListeningRef.current) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setVolumeLevel(0);
      }
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        
        if (result.isFinal && transcript.length > 0) {
          console.log('🎤 Final:', transcript);
          onResultRef.current?.(transcript);
          // Stop after getting final result
          try { recognition.stop(); } catch (e) {}
          setIsListening(false);
          isListeningRef.current = false;
        } else if (transcript.length > 0) {
          console.log('🎤 Interim:', transcript);
          // Update volume for visual feedback
          setVolumeLevel(0.5 + Math.random() * 0.5);
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn('⚠️ Recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        console.log('🔇 No speech detected - auto-restarting recognition listener...');
        // Automatically attempt a soft restart instead of killing the listener state completely
        try {
          recognition.stop();
          setTimeout(() => {
            if (isListeningRef.current) {
              try { recognition.start(); } catch (e) {}
            }
          }, 200);
        } catch (e) {}
      } else if (event.error === 'not-allowed') {
        console.log('❌ Microphone access denied - please allow microphone access');
        setIsListening(false);
        isListeningRef.current = false;
        setVolumeLevel(0);
        alert('Please allow microphone access to use voice commands.\n\n' +
              'Click the camera/mic icon in your browser address bar and select "Allow".');
      } else if (event.error === 'audio-capture') {
        console.log('❌ No microphone found - please connect a microphone');
        setIsListening(false);
        isListeningRef.current = false;
        setVolumeLevel(0);
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        setIsListening(false);
        isListeningRef.current = false;
        setVolumeLevel(0);
      }
    };

    return () => {
      try { recognition.abort(); } catch (e) {}
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
    };
  }, [lang]);

  const startListening = useCallback(async () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.warn('❌ Speech recognition not available');
      alert('Voice recognition is not supported in this browser.\n\nPlease use Chrome, Edge, or Safari.');
      return;
    }

    if (isListeningRef.current) {
      console.log('Already listening');
      return;
    }

    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      isListeningRef.current = true;
      setIsListening(true);
      
      // Start recognition
      try {
        recognition.start();
        console.log('🎤 Listening... Speak clearly!');
      } catch (e) {
        // If already started, stop and restart
        try { recognition.stop(); } catch (e2) {}
        setTimeout(() => {
          try {
            recognition.start();
            console.log('🎤 Restarted listening...');
          } catch (e3) {
            console.error('Failed to start recognition:', e3);
            setIsListening(false);
            isListeningRef.current = false;
          }
        }, 500);
      }
      
    } catch (err) {
      console.error('❌ Microphone error:', err);
      setIsListening(false);
      isListeningRef.current = false;
      alert('Please allow microphone access to use voice commands.\n\n' +
            '1. Click the camera/mic icon in the address bar\n' +
            '2. Select "Allow" for microphone access\n' +
            '3. Refresh the page and try again');
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {}
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsListening(false);
    setVolumeLevel(0);
    console.log('🎤 Stopped listening');
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