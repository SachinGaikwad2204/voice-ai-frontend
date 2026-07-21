import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

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
    appName: '???? ???',
    premium: '????????',
    newChat: '?? ???',
    recentChats: '??? ?? ???',
    lightMode: '???? ???',
    darkMode: '????? ???',
    settings: '????????',
    signOut: '???? ???',
    ready: '?????',
    typeMessage: '???? ????? ?????...',
    sayHello: '?????? ????',
    tellJoke: '???? ??????',
    whatTime: '???? ??? ???',
    calculate: '???? ????',
    search: '?????',
    playMusic: '????? ?????',
    talkAndListen: '??? ???? ?? ?????',
    description: '???? AI ???? ????????? ??? ???? ?? ??? ????? ??!',
    recognizedIntents: '?????? ?? ?????',
    aiCore: 'AI ???',
    voiceReady: '???? ?????',
    activeUsers: '?????? ??????????',
    responseTime: '??????????? ???',
    messages: '?????',
    tryThese: '?????? ???????',
    listening: '??? ??? ???...',
    think: '??? ??? ???...',
    pressEnter: '???? ?????',
    madeWithLove: '????? ?? ?????',
    settingsTitle: '????????',
    darkModeSetting: '????? ???',
    voiceInput: '???? ?????',
    autoSave: '??? ???',
    soundEffects: '????? ??????',
    language: '????',
    noChats: '??? ??? ??? ????',
    startChat: '?? ??? ???? ????',
    newChatTitle: '?? ???'
  },
  es: {
    appName: 'Voice AI',
    premium: 'Premium',
    newChat: 'Nuevo Chat',
    recentChats: 'Chats Recientes',
    lightMode: 'Modo Claro',
    darkMode: 'Modo Oscuro',
    settings: 'Configuraci?n',
    signOut: 'Cerrar Sesi?n',
    ready: 'Listo',
    typeMessage: 'Escribe tu mensaje...',
    sayHello: 'Di Hola',
    tellJoke: 'Cuenta un Chiste',
    whatTime: '?Qu? hora es?',
    calculate: 'Calcular',
    search: 'Buscar',
    playMusic: 'Reproducir M?sica',
    talkAndListen: 'Habla y Escucha',
    description: '?Tu asistente de voz AI est? listo para chatear!',
    recognizedIntents: 'Intenciones Reconocidas',
    aiCore: 'N?cleo AI',
    voiceReady: 'Voz Lista',
    activeUsers: 'Usuarios Activos',
    responseTime: 'Tiempo de Respuesta',
    messages: 'Mensajes',
    tryThese: 'Prueba estos',
    listening: 'Escuchando...',
    think: 'Pensando...',
    pressEnter: 'Presiona Enter',
    madeWithLove: 'Hecho con Amor',
    settingsTitle: 'Configuraci?n',
    darkModeSetting: 'Modo Oscuro',
    voiceInput: 'Entrada de Voz',
    autoSave: 'Guardado Autom?tico',
    soundEffects: 'Efectos de Sonido',
    language: 'Idioma',
    noChats: 'Sin chats a?n',
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
