import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

// Speech locales for different languages
export const SPEECH_LOCALES = {
  en: 'en-US',
  hi: 'hi-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ar: 'ar-SA',
  ru: 'ru-RU',
  pt: 'pt-BR',
  it: 'it-IT',
  ko: 'ko-KR'
};

const translations = {
  en: {
    appName: 'Voice AI',
    premium: 'Premium',
    newChat: 'New Chat',
    recentChats: 'Recent Chats',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    settings: 'Settings',
    signOut: 'Sign Out',
    ready: 'Ready',
    typeMessage: 'Type your message...',
    sayHello: 'Say Hello',
    tellJoke: 'Tell a Joke',
    whatTime: 'What time is it?',
    calculate: 'Calculate',
    search: 'Search',
    playMusic: 'Play Music',
    talkAndListen: 'Talk and Listen',
    description: 'Your AI voice assistant is ready to chat!',
    recognizedIntents: 'Recognized Intents',
    aiCore: 'AI Core',
    voiceReady: 'Voice Ready',
    activeUsers: 'Active Users',
    responseTime: 'Response Time',
    messages: 'Messages',
    tryThese: 'Try these',
    listening: 'Listening...',
    think: 'Think...',
    pressEnter: 'Press Enter',
    madeWithLove: 'Made with Love',
    settingsTitle: 'Settings',
    darkModeSetting: 'Dark Mode',
    voiceInput: 'Voice Input',
    autoSave: 'Auto Save',
    soundEffects: 'Sound Effects',
    language: 'Language',
    noChats: 'No chats yet',
    startChat: 'Start a new chat',
    newChatTitle: 'New Chat'
  },
  hi: {
    appName: 'वॉयस एआई',
    premium: 'प्रीमियम',
    newChat: 'नई चेट',
    recentChats: 'हाल की चेट',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    settings: 'सेटिंग्स',
    signOut: 'साइन आउट',
    ready: 'तैयार',
    typeMessage: 'अपना संदेश लिखें...',
    sayHello: 'नमस्ते कहें',
    tellJoke: 'मजाक सुनाएं',
    whatTime: 'क्या समय है?',
    calculate: 'गणना करें',
    search: 'खोजें',
    playMusic: 'संगीत बजाएं',
    talkAndListen: 'बात करें और सुनें',
    description: 'आपका AI वॉयस असिस्टेंट चैट करने के लिए तैयार है!',
    recognizedIntents: 'पहचाने गए इरादे',
    aiCore: 'AI कोर',
    voiceReady: 'वॉयस तैयार',
    activeUsers: 'सक्रिय उपयोगकर्ता',
    responseTime: 'प्रतिक्रिया समय',
    messages: 'संदेश',
    tryThese: 'इन्हें आज़माएं',
    listening: 'सुन रहा हूँ...',
    think: 'सोच रहा हूँ...',
    pressEnter: 'एंटर दबाएं',
    madeWithLove: 'प्यार से बनाया',
    settingsTitle: 'सेटिंग्स',
    darkModeSetting: 'डार्क मोड',
    voiceInput: 'वॉयस इनपुट',
    autoSave: 'ऑटो सेव',
    soundEffects: 'ध्वनि प्रभाव',
    language: 'भाषा',
    noChats: 'अभी कोई चैट नहीं',
    startChat: 'नई चैट शुरू करें',
    newChatTitle: 'नई चैट'
  },
  es: {
    appName: 'Voice AI',
    premium: 'Premium',
    newChat: 'Nuevo Chat',
    recentChats: 'Chats Recientes',
    lightMode: 'Modo Claro',
    darkMode: 'Modo Oscuro',
    settings: 'Configuración',
    signOut: 'Cerrar Sesión',
    ready: 'Listo',
    typeMessage: 'Escribe tu mensaje...',
    sayHello: 'Di Hola',
    tellJoke: 'Cuenta un Chiste',
    whatTime: '¿Qué hora es?',
    calculate: 'Calcular',
    search: 'Buscar',
    playMusic: 'Reproducir Música',
    talkAndListen: 'Habla y Escucha',
    description: '¡Tu asistente de voz AI está listo para chatear!',
    recognizedIntents: 'Intenciones Reconocidas',
    aiCore: 'Núcleo AI',
    voiceReady: 'Voz Lista',
    activeUsers: 'Usuarios Activos',
    responseTime: 'Tiempo de Respuesta',
    messages: 'Mensajes',
    tryThese: 'Prueba estos',
    listening: 'Escuchando...',
    think: 'Pensando...',
    pressEnter: 'Presiona Enter',
    madeWithLove: 'Hecho con Amor',
    settingsTitle: 'Configuración',
    darkModeSetting: 'Modo Oscuro',
    voiceInput: 'Entrada de Voz',
    autoSave: 'Guardado Automático',
    soundEffects: 'Efectos de Sonido',
    language: 'Idioma',
    noChats: 'Sin chats aún',
    startChat: 'Inicia un nuevo chat',
    newChatTitle: 'Nuevo Chat'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('data-language', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);