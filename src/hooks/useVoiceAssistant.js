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
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const hasDetectedSpeech = useRef(false);
  const restartTimeoutRef = useRef(null);
  const recognitionAttempts = useRef(0);

  onResultRef.current = onResult;

  useEffect(() => {
    const isSupported = !!SpeechRecognitionAPI;
    setSupported(isSupported);
    if (!isSupported) {
      console.warn('⚠️ Speech recognition not supported in this browser');
    } else {
      console.log('✅ Speech recognition is supported');
    }
  }, []);

  // Setup audio context for volume detection
  const setupAudioDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      console.log('✅ Audio detection setup complete');
      return true;
    } catch (err) {
      console.error('❌ Audio detection setup failed:', err);
      return false;
    }
  }, []);

  // Detect audio volume
  const detectAudio = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = (dataArray[i] - 128) / 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const volume = Math.min(rms * 2, 1);
    
    setVolumeLevel(volume);
    
    if (volume > 0.02 && isListening) {
      hasDetectedSpeech.current = true;
      console.log('🎤 Audio detected! Volume:', volume.toFixed(3));
    }
    
    animationFrameRef.current = requestAnimationFrame(detectAudio);
  }, [isListening]);

  const startListening = useCallback(async () => {
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
    hasDetectedSpeech.current = false;

    try {
      // Setup audio detection first
      const audioSetup = await setupAudioDetection();
      if (!audioSetup) {
        console.warn('⚠️ Could not setup audio detection, trying recognition anyway');
      } else {
        // Start volume detection
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        detectAudio();
      }

      // Start recognition
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      // Reset any previous state
      try { recognition.abort(); } catch (e) {}
      
      recognition.start();
      console.log('🎤 Started listening... Speak now!');
      setIsListening(true);
      
      // Auto-stop after 10 seconds if no speech detected
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      restartTimeoutRef.current = setTimeout(() => {
        if (isListening && !hasDetectedSpeech.current) {
          console.log('⏰ No speech detected for 10 seconds, stopping...');
          stopListening();
        }
      }, 10000);
      
    } catch (e) {
      console.error('Error starting recognition:', e);
      // Try to recover
      try {
        recognition.stop();
        setTimeout(() => {
          try {
            recognition.start();
            console.log('🔄 Restarted recognition');
          } catch (e2) {}
        }, 500);
      } catch (e2) {}
    }
  }, [lang, isListening, setupAudioDetection, detectAudio]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
    setVolumeLevel(0);
    hasDetectedSpeech.current = false;
    recognitionAttempts.current = 0;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    // Clean up audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return undefined;
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        
        if (result.isFinal && transcript.length > 0) {
          console.log('🎤 Final:', transcript);
          hasDetectedSpeech.current = true;
          onResultRef.current?.(transcript);
          // Stop listening after getting result
          setTimeout(() => {
            try { recognition.stop(); } catch (e) {}
            setIsListening(false);
          }, 100);
        } else if (transcript.length > 0) {
          console.log('🎤 Interim:', transcript);
          hasDetectedSpeech.current = true;
        }
      }
    };

    recognition.onstart = () => {
      console.log('🎤 Listening... Speak now!');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('🎤 Stopped listening');
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('🎤 Error:', event.error);
      
      if (event.error === 'no-speech') {
        // Only retry if we haven't detected any audio
        if (!hasDetectedSpeech.current) {
          recognitionAttempts.current += 1;
          console.log(`🔇 No speech detected (attempt ${recognitionAttempts.current})`);
          
          if (recognitionAttempts.current < 2) {
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
            console.log('❌ No speech detected after multiple attempts. Please click the mic again.');
            setIsListening(false);
            recognitionAttempts.current = 0;
          }
        } else {
          console.log('✅ Speech was detected but not recognized. Please speak clearly.');
        }
      } else if (event.error === 'not-allowed') {
        console.warn('⚠️ Microphone access denied');
        setIsListening(false);
      } else if (event.error === 'audio-capture') {
        console.warn('⚠️ No microphone found');
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.abort(); } catch (e) {}
    };
  }, [lang, isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
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
