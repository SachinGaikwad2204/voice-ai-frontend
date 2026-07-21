import { useState, useRef, useCallback, useEffect } from 'react';

export function useVoiceAssistant({ lang = 'en-US', onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [supported, setSupported] = useState(true);
  const onResultRef = useRef(onResult);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionAttempts = useRef(0);
  const isRecordingRef = useRef(false);

  onResultRef.current = onResult;

  // Start listening using Web Audio API
  const startListening = useCallback(async () => {
    if (isListening) {
      console.log('Already listening');
      return;
    }

    try {
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
      
      // Setup audio context for volume detection
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Start volume detection
      detectVolume();
      
      // Setup MediaRecorder for recording
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('🎤 Recording stopped, processing audio...');
        await processAudio();
      };
      
      // Start recording
      mediaRecorder.start(1000); // Record in 1-second chunks
      isRecordingRef.current = true;
      
      // Auto-stop after 5 seconds of silence
      let silentCount = 0;
      const checkSilence = setInterval(() => {
        if (!isRecordingRef.current) {
          clearInterval(checkSilence);
          return;
        }
        // If volume is low for 3 consecutive checks
        if (volumeLevel < 0.02) {
          silentCount++;
          if (silentCount >= 5) {
            console.log('⏰ Silence detected, stopping...');
            stopListening();
            clearInterval(checkSilence);
          }
        } else {
          silentCount = 0;
        }
      }, 1000);
      
      setIsListening(true);
      console.log('🎤 Listening... Speak now!');
      
    } catch (err) {
      console.error('❌ Microphone error:', err);
      alert('Please allow microphone access to use voice commands.');
    }
  }, [isListening, volumeLevel]);

  // Detect audio volume
  const detectVolume = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = (dataArray[i] - 128) / 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    setVolumeLevel(rms);
    
    animationFrameRef.current = requestAnimationFrame(detectVolume);
  }, []);

  // Process recorded audio
  const processAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      console.log('No audio recorded');
      return;
    }
    
    // Create audio blob
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    
    // Convert to base64 for sending
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Audio = event.target.result.split(',')[1];
      
      // Use a free speech-to-text service (Web Speech API as fallback)
      try {
        // Try using the Web Speech API with a different approach
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // Play the audio through the recognition API
        // This is a workaround - it may work in some browsers
        const audio = new Audio();
        audio.src = URL.createObjectURL(audioBlob);
        await audio.play();
        
        // This is a hack - but it might trigger the recognition
        setTimeout(() => {
          recognition.start();
          console.log('🔄 Trying speech recognition on played audio...');
        }, 500);
        
        recognition.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          console.log('🎤 Recognized:', transcript);
          if (transcript && transcript.length > 0) {
            onResultRef.current?.(transcript);
          }
        };
        
        recognition.onerror = (e) => {
          console.warn('Recognition fallback error:', e.error);
        };
        
      } catch (e) {
        console.warn('Audio processing error:', e);
      }
    };
    reader.readAsDataURL(audioBlob);
  }, []);

  const stopListening = useCallback(() => {
    isRecordingRef.current = false;
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
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
